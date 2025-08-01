const express = require("express");
const router = express.Router();
const db = require("../config/firestore")

async function isAdmin(req, res, next) {
  if (!req.session.userId) return res.status(403).send('Yetkisiz');

  const userDoc = await db.collection('users').doc(req.session.userId).get();
  if (!userDoc.exists) return res.status(403).send('Yetkisiz');

  const userData = userDoc.data();

  if (userData.isAdmin === true) {
    return next();
  } else {
    return res.status(403).send('Yetkisiz');
  }
}


router.get('/anketler', isAdmin, async (req, res) => {
  const snapshot = await db.collection("anketler").orderBy('createdAt', 'desc').get();

  let anketler = [];
  snapshot.forEach(doc => {
    anketler.push({ id: doc.id, ...doc.data() });
  });

  res.render('adminAnketler', { anketler });
});

router.post('/anketler/delete/:id', isAdmin, async (req, res) => {
  const anketid = req.params.id;

  await db.collection("anketler").doc(anketid).delete();

  const votesSnapshot = await db.collection('votes').where('anketid', '==', anketid).get();
  const batch = db.batch();
  votesSnapshot.forEach(doc => batch.delete(doc.ref));
  await batch.commit();

  res.redirect('/admin/anketler');
});

module.exports = router;

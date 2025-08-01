const express = require('express');
const router = express.Router();
const db = require('../config/firestore');


router.get('/votes', async (req, res) => {
  if (!req.session.userId) return res.redirect('/auth/login');

  const userId = req.session.userId;

  const votesSnapshot = await db.collection("votes")
    .where('userId', '==', userId)
    .get();

  let votes = [];

  for (const doc of votesSnapshot.docs) {
    const voteData = doc.data();
    const anketdoc = await db.collection("anketler").doc(voteData.anketid).get();

    if (anketdoc.exists) {
      votes.push({
        voteId: doc.id,
        anketid: voteData.anketid,
        optionIndex: voteData.optionIndex,
        anket_title: anketdoc.data().title,
        anket_options: anketdoc.data().options
      });
    }
  }

  res.render('userVotes', { votes });
});

router.post('/votes/remove/:voteId', async (req, res) => {
  if (!req.session.userId) return res.redirect('/auth/login');

  const voteId = req.params.voteId;
  const userId = req.session.userId;

  const voteRef = db.collection("votes").doc(voteId);
  const voteDoc = await voteRef.get();

  if (!voteDoc.exists) return res.status(404).send('Oy bulunamadı.');

  if (voteDoc.data().userId !== userId) return res.status(403).send('Yetkisiz işlem.');

  const anketid = voteDoc.data().anketid;
  const optionIndex = voteDoc.data().optionIndex;

  const anketRef = db.collection("anketler").doc(anketid);
  const anketdoc = await anketRef.get();

  if (!anketdoc.exists) return res.status(404).send('Anket bulunamadı.');

  let anketdata = anketdoc.data();
  let votes = anketdata.votes;

  if (optionIndex < 0 || optionIndex >= votes.length) {
    return res.status(400).send('Geçersiz seçenek.');
  }

  // Oy sayısını azalt
  votes[optionIndex] = Math.max(0, votes[optionIndex] - 1);

  await anketRef.update({ votes });

  await voteRef.delete();

  res.redirect('/user/votes');
});

module.exports = router;

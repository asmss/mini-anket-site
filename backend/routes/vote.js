const express = require("express")
const router = express.Router()
const db = require("../config/firestore")
const { parse } = require("dotenv")

router.post("/:anketid",async(req,res)=>{
      if(!req.session.userId) return res.redirect("/auth/login")
    const userId = req.session.userId
    const anketid = req.params.anketid
    const optionIndex = parseInt(req.body.optionIndex)

    if (isNaN(optionIndex)) return res.status(400).send('Geçersiz seçenek.');

    const voteSnapshot = await db.collection("votes")
    .where("anketid","==",anketid)
    .where("userId","==",userId)
    .get()
    
   if(!voteSnapshot.empty){
    return res.send("bu anket için oy verdin zaten")
   }
     
    const anketler = await db.collection("anketler").doc(anketid)
    const anketdoc = await anketler.get();
  if (!anketdoc.exists) return res.status(404).send('Anket bulunamadı.');
 
   var anketdata = anketdoc.data()
   var votes = anketdata.votes

  if (optionIndex < 0 || optionIndex >= votes.length) {
    return res.status(400).send('Seçenek hatalı.');
  }   

 votes[optionIndex] = votes[optionIndex] + 1;

 await anketler.update({votes})

 await db.collection("votes")
 .add({
   anketid,
   userId,
   optionIndex,
   votedAt: new Date()
 });
 res.redirect("/anket/" + anketid)
})

module.exports = router




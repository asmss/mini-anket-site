const express = require("express")
const router = express.Router()
const db = require("../config/firestore")

router.get("/create",async(req,res)=>{
     if(!req.session.userId) return res.redirect("/auth/login")
       
        res.render("createAnket",{error:null})
})

router.post("/create",async(req,res)=>{
  if (!req.session.userId) return res.redirect('/auth/login');
  
   const {title,creator,description,options,category} = req.body
   if(!title || !options ||!creator ||!description || !category) return res.render("createAnket",{error:"lütfen tüm alanları doldurun"})
   
    let satır =options.split("\n").map(a =>a.trim()).filter(a=>a.length > 0);
  
    if(satır.length < 2 || satır.length > 15) return res.render("createAnket",{error:"2 ile 15 seçenek arasında girin"})
      
        let createdAt = new Date().toLocaleString()
        
      let votes = new Array(satır.length).fill(0)
    await db.collection("anketler").add({
     title,
     creator,
     description,
     category,
     options: satır,
     votes,
     createdBy: req.session.userId,
     createdAt: createdAt

    });
     res.redirect("/")
    });

router.get('/:id', async (req, res) => {
  const anketdoc = await db.collection('anketler').doc(req.params.id).get();
  if (!anketdoc.exists) return res.status(404).send('Anket bulunamadı.');

  const anket = { id: anketdoc.id, ...anketdoc.data() };

  res.render('anketdetay', { anket, userId: req.session.userId });
});

module.exports = router;

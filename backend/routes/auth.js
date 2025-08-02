const express = require("express")
const router = express.Router()
const bcrypt = require("bcrypt");
const db = require("../config/firestore")

const user_collection = "users";

//burda kayıt sayfasını get isteği atarak render ediyom vesselam
router.get("/register",async(req,res)=>{
   res.render("register",{error:null})
})

router.post("/register",async(req,res)=>{
     const {name,password} =req.body
    
     //eğerki ikisinden biri yoksa tekrar registeri render ediyor
     if(!name || !password){
        return res.render("register",{error:"lütfen tüm alanları doldurun"})
     }
    
     const users= db.collection(user_collection)
     const snapshot = await users.where("name","==",name).get();
     
     //üstte kullanıcı verisini alıp altta kontrol ediyorum ve error mesajını response dönüyorum
     if(!snapshot.empty){
        return res.render("register",{error:"bu isimle bir kullanıcı var !!"})
     }
   //şifreyi hashliyorum ve kaydedilmeye hazır hale getiriyorum
   const hashedPassword = await bcrypt.hash(password, 10);

   await users.add({
    name,
    password:hashedPassword
   })
  res.redirect("/auth/login")
})

router.get("/login",async(req,res)=>{ 
  res.render("login",{error:null})
})

router.post("/login",async(req,res)=>{
 const {name,password} = req.body;

 if(!name || !password)
 {
    return res.render("login",{error:"lütfen tüm alanları doldurun"})
 }

 const users = db.collection(user_collection)
 const snapshot = await users.where("name","==",name).get();
 if(snapshot.empty)
 {
   return res.render("login",{error:"kullanici bulunamadı"})
 }

  let user_bilgisi;
  snapshot.forEach(element => user_bilgisi = element)
   
   const  şifre_kontrol = await bcrypt.compare(password,user_bilgisi.data().password)
  
   if(!şifre_kontrol){
    return res.render("login",{error:"şifren yanlış"})
   }

   //oturumu başlattım burda
   req.session.userId = user_bilgisi.id
   req.session.userName = name
   res.redirect("/")
})

router.get("/logout",(req,res)=>{
 
    req.session.destroy(()=>{
      res.redirect("/")
    }) 
})

module.exports = router

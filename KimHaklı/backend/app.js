const express = require("express")
const path = require("path")
const session = require("express-session")
const db = require("./config/firestore")
require("dotenv").config();
const app =  express()
const authRouter = require("./routes/auth")
const anketRouter = require("./routes/anket")
const votesRouter = require("./routes/vote")
const adminRouter = require("./routes/admin")
const usesRouter = require("./routes/user")
app.set("view engine","ejs")
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')))

app.use(express.urlencoded({extended: false}))

app.use(session({
  secret:"asmikkrblt000770",
  resave:false,
  saveUninitialized:true
}))

app.use("/auth",authRouter)
app.use("/anket",anketRouter)
app.use("/vote",votesRouter)
app.use("/admin",adminRouter)
app.use("/user",usesRouter)

app.get('/search', async (req, res) => {
    const categoryQuery = req.query.category?.toLowerCase();
    if (!categoryQuery) {
        return res.redirect('/');
    }

    const anketler = await db.collection('anketler')
        .where('category', '==', categoryQuery)
        .get();

    const results = anketler.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    res.render('index', {
        userName: req.session.userName,
        anketler: results
    });
});

app.get("/api/search", async (req, res) => {
    const { category } = req.query;

    try {
        let query;
        if (!category) {
            query = db.collection("anketler").orderBy("createdAt","desc")

        } else {
            query = db.collection("anketler").where("category", "==", category.toLowerCase());
        }

        const snapshot = await query.get();
        const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        res.json(results);
    } catch (err) {
        console.error("Arama hatası:", err);
        res.status(500).json({ error: "Bir hata oluştu" });
    }
});
//anasayfam
app.get("/",async(req,res)=>{
  const anketRef = db.collection("anketler")
  const snapshot=await anketRef.orderBy("createdAt","desc").get();

  let anketler =[]
  snapshot.forEach(element => {
    anketler.push({id:element.id, ...element.data()});
  });
res.render("index",{
    anketler,
    userName:req.session.userName || null
});
});

const port=process.env.PORT
app.listen(port,(err)=>{
    if(err)console.log(err)
        console.log("server başarıyla aktif hale geldi port:",port)
})

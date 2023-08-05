const mongoose =require("mongoose")
mongoose.connect("mongodb://127.0.0.1:27017/shoesplanet")

const express=require("express")
const app= express()
const flash = require("connect-flash")
const path=require("path") 


app.use(flash())
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(express.static(path.join(__dirname,"public")))
app.set("view engine", "ejs")
app.set("views", "views")

const session=require("express-session")
app.use(session({
      secret: 'aaaa',
      resave: false,
      saveUninitialized: false
      
    })
  );

  const nocache=require("nocache")
  app.use(nocache())

const router=require("./routers/router")
app.use("/",router)

const adminRoute=require("./routers/adminRoute")
app.use("/admin",adminRoute)

app.listen(3333,()=>{
    console.log("server is running on , http://localhost:3333/");
})
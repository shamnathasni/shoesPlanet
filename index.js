const dotenv = require("dotenv");
dotenv.config();

const mongoose =require("mongoose")
const databaseUrl = process.env.DATABASE_URL
mongoose.connect(databaseUrl)

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

const errorController = require("./controller/errorController")
app.use("/500",errorController.get500)
app.use(errorController.get404)

app.listen(3333,()=>{
    console.log("server is running on , http://localhost:3333/");
})
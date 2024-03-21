const dotenv = require("dotenv");
dotenv.config();

const mongoose =require("mongoose")
const databaseUrl = process.env.DATABASE_URL
mongoose.connect(databaseUrl)

const moment = require( 'moment' )
const express=require("express")
const app= express()
const flash = require("connect-flash")
const path=require("path") 
const nocache=require("nocache")
const session = require('express-session');
const MongoStore = require('connect-mongo');
const shortDateFormat = "MMM Do YY"

app.use(flash())
app.use(express.json())
app.use(express.urlencoded({extended:true}))

// Middle ware for moment date
app.locals.moment = moment;
app.locals.shortDateFormat = shortDateFormat;

app.use(express.static(path.join(__dirname,"public")))
app.set("view engine", "ejs")
app.set("views", "views")

app.use(nocache())

app.use(session({
  secret: 'shoesplanet-1',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ 
    mongoUrl: 'mongodb://localhost:27017/your_database_name',
  })
}));

app.use((req,res,next)=>{
  res.locals.userLoggedIn = req.session
  next()
})
 
  


const router=require("./routers/router")
app.use("/",router)

const adminRoute=require("./routers/adminRoute")
app.use("/admin",adminRoute)

const errorController = require("./controller/errorController")
app.use("/500",errorController.get500)
app.use(errorController.get404)

app.listen(3000,()=>{
    console.log("server is running on , http://localhost:3000/");
})

const express=require("express")
const user_route=express()

const userController = require("../controller/userController")
const cartController = require("../controller/cartController")
const adressController = require("../controller/adressController")

const userAuth = require("../middleware/userAuth.js")

const session=require("express-session")
const config=require("../config/config")

user_route.set("view engine", "ejs")
user_route.set("views", "views")

user_route.use(session({secret:config.sessionSecret}))

user_route.get("/", userController.loadhome)
user_route.get("/login", userController.loginload)
user_route.post("/login", userController.verifylogin)

user_route.get("/forgotPassword",userController.forgotpassword)
user_route.post("/forgotPassword",userController.postforgotpassword)
user_route.post("/password-otp-veification",userController.forgotPasswordOtpVerification)

user_route.post("/new-Password",userController.newPassword)


user_route.get("/signup",userController.signuploading)
user_route.post("/signup",userController.insertUser)

user_route.get("/otp",userController.loadOtp)
user_route.post("/otp",userController.otpValidation)

user_route.get("/otpReminder",userController.loadOtp)

user_route.get('/resend',userController.resetsendVerifymail )


user_route.get("/home",userController.loadhome)

user_route.get("/shop",userController.loadshop)

user_route.get("/singleproduct/:id",userController.loadSingleProduct)

user_route.get("/cart", userAuth.isUserlogin, cartController.loadCart)
user_route.post("/addtocart", cartController.addtocart)
user_route.get("/deleteCartProduct",cartController.deleteCart)
user_route.post("/quantityChange",cartController.quantityChange)

user_route.get("/userProfile",userController.loadProfile)

user_route.get("/Address",adressController.loadAdress)
user_route.get("/addAddress",adressController.loadAddAdress)
user_route.post("/addAddress",adressController.postloadAddAdress)


user_route.get("/loadlogout",userController.loadlogout)

module.exports = user_route

const express=require("express")
const user_route=express()

const userController = require("../controller/userController")
const cartController = require("../controller/cartController")
const adressController = require("../controller/adressController")
const orderController = require("../controller/orderController")

const userAuth = require("../middleware/userAuth.js")

const session = require('express-session');
const MongoStore = require('connect-mongo');
const config=require("../config/config")


user_route.use(session({
    secret: config.sessionSecret,
    resave: false, // Don't save session if unmodified
    saveUninitialized: false,
    store: MongoStore.create({ 
        mongoUrl:process.env.DATABASE_URL,
      }) // Don't create session until something is stored
}));


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
user_route.patch("/deleteCartProduct",cartController.deleteCart)
user_route.post("/quantityChange",cartController.quantityChange)

user_route.get("/userProfile", userAuth.isUserlogin,userController.loadProfile)
user_route.get("/editProfile/:id", userAuth.isUserlogin,userController.loadEditProfile)
user_route.post("/editProfile", userController.postEditProfile)

user_route.get("/Address", userAuth.isUserlogin,adressController.loadAdress)
user_route.get("/addAddress", userAuth.isUserlogin,adressController.loadAddAdress)
user_route.post("/addAddress",adressController.postloadAddAdress)
user_route.get("/editAdress/:id", userAuth.isUserlogin,adressController.loadEditAdress)
user_route.post("/editAdress",adressController.postloadEditAdress)
user_route.patch("/removeAdress/:id",adressController.removeAdress)

user_route.get("/checkout", userAuth.isUserlogin,orderController.loadCheckout)
user_route.post("/orderAddress", userAuth.isUserlogin,orderController.getOrderAddress)

user_route.post("/placeOrder", userAuth.isUserlogin,orderController.placeOrder)
user_route.post( '/verify-payment', userAuth.isUserlogin, orderController.razorpayVerifyPayment )
user_route.post('/verify-payment',userAuth.isUserlogin,orderController. razorpayVerifyPayment )

user_route.get("/confirmOrder",userAuth.isUserlogin,orderController.orderConfirm)
user_route.get("/orderDetails",orderController.loadOrderDetails)
user_route.patch("/orderCancel",orderController.cancelOrder)

user_route.get("/myWallet",userAuth.isUserlogin,userController.loadWallet)

user_route.get("/invoice",userController.loadInvoice)

user_route.get("/loadlogout",userController.loadlogout)

module.exports = user_route
 

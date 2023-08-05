const User = require("../models/userModels");
const Product = require("../models/productModel")
const Category = require("../models/categoryModel")
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const randomstring = require("randomstring");
const otpGenerator = require("otp-generator");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose")
// const c = require("config");

dotenv.config();

let otp;
let email2;
let name2;

const securePassword = async (password) => {
  try {
    const hashpassword = await bcrypt.hash(password, 10);
    return hashpassword;
  } catch (error) {
    console.log(error.message);
  }
};

const sendverifymail = async (name, email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOption = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "For OTP verification",
      html:
      ` <h1> hey, Your OTP is ${otp}</h1><br>
      <p> Note : The OTP only valid for 1 hour!!! </p>
      `
    };

    console.log(otp);
    transporter.sendMail(mailOption, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("email has been sent to:", info.response);
      }
    });
  } catch(error) {
    console.log(error.message);

  }
};

//for reset password send mail(function)
const resetsendVerifymail = async (name, email, token) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    const mailOption = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "For Reset password",
      //html:"<p> Hii  " +name+ "  please enter  " +otp+ "  as your OTP for verification </p>"
      // html:'<p>hi '+name+' ,please click here to<a href="http://localhost:3000/otp " '+email+' >varify</a> for verify and enter the '+otp+ ' </p>'
      html:
        "<p>hi " +
        name +
        ' ,please click here to <a href="http://localhost:3000/reset_password?token=' +
        token +
        '">Reset</a> your password </p>',
    };

    transporter.sendMail(mailOption, (error, info) => {
      if (error) {
        console.log(error.message);
      } else {
        console.log("email has been send to:", info.response);
      }
    });
  } catch (error) {
    console.log(error.message);
  }
};



const loginload = async (req, res) => {
  try {
    res.render("user/login",{message:req.flash("err")});

  } catch (error) {
    console.log(error.message);
  }
}; 

const verifylogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
  
    const userData = await User.findOne({ email: email });

    if (userData && userData.isBlocked == false) {
      const passwordMatch = await bcrypt.compare(password, userData.password);
    

      if (passwordMatch) {
    
        if (userData.isverified === 0 ) {
          // req.flash("err","not verified")
          res.redirect("/otpReminder");
        } else {
        

          req.session.user_id = userData._id;
          res.render("user/home");
        }
      
      } else {
        req.flash("err","you entered an incorrect password")
        res.redirect("/login");
      }
    } else {
      req.flash("err","wrong email or blocked by the admin")
      res.redirect("/login");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const signuploading = async (req, res) => {
  try {
    const userData = await User.find({ _id: req.body.id });
    res.render("user/signup", { message:req.flash("err"), userData });
  } catch (error) {
    console.log(error.message);
  }
};

const insertUser = async (req, res) => {
  try {
    const sPassword = await securePassword(req.body.password);
    const email = req.body.email
    const name = req.body.name
    const extinctingUser = await User.findOne({ email:email });
    email2 = email
    name2 = name
    console.log("recipient email"+email);

    if (extinctingUser) {
      req.flash("err","use another email, already existed")
      res.redirect("/signup");     
    } else {

      const user = new User({
        name: req.body.name,
        mobile: req.body.mobile,
        email: req.body.email,
        password: sPassword,
        isverified: 0,
        isBlocked: false,
     
      });

      const userData = await user.save();

      if (userData) {
        const otpGenarated = Math.floor(1000 + Math.random() * 9999);
        otp = otpGenarated;

        sendverifymail(req.body.name,req.body.email,otpGenarated)

        res.render("user/otpReminder",{email, message:req.flash("err")})
      } else {
        req.flash("err","your signup has been failed")
        res.redirect("/signup");   
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

const loadOtp = async(req,res)=>{
    try {
        res.render("user/otpReminder", { message : req.flash('err')})
    } catch (error) {
        console.log(error.message);

    }
}

const otpValidation = async(req,res)=>{
  try {
    const otpinput = req.body.otp;
    const email = req.body.email;
    if (otpinput == otp) {
      const userData = await User.findOneAndUpdate(
        { email: email2 },
        { $set: { isverified: 1 } }
      );
      res.render("user/login", {
        userData,
        email2,
        message: "otp verification successfully..!!!",
      });
    } else {
      req.flash("err","you entered an invalid mail")
      res.redirect("/login");
  }} catch (error) {
    console.error("Error during verification:", error);
    req.flash("err","An error occurred during verification")
    res.redirect("/otpReminder");
  }
  }

  //reSEND password timeout(get)


const forgotpassword = async(req,res)=>{
  try {
    res.render("user/forgotPassword",{message:req.flash("err")})
  } catch (error) {
    console.log(error.message);
  }
}

const postforgotpassword = async(req,res)=>{
  try {
    const email = req.body.email
    const userdata = await User.findOne({email:email})
    if(userdata){
      if (userdata.isverified == 0) {
        req.flash("err","invalid mail")
        res.redirect("/forgotPassword")
      }else{
        const otpGenarated = Math.floor(1000 + Math.random() * 9999);
        otp = otpGenarated;

        sendverifymail(req.body.name,req.body.email,otpGenarated)

        req.session.forgotEmail = req.body.email

        res.render("user/forgotOTP",{message:req.flash("err")})
      }  
    }else{
      req.flash("err","Wrong Email Id")
      res.redirect("/forgotPassword")
    }
  } catch (error) {
    console.log(error.message);
  }
}

 const forgotPasswordOtpVerification = async(req,res)=>{
  try {
    const OTP = req.body.otp
    const email = req.body.email
console.log(otp);
    if(OTP == otp){
      res.render("user/resetpassword",{email})
    }else{
   
      res.render("user/forgotOTP",{message:"enter a valid email"})
    }
    
  } catch (error) {

    console.log(error.message);
  }
}

const newPassword = async(req,res)=>{
  try {
    console.log(req.body, req.session);
    
    const password = await bcrypt.hash(req.body.password,10)
    await User.findOneAndUpdate({email:req.session.forgotEmail,isBlocked:false},{$set:{password:password}})
    res.redirect("/login")
  } catch (error) {
    console.log(error.message);
  }
}




const loadhome = async (req, res) => {
  try {
    if (req.session.user_id) {
      // const products = await Product.find({ status: true });
      res.render("user/home");
    }
  } catch (error) {
    console.log(error.message);
  }
};


const loadshop = async (req, res) => {
  try {
    let page = Number(req.query.page)
        
        if( isNaN (page)||page<1){
            page = 1
        }

        const condition = {}

    const productCount = await Product.find({}).count()
    const productData = await Product.find({status:true}).populate("category").skip((page-1)*(5)).limit(5)
    console.log(productData);
    const category = await Category.find({status:true})
    
    res.render("user/shop",{productData,category,
      currentPage:page,
      hasNextpage:page*5<productCount,
      haspreviouspage:page>1,
      nextPage:page+1,
      previousPage:page-1,
      lastPage:Math.ceil(productCount / 5)
    });
  } catch (error) {
    console.log(error.message);
  }
};

const loadSingleProduct = async (req, res) => {
  try {
    const productData = await Product.findOne({_id:req.params.id,status:true}).populate("category")
    console.log(productData);
    const category = await Category.find({})

    res.render("user/singleproduct",{productData,category});
  } catch (error) {
    console.log(error.message);
  }
};

const loadlogout = (req, res) => {
  try {
    if (req.session.user_id) {
      req.session.destroy((err) => {
        if (err) {
          console.log(err);
        }
      });
    } else {
      res.redirect("/login");
      res.render("user/home"); // Move this line inside the else block
      return; // Add a return statement to prevent further execution
    }

    res.render("user/home");
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  securePassword,
  insertUser,
  signuploading,
  loadOtp,
  otpValidation,
  loginload,
  verifylogin,
  forgotpassword,
  postforgotpassword,
  forgotPasswordOtpVerification,
  resetsendVerifymail,
  newPassword ,
  loadhome,
  loadshop,
  loadSingleProduct,
  loadlogout,
};

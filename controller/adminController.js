const Admin = require("../models/adminModel")

const Category = require("../models/categoryModel");

const User = require("../models/userModels")

const bcrypt=require("bcrypt")


const loadAdminLogin=async(req,res)=>{
   
    try {
        res.render("admin/login")
  
    } catch (error) {
        console.log(error.message);
        
    }
}

const verifylogin=async(req,res)=>{

    try {

       
          const email=req.body.email
          const  password=req.body.password        
        if(email === process.env.ADMIN_EMAIL){
            // const passwordMatch= bcrypt.compare(data.password,adminData.adminPassword)
            if (password ===process.env.ADMIN_PASS) {
                req.session.admin_id=process.env.ADMIN_EMAIL
                res.redirect('/admin')

            } else {
                res.render("admin/login",({message:"you entered an incorrect password"}))  
            }
          
        }else{
            res.render("admin/login",({message:"you entered an invalid mail"}))
        }
        
    } catch (error) {
        console.log(error.message);

    }
}

const loadhome=async(req,res)=>{

    try {
    res.render("admin/home")
    } catch (error) {
        console.log(error.message);
        
    }

}

const userlist = async(req,res)=>{

    try {

        const users = await User.find({})
console.log(users);
        res.render("admin/userlist",{users})
        
    } catch (error) {

        console.log(error.message);
        
    }

}



const blockUser = async(req,res)=>{

    try {

        const user = req.params.id
        const userData = await User.findById(user)
       await userData.updateOne({$set:{isBlocked:true}})
   
       if(req.session.user_id === user){

            delete req.session.user_id

       }

       res.redirect("/admin/userlist")
        
    } catch (error) {

        console.log(error.message);
        
    }
}

const unblockUser = async(req,res)=>{

    try {

       await User.updateOne({_id:req.params.id},{$set:{isBlocked:false}})
       res.redirect("/admin/userlist") 
    } catch (error) {

        console.log(error.message);
        
    }
}

module.exports={
    loadAdminLogin,
    verifylogin,
    loadhome,
    userlist,
    blockUser,
    unblockUser
}
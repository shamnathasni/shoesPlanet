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

        const data={
            email:req.body.email,
            password:req.body.password
        }
        
        const adminData={
            adminEmail:"admin@gmail.com",
            adminPassword:"111"
        }

        
        if(adminData){
            const passwordMatch= bcrypt.compare(data.password,adminData.adminPassword)
            if (passwordMatch) {
                req.session.admin_id=adminData.adminEmail
                res.redirect('/admin')

            } else {
                res.render("admin/login",({message:"you entered an invalid mail"}))  
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

       await User.updateOne({_id:req.params.id},{$set:{isBlocked:true}})
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
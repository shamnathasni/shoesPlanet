// const { name } = require("ejs");
const Category = require("../models/categoryModel");
const Product = require("../models/productModel")
const category=async(req,res)=>{

    try {

       const categoriesData = await Category.find({})
    //    console.log(req.flash('message'));
       res.render("admin/category",{categoriesData ,status : req.flash('status'), message : req.flash("message")})

    } catch (error) {

        res.redirect("/500")
        
    }
}
const addcategory = async(req,res)=>{
    try {

        res.render("admin/addcategory",)

    } catch (error) {

        console.log(error.message);
        
    }
}

const postaddcategory = async(req,res)=>{

    try {

        const {name} = req.body
        const Name = name.toUpperCase()
        const category = await Category.findOne({name:Name}) 
        if(!category){
        const newCategory= new Category({
            name:Name
        })
        await newCategory.save()

      req.flash("message","category added successfully")
      req.flash('status','true')
      res.redirect("/admin/category")
    }else{
        req.flash("message","category already exist")
        req.flash('status','false')
        res.redirect("/admin/category")
    }

    } catch (error) {
console.log(error.message);
        res.redirect("/500")
        
    }
}

const listCategory = async(req,res)=>{

    try {
        
        const category = await Category.updateOne({_id:req.params.id},{$set:{status:true}})
       
        res.redirect("/admin/category")
        

    } catch (error) {

        res.redirect("/500")
        
    }
}
const UnlistCategory = async(req,res)=>{

    try {
        
              console.log("hi",req.params.id);
        const category = await Category.updateOne({_id:req.params.id},{$set:{status:false}})
       
        res.redirect("/admin/category")

    } catch (error) {

        res.redirect("/500")
        
    }
}

const editcategory = async(req,res)=>{

    try {

       const category = await Category.findOne({_id:req.params.id}) 
       res.render("admin/editcategory",{categoriesData:category})
        
    } catch (error) {

        res.redirect("/500")
        
    }
}
const PostEditcategory = async(req,res)=>{

    try {

       
         
          const {categoryId, name} = req.body; 
          
          console.log( req.body, req.params);
          
          await Category.updateOne(
            {_id:categoryId},
            { $set:{name:name }}
           
          )
        res.redirect("/admin/category")
        
    } catch (error) {

        res.redirect("/500")
        
    }
} 
module.exports = {
    category,
    addcategory,
    postaddcategory,
    listCategory,
    UnlistCategory,
    editcategory,
    PostEditcategory 
}
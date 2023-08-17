// const { name } = require("ejs");
const Category = require("../models/categoryModel");

const category=async(req,res)=>{

    try {

       const categoriesData = await Category.find({})
       res.render("admin/category",{categoriesData})

    } catch (error) {

        console.log(error.message);
        
    }
}
const addcategory = async(req,res)=>{
    try {

        res.render("admin/addcategory")

    } catch (error) {

        console.log(error.message);
        
    }
}

const postaddcategory = async(req,res)=>{
console.log(6);
    try {

        const {name} = req.body

        const newCategory= new Category({
            name
        })

      await newCategory.save()
      console.log(newCategory);
        res.redirect("/admin/category")

    } catch (error) {

        console.log(error.message);
        
    }
}

const listCategory = async(req,res)=>{

    try {
        
        const category = await Category.updateOne({_id:req.params.id},{$set:{status:true}})
       
        res.redirect("/admin/category")
        

    } catch (error) {

        console.log(error.message);
        
    }
}
const UnlistCategory = async(req,res)=>{

    try {
        
              console.log("hi",req.params.id);
        const category = await Category.updateOne({_id:req.params.id},{$set:{status:false}})
       
        res.redirect("/admin/category")

    } catch (error) {

        console.log(error.message);
        
    }
}

const editcategory = async(req,res)=>{

    try {

       const category = await Category.findOne({_id:req.params.id}) 
       res.render("admin/editcategory",{categoriesData:category})
        
    } catch (error) {

        console.log(error.message);
        
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

        console.log(error.message);
        
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
const Product = require("../models/productModel")
const Category = require("../models/categoryModel");
const { name } = require("ejs");
const fs = require("fs")
const path = require("path")
const Jimp = require('jimp');

const loadproducts = async (req, res) => {
    try {
        let page = Number(req.query.page);
        if (isNaN(page) || page < 1) {
            page = 1;
        }  

        const condition = {};

        const productCount = await Product.find({}).count();
        const productData = await Product.find(condition)
            .populate('category')
            .skip((page - 1) * 5)
            .limit(5)
            .sort({ createdAt: -1 }); // Sort by createdAt in descending order (latest first)

        res.render("admin/products", {
            message: req.flash("err"),
            productData,
            currentPage: page,
            hasNextpage: page * 5 < productCount,
            haspreviouspage: page > 1,
            nextPage: page + 1,
            previousPage: page - 1,
            lastPage: Math.ceil(productCount / 5),
        });
    } catch (error) {
        res.redirect("/500");
        console.log(error.message);
    }
};


const addproduct=async(req,res)=>{  
    try {  
        const category = await Category.find({status:true})
        res.render("admin/addproduct",{category })
        
    } catch (error) {
        
        res.redirect("/500")
        
    }   
}

const postAddProduct = async (req, res) => {
    try {
        const {
            name,
            category,
            description,
            price,
            availability,   
        } = req.body;

        const existingProduct = await Product.findOne({
            name: { $regex: new RegExp(`^${name}$`, "i") }
        });

        if (!existingProduct) {
            let imageArr = [];

            if (req.files && req.files.length > 0) {
                for (let i = 0; i < req.files.length; i++) {
                    const filePath = path.join(__dirname, "../public/croppedImg", req.files[i].filename);

                    const image = await Jimp.read(req.files[i].path);
                    await image.resize(250, 250).writeAsync(filePath);

                    imageArr.push(req.files[i].filename);
                }
            }
        
            const product = new Product({
                name: name,
                category: category,
                description: description,
                price: price,
                availability: availability,
                image: imageArr,
            });

            await product.save();
            res.redirect('/admin/products');
        } else {
            req.flash({ message: "This product already exists" });
            res.redirect('/admin/addProduct');
        }

    } catch (error) {
        console.log(error.message);
        res.redirect("/500");
    }
};

const deleteProduct = async(req,res)=>{
    
    try {

        await Product.updateOne({_id:req.params.id},{$set:{status:false}})
        res.redirect("/admin/products")
        
    } catch (error) {

        res.redirect("/500")
        
    }
}
const restoreProduct = async(req,res)=>{
    
    try {

        await Product.updateOne({_id:req.params.id},{$set:{status:true}})
        res.redirect("/admin/products")
        
    } catch (error) {

        res.redirect("/500")
        
    }
}

const editproduct = async(req,res)=>{

    try {

        const product = await Product.findOne({_id:req.params.id}).populate("category")
       
        const category = await Category.find({})
      
        res.render("admin/editproduct",{product:product ,category})
        
    } catch (error) {

        res.redirect("/500")
        
    }
}
const deleteImage = async(req,res)=>{
    try {

        const id = req.query.id
        const image = req.query.imageId
        console.log(id);
        console.log(image);

        await Product.updateOne({_id:id},{$pull:{image:image}})
        fs.unlink( path.join( __dirname, '../public/productImages/' ) + image , ( err ) => {
            if( err ) {
              console.log(err.message);

            }
        })

        res.redirect(`/admin/editproduct/${id}`)
        
    } catch (error) {

        res.redirect("/500")
        
    }
}

const postEditProduct = async(req,res)=>{

    try {
        console.log(req.body.productId);
        const existingproduct = await Product.findById(req.body.productId)      
       
        if( req.files ) {
            for( let file of req.files ) {
                if( 
                    file.mimetype !== 'image/jpg' &&
                    file.mimetype !== 'image/jpeg' &&
                    file.mimetype !== 'image/png' &&
                    file.mimetype !== 'image/gif'
                    ){
                 
                        return res.redirect(`/admin/editproduct/${existingproduct._id}`)
                    }
            }
        }
            const images = existingproduct.image
             req.files.forEach(elements=>{
                images.push(elements.filename)
             })

             var img = images
       
         
      await Product.updateOne(
            {_id:req.body.productId},
            {$set:{
                name:req.body.name, 
                category:req.body.id , 
                description: req.body.description ,
                availability:req.body.availability , 
                price:req.body.price ,
                image:img
            
            }})

            
            res.redirect("/admin/products")

    } catch (error) {

        res.redirect("/500")
        
    }
}



module.exports = {
    loadproducts,
    addproduct,
    postAddProduct,
    deleteProduct,
    restoreProduct,
    editproduct,
    postEditProduct,
    deleteImage
}
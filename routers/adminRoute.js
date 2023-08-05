const express = require("express")
const admin_route = express()
 
const upload = require("../middleware/multer")
const adminController = require("../controller/adminController")
const categoryController = require("../controller/categoryController")
const productController = require("../controller/productController")

const adminAuth = require("../middleware/adminAuth.js")


admin_route.get("/",adminAuth.isAdminlogin,adminController.loadhome)
admin_route.get("/login",adminAuth.isAdminlogout, adminController.loadAdminLogin)
admin_route.post("/login",adminController.verifylogin)

admin_route.get("/category",adminAuth.isAdminlogin,categoryController.category)
admin_route.get("/addcategory",categoryController.addcategory)
admin_route.post("/addcategory",categoryController.postaddcategory)
admin_route.get("/editcategory/:id",categoryController.editcategory)
admin_route.post("/editcategory",categoryController.PostEditcategory)
admin_route.get("/list-category/:id",adminAuth.isAdminlogin,categoryController.listCategory)
admin_route.get("/Unlist-category/:id",adminAuth.isAdminlogin,categoryController.UnlistCategory)

admin_route.get("/products",adminAuth.isAdminlogin,productController.loadproducts)
admin_route.get("/addproduct",adminAuth.isAdminlogin,productController.addproduct)
admin_route.post("/addproduct",upload.upload.array("image"),productController.postAddProduct)
admin_route.get("/delete-product/:id", adminAuth.isAdminlogin, productController.deleteProduct)
admin_route.get("/restore-product/:id", adminAuth.isAdminlogin, productController.restoreProduct)
admin_route.get("/editproduct/:id",productController.editproduct)
admin_route.post("/editproduct",upload.upload.array("image"),productController.postEditProduct)
admin_route.get( '/delete-image', adminAuth.isAdminlogin, productController.deleteImage)





admin_route.get("/userlist",adminAuth.isAdminlogin,adminController.userlist)
admin_route.get("/block-user/:id",adminController.blockUser)
admin_route.get("/unblock-user/:id",adminController.unblockUser)




module.exports=admin_route
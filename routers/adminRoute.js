const express = require("express")
const admin_route = express()
 
const upload = require("../middleware/multer")
const adminController = require("../controller/adminController")
const categoryController = require("../controller/categoryController")
const productController = require("../controller/productController")
const orderController = require("../controller/orderController")

const adminAuth = require("../middleware/adminAuth.js")
const { loadlogout } = require("../controller/userController")


admin_route.get("/",adminAuth.isAdminlogin,adminController.loadhome)
admin_route.get("/login",adminAuth.isAdminlogout, adminController.loadAdminLogin)
admin_route.post("/login",adminController.verifylogin)
admin_route.get("/logout",adminAuth.isAdminlogin,adminController.loadlogout)

admin_route.get("/category",adminAuth.isAdminlogin,categoryController.category)
admin_route.get("/addcategory",categoryController.addcategory)
admin_route.post("/addcategory",categoryController.postaddcategory)
admin_route.get("/editcategory/:id",categoryController.editcategory)
admin_route.post("/editcategory",categoryController.PostEditcategory)
admin_route.get("/list-category/:id",adminAuth.isAdminlogin,categoryController.listCategory)
admin_route.get("/Unlist-category/:id",adminAuth.isAdminlogin,categoryController.UnlistCategory)

admin_route.get("/products",adminAuth.isAdminlogin,productController.loadproducts)
admin_route.get("/addproduct",adminAuth.isAdminlogin,productController.addproduct)
admin_route.post("/addproduct", adminAuth.isAdminlogin,upload.upload.array("image",4),productController.postAddProduct)
admin_route.get("/delete-product/:id", adminAuth.isAdminlogin, productController.deleteProduct)
admin_route.get("/restore-product/:id", adminAuth.isAdminlogin, productController.restoreProduct)
admin_route.get("/editproduct/:id",productController.editproduct)
admin_route.post("/editproduct",upload.upload.array("image"),productController.postEditProduct)
admin_route.get( '/delete-image', adminAuth.isAdminlogin, productController.deleteImage)

admin_route.get("/orderlist",adminAuth.isAdminlogin,orderController.loadAdminOrderlist)
admin_route.patch("/change-order-status",adminAuth.isAdminlogin,orderController.changeOrderStatus)
admin_route.get("/orderedProduct/:id",adminAuth.isAdminlogin,orderController.loadOrderedProduct)

admin_route.get("/userlist",adminAuth.isAdminlogin,adminController.userlist)
admin_route.get("/block-user/:id",adminController.blockUser)
admin_route.get("/unblock-user/:id",adminController.unblockUser)

admin_route.get("/salesReport",adminController.loadSalesReport)
admin_route.post("/salesReport",adminController.sortSalesReport)


module.exports=admin_route
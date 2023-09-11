const Cart = require('../models/cartModel')
const Category = require("../models/categoryModel")
const Product = require("../models/productModel")
const User = require("../models/userModels")


const loadCart = async(req,res)=>{
    try {
        const userId = req.session.user_id 
        const product = await Product.find({status:true})  
        const cartData = await Cart.findOne({userId:userId}).populate("product.product_Id")
console.log(cartData);

        res.render("user/cart",{cartData:cartData,product:product})
    } catch (error) {
        console.log(error.message);
    }
}

const addtocart = async (req, res) => {
    try {
        
        const userId = req.session.user_id;
        if (!userId) {
            console.log(1);
            return res.json({ loginRequired: true });
        }

        const { product_quantity , product_Id  } = req.body;
       
        const productData = await Product.findOne({ _id: product_Id });
        const total = product_quantity * productData.price
        if (!productData) {
            console.log(2);
            return res.json({ success: false, message: "Product not found" });
        }

        const cartData = await Cart.findOne({ userId: userId });

        if (cartData) {
            console.log(3);
            const cartProductIndex = cartData.product.findIndex(
                (item) => item.product_Id.toString() === product_Id
            );
            console.log(cartProductIndex);

            if (cartProductIndex !== -1) {
              
                // Product already in the cart, check available quantity before incrementing
                const cartProduct = cartData.product[cartProductIndex];
       
    
                if (cartProduct.quantity < productData.availability) {
                    console.log(5);
                    await Cart.findOneAndUpdate(
                        { userId: userId, "product.product_Id": product_Id },
                        { $inc:
                             { "product.$.quantity": product_quantity ,
                               "product.$.total":total ,
                                grandTotal:total } }
                    );
                }
                return res.json({ success: true, message: "Product added to cart" });
            } else {
               // Product not found in the cart, add it
               await Cart.updateOne(
                    { userId:userId },
                    { $push:
                    {product:{
                        product_Id:product_Id,
                        quantity:product_quantity,
                        total:total,
                        price:productData.price
                    },
                },
                    $inc:{ count:1 , grandTotal : total}}
                    
               )
            }
              
            return res.json({ success: true, message: "Product added to cart" });
        } else {
          
            // Cart doesn't exist, create a new cart
            const newCart = new Cart({
                userId: userId,
                product: [
                    {
                        product_Id: product_Id,
                        quantity: product_quantity,
                        total: productData.price,
                        price: productData.price,
                    },
                ],
                grandTotal: productData.price,
                count: 1,
            });
            await newCart.save();
            console.log(8);
            return res.json({ success: true, message: "Product added to cart" });
        }
    } catch (error) {
        console.error('An error occurred:', error);
        return res.json({ success: false, message: "An error occurred" });
    }
};



const deleteCart = async (req, res) => {
    try {
      const id = req.query.id;
      const userId = req.session.user_id;
  
      // Find the total price of the product to be removed
      const total = await Cart.findOne(
        { userId: userId, "product._id": id },
        { "product.$": 1 } // Projection to select only the relevant product
      );
  
      if (!total) {
        return res.status(404).json({ success: false, message: "Product not found in the cart." });
      }
  
      // Update the cart to remove the product and decrease the grandTotal
      const cartData = await Cart.updateOne(
        { userId: userId, "product._id": id },
        {
          $pull: { product: { _id: id } },
          $inc: { grandTotal: -total.product[0].total }
        }
      );
  
      // Find the updated cart data
      const cart = await Cart.findOne({ userId: userId });
  
      // If the cart is empty after removing the product, delete the cart
      if (!cart || cart.product.length < 1) {
        await Cart.deleteOne({ userId: userId });
      }
  
      console.log("Total Price of Removed Product:", total.product[0].total);
      console.log("Updated Cart Data:", cart);
  
      return res.status(200).json({ success: true, message: 'Item removed', grandTotal: cart ? cart.grandTotal : 0 });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  };
  

const quantityChange = async(req,res)=>{
    try {
        const count = req.body.count
        const productId = req.body.productId
      

        const cart = await Cart.findOne({userId:req.session.user_id})
        const product = await Product.findOne({_id:productId})
        const cartProduct = cart.product.find(
            (product) => product.product_Id.toString() === productId
            );
            console.log(product.availability);
        if (count == 1) {

          if(cartProduct.quantity<product.availability){
          

                await Cart.findOneAndUpdate(
                    {userId:req.session.user_id , "product.product_Id": productId},
                    {
                        $inc:{
                            "product.$.quantity" : 1,
                            "product.$.total" : product.price,
                            grandTotal : product.price
                        },
                    }
                )
                 res.json({success:true})   
            }else{

                res.json({
                    success:false,
                    message: "sorry, the maximum quantity of product exceeded"
                })

            }            
        }else if(count == -1){

            if (cartProduct.quantity > 1) {
                await Cart.findOneAndUpdate(
                    {userId:req.session.user_id , "product.product_Id": productId},
                    {
                        $inc:{
                            "product.$.quantity" : -1,
                            "product.$.total" : -product.price,
                            grandTotal : -product.price                            
                        }
                    }
                )
                res.json({success:true})
            } else {
                
                res.json({
                    success:false,
                    message: "sorry, the minimum quantity of product exceeded"
                })
            }
        }else{
            res.json({ success: false, message: "Invalid count value" });
        }    
    } catch (error) {
        res.redirect("/500")
    }
}

module.exports = {
    loadCart,
    addtocart,
    deleteCart,
    quantityChange
};

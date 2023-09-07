const Cart = require("../models/cartModel")
const User =require("../models/userModels")
const Order = require("../models/orderModel")
const Adress = require("../models/addrerssModel")
const Product = require("../models/productModel")
const paymentHelper = require( '../helper/paymentHelper' )
const { RAZORPAY_KEY_SECRET } = process.env
const crypto = require( 'crypto' )
const { log } = require("util")

const loadCheckout = async(req,res) => {
    try {
        const  user = req.session.user_id      
        const cart = await Cart.find({userId:user}).populate("product.product_Id")
        const adresses =  await Adress.find({user:user, status:true})
        res.render("user/checkout",{
            cart :cart,
            address : adresses
        })
    } catch (error) {
        res.redirect("/500")
    }
}


const getOrderAddress = async(req,res) => {
    try {

       const{name, mobile,email,houseName,landmark,city,state,country,pincode} = req.body
        
       const orderAddress = new Adress({
        user:req.session.user_id,
        name ,
        mobile ,
        email,
        houseName ,
        landmark,
        city,
        state,
        country,
        pincode
       })
       
       await orderAddress.save()

       res.redirect("/checkout")
      
    } catch (error) {
        res.redirect("/500")

    }
}

const placeOrder = async (req,res)=>{
    try {
       
        const { user_id } = req.session
       
        const {address , paymentMethod , grandTotal } = req.body
     
        const cartProducts = await Cart.findOne({userId : user_id})
      console.log(cartProducts+"44444");
        const singleCartProduct = cartProducts.product.map((items)=>({
            productId :items.product_Id,
            quantity : items.quantity,
            price: items.total
        }))       
        const cartTotal = await Cart.findOne({userId:user_id , grandTotal:1})   
        paymentMethod === 'COD' ? orderStatus = 'Confirmed' : orderStatus = 'Pending';
       

        const order = new Order({
            userId : user_id,
            products : singleCartProduct,
            totalPrice : grandTotal,
            paymentMethod : paymentMethod,
            orderStatus : orderStatus,
            address : address,
           
        })
        const ordered = await order.save()
            // Decreasing quantity
        for (const items of singleCartProduct) {
                const {productId,quantity } = items
                await Product.updateOne({_id:productId},{$inc:{availability:-quantity}})
        }

            // Deleting cart
        await Cart.deleteOne({userId:user_id}) 
        if(paymentMethod == "COD"){
            
            res.json({ Success : true})
        }
        else if(paymentMethod == "Razorpay"){
            const payment = await paymentHelper.razorpayPayment( ordered._id, grandTotal )
            res.json({ payment : payment , success : false  })
        } 
        else if(paymentMethod == "Wallet"){
            await User.findByIdAndUpdate({_id:user_id},{$inc:{wallet:-totalPrice , availability: -quantity},$push: {
                walletHistory: {
                  date: new Date(),
                  amount:-totalPrice,
                  message: `Buy product with wallet`,
                },
              }})
              res.json({ Success : true})
        }
        
      

    } catch (error) {
        console.log(error.message);
        res.redirect("/500")
    }
}

const razorpayVerifyPayment = async( req, res ) => {
    const { response , order } = req.body
    const { user_id } = req.session
    let hmac = crypto.createHmac( 'sha256', RAZORPAY_KEY_SECRET )
    hmac.update( response.razorpay_order_id + '|' + response.razorpay_payment_id )
    hmac = hmac.digest( 'hex' )
    if( hmac === response.razorpay_signature ){
        await Order.updateOne({_id : order.receipt},{
            $set : { orderStatus : 'Confirmed'}
        })
       
        
        res.json({paid : true})
    } else {
        res.json({paid : false})
    }
}


const orderConfirm = async(req,res)=>{
    try {

        const {user_id} = req.session
        const lastOrder = await Order.find({ userId : user_id }).sort({ date : -1 }).limit( 1 )
        res.render( 'user/confirmOrder', {
            orderlist : lastOrder
        })
    } catch (error) {
        console.log(error.message);
        res.redirect("/500")
        
    }
}

const loadOrderDetails = async(req,res)=>{
    try {

        const orderId = req.session.user_id
        const orderlist = await Order.find({userId:orderId}).populate("products.productId").populate("address")
        res.render("user/orderDetails",{orderlist})
    } catch (error) {
        res.redirect("/500")
    }
}


const loadAdminOrderlist = async(req,res) => {
    try {       
        const orderlist = await Order.find({}).populate("products.productId")  
        res.render("admin/orderlist",{order:orderlist}) 
    } catch (error) {
        console.log(error.messaage); 
    }
}


const cancelOrder = async (req, res) => {
    try {    
        console.log(1111);    
        const { orderId, status } = req.body

        const { user_id } = req.session
        console.log(req.body);
        console.log(req.session );
        console.log(2);
        const order = await Order.findOne({ _id : orderId })
        console.log(3);
        for( let products of order.products ){
            await Product.updateOne({ _id : products.productId }, {
                $inc : { availability : products.quantity }
            })
        }
        console.log(4);
        if( order.orderStatus !== "Pending" && order.paymentMethod === 'razorpay' ) {
            console.log(5);
            await User.updateOne({ _id : user_id },{
                $inc : {
                    wallet : order.totalPrice
                },
                $push : {
                    walletHistory : {
                        date : Date.now(),
                        amount : order.wallet,
                        message : "Deposited while canecelled order"
                    }
                }
            })
        } else if( order.orderStatus !== "Pending" && order.paymentMethod === 'COD' ) {
            console.log(6);
            if( order.wallet && order.wallet> 0 ) {
                await User.updateOne({ _id : user_id },{
                    $inc : {
                        wallet : order.wallet
                    },
                    $push : {
                        walletHistory : {
                            date : Date.now(),
                            amount : order.wallet,
                            message : "Deposited while cancelled order"
                        }
                    }
                })
            }
        }
        await Order.findOneAndUpdate({ _id : orderId },
            { $set : { orderStatus : status }}) 
            const newStatus = await Order.findOne({ _id : orderId })
            console.log(7);
            res.status( 200 ).json({ success : true, status : newStatus.orderStatus })
        } catch ( error ) {
            console.log(error.message);
        res.redirect('/500')

    }
}
 const changeOrderStatus = async ( req, res ) => {
    try {
         const { status, orderId } = req.body
       
         const user = req.session.user_id
  
         if( status === 'Cancelled'){
             // If order cancelled. The product quantity increases back
             console.log(11);
             const order = await Order.findOne({ _id: orderId })
             for( let products of order.products ){
                 await Product.updateOne({ _id : products.productId },{
                     $inc : { quantity : products.quantity }
                    })
                    console.log(4);
                }
                // sets the orders status
                console.log(5);
                await Order.updateOne({ _id : orderId },
                    { $set : { orderStatus : status }})
                    
                    //return the amount to wallet
                    console.log(order.userId, '--order');
                    console.log(order.totalPrice, '--total');
                    if (order.paymentMethod === "Razorpay" ) {
                        console.log(1);
                        const wallet = await User.updateOne({_id:order.userId},{
                            $inc:
                            {   
                                wallet:order.totalPrice
                            },
                            $push:
                            {
                                walletHistory:
                                {
                                    date:Date.now(),
                                    amount :order.totalPrice,
                                    message: "amount refunded while the order is cancelled "
                                }
                            } 
                        })
                   
                   
                    res.status( 200 ).json({ success : true, status : newStatus.orderStatus })
                }

             } else {
                 // sets the order status
                 await Order.findOneAndUpdate({ _id : orderId },
                     { $set : { orderStatus : status }}) 
                     res.status( 200 ).json({ success : true, status : newStatus.orderStatus })
             }
         const newStatus = await Order.findOne({ _id : orderId })
         res.status( 200 ).json({ success : true, status : newStatus.orderStatus })
    } catch ( error ) {
     res.redirect('/500')

    }
 }

const loadOrderedProduct = async(req,res) =>{
    try {
        const product = req.params.id
        const orderedproducts = await Order.findOne({_id:product}).populate("products.productId")
        res.render("admin/orderedProduct",{orderedproducts})
    } catch (error) {
        res.redirect("/500") 
    }
}

module.exports = {
    loadCheckout,
    getOrderAddress,
    placeOrder,
    razorpayVerifyPayment,
    orderConfirm,
    loadOrderDetails,
    loadAdminOrderlist,
    cancelOrder,
    changeOrderStatus,
    loadOrderedProduct
}
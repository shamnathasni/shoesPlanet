const Cart = require("../models/cartModel")
const User =require("../models/userModels")
const Order = require("../models/orderModel")
const Adress = require("../models/addrerssModel")
const Product = require("../models/productModel")
const cartHelper = require( '../helper/cartHelper' )
const paymentHelper = require( '../helper/paymentHelper' )
const moment = require('moment');
moment.locale('en'); // Change 'en' to your desired locale
const shortDateFormat = 'YYYY-MM-DD'; // Define your desired date format
const { RAZORPAY_KEY_SECRET } = process.env
const crypto = require( 'crypto' )
const { log } = require("util")

const loadCheckout = async(req,res) => {
    try {
        const  user = req.session.user_id      
        const cart = await Cart.find({userId:user}).populate("product.product_Id").populate("userId")
        console.log(cart);
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
        // const products =  await cartHelper.totalCartPrice( user_id )
        // console.log(products,"9999");
        const {address , paymentMethod ,walletAmount } = req.body

        let walletBalance
        if( walletAmount ){
            walletBalance = Number( walletAmount )
        }
        //   const productItems = products[0].items
        const cartProducts = await Cart.find({userId : user_id}).populate("product.product_Id")
        
      console.log(cartProducts[0].product+"44444");
        const singleCartProduct = cartProducts[0].product.map((items)=>({
            productId :items.product_Id,
            quantity : items.quantity,
            price: items.total
        })) 
        console.log(singleCartProduct,"single");      
        const cartTotal = await Cart.findOne({userId:user_id  },{_id:0 , grandTotal:1}) 
console.log(walletAmount,"crttotal");
        let walletUsed, amountPayable
        if( walletAmount ) {
            if( cartTotal.grandTotal > walletBalance ) {
                amountPayable = cartTotal.grandTotal - walletBalance
                walletUsed = walletBalance
            } else if( walletBalance > cartTotal.grandTotal ) {
                amountPayable = 0
                walletUsed = cartTotal.grandTotal
            }
        } else {
            amountPayable = cartTotal.grandTotal
        }  
        console.log(amountPayable);
        paymentMethod === 'COD' ? orderStatus = 'Confirmed' : orderStatus = 'Pending';
        if( amountPayable === 0) { orderStatus = 'Confirmed' }

        const order = new Order({
            userId : user_id,
            products : singleCartProduct,
            totalPrice : cartTotal.grandTotal,
            paymentMethod : paymentMethod,
            orderStatus : orderStatus,
            address : address,
            walletUsed : walletUsed,
            amountPayable : amountPayable,
            date:new Date()
        })
        const ordered = await order.save()
            // Decreasing quantity
        for (const items of cartProducts[0].product) {
                const {product_Id,quantity } = items
                console.log(product_Id,quantity +"Pppp");
               await Product.updateOne({_id:product_Id},{$inc:{availability:-quantity}})
        }
            // Deleting cart
        await Cart.deleteOne({userId:user_id}) 
        if(  paymentMethod === 'COD' || amountPayable === 0 ){
            // COD
                if( walletAmount ) {
                    await User.updateOne({ _id : user_id }, {
                        $inc : {
                            wallet : -walletUsed
                        },
                        $push : {
                            walletHistory : {
                                date : Date.now(),
                                amount : -walletUsed,
                                message : 'Used for purachse'
                            }
                        }
                    })
                }
                return res.json({ success : true})
            }else if(paymentMethod == "Razorpay"){
            const payment = await paymentHelper.razorpayPayment( ordered._id, amountPayable )
            res.json({ payment : payment , success : false  })
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
        const orders = await Order.findOne({ _id : order.receipt })
        if ( orders.walletUsed ) {
            await Order.updateOne({ _id : user_id},{
                $inc : {
                    wallet : -orders.walletUsed
                },
                $push : {
                    walletHistory : {
                        date : Date.now(),
                        amount : -orders.walletUsed,
                        message : 'Used for purachse'
                    }
                }
            })
        }
        
        
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
        const orderlist = await Order.find({userId:orderId}).populate("products.productId").populate("address").sort({date:-1})
        
        res.render("user/orderDetails",{orderlist,moment, shortDateFormat })
    } catch (error) {
        console.log(error.message);
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
        console.log(req.body,"bb");
        console.log(req.session );
        console.log(2);
        const order = await Order.findOne({ _id : orderId })
        console.log(order);
        for( let products of order.products ){
            await Product.updateOne({ _id : products.productId }, {
                $inc : { availability : products.quantity }
            })
        }
        await Order.updateOne({ _id : orderId },
            { $set : { orderStatus : status }})
        console.log(4);
        console.log(order.orderStatus);
        console.log(order.amountPayable);

        if( order.orderStatus !== "Pending" && order.paymentMethod == 'Razorpay'  ) {
            console.log(5);
            await User.updateOne({ _id : user_id },{
                $inc : {
                    wallet : order.amountPayable
                },
                $push : {
                    walletHistory : {
                        date : Date.now(),
                        amount : order.amountPayable,
                        message : "Deposited while the order is cancelled by the user"
                    }
                }
            })
        } else if( order.orderStatus !== "Pending" && order.paymentMethod == 'Wallet' ) {
            console.log(6);
            if( order.wallet && order.wallet> 0 ) {
                await User.updateOne({ _id : user_id },{
                    $inc : {
                        wallet : order.amountPayable
                    },
                    $push : {
                        walletHistory : {
                            date : Date.now(),
                            amount : order.amountPayable,
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
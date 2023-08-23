const Cart = require("../models/cartModel")
const Order = require("../models/orderModel")
const Adress = require("../models/addrerssModel")
const Product = require("../models/productModel")
const paymentHelper = require( '../helper/paymentHelper' )
const { RAZORPAY_KEY_SECRET } = process.env


const loadCheckout = async(req,res) => {
    try {
        const  user = req.session.user_id      
        const cart = await Cart.find({userId:user}).populate("product.product_Id")
        const adresses =  await Adress.find({user:user, status:true})
        res.render("user/checkout",{
            cart :cart,
            address : adresses
        })
        console.log(cart[0].grandTotal);
    } catch (error) {
        console.log(error.message);
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
       res.json({success:true})
    } catch (error) {
        console.log(error.message);

    }
}

const placeOrder = async (req,res)=>{
    try {
        console.log(2222);
        const { user_id } = req.session
       
        const {address , paymentMethod , grandTotal } = req.body
        const cartProducts = await Cart.find({user : user_id})
        const singleCartProduct = cartProducts.product.map((items)=>({
            productId :items.product_Id,
            quantity : items.product_Id.quantity,
            price: items.product_Id.total
        }))
        const cartTotal = await Cart.findOne({userId:user_id , grandTotal:1})
        console.log(99+cartTotal);

        paymentMethod === 'COD' ? orderStatus = 'Confirmed' : orderStatus = 'Pending';
        const order = new Order({
            userId : user_id,
            products : cartProducts,
            totalPrice : grandTotal,
            paymentMethod : paymentMethod,
            orderStatus : orderStatus,
            address : address,
           
        })
   console.log("order"+ order);
        await order.save()
            // Decreasing quantity
        for (const items of singleCartProduct) {
                const {productId,quantity } = items
                await Product.updateOne({_id:productId},{$inc:{quantity:-quantity}})
        }
            // Deleting cart
        await Cart.deleteOne({userId:user_id}) 
        if(paymentMethod == "COD"){
            await Cart.updateOne({userId:user_id},{$inc:{
                grandTotal:-grandTotal
            }})
        }
        else if(paymentMethod == "Razorpay"){
            const payment = await paymentHelper.razorpayPayment( order._id, grandTotal )
            res.json({ payment : payment , success : false  })
        } 
console.log(payment);
    } catch (error) {
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
        res.render("user/confirmOrder")
    } catch (error) {
        res.redirect("/500")
    }
}


module.exports = {
    loadCheckout,
    getOrderAddress,
    placeOrder,
    razorpayVerifyPayment,
    orderConfirm
}
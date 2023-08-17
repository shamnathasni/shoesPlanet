const mongoose = require("mongoose")

const cartSchema = new mongoose.Schema({

    userId:{
        type:mongoose.Types.ObjectId,
        ref:"User",
        require:true
    },
    product:[{
        product_Id:{
            type : mongoose.Types.ObjectId,
            ref : "Product",
            require : true
        },
        quantity:{
           type:Number,
           default:1,
           require:true  
        },
        total:{
            type:Number,
            require:true
        }

    }],
    grandTotal:{
        type:Number,
        require:true
    },
    count:{
        type:Number,
        default:1
    }
})

module.exports = mongoose.model("Cart",cartSchema)
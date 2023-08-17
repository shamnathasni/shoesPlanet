
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"Category",
        required:true,   
    },
    description:{
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    availability: {
        type: Number,
        required: true,
    },
    image:{
        type:Array,
        required:true
    },
    size:{
        type:Array,
        required:true
    },
    status:{
        type:Boolean,
        default:true
    }
    
});

module.exports = mongoose.model("Product", productSchema);

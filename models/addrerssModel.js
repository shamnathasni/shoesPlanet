const mongoose = require("mongoose")
const adressSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required: true,
      },
      
    name:{
        type:String,
        required: true,
        trim:true
    },
    mobile:{
        type:Number,
        required:true,
        trim:true
    },
    email:{
        type:String,
        required: true,
        trim:true 
    },
    landmark:{
        type:String,
        required: true,
        trim:true 
    },
    houseName:{
        type:String,
        required: true,
        trim:true 
    },
    city:{
        type:String,
        required: true,
        trim:true 
    },
    state:{
        type:String,
        required: true,
        trim:true 
    },
    country:{
        type:String,
        required: true,
        trim:true 
    },
    pincode:{
        type:String,
        required: true,
        trim:true
    },     
    status:{
      type:Boolean,
      default:true,
    }

})

module.exports = mongoose.model("Adress",adressSchema)
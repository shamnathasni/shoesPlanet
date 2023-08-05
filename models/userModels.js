const mongoose=require("mongoose")

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    mobile:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    joinedDate : {
        type : Date,
        default : Date.now
    },    
    isverified:{
        type:Number,
        default:0
    },
    isBlocked:{
        type:Boolean,
        default:false
    }
})

module.exports= mongoose.model("User",userSchema)
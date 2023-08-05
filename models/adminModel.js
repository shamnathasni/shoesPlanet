const mongoose=require("mongoose")

const adminSchema = new mongoose.Schema({
        
   
    email:{

        type:String,
        require:true
    },
    password:{
    
        type:String,
        require:true
    },
    isverified:{
        type:Number,
        default:1
    }
    
    
})

module.exports= mongoose.model("Admin",adminSchema)
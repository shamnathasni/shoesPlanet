
const Adress = require("../models/addrerssModel")
const loadAdress = async(req,res) => {
    try {

        const adresssData = await Adress.find({user:req.session.user_id,status:true})
        res.render("user/address",{ data:adresssData })
        
    } catch (error) {
        res.redirect("/500")
    }
}

const loadAddAdress = async(req,res)=>{
    try {
        res.render("user/addAdress")
        
    } catch (error) {
        res.redirect("/500")
    }
}

const postloadAddAdress = async(req,res) => {
    try {
        console.log(1);

       
       
        const { name , mobile , email , landmark ,  houseName , city , state , country , pincode ,  } = req.body
            const newAdress = new Adress({
                user : req.session.user_id ,
                 name :name , 
                 mobile : mobile, 
                 email :email , 
                 landmark : landmark,  
                 houseName : houseName , 
                 city : city , 
                 state : state , 
                 country : country ,
                 pincode : pincode ,
                 
             })
            const result = await newAdress.save()
        console.log(result);
         

        res.redirect("/Address")

    } catch (error) {
        console.log(error.message);
       

    }
}

const loadEditAdress = async(req,res) =>{
    try {

        const adressid = req.params.id
        const adress = await Adress.findOne({_id:adressid})
        res.render("user/editAdress",{adress})
        
    } catch (error) {
        console.log(error.message);  
 
    }
}

const postloadEditAdress = async(req,res) => {
    try {
        const adressid = req.session.user_id
        console.log(adressid);

        const editedAdress = await Adress.updateOne({_id: adressid},
            {
                $set:{
                    name :req.body.name, 
                    mobile : req.body.mobile, 
                    email :req.body.email , 
                    houseName :req.body.houseName , 
                    landmark:req.body.landmark , 
                    city:req.body.city , 
                    state:req.body.state , 
                    country:req.body.country
                }
            })

            res.redirect("/address")
        
    } catch (error) {
        res.redirect("/500")
    }
}

const removeAdress = async(req,res) =>{
    try {

        const adressId = req.params.id
        console.log(adressId + "llll");
        await Adress.updateOne({_id:adressId},{
            $set:{
                status:false
            }})

        await Adress.updateOne({_id:req.session.user_id},{
            $pull:{
              
            }
        })
        res.status(200).json({success:true})
    } catch (error) {
        res.redirect("/500")
    }
}


module.exports = {
    loadAdress,
    loadAddAdress,
    postloadAddAdress,
    loadEditAdress,
    postloadEditAdress,
    removeAdress
}
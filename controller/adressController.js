const Adress = require("../models/adminModel")

const loadAdress = async(req,res) => {
    try {

        const adresssData = await Adress.find({_id:req.session.user_id})
        res.render("user/address",{ data:adresssData })
        
    } catch (error) {
       console.log(error.message); 
    }
}

const loadAddAdress = async(req,res)=>{
    try {
        res.render("user/addAdress")
        
    } catch (error) {
        console.log(error.message);  
    }
}

console.log(1);

const postloadAddAdress = async(req,res) => {
    try {

        const user = req.sesson.user_id
        const adress = await findOne({user:user})

        const { name , mobile , email , landmark ,  houseName , city , state , country , pin } = req.body

        if (adress) {
            
            await Adress.updateOne({user:user},
               {$push:
               {adress:{
                name , 
                mobile , 
                email , 
                landmark ,  
                houseName , 
                city , 
                state , 
                country ,
                pin
               }
               }
            })

            
        } else {
            const newAdress = new Adress(
                {user:user,adress:[{
                name , 
                mobile , 
                email , 
                landmark ,  
                houseName , 
                city , 
                state , 
                country ,
                pin
                }]
                
            })
            await newAdress.save()
        }
        res.redirect("/Adress")

    } catch (error) {
        console.log(error.message);  
    }
}

module.exports = {
    loadAdress,
    loadAddAdress,
    postloadAddAdress,
}
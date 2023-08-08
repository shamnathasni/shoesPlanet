const isUserlogin = async(req,res,next)=>{
    try {
        if ( req.session.user_id) {
            next()
            
        } else {
           res.redirect("/user/login") 
        }
    } catch (error) {
      console.log(error.message);  
    }
}

const isUserlogout = async(req,res,next)=>{
    try {
        if (req.session.user_id) {
            res.redirect("/user/login") 
        } else {
           next() 
        }
    } catch (error) {
        console.log(error.message); 
    }
}
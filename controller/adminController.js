const Admin = require("../models/adminModel")
const Category = require("../models/categoryModel");
const Order = require("../models/orderModel")
const User = require("../models/userModels")
const Product = require("../models/productModel")
const moment = require('moment');
moment.locale('en'); 
const shortDateFormat = 'YYYY-MM-DD'; 
const bcrypt=require("bcryptjs")


const loadAdminLogin=async(req,res)=>{
   
    try {
        res.render("admin/login")
  
    } catch (error) {
        res.redirect("/500")
        
    }
}

const verifylogin=async(req,res)=>{

    try {

       
          const email=req.body.email
          const  password=req.body.password        
        if(email === process.env.ADMIN_EMAIL){
            // const passwordMatch= bcrypt.compare(data.password,adminData.adminPassword)
            if (password ===process.env.ADMIN_PASS) {
                req.session.admin_id=process.env.ADMIN_EMAIL
                res.redirect('/admin')

            } else {
                res.render("admin/login",({message:"you entered an incorrect password"}))  
            }
          
        }else{
            res.render("admin/login",({message:"you entered an invalid mail"}))
        }
        
    } catch (error) {
        res.redirect("/500")

    }
}


const loadlogout = async(req,res) => {
  try {
    req.session.admin_id = null
    res.redirect("/admin/login")
  } catch (error) {
    res.redirect("/500")
  }
}

const loadhome=async(req,res) => {
        try {
            let usersData = [];
            let currentSalesYear = new Date(new Date().getFullYear(), 0, 1);
            let usersByYear = await User.aggregate([
              {
                $match: {
                  createdAt: { $gte: currentSalesYear },
                  blocked: { $ne: true },
                },
              },
              {
                $group: {
                  _id: { $dateToString: { format: "%m", date: "$createdAt" } },
                  count: { $sum: 1 },
                },
              },
              { $sort: { _id: 1 } },
            ]);
            for (let i = 1; i <= 12; i++) {
              let result = true;
              for (let j = 0; j < usersByYear.length; j++) {
                result = false;
                if (usersByYear[j]._id == i) {
                  usersData.push(usersByYear[j]);
                  break;
                } else {
                  result = true;
                }
              }
              if (result) usersData.push({ _id: i, count: 0 });
            }
            let userData = [];
            for (let i = 0; i < usersData.length; i++) {
              userData.push(usersData[i].count);
            }
            let sales = [];
            let salesByYear = await Order.aggregate([
              {
                $match: {
                  createdAt: { $gte: currentSalesYear },
                  orderStatus: { $ne: "Cancelled" },
                },
              },
              {
                $group: {
                  _id: { $dateToString: { format: "%m", date: "$createdAt" } },
                  total: { $sum: "$totalPrice" },
                  count: { $sum: 1 },
                },
              },
              { $sort: { _id: 1 } },
            ]);
            for (let i = 1; i <= 12; i++) {
              let result = true;
              for (let j = 0; j < salesByYear.length; j++) {
                result = false;
                if (salesByYear[j]._id == i) {
                  sales.push(salesByYear[j]);
                  break;
                } else {
                  result = true;
                }
              }
              if (result) sales.push({ _id: i, total: 0, count: 0 });
            }
            let salesData = [];
            for (let i = 0; i < sales.length; i++) {
              salesData.push(sales[i].total);
            }
            const profitMargin = 0.5;
            const currentYear = new Date().getFullYear();
            const currentMonth = new Date().getMonth() + 1;
            const latestOrder = await Order.find()
              .sort({ createdAt: -1 })
              .populate("products.productId");
            const currentYearProfit = await Order.aggregate([
              {
                $match: {
                  orderStatus: "Delivered",
                  $expr: { $eq: [{ $year: "$createdAt" }, currentYear] },
                },
              },
              {
                $group: {
                  _id: null,
                  profit: {
                    $sum: { $multiply: [profitMargin, "$totalPrice"] },
                  },
                },
              },
            ]);
            const revenue = await Order.aggregate([
              {
                $match: {
                  orderStatus: { $ne: "Delivered" },
                },
              },
              { $group: { _id: null, revenue: { $sum: "$totalPrice" } } },
            ]);
            const monthlyEarning = await Order.aggregate([
              {
                $match: {
                  orderStatus: "Delivered",
                  $expr: { $eq: [{ $month: "$createdAt" }, currentMonth] },
                },
              },
              { $group: { _id: null, earning: { $sum: "$totalPrice" } } },
            ]);
            const latestUsers = await User.find().sort({ createdAt: -1 }).limit(4);
            const pendingOrder = await Order.countDocuments({ orderStatus: "Pending" });
            const placedOrder = await Order.countDocuments({ orderStatus: "Placed" });
            const cancelledOrder = await Order.countDocuments({
              orderStatus: "Cancelled",
            });
            const deliveredOrder = await Order.countDocuments({
              orderStatus: "Delivered",
            });
            const countProduct = await Product.countDocuments();
            const categoryCount = await Category.countDocuments();
            res.render("admin/home", {
              currentYearProfit,
              monthlyEarning,
              cancelledOrder,
              deliveredOrder,
              categoryCount,
              pendingOrder,
              countProduct,
              latestOrder,
              latestUsers,
              placedOrder,
              salesData,
              userData,
              revenue,
            });
    } catch (error) {
        res.redirect("/500")
       console.log(error.message); 
    }
}


const userlist = async(req,res)=>{

    try {

        const users = await User.find({})

        res.render("admin/userlist",{users,moment, shortDateFormat })
        
    } catch (error) {

        res.redirect("/500")
        
    }

}



const blockUser = async(req,res)=>{

    try {

        const user = req.params.id
        const userData = await User.findById(user)
       await userData.updateOne({$set:{isBlocked:true}})
   
       if(req.session.user_id === user){

            delete req.session.user_id

       }

       res.redirect("/admin/userlist")
        
    } catch (error) {

        res.redirect("/500")
        
    }
}

const unblockUser = async(req,res)=>{

    try {

       await User.updateOne({_id:req.params.id},{$set:{isBlocked:false}})
       res.redirect("/admin/userlist") 
    } catch (error) {

        res.redirect("/500")
        
    }
}

const loadSalesReport = async( req,res ) => {
    try {

        const totalAmount = await Order.aggregate([
          { $match: { 'orderStatus': 'Delivered' } },
          { $group: { _id: null, total: { $sum: '$totalPrice' } } }
        ]);
// console.log(totalAmount+"totalAmount");         
        const product = await Order.find({"orderStatus" : "Delivered"}).populate("products.productId").populate("userId")
 
      
        res.render("admin/salesReport",{
            totalAmount,
            product
        })

// console.log( product)

    } catch (error) {
        console.log(error.message);
    }
}


const sortSalesReport = async (req, res,next) => {
  try {
    let fromDate = req.body.fromDate ? new Date(req.body.fromDate) : null;
    fromDate.setHours(0, 0, 0, 0);
    let toDate = req.body.toDate ? new Date(req.body.toDate) : null;
    toDate.setHours(23, 59, 59, 999);

    const currentDate = new Date();

    if (fromDate && toDate) {
      if (toDate < fromDate) {
        const temp = fromDate;
        fromDate = toDate;
        toDate = temp;
      }
    } else if (fromDate) {
      toDate = currentDate;
    } else if (toDate) {
      fromDate = currentDate;
    }
console.log("*/n*/n$");
 console.log(toDate,fromDate);
    var matchStage = {
    
      'orderStatus': 'Delivered'
    };

    const totalAmount = await Order.aggregate([  {
      $match: {

      
        date: { $gte: fromDate, $lte: toDate },
      },
    },
      { $match: matchStage }, // This is where you would put your additional matching criteria if needed
      {
        $group: {
          _id: null,
          total: { $sum: '$totalPrice' }
        }
      }
    ]);

    const product = await Order.find({ date : { $gte: fromDate, $lte: toDate },"orderStatus": 'Delivered' }).populate('products.productId').populate('userId')
    console.log('hai');
    console.log(product+"ppppp");
    res.render('admin/salesReport', {
      totalAmount,
      product,
    })
    
  } catch (err) {
    console.log((err.message));
  }
};



module.exports={ 
    loadAdminLogin,
    verifylogin,
    loadlogout,
    loadhome,
    userlist,
    blockUser,
    unblockUser,
    loadSalesReport,
    sortSalesReport
}
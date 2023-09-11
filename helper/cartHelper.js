const Cart = require( '../models/cartModel' )
const mongoose = require( 'mongoose')

module.exports = {
    totalCartPrice : async ( user_id ) => {

        try {
            const totalPrice = await Cart.aggregate([
              {
                $match: { userId: new mongoose.Types.ObjectId(user_id) }
              },
              {
                $unwind: "$product"
              },
              {
                $lookup: {
                  from: "products",
                  localField: "product.productId",
                  foreignField: "_id",
                  as: "product"
                }
              },

             
              {
                $addFields: {
                  totalPricePerItem: { $trunc: "$totalPricePerItem" }
                }
              },
              {
                $group: {
                  _id: "$_id",
                  userId: { $first: "$userId" },
                  product: {
                    $push: {
                      _id: "$product._id",
                      productId: "$product.productId",
                      productName: "$product.name",
                      quantity: "$product.quantity",
                      totalPrice: "$totalPricePerItem" 
                    }
                  },
                  total: { $sum: { $multiply: ["$totalPricePerItem", "$product.quantity"] } } 
                }
              }
            ]);
            console.log(totalPrice,"000");
            return totalPrice

        } catch (error) {
            console.log(error.message);
          res.redirect('/500')

        }
    }
}
const Razorpay = require('razorpay');
const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = process.env;

var instance = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

module.exports = {
  razorpayPayment: async (orderId, grandTotal) => {
    const id = "" + orderId;
    const order = await instance.orders.create({
      amount: grandTotal, // Amount should be in paise (subunits of currency)
      currency: "INR",
      receipt: id,
    });
    console.log(order);
    return order;
  },
};

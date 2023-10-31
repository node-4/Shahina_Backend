const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  },
  senderUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  },
  code: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String
  },
  email: {
    type: String
  },
  description: {
    type: String
  },
  expirationDate: {
    type: String
  },
  activationDate: {
    type: String
  },
  image: {
    type: String
  },
  discount: {
    type: String
  },
  price: {
    type: String
  },
  used: {
    type: Boolean,
    default: false
  },
  per: {
    type: String,
    enum: ["Percentage", "Amount"]
  },
  completeVisit: {
    type: Number
  },
  orderStatus: {
    type: String,
    enum: ["unconfirmed", "confirmed"],
    default: "unconfirmed",
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed"],
    default: "pending"
  },
});
couponSchema.pre('save', function (next) {
  if (this.activateDate >= this.expireDate) {
    const err = new Error('Activate date must be less than expire date');
    next(err);
  } else {
    next();
  }
});
const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;
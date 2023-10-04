const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  user: {
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
  description: {
    type: String
  },
  expirationDate: {
    type: String
  },
  activationDate: {
    type: String
  },
  discount: {
    type: String
  },
  completeVisit: {
    type: Number
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
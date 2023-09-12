const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  expirationDate: {
    type: String
  }, 
  activationDate: {
    type: String
  },
  discount: {
    type: String
  },
  minOrder: {
    type: String
  }
});


couponSchema.pre('save', function(next) {
  if (this.activateDate >= this.expireDate) {
    const err = new Error('Activate date must be less than expire date');
    next(err);
  } else {
    next();
  }
});
const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;
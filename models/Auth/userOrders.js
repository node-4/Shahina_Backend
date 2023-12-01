const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");
const mongooseAggregatePaginate = require("mongoose-aggregate-paginate");
const schema = mongoose.Schema;
const DocumentSchema = schema({
  userId: {
    type: schema.Types.ObjectId,
    ref: "user"
  },
  orderId: {
    type: String
  },
  productOrder: {
    type: schema.Types.ObjectId,
    ref: "productOrder",
  },
  giftOrder: {
    type: schema.Types.ObjectId,
    ref: "Coupon",
  },
  serviceOrder: {
    type: schema.Types.ObjectId,
    ref: "serviceOrder",
  },
  orderObjTotalAmount: {
    type: String,
  },
  applyCoupan: {
    type: schema.Types.ObjectId,
    ref: "Coupon",
  },
  couponDiscount: {
    type: String,
  },
  orderObjPaidAmount: {
    type: String,
  },
  paymentOption: {
    type: String,
    enum: ["PrePaid", "PostPaid"],
    default: "PrePaid"
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
  servicePaymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed"],
    default: "pending"
  },
}, { timestamps: true })
DocumentSchema.plugin(mongoosePaginate);
DocumentSchema.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model("userOrder", DocumentSchema);
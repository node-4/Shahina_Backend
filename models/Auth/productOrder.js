const mongoose = require('mongoose');
const mongoosePaginate = require("mongoose-paginate");
const mongooseAggregatePaginate = require("mongoose-aggregate-paginate");
const schema = mongoose.Schema;
const cartProductsSchema = new schema({
        productId: {
                type: schema.Types.ObjectId,
                ref: "Product"
        },
        quantity: {
                type: Number,
                default: 1
        }
}, { _id: false })
const cartGiftsSchema = new schema({
        giftId: {
                type: schema.Types.ObjectId,
                ref: "gift"
        },
        quantity: {
                type: Number,
                default: 1
        }
}, { _id: false })
const cartfrequentlyBuyProductSchema = new schema({
        frequentlyBuyProductId: {
                type: schema.Types.ObjectId,
                ref: "frequentlyBuyProduct"
        },
        quantity: {
                type: Number,
                default: 1
        }
}, { _id: false })
const DocumentSchema = schema({
        orderId: {
                type: String,
        },
        user: {
                type: schema.Types.ObjectId,
                ref: "user"
        },
        date: {
                type: Date,
        },
        time: {
                type: String,
        },
        suggesstion: {
                type: String,
        },
        products: {
                type: [cartProductsSchema]
        },
        gifts: {
                type: [cartGiftsSchema]
        },
        frequentlyBuyProductSchema: {
                type: [cartfrequentlyBuyProductSchema]
        },
        coupon: {
                type: schema.Types.ObjectId,
                ref: "Coupon",
                default: null,
        },
        total: {
                type: Number,
                default: 0
        },
        discount: {
                type: Number,
                default: 0
        },
        coupan: {
                type: Number,
                default: 0
        },
        subTotal: {
                type: Number,
                default: 0
        },
        shipping: {
                type: Number,
                default: 0
        },
        memberShip: {
                type: Number,
                default: 0
        },
        memberShipPer: {
                type: Number,
                default: 0
        },
        grandTotal: {
                type: Number,
                default: 0
        },
        pickupFromStore: {
                type: Boolean,
                default: false,
        },
        pickUp: {
                houseFlat: {
                        type: String,
                },
                appartment: {
                        type: String,
                },
                landMark: {
                        type: String,
                },
        },
        deliveryAddresss: {
                houseFlat: {
                        type: String,
                },
                appartment: {
                        type: String,
                },
                landMark: {
                        type: String,
                },
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
}, { timestamps: true });
DocumentSchema.plugin(mongoosePaginate);
DocumentSchema.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model("productOrder", DocumentSchema);
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const cartProductsSchema = new Schema({
    productId: {
        type: Schema.Types.ObjectId,
        ref: "Product"
    },
    quantity: {
        type: Number,
        default: 1
    }
}, { _id: false })
const cartGiftsSchema = new Schema({
    giftId: {
        type: Schema.Types.ObjectId,
        ref: "gift"
    },
    quantity: {
        type: Number,
        default: 1
    }
}, { _id: false })
const cartfrequentlyBuyProductSchema = new Schema({
    frequentlyBuyProductId: {
        type: Schema.Types.ObjectId,
        ref: "frequentlyBuyProduct"
    },
    quantity: {
        type: Number,
        default: 1
    }
}, { _id: false })
const CartSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "user"
    },
    pickupFromStore: {
        type: Boolean,
        default: false,
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
        type: Schema.Types.ObjectId,
        ref: "Coupon",
        default: null,
    }
}, {
    timestamps: true
})
module.exports = mongoose.model("cart", CartSchema)
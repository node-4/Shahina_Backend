const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const cartProductsSchema = new Schema({
    productId: {
        type: Schema.Types.ObjectId,
        ref: "Product"
    },
    priceId: {
        type: String,
    },
    size: {
        type: String,
    },
    sizePrice: {
        type: Number,
    },
    quantity: {
        type: Number,
        default: 1
    }
}, { _id: false })
const cartGiftsSchema = new Schema({
    giftPriceId: {
        type: Schema.Types.ObjectId,
        ref: "giftPrice"
    },
    email: {
        type: String,
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
const cartAddOnservicesSchema = new Schema({
    addOnservicesId: {
        type: Schema.Types.ObjectId,
        ref: "addOnservices"
    },
    quantity: {
        type: Number,
        default: 1
    }
}, { _id: false })
const cartServiceSchema = new Schema({
    serviceId: {
        type: Schema.Types.ObjectId,
        ref: "services"
    },
    priceId: {
        type: String,
    },
    size: {
        type: String,
    },
    sizePrice: {
        type: Number,
    },
    memberprice: {
        type: Number,
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
    services: {
        type: [cartServiceSchema]
    },
    AddOnservicesSchema: {
        type: [cartAddOnservicesSchema]
    },
    coupon: {
        type: Schema.Types.ObjectId,
        ref: "Coupon",
        default: null,
    },
    couponUsed: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true
})
module.exports = mongoose.model("cart", CartSchema)
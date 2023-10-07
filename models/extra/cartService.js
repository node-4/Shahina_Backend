const mongoose = require("mongoose");
const Schema = mongoose.Schema;
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
    date: {
        type: Date,
    },
    time: {
        type: String,
    },
    suggesstion: {
        type: String,
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
    }
}, {
    timestamps: true
})
module.exports = mongoose.model("cartService", CartSchema)
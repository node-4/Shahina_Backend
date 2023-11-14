const mongoose = require('mongoose');
const mongoosePaginate = require("mongoose-paginate");
const mongooseAggregatePaginate = require("mongoose-aggregate-paginate");
const schema = mongoose.Schema;
const cartAddOnservicesSchema = new schema({
        addOnservicesId: {
                type: schema.Types.ObjectId,
                ref: "addOnservices"
        },
        quantity: {
                type: Number,
                default: 1
        }
}, { _id: false })
const cartServiceSchema = new schema({
        serviceId: {
                type: schema.Types.ObjectId,
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
}, { _id: false });
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
        services: {
                type: [cartServiceSchema]
        },
        AddOnservicesSchema: {
                type: [cartAddOnservicesSchema]
        },
        coupon: {
                type: schema.Types.ObjectId,
                ref: "Coupon",
                default: null,
        },
        memberShipPer: {
                type: Number,
                default: 0
        },
        memberShip: {
                type: Number,
                default: 0
        },
        offerDiscount: {
                type: Number,
                default: 0
        },
        subTotal: {
                type: Number,
                default: 0
        },
        total: {
                type: Number,
                default: 0
        },
        serviceAddresss: {
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
                enum: ["unconfirmed", "confirmed", "cancel"],
                default: "unconfirmed",
        },
        serviceStatus: {
                type: String,
                enum: ["Pending", "Done"],
                default: "Pending",
        },
        paymentStatus: {
                type: String,
                enum: ["pending", "paid", "failed"],
                default: "pending"
        },
}, { timestamps: true });
DocumentSchema.plugin(mongoosePaginate);
DocumentSchema.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model("serviceOrder", DocumentSchema);
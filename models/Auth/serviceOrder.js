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
        serviceCharge: {
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
                enum: ["unconfirmed", "confirmed"],
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
const mongoose = require("mongoose");
const schema = mongoose.Schema;
const addressSchema = new mongoose.Schema({
    address: {
        type: String,
    },
    appartment: {
        type: String,
    },
    city: {
        type: String,
    },
    state: {
        type: String,
    },
    zipCode: {
        type: String,
    },
    user: {
        type: schema.Types.ObjectId,
        ref: "user",
    },
    admin: {
        type: schema.Types.ObjectId,
        ref: "user",
    },
    type: {
        type: String,
    },
    addressType: {
        type: String,
        enum: ["Shipping", "Billing"]
    },
}, { timestamps: true });
module.exports = mongoose.model("Address", addressSchema);
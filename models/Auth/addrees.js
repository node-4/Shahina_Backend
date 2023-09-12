const mongoose = require("mongoose");
const schema = mongoose.Schema;
const addressSchema = new mongoose.Schema({
    houseFlat: {
        type: String,
    },
    appartment: {
        type: String,
    },
    landMark: {
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
}, { timestamps: true });
module.exports = mongoose.model("Address", addressSchema);
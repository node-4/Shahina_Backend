const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const brandSchema = new Schema({
    name: { type: String, required: true },
    image: { type: String },
}, { timestamps: true });

const brand = mongoose.model("skinCondition", brandSchema);

module.exports = brand;
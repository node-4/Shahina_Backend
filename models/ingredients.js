const mongoose = require("mongoose");

const transactionSchema = mongoose.Schema({
        name: {
                type: String,
        },
        type: {
                type: String,
                enum: ["COSMETICS", "FOOD INGREDIENTS", "BIRTH CONTROL"]
        },
}, { timestamps: true });

const transaction = mongoose.model("ingredients", transactionSchema);
module.exports = transaction;

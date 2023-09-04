const mongoose = require("mongoose");
const objectid = mongoose.Schema.Types.ObjectId;
const subscriptionSchema = mongoose.Schema(
        {
                plan: {
                        type: String,
                        enum: ["SILVER", "GOLD", "PLATINUM", "DIAMOND"]
                },
                price: {
                        type: String,
                },
                month: {
                        type: Number,
                        default: 0
                },
                discount: {
                        type: String,
                        default: 0
                },
                details: {
                        type: Array,
                },
        },
        {
                timestamps: true,
        }
);
module.exports = mongoose.model("subscription", subscriptionSchema);





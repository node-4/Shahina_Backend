const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const CartSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "user"
    },
    products: {
        type: Schema.Types.ObjectId,
        ref: "Product"
    },
    services: {
        type: Schema.Types.ObjectId,
        ref: "services"
    },
    type: {
        type: String,
        enum: ["P", "S"]
    }
}, {
    timestamps: true
})
module.exports = mongoose.model("recentlyView", CartSchema)
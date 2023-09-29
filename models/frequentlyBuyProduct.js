const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const testimonialSchema = new Schema(
        {
                price: {
                        type: String
                },
                products: [{
                        type: Schema.Types.ObjectId,
                        ref: "Product"
                }],
        },
        { timestamps: true }
);

module.exports = mongoose.model("frequentlyBuyProduct", testimonialSchema);
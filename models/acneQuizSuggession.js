const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const testimonialSchema = new Schema(
        {
                answer1: {
                        type: String
                },
                answer2: {
                        type: String
                },
                answer3: {
                        type: String
                },
                answer4: {
                        type: String
                },
                productId: {
                        type: Schema.Types.ObjectId,
                        ref: "Product"
                },
                frequentlyBuyProductId: {
                        type: Schema.Types.ObjectId,
                        ref: "frequentlyBuyProduct"
                },
        },
        { timestamps: true }
);

module.exports = mongoose.model("acneQuizSuggession", testimonialSchema);
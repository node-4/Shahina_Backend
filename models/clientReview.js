const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const testimonialSchema = new Schema(
        {
                userName: {
                        type: String,
                },
                title: {
                        type: String
                },
                description: {
                        type: String
                },
        },
        { timestamps: true }
);

module.exports = mongoose.model("clientReview", testimonialSchema);
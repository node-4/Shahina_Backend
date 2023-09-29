const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const testimonialSchema = new Schema(
        {
                question: {
                        type: String,
                },
                option1: {
                        type: String
                },
                option1image: {
                        type: String
                },
                option2: {
                        type: String
                },
                option2image: {
                        type: String
                },
                option3: {
                        type: String
                },
                option3image: {
                        type: String
                },
                option4: {
                        type: String
                },
                option4image: {
                        type: String
                },
        },
        { timestamps: true }
);

module.exports = mongoose.model("acneQuiz", testimonialSchema);
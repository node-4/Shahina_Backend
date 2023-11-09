const mongoose = require('mongoose');
const schema = mongoose.Schema;
const DocumentSchema = schema({
        image: {
                type: String
        },
        name: {
                type: String
        },
        fb: {
                type: String
        },
        google: {
                type: String
        },
        instagram: {
                type: String
        },
        youtube: {
                type: String
        },
        map: {
                type: String
        },
        mapLink: {
                type: String
        },
        address: {
                type: String
        },
        phone: {
                type: String
        },
        email: {
                type: String
        },
        monToFriday: {
                type: String
        },
        saturday: {
                type: String
        },
        sundayClose: {
                type: String
        },
        numOfReviews: {
                type: Number,
                default: 0,
        },
        ratings: {
                type: Number,
                default: 0,
        },
        reviews: [
                {
                        user: {
                                type: mongoose.Schema.ObjectId,
                                ref: "user",
                        },
                        name: {
                                type: String,
                        },
                        rating: {
                                type: Number,
                        },
                        comment: {
                                type: String,
                        },
                },
        ],
}, { timestamps: true })
module.exports = mongoose.model("contactDetails", DocumentSchema);
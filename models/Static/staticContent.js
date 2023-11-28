const mongoose = require('mongoose');
const staticContent = mongoose.Schema({
    terms: {
        type: String,
    },
    privacy: {
        type: String,
    },
    title: {
        type: String
    },
    image: {
        type: String
    },
    desc: {
        type: String
    },
    description: {
        type: Array
    },
    designation: {
        type: String
    },
    link: {
        type: Array
    },
    type: {
        type: String,
        enum: ["ABOUTUS", "TERMS", "PRIVACY", "SHIPPINGPOLICY", "RETURNPOLICY", "MEMBERSHIPTERM"],
    },
}, { timestamps: true })
module.exports = mongoose.model('staticContent', staticContent);
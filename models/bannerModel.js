const mongoose = require('mongoose');
const schema = mongoose.Schema;
const DocumentSchema = schema({
        title: {
                type: String
        },
        desc: {
                type: String
        },
        bannerName: {
                type: String
        },
        bannerImage: {
                type: String
        },
        partnerImage: {
                type: Array
        },
        shopImage: {
                type: Array
        },
        shopDetails: [{
                title: {
                        type: String
                },
                desc: {
                        type: String
                },
                image: {
                        type: String
                },
        }],
        serviceImage: {
                type: Array
        },
        type: {
                type: String,
                enum: ["offer", "product", "finance", "Membership", "Partner", "shopPage", "servicePage"]
        },
}, { timestamps: true })
module.exports = mongoose.model("banner", DocumentSchema);
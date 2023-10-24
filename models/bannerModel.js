const mongoose = require('mongoose');
const schema = mongoose.Schema;
const DocumentSchema = schema({
        title: {
                type: String
        },
        desc: {
                type: String
        },
        off: {
                type: String
        },
        refferalCode: {
                type: String
        },
        appleLink: {
                type: String
        },
        playstoreLink: {
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
        description: {
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
                enum: ["offer", "product", "finance", "Membership", "Partner", "shopPage", "servicePage", "Promotion", "HomePage"]
        },
}, { timestamps: true })
module.exports = mongoose.model("banner", DocumentSchema);
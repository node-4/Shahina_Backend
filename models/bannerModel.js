const mongoose = require('mongoose');
const schema = mongoose.Schema;
const DocumentSchema = schema({
        bannerName: {
                type: String
        },
        bannerImage: {
                type: String
        },
        type: {
                type: String,
                enum: ["offer", "product", "finance", "Membership"]
        },
}, { timestamps: true })
module.exports = mongoose.model("banner", DocumentSchema);
const mongoose = require('mongoose');
const postSchema = mongoose.Schema({
        user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "user"
        },
        reason: {
                type: String,
        },
        type: {
                type: String,
        },
}, {
        timestamps: true
})
module.exports = mongoose.model("membershipCancel", postSchema)
const mongoose = require('mongoose');
const postSchema = mongoose.Schema({
        image: {
                type: String,
                default: ""
        },
        title: {
                type: String,
        },
        description: {
                type: String,
        },
        date: {
                type: Date,
                default: Date.now,
        },
}, { timestamps: true });
const postmodel = mongoose.model('news', postSchema);
module.exports = postmodel;
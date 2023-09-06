const mongoose = require('mongoose');
const schema = mongoose.Schema;
const DocumentSchema = schema({
        description: {
                type: String
        },
        image: {
                type: String
        },
}, { timestamps: true })
module.exports = mongoose.model("gallary", DocumentSchema);
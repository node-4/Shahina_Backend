const mongoose = require('mongoose');
const schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate');
const DocumentSchema = schema({
        from: {
                type: Number
        },
        to: {
                type: Number
        },
        charges: {
                type: Number
        },
}, { timestamps: true })
DocumentSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("shippingCharges", DocumentSchema);
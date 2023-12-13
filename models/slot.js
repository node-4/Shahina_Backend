const mongoose = require('mongoose');
const schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate');

const DocumentSchema = schema({
        date: {
                type: Date,
        },
        from: {
                type: Date,
        },
        to: {
                type: Date,
        },
        isBooked: {
                type: Boolean,
                default: false,
        },
        slotBlocked: {
                type: Boolean,
                default: false,
        }
}, { timestamps: true });

DocumentSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("slot", DocumentSchema);

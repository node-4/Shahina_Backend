const mongoose = require('mongoose');
const schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate');
const mongooseAggregatePaginate = require("mongoose-aggregate-paginate");
const DocumentSchema = schema({
        title: {
                type: String,
        },
        description: {
                type: String,
        },
        date: {
                type: Date,
        },
        from: {
                type: Date,
        },
        to: {
                type: Date,
        },
        fromAmPm: {
                type: String,
                enum: ['AM', 'PM'],
        },
        toAmPm: {
                type: String,
                enum: ['AM', 'PM'],
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
DocumentSchema.plugin(mongooseAggregatePaginate);
DocumentSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("slot", DocumentSchema);

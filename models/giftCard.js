const mongoose = require('mongoose');
const mongoosePaginate = require("mongoose-paginate");
const mongooseAggregatePaginate = require("mongoose-aggregate-paginate");
const schema = mongoose.Schema;
var storeSchema = new schema({
        name: {
                type: String
        },
        image: {
                type: String
        },
        price: {
                type: Number
        },
        description: {
                type: String
        },
        discountPrice: {
                type: Number
        },
        saved: {
                type: Number
        },
        discount: {
                type: Number,
                default: 0
        },
        discountActive: {
                type: Boolean,
                default: false
        },
        rating: {
                type: Number,
                default: 0
        },
}, { timestamps: true });
storeSchema.plugin(mongoosePaginate);
storeSchema.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model("gift", storeSchema);
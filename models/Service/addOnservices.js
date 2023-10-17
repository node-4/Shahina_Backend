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
        time: {
                type: String
        },
        price: {
                type: Number
        },
        description: {
                type: String
        },
}, { timestamps: true });
storeSchema.plugin(mongoosePaginate);
storeSchema.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model("addOnservices", storeSchema);
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
        description: {
                type: String
        },
        priceArray: [{
                type: schema.Types.ObjectId,
                ref: "giftPrice"
        }],
        rating: {
                type: Number,
                default: 0
        },
}, { timestamps: true });
storeSchema.plugin(mongoosePaginate);
storeSchema.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model("gift", storeSchema);
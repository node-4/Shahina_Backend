const mongoose = require('mongoose');
const mongoosePaginate = require("mongoose-paginate");
const mongooseAggregatePaginate = require("mongoose-aggregate-paginate");
const schema = mongoose.Schema;
var storeSchema = new schema({
        giftCardrewards: {
                type: Number
        },
        price: {
                type: Number
        },
        giftId: {
                type: schema.Types.ObjectId,
                ref: "gift"
        },
}, { timestamps: true });
storeSchema.plugin(mongoosePaginate);
storeSchema.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model("giftPrice", storeSchema);
const mongoose = require('mongoose');
const mongoosePaginate = require("mongoose-paginate");
const mongooseAggregatePaginate = require("mongoose-aggregate-paginate");
const schema = mongoose.Schema;
var storeSchema = new schema({
        categoryId: {
                type: schema.Types.ObjectId,
                ref: "Category"
        },
        name: {
                type: String
        },
        images: [{
                img: {
                        type: String
                }
        }],
        price: {
                type: Number
        },
        benfit: {
                type: Array,
        },
        area: {
                type: Array,
        },
        session: {
                type: Array,
        },
        sizePrice: [{
                size: {
                        type: String,
                },
                price: {
                        type: Number,
                },
                mPrice: {
                        type: Number
                },
        }],
        multipleSize: {
                type: Boolean,
                default: false
        },
        description: {
                type: String
        },
        beforeAfterImage: {
                type: String
        },
        mPrice: {
                type: Number
        },
        discountPrice: {
                type: Number
        },
        discount: {
                type: Number,
                default: 0
        },
        rating: {
                type: Number,
                default: 0
        },
        sellCount: {
                type: Number,
                default: 0
        },
        type: {
                type: String,
                enum: ["offer", "Service"]
        },
}, { timestamps: true });
storeSchema.plugin(mongoosePaginate);
storeSchema.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model("services", storeSchema);
const mongoose = require("mongoose")
const mongoosePaginate = require("mongoose-paginate");
const mongooseAggregatePaginate = require("mongoose-aggregate-paginate");
const productSchema = mongoose.Schema({
        brandId: {
                type: mongoose.Schema.ObjectId,
                ref: "brand",
        },
        name: {
                type: String,
        },
        description: {
                type: String,
        },
        contents: {
                type: Array,
        },
        howTouse: [{
                step: {
                        type: String,
                },
                description: {
                        type: String,
                },
        }],
        ingredients: {
                type: String,
        },
        price: {
                type: String,
        },
        costPrice: {
                type: String,
        },
        quantity: {
                type: Number,
                default: 0,
        },
        discount: {
                type: Boolean,
                default: false
        },
        discountPrice: {
                type: Number,
        },
        ratings: {
                type: Number,
                default: 0,
        },
        productImages: [{
                image: {
                        type: String
                },
        }],
        numOfReviews: {
                type: Number,
                default: 0,
        },
        reviews: [
                {
                        user: {
                                type: mongoose.Schema.ObjectId,
                                ref: "user",
                        },
                        name: {
                                type: String,
                        },
                        rating: {
                                type: Number,
                        },
                        comment: {
                                type: String,
                        },
                },
        ],
        status: {
                type: String,
                enum: ["OUTOFSTOCK", "STOCK"],
        },
},
        { timestamps: true });
productSchema.plugin(mongoosePaginate);
productSchema.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model("Product", productSchema);

const mongoose = require("mongoose")
const mongoosePaginate = require("mongoose-paginate");
const mongooseAggregatePaginate = require("mongoose-aggregate-paginate");
const productSchema = mongoose.Schema({
        brandId: {
                type: mongoose.Schema.ObjectId,
                ref: "brand",
        },
        nutritionId: {
                type: mongoose.Schema.ObjectId,
                ref: "nutrition",
        },
        productTypeId: {
                type: mongoose.Schema.ObjectId,
                ref: "productType",
        },
        skinConditionId: {
                type: mongoose.Schema.ObjectId,
                ref: "skinCondition",
        },
        skinTypeId: {
                type: mongoose.Schema.ObjectId,
                ref: "skinType",
        },
        name: {
                type: String,
        },
        description: {
                type: String,
        },
        size: {
                type: String,
        },
        sizePrice: [{
                size: {
                        type: String,
                },
                price: {
                        type: String,
                },
                stock: {
                        type: Number,
                        default: 0,
                },
                status: {
                        type: String,
                        enum: ["OUTOFSTOCK", "STOCK"],
                },
        }],
        multipleSize: {
                type: Boolean,
                default: false
        },
        contents: {
                type: Array,
        },
        result: {
                type: Array,
        },
        benfit: {
                type: Array,
        },
        additionalInfo: [{
                title: {
                        type: String,
                },
                description: {
                        type: String,
                },
        }],
        howTouse: [{
                step: {
                        type: String,
                },
                description: {
                        type: String,
                },
        }],
        methodToUse: {
                type: String,
        },
        returnPolicy: {
                type: String,
        },
        keyIngredients: {
                type: Array,
        },
        ingredients: {
                type: String,
        },
        price: {
                type: String,
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
        stock: {
                type: Number,
                default: 0,
        },
        numOfReviews: {
                type: Number,
                default: 0,
        },
        reviews: [{
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
                skinType: {
                        type: String,
                },
                acenSeverity: {
                        type: String,
                },
                skinTone: {
                        type: String,
                },
                skinConcern: {
                        type: String,
                },
                comment: {
                        type: String,
                },
        }],
        status: {
                type: String,
                enum: ["OUTOFSTOCK", "STOCK"],
        },
        beforeAfterImage: {
                type: String
        },
        acneType: {
                type: String,
        },
        considerAcne: {
                type: String,
        },
},
        { timestamps: true });
productSchema.plugin(mongoosePaginate);
productSchema.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model("Product", productSchema);

const mongoose = require('mongoose');
const schema = mongoose.Schema;
const DocumentSchema = mongoose.Schema({
    productOrderId: {
        type: schema.Types.ObjectId,
        ref: "productOrder",
    },
    first_mile_option: { type: String },
    description: { type: String },
    weight: {
        value: { type: String },
        units: { type: String },
    },
    customer_reference: { type: String },
    metadata: {
        userId: Number,
    },
    sender: {
        contact: {
            name: { type: String },
            email: { type: String },
        },
        address: {
            address_line1: { type: String },
            suburb: { type: String },
            state_name: { type: String },
            postcode: { type: String },
            country: { type: String },
        },
        instructions: { type: String },
    },
    receiver: {
        contact: {
            name: { type: String },
            email: { type: String },
            company: { type: String },
        },
        address: {
            address_line1: { type: String },
            suburb: { type: String },
            state_name: { type: String },
            postcode: { type: String },
            country: { type: String },
        },
        instructions: { type: String },
    },
    order_id: { type: String },
    state: { type: String },
    order_url: { type: String },
    sendle_reference: { type: String },
    tracking_url: { type: String },
    labels: [{
        format: { type: String },
        size: { type: String },
        url: { type: String },
    }],
    scheduling: {
        pickup_date: { type: String },
        picked_up_on: { type: String },
        delivered_on: { type: String },
        estimated_delivery_date_minimum: { type: String },
        estimated_delivery_date_maximum: { type: String },
        status: { type: String, default: null }, // Define status as nullable
        is_cancellable: Boolean,
    },
    hide_pickup_address: Boolean,
    kilogram_weight: { type: String },
    cubic_metre_volume: { type: String },
    volume: {
        units: { type: String },
        value: { type: String },
    },
    route: {
        delivery_guarantee_status: { type: String },
        type: { type: String },
        description: { type: String },
    },
    price: {
        gross: {
            amount: Number,
            currency: { type: String },
        },
        net: {
            amount: Number,
            currency: { type: String },
        },
        tax: {
            amount: Number,
            currency: { type: String },
        },
    },
    packaging_type: { type: String },
    price_breakdown: {
        base: {
            amount: Number,
            currency: { type: String },
        },
        base_tax: {
            amount: Number,
            currency: { type: String },
        },
        cover: {
            amount: Number,
            currency: { type: String },
        },
        cover_tax: {
            amount: Number,
            currency: { type: String },
        },
        discount: {
            amount: Number,
            currency: { type: String },
        },
        discount_tax: {
            amount: Number,
            currency: { type: String },
        },
        fuel_surcharge: {
            amount: Number,
            currency: { type: String },
        },
        fuel_surcharge_tax: {
            amount: Number,
            currency: { type: String },
        },
    },
}, { timestamps: true });

module.exports = mongoose.model("Shipment", DocumentSchema);

const mongoose = require("mongoose");
const schema = mongoose.Schema;
var userSchema = new schema(
        {
                fullName: {
                        type: String,
                },
                firstName: {
                        type: String,
                },
                lastName: {
                        type: String,
                },
                language: {
                        type: String,
                },
                image: {
                        type: String,
                },
                courtesyTitle: {
                        type: String,
                },
                gender: {
                        type: String,
                },
                dob: {
                        type: String,
                },
                country: {
                        type: String,
                },
                countryCode: {
                        type: String,
                },
                phone: {
                        type: String,
                        minLength: 8,
                        maxLength: 12,
                },
                email: {
                        type: String,
                        minLength: 10,
                },
                refferalCode: { type: String, },
                refferUserId: { type: schema.Types.ObjectId, ref: "user" },
                joinUser: [{ type: schema.Types.ObjectId, ref: "user" }],
                subscriptionId: { type: mongoose.Schema.ObjectId, ref: "subscription", },
                subscriptionExpiration: {
                        type: Date,
                },
                isSubscription: {
                        type: Boolean,
                        default: false,
                },
                password: {
                        type: String,
                },
                otp: {
                        type: String,
                },
                otpExpiration: {
                        type: Date,
                },
                accountVerification: {
                        type: Boolean,
                        default: false,
                },
                deviceToken: {
                        type: String
                },
                userType: {
                        type: String,
                        enum: ["USER", "GUEST", "ADMIN"],
                },
                status: {
                        type: String,
                        enum: ["Approved", "Reject", "Pending"],
                },
                wallet: {
                        type: Number,
                        default: 0,
                },
                firstVisit: {
                        type: Number,
                        default: 0,
                },
                orderVisit: {
                        type: Number,
                        default: 0,
                },
                totalVisit: {
                        type: Number,
                        default: 0,
                },
                checkIn: {
                        type: Number,
                        default: 0,
                },
                appOrder: {
                        type: Number,
                        default: 0,
                },
                websiteOrder: {
                        type: Number,
                        default: 0,
                },
        },
        { timestamps: true }
);
module.exports = mongoose.model("user", userSchema);

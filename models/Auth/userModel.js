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
                userType: {
                        type: String,
                        enum: ["USER", "ADMIN"],
                },
                status: {
                        type: String,
                        enum: ["Approved", "Reject", "Pending"],
                },
                wallet: {
                        type: Number,
                        default: 0,
                },
        },
        { timestamps: true }
);
module.exports = mongoose.model("user", userSchema);

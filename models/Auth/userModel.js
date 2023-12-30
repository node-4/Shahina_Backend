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
                        type: Date,
                },
                bio: {
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
                birthDayCreate: {
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
                        enum: ["USER", "GUEST", "ADMIN", "SUBADMIN"],
                },
                status: {
                        type: String,
                        enum: ["Approved", "Reject", "Pending"],
                },
                userStatus: {
                        type: String,
                        enum: ["Active", "Block"],
                        default: "Active",
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
                showOnAllBooking: {
                        type: Boolean,
                        default: false,
                },
                sendEmailNotification: {
                        type: Boolean,
                        default: false,
                },
                sendTextNotification: {
                        type: Boolean,
                        default: false,
                },
                sendEmailMarketingNotification: {
                        type: Boolean,
                        default: false,
                },
                sendTextMarketingNotification: {
                        type: Boolean,
                        default: false,
                },
                sendReminder: {
                        type: Boolean,
                        default: false,
                },
                sendConfirmationAppointmentWithCard: {
                        type: Boolean,
                        default: false,
                },
                preferredLAnguage: {
                        type: String
                },
                permissions: {
                        type: [String],
                        enum: ["dashboard", "Product", "service", "gallery", "getblog", "privacy-policy", "terms", "brand", "nutrition", "Product-type", "skin-condition", "skinType", "Category", "subscription", "reviews", "about-us", "faq", "contact", "query", "ingredients", "giftCard", "acne", "acne-suggestion", "add-on-service", "banner", "Orders", "service-order", "user", "frequently", "transaction", "rewards", "scheduler", "shipping", "slot", "shipping-privacy", "return -privacy", "chat", "another", "notification", "member_terms"]
                },
        },
        { timestamps: true }
);
module.exports = mongoose.model("user", userSchema);

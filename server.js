const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const compression = require("compression");
const serverless = require("serverless-http");
const User = require("./models/Auth/userModel");
const coupanModel = require("./models/Auth/coupan");
const nodemailer = require("nodemailer");
const app = express();
const path = require("path");
app.use(compression({ threshold: 500 }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
if (process.env.NODE_ENV == "production") {
        console.log = function () { };
}
app.get("/", (req, res) => {
        res.send("Hello World!");
});

require('./routes/admin.route')(app);
require('./routes/user.route')(app);
require('./routes/static.route')(app);
const createBirthdayRewards = async () => {
        try {
                const findUser = await User.find({ userType: "USER" });
                if (findUser.length > 0) {
                        const currentDate = new Date();
                        const currentMonth = currentDate.getMonth() + 1;
                        const currentDay = currentDate.getDate();
                        for (const user of findUser) {
                                const userMonth = user.dob.getMonth() + 1;
                                const userDay = user.dob.getDate();
                                if (userMonth === currentMonth && userDay === currentDay + 1) {
                                        if (user.birthDayCreate < Date.now()) {
                                                const expirationDate = new Date();
                                                expirationDate.setDate(expirationDate.getDate() + 14);
                                                const options = { year: 'numeric', month: 'long', day: 'numeric' };
                                                const formattedExpirationDate = expirationDate.toLocaleDateString('en-US', options);
                                                var transporter = nodemailer.createTransport({ service: 'gmail', auth: { "user": "info@shahinahoja.com", "pass": "gganlypsemwqhwlh" } });
                                                let mailOption1 = {
                                                        from: '<do_not_reply@gmail.com>',
                                                        to: `${user.email}`,
                                                        subject: 'Order Received',
                                                        text: `You have received a new order`,
                                                        html: `Hi ${user.firstName}! Happy birthday from Shahina Hoja Aesthetics!
                                                        Come in this week for a complimentary Glutathione IV.
                                                        Book Here: https://shahina-web.vercel.app/login
                                                        Expires ${formattedExpirationDate};`,
                                                };
                                                let info1 = await transporter.sendMail(mailOption1);
                                                if (info1) {
                                                        const rewardObject = {
                                                                user: user._id,
                                                                code: await reffralCode(),
                                                                title: "BirthDay Reward",
                                                                description: "Get a discount coupon of worth $50. Your birthday rewards.",
                                                                discount: 50,
                                                                per: "Amount",
                                                                expirationDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                                                                completeVisit: 0,
                                                                orderStatus: "confirmed",
                                                                paymentStatus: "paid"
                                                        };
                                                        const userCoupon = await coupanModel.create(rewardObject);
                                                        if (userCoupon) {
                                                                const nextBirthday = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
                                                                const updateResult = await User.findByIdAndUpdate({ _id: user._id }, { $set: { birthDayCreate: nextBirthday } }, { new: true });
                                                        }
                                                } else {
                                                        const rewardObject = {
                                                                user: user._id,
                                                                code: await reffralCode(),
                                                                title: "BirthDay Reward",
                                                                description: "Get a discount coupon of worth $50. Your birthday rewards.",
                                                                discount: 50,
                                                                per: "Amount",
                                                                completeVisit: 0,
                                                                orderStatus: "confirmed",
                                                                paymentStatus: "paid"
                                                        };
                                                        const userCoupon = await coupanModel.create(rewardObject);
                                                        if (userCoupon) {
                                                                const nextBirthday = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
                                                                const updateResult = await User.findByIdAndUpdate({ _id: user._id }, { $set: { birthDayCreate: nextBirthday } }, { new: true });
                                                        }
                                                }
                                        }
                                }
                        }
                }
        } catch (error) {
                console.error("Error in createBirthdayRewards:", error);
        }
};
const reffralCode = async () => {
        var digits = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let OTP = '';
        for (let i = 0; i < 9; i++) {
                OTP += digits[Math.floor(Math.random() * 36)];
        }
        return OTP;
}
// setInterval(async () => {
//         console.log("-----------call out function---------");
//         // await createBirthdayRewards();
// }, 10000);
mongoose.Promise = global.Promise;
mongoose.set("strictQuery", true);
mongoose.connect(process.env.DB_URL, { useNewUrlParser: true, useUnifiedTopology: true, }).then((data) => {
        console.log(`Mongodb connected with server: ${data.connection.host} : Shahina-Backend`);
});
app.listen(process.env.PORT, () => {
        console.log(`Listening on port ${process.env.PORT}!`);
});
module.exports = { handler: serverless(app) };

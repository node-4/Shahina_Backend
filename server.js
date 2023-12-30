const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const compression = require("compression");
const serverless = require("serverless-http");
const User = require("./models/Auth/userModel");
const coupanModel = require("./models/Auth/coupan");
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
setInterval(async () => {
        console.log("-----------call out function---------");
        await createBirthdayRewards();
}, 10000);
mongoose.Promise = global.Promise;
mongoose.set("strictQuery", true);
mongoose.connect(process.env.DB_URL, { useNewUrlParser: true, useUnifiedTopology: true, }).then((data) => {
        console.log(`Mongodb connected with server: ${data.connection.host} : Shahina-Backend`);
});
app.listen(process.env.PORT, () => {
        console.log(`Listening on port ${process.env.PORT}!`);
});
module.exports = { handler: serverless(app) };

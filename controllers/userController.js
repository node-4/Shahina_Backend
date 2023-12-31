const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authConfig = require("../configs/auth.config");
var newOTP = require("otp-generators");
const Subscription = require("../models/subscription");
const banner = require("../models/bannerModel");
const Gallary = require("../models/gallary");
const User = require("../models/Auth/userModel");
const Category = require("../models/Service/Category")
const mongoose = require('mongoose');
const services = require('../models/Service/services');
const Brand = require('../models/Product/brand');
const Nutrition = require('../models/Product/nutrition');
const product = require('../models/Product/product');
const ProductType = require('../models/Product/productType');
const SkinCondition = require('../models/Product/skinCondition');
const SkinType = require('../models/Product/skinType');
const contact = require("../models/contactDetail");
const helpandSupport = require("../models/helpAndSupport");
const News = require("../models/news");
const ClientReview = require("../models/clientReview");
const Cart = require("../models/Auth/cartModel");
const cartService = require("../models/extra/cartService");
const coupanModel = require("../models/Auth/coupan");
const Address = require("../models/Auth/addrees");
const serviceOrder = require("../models/Auth/serviceOrder");
const productOrder = require("../models/Auth/productOrder");
const userOrders = require("../models/Auth/userOrders");
const transactionModel = require("../models/transactionModel");
const frequentlyBuyProduct = require("../models/frequentlyBuyProduct");
const addOnservices = require("../models/Service/addOnservices");
const giftCard = require("../models/giftCard");
const giftPrice = require("../models/giftPrice");
const memshipCancel = require("../models/memshipCancel");
const userCard = require("../models/userCard");
const recentlyView = require("../models/recentlyView");
const moment = require("moment")
const commonFunction = require("../middlewares/commonFunction");
const adminNotification = require("../models/adminNotification");
const slot = require("../models/slot");
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const { getLogger } = require("nodemailer/lib/shared");
const stripe = require("stripe")('pk_test_51Kr67EJsxpRH9smiVHbxmogutwO92w8dmTUErkRtIsIo0lR7kyfyeVnULRoQlry9byYbS8Uhk5Mq4xegT2bB9n9F00hv3OFGM5'); // shahina test
const stripe1 = require("stripe")('sk_test_51Kr67EJsxpRH9smipLQrIzDFv69P1b1pPk96ba1A4HJGYJEaR7cpAaU4pkCeAIMT9B46D7amC77I3eNEBTIRF2e800Y7zIPNTS'); // shahina test
// const stripe = require("stripe")('sk_test_51J0NhySIdiNJWVEcYKjXhXets6lbhBeYQm9aY9r6sXw8whvRamiUKQFly1k0pQjy8zaeYkxopVCdUVWmPo4Nqeex0030Zxmibo'); // varun test
//  Publish key:- pk_live_51Kr67EJsxpRH9smizUjNERPVsq1hlJBnnJsfCOqNTPL6HKgsG9YTOOcA5yYk38O7Wz2NILGPvIKkxe3rU90iix610049htYt1w
//  pk_test_51Kr67EJsxpRH9smiVHbxmogutwO92w8dmTUErkRtIsIo0lR7kyfyeVnULRoQlry9byYbS8Uhk5Mq4xegT2bB9n9F00hv3OFGM5
//  sk_test_51Kr67EJsxpRH9smipLQrIzDFv69P1b1pPk96ba1A4HJGYJEaR7cpAaU4pkCeAIMT9B46D7amC77I3eNEBTIRF2e800Y7zIPNTS
exports.registration = async (req, res) => {
        try {
                if (req.body.refferalCode == null || req.body.refferalCode == undefined) {
                        let findUser = await User.findOne({ $and: [{ $or: [{ email: req.body.email }, { phone: req.body.phone }] }] });
                        if (findUser) {
                                return res.status(409).send({ status: 409, message: "User already registed with these details. ", data: {}, });
                        } else {
                                req.body.otp = newOTP.generate(4, { alphabets: false, upperCase: false, specialChar: false, });
                                req.body.otpExpiration = new Date(Date.now() + 5 * 60 * 1000);
                                req.body.accountVerification = false;
                                req.body.refferalCode = await reffralCode();
                                req.body.password = bcrypt.hashSync(req.body.password, 8);
                                req.body.userType = "USER";
                                const userCreate = await User.create(req.body);
                                if (userCreate) {
                                        let obj = {
                                                user: userCreate._id,
                                                code: await reffralCode(),
                                                title: "$50 Off",
                                                description: "Get $50 Off upon Competing your 5 visit",
                                                discount: 50,
                                                per: "Amount",
                                                completeVisit: 5,
                                        }
                                        const userCreatea = await coupanModel.create(obj);
                                        if (userCreatea) {
                                                return res.status(200).send({ status: 200, message: "Registered successfully ", data: userCreate, });
                                        }
                                }
                        }
                } else {
                        const findUser = await User.findOne({ refferalCode: req.body.refferalCode });
                        if (findUser) {
                                let findUser1 = await User.findOne({ $and: [{ $or: [{ email: req.body.email }, { phone: req.body.phone }] }] });
                                if (findUser1) {
                                        return res.status(409).send({ status: 409, message: "User already registed with these details. ", data: {}, });
                                } else {
                                        req.body.otp = newOTP.generate(4, { alphabets: false, upperCase: false, specialChar: false, });
                                        req.body.otpExpiration = new Date(Date.now() + 5 * 60 * 1000);
                                        req.body.accountVerification = false;
                                        req.body.userType = "USER";
                                        req.body.refferalCode = await reffralCode();
                                        req.body.refferUserId = findUser._id;
                                        req.body.password = bcrypt.hashSync(req.body.password, 8);
                                        const userCreate = await User.create(req.body);
                                        if (userCreate) {
                                                let obj = {
                                                        user: findUser._id,
                                                        code: await reffralCode(),
                                                        title: "$100 Off",
                                                        description: "Get $100 Off refer your friend.",
                                                        discount: 100,
                                                        per: "Amount",
                                                        completeVisit: 0,
                                                }
                                                const userCreatea = await coupanModel.create(obj);
                                                if (userCreatea) {
                                                        let updateWallet = await User.findOneAndUpdate({ _id: findUser._id }, { $push: { joinUser: userCreate._id } }, { new: true });
                                                        return res.status(200).send({ status: 200, message: "Registered successfully ", data: userCreate, });
                                                }
                                        }
                                }
                        } else {
                                return res.status(404).send({ status: 404, message: "Invalid refferal code", data: {} });
                        }
                }
        } catch (error) {
                console.error(error);
                return res.status(500).json({ message: "Server error" });
        }
};
exports.registrationforApp = async (req, res) => {
        try {
                if (req.body.refferalCode == null || req.body.refferalCode == undefined) {
                        let findUser = await User.findOne({ $and: [{ $or: [{ email: req.body.email }, { phone: req.body.phone }] }] });
                        if (findUser) {
                                return res.status(409).send({ status: 409, message: "User already registed with these details. ", data: {}, });
                        } else {
                                req.body.otp = newOTP.generate(4, { alphabets: false, upperCase: false, specialChar: false, });
                                req.body.otpExpiration = new Date(Date.now() + 5 * 60 * 1000);
                                req.body.accountVerification = false;
                                req.body.refferalCode = await reffralCode();
                                req.body.password = bcrypt.hashSync(req.body.password, 8);
                                req.body.userType = "USER";
                                const userCreate = await User.create(req.body);
                                if (userCreate) {
                                        return res.status(200).send({ status: 200, message: "Registered successfully ", data: userCreate, });
                                }
                        }
                } else {
                        const findUser = await User.findOne({ refferalCode: req.body.refferalCode });
                        if (findUser) {
                                let findUser1 = await User.findOne({ $and: [{ $or: [{ email: req.body.email }, { phone: req.body.phone }] }] });
                                if (findUser1) {
                                        return res.status(409).send({ status: 409, message: "User already registed with these details. ", data: {}, });
                                } else {
                                        req.body.otp = newOTP.generate(4, { alphabets: false, upperCase: false, specialChar: false, });
                                        req.body.otpExpiration = new Date(Date.now() + 5 * 60 * 1000);
                                        req.body.accountVerification = false;
                                        req.body.userType = "USER";
                                        req.body.refferalCode = await reffralCode();
                                        req.body.refferUserId = findUser._id;
                                        req.body.password = bcrypt.hashSync(req.body.password, 8);
                                        const userCreate = await User.create(req.body);
                                        if (userCreate) {
                                                if (findUser.userType == "ADMIN") {
                                                        const data = await banner.findOne({ type: 'Promotion' })
                                                        let obj = {
                                                                user: findUser._id,
                                                                code: await reffralCode(),
                                                                title: "Download App from Playstore Through website",
                                                                description: data.desc,
                                                                discount: data.off,
                                                                per: "Percentage",
                                                                completeVisit: 0,
                                                        }
                                                        const userCreatea = await coupanModel.create(obj);
                                                        if (userCreatea) {
                                                                let updateWallet = await User.findOneAndUpdate({ _id: findUser._id }, { $push: { joinUser: userCreate._id } }, { new: true });
                                                                return res.status(200).send({ status: 200, message: "Registered successfully ", data: userCreate, });
                                                        }
                                                } else {
                                                        let obj = {
                                                                user: findUser._id,
                                                                code: await reffralCode(),
                                                                title: "Get a discount coupon of worth $300. After you refer your friend.",
                                                                description: data.desc,
                                                                discount: 300,
                                                                per: "Amount",
                                                                completeVisit: 0,
                                                        }
                                                        const userCreatea = await coupanModel.create(obj);
                                                        if (userCreatea) {
                                                                let updateWallet = await User.findOneAndUpdate({ _id: findUser._id }, { $push: { joinUser: userCreate._id } }, { new: true });
                                                                return res.status(200).send({ status: 200, message: "Registered successfully ", data: userCreate, });
                                                        }
                                                        return res.status(200).send({ status: 200, message: "Registered successfully ", data: userCreate, });
                                                }
                                        }
                                }
                        } else {
                                return res.status(404).send({ status: 404, message: "Invalid refferal code", data: {} });
                        }
                }
        } catch (error) {
                console.error(error);
                return res.status(500).json({ message: "Server error" });
        }
};
exports.signin = async (req, res) => {
        try {
                const { phone, countryCode, password, deviceToken } = req.body;
                const user = await User.findOne({ phone: phone, userType: "USER" });
                if (!user) {
                        return res.status(404).send({ message: "user not found ! not registered" });
                }
                const isValidPassword = bcrypt.compareSync(password, user.password);
                if (!isValidPassword) {
                        return res.status(401).send({ message: "Wrong password" });
                }
                const accessToken = jwt.sign({ id: user._id }, authConfig.secret, { expiresIn: authConfig.accessTokenTime });
                if (deviceToken != (null || undefined)) {
                        await User.findByIdAndUpdate({ _id: user._id }, { $set: { deviceToken: deviceToken } }, { new: true });
                }
                let obj = { firstName: user.firstName, lastName: user.lastName, phone: user.phone, email: user.email, userType: user.userType, }
                return res.status(201).send({ data: obj, accessToken: accessToken });
        } catch (error) {
                console.error(error);
                return res.status(500).send({ message: "Server error" + error.message });
        }
};
exports.forgetPassword = async (req, res) => {
        try {
                const data = await User.findOne({ email: req.body.email });
                if (!data) {
                        return res.status(400).send({ msg: "not found" });
                } else {
                        let otp = newOTP.generate(4, { alphabets: false, upperCase: false, specialChar: false, });
                        var transporter = nodemailer.createTransport({
                                service: 'gmail',
                                auth: {
                                        "user": "info@shahinahoja.com",
                                        "pass": "gganlypsemwqhwlh"
                                }
                        });
                        let mailOptions;
                        mailOptions = {
                                from: 'info@shahinahoja.com',
                                to: req.body.email,
                                subject: 'Forget password verification',
                                text: `Your Account Verification Code is ${otp}`,
                        };
                        let info = await transporter.sendMail(mailOptions);
                        if (info) {
                                let accountVerification = false;
                                let otpExpiration = new Date(Date.now() + 5 * 60 * 1000);
                                const updated = await User.findOneAndUpdate({ _id: data._id }, { $set: { accountVerification: accountVerification, otp: otp, otpExpiration: otpExpiration } }, { new: true, });
                                if (updated) {
                                        return res.status(200).json({ message: "Otp send to your email.", status: 200, data: updated });
                                }
                        } else {
                                return res.status(200).json({ message: "Otp not send on your mail please check.", status: 200, data: {} });
                        }
                }
        } catch (err) {
                console.log(err.message);
                return res.status(500).send({ msg: "internal server error", error: err.message, });
        }
};
exports.forgotVerifyotp = async (req, res) => {
        try {
                const { otp } = req.body;
                const user = await User.findOne({ email: req.body.email });
                if (!user) {
                        return res.status(404).send({ message: "user not found" });
                }
                if (user.otp !== otp || user.otpExpiration < Date.now()) {
                        return res.status(400).json({ message: "Invalid OTP" });
                }
                const updated = await User.findByIdAndUpdate({ _id: user._id }, { accountVerification: true }, { new: true });
                let obj = { userId: updated._id, otp: updated.otp, }
                return res.status(200).send({ status: 200, message: "Verify otp successfully", data: obj });
        } catch (err) {
                console.log(err.message);
                return res.status(500).send({ error: "internal server error" + err.message });
        }
};
exports.changePassword = async (req, res) => {
        try {
                const user = await User.findOne({ _id: req.params.id });
                if (user) {
                        if (req.body.newPassword == req.body.confirmPassword) {
                                const updated = await User.findOneAndUpdate({ _id: user._id }, { $set: { password: bcrypt.hashSync(req.body.newPassword), accountVerification: true } }, { new: true });
                                return res.status(200).send({ message: "Password update successfully.", data: updated, });
                        } else {
                                return res.status(501).send({ message: "Password Not matched.", data: {}, });
                        }
                } else {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.resendOTP = async (req, res) => {
        const { id } = req.params;
        try {
                const user = await User.findOne({ _id: id, userType: "USER" });
                if (!user) {
                        return res.status(404).send({ status: 404, message: "User not found" });
                }
                const otp = newOTP.generate(4, { alphabets: false, upperCase: false, specialChar: false, });
                const otpExpiration = new Date(Date.now() + 5 * 60 * 1000);
                const accountVerification = false;
                const updated = await User.findOneAndUpdate({ _id: user._id }, { otp, otpExpiration, accountVerification }, { new: true });
                let obj = {
                        id: updated._id,
                        otp: updated.otp,
                        phone: updated.phone
                }
                return res.status(200).send({ status: 200, message: "OTP resent", data: obj });
        } catch (error) {
                console.error(error);
                return res.status(500).send({ status: 500, message: "Server error" + error.message });
        }
};
exports.verifyOtp = async (req, res) => {
        try {
                const { otp } = req.body;
                const user = await User.findById(req.params.id);
                if (!user) {
                        return res.status(404).send({ message: "user not found" });
                }
                if (user.otp !== otp || user.otpExpiration < Date.now()) {
                        return res.status(400).json({ message: "Invalid OTP" });
                }
                const updated = await User.findByIdAndUpdate({ _id: user._id }, { accountVerification: true }, { new: true });
                const accessToken = await jwt.sign({ id: user._id }, authConfig.secret, {
                        expiresIn: authConfig.accessTokenTime,
                });
                let obj = {
                        userId: updated._id,
                        otp: updated.otp,
                        phone: updated.phone,
                        token: accessToken,
                }
                return res.status(200).send({ status: 200, message: "logged in successfully", data: obj });
        } catch (err) {
                console.log(err.message);
                return res.status(500).send({ error: "internal server error" + err.message });
        }
};
exports.getProfile = async (req, res) => {
        try {
                const data = await User.findOne({ _id: req.user._id, }).select('-password').populate('subscriptionId');
                if (data) {
                        return res.status(200).json({ status: 200, message: "get Profile", data: data });
                } else {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.checkSession = async (req, res) => {
        try {
                const token = req.get("Authorization")?.split("Bearer ")[1] || req.headers["x-access-token"];
                if (!token) {
                        return res.status(401).send({ status: 401, message: "Please Login to Continue.", data: false });
                } else {
                        jwt.verify(token, authConfig.secret, async (err, decoded) => {
                                if (err) {
                                        return res.status(401).send({ status: 401, message: "Please Login to Continue.", data: false });
                                }
                                const user = await User.findOne({ _id: decoded.id });
                                const user1 = await User.findOne({ _id: decoded.id });
                                if (!user && !user1) {
                                        return res.status(401).send({ status: 401, message: "Please Login to Continue.", data: false });
                                } else {
                                        return res.status(200).send({ status: 200, message: "", data: true });
                                }
                        });
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.updateProfile = async (req, res) => {
        try {
                const data = await User.findOne({ _id: req.user._id, });
                if (data) {
                        let image;
                        if (req.file) {
                                image = req.file.path
                        }
                        let obj = {
                                firstName: req.body.firstName || data.firstName,
                                lastName: req.body.lastName || data.lastName,
                                fullName: req.body.fullName || data.fullName,
                                email: req.body.email || data.email,
                                countryCode: req.body.countryCode || data.countryCode,
                                phone: req.body.phone || data.phone,
                                gender: req.body.gender || data.gender,
                                dob: req.body.dob || data.dob,
                                image: image || data.image
                        }
                        console.log(obj);
                        let update = await User.findByIdAndUpdate({ _id: data._id }, { $set: obj }, { new: true });
                        if (update) {
                                return res.status(200).json({ status: 200, message: "Update profile successfully.", data: update });
                        }
                } else {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.checkIn = async (req, res) => {
        try {
                const data = await User.findOne({ _id: req.user._id, });
                if (data) {
                        if (data.checkIn > 0) {
                                let update = await User.findByIdAndUpdate({ _id: data._id }, { $set: { totalVisit: data.totalVisit + 1, checkIn: data.checkIn - 1, orderVisit: data.orderVisit + 1, firstVisit: 1 } }, { new: true });
                                if (update) {
                                        return res.status(200).json({ status: 200, message: "CheckIn successfully.", data: update });
                                }
                        } else {
                                let update = await User.findByIdAndUpdate({ _id: data._id }, { $set: { totalVisit: data.totalVisit + 1, firstVisit: 1 } }, { new: true });
                                if (update) {
                                        return res.status(200).json({ status: 200, message: "CheckIn successfully.", data: update });
                                }
                        }
                } else {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.removeProfile = async (req, res) => {
        try {
                const data = await User.findOne({ _id: req.user._id, });
                if (data) {
                        let obj = {
                                image: ""
                        }
                        let update = await User.findByIdAndUpdate({ _id: data._id }, { $set: obj }, { new: true });
                        if (update) {
                                return res.status(200).json({ status: 200, message: "Remove profile successfully.", data: update });
                        }
                } else {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.socialLogin = async (req, res) => {
        try {
                const { firstName, lastName, email, phone } = req.body;
                console.log(req.body);
                const user = await User.findOne({ $and: [{ $or: [{ email }, { phone }] }, { userType: "USER" }] });
                if (user) {
                        jwt.sign({ id: user._id }, authConfig.secret, (err, token) => {
                                if (err) {
                                        return res.status(401).send("Invalid Credentials");
                                } else {
                                        return res.status(200).json({ status: 200, msg: "Login successfully", userId: user._id, token: token, });
                                }
                        });
                } else {
                        let refferalCode = await reffralCode();
                        const newUser = await User.create({ firstName, lastName, phone, email, refferalCode, userType: "USER" });
                        if (newUser) {
                                jwt.sign({ id: newUser._id }, authConfig.secret, (err, token) => {
                                        if (err) {
                                                return res.status(401).send("Invalid Credentials");
                                        } else {
                                                console.log(token);
                                                return res.status(200).json({ status: 200, msg: "Login successfully", userId: newUser._id, token: token, });
                                        }
                                });
                        }
                }
        } catch (err) {
                console.error(err);
                return createResponse(res, 500, "Internal server error");
        }
};
exports.createAddress = async (req, res, next) => {
        try {
                const data = await User.findOne({ _id: req.user._id, });
                if (data) {
                        if (data.userType == "ADMIN") {
                                const data1 = await Address.findOne({ admin: data._id, addressType: req.body.addressType });
                                if (data1) {
                                        const newAddressData = req.body;
                                        req.body.type = "Admin"
                                        let update = await Address.findByIdAndUpdate(data1._id, newAddressData, { new: true, });
                                        return res.status(200).json({ status: 200, message: "Address update successfully.", data: update });
                                } else {
                                        req.body.admin = data._id;
                                        req.body.type = "Admin"
                                        const address = await Address.create(req.body);
                                        return res.status(200).json({ message: "Address create successfully.", data: address });
                                }
                        }
                        if (data.userType == "USER") {
                                const data1 = await Address.findOne({ user: data._id, addressType: req.body.addressType });
                                if (data1) {
                                        req.body.type = "User"
                                        const newAddressData = req.body;
                                        let update = await Address.findByIdAndUpdate(data1._id, newAddressData, { new: true, });
                                        return res.status(200).json({ status: 200, message: "Address update successfully.", data: update });
                                } else {
                                        req.body.user = data._id;
                                        req.body.type = "User"
                                        const address = await Address.create(req.body);
                                        return res.status(200).json({ message: "Address create successfully.", data: address });
                                }
                        }
                } else {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.getallAddress = async (req, res, next) => {
        try {
                const data = await User.findOne({ _id: req.user._id, });
                if (data) {
                        const allAddress = await Address.find({ user: data._id });
                        return res.status(200).json({ message: "Address data found.", data: allAddress });
                } else {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.deleteAddress = async (req, res, next) => {
        try {
                const data = await User.findOne({ _id: req.user._id, });
                if (data) {
                        const data1 = await Address.findById({ _id: req.params.id });
                        if (data1) {
                                let update = await Address.findByIdAndDelete(data1._id);
                                return res.status(200).json({ status: 200, message: "Address Deleted Successfully", });
                        } else {
                                return res.status(404).json({ status: 404, message: "No data found", data: {} });
                        }
                } else {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.getAddressbyId = async (req, res, next) => {
        try {
                const data = await User.findOne({ _id: req.user._id, });
                if (data) {
                        const data1 = await Address.findById({ _id: req.params.id });
                        if (data1) {
                                return res.status(200).json({ status: 200, message: "Address found successfully.", data: data1 });
                        } else {
                                return res.status(404).json({ status: 404, message: "No data found", data: {} });
                        }
                } else {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.getSubscription = async (req, res) => {
        try {
                const findSubscription = await Subscription.find();
                return res.status(200).json({ status: 200, message: "Subscription detail successfully.", data: findSubscription });
        } catch (err) {
                return res.status(500).json({ message: err.message });
        }
};
exports.getSubscriptionApp = async (req, res) => {
        try {
                const data = await User.findOne({ _id: req.user._id, isSubscription: true });
                if (data) {
                        const findSubscription = await Subscription.find();
                        const modifiedSubscriptions = findSubscription.map(sub => {
                                return {
                                        ...sub.toObject(),
                                        isUserSubscribed: sub._id.equals(data.subscriptionId),
                                };
                        });
                        return res.status(200).json({ status: 200, message: "Subscription detail successfully.", data: modifiedSubscriptions, });
                } else {
                        const findSubscription = await Subscription.find();
                        const modifiedSubscriptions = findSubscription.map(sub => {
                                return {
                                        ...sub.toObject(),
                                        isUserSubscribed: false,
                                };
                        });
                        return res.status(200).json({ status: 200, message: "Subscription detail successfully.", data: modifiedSubscriptions, });
                }
        } catch (err) {
                return res.status(500).json({ message: err.message });
        }
};
exports.takeSubscription = async (req, res) => {
        try {
                const user = await User.findOne({ _id: req.user._id, });
                if (!user) {
                        return res.status(404).send({ status: 404, message: "User not found" });
                } else {
                        let id = req.params.id;
                        const findSubscription = await Subscription.findById(id);
                        if (findSubscription) {
                                const findTransaction = await transactionModel.findOne({ user: user._id, type: "Subscription", Status: "pending" });
                                if (findTransaction) {
                                        let deleteData = await transactionModel.findByIdAndDelete({ _id: findTransaction._id })
                                        let obj = {
                                                user: user._id,
                                                subscriptionId: findSubscription._id,
                                                amount: findSubscription.price,
                                                paymentMode: req.body.paymentMode,
                                                type: "Subscription",
                                                Status: "pending",
                                        }
                                        let update = await transactionModel.create(obj);
                                        if (update) {
                                                return res.status(200).send({ status: 200, message: "update successfully.", data: update });
                                        }
                                } else {
                                        let obj = {
                                                user: user._id,
                                                subscriptionId: findSubscription._id,
                                                amount: findSubscription.price,
                                                paymentMode: req.body.paymentMode,
                                                type: "Subscription",
                                                Status: "pending",
                                        }
                                        let update = await transactionModel.create(obj);
                                        if (update) {
                                                return res.status(200).send({ status: 200, message: "update successfully.", data: update });
                                        }
                                }
                        } else {
                                return res.status(404).send({ status: 404, message: "Subscription not found" });
                        }
                }
        } catch (error) {
                console.error(error);
                return res.status(500).send({ status: 500, message: "Server error" + error.message });
        }
};
exports.verifySubscription = async (req, res) => {
        try {
                const user = await User.findOne({ _id: req.user._id, });
                if (!user) {
                        return res.status(404).send({ status: 404, message: "User not found" });
                } else {
                        let findTransaction = await transactionModel.findById({ _id: req.params.transactionId, type: "Subscription", Status: "pending", });
                        if (findTransaction) {
                                if (req.body.Status == "Paid") {
                                        let update = await transactionModel.findByIdAndUpdate({ _id: findTransaction._id }, { $set: { Status: "Paid" } }, { new: true });
                                        if (update) {
                                                const findSubscription = await Subscription.findById(update.subscriptionId);
                                                if (findSubscription) {
                                                        let subscriptionExpiration = new Date(Date.now() + (findSubscription.month * 30 * 24 * 60 * 60 * 1000))
                                                        console.log(subscriptionExpiration);
                                                        let updateUser = await User.findByIdAndUpdate({ _id: user._id }, { $set: { subscriptionId: findTransaction.subscriptionId, isSubscription: true, subscriptionExpiration: subscriptionExpiration } }, { new: true })
                                                        return res.status(200).send({ status: 200, message: 'subscription subscribe successfully.', data: update })
                                                }
                                        }
                                }
                                if (req.body.Status == "failed") {
                                        let update = await transactionModel.findByIdAndUpdate({ _id: findTransaction._id }, { $set: { Status: "failed" } }, { new: true });
                                        if (update) {
                                                return res.status(200).send({ status: 200, message: 'subscription not subscribe successfully.', data: update });
                                        }
                                }
                        } else {
                                return res.status(404).send({ status: 404, message: "Transaction not found" });
                        }
                }
        } catch (error) {
                console.error(error);
                return res.status(500).send({ status: 500, message: "Server error" + error.message });
        }
};
exports.getAllcoupan = async (req, res, next) => {
        try {
                const cart = await coupanModel.find({ $or: [{ user: req.user._id }, { email: req.user.email }] });
                if (!cart) {
                        return res.status(200).json({ success: false, msg: "Get all rewards.", cart: {} })
                } else {
                        return res.status(200).json({ success: true, msg: "Get all rewards.", cart: cart })
                }
        } catch (error) {
                console.log(error)
                next(error);
        }
}
exports.getOnSaleService = async (req, res, next) => {
        try {
                const productsCount = await services.count();
                if (req.query.search != (null || undefined)) {
                        let apiFeature = await services.aggregate([
                                {
                                        $lookup: { from: "categories", localField: "categoryId", foreignField: "_id", as: "categoryId" },
                                },
                                { $unwind: "$categoryId" },
                                {
                                        $match: {
                                                $or: [
                                                        { "categoryId.name": { $regex: req.query.search, $options: "i" }, },
                                                        { "name": { $regex: req.query.search, $options: "i" }, },
                                                        { "description": { $regex: req.query.search, $options: "i" }, },
                                                ]
                                        },
                                        $match: { "type": "offer" },
                                },
                        ]);
                        return res.status(200).json({ status: 200, message: "Product data found.", data: apiFeature, count: productsCount });
                } else {
                        let apiFeature = await services.aggregate([
                                { $lookup: { from: "categories", localField: "categoryId", foreignField: "_id", as: "categoryId" } },
                                { $unwind: "$categoryId" },
                                { $match: { "type": "offer" } },
                        ]);
                        return res.status(200).json({ status: 200, message: "Product data found.", data: apiFeature, count: productsCount });
                }
        } catch (err) {
                console.log(err);
                return res.status(500).send({ message: "Internal server error while creating Product", });
        }
};
exports.getServiceByTokenFormembership = async (req, res, next) => {
        try {
                const servicesList = await services.find({ categoryId: req.query.categoryId, type: "Service" }).populate('categoryId');
                const servicesWithDynamicFields = [];
                const userData = await User.findOne({ _id: req.user._id, }).select('-password').populate('subscriptionId');
                for (const service of servicesList) {
                        console.log(service);
                        let membshipPrice = 0;
                        if ((userData.isSubscription == true) && (userData.subscriptionId != (null || undefined))) {
                                membshipPrice = 0;
                                membershipDiscount = (parseFloat(service.price) * parseFloat((userData.subscriptionId.discount / 100).toFixed(2)));
                                membshipPrice = (parseFloat(service.price) - parseFloat(membershipDiscount).toFixed(2));
                        } else {
                                membshipPrice = 0;
                        }
                        const serviceWithDynamicFields = {
                                ...service.toObject(),
                                membshipPrice,
                        };
                        servicesWithDynamicFields.push(serviceWithDynamicFields);
                }
                return res.status(200).json({ status: 200, message: "Services data found.", data: servicesWithDynamicFields, });
        } catch (err) {
                console.log(err);
                return res.status(500).send({ message: "Internal server error while fetching services" });
        }
};
exports.getProductOrders = async (req, res, next) => {
        try {
                const orders = await productOrder.find({ user: req.user._id, orderStatus: "confirmed" }).populate([
                        { path: "products.productId", select: 'name description size sizePrice price productImages ratings numOfReviews' },
                        { path: 'frequentlyBuyProductSchema.frequentlyBuyProductId', populate: { path: 'products', model: 'Product' }, },
                        { path: "coupon", select: "couponCode discount expirationDate" },]);
                if (orders.length == 0) {
                        return res.status(404).json({ status: 404, message: "Orders not found", data: {} });
                }
                return res.status(200).json({ status: 200, msg: "orders of user", data: orders })
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.getProductOrderbyId = async (req, res, next) => {
        try {
                const orders = await productOrder.findById({ _id: req.params.id }).populate([
                        { path: "products.productId", select: { reviews: 0 } },
                        { path: 'frequentlyBuyProductSchema.frequentlyBuyProductId', populate: { path: 'products', model: 'Product' }, },
                        { path: "coupon", select: "couponCode discount expirationDate" },]);
                if (!orders) {
                        return res.status(404).json({ status: 404, message: "Orders not found", data: {} });
                }
                return res.status(200).json({ status: 200, msg: "orders of user", data: orders })
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.getServiceOrders = async (req, res, next) => {
        try {
                if (req.query.serviceStatus != (null || undefined)) {
                        const orders = await serviceOrder.find({ user: req.user._id, orderStatus: { $ne: "unconfirmed" }, serviceStatus: req.query.serviceStatus }).populate([{ path: "AddOnservicesSchema.addOnservicesId", select: { reviews: 0 } }, { path: "services.serviceId", select: { reviews: 0 } }, { path: "coupon", select: "couponCode discount expirationDate" },]);
                        if (orders.length == 0) {
                                return res.status(404).json({ status: 404, message: "Orders not found", data: {} });
                        }
                        return res.status(200).json({ status: 200, msg: "orders of user", data: orders })
                } else {
                        const orders = await serviceOrder.find({ user: req.user._id, orderStatus: { $ne: "unconfirmed" } }).populate([{ path: "AddOnservicesSchema.addOnservicesId", select: { reviews: 0 } }, { path: "services.serviceId", select: { reviews: 0 } }, { path: "coupon", select: "couponCode discount expirationDate" },]);
                        if (orders.length == 0) {
                                return res.status(404).json({ status: 404, message: "Orders not found", data: {} });
                        }
                        return res.status(200).json({ status: 200, msg: "orders of user", data: orders })
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.getServiceOrderbyId = async (req, res, next) => {
        try {
                const orders = await serviceOrder.findById({ _id: req.params.id }).populate([{ path: "user", }, { path: "AddOnservicesSchema.addOnservicesId", select: { reviews: 0 } }, { path: "services.serviceId", select: { reviews: 0 } }, { path: "coupon", select: "couponCode discount expirationDate" },]);
                if (!orders) {
                        return res.status(404).json({ status: 404, message: "Orders not found", data: {} });
                }
                let saveCart = await serviceOrder.findOne({ _id: orders._id }).populate([{ path: "user", }, { path: "AddOnservicesSchema.addOnservicesId", select: { reviews: 0 } }, { path: "services.serviceId", select: { reviews: 0 } }, { path: "coupon", select: "couponCode discount expirationDate used per" },]);
                let offerDiscount = 0, membershipDiscount = 0, membershipDiscountPercentage = 0, total = 0, subTotal = 0;
                if (saveCart.services.length > 0) {
                        for (const cartProduct of saveCart.services) {
                                if (cartProduct.serviceId.type === "offer") {
                                        cartProduct.subTotal = parseFloat((cartProduct.serviceId.price * cartProduct.quantity).toFixed(2));
                                        cartProduct.total = parseFloat((cartProduct.price * cartProduct.quantity).toFixed(2));
                                        cartProduct.offerDiscount = parseFloat(((cartProduct.serviceId.price - cartProduct.price) * cartProduct.quantity).toFixed(2));
                                        offerDiscount += cartProduct.offerDiscount;
                                        subTotal += cartProduct.subTotal;
                                        total += cartProduct.total;
                                }
                                if (cartProduct.serviceId.type === "Service") {
                                        if (cartProduct.serviceId.multipleSize == true) {
                                                let x = 0
                                                cartProduct.membershipDiscount = parseFloat(x.toFixed(2))
                                                membershipDiscount += x;
                                                cartProduct.subTotal = parseFloat((cartProduct.price * cartProduct.quantity).toFixed(2));
                                                cartProduct.total = parseFloat((cartProduct.price * cartProduct.quantity).toFixed(2) - x);
                                                cartProduct.offerDiscount = 0.00;
                                                offerDiscount += cartProduct.offerDiscount;
                                                total += cartProduct.total;
                                                subTotal += cartProduct.subTotal;
                                        } else {
                                                let x = 0
                                                cartProduct.membershipDiscount = parseFloat(x.toFixed(2))
                                                membershipDiscount += x;
                                                cartProduct.subTotal = parseFloat((cartProduct.price * cartProduct.quantity).toFixed(2));
                                                cartProduct.total = parseFloat((cartProduct.price * cartProduct.quantity).toFixed(2) - x);
                                                cartProduct.offerDiscount = 0.00;
                                                offerDiscount += cartProduct.offerDiscount;
                                                total += cartProduct.total;
                                                subTotal += cartProduct.subTotal;
                                        }
                                }
                        }
                }
                if (saveCart.AddOnservicesSchema.length > 0) {
                        saveCart.AddOnservicesSchema.forEach((cartGift) => {
                                cartGift.total = parseFloat((cartGift.price * cartGift.quantity).toFixed(2));
                                cartGift.subTotal = parseFloat((cartGift.price * cartGift.quantity).toFixed(2));
                                subTotal += cartGift.subTotal;
                                total += cartGift.total;
                        });
                }
                const totalPromises = saveCart.services.map(async (service) => {
                        return service.totalMin * service.quantity;
                });
                const totalPromises1 = saveCart.AddOnservicesSchema.map(async (service) => {
                        return service.totalMin * service.quantity;
                });
                const [totalArray, totalArray1] = await Promise.all([Promise.all(totalPromises), Promise.all(totalPromises1)]);
                const totalTime = totalArray.concat(totalArray1).reduce((total, value) => {
                        return total + value;
                }, 0);
                var dateTimeString = saveCart.toTime;
                var dateTimeObject = new Date(dateTimeString);
                let d = dateTimeObject.toISOString().split('T')[0];
                var hours1 = dateTimeObject.getUTCHours();
                var minutes1 = dateTimeObject.getUTCMinutes();
                const hours = parseInt(hours1);
                const minutes = parseInt(minutes1);
                const providedTimeInMinutes = hours * 60 + minutes;
                let fromTimeInMinutes = providedTimeInMinutes + totalTime;
                const fromTime = new Date(d);
                saveCart.fromTime = fromTime;
                saveCart.memberShipPer = Number(membershipDiscountPercentage);
                saveCart.memberShip = parseFloat(membershipDiscount).toFixed(2)
                saveCart.offerDiscount = Number(offerDiscount);
                saveCart.subTotal = subTotal;
                saveCart.total = total;
                if (totalTime > 0) {
                        var hours2 = Math.floor(totalTime / 60);
                        var minutes2 = totalTime % 60;
                        let timeInMin = hours2 + "hr" + " " + minutes2 + "min"
                        saveCart.timeInMin = timeInMin;
                }
                await saveCart.save();
                return res.status(200).json({ status: 200, msg: "orders of user", data: saveCart })
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.cancelMemberShip = async (req, res) => {
        try {
                const user = await User.findOne({ _id: req.user._id, });
                if (!user) {
                        return res.status(404).send({ status: 404, message: "User not found" });
                } else {
                        let updateUser = await User.findByIdAndUpdate({ _id: user._id }, { $set: { isSubscription: false } }, { new: true })
                        if (updateUser) {
                                let obj = {
                                        user: user._id,
                                        reason: req.body.reason,
                                        type: req.body.type,
                                }
                                let saveOrder1 = await memshipCancel.create(obj);
                                if (saveOrder1) {
                                        return res.status(200).send({ status: 200, message: 'subscription cancel successfully.', data: updateUser })
                                }
                        }
                }
        } catch (error) {
                console.error(error);
                return res.status(500).send({ status: 500, message: "Server error" + error.message });
        }
};
exports.getRecentlyServicesView = async (req, res, next) => {
        try {
                const cart = await recentlyView.find({ user: req.user._id, type: "S" }).populate({ path: "services", select: "name images price discountPrice discount" }).sort({ "updateAt": -1 });
                if (!cart) {
                        return res.status(200).json({ success: false, msg: "No recentlyView", cart: {} });
                }
                return res.status(200).json({ success: true, msg: "recentlyView retrieved successfully", cart: cart });
        } catch (error) {
                console.log(error);
                next(error);
        }
};
exports.getRecentlyProductView = async (req, res, next) => {
        try {
                const cart = await recentlyView.find({ user: req.user._id, type: "P" }).populate({ path: "products", select: "name productImages price sizePrice" }).sort({ "updateAt": -1 });
                if (!cart) {
                        return res.status(200).json({ success: false, msg: "No recentlyView", cart: {} });
                }
                return res.status(200).json({ success: true, msg: "recentlyView retrieved successfully", cart: cart });
        } catch (error) {
                console.log(error);
                next(error);
        }
};
exports.overAllSearch = async (req, res) => {
        try {
                const query = req.query.search;
                const productResults = await product.find({ $or: [{ name: { $regex: query, $options: 'i' } },], })
                const serviceResults = await services.find({ $or: [{ name: { $regex: query, $options: 'i' } }], });
                const response = {
                        products: productResults.map((product) => ({
                                type: 'product',
                                data: product,
                        })),
                        services: serviceResults.map((service) => ({
                                type: 'service',
                                data: service,
                        })),
                };
                return res.status(200).json({ message: "Search result.", status: 200, data: response });
        } catch (error) {
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
}
exports.applyCoupan = async (req, res) => {
        try {
                let findCart = await Cart.findOne({ user: req.user._id });
                if (findCart) {
                        let findCoupan = await coupanModel.findOne({ code: req.body.couponCode });
                        if (!findCoupan) {
                                return res.status(404).json({ status: 404, message: "Coupan not found", data: {} });
                        } else {
                                if (findCoupan.used == true) {
                                        return res.status(404).json({ status: 404, message: "Coupan already used", data: {} });
                                } else {
                                        if (findCoupan.expirationDate > Date.now()) {
                                                return res.status(404).json({ status: 404, message: "Coupan expired", data: {} });
                                        } else {
                                                let update1 = await Cart.findByIdAndUpdate({ _id: findCart._id }, { $set: { coupon: findCoupan._id, couponUsed: true } }, { new: true });
                                                return res.status(200).json({ status: 200, message: "Coupan apply to cart Successfully.", data: update1 })
                                        }
                                }
                        }
                } else {
                        return res.status(404).json({ status: 404, message: "Cart is empty      .", data: {} });
                }
        } catch (error) {
                console.error(error);
                return res.status(500).send({ status: 500, message: "Server error" + error.message });
        }
};
exports.cancelBooking = async (req, res, next) => {
        try {
                const orders = await serviceOrder.findOne({ _id: req.params.id, }).populate('user');
                if (!orders) {
                        return res.status(404).json({ status: 404, message: "Orders not found", data: {} });
                }
                let update = await serviceOrder.findByIdAndUpdate({ _id: orders._id }, { $set: { orderStatus: "cancel", cancelReason: req.body.cancelReason } }, { new: true })
                if (update) {
                        if (req.body.mailSend != (null || undefined)) {
                                if (req.body.mailSend == "yes") {
                                        var transporter = nodemailer.createTransport({ service: 'gmail', auth: { "user": "info@shahinahoja.com", "pass": "gganlypsemwqhwlh" } });
                                        let mailOptions = {
                                                from: 'info@shahinahoja.com',
                                                to: orders.user.email,
                                                subject: 'Your booking has been cancelled.',
                                                text: `Your booking has been cancelled and booking id ${orders.orderId}`,
                                        };
                                        let info1 = await transporter.sendMail(mailOptions);
                                        if (info1) {
                                                return res.status(200).json({ status: 200, msg: "Booking cancel successfully.", data: update })
                                        } else {
                                                return res.status(200).json({ status: 200, msg: "Booking cancel successfully.", data: update })
                                        }
                                } else {
                                        return res.status(200).json({ status: 200, msg: "Booking cancel successfully.", data: update })
                                }
                        } else {
                                var transporter = nodemailer.createTransport({ service: 'gmail', auth: { "user": "info@shahinahoja.com", "pass": "gganlypsemwqhwlh" } });
                                let mailOptions = {
                                        from: 'info@shahinahoja.com',
                                        to: orders.user.email,
                                        subject: 'Your booking has been cancelled.',
                                        text: `Your booking has been cancelled and booking id ${orders.orderId}`,
                                };
                                let info1 = await transporter.sendMail(mailOptions);
                                if (info1) {
                                        return res.status(200).json({ status: 200, msg: "Booking cancel successfully.", data: update })
                                } else {
                                        return res.status(200).json({ status: 200, msg: "Booking cancel successfully.", data: update })
                                }
                        }
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.takeSubscriptionFromWebsiteforRecurring = async (req, res) => {
        try {
                const user = await User.findOne({ _id: req.user._id });
                if (!user) {
                        return res.status(404).send({ status: 404, message: "User not found" });
                }
                const subscriptionId = user.subscriptionId;
                const findSubscription = await Subscription.findById(subscriptionId);
                if (!findSubscription) {
                        return res.status(404).send({ status: 404, message: "Subscription not found" });
                }
                let customer = await stripe.customers.list({
                        email: req.user.email,
                        limit: 1,
                });
                if (customer.data.length === 0) {
                        customer = await stripe.customers.create({
                                email: req.user.email,
                        });
                } else {
                        customer = customer.data[0];
                }
                const existingSubscriptions = await stripe.subscriptions.list({
                        customer: customer.id,
                });
                for (const subscription of existingSubscriptions.data) {
                        if (subscription.items.data.some(item => item.price.product === findSubscription.plan)) {
                                await stripe.subscriptions.update(subscription.id, {
                                        cancel_at_period_end: true,
                                });
                        }
                }
                const product = await stripe.products.create({ name: findSubscription.plan, });
                const price = await stripe.prices.create({
                        product: product.id,
                        unit_amount: findSubscription.price,
                        currency: 'usd',
                        recurring: {
                                interval: 'month',
                        },
                });
                const subscription = await stripe.subscriptions.create({
                        customer: customer.id,
                        items: [{ price: price.id }],
                });
                return res.status(200).json({ status: "success", subscription: subscription });
        } catch (error) {
                console.error(error);
                return res.status(500).send({ status: 500, message: "Server error: " + error.message });
        }
};
exports.takeSubscriptionFromWebsite = async (req, res) => {
        try {
                const user = await User.findOne({ _id: req.user._id, });
                if (!user) {
                        return res.status(404).send({ status: 404, message: "User not found" });
                } else {
                        let id = req.params.id;
                        const findSubscription = await Subscription.findById(id);
                        if (findSubscription) {
                                const findTransaction = await transactionModel.findOne({ user: user._id, type: "Subscription", Status: "pending" });
                                if (findTransaction) {
                                        let deleteData = await transactionModel.findByIdAndDelete({ _id: findTransaction._id })
                                        let obj = {
                                                user: user._id,
                                                subscriptionId: findSubscription._id,
                                                amount: findSubscription.price,
                                                paymentMode: req.body.paymentMode,
                                                type: "Subscription",
                                                Status: "pending",
                                        }
                                        let update = await transactionModel.create(obj);
                                        if (update) {
                                                let line_items = [];
                                                let obj2 = {
                                                        price_data: {
                                                                currency: "usd",
                                                                product_data: {
                                                                        name: `${findSubscription.plan} Subscription`,
                                                                },
                                                                unit_amount: `${Math.round(findSubscription.price * 100)}`,
                                                        },
                                                        quantity: 1,
                                                }
                                                line_items.push(obj2)
                                                const session = await stripe.checkout.sessions.create({
                                                        payment_method_types: ["card"],
                                                        success_url: `https://shahina-web.vercel.app/verifySubscription/${update._id}`,
                                                        cancel_url: `https://shahina-web.vercel.app/faildeSub/${update._id}`,
                                                        customer_email: req.user.email,
                                                        client_reference_id: update._id,
                                                        line_items: line_items,
                                                        mode: "payment",
                                                });
                                                return res.status(200).json({ status: "success", session: session, });
                                        }
                                } else {
                                        let obj = {
                                                user: user._id,
                                                subscriptionId: findSubscription._id,
                                                amount: findSubscription.price,
                                                paymentMode: req.body.paymentMode,
                                                type: "Subscription",
                                                Status: "pending",
                                        }
                                        let update = await transactionModel.create(obj);
                                        if (update) {
                                                let line_items = [];
                                                let obj2 = {
                                                        price_data: {
                                                                currency: "usd",
                                                                product_data: {
                                                                        name: `${findSubscription.plan} Subscription`,
                                                                },
                                                                unit_amount: `${Math.round(findSubscription.price * 100)}`,
                                                        },
                                                        quantity: 1,
                                                }
                                                line_items.push(obj2)
                                                const session = await stripe.checkout.sessions.create({
                                                        payment_method_types: ["card"],
                                                        success_url: `https://shahina-web.vercel.app/verifySubscription/${update._id}`,
                                                        cancel_url: `https://shahina-web.vercel.app/faildeSub/${update._id}`,
                                                        customer_email: req.user.email,
                                                        client_reference_id: update._id,
                                                        line_items: line_items,
                                                        mode: "payment",
                                                });
                                                return res.status(200).json({ status: "success", session: session, });
                                        }
                                }
                        } else {
                                return res.status(404).send({ status: 404, message: "Subscription not found" });
                        }
                }
        } catch (error) {
                console.error(error);
                return res.status(500).send({ status: 500, message: "Server error" + error.message });
        }
};
exports.deleteCartItem = async (req, res, next) => {
        try {
                const itemType = req.params.type;
                const itemId = req.params.id;
                let cart = await Cart.findOne({ user: req.user._id });
                if (!cart) {
                        return res.status(200).json({ success: false, msg: "Cart is empty", cart: {} });
                }
                const cartField = getCartFieldByItemType(itemType);
                if (!cartField) {
                        return res.status(400).json({ success: false, msg: "Invalid item type" });
                }
                if (req.body.priceId != (null || undefined)) {
                        const itemIndex = cart[cartField].findIndex((cartItem) => cartItem.priceId === req.body.priceId);
                        if (itemIndex === -1) {
                                return res.status(404).json({ success: false, msg: `${itemType} not found in cart`, cart: {} });
                        }
                        cart[cartField].splice(itemIndex, 1);
                        await cart.save();
                } else {
                        const itemIndex = cart[cartField].findIndex((cartItem) => cartItem[itemType + 'Id'].toString() === itemId);
                        if (itemIndex === -1) {
                                return res.status(404).json({ success: false, msg: `${itemType} not found in cart`, cart: {} });
                        }
                        cart[cartField].splice(itemIndex, 1);
                        await cart.save();
                }

                let cartResponse;
                if (cart.services.length > 0) {
                        cartResponse = await calculateCartResponse(cart, req.user._id, true);
                } else if (cart.products.length == 0 && cart.gifts.length == 0 && cart.frequentlyBuyProductSchema.length == 0 && cart.services.length == 0 && cart.AddOnservicesSchema.length == 0) {
                        return res.status(200).json({ success: false, msg: "Cart is empty", cart: {} });
                } else {
                        cartResponse = await calculateCartResponse(cart, req.user._id);
                }
                return res.status(200).json({ success: true, msg: `${itemType} removed from cart`, cart: cartResponse });
        } catch (error) {
                console.log(error);
                next(error);
        }
};
exports.updatePickupFromStore = async (req, res) => {
        try {
                const findUser = await User.findById({ _id: req.user._id });
                if (findUser) {
                        const cart = await Cart.findOne({ user: findUser._id });
                        if (!cart) {
                                return res.status(200).json({ success: false, msg: "cart", cart: {} })
                        } else {
                                if (cart.pickupFromStore == true) {
                                        const data = await Cart.findOneAndUpdate({ _id: cart._id }, { $set: { pickupFromStore: false } }, { new: true });
                                        return res.status(200).json({ success: true, details: data })
                                } else {
                                        const data = await Cart.findOneAndUpdate({ _id: cart._id }, { $set: { pickupFromStore: true } }, { new: true });
                                        return res.status(200).json({ success: true, details: data })
                                }
                        }
                } else {
                        return res.status(201).json({ status: 404, message: "User not found" })
                }
        } catch (err) {
                return res.status(400).json({ message: err.message })
        }
}
exports.addDateAndtimetoServiceCart = async (req, res) => {
        try {
                let userData = await User.findOne({ _id: req.user._id });
                if (!userData) {
                        return res.status(404).send({ status: 404, message: "User not found" });
                } else {
                        let findCart = await Cart.findOne({ user: userData._id }).populate([{ path: "AddOnservicesSchema.addOnservicesId", select: { reviews: 0 } }, { path: "services.serviceId", select: { reviews: 0 } },]);
                        if (findCart) {
                                const d = new Date(req.body.date);
                                let text = d.toISOString();
                                let totalTime = 0;
                                if (findCart.services.length > 0) {
                                        for (let i = 0; i < findCart.services.length; i++) {
                                                totalTime = totalTime + findCart.services[i].serviceId.totalMin;
                                        }
                                }
                                if (findCart.AddOnservicesSchema.length > 0) {
                                        for (let i = 0; i < findCart.AddOnservicesSchema.length; i++) {
                                                totalTime = totalTime + findCart.AddOnservicesSchema[i].addOnservicesId.totalMin;
                                        }
                                }
                                const timeArray = req.body.time.split(':');
                                const hours = parseInt(timeArray[0]);
                                const minutes = parseInt(timeArray[1]);
                                const providedTimeInMinutes = hours * 60 + minutes;
                                let fromTimeInMinutes = providedTimeInMinutes + totalTime + 30;
                                const fromTime = new Date(d);
                                fromTime.setMinutes(fromTimeInMinutes);
                                let x = `${req.body.date}T${req.body.time}:00.000Z`
                                let update = await Cart.findByIdAndUpdate({ _id: findCart._id }, { $set: { date: text, toTime: x, fromTime: fromTime, }, }, { new: true });
                                if (update) {
                                        return res.status(200).send({ status: 200, message: "Cart update successfully.", data: update });
                                }
                        } else {
                                return res.status(404).send({ status: 404, message: "Your cart is not found." });
                        }
                }
        } catch (error) {
                console.error(error);
                return res.status(500).send({ status: 500, message: "Server error" + error.message });
        }
};
exports.addSuggestionToServiceCart = async (req, res) => {
        try {
                let findCart = await Cart.findOne({ user: req.user._id });
                if (findCart) {
                        let obj = {
                                suggesstion: req.body.suggestion
                        };
                        let update1 = await Cart.findByIdAndUpdate({ _id: findCart._id }, { $push: { suggesstion: obj }, }, { new: true });
                        return res.status(200).json({ status: 200, message: "suggestion add to cart Successfully.", data: update1 })
                } else {
                        return res.status(404).json({ status: 404, message: "Cart is empty.", data: {} });
                }
        } catch (error) {
                console.error(error);
                return res.status(500).send({ status: 500, message: "Server error" + error.message });
        }
};
exports.addToCart = async (req, res, next) => {
        try {
                const itemType = req.params.type;
                const itemId = req.params.id;
                const data3 = await User.findOne({ _id: req.user._id });
                const itemData = await getItemData(itemType, itemId);
                if (!itemData) {
                        return res.status(400).send({ msg: `${itemType} not found` });
                }
                let cart = await Cart.findOne({ user: req.user._id });
                if (!cart) {
                        cart = await Cart.create({ user: req.user._id });
                }
                const cartField = getCartFieldByItemType(itemType)
                if (req.body.priceId != (null || undefined)) {
                        const itemIndex = cart[cartField].findIndex((cartItem) => cartItem.priceId === req.body.priceId);
                        console.log(req.body.priceId, itemIndex);
                        if (itemIndex === -1) {
                                if (itemType == 'giftPrice') {
                                        let obj = { [itemType + 'Id']: itemId, email: req.body.email, quantity: req.body.quantity };
                                        cart[cartField].push(obj);
                                } else if (itemType == 'product') {
                                        let obj = { [itemType + 'Id']: itemId, quantity: req.body.quantity, size: req.body.size, priceId: req.body.priceId, sizePrice: req.body.sizePrice };
                                        cart[cartField].push(obj);
                                } else if (itemType == 'service') {
                                        let price;
                                        if (data3.isSubscription === true) {
                                                price = req.body.memberprice
                                        } else {
                                                price = req.body.sizePrice
                                        }
                                        let obj = {
                                                [itemType + 'Id']: itemId,
                                                quantity: req.body.quantity,
                                                priceId: req.body.priceId,
                                                size: req.body.size,
                                                sizePrice: req.body.sizePrice,
                                                memberprice: req.body.memberprice,
                                                price: price,
                                                totalTime: itemData.totalTime,
                                                totalMin: itemData.totalMin,
                                        };
                                        cart[cartField].push(obj);
                                } else {
                                        let obj = { [itemType + 'Id']: itemId, quantity: req.body.quantity };
                                        cart[cartField].push(obj);
                                }
                        } else {
                                if (itemType == 'giftPrice') {
                                        cart[cartField][itemIndex].quantity = req.body.quantity;
                                        cart[cartField][itemIndex].email = req.body.email;
                                } else if (itemType == 'product') {
                                        cart[cartField][itemIndex].quantity = req.body.quantity;
                                        cart[cartField][itemIndex].size = req.body.size;
                                        cart[cartField][itemIndex].priceId = req.body.priceId;
                                        cart[cartField][itemIndex].sizePrice = req.body.sizePrice;
                                } else if (itemType == 'service') {
                                        let price;
                                        if (data3.isSubscription === true) {
                                                price = req.body.memberprice
                                        } else {
                                                price = req.body.sizePrice
                                        }
                                        cart[cartField][itemIndex].quantity = req.body.quantity;
                                        cart[cartField][itemIndex].size = req.body.size;
                                        cart[cartField][itemIndex].priceId = req.body.priceId;
                                        cart[cartField][itemIndex].sizePrice = req.body.sizePrice;
                                        cart[cartField][itemIndex].memberprice = req.body.memberprice;
                                        cart[cartField][itemIndex].price = price;
                                        cart[cartField][itemIndex].totalTime = itemData.totalTime;
                                        cart[cartField][itemIndex].totalMin = itemData.totalMin;
                                } else {
                                        cart[cartField][itemIndex].quantity = req.body.quantity;
                                }
                        }
                } else {
                        const itemIndex = cart[cartField].findIndex((cartItem) => cartItem[itemType + 'Id'].toString() === itemId);
                        if (itemIndex === -1) {
                                if (itemType == 'giftPrice') {
                                        let obj = { [itemType + 'Id']: itemId, email: req.body.email, quantity: req.body.quantity };
                                        cart[cartField].push(obj);
                                } else if (itemType == 'product') {
                                        let obj = { [itemType + 'Id']: itemId, quantity: req.body.quantity, size: req.body.size, priceId: req.body.priceId, sizePrice: req.body.sizePrice };
                                        cart[cartField].push(obj);
                                } else if (itemType == 'service') {
                                        let price;
                                        if (itemData.type == "offer") {
                                                price = itemData.discountPrice
                                        } else {
                                                if (data3.isSubscription === true) {
                                                        price = itemData.mPrice
                                                } else {
                                                        price = itemData.price
                                                }
                                        }
                                        let obj = {
                                                [itemType + 'Id']: itemId,
                                                quantity: req.body.quantity,
                                                priceId: req.body.priceId,
                                                size: req.body.size,
                                                sizePrice: req.body.sizePrice,
                                                memberprice: req.body.memberprice,
                                                price: price,
                                                totalTime: itemData.totalTime,
                                                totalMin: itemData.totalMin,
                                        };
                                        cart[cartField].push(obj);
                                } else if (itemType == 'addOnservices') {
                                        let obj = {
                                                [itemType + 'Id']: itemId,
                                                quantity: req.body.quantity,
                                                price: itemData.price,
                                                totalTime: itemData.totalTime,
                                                totalMin: itemData.totalMin,
                                        };
                                        cart[cartField].push(obj);
                                } else {
                                        let obj = { [itemType + 'Id']: itemId, quantity: req.body.quantity };
                                        cart[cartField].push(obj);
                                }
                        } else {
                                if (itemType == 'giftPrice') {
                                        cart[cartField][itemIndex].quantity = req.body.quantity;
                                        cart[cartField][itemIndex].email = req.body.email;
                                } else if (itemType == 'product') {
                                        cart[cartField][itemIndex].quantity = req.body.quantity;
                                        cart[cartField][itemIndex].size = req.body.size;
                                        cart[cartField][itemIndex].priceId = req.body.priceId;
                                        cart[cartField][itemIndex].sizePrice = req.body.sizePrice;
                                } else if (itemType == 'service') {
                                        let price;
                                        if (itemData.type == "offer") {
                                                price = itemData.discountPrice
                                        } else {
                                                if (data3.isSubscription === true) {
                                                        price = itemData.mPrice
                                                } else {
                                                        price = itemData.price
                                                }
                                        }
                                        cart[cartField][itemIndex].quantity = req.body.quantity;
                                        cart[cartField][itemIndex].size = req.body.size;
                                        cart[cartField][itemIndex].priceId = req.body.priceId;
                                        cart[cartField][itemIndex].sizePrice = req.body.sizePrice;
                                        cart[cartField][itemIndex].memberprice = req.body.memberprice;
                                        cart[cartField][itemIndex].price = price;
                                        cart[cartField][itemIndex].totalTime = itemData.totalTime;
                                        cart[cartField][itemIndex].totalMin = itemData.totalMin;
                                } else if (itemType == 'addOnservices') {
                                        cart[cartField][itemIndex].quantity = req.body.quantity;
                                        cart[cartField][itemIndex].price = itemData.price;
                                        cart[cartField][itemIndex].totalTime = itemData.totalTime;
                                        cart[cartField][itemIndex].totalMin = itemData.totalMin;
                                } else {
                                        cart[cartField][itemIndex].quantity = req.body.quantity;
                                }
                        }
                }
                await cart.save();
                return res.status(200).json({ msg: `${itemType} added to cart`, data: cart });
        } catch (error) {
                next(error);
        }
};
function getCartFieldByItemType(itemType) {
        switch (itemType) {
                case 'product':
                        return 'products';
                case 'service':
                        return 'services';
                case 'giftPrice':
                        return 'gifts';
                case 'frequentlyBuyProduct':
                        return 'frequentlyBuyProductSchema';
                case 'addOnservices':
                        return 'AddOnservicesSchema';
                default:
                        return null;
        }
}
async function getItemData(itemType, itemId) {
        switch (itemType) {
                case 'product':
                        return await product.findById(itemId);
                case 'service':
                        return await services.findById(itemId);
                case 'giftPrice':
                        return await giftPrice.findById(itemId);
                case 'frequentlyBuyProduct':
                        return await frequentlyBuyProduct.findById(itemId);
                case 'addOnservices':
                        return await addOnservices.findById(itemId);
                default:
                        return null;
        }
}
exports.getCart = async (req, res, next) => {
        try {
                const cart = await Cart.findOne({ user: req.user._id });
                if (!cart) {
                        return res.status(200).json({ success: false, msg: "Cart is empty", cart: {} });
                }
                let cartResponse;
                if (cart.services.length > 0) {
                        cartResponse = await calculateCartResponse(cart, req.user._id, true);
                } else if (cart.products.length == 0 && cart.gifts.length == 0 && cart.frequentlyBuyProductSchema.length == 0 && cart.services.length == 0 && cart.AddOnservicesSchema.length == 0) {
                        return res.status(200).json({ success: false, msg: "Cart is empty", cart: {} });
                } else {
                        cartResponse = await calculateCartResponse(cart, req.user._id);
                }
                return res.status(200).json({ success: true, msg: "Cart retrieved successfully", cart: cartResponse });
        } catch (error) {
                console.log(error);
                next(error);
        }
};
const calculateCartResponse = async (cart, userId) => {
        try {
                await cart.populate([{ path: "products.productId", select: { reviews: 0 } }, { path: "gifts.giftPriceId", populate: { path: 'giftId', model: 'gift' }, select: { reviews: 0 } }, { path: "AddOnservicesSchema.addOnservicesId", select: { reviews: 0 } }, { path: "services.serviceId", select: { reviews: 0 } }, { path: 'frequentlyBuyProductSchema.frequentlyBuyProductId', populate: { path: 'products', model: 'Product' }, select: { reviews: 0 } }, { path: "coupon", select: "couponCode discount expirationDate used per" }]);
                const data1 = await Address.findOne({ type: "Admin" }).select('address appartment landMark -_id');
                const data2 = await Address.findOne({ user: userId, addressType: "Shipping" }).select('address appartment city state zipCode -_id');
                const data5 = await Address.findOne({ user: userId, addressType: "Billing" }).select('address appartment city state zipCode -_id');
                const data3 = await User.findOne({ _id: userId });
                const data4 = await contact.findOne().select('name image phone email numOfReviews google mapLink map ratings -_id');
                let totalTime = 0;
                if (cart.toTime != (null || undefined)) {
                        if (cart.services.length > 0) {
                                for (let i = 0; i < cart.services.length; i++) {
                                        totalTime = totalTime + cart.services[i].totalMin;
                                }
                        }
                        if (cart.AddOnservicesSchema.length > 0) {
                                for (let i = 0; i < cart.AddOnservicesSchema.length; i++) {
                                        totalTime = totalTime + cart.AddOnservicesSchema[i].totalMin;
                                }
                        }
                        var dateTimeString = cart.toTime;
                        var dateTimeObject = new Date(dateTimeString);
                        let d = dateTimeObject.toISOString().split('T')[0];
                        var hours1 = dateTimeObject.getUTCHours();
                        var minutes1 = dateTimeObject.getUTCMinutes();
                        const hours = parseInt(hours1);
                        const minutes = parseInt(minutes1);
                        const providedTimeInMinutes = hours * 60 + minutes;
                        let fromTimeInMinutes = providedTimeInMinutes + totalTime;
                        const fromTime = new Date(d);
                        fromTime.setMinutes(fromTimeInMinutes);
                        cart.fromTime = fromTime;
                        cart.save();
                }
                const cartResponse = cart.toObject();
                let offerDiscount = 0, productFBPTotal = 0, onProductDiscount = 0, membershipDiscount = 0, shipping = 0, membershipDiscountPercentage = 0, total = 0, subTotal = 0;
                if (cartResponse.services.length > 0) {
                        for (const cartProduct of cartResponse.services) {
                                if (cartProduct.serviceId.type === "offer") {
                                        cartProduct.subTotal = parseFloat((cartProduct.serviceId.price * cartProduct.quantity).toFixed(2));
                                        cartProduct.total = parseFloat((cartProduct.price * cartProduct.quantity).toFixed(2));
                                        cartProduct.offerDiscount = parseFloat(((cartProduct.serviceId.price - cartProduct.price) * cartProduct.quantity).toFixed(2));
                                        offerDiscount += cartProduct.offerDiscount;
                                        subTotal += cartProduct.subTotal;
                                        total += cartProduct.total;
                                }
                                if (cartProduct.serviceId.type === "Service") {
                                        if (data3.isSubscription === true) {
                                                if (cartProduct.serviceId.multipleSize == true) {
                                                        let x = (parseFloat((cartProduct.price * cartProduct.quantity).toFixed(2)) - parseFloat((cartProduct.memberprice * cartProduct.quantity).toFixed(2)));
                                                        cartProduct.membershipDiscount = parseFloat(x.toFixed(2))
                                                        membershipDiscount += x;
                                                        cartProduct.subTotal = parseFloat((cartProduct.price * cartProduct.quantity).toFixed(2));
                                                        cartProduct.total = parseFloat((cartProduct.memberprice * cartProduct.quantity).toFixed(2));
                                                        cartProduct.offerDiscount = 0.00;
                                                        offerDiscount += cartProduct.offerDiscount;
                                                        total += cartProduct.total;
                                                        subTotal += cartProduct.subTotal;
                                                } else {
                                                        let x = (parseFloat((cartProduct.serviceId.price * cartProduct.quantity).toFixed(2)) - parseFloat((cartProduct.serviceId.mPrice * cartProduct.quantity).toFixed(2)));
                                                        cartProduct.membershipDiscount = parseFloat(x.toFixed(2))
                                                        membershipDiscount += x;
                                                        cartProduct.subTotal = parseFloat((cartProduct.price * cartProduct.quantity).toFixed(2));
                                                        cartProduct.total = parseFloat((cartProduct.price * cartProduct.quantity).toFixed(2));
                                                        cartProduct.offerDiscount = 0.00;
                                                        offerDiscount += cartProduct.offerDiscount;
                                                        total += cartProduct.total;
                                                        subTotal += cartProduct.subTotal;
                                                }
                                        } else {
                                                if (cartProduct.serviceId.multipleSize == true) {
                                                        let x = 0
                                                        cartProduct.membershipDiscount = parseFloat(x.toFixed(2))
                                                        membershipDiscount += x;
                                                        cartProduct.subTotal = parseFloat((cartProduct.price * cartProduct.quantity).toFixed(2));
                                                        cartProduct.total = parseFloat((cartProduct.price * cartProduct.quantity).toFixed(2) - x);
                                                        cartProduct.offerDiscount = 0.00;
                                                        offerDiscount += cartProduct.offerDiscount;
                                                        total += cartProduct.total;
                                                        subTotal += cartProduct.subTotal;
                                                } else {
                                                        let x = 0
                                                        cartProduct.membershipDiscount = parseFloat(x.toFixed(2))
                                                        membershipDiscount += x;
                                                        cartProduct.subTotal = parseFloat((cartProduct.price * cartProduct.quantity).toFixed(2));
                                                        cartProduct.total = parseFloat((cartProduct.price * cartProduct.quantity).toFixed(2) - x);
                                                        cartProduct.offerDiscount = 0.00;
                                                        offerDiscount += cartProduct.offerDiscount;
                                                        total += cartProduct.total;
                                                        subTotal += cartProduct.subTotal;
                                                }
                                        }
                                }
                        }
                }
                if (cartResponse.AddOnservicesSchema.length > 0) {
                        cartResponse.AddOnservicesSchema.forEach((cartGift) => {
                                cartGift.total = parseFloat((cartGift.price * cartGift.quantity).toFixed(2));
                                cartGift.subTotal = parseFloat((cartGift.price * cartGift.quantity).toFixed(2));
                                subTotal += cartGift.subTotal;
                                total += cartGift.total;
                        });
                }
                if (cartResponse.products.length > 0) {
                        for (const cartProduct of cartResponse.products) {
                                if (cartProduct.productId.multipleSize == true) {
                                        for (let i = 0; i < cartProduct.productId.sizePrice.length; i++) {
                                                if ((cartProduct.productId.sizePrice[i]._id == cartProduct.priceId) == true) {
                                                        if (data3.isSubscription === true) {
                                                                const findSubscription = await Subscription.findById(data3.subscriptionId);
                                                                if (findSubscription) {
                                                                        membershipDiscountPercentage = findSubscription.discount;
                                                                }
                                                                let x = (parseFloat((cartProduct.productId.sizePrice[i].price * cartProduct.quantity).toFixed(2)) * parseFloat((membershipDiscountPercentage / 100).toFixed(2)));
                                                                cartProduct.membershipDiscount = parseFloat(x.toFixed(2))
                                                                membershipDiscount += x;
                                                                cartProduct.subTotal = parseFloat((cartProduct.productId.sizePrice[i].price * cartProduct.quantity).toFixed(2));
                                                                cartProduct.total = parseFloat((cartProduct.productId.sizePrice[i].price * cartProduct.quantity).toFixed(2) - x);
                                                                cartProduct.offerDiscount = 0.00;
                                                                offerDiscount += cartProduct.offerDiscount;
                                                                subTotal += cartProduct.subTotal;
                                                                total += cartProduct.total;
                                                                productFBPTotal += cartProduct.total
                                                        } else {
                                                                let x = 0;
                                                                cartProduct.membershipDiscount = x
                                                                membershipDiscount += x;
                                                                cartProduct.subTotal = parseFloat((cartProduct.productId.sizePrice[i].price * cartProduct.quantity).toFixed(2));
                                                                cartProduct.total = parseFloat((cartProduct.productId.sizePrice[i].price * cartProduct.quantity).toFixed(2));
                                                                cartProduct.offerDiscount = 0.00;
                                                                offerDiscount += cartProduct.offerDiscount;
                                                                subTotal += cartProduct.subTotal;
                                                                total += cartProduct.total;
                                                                productFBPTotal += cartProduct.total
                                                        }
                                                }
                                        }
                                } else {
                                        if (data3.isSubscription === true) {
                                                const findSubscription = await Subscription.findById(data3.subscriptionId);
                                                if (findSubscription) {
                                                        membershipDiscountPercentage = findSubscription.discount;
                                                }
                                                let x = (parseFloat((cartProduct.productId.price * cartProduct.quantity).toFixed(2)) * parseFloat((membershipDiscountPercentage / 100).toFixed(2)));
                                                cartProduct.membershipDiscount = parseFloat(x.toFixed(2))
                                                membershipDiscount += x;
                                                cartProduct.subTotal = parseFloat((cartProduct.productId.price * cartProduct.quantity).toFixed(2));
                                                cartProduct.total = parseFloat((cartProduct.productId.price * cartProduct.quantity).toFixed(2) - x);
                                                cartProduct.offerDiscount = 0.00;
                                                offerDiscount += cartProduct.offerDiscount;
                                                subTotal += cartProduct.subTotal;
                                                total += cartProduct.total;
                                                productFBPTotal += cartProduct.total
                                        } else {
                                                let x = 0;
                                                cartProduct.membershipDiscount = x
                                                membershipDiscount += x;
                                                cartProduct.subTotal = parseFloat((cartProduct.productId.price * cartProduct.quantity).toFixed(2));
                                                cartProduct.total = parseFloat((cartProduct.productId.price * cartProduct.quantity).toFixed(2));
                                                cartProduct.offerDiscount = 0.00;
                                                offerDiscount += cartProduct.offerDiscount;
                                                subTotal += cartProduct.subTotal;
                                                total += cartProduct.total;
                                                productFBPTotal += cartProduct.total
                                        }
                                }
                        }
                }
                if (cartResponse.frequentlyBuyProductSchema.length > 0) {
                        cartResponse.frequentlyBuyProductSchema.forEach((cartFBP) => {
                                cartFBP.total = parseFloat((cartFBP.frequentlyBuyProductId.price * cartFBP.quantity).toFixed(2));
                                cartFBP.subTotal = parseFloat((cartFBP.frequentlyBuyProductId.price * cartFBP.quantity).toFixed(2));
                                subTotal += cartFBP.subTotal;
                                total += cartFBP.total;
                                productFBPTotal += cartFBP.total
                        });
                }
                if (cartResponse.products.length > 0 || cartResponse.frequentlyBuyProductSchema.length > 0) {
                        if (cartResponse.pickupFromStore == true) {
                                shipping = 0.00;
                                cartResponse.shipping = parseFloat(shipping.toFixed(2));
                        } else {
                                if (productFBPTotal <= 150) {
                                        shipping = 8.00;
                                        cartResponse.shipping = parseFloat(shipping.toFixed(2));
                                } else {
                                        shipping = 12.00;
                                        cartResponse.shipping = parseFloat(shipping.toFixed(2));
                                }
                        }
                }
                if (cartResponse.gifts.length > 0) {
                        cartResponse.gifts.forEach((cartGift) => {
                                cartGift.total = parseFloat((cartGift.giftPriceId.price * cartGift.quantity).toFixed(2));
                                cartGift.subTotal = parseFloat((cartGift.giftPriceId.price * cartGift.quantity).toFixed(2));
                                subTotal += cartGift.subTotal;
                                total += cartGift.total;
                        });
                }
                cartResponse.subTotal = parseFloat(subTotal.toFixed(2));
                cartResponse.onProductDiscount = parseFloat(onProductDiscount.toFixed(2));
                cartResponse.offerDiscount = parseFloat(offerDiscount.toFixed(2));
                cartResponse.membershipDiscount = parseFloat(membershipDiscount.toFixed(2));
                cartResponse.shipping = parseFloat(shipping.toFixed(2));
                cartResponse.total = parseFloat((total + shipping).toFixed(2));
                cartResponse.pickUp = data1;
                cartResponse.deliveryAddresss = data2;
                cartResponse.contactDetail = data4;
                cartResponse.billingAddresss = data5;
                if (totalTime > 0) {
                        var hours2 = Math.floor(totalTime / 60);
                        var minutes2 = totalTime % 60;
                        let timeInMin = hours2 + "hr" + " " + minutes2 + "min"
                        cartResponse.timeInMin = timeInMin;
                }
                return cartResponse;
        } catch (error) {
                throw error;
        }
};
exports.checkout = async (req, res) => {
        try {
                let findOrder = await productOrder.find({ user: req.user._id, orderStatus: "unconfirmed" });
                let findOrder1 = await serviceOrder.find({ user: req.user._id, orderStatus: "unconfirmed" });
                let findOrder2 = await userOrders.find({ user: req.user._id, orderStatus: "unconfirmed" });
                let findOrder3 = await coupanModel.find({ senderUser: req.user._id, orderStatus: "unconfirmed" });
                if (findOrder.length > 0 || findOrder1.length > 0 || findOrder2.length > 0 || findOrder3.length > 0) {
                        if (findOrder.length > 0) {
                                for (let i = 0; i < findOrder.length; i++) {
                                        await productOrder.findByIdAndDelete({ _id: findOrder[i]._id });
                                }
                        }
                        if (findOrder1.length > 0) {
                                for (let i = 0; i < findOrder1.length; i++) {
                                        await serviceOrder.findByIdAndDelete({ _id: findOrder1[i]._id });
                                }
                        }
                        if (findOrder2.length > 0) {
                                for (let i = 0; i < findOrder2.length; i++) {
                                        await userOrders.findByIdAndDelete({ _id: findOrder2[i]._id });
                                }
                        }
                        if (findOrder3.length > 0) {
                                for (let i = 0; i < findOrder3.length; i++) {
                                        await coupanModel.findByIdAndDelete({ _id: findOrder3[i]._id });
                                }
                        }
                        let findCart = await Cart.findOne({ user: req.user._id }).populate([{ path: "products.productId", select: { reviews: 0 } }, { path: "gifts.giftPriceId", select: { reviews: 0 } }, { path: "AddOnservicesSchema.addOnservicesId", select: { reviews: 0 } }, { path: "services.serviceId", select: { reviews: 0 } }, { path: 'frequentlyBuyProductSchema.frequentlyBuyProductId', populate: { path: 'products', model: 'Product' }, select: { reviews: 0 } }, { path: "coupon", select: "couponCode discount expirationDate used per" },]);
                        if (findCart) {
                                const data1 = await Address.findOne({ type: "Admin" }).select('address appartment landMark -_id');
                                const data2 = await Address.findOne({ user: req.user._id, addressType: "Shipping" }).select('address appartment city state zipCode -_id');
                                const data5 = await Address.findOne({ user: req.user._id, addressType: "Billing" }).select('address appartment city state zipCode -_id');
                                const data3 = await User.findOne({ _id: req.user._id });
                                let orderObjPaidAmount = 0, productOrderId, serviceOrderId, giftOrderId, couponDiscount = 0, orderObjTotalAmount = 0;
                                if (findCart.coupon && moment().isAfter(findCart.coupon.expirationDate, "day")) { findCart.coupon = undefined; findCart.save(); }
                                const cartResponse = findCart.toObject();
                                let orderId = await reffralCode();
                                cartResponse.orderId = orderId;
                                if (cartResponse.services.length > 0 || cartResponse.AddOnservicesSchema.length > 0) {
                                        const dateObject = new Date(findCart.date);
                                        const dateString = dateObject.toISOString().split('T')[0];
                                        const newTime = "00:00:00.000+00:00";
                                        const replacedDateString = `${dateString}T${newTime}`;
                                        let findSlot1 = await slot.find({ from: { $lte: findCart.fromTime }, to: { $gte: findCart.toTime }, date: replacedDateString, isBooked: false, slotBlocked: false });
                                        if (findSlot1.length > 0) {
                                                if (cartResponse.products.length > 0 || cartResponse.frequentlyBuyProductSchema.length > 0) {
                                                        let shipping = 0, productFBPTotal = 0, productArray = [], frequentlyBuyProductArray = [], offerDiscount = 0, membershipDiscount = 0, membershipDiscountPercentage = 0, total = 0, subTotal = 0;
                                                        for (const cartProduct of cartResponse.products) {
                                                                if (cartProduct.productId.multipleSize == true) {
                                                                        for (let i = 0; i < cartProduct.productId.sizePrice.length; i++) {
                                                                                if ((cartProduct.productId.sizePrice[i]._id == cartProduct.priceId) == true) {
                                                                                        if (data3.isSubscription === true) {
                                                                                                const findSubscription = await Subscription.findById(data3.subscriptionId);
                                                                                                if (findSubscription) {
                                                                                                        membershipDiscountPercentage = findSubscription.discount;
                                                                                                }
                                                                                                let x = (parseFloat((cartProduct.productId.sizePrice[i].price * cartProduct.quantity).toFixed(2)) * parseFloat((membershipDiscountPercentage / 100).toFixed(2)));
                                                                                                cartProduct.membershipDiscount = parseFloat(x.toFixed(2))
                                                                                                membershipDiscount += x;
                                                                                                cartProduct.subTotal = parseFloat((cartProduct.productId.sizePrice[i].price * cartProduct.quantity).toFixed(2));
                                                                                                cartProduct.total = parseFloat((cartProduct.productId.sizePrice[i].price * cartProduct.quantity).toFixed(2) - x);
                                                                                                cartProduct.offerDiscount = 0.00;
                                                                                                offerDiscount += cartProduct.offerDiscount;
                                                                                                subTotal += cartProduct.subTotal;
                                                                                                total += (cartProduct.total - membershipDiscount);
                                                                                                productFBPTotal += cartProduct.total
                                                                                                const newCartItem = {
                                                                                                        productId: cartProduct.productId._id,
                                                                                                        price: cartProduct.productId.sizePrice[i].price,
                                                                                                        size: cartProduct.size,
                                                                                                        quantity: cartProduct.quantity,
                                                                                                };
                                                                                                productArray.push(newCartItem);
                                                                                        } else {
                                                                                                membershipDiscount += 0;
                                                                                                cartProduct.membershipDiscount = membershipDiscount
                                                                                                cartProduct.subTotal = parseFloat((cartProduct.productId.sizePrice[i].price * cartProduct.quantity).toFixed(2));
                                                                                                cartProduct.total = parseFloat((cartProduct.productId.sizePrice[i].price * cartProduct.quantity).toFixed(2));
                                                                                                cartProduct.offerDiscount = 0.00;
                                                                                                offerDiscount += cartProduct.offerDiscount;
                                                                                                subTotal += cartProduct.subTotal;
                                                                                                total += (cartProduct.total);
                                                                                                productFBPTotal += cartProduct.total
                                                                                                const newCartItem = {
                                                                                                        productId: cartProduct.productId._id,
                                                                                                        price: cartProduct.productId.sizePrice[i].price,
                                                                                                        size: cartProduct.size,
                                                                                                        quantity: cartProduct.quantity,
                                                                                                };
                                                                                                productArray.push(newCartItem);
                                                                                        }
                                                                                }
                                                                        }
                                                                } else {
                                                                        if (data3.isSubscription === true) {
                                                                                const findSubscription = await Subscription.findById(data3.subscriptionId);
                                                                                if (findSubscription) {
                                                                                        membershipDiscountPercentage = findSubscription.discount;
                                                                                }
                                                                                let x = (parseFloat((cartProduct.productId.price * cartProduct.quantity).toFixed(2)) * parseFloat((membershipDiscountPercentage / 100).toFixed(2)));
                                                                                cartProduct.membershipDiscount = parseFloat(x.toFixed(2))
                                                                                membershipDiscount += x;
                                                                                cartProduct.subTotal = parseFloat((cartProduct.productId.price * cartProduct.quantity).toFixed(2));
                                                                                cartProduct.total = parseFloat((cartProduct.productId.price * cartProduct.quantity).toFixed(2) - x);
                                                                                cartProduct.offerDiscount = 0.00;
                                                                                offerDiscount += cartProduct.offerDiscount;
                                                                                subTotal += cartProduct.subTotal;
                                                                                total += (cartProduct.total - membershipDiscount);
                                                                                productFBPTotal += cartProduct.total
                                                                                const newCartItem = {
                                                                                        productId: cartProduct.productId._id,
                                                                                        price: cartProduct.productId.price,
                                                                                        quantity: cartProduct.quantity,
                                                                                };
                                                                                productArray.push(newCartItem)
                                                                        } else {
                                                                                let x = 0.00;
                                                                                cartProduct.membershipDiscount = parseFloat(x.toFixed(2))
                                                                                membershipDiscount += x;
                                                                                cartProduct.subTotal = parseFloat((cartProduct.productId.price * cartProduct.quantity).toFixed(2));
                                                                                cartProduct.total = parseFloat((cartProduct.productId.price * cartProduct.quantity).toFixed(2));
                                                                                cartProduct.offerDiscount = 0.00;
                                                                                offerDiscount += cartProduct.offerDiscount;
                                                                                subTotal += cartProduct.subTotal;
                                                                                total += cartProduct.total;
                                                                                productFBPTotal += cartProduct.total
                                                                                const newCartItem = {
                                                                                        productId: cartProduct.productId._id,
                                                                                        price: cartProduct.productId.price,
                                                                                        quantity: cartProduct.quantity,
                                                                                };
                                                                                productArray.push(newCartItem)
                                                                        }
                                                                }
                                                        }
                                                        cartResponse.frequentlyBuyProductSchema.forEach((cartFBP) => {
                                                                cartFBP.total = parseFloat((cartFBP.frequentlyBuyProductId.price * cartFBP.quantity).toFixed(2));
                                                                cartFBP.subTotal = parseFloat((cartFBP.frequentlyBuyProductId.price * cartFBP.quantity).toFixed(2));
                                                                subTotal += cartFBP.subTotal;
                                                                total += cartFBP.total;
                                                                productFBPTotal += cartFBP.total
                                                                const newCartItem = {
                                                                        frequentlyBuyProductId: cartFBP.frequentlyBuyProductId._id,
                                                                        price: cartFBP.frequentlyBuyProductId.price,
                                                                        quantity: cartFBP.quantity,
                                                                };
                                                                frequentlyBuyProductArray.push(newCartItem);
                                                        });
                                                        cartResponse.subTotal = subTotal;
                                                        cartResponse.memberShipPer = Number(membershipDiscountPercentage);
                                                        cartResponse.memberShip = parseFloat(membershipDiscount).toFixed(2)
                                                        cartResponse.offerDiscount = Number(offerDiscount);
                                                        if (cartResponse.pickupFromStore == true) {
                                                                shipping = 0.00;
                                                                cartResponse.shipping = parseFloat(shipping.toFixed(2));
                                                                cartResponse.pickUp = data1;
                                                                cartResponse.billingAddresss = data5;
                                                                cartResponse.total = cartResponse.subTotal - membershipDiscount
                                                                orderObjPaidAmount = orderObjPaidAmount + cartResponse.subTotal - membershipDiscount;
                                                        } else {
                                                                shipping = 0.00;
                                                                if (productFBPTotal <= 150) {
                                                                        shipping = 8.00;
                                                                        cartResponse.shipping = parseFloat(shipping.toFixed(2));
                                                                } else {
                                                                        shipping = 12.00;
                                                                        cartResponse.shipping = parseFloat(shipping.toFixed(2));
                                                                }
                                                                cartResponse.deliveryAddresss = data2;
                                                                cartResponse.billingAddresss = data5;
                                                                cartResponse.shipping = shipping;
                                                                cartResponse.total = cartResponse.subTotal + shipping - membershipDiscount
                                                                orderObjPaidAmount = orderObjPaidAmount + cartResponse.subTotal + shipping - membershipDiscount;
                                                        }
                                                        cartResponse.products = productArray;
                                                        cartResponse.frequentlyBuyProductSchema = frequentlyBuyProductArray;
                                                        cartResponse._id = new mongoose.Types.ObjectId();
                                                        orderObjTotalAmount = orderObjTotalAmount + orderObjPaidAmount;
                                                        let saveOrder = await productOrder.create(cartResponse);
                                                        productOrderId = saveOrder._id;
                                                }
                                                if (cartResponse.services.length > 0 || cartResponse.AddOnservicesSchema.length > 0) {
                                                        let totalTime = 0;
                                                        let offerDiscount = 0, membershipDiscount = 0, membershipDiscountPercentage = 0, total = 0, subTotal = 0;
                                                        if (cartResponse.services.length > 0) {
                                                                for (const cartProduct of cartResponse.services) {
                                                                        if (cartProduct.serviceId.type === "offer") {
                                                                                cartProduct.subTotal = parseFloat((cartProduct.serviceId.price * cartProduct.quantity).toFixed(2));
                                                                                cartProduct.total = parseFloat((cartProduct.price * cartProduct.quantity).toFixed(2));
                                                                                cartProduct.offerDiscount = parseFloat(((cartProduct.serviceId.price - cartProduct.price) * cartProduct.quantity).toFixed(2));
                                                                                offerDiscount += cartProduct.offerDiscount;
                                                                                subTotal += cartProduct.subTotal;
                                                                                total += cartProduct.total;
                                                                        }
                                                                        if (cartProduct.serviceId.type === "Service") {
                                                                                if (data3.isSubscription === true) {
                                                                                        if (cartProduct.serviceId.multipleSize == true) {
                                                                                                let x = (parseFloat((cartProduct.price * cartProduct.quantity).toFixed(2)) - parseFloat((cartProduct.memberprice * cartProduct.quantity).toFixed(2)));
                                                                                                cartProduct.membershipDiscount = parseFloat(x.toFixed(2))
                                                                                                membershipDiscount += x;
                                                                                                cartProduct.subTotal = parseFloat((cartProduct.price * cartProduct.quantity).toFixed(2));
                                                                                                cartProduct.total = parseFloat((cartProduct.memberprice * cartProduct.quantity).toFixed(2));
                                                                                                cartProduct.offerDiscount = 0.00;
                                                                                                offerDiscount += cartProduct.offerDiscount;
                                                                                                total += cartProduct.total;
                                                                                                subTotal += cartProduct.subTotal;
                                                                                        } else {
                                                                                                let x = (parseFloat((cartProduct.price * cartProduct.quantity).toFixed(2)) - parseFloat((cartProduct.memberprice * cartProduct.quantity).toFixed(2)));
                                                                                                cartProduct.membershipDiscount = parseFloat(x.toFixed(2))
                                                                                                membershipDiscount += x;
                                                                                                cartProduct.subTotal = parseFloat((cartProduct.memberprice * cartProduct.quantity).toFixed(2));
                                                                                                cartProduct.total = parseFloat((cartProduct.memberprice * cartProduct.quantity).toFixed(2));
                                                                                                cartProduct.offerDiscount = 0.00;
                                                                                                offerDiscount += cartProduct.offerDiscount;
                                                                                                total += cartProduct.total;
                                                                                                subTotal += cartProduct.subTotal;
                                                                                        }
                                                                                } else {
                                                                                        if (cartProduct.serviceId.multipleSize == true) {
                                                                                                let x = 0
                                                                                                cartProduct.membershipDiscount = parseFloat(x.toFixed(2))
                                                                                                membershipDiscount += x;
                                                                                                cartProduct.subTotal = parseFloat((cartProduct.price * cartProduct.quantity).toFixed(2));
                                                                                                cartProduct.total = parseFloat((cartProduct.price * cartProduct.quantity).toFixed(2) - x);
                                                                                                cartProduct.offerDiscount = 0.00;
                                                                                                offerDiscount += cartProduct.offerDiscount;
                                                                                                total += cartProduct.total;
                                                                                                subTotal += cartProduct.subTotal;
                                                                                        } else {
                                                                                                let x = 0
                                                                                                cartProduct.membershipDiscount = parseFloat(x.toFixed(2))
                                                                                                membershipDiscount += x;
                                                                                                cartProduct.subTotal = parseFloat((cartProduct.price * cartProduct.quantity).toFixed(2));
                                                                                                cartProduct.total = parseFloat((cartProduct.price * cartProduct.quantity).toFixed(2) - x);
                                                                                                cartProduct.offerDiscount = 0.00;
                                                                                                offerDiscount += cartProduct.offerDiscount;
                                                                                                total += cartProduct.total;
                                                                                                subTotal += cartProduct.subTotal;
                                                                                        }
                                                                                }
                                                                        }
                                                                }
                                                        }
                                                        if (cartResponse.AddOnservicesSchema.length > 0) {
                                                                cartResponse.AddOnservicesSchema.forEach((cartGift) => {
                                                                        cartGift.total = parseFloat((cartGift.price * cartGift.quantity).toFixed(2));
                                                                        cartGift.subTotal = parseFloat((cartGift.price * cartGift.quantity).toFixed(2));
                                                                        subTotal += cartGift.subTotal;
                                                                        total += cartGift.total;
                                                                });
                                                        }
                                                        if (findCart.toTime != (null || undefined)) {
                                                                if (findCart.services.length > 0) {
                                                                        for (let i = 0; i < findCart.services.length; i++) {
                                                                                totalTime = totalTime + findCart.services[i].serviceId.totalMin;
                                                                        }
                                                                }
                                                                if (findCart.AddOnservicesSchema.length > 0) {
                                                                        for (let i = 0; i < findCart.AddOnservicesSchema.length; i++) {
                                                                                totalTime = totalTime + findCart.AddOnservicesSchema[i].addOnservicesId.totalMin;
                                                                        }
                                                                }
                                                        }
                                                        cartResponse.date = findCart.date;
                                                        cartResponse.toTime = findCart.toTime;
                                                        cartResponse.fromTime = findCart.fromTime;
                                                        cartResponse.time = findCart.time;
                                                        cartResponse.suggesstion = findCart.suggesstion;
                                                        cartResponse.memberShipPer = Number(membershipDiscountPercentage);
                                                        cartResponse.memberShip = parseFloat(membershipDiscount).toFixed(2)
                                                        cartResponse.offerDiscount = Number(offerDiscount);
                                                        cartResponse.subTotal = subTotal;
                                                        cartResponse.total = total;
                                                        cartResponse.serviceAddresss = data1;
                                                        orderObjTotalAmount = orderObjTotalAmount + total;
                                                        cartResponse._id = new mongoose.Types.ObjectId();
                                                        cartResponse.orderStatus = "confirmed";
                                                        const inputDate = new Date(findCart.toTime);
                                                        const options = {
                                                                weekday: 'long',
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric',
                                                                hour: 'numeric',
                                                                minute: 'numeric',
                                                                hour12: true
                                                        };
                                                        const formattedDate = inputDate.toLocaleString('en-US', { ...options, timeZone: 'UTC' });
                                                        console.log(formattedDate);
                                                        if (totalTime > 0) {
                                                                var hours2 = Math.floor(totalTime / 60);
                                                                var minutes2 = totalTime % 60;
                                                                let timeInMin = hours2 + "hr" + " " + minutes2 + "min"
                                                                cartResponse.timeInMin = timeInMin;
                                                        }
                                                        let saveOrder = await serviceOrder.create(cartResponse);
                                                        if (saveOrder) {
                                                                const dateObject = new Date(findCart.date);
                                                                const dateString = dateObject.toISOString().split('T')[0];
                                                                const newTime = "00:00:00.000+00:00";
                                                                const replacedDateString = `${dateString}T${newTime}`;
                                                                console.log({ from: { $lte: findCart.fromTime }, to: { $gte: findCart.toTime }, isBooked: false });
                                                                if (saveOrder) {


                                                                        const data4 = await User.findOne({ userType: "ADMIN" });
                                                                        let findSlot = await slot.find({ from: { $lte: findCart.fromTime }, to: { $gte: findCart.toTime }, date: replacedDateString, isBooked: false, slotBlocked: false });
                                                                        if (findSlot.length > 0) {
                                                                                for (let i = 0; i < findSlot.length; i++) {
                                                                                        let updateSlot = await slot.findByIdAndUpdate({ _id: findSlot[i]._id }, { $set: { isBooked: true } }, { new: true });
                                                                                        console.log(`Slot with ID ${findSlot[i]._id} is now booked.`);
                                                                                }
                                                                        }
                                                                        await adminNotification.create({
                                                                                orderUserId: req.user._id,
                                                                                userId: data4._id,
                                                                                title: `${data3.firstName} ${data3.lastName}, book online ${saveOrder.total}`,
                                                                                body: findCart.services[0].serviceId.description,
                                                                        })
                                                                        var transporter = nodemailer.createTransport({ service: 'gmail', auth: { "user": "info@shahinahoja.com", "pass": "gganlypsemwqhwlh" } });
                                                                        let mailOptions = {
                                                                                from: '<do_not_reply@gmail.com>',
                                                                                to: `${req.user.email}`,
                                                                                cc: 'info@shahinahoja.com',
                                                                                subject: 'Order Received',
                                                                                text: `You have received a new order`,
                                                                                html: `<html lang="en">
                                                                                <head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>Email</title></head>
                                                                                <body>
                                                                                    <div style="width: 100%; height: 100%"><div style="background-color: white;max-width: 600px;margin: auto;border: 1px solid black;"><div style="  width: 90%;  margin: auto;  margin-top: 2rem;  margin-bottom: 4rem;"><buttonstyle="color: white;border-left: 50%;padding: 5px;height: 2rem;width: 7rem;border-radius: 1rem;background-color: blueviolet;border: none;outline: none;">Confirmed</button><div style="margin-top: 2rem"><p style="font-size: 30px; font-weight: bold">Looking forward to seeing you soon Nisan</p></div><p style="margin-top: 1rem">This is a friendly reminder about your appointment on<span style="color: rgb(153, 74, 228)">${formattedDate}</span>with Shahina Hoja Aesthetics.</p>
                                                                                    <div><a href="https://shahina-web.vercel.app/"><button style="width: 100%;padding: 10px;background-color: black;color: white;border: none;outline: none;cursor: pointer;border-radius: 3px;font-size: 1rem;">Get directions</button></a><a href="https://shahina-web.vercel.app/" target='_blank'><button style="width: 100%;padding: 10px;cursor: pointers;outline: none;border-radius: 3px;cursor: pointer;font-size: 1rem;margin-top: 1rem;">Manage appointment</button></a></div>
                                                                                    <div style="margin-top: 1.5rem"><h4 style="font-size: 1.5rem; font-weight: bold">Appointment details</h4><div style="margin-top: 1rem;display: flex;justify-content: space-between;"><div>
                                                                                    <ul>${findCart.services.map((service, index) => `<h5 style="font-weight: bold; font-size: 1rem">${service.serviceId.name}                   $ ${service.price}</h5><p style="color: rgb(131, 120, 120)"> ${service.totalTime}  with  Shahina</p>`).join('')}</ul></div></div><hr style="margin-top: 0.5rem; line-height: 7px" /><div style="margin-top: 0.5rem;display: flex;justify-content: space-between;"><div><p style="font-weight: bold">Total</p></div><p style="font-weight: bold">$ ${saveOrder.total}</p>
                                                                                                    </div><hr style="margin-top: 1rem" /></div>
                                                                                                <p style="color: rgb(142, 133, 133); margin-top: 0.5rem">Booking ref: ${orderId}</p>
                                                                                
                                                                                                <div>
                                                                                                    <h3 style="margin-top: 1rem">Location</h3>
                                                                                                    <div style="margin-top: 0.5rem;display: flex;justify-content: space-between;">
                                                                                                        <div style="line-height: 20px">
                                                                                                            <h5>Shahine Hoja Aesthetics</h5>
                                                                                                            <p style="color: rgb(100, 28, 162)">
                                                                                                                Shahina Hoja Aesthetics
905 Watters Creek Boulevard ,141 Allen, 75013, Texas, Us
                                                                                                            </p>
                                                                                                        </div>
                                                                                                        <img src="https://res.cloudinary.com/djgrqoefp/image/upload/v1704388341/shahina/contactDetail/lv8rvmn6nbkzbzekiexq.png"
                                                                                                            style="height: 50px; width: 50px; margin-left:25px; border-radius: 10px" />
                                                                                                    </div>
                                                                                                </div>
                                                                                
                                                                                                <div style="margin-top: 1.5rem; line-height: 20px">
                                                                                                    <h3>Cancellation Policy</h3>
                                                                                                    <p style="margin-top: 1rem">
                                                                                                        Please avoid Cancellation with in <strong>48 hours</strong> of your
                                                                                                        appointment
                                                                                                    </p>
                                                                                                </div>
                                                                                
                                                                                                <div style="margin-top: 1.5rem; line-height: 20px">
                                                                                                    <h3>Important Info</h3>
                                                                                                    <p style="margin-top: 1rem">
                                                                                                        We are now offering payment plans through cherry. if you're
                                                                                                        interseted , please apply hare appointment
                                                                                                    </p>
                                                                                                    <p style="color: blueviolet; cursor: pointer">
                                                                                                    https://pay.withcherry.com/shahinahoja
                                                                                                    </p>
                                                                                                </div>
                                                                                                <p style="margin-top: 2.5rem">
                                                                                                    we send you this because you have booked with shahine hoja Aesthics,
                                                                                                    which partners with for appoinment and payments.
                                                                                                </p>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </body>
                                                                                </html>`
                                                                        };
                                                                        let info1 = await transporter.sendMail(mailOptions);
                                                                        if (info1) {
                                                                                serviceOrderId = saveOrder._id;
                                                                        } else {
                                                                                serviceOrderId = saveOrder._id;
                                                                        }
                                                                }
                                                        }
                                                }
                                                if (cartResponse.gifts.length > 0) {
                                                        let total = 0, subTotal = 0;
                                                        cartResponse.gifts.forEach(async (cartGift) => {
                                                                cartGift.total = parseFloat((cartGift.giftPriceId.price * cartGift.quantity).toFixed(2));
                                                                cartGift.subTotal = parseFloat((cartGift.giftPriceId.price * cartGift.quantity).toFixed(2));
                                                                subTotal += cartGift.subTotal;
                                                                total += cartGift.total;
                                                                let obj = {
                                                                        senderUser: req.user._id,
                                                                        code: cartResponse.orderId,
                                                                        title: 'Buy a gift Card',
                                                                        email: cartGift.email,
                                                                        description: "Your friend Gift a gift card",
                                                                        price: cartGift.giftPriceId.price,
                                                                        discount: cartGift.giftPriceId.giftCardrewards,
                                                                        per: "Amount",
                                                                }
                                                                orderObjTotalAmount = orderObjTotalAmount + total;
                                                                orderObjPaidAmount = orderObjPaidAmount + total;
                                                                let saveOrder = await coupanModel.create(obj);
                                                                if (saveOrder) {
                                                                        giftOrderId = saveOrder._id;
                                                                        let orderObj = {
                                                                                userId: req.user._id,
                                                                                orderId: orderId,
                                                                                giftOrder: giftOrderId,
                                                                                productOrder: productOrderId,
                                                                                serviceOrder: serviceOrderId,
                                                                                orderObjTotalAmount: orderObjTotalAmount.toFixed(2),
                                                                                couponDiscount: couponDiscount,
                                                                                orderObjPaidAmount: orderObjPaidAmount.toFixed(2),
                                                                        }
                                                                        let saveOrder1 = await userOrders.create(orderObj);
                                                                        return res.status(200).json({ msg: "product added to cart", data: saveOrder1 });
                                                                }
                                                        });
                                                } else if (cartResponse.services.length > 0 && cartResponse.products.length == 0) {
                                                        orderObjTotalAmount = orderObjTotalAmount;
                                                        let orderObj = {
                                                                userId: req.user._id,
                                                                orderId: orderId,
                                                                productOrder: productOrderId,
                                                                serviceOrder: serviceOrderId,
                                                                orderObjTotalAmount: orderObjTotalAmount.toFixed(2),
                                                                applyCoupan: cartResponse.coupon,
                                                                couponDiscount: couponDiscount,
                                                                orderStatus: "confirmed",
                                                                orderObjPaidAmount: orderObjPaidAmount.toFixed(2),
                                                        }
                                                        let saveOrder1 = await userOrders.create(orderObj);
                                                        return res.status(200).json({ msg: "product added to cart", data: saveOrder1 });
                                                } else if (cartResponse.services.length > 0 && cartResponse.products.length > 0) {
                                                        orderObjTotalAmount = orderObjTotalAmount;
                                                        let orderObj = {
                                                                userId: req.user._id,
                                                                orderId: orderId,
                                                                productOrder: productOrderId,
                                                                serviceOrder: serviceOrderId,
                                                                orderObjTotalAmount: orderObjTotalAmount.toFixed(2),
                                                                applyCoupan: cartResponse.coupon,
                                                                couponDiscount: couponDiscount,
                                                                orderObjPaidAmount: orderObjPaidAmount.toFixed(2),
                                                        }
                                                        let saveOrder1 = await userOrders.create(orderObj);
                                                        return res.status(200).json({ msg: "product added to cart", data: saveOrder1 });
                                                } else {
                                                        orderObjTotalAmount = orderObjTotalAmount;
                                                        let orderObj = {
                                                                userId: req.user._id,
                                                                orderId: orderId,
                                                                productOrder: productOrderId,
                                                                serviceOrder: serviceOrderId,
                                                                orderObjTotalAmount: orderObjTotalAmount.toFixed(2),
                                                                applyCoupan: cartResponse.coupon,
                                                                couponDiscount: couponDiscount,
                                                                orderObjPaidAmount: orderObjPaidAmount.toFixed(2),
                                                        }
                                                        let saveOrder1 = await userOrders.create(orderObj);
                                                        return res.status(200).json({ msg: "product added to cart", data: saveOrder1 });
                                                }
                                        } else {
                                                return res.status(400).json({ status: 400, msg: "This Slot already booked. ", data: {} });
                                        }
                                } else {
                                        if (cartResponse.products.length > 0 || cartResponse.frequentlyBuyProductSchema.length > 0) {
                                                let shipping = 0, productFBPTotal = 0, productArray = [], frequentlyBuyProductArray = [], offerDiscount = 0, membershipDiscount = 0, membershipDiscountPercentage = 0, total = 0, subTotal = 0;
                                                for (const cartProduct of cartResponse.products) {
                                                        if (cartProduct.productId.multipleSize == true) {
                                                                for (let i = 0; i < cartProduct.productId.sizePrice.length; i++) {
                                                                        if ((cartProduct.productId.sizePrice[i]._id == cartProduct.priceId) == true) {
                                                                                if (data3.isSubscription === true) {
                                                                                        const findSubscription = await Subscription.findById(data3.subscriptionId);
                                                                                        if (findSubscription) {
                                                                                                membershipDiscountPercentage = findSubscription.discount;
                                                                                        }
                                                                                        let x = (parseFloat((cartProduct.productId.sizePrice[i].price * cartProduct.quantity).toFixed(2)) * parseFloat((membershipDiscountPercentage / 100).toFixed(2)));
                                                                                        cartProduct.membershipDiscount = parseFloat(x.toFixed(2))
                                                                                        membershipDiscount += x;
                                                                                        cartProduct.subTotal = parseFloat((cartProduct.productId.sizePrice[i].price * cartProduct.quantity).toFixed(2));
                                                                                        cartProduct.total = parseFloat((cartProduct.productId.sizePrice[i].price * cartProduct.quantity).toFixed(2) - x);
                                                                                        cartProduct.offerDiscount = 0.00;
                                                                                        offerDiscount += cartProduct.offerDiscount;
                                                                                        subTotal += cartProduct.subTotal;
                                                                                        total += (cartProduct.total - membershipDiscount);
                                                                                        productFBPTotal += cartProduct.total
                                                                                        const newCartItem = {
                                                                                                productId: cartProduct.productId._id,
                                                                                                price: cartProduct.productId.sizePrice[i].price,
                                                                                                size: cartProduct.size,
                                                                                                quantity: cartProduct.quantity,
                                                                                        };
                                                                                        productArray.push(newCartItem);
                                                                                } else {
                                                                                        membershipDiscount += 0;
                                                                                        cartProduct.membershipDiscount = membershipDiscount
                                                                                        cartProduct.subTotal = parseFloat((cartProduct.productId.sizePrice[i].price * cartProduct.quantity).toFixed(2));
                                                                                        cartProduct.total = parseFloat((cartProduct.productId.sizePrice[i].price * cartProduct.quantity).toFixed(2));
                                                                                        cartProduct.offerDiscount = 0.00;
                                                                                        offerDiscount += cartProduct.offerDiscount;
                                                                                        subTotal += cartProduct.subTotal;
                                                                                        total += (cartProduct.total);
                                                                                        productFBPTotal += cartProduct.total
                                                                                        const newCartItem = {
                                                                                                productId: cartProduct.productId._id,
                                                                                                price: cartProduct.productId.sizePrice[i].price,
                                                                                                size: cartProduct.size,
                                                                                                quantity: cartProduct.quantity,
                                                                                        };
                                                                                        productArray.push(newCartItem);
                                                                                }
                                                                        }
                                                                }
                                                        } else {
                                                                if (data3.isSubscription === true) {
                                                                        const findSubscription = await Subscription.findById(data3.subscriptionId);
                                                                        if (findSubscription) {
                                                                                membershipDiscountPercentage = findSubscription.discount;
                                                                        }
                                                                        let x = (parseFloat((cartProduct.productId.price * cartProduct.quantity).toFixed(2)) * parseFloat((membershipDiscountPercentage / 100).toFixed(2)));
                                                                        cartProduct.membershipDiscount = parseFloat(x.toFixed(2))
                                                                        membershipDiscount += x;
                                                                        cartProduct.subTotal = parseFloat((cartProduct.productId.price * cartProduct.quantity).toFixed(2));
                                                                        cartProduct.total = parseFloat((cartProduct.productId.price * cartProduct.quantity).toFixed(2) - x);
                                                                        cartProduct.offerDiscount = 0.00;
                                                                        offerDiscount += cartProduct.offerDiscount;
                                                                        subTotal += cartProduct.subTotal;
                                                                        total += (cartProduct.total - membershipDiscount);
                                                                        productFBPTotal += cartProduct.total
                                                                        const newCartItem = {
                                                                                productId: cartProduct.productId._id,
                                                                                price: cartProduct.productId.price,
                                                                                quantity: cartProduct.quantity,
                                                                        };
                                                                        productArray.push(newCartItem)
                                                                } else {
                                                                        let x = 0.00;
                                                                        cartProduct.membershipDiscount = parseFloat(x.toFixed(2))
                                                                        membershipDiscount += x;
                                                                        cartProduct.subTotal = parseFloat((cartProduct.productId.price * cartProduct.quantity).toFixed(2));
                                                                        cartProduct.total = parseFloat((cartProduct.productId.price * cartProduct.quantity).toFixed(2));
                                                                        cartProduct.offerDiscount = 0.00;
                                                                        offerDiscount += cartProduct.offerDiscount;
                                                                        subTotal += cartProduct.subTotal;
                                                                        total += cartProduct.total;
                                                                        productFBPTotal += cartProduct.total
                                                                        const newCartItem = {
                                                                                productId: cartProduct.productId._id,
                                                                                price: cartProduct.productId.price,
                                                                                quantity: cartProduct.quantity,
                                                                        };
                                                                        productArray.push(newCartItem)
                                                                }
                                                        }
                                                }
                                                cartResponse.frequentlyBuyProductSchema.forEach((cartFBP) => {
                                                        cartFBP.total = parseFloat((cartFBP.frequentlyBuyProductId.price * cartFBP.quantity).toFixed(2));
                                                        cartFBP.subTotal = parseFloat((cartFBP.frequentlyBuyProductId.price * cartFBP.quantity).toFixed(2));
                                                        subTotal += cartFBP.subTotal;
                                                        total += cartFBP.total;
                                                        productFBPTotal += cartFBP.total
                                                        const newCartItem = {
                                                                frequentlyBuyProductId: cartFBP.frequentlyBuyProductId._id,
                                                                price: cartFBP.frequentlyBuyProductId.price,
                                                                quantity: cartFBP.quantity,
                                                        };
                                                        frequentlyBuyProductArray.push(newCartItem);
                                                });
                                                cartResponse.subTotal = subTotal;
                                                cartResponse.memberShipPer = Number(membershipDiscountPercentage);
                                                cartResponse.memberShip = parseFloat(membershipDiscount).toFixed(2)
                                                cartResponse.offerDiscount = Number(offerDiscount);
                                                if (cartResponse.pickupFromStore == true) {
                                                        shipping = 0.00;
                                                        cartResponse.shipping = parseFloat(shipping.toFixed(2));
                                                        cartResponse.pickUp = data1;
                                                        cartResponse.billingAddresss = data5;
                                                        cartResponse.total = cartResponse.subTotal - membershipDiscount
                                                        orderObjPaidAmount = orderObjPaidAmount + cartResponse.subTotal - membershipDiscount;
                                                } else {
                                                        shipping = 0.00;
                                                        if (productFBPTotal <= 150) {
                                                                shipping = 8.00;
                                                                cartResponse.shipping = parseFloat(shipping.toFixed(2));
                                                        } else {
                                                                shipping = 12.00;
                                                                cartResponse.shipping = parseFloat(shipping.toFixed(2));
                                                        }
                                                        cartResponse.deliveryAddresss = data2;
                                                        cartResponse.billingAddresss = data5;
                                                        cartResponse.shipping = shipping;
                                                        cartResponse.total = cartResponse.subTotal + shipping - membershipDiscount
                                                        orderObjPaidAmount = orderObjPaidAmount + cartResponse.subTotal + shipping - membershipDiscount;
                                                }
                                                cartResponse.products = productArray;
                                                cartResponse.frequentlyBuyProductSchema = frequentlyBuyProductArray;
                                                cartResponse._id = new mongoose.Types.ObjectId();
                                                orderObjTotalAmount = orderObjTotalAmount + orderObjPaidAmount;
                                                let saveOrder = await productOrder.create(cartResponse);
                                                productOrderId = saveOrder._id;
                                        }
                                        if (cartResponse.gifts.length > 0) {
                                                let total = 0, subTotal = 0;
                                                cartResponse.gifts.forEach(async (cartGift) => {
                                                        cartGift.total = parseFloat((cartGift.giftPriceId.price * cartGift.quantity).toFixed(2));
                                                        cartGift.subTotal = parseFloat((cartGift.giftPriceId.price * cartGift.quantity).toFixed(2));
                                                        subTotal += cartGift.subTotal;
                                                        total += cartGift.total;
                                                        let obj = {
                                                                senderUser: req.user._id,
                                                                code: cartResponse.orderId,
                                                                title: 'Buy a gift Card',
                                                                email: cartGift.email,
                                                                description: "Your friend Gift a gift card",
                                                                price: cartGift.giftPriceId.price,
                                                                discount: cartGift.giftPriceId.giftCardrewards,
                                                                per: "Amount",
                                                        }
                                                        orderObjTotalAmount = orderObjTotalAmount + total;
                                                        orderObjPaidAmount = orderObjPaidAmount + total;
                                                        let saveOrder = await coupanModel.create(obj);
                                                        if (saveOrder) {
                                                                giftOrderId = saveOrder._id;
                                                                let orderObj = {
                                                                        userId: req.user._id,
                                                                        orderId: orderId,
                                                                        giftOrder: giftOrderId,
                                                                        productOrder: productOrderId,
                                                                        orderObjTotalAmount: orderObjTotalAmount.toFixed(2),
                                                                        couponDiscount: couponDiscount,
                                                                        orderObjPaidAmount: orderObjPaidAmount.toFixed(2),
                                                                }
                                                                let saveOrder1 = await userOrders.create(orderObj);
                                                                return res.status(200).json({ msg: "product added to cart", data: saveOrder1 });
                                                        }
                                                });
                                        } else {
                                                orderObjTotalAmount = orderObjTotalAmount;
                                                let orderObj = {
                                                        userId: req.user._id,
                                                        orderId: orderId,
                                                        productOrder: productOrderId,
                                                        orderObjTotalAmount: orderObjTotalAmount.toFixed(2),
                                                        applyCoupan: cartResponse.coupon,
                                                        couponDiscount: couponDiscount,
                                                        orderObjPaidAmount: orderObjPaidAmount.toFixed(2),
                                                }
                                                let saveOrder1 = await userOrders.create(orderObj);
                                                return res.status(200).json({ msg: "product added to cart", data: saveOrder1 });
                                        }
                                }
                        } else {
                                return res.status(200).json({ success: false, msg: "Cart is empty", cart: {} });
                        }
                } else {
                        let findCart = await Cart.findOne({ user: req.user._id }).populate([{ path: "products.productId", select: { reviews: 0 } }, { path: "gifts.giftPriceId", select: { reviews: 0 } }, { path: "AddOnservicesSchema.addOnservicesId", select: { reviews: 0 } }, { path: "services.serviceId", select: { reviews: 0 } }, { path: 'frequentlyBuyProductSchema.frequentlyBuyProductId', populate: { path: 'products', model: 'Product' }, select: { reviews: 0 } }, { path: "coupon", select: "couponCode discount expirationDate used per" },]);
                        if (findCart) {
                                const data1 = await Address.findOne({ type: "Admin" }).select('address appartment landMark -_id');
                                const data2 = await Address.findOne({ user: req.user._id, addressType: "Shipping" }).select('address appartment city state zipCode -_id');
                                const data5 = await Address.findOne({ user: req.user._id, addressType: "Billing" }).select('address appartment city state zipCode -_id');
                                const data3 = await User.findOne({ _id: req.user._id });
                                let orderObjPaidAmount = 0, productOrderId, serviceOrderId, giftOrderId, couponDiscount = 0, orderObjTotalAmount = 0;
                                if (findCart.coupon && moment().isAfter(findCart.coupon.expirationDate, "day")) { findCart.coupon = undefined; findCart.save(); }
                                const cartResponse = findCart.toObject();
                                let orderId = await reffralCode();
                                cartResponse.orderId = orderId;
                                if (cartResponse.services.length > 0 || cartResponse.AddOnservicesSchema.length > 0) {
                                        const dateObject = new Date(findCart.date);
                                        const dateString = dateObject.toISOString().split('T')[0];
                                        const newTime = "00:00:00.000+00:00";
                                        const replacedDateString = `${dateString}T${newTime}`;
                                        let findSlot1 = await slot.find({ from: { $lte: findCart.fromTime }, to: { $gte: findCart.toTime }, date: replacedDateString, isBooked: false, slotBlocked: false });
                                        if (findSlot1.length > 0) {
                                                if (cartResponse.products.length > 0 || cartResponse.frequentlyBuyProductSchema.length > 0) {
                                                        let shipping = 0, productFBPTotal = 0, productArray = [], frequentlyBuyProductArray = [], offerDiscount = 0, membershipDiscount = 0, membershipDiscountPercentage = 0, total = 0, subTotal = 0;
                                                        for (const cartProduct of cartResponse.products) {
                                                                if (cartProduct.productId.multipleSize == true) {
                                                                        for (let i = 0; i < cartProduct.productId.sizePrice.length; i++) {
                                                                                if ((cartProduct.productId.sizePrice[i]._id == cartProduct.priceId) == true) {
                                                                                        if (data3.isSubscription === true) {
                                                                                                const findSubscription = await Subscription.findById(data3.subscriptionId);
                                                                                                if (findSubscription) {
                                                                                                        membershipDiscountPercentage = findSubscription.discount;
                                                                                                }
                                                                                                let x = (parseFloat((cartProduct.productId.sizePrice[i].price * cartProduct.quantity).toFixed(2)) * parseFloat((membershipDiscountPercentage / 100).toFixed(2)));
                                                                                                cartProduct.membershipDiscount = parseFloat(x.toFixed(2))
                                                                                                membershipDiscount += x;
                                                                                                cartProduct.subTotal = parseFloat((cartProduct.productId.sizePrice[i].price * cartProduct.quantity).toFixed(2));
                                                                                                cartProduct.total = parseFloat((cartProduct.productId.sizePrice[i].price * cartProduct.quantity).toFixed(2) - x);
                                                                                                cartProduct.offerDiscount = 0.00;
                                                                                                offerDiscount += cartProduct.offerDiscount;
                                                                                                subTotal += cartProduct.subTotal;
                                                                                                total += (cartProduct.total - membershipDiscount);
                                                                                                productFBPTotal += cartProduct.total
                                                                                                const newCartItem = {
                                                                                                        productId: cartProduct.productId._id,
                                                                                                        price: cartProduct.productId.sizePrice[i].price,
                                                                                                        size: cartProduct.size,
                                                                                                        quantity: cartProduct.quantity,
                                                                                                };
                                                                                                productArray.push(newCartItem);
                                                                                        } else {
                                                                                                membershipDiscount += 0;
                                                                                                cartProduct.membershipDiscount = membershipDiscount
                                                                                                cartProduct.subTotal = parseFloat((cartProduct.productId.sizePrice[i].price * cartProduct.quantity).toFixed(2));
                                                                                                cartProduct.total = parseFloat((cartProduct.productId.sizePrice[i].price * cartProduct.quantity).toFixed(2));
                                                                                                cartProduct.offerDiscount = 0.00;
                                                                                                offerDiscount += cartProduct.offerDiscount;
                                                                                                subTotal += cartProduct.subTotal;
                                                                                                total += (cartProduct.total);
                                                                                                productFBPTotal += cartProduct.total
                                                                                                const newCartItem = {
                                                                                                        productId: cartProduct.productId._id,
                                                                                                        price: cartProduct.productId.sizePrice[i].price,
                                                                                                        size: cartProduct.size,
                                                                                                        quantity: cartProduct.quantity,
                                                                                                };
                                                                                                productArray.push(newCartItem);
                                                                                        }
                                                                                }
                                                                        }
                                                                } else {
                                                                        if (data3.isSubscription === true) {
                                                                                const findSubscription = await Subscription.findById(data3.subscriptionId);
                                                                                if (findSubscription) {
                                                                                        membershipDiscountPercentage = findSubscription.discount;
                                                                                }
                                                                                let x = (parseFloat((cartProduct.productId.price * cartProduct.quantity).toFixed(2)) * parseFloat((membershipDiscountPercentage / 100).toFixed(2)));
                                                                                cartProduct.membershipDiscount = parseFloat(x.toFixed(2))
                                                                                membershipDiscount += x;
                                                                                cartProduct.subTotal = parseFloat((cartProduct.productId.price * cartProduct.quantity).toFixed(2));
                                                                                cartProduct.total = parseFloat((cartProduct.productId.price * cartProduct.quantity).toFixed(2) - x);
                                                                                cartProduct.offerDiscount = 0.00;
                                                                                offerDiscount += cartProduct.offerDiscount;
                                                                                subTotal += cartProduct.subTotal;
                                                                                total += (cartProduct.total - membershipDiscount);
                                                                                productFBPTotal += cartProduct.total
                                                                                const newCartItem = {
                                                                                        productId: cartProduct.productId._id,
                                                                                        price: cartProduct.productId.price,
                                                                                        quantity: cartProduct.quantity,
                                                                                };
                                                                                productArray.push(newCartItem)
                                                                        } else {
                                                                                let x = 0.00;
                                                                                cartProduct.membershipDiscount = parseFloat(x.toFixed(2))
                                                                                membershipDiscount += x;
                                                                                cartProduct.subTotal = parseFloat((cartProduct.productId.price * cartProduct.quantity).toFixed(2));
                                                                                cartProduct.total = parseFloat((cartProduct.productId.price * cartProduct.quantity).toFixed(2));
                                                                                cartProduct.offerDiscount = 0.00;
                                                                                offerDiscount += cartProduct.offerDiscount;
                                                                                subTotal += cartProduct.subTotal;
                                                                                total += cartProduct.total;
                                                                                productFBPTotal += cartProduct.total
                                                                                const newCartItem = {
                                                                                        productId: cartProduct.productId._id,
                                                                                        price: cartProduct.productId.price,
                                                                                        quantity: cartProduct.quantity,
                                                                                };
                                                                                productArray.push(newCartItem)
                                                                        }
                                                                }
                                                        }
                                                        cartResponse.frequentlyBuyProductSchema.forEach((cartFBP) => {
                                                                cartFBP.total = parseFloat((cartFBP.frequentlyBuyProductId.price * cartFBP.quantity).toFixed(2));
                                                                cartFBP.subTotal = parseFloat((cartFBP.frequentlyBuyProductId.price * cartFBP.quantity).toFixed(2));
                                                                subTotal += cartFBP.subTotal;
                                                                total += cartFBP.total;
                                                                productFBPTotal += cartFBP.total
                                                                const newCartItem = {
                                                                        frequentlyBuyProductId: cartFBP.frequentlyBuyProductId._id,
                                                                        price: cartFBP.frequentlyBuyProductId.price,
                                                                        quantity: cartFBP.quantity,
                                                                };
                                                                frequentlyBuyProductArray.push(newCartItem);
                                                        });
                                                        cartResponse.subTotal = subTotal;
                                                        cartResponse.memberShipPer = Number(membershipDiscountPercentage);
                                                        cartResponse.memberShip = parseFloat(membershipDiscount).toFixed(2)
                                                        cartResponse.offerDiscount = Number(offerDiscount);
                                                        if (cartResponse.pickupFromStore == true) {
                                                                shipping = 0.00;
                                                                cartResponse.shipping = parseFloat(shipping.toFixed(2));
                                                                cartResponse.pickUp = data1;
                                                                cartResponse.billingAddresss = data5;
                                                                cartResponse.total = cartResponse.subTotal - membershipDiscount
                                                                orderObjPaidAmount = orderObjPaidAmount + cartResponse.subTotal - membershipDiscount;
                                                        } else {
                                                                shipping = 0.00;
                                                                if (productFBPTotal <= 150) {
                                                                        shipping = 8.00;
                                                                        cartResponse.shipping = parseFloat(shipping.toFixed(2));
                                                                } else {
                                                                        shipping = 12.00;
                                                                        cartResponse.shipping = parseFloat(shipping.toFixed(2));
                                                                }
                                                                cartResponse.deliveryAddresss = data2;
                                                                cartResponse.billingAddresss = data5;
                                                                cartResponse.shipping = shipping;
                                                                cartResponse.total = cartResponse.subTotal + shipping - membershipDiscount
                                                                orderObjPaidAmount = orderObjPaidAmount + cartResponse.subTotal + shipping - membershipDiscount;
                                                        }
                                                        cartResponse.products = productArray;
                                                        cartResponse.frequentlyBuyProductSchema = frequentlyBuyProductArray;
                                                        cartResponse._id = new mongoose.Types.ObjectId();
                                                        orderObjTotalAmount = orderObjTotalAmount + orderObjPaidAmount;
                                                        let saveOrder = await productOrder.create(cartResponse);
                                                        productOrderId = saveOrder._id;
                                                }
                                                if (cartResponse.services.length > 0 || cartResponse.AddOnservicesSchema.length > 0) {
                                                        let totalTime = 0;
                                                        let offerDiscount = 0, membershipDiscount = 0, membershipDiscountPercentage = 0, total = 0, subTotal = 0;
                                                        if (cartResponse.services.length > 0) {
                                                                for (const cartProduct of cartResponse.services) {
                                                                        if (cartProduct.serviceId.type === "offer") {
                                                                                cartProduct.subTotal = parseFloat((cartProduct.serviceId.price * cartProduct.quantity).toFixed(2));
                                                                                cartProduct.total = parseFloat((cartProduct.price * cartProduct.quantity).toFixed(2));
                                                                                cartProduct.offerDiscount = parseFloat(((cartProduct.serviceId.price - cartProduct.price) * cartProduct.quantity).toFixed(2));
                                                                                offerDiscount += cartProduct.offerDiscount;
                                                                                subTotal += cartProduct.subTotal;
                                                                                total += cartProduct.total;
                                                                        }
                                                                        if (cartProduct.serviceId.type === "Service") {
                                                                                if (data3.isSubscription === true) {
                                                                                        if (cartProduct.serviceId.multipleSize == true) {
                                                                                                let x = (parseFloat((cartProduct.price * cartProduct.quantity).toFixed(2)) - parseFloat((cartProduct.memberprice * cartProduct.quantity).toFixed(2)));
                                                                                                cartProduct.membershipDiscount = parseFloat(x.toFixed(2))
                                                                                                membershipDiscount += x;
                                                                                                cartProduct.subTotal = parseFloat((cartProduct.price * cartProduct.quantity).toFixed(2));
                                                                                                cartProduct.total = parseFloat((cartProduct.memberprice * cartProduct.quantity).toFixed(2));
                                                                                                cartProduct.offerDiscount = 0.00;
                                                                                                offerDiscount += cartProduct.offerDiscount;
                                                                                                total += cartProduct.total;
                                                                                                subTotal += cartProduct.subTotal;
                                                                                        } else {
                                                                                                let x = (parseFloat((cartProduct.price * cartProduct.quantity).toFixed(2)) - parseFloat((cartProduct.memberprice * cartProduct.quantity).toFixed(2)));
                                                                                                cartProduct.membershipDiscount = parseFloat(x.toFixed(2))
                                                                                                membershipDiscount += x;
                                                                                                cartProduct.subTotal = parseFloat((cartProduct.memberprice * cartProduct.quantity).toFixed(2));
                                                                                                cartProduct.total = parseFloat((cartProduct.memberprice * cartProduct.quantity).toFixed(2));
                                                                                                cartProduct.offerDiscount = 0.00;
                                                                                                offerDiscount += cartProduct.offerDiscount;
                                                                                                total += cartProduct.total;
                                                                                                subTotal += cartProduct.subTotal;
                                                                                        }
                                                                                } else {
                                                                                        if (cartProduct.serviceId.multipleSize == true) {
                                                                                                let x = 0
                                                                                                cartProduct.membershipDiscount = parseFloat(x.toFixed(2))
                                                                                                membershipDiscount += x;
                                                                                                cartProduct.subTotal = parseFloat((cartProduct.price * cartProduct.quantity).toFixed(2));
                                                                                                cartProduct.total = parseFloat((cartProduct.price * cartProduct.quantity).toFixed(2) - x);
                                                                                                cartProduct.offerDiscount = 0.00;
                                                                                                offerDiscount += cartProduct.offerDiscount;
                                                                                                total += cartProduct.total;
                                                                                                subTotal += cartProduct.subTotal;
                                                                                        } else {
                                                                                                let x = 0
                                                                                                cartProduct.membershipDiscount = parseFloat(x.toFixed(2))
                                                                                                membershipDiscount += x;
                                                                                                cartProduct.subTotal = parseFloat((cartProduct.price * cartProduct.quantity).toFixed(2));
                                                                                                cartProduct.total = parseFloat((cartProduct.price * cartProduct.quantity).toFixed(2) - x);
                                                                                                cartProduct.offerDiscount = 0.00;
                                                                                                offerDiscount += cartProduct.offerDiscount;
                                                                                                total += cartProduct.total;
                                                                                                subTotal += cartProduct.subTotal;
                                                                                        }
                                                                                }
                                                                        }
                                                                }
                                                        }
                                                        if (cartResponse.AddOnservicesSchema.length > 0) {
                                                                cartResponse.AddOnservicesSchema.forEach((cartGift) => {
                                                                        cartGift.total = parseFloat((cartGift.price * cartGift.quantity).toFixed(2));
                                                                        cartGift.subTotal = parseFloat((cartGift.price * cartGift.quantity).toFixed(2));
                                                                        subTotal += cartGift.subTotal;
                                                                        total += cartGift.total;
                                                                });
                                                        }
                                                        if (findCart.toTime != (null || undefined)) {
                                                                if (findCart.services.length > 0) {
                                                                        for (let i = 0; i < findCart.services.length; i++) {
                                                                                totalTime = totalTime + findCart.services[i].serviceId.totalMin;
                                                                        }
                                                                }
                                                                if (findCart.AddOnservicesSchema.length > 0) {
                                                                        for (let i = 0; i < findCart.AddOnservicesSchema.length; i++) {
                                                                                totalTime = totalTime + findCart.AddOnservicesSchema[i].addOnservicesId.totalMin;
                                                                        }
                                                                }
                                                        }
                                                        cartResponse.date = findCart.date;
                                                        cartResponse.toTime = findCart.toTime;
                                                        cartResponse.fromTime = findCart.fromTime;
                                                        cartResponse.time = findCart.time;
                                                        cartResponse.suggesstion = findCart.suggesstion;
                                                        cartResponse.memberShipPer = Number(membershipDiscountPercentage);
                                                        cartResponse.memberShip = parseFloat(membershipDiscount).toFixed(2)
                                                        cartResponse.offerDiscount = Number(offerDiscount);
                                                        cartResponse.subTotal = subTotal;
                                                        cartResponse.total = total;
                                                        cartResponse.serviceAddresss = data1;
                                                        orderObjTotalAmount = orderObjTotalAmount + total;
                                                        cartResponse._id = new mongoose.Types.ObjectId();
                                                        cartResponse.orderStatus = "confirmed";
                                                        const inputDate = new Date(findCart.toTime);
                                                        const options = {
                                                                weekday: 'long',
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric',
                                                                hour: 'numeric',
                                                                minute: 'numeric',
                                                                hour12: true
                                                        };
                                                        const formattedDate = inputDate.toLocaleString('en-US', { ...options, timeZone: 'UTC' });
                                                        console.log(formattedDate);
                                                        if (totalTime > 0) {
                                                                var hours2 = Math.floor(totalTime / 60);
                                                                var minutes2 = totalTime % 60;
                                                                let timeInMin = hours2 + "hr" + " " + minutes2 + "min"
                                                                cartResponse.timeInMin = timeInMin;
                                                        }
                                                        let saveOrder = await serviceOrder.create(cartResponse);
                                                        if (saveOrder) {
                                                                const dateObject = new Date(findCart.date);
                                                                const dateString = dateObject.toISOString().split('T')[0];
                                                                const newTime = "00:00:00.000+00:00";
                                                                const replacedDateString = `${dateString}T${newTime}`;
                                                                console.log({ from: { $lte: findCart.fromTime }, to: { $gte: findCart.toTime }, isBooked: false });
                                                                if (saveOrder) {
                                                                        const data4 = await User.findOne({ userType: "ADMIN" });
                                                                        let findSlot = await slot.find({ from: { $lte: findCart.fromTime }, to: { $gte: findCart.toTime }, date: replacedDateString, isBooked: false, slotBlocked: false });
                                                                        if (findSlot.length > 0) {
                                                                                for (let i = 0; i < findSlot.length; i++) {
                                                                                        let updateSlot = await slot.findByIdAndUpdate({ _id: findSlot[i]._id }, { $set: { isBooked: true } }, { new: true });
                                                                                        console.log(`Slot with ID ${findSlot[i]._id} is now booked.`);
                                                                                }
                                                                        }
                                                                        await adminNotification.create({
                                                                                orderUserId: req.user._id,
                                                                                userId: data4._id,
                                                                                title: `${data3.firstName} ${data3.lastName}, book online ${saveOrder.total}`,
                                                                                body: findCart.services[0].serviceId.description,
                                                                        })
                                                                        var transporter = nodemailer.createTransport({ service: 'gmail', auth: { "user": "info@shahinahoja.com", "pass": "gganlypsemwqhwlh" } });
                                                                        let mailOptions = {
                                                                                from: '<do_not_reply@gmail.com>',
                                                                                to: `${req.user.email}`,
                                                                                cc: 'info@shahinahoja.com',
                                                                                subject: 'Order Received',
                                                                                text: `You have received a new order`,
                                                                                html: `<html lang="en">
                                                                                <head>
                                                                                    <meta charset="UTF-8" />
                                                                                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                                                                                    <title>Email</title>
                                                                                </head>
                                                                                <body>
                                                                                    <div style="width: 100%; height: 100%">
                                                                                        <div style="background-color: white;max-width: 600px;margin: auto;border: 1px solid black;
                                                                                                                                                                      ">
                                                                                            <div style="  width: 90%;  margin: auto;  margin-top: 2rem;  margin-bottom: 4rem;">
                                                                                                <button
                                                                                                    style="color: white;border-left: 50%;padding: 5px;height: 2rem;width: 7rem;border-radius: 1rem;background-color: blueviolet;border: none;outline: none;">Confirmed</button>
                                                                                                <div style="margin-top: 2rem">
                                                                                                    <p style="font-size: 30px; font-weight: bold">
                                                                                                        Looking forward to seeing you soon Nisan
                                                                                                    </p>
                                                                                                </div>
                                                                                                <p style="margin-top: 1rem">
                                                                                                    This is a friendly reminder about your appointment on
                                                                                                    <span style="color: rgb(153, 74, 228)">${formattedDate}</span>
                                                                                                    with Shahina Hoja Aesthetics.
                                                                                                </p>
                                                                                                <div>
                                                                                                    <a href="https://shahina-web.vercel.app/"><button style="width: 100%;padding: 10px;background-color: black;color: white;border: none;outline: none;cursor: pointer;border-radius: 3px;font-size: 1rem;">Get directions</button></a>
                                                                                                    <a href="https://shahina-web.vercel.app/" target='_blank'><button style="width: 100%;padding: 10px;cursor: pointers;outline: none;border-radius: 3px;cursor: pointer;font-size: 1rem;margin-top: 1rem;">Manage appointment</button></a>
                                                                                                </div>
                                                                                                <!-- bottom main -->
                                                                                                <div style="margin-top: 1.5rem">
                                                                                                    <h4 style="font-size: 1.5rem; font-weight: bold">
                                                                                                        Appointment details
                                                                                                    </h4>
                                                                                                    <div style="margin-top: 1rem;display: flex;justify-content: space-between;">
                                                                                                        <div>
                                                                                                            <ul>
                                                                                                                ${findCart.services.map((service, index) => `
                                                                                                                    <h5 style="font-weight: bold; font-size: 1rem">${service.serviceId.name}                   $ ${service.price}</h5>
                                                                                                                    <p style="color: rgb(131, 120, 120)"> ${service.totalTime}  with  Shahina</p>
                                                                                                                    `).join('')}
                                                                                                            </ul>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                    <hr style="margin-top: 0.5rem; line-height: 7px" />
                                                                                                    <div style="margin-top: 0.5rem;display: flex;justify-content: space-between;">
                                                                                                        <div>
                                                                                                            <p style="font-weight: bold">Total</p>
                                                                                                        </div>
                                                                                                        <p style="font-weight: bold">$ ${saveOrder.total}</p>
                                                                                                    </div>
                                                                                                    <hr style="margin-top: 1rem" />
                                                                                                </div>
                                                                                
                                                                                                <p style="color: rgb(142, 133, 133); margin-top: 0.5rem">Booking ref: ${orderId}</p>
                                                                                
                                                                                                <div>
                                                                                                    <h3 style="margin-top: 1rem">Location</h3>
                                                                                                    <div style="margin-top: 0.5rem;display: flex;justify-content: space-between;">
                                                                                                        <div style="line-height: 20px">
                                                                                                            <h5>Shahine Hoja Aesthetics</h5>
                                                                                                            <p style="color: rgb(100, 28, 162)">
                                                                                                                Shahina Hoja Aesthetics
905 Watters Creek Boulevard ,141 Allen, 75013, Texas, Us
                                                                                                            </p>
                                                                                                        </div>
                                                                                                        <img src="https://res.cloudinary.com/djgrqoefp/image/upload/v1704388341/shahina/contactDetail/lv8rvmn6nbkzbzekiexq.png"
                                                                                                            style="height: 50px; width: 50px; margin-left:25px; border-radius: 10px" />
                                                                                                    </div>
                                                                                                </div>
                                                                                
                                                                                                <div style="margin-top: 1.5rem; line-height: 20px">
                                                                                                    <h3>Cancellation Policy</h3>
                                                                                                    <p style="margin-top: 1rem">
                                                                                                        Please avoid Cancellation with in <strong>48 hours</strong> of your
                                                                                                        appointment
                                                                                                    </p>
                                                                                                </div>
                                                                                
                                                                                                <div style="margin-top: 1.5rem; line-height: 20px">
                                                                                                    <h3>Important Info</h3>
                                                                                                    <p style="margin-top: 1rem">
                                                                                                        We are now offering payment plans through cherry. if you're
                                                                                                        interseted , please apply hare appointment
                                                                                                    </p>
                                                                                                    <p style="color: blueviolet; cursor: pointer">
                                                                                                    https://pay.withcherry.com/shahinahoja
                                                                                                    </p>
                                                                                                </div>
                                                                                                <p style="margin-top: 2.5rem">
                                                                                                    we send you this because you have booked with shahine hoja Aesthics,
                                                                                                    which partners with for appoinment and payments.
                                                                                                </p>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </body>
                                                                                </html>`
                                                                        };
                                                                        let info1 = await transporter.sendMail(mailOptions);
                                                                        if (info1) {
                                                                                serviceOrderId = saveOrder._id;
                                                                        } else {
                                                                                serviceOrderId = saveOrder._id;
                                                                        }
                                                                }
                                                        }
                                                }
                                                if (cartResponse.gifts.length > 0) {
                                                        let total = 0, subTotal = 0;
                                                        cartResponse.gifts.forEach(async (cartGift) => {
                                                                cartGift.total = parseFloat((cartGift.giftPriceId.price * cartGift.quantity).toFixed(2));
                                                                cartGift.subTotal = parseFloat((cartGift.giftPriceId.price * cartGift.quantity).toFixed(2));
                                                                subTotal += cartGift.subTotal;
                                                                total += cartGift.total;
                                                                let obj = {
                                                                        senderUser: req.user._id,
                                                                        code: cartResponse.orderId,
                                                                        title: 'Buy a gift Card',
                                                                        email: cartGift.email,
                                                                        description: "Your friend Gift a gift card",
                                                                        price: cartGift.giftPriceId.price,
                                                                        discount: cartGift.giftPriceId.giftCardrewards,
                                                                        per: "Amount",
                                                                }
                                                                orderObjTotalAmount = orderObjTotalAmount + total;
                                                                orderObjPaidAmount = orderObjPaidAmount + total;
                                                                let saveOrder = await coupanModel.create(obj);
                                                                if (saveOrder) {
                                                                        giftOrderId = saveOrder._id;
                                                                        let orderObj = {
                                                                                userId: req.user._id,
                                                                                orderId: orderId,
                                                                                giftOrder: giftOrderId,
                                                                                productOrder: productOrderId,
                                                                                serviceOrder: serviceOrderId,
                                                                                orderObjTotalAmount: orderObjTotalAmount.toFixed(2),
                                                                                couponDiscount: couponDiscount,
                                                                                orderObjPaidAmount: orderObjPaidAmount.toFixed(2),
                                                                        }
                                                                        let saveOrder1 = await userOrders.create(orderObj);
                                                                        return res.status(200).json({ msg: "product added to cart", data: saveOrder1 });
                                                                }
                                                        });
                                                } else if (cartResponse.services.length > 0 && cartResponse.products.length == 0) {
                                                        orderObjTotalAmount = orderObjTotalAmount;
                                                        let orderObj = {
                                                                userId: req.user._id,
                                                                orderId: orderId,
                                                                productOrder: productOrderId,
                                                                serviceOrder: serviceOrderId,
                                                                orderObjTotalAmount: orderObjTotalAmount.toFixed(2),
                                                                applyCoupan: cartResponse.coupon,
                                                                couponDiscount: couponDiscount,
                                                                orderStatus: "confirmed",
                                                                orderObjPaidAmount: orderObjPaidAmount.toFixed(2),
                                                        }
                                                        let saveOrder1 = await userOrders.create(orderObj);
                                                        return res.status(200).json({ msg: "product added to cart", data: saveOrder1 });
                                                } else if (cartResponse.services.length > 0 && cartResponse.products.length > 0) {
                                                        orderObjTotalAmount = orderObjTotalAmount;
                                                        let orderObj = {
                                                                userId: req.user._id,
                                                                orderId: orderId,
                                                                productOrder: productOrderId,
                                                                serviceOrder: serviceOrderId,
                                                                orderObjTotalAmount: orderObjTotalAmount.toFixed(2),
                                                                applyCoupan: cartResponse.coupon,
                                                                couponDiscount: couponDiscount,
                                                                orderObjPaidAmount: orderObjPaidAmount.toFixed(2),
                                                        }
                                                        let saveOrder1 = await userOrders.create(orderObj);
                                                        return res.status(200).json({ msg: "product added to cart", data: saveOrder1 });
                                                } else {
                                                        orderObjTotalAmount = orderObjTotalAmount;
                                                        let orderObj = {
                                                                userId: req.user._id,
                                                                orderId: orderId,
                                                                productOrder: productOrderId,
                                                                serviceOrder: serviceOrderId,
                                                                orderObjTotalAmount: orderObjTotalAmount.toFixed(2),
                                                                applyCoupan: cartResponse.coupon,
                                                                couponDiscount: couponDiscount,
                                                                orderObjPaidAmount: orderObjPaidAmount.toFixed(2),
                                                        }
                                                        let saveOrder1 = await userOrders.create(orderObj);
                                                        return res.status(200).json({ msg: "product added to cart", data: saveOrder1 });
                                                }
                                        } else {
                                                return res.status(400).json({ status: 400, msg: "This Slot already booked. ", data: {} });
                                        }
                                } else {
                                        if (cartResponse.products.length > 0 || cartResponse.frequentlyBuyProductSchema.length > 0) {
                                                let shipping = 0, productFBPTotal = 0, productArray = [], frequentlyBuyProductArray = [], offerDiscount = 0, membershipDiscount = 0, membershipDiscountPercentage = 0, total = 0, subTotal = 0;
                                                for (const cartProduct of cartResponse.products) {
                                                        if (cartProduct.productId.multipleSize == true) {
                                                                for (let i = 0; i < cartProduct.productId.sizePrice.length; i++) {
                                                                        if ((cartProduct.productId.sizePrice[i]._id == cartProduct.priceId) == true) {
                                                                                if (data3.isSubscription === true) {
                                                                                        const findSubscription = await Subscription.findById(data3.subscriptionId);
                                                                                        if (findSubscription) {
                                                                                                membershipDiscountPercentage = findSubscription.discount;
                                                                                        }
                                                                                        let x = (parseFloat((cartProduct.productId.sizePrice[i].price * cartProduct.quantity).toFixed(2)) * parseFloat((membershipDiscountPercentage / 100).toFixed(2)));
                                                                                        cartProduct.membershipDiscount = parseFloat(x.toFixed(2))
                                                                                        membershipDiscount += x;
                                                                                        cartProduct.subTotal = parseFloat((cartProduct.productId.sizePrice[i].price * cartProduct.quantity).toFixed(2));
                                                                                        cartProduct.total = parseFloat((cartProduct.productId.sizePrice[i].price * cartProduct.quantity).toFixed(2) - x);
                                                                                        cartProduct.offerDiscount = 0.00;
                                                                                        offerDiscount += cartProduct.offerDiscount;
                                                                                        subTotal += cartProduct.subTotal;
                                                                                        total += (cartProduct.total - membershipDiscount);
                                                                                        productFBPTotal += cartProduct.total
                                                                                        const newCartItem = {
                                                                                                productId: cartProduct.productId._id,
                                                                                                price: cartProduct.productId.sizePrice[i].price,
                                                                                                size: cartProduct.size,
                                                                                                quantity: cartProduct.quantity,
                                                                                        };
                                                                                        productArray.push(newCartItem);
                                                                                } else {
                                                                                        membershipDiscount += 0;
                                                                                        cartProduct.membershipDiscount = membershipDiscount
                                                                                        cartProduct.subTotal = parseFloat((cartProduct.productId.sizePrice[i].price * cartProduct.quantity).toFixed(2));
                                                                                        cartProduct.total = parseFloat((cartProduct.productId.sizePrice[i].price * cartProduct.quantity).toFixed(2));
                                                                                        cartProduct.offerDiscount = 0.00;
                                                                                        offerDiscount += cartProduct.offerDiscount;
                                                                                        subTotal += cartProduct.subTotal;
                                                                                        total += (cartProduct.total);
                                                                                        productFBPTotal += cartProduct.total
                                                                                        const newCartItem = {
                                                                                                productId: cartProduct.productId._id,
                                                                                                price: cartProduct.productId.sizePrice[i].price,
                                                                                                size: cartProduct.size,
                                                                                                quantity: cartProduct.quantity,
                                                                                        };
                                                                                        productArray.push(newCartItem);
                                                                                }
                                                                        }
                                                                }
                                                        } else {
                                                                if (data3.isSubscription === true) {
                                                                        const findSubscription = await Subscription.findById(data3.subscriptionId);
                                                                        if (findSubscription) {
                                                                                membershipDiscountPercentage = findSubscription.discount;
                                                                        }
                                                                        let x = (parseFloat((cartProduct.productId.price * cartProduct.quantity).toFixed(2)) * parseFloat((membershipDiscountPercentage / 100).toFixed(2)));
                                                                        cartProduct.membershipDiscount = parseFloat(x.toFixed(2))
                                                                        membershipDiscount += x;
                                                                        cartProduct.subTotal = parseFloat((cartProduct.productId.price * cartProduct.quantity).toFixed(2));
                                                                        cartProduct.total = parseFloat((cartProduct.productId.price * cartProduct.quantity).toFixed(2) - x);
                                                                        cartProduct.offerDiscount = 0.00;
                                                                        offerDiscount += cartProduct.offerDiscount;
                                                                        subTotal += cartProduct.subTotal;
                                                                        total += (cartProduct.total - membershipDiscount);
                                                                        productFBPTotal += cartProduct.total
                                                                        const newCartItem = {
                                                                                productId: cartProduct.productId._id,
                                                                                price: cartProduct.productId.price,
                                                                                quantity: cartProduct.quantity,
                                                                        };
                                                                        productArray.push(newCartItem)
                                                                } else {
                                                                        let x = 0.00;
                                                                        cartProduct.membershipDiscount = parseFloat(x.toFixed(2))
                                                                        membershipDiscount += x;
                                                                        cartProduct.subTotal = parseFloat((cartProduct.productId.price * cartProduct.quantity).toFixed(2));
                                                                        cartProduct.total = parseFloat((cartProduct.productId.price * cartProduct.quantity).toFixed(2));
                                                                        cartProduct.offerDiscount = 0.00;
                                                                        offerDiscount += cartProduct.offerDiscount;
                                                                        subTotal += cartProduct.subTotal;
                                                                        total += cartProduct.total;
                                                                        productFBPTotal += cartProduct.total
                                                                        const newCartItem = {
                                                                                productId: cartProduct.productId._id,
                                                                                price: cartProduct.productId.price,
                                                                                quantity: cartProduct.quantity,
                                                                        };
                                                                        productArray.push(newCartItem)
                                                                }
                                                        }
                                                }
                                                cartResponse.frequentlyBuyProductSchema.forEach((cartFBP) => {
                                                        cartFBP.total = parseFloat((cartFBP.frequentlyBuyProductId.price * cartFBP.quantity).toFixed(2));
                                                        cartFBP.subTotal = parseFloat((cartFBP.frequentlyBuyProductId.price * cartFBP.quantity).toFixed(2));
                                                        subTotal += cartFBP.subTotal;
                                                        total += cartFBP.total;
                                                        productFBPTotal += cartFBP.total
                                                        const newCartItem = {
                                                                frequentlyBuyProductId: cartFBP.frequentlyBuyProductId._id,
                                                                price: cartFBP.frequentlyBuyProductId.price,
                                                                quantity: cartFBP.quantity,
                                                        };
                                                        frequentlyBuyProductArray.push(newCartItem);
                                                });
                                                cartResponse.subTotal = subTotal;
                                                cartResponse.memberShipPer = Number(membershipDiscountPercentage);
                                                cartResponse.memberShip = parseFloat(membershipDiscount).toFixed(2)
                                                cartResponse.offerDiscount = Number(offerDiscount);
                                                if (cartResponse.pickupFromStore == true) {
                                                        shipping = 0.00;
                                                        cartResponse.shipping = parseFloat(shipping.toFixed(2));
                                                        cartResponse.pickUp = data1;
                                                        cartResponse.billingAddresss = data5;
                                                        cartResponse.total = cartResponse.subTotal - membershipDiscount
                                                        orderObjPaidAmount = orderObjPaidAmount + cartResponse.subTotal - membershipDiscount;
                                                } else {
                                                        shipping = 0.00;
                                                        if (productFBPTotal <= 150) {
                                                                shipping = 8.00;
                                                                cartResponse.shipping = parseFloat(shipping.toFixed(2));
                                                        } else {
                                                                shipping = 12.00;
                                                                cartResponse.shipping = parseFloat(shipping.toFixed(2));
                                                        }
                                                        cartResponse.deliveryAddresss = data2;
                                                        cartResponse.billingAddresss = data5;
                                                        cartResponse.shipping = shipping;
                                                        cartResponse.total = cartResponse.subTotal + shipping - membershipDiscount
                                                        orderObjPaidAmount = orderObjPaidAmount + cartResponse.subTotal + shipping - membershipDiscount;
                                                }
                                                cartResponse.products = productArray;
                                                cartResponse.frequentlyBuyProductSchema = frequentlyBuyProductArray;
                                                cartResponse._id = new mongoose.Types.ObjectId();
                                                orderObjTotalAmount = orderObjTotalAmount + orderObjPaidAmount;
                                                let saveOrder = await productOrder.create(cartResponse);
                                                productOrderId = saveOrder._id;
                                        }
                                        if (cartResponse.gifts.length > 0) {
                                                let total = 0, subTotal = 0;
                                                cartResponse.gifts.forEach(async (cartGift) => {
                                                        cartGift.total = parseFloat((cartGift.giftPriceId.price * cartGift.quantity).toFixed(2));
                                                        cartGift.subTotal = parseFloat((cartGift.giftPriceId.price * cartGift.quantity).toFixed(2));
                                                        subTotal += cartGift.subTotal;
                                                        total += cartGift.total;
                                                        let obj = {
                                                                senderUser: req.user._id,
                                                                code: cartResponse.orderId,
                                                                title: 'Buy a gift Card',
                                                                email: cartGift.email,
                                                                description: "Your friend Gift a gift card",
                                                                price: cartGift.giftPriceId.price,
                                                                discount: cartGift.giftPriceId.giftCardrewards,
                                                                per: "Amount",
                                                        }
                                                        orderObjTotalAmount = orderObjTotalAmount + total;
                                                        orderObjPaidAmount = orderObjPaidAmount + total;
                                                        let saveOrder = await coupanModel.create(obj);
                                                        if (saveOrder) {
                                                                giftOrderId = saveOrder._id;
                                                                let orderObj = {
                                                                        userId: req.user._id,
                                                                        orderId: orderId,
                                                                        giftOrder: giftOrderId,
                                                                        productOrder: productOrderId,
                                                                        orderObjTotalAmount: orderObjTotalAmount.toFixed(2),
                                                                        couponDiscount: couponDiscount,
                                                                        orderObjPaidAmount: orderObjPaidAmount.toFixed(2),
                                                                }
                                                                let saveOrder1 = await userOrders.create(orderObj);
                                                                return res.status(200).json({ msg: "product added to cart", data: saveOrder1 });
                                                        }
                                                });
                                        } else {
                                                orderObjTotalAmount = orderObjTotalAmount;
                                                let orderObj = {
                                                        userId: req.user._id,
                                                        orderId: orderId,
                                                        productOrder: productOrderId,
                                                        orderObjTotalAmount: orderObjTotalAmount.toFixed(2),
                                                        applyCoupan: cartResponse.coupon,
                                                        couponDiscount: couponDiscount,
                                                        orderObjPaidAmount: orderObjPaidAmount.toFixed(2),
                                                }
                                                let saveOrder1 = await userOrders.create(orderObj);
                                                return res.status(200).json({ msg: "product added to cart", data: saveOrder1 });
                                        }
                                }
                        } else {
                                return res.status(200).json({ success: false, msg: "Cart is empty", cart: {} });
                        }
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.placeOrder = async (req, res) => {
        try {
                let findUserOrder = await userOrders.findOne({ orderId: req.params.orderId });
                if (findUserOrder) {
                        console.log("2174======================");
                        let memberShipPer = 0, offerDiscount = 0;
                        let line_items = [];
                        if (findUserOrder.productOrder != (null || undefined)) {
                                let discount = 0, total = 0, subTotal = 0;
                                let findOrder = await productOrder.findById({ _id: findUserOrder.productOrder }).populate([{ path: "products.productId", select: { reviews: 0 } },
                                { path: 'frequentlyBuyProductSchema.frequentlyBuyProductId', populate: { path: 'products', model: 'Product' }, select: { reviews: 0 } },
                                { path: "coupon", select: "couponCode discount expirationDate" },]);
                                findOrder.products.forEach((cartProduct) => {
                                        let price;
                                        cartProduct.total = parseFloat((cartProduct.price * cartProduct.quantity).toFixed(2));
                                        cartProduct.subTotal = parseFloat((cartProduct.price * cartProduct.quantity).toFixed(2));
                                        cartProduct.discount = 0.00;
                                        price = parseFloat((cartProduct.price * cartProduct.quantity).toFixed(2));
                                        subTotal += cartProduct.subTotal;
                                        discount += cartProduct.discount;
                                        total += cartProduct.total;
                                        let name;
                                        if (cartProduct.size != (null || undefined)) {
                                                name = `${cartProduct.productId.name} (${cartProduct.size})`;
                                        } else {
                                                name = `${cartProduct.productId.name}`;
                                        }
                                        let obj2 = {
                                                price_data: {
                                                        currency: "usd",
                                                        product_data: {
                                                                name: name,
                                                        },
                                                        unit_amount: `${Math.round(price * 100)}`,
                                                },
                                                quantity: 1,
                                        }
                                        console.log("1381", obj2);
                                        line_items.push(obj2)
                                });
                                memberShipPer += findOrder.memberShip;
                                findOrder.frequentlyBuyProductSchema.forEach((cartProduct) => {
                                        let price;
                                        cartProduct.total = cartProduct.frequentlyBuyProductId.price * cartProduct.quantity;
                                        cartProduct.subTotal = cartProduct.frequentlyBuyProductId.price * cartProduct.quantity;
                                        cartProduct.discount = 0;
                                        subTotal += cartProduct.subTotal;
                                        discount += cartProduct.discount;
                                        total += cartProduct.total;
                                        price = cartProduct.frequentlyBuyProductId.price * cartProduct.quantity
                                        let obj2 = {
                                                price_data: {
                                                        currency: "usd",
                                                        product_data: {
                                                                name: `Frequently`,
                                                        },
                                                        unit_amount: `${Math.round(price * 100)}`,
                                                },
                                                quantity: 1,
                                        }
                                        console.log("1433", obj2);
                                        line_items.push(obj2)
                                });
                                let delivery = Number(findOrder.shipping);
                                let obj3 = {
                                        price_data: {
                                                currency: "usd",
                                                product_data: {
                                                        name: `Delivery Charge`,
                                                },
                                                unit_amount: `${Math.round(delivery * 100)}`,
                                        },
                                        quantity: 1,
                                }
                                line_items.push(obj3)
                        }
                        if (findUserOrder.giftOrder != (null || undefined)) {
                                let total = 0, subTotal = 0;
                                let findOrder3 = await coupanModel.findById({ _id: findUserOrder.giftOrder, orderStatus: "unconfirmed" });
                                let price;
                                findOrder3.total = findOrder3.price * 1;
                                findOrder3.subTotal = findOrder3.price * 1;
                                price = findOrder3.price * 1
                                subTotal += findOrder3.subTotal;
                                total += findOrder3.total;
                                let obj2 = {
                                        price_data: {
                                                currency: "usd",
                                                product_data: {
                                                        name: `${findOrder3.title}`,
                                                },
                                                unit_amount: `${Math.round(price * 100)}`,
                                        },
                                        quantity: 1,
                                }
                                console.log("1469", obj2);
                                line_items.push(obj2)
                        }
                        console.log(line_items);
                        if (memberShipPer > 0) {
                                let amount_off = 0, name;
                                if (offerDiscount > 0) {
                                        amount_off = (memberShipPer + offerDiscount).toFixed() * 100;
                                        name = `Member Ship, Offer Discount`
                                } else {
                                        amount_off = (memberShipPer).toFixed() * 100;
                                        name = `Member Ship Discount`
                                }
                                const couponId = await stripe.coupons.create({
                                        name: name,
                                        currency: 'usd',
                                        amount_off: amount_off,
                                        duration: "once",
                                });
                                const session = await stripe.checkout.sessions.create({
                                        payment_method_types: ["card"],
                                        success_url: `https://shahina-web.vercel.app/thanks/${findUserOrder.orderId}`,
                                        cancel_url: `https://shahina-web.vercel.app/failed/${findUserOrder.orderId}`,
                                        customer_email: req.user.email,
                                        client_reference_id: findUserOrder.orderId,
                                        line_items: line_items,
                                        mode: "payment",
                                        discounts: [
                                                {
                                                        coupon: couponId.id,
                                                },
                                        ],
                                });
                                return res.status(200).json({ status: "success", session: session, });
                        } else if (offerDiscount > 0) {
                                let amount_off = 0, name;
                                amount_off = (offerDiscount).toFixed() * 100;
                                name = `Offer Discount`
                                const couponId = await stripe.coupons.create({
                                        name: name,
                                        currency: 'usd',
                                        amount_off: amount_off,
                                        duration: "once",
                                });
                                const session = await stripe.checkout.sessions.create({
                                        payment_method_types: ["card"],
                                        success_url: `https://shahina-web.vercel.app/thanks/${findUserOrder.orderId}`,
                                        cancel_url: `https://shahina-web.vercel.app/failed/${findUserOrder.orderId}`,
                                        customer_email: req.user.email,
                                        client_reference_id: findUserOrder.orderId,
                                        line_items: line_items,
                                        mode: "payment",
                                        discounts: [
                                                {
                                                        coupon: couponId.id,
                                                },
                                        ],
                                });
                                return res.status(200).json({ status: "success", session: session, });
                        } else {
                                const session = await stripe.checkout.sessions.create({
                                        payment_method_types: ["card"],
                                        success_url: `https://shahina-web.vercel.app/thanks/${findUserOrder.orderId}`,
                                        cancel_url: `https://shahina-web.vercel.app/failed/${findUserOrder.orderId}`,
                                        customer_email: req.user.email,
                                        client_reference_id: findUserOrder.orderId,
                                        line_items: line_items,
                                        mode: "payment",
                                });
                                return res.status(200).json({ status: "success", session: session, });
                        }
                } else {
                        return res.status(404).json({ message: "No data found", data: {} });
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.successOrder = async (req, res) => {
        try {
                let findUserOrder = await userOrders.findOne({ orderId: req.params.orderId });
                if (findUserOrder) {
                        const user = await User.findById({ _id: findUserOrder.userId });
                        if (!user) {
                                return res.status(404).send({ status: 404, message: "User not found or token expired." });
                        }
                        let update2 = await userOrders.findOneAndUpdate({ orderId: findUserOrder.orderId }, { $set: { orderStatus: "confirmed", paymentStatus: "paid" } }, { new: true });
                        let find1 = await productOrder.findOne({ orderId: findUserOrder.orderId }).populate([{ path: "products.productId", select: { reviews: 0 } }, { path: 'frequentlyBuyProductSchema.frequentlyBuyProductId', populate: { path: 'products', model: 'Product' }, }, { path: "coupon", select: "couponCode discount expirationDate" },]);
                        if (find1) {
                                let update = await productOrder.findOneAndUpdate({ orderId: findUserOrder.orderId }, { $set: { orderStatus: "confirmed", paymentStatus: "paid" } }, { new: true });
                        }
                        let find3 = await coupanModel.findOne({ orderId: findUserOrder.orderId });
                        if (find3) {
                                let findOrder3 = await coupanModel.findOneAndUpdate({ code: findUserOrder.orderId }, { $set: { orderStatus: "confirmed", paymentStatus: "paid" } }, { new: true });
                                if (findOrder3) {
                                        var transporter = nodemailer.createTransport({ service: 'gmail', auth: { "user": "info@shahinahoja.com", "pass": "gganlypsemwqhwlh" } });
                                        let mailOptions = { from: 'info@shahinahoja.com', to: findOrder3.email, subject: 'Gift Card Provide by Your friend', text: `Gift Card Provide by Your friend Coupan Code is ${findOrder3.code}`, };
                                        let info = await transporter.sendMail(mailOptions);
                                }
                        }
                        var transporter = nodemailer.createTransport({ service: 'gmail', auth: { "user": "info@shahinahoja.com", "pass": "gganlypsemwqhwlh" } });
                        let mailOption1 = {
                                from: '<do_not_reply@gmail.com>',
                                to: 'info@shahinahoja.com',
                                subject: 'Order Received',
                                text: `You have received a new order`,
                                html: `
                                  <p>You have received a new order:</p>
                                  <p>Name: ${user.firstName} ${user.lastName}</p>
                                  <p>Email: ${user.email}</p>
                                  <p>Contact Number: ${user.phone}</p>
                                  <p>Order Id: ${findUserOrder.orderId}</p>
                                  <p>Order Amount: ${findUserOrder.orderObjPaidAmount}</p>
                                  <p>Product Details:</p>
                                  <ul>
                                    ${find1.products.map((product, index) => `
                                      <li>
                                        Product ${index + 1}:
                                        <ul>
                                          <li>Name: ${product.productId.name}</li>
                                          <li>Price: ${product.price}</li>
                                          <li>Quantity: ${product.quantity}</li>
                                        </ul>
                                      </li>
                                    `).join('')}
                                  </ul>`,
                        };
                        let info1 = await transporter.sendMail(mailOption1);
                        if (info1) {
                                let deleteCart = await Cart.findOneAndDelete({ user: findUserOrder.userId });
                                if (deleteCart) {
                                        return res.status(200).json({ message: "Payment success.", status: 200, data: update2 });
                                } else {
                                        return res.status(200).json({ message: "Payment success.", status: 200, data: update2 });
                                }
                        } else {
                                let deleteCart = await Cart.findOneAndDelete({ user: findUserOrder.userId });
                                if (deleteCart) {
                                        return res.status(200).json({ message: "Payment success.", status: 200, data: update2 });
                                } else {
                                        return res.status(200).json({ message: "Payment success.", status: 200, data: update2 });
                                }
                        }
                } else {
                        return res.status(404).json({ message: "No data found", data: {} });
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.cancelOrder = async (req, res) => {
        try {
                let findUserOrder = await userOrders.findOne({ orderId: req.params.orderId });
                if (findUserOrder) {
                        return res.status(201).json({ message: "Payment failed.", status: 201, orderId: req.params.orderId });
                } else {
                        return res.status(404).json({ message: "No data found", data: {} });
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.getCartApp = async (req, res, next) => {
        try {
                const cart = await Cart.findOne({ user: req.user._id });
                if (!cart) {
                        return res.status(200).json({ success: false, msg: "Cart is empty", cart: {} });
                }
                let cartResponse;
                if (cart.services.length > 0) {
                        cartResponse = await calculateCartResponse5(cart, req.user._id, true);
                } else if (cart.products.length == 0 && cart.gifts.length == 0 && cart.frequentlyBuyProductSchema.length == 0 && cart.services.length == 0 && cart.AddOnservicesSchema.length == 0) {
                        return res.status(200).json({ success: false, msg: "Cart is empty", cart: {} });
                } else {
                        cartResponse = await calculateCartResponse5(cart, req.user._id);
                }
                return res.status(200).json({ success: true, msg: "Cart retrieved successfully", cart: cartResponse });
        } catch (error) {
                console.log(error);
                next(error);
        }
};
exports.checkoutApp = async (req, res) => {
        try {
                let findOrder = await productOrder.find({ user: req.user._id, orderStatus: "unconfirmed" });
                let findOrder1 = await serviceOrder.find({ user: req.user._id, orderStatus: "unconfirmed" });
                let findOrder2 = await userOrders.find({ user: req.user._id, orderStatus: "unconfirmed" });
                let findOrder3 = await coupanModel.find({ senderUser: req.user._id, orderStatus: "unconfirmed" });
                if (findOrder.length > 0 || findOrder1.length > 0 || findOrder2.length > 0 || findOrder3.length > 0) {
                        if (findOrder.length > 0) {
                                for (let i = 0; i < findOrder.length; i++) {
                                        await productOrder.findByIdAndDelete({ _id: findOrder[i]._id });
                                }
                        }
                        if (findOrder1.length > 0) {
                                for (let i = 0; i < findOrder1.length; i++) {
                                        await serviceOrder.findByIdAndDelete({ _id: findOrder1[i]._id });
                                }
                        }
                        if (findOrder2.length > 0) {
                                for (let i = 0; i < findOrder2.length; i++) {
                                        await userOrders.findByIdAndDelete({ _id: findOrder2[i]._id });
                                }
                        }
                        if (findOrder3.length > 0) {
                                for (let i = 0; i < findOrder3.length; i++) {
                                        await coupanModel.findByIdAndDelete({ _id: findOrder3[i]._id });
                                }
                        }
                        let findCart = await Cart.findOne({ user: req.user._id }).populate([{ path: "products.productId", select: { reviews: 0 } }, { path: "gifts.giftPriceId", select: { reviews: 0 } }, { path: "AddOnservicesSchema.addOnservicesId", select: { reviews: 0 } }, { path: "services.serviceId", select: { reviews: 0 } }, { path: 'frequentlyBuyProductSchema.frequentlyBuyProductId', populate: { path: 'products', model: 'Product' }, select: { reviews: 0 } }, { path: "coupon", select: "couponCode discount expirationDate used per" },]);
                        if (findCart) {
                                const data1 = await Address.findOne({ type: "Admin" }).select('address appartment landMark -_id');
                                const data2 = await Address.findOne({ user: req.user._id, addressType: "Shipping" }).select('address appartment city state zipCode -_id');
                                const data5 = await Address.findOne({ user: req.user._id, addressType: "Billing" }).select('address appartment city state zipCode -_id');
                                const data3 = await User.findOne({ _id: req.user._id });
                                let orderObjPaidAmount = 0, productOrderId, serviceOrderId, giftOrderId, couponDiscount = 0, orderObjTotalAmount = 0;
                                if (findCart.coupon && moment().isAfter(findCart.coupon.expirationDate, "day")) { findCart.coupon = undefined; findCart.save(); }
                                const cartResponse = findCart.toObject();
                                let orderId = await reffralCode();
                                cartResponse.orderId = orderId;
                                if (cartResponse.services.length > 0 || cartResponse.AddOnservicesSchema.length > 0) {
                                        const dateObject = new Date(findCart.date);
                                        const dateString = dateObject.toISOString().split('T')[0];
                                        const newTime = "00:00:00.000+00:00";
                                        const replacedDateString = `${dateString}T${newTime}`;
                                        let findSlot1 = await slot.find({ from: { $lte: findCart.fromTime }, to: { $gte: findCart.toTime }, date: replacedDateString, isBooked: false, slotBlocked: false });
                                        if (findSlot1.length > 0) {
                                                if (cartResponse.products.length > 0 || cartResponse.frequentlyBuyProductSchema.length > 0) {
                                                        let shipping = 0, productArray = [], frequentlyBuyProductArray = [], offerDiscount = 0, productFBPTotal = 0, membershipDiscount = 0, membershipDiscountPercentage = 0, total = 0, subTotal = 0;
                                                        for (const cartProduct of cartResponse.products) {
                                                                if (cartProduct.productId.multipleSize == true) {
                                                                        for (let i = 0; i < cartProduct.productId.sizePrice.length; i++) {
                                                                                if ((cartProduct.productId.sizePrice[i]._id == cartProduct.priceId) == true) {
                                                                                        if (data3.isSubscription === true) {
                                                                                                const findSubscription = await Subscription.findById(data3.subscriptionId);
                                                                                                if (findSubscription) {
                                                                                                        membershipDiscountPercentage = findSubscription.discount;
                                                                                                }
                                                                                                let x = (parseFloat((cartProduct.productId.sizePrice[i].price * cartProduct.quantity).toFixed(2)) * parseFloat((membershipDiscountPercentage / 100).toFixed(2)));
                                                                                                cartProduct.membershipDiscount = parseFloat(x.toFixed(2))
                                                                                                membershipDiscount += x;
                                                                                                cartProduct.subTotal = parseFloat((cartProduct.productId.sizePrice[i].price * cartProduct.quantity).toFixed(2));
                                                                                                cartProduct.total = parseFloat((cartProduct.productId.sizePrice[i].price * cartProduct.quantity).toFixed(2) - x);
                                                                                                cartProduct.offerDiscount = 0.00;
                                                                                                offerDiscount += cartProduct.offerDiscount;
                                                                                                subTotal += cartProduct.subTotal;
                                                                                                total += (cartProduct.total - membershipDiscount);
                                                                                                productFBPTotal += cartProduct.total
                                                                                                const newCartItem = {
                                                                                                        productId: cartProduct.productId._id,
                                                                                                        price: cartProduct.productId.sizePrice[i].price,
                                                                                                        size: cartProduct.size,
                                                                                                        quantity: cartProduct.quantity,
                                                                                                };
                                                                                                productArray.push(newCartItem);
                                                                                        } else {
                                                                                                membershipDiscount += 0;
                                                                                                cartProduct.membershipDiscount = membershipDiscount
                                                                                                cartProduct.subTotal = parseFloat((cartProduct.productId.sizePrice[i].price * cartProduct.quantity).toFixed(2));
                                                                                                cartProduct.total = parseFloat((cartProduct.productId.sizePrice[i].price * cartProduct.quantity).toFixed(2));
                                                                                                cartProduct.offerDiscount = 0.00;
                                                                                                offerDiscount += cartProduct.offerDiscount;
                                                                                                subTotal += cartProduct.subTotal;
                                                                                                total += (cartProduct.total);
                                                                                                productFBPTotal += cartProduct.total
                                                                                                const newCartItem = {
                                                                                                        productId: cartProduct.productId._id,
                                                                                                        price: cartProduct.productId.sizePrice[i].price,
                                                                                                        size: cartProduct.size,
                                                                                                        quantity: cartProduct.quantity,
                                                                                                };
                                                                                                productArray.push(newCartItem);
                                                                                        }
                                                                                }
                                                                        }
                                                                } else {
                                                                        if (data3.isSubscription === true) {
                                                                                const findSubscription = await Subscription.findById(data3.subscriptionId);
                                                                                if (findSubscription) {
                                                                                        membershipDiscountPercentage = findSubscription.discount;
                                                                                }
                                                                                let x = (parseFloat((cartProduct.productId.price * cartProduct.quantity).toFixed(2)) * parseFloat((membershipDiscountPercentage / 100).toFixed(2)));
                                                                                cartProduct.membershipDiscount = parseFloat(x.toFixed(2))
                                                                                membershipDiscount += x;
                                                                                cartProduct.subTotal = parseFloat((cartProduct.productId.price * cartProduct.quantity).toFixed(2));
                                                                                cartProduct.total = parseFloat((cartProduct.productId.price * cartProduct.quantity).toFixed(2) - x);
                                                                                cartProduct.offerDiscount = 0.00;
                                                                                offerDiscount += cartProduct.offerDiscount;
                                                                                subTotal += cartProduct.subTotal;
                                                                                total += (cartProduct.total - membershipDiscount);
                                                                                productFBPTotal += cartProduct.total
                                                                                const newCartItem = {
                                                                                        productId: cartProduct.productId._id,
                                                                                        price: cartProduct.productId.price,
                                                                                        quantity: cartProduct.quantity,
                                                                                };
                                                                                productArray.push(newCartItem)
                                                                        } else {
                                                                                let x = 0.00;
                                                                                cartProduct.membershipDiscount = parseFloat(x.toFixed(2))
                                                                                membershipDiscount += x;
                                                                                cartProduct.subTotal = parseFloat((cartProduct.productId.price * cartProduct.quantity).toFixed(2));
                                                                                cartProduct.total = parseFloat((cartProduct.productId.price * cartProduct.quantity).toFixed(2));
                                                                                cartProduct.offerDiscount = 0.00;
                                                                                offerDiscount += cartProduct.offerDiscount;
                                                                                subTotal += cartProduct.subTotal;
                                                                                total += cartProduct.total;
                                                                                productFBPTotal += cartProduct.total
                                                                                const newCartItem = {
                                                                                        productId: cartProduct.productId._id,
                                                                                        price: cartProduct.productId.price,
                                                                                        quantity: cartProduct.quantity,
                                                                                };
                                                                                productArray.push(newCartItem)
                                                                        }
                                                                }
                                                        }
                                                        cartResponse.frequentlyBuyProductSchema.forEach((cartFBP) => {
                                                                cartFBP.total = parseFloat((cartFBP.frequentlyBuyProductId.price * cartFBP.quantity).toFixed(2));
                                                                cartFBP.subTotal = parseFloat((cartFBP.frequentlyBuyProductId.price * cartFBP.quantity).toFixed(2));
                                                                subTotal += cartFBP.subTotal;
                                                                total += cartFBP.total;
                                                                const newCartItem = {
                                                                        frequentlyBuyProductId: cartFBP.frequentlyBuyProductId._id,
                                                                        price: cartFBP.frequentlyBuyProductId.price,
                                                                        quantity: cartFBP.quantity,
                                                                };
                                                                frequentlyBuyProductArray.push(newCartItem);
                                                        });
                                                        cartResponse.subTotal = subTotal;
                                                        cartResponse.memberShipPer = Number(membershipDiscountPercentage);
                                                        cartResponse.memberShip = parseFloat(membershipDiscount).toFixed(2)
                                                        cartResponse.offerDiscount = Number(offerDiscount);
                                                        if (cartResponse.pickupFromStore == true) {
                                                                shipping = 0.00;
                                                                cartResponse.shipping = parseFloat(shipping.toFixed(2));
                                                                cartResponse.pickUp = data1;
                                                                cartResponse.billingAddresss = data5;
                                                                cartResponse.total = cartResponse.subTotal - membershipDiscount
                                                                orderObjPaidAmount = orderObjPaidAmount + cartResponse.subTotal - membershipDiscount;
                                                        } else {
                                                                if (productFBPTotal <= 150) {
                                                                        shipping = 8.00;
                                                                        cartResponse.shipping = parseFloat(shipping.toFixed(2));
                                                                } else {
                                                                        shipping = 12.00;
                                                                        cartResponse.shipping = parseFloat(shipping.toFixed(2));
                                                                }
                                                                cartResponse.deliveryAddresss = data2;
                                                                cartResponse.billingAddresss = data5;
                                                                cartResponse.shipping = shipping;
                                                                cartResponse.total = cartResponse.subTotal + shipping - membershipDiscount
                                                                orderObjPaidAmount = orderObjPaidAmount + cartResponse.subTotal + shipping - membershipDiscount;
                                                        }
                                                        cartResponse.products = productArray;
                                                        cartResponse.frequentlyBuyProductSchema = frequentlyBuyProductArray;
                                                        cartResponse._id = new mongoose.Types.ObjectId();
                                                        let saveOrder = await productOrder.create(cartResponse);
                                                        productOrderId = saveOrder._id;
                                                }
                                                if (cartResponse.services.length > 0 || cartResponse.AddOnservicesSchema.length > 0) {
                                                        let totalTime = 0;
                                                        let offerDiscount = 0, membershipDiscount = 0, membershipDiscountPercentage = 0, total = 0, subTotal = 0;
                                                        if (cartResponse.services.length > 0) {
                                                                for (const cartProduct of cartResponse.services) {
                                                                        if (cartProduct.serviceId.type === "offer") {
                                                                                cartProduct.subTotal = parseFloat((cartProduct.serviceId.price * cartProduct.quantity).toFixed(2));
                                                                                cartProduct.total = parseFloat((cartProduct.serviceId.discountPrice * cartProduct.quantity).toFixed(2));
                                                                                cartProduct.offerDiscount = parseFloat(((cartProduct.serviceId.price - cartProduct.serviceId.discountPrice) * cartProduct.quantity).toFixed(2));
                                                                                offerDiscount += cartProduct.offerDiscount;
                                                                                subTotal += cartProduct.subTotal;
                                                                                total += cartProduct.total;
                                                                        }
                                                                        if (cartProduct.serviceId.type === "Service") {
                                                                                if (data3.isSubscription === true) {
                                                                                        if (cartProduct.serviceId.multipleSize == true) {
                                                                                                let x = (parseFloat((cartProduct.sizePrice * cartProduct.quantity).toFixed(2)) - parseFloat((cartProduct.memberprice * cartProduct.quantity).toFixed(2)));
                                                                                                cartProduct.membershipDiscount = parseFloat(x.toFixed(2))
                                                                                                membershipDiscount += x;
                                                                                                cartProduct.subTotal = parseFloat((cartProduct.sizePrice * cartProduct.quantity).toFixed(2));
                                                                                                cartProduct.total = parseFloat((cartProduct.memberprice * cartProduct.quantity).toFixed(2));
                                                                                                cartProduct.offerDiscount = 0.00;
                                                                                                offerDiscount += cartProduct.offerDiscount;
                                                                                                total += cartProduct.total;
                                                                                                subTotal += cartProduct.subTotal;
                                                                                        } else {
                                                                                                let x = (parseFloat((cartProduct.serviceId.price * cartProduct.quantity).toFixed(2)) - parseFloat((cartProduct.serviceId.mPrice * cartProduct.quantity).toFixed(2)));
                                                                                                cartProduct.membershipDiscount = parseFloat(x.toFixed(2))
                                                                                                membershipDiscount += x;
                                                                                                cartProduct.subTotal = parseFloat((cartProduct.serviceId.price * cartProduct.quantity).toFixed(2));
                                                                                                cartProduct.total = parseFloat((cartProduct.serviceId.mPrice * cartProduct.quantity).toFixed(2));
                                                                                                cartProduct.offerDiscount = 0.00;
                                                                                                offerDiscount += cartProduct.offerDiscount;
                                                                                                total += cartProduct.total;
                                                                                                subTotal += cartProduct.subTotal;
                                                                                        }
                                                                                } else {
                                                                                        if (cartProduct.serviceId.multipleSize == true) {
                                                                                                let x = 0
                                                                                                cartProduct.membershipDiscount = parseFloat(x.toFixed(2))
                                                                                                membershipDiscount += x;
                                                                                                cartProduct.subTotal = parseFloat((cartProduct.sizePrice * cartProduct.quantity).toFixed(2));
                                                                                                cartProduct.total = parseFloat((cartProduct.sizePrice * cartProduct.quantity).toFixed(2) - x);
                                                                                                cartProduct.offerDiscount = 0.00;
                                                                                                offerDiscount += cartProduct.offerDiscount;
                                                                                                total += cartProduct.total;
                                                                                                subTotal += cartProduct.subTotal;
                                                                                        } else {
                                                                                                let x = 0
                                                                                                cartProduct.membershipDiscount = parseFloat(x.toFixed(2))
                                                                                                membershipDiscount += x;
                                                                                                cartProduct.subTotal = parseFloat((cartProduct.serviceId.price * cartProduct.quantity).toFixed(2));
                                                                                                cartProduct.total = parseFloat((cartProduct.serviceId.price * cartProduct.quantity).toFixed(2) - x);
                                                                                                cartProduct.offerDiscount = 0.00;
                                                                                                offerDiscount += cartProduct.offerDiscount;
                                                                                                total += cartProduct.total;
                                                                                                subTotal += cartProduct.subTotal;
                                                                                        }
                                                                                }
                                                                        }
                                                                }
                                                        }
                                                        if (cartResponse.AddOnservicesSchema.length > 0) {
                                                                cartResponse.AddOnservicesSchema.forEach((cartGift) => {
                                                                        cartGift.total = parseFloat((cartGift.addOnservicesId.price * cartGift.quantity).toFixed(2));
                                                                        cartGift.subTotal = parseFloat((cartGift.addOnservicesId.price * cartGift.quantity).toFixed(2));
                                                                        subTotal += cartGift.subTotal;
                                                                        total += cartGift.total;
                                                                });
                                                        }
                                                        if (findCart.toTime != (null || undefined)) {
                                                                if (findCart.services.length > 0) {
                                                                        for (let i = 0; i < findCart.services.length; i++) {
                                                                                totalTime = totalTime + findCart.services[i].serviceId.totalMin;
                                                                        }
                                                                }
                                                                if (findCart.AddOnservicesSchema.length > 0) {
                                                                        for (let i = 0; i < findCart.AddOnservicesSchema.length; i++) {
                                                                                totalTime = totalTime + findCart.AddOnservicesSchema[i].addOnservicesId.totalMin;
                                                                        }
                                                                }
                                                        }
                                                        cartResponse.date = findCart.date;
                                                        cartResponse.time = findCart.time;
                                                        cartResponse.suggesstion = findCart.suggesstion;
                                                        cartResponse.memberShipPer = Number(membershipDiscountPercentage);
                                                        cartResponse.memberShip = parseFloat(membershipDiscount).toFixed(2)
                                                        cartResponse.offerDiscount = Number(offerDiscount);
                                                        cartResponse.subTotal = subTotal;
                                                        cartResponse.total = total;
                                                        cartResponse.serviceAddresss = data1;
                                                        orderObjPaidAmount = orderObjPaidAmount + total;
                                                        cartResponse._id = new mongoose.Types.ObjectId();
                                                        cartResponse.orderStatus = "confirmed";
                                                        const inputDate = new Date(findCart.toTime);
                                                        const options = {
                                                                weekday: 'long',
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric',
                                                                hour: 'numeric',
                                                                minute: 'numeric',
                                                                hour12: true
                                                        };
                                                        const formattedDate = inputDate.toLocaleString('en-US', { ...options, timeZone: 'UTC' });
                                                        if (totalTime > 0) {
                                                                var hours2 = Math.floor(totalTime / 60);
                                                                var minutes2 = totalTime % 60;
                                                                let timeInMin = hours2 + "hr" + " " + minutes2 + "min"
                                                                cartResponse.timeInMin = timeInMin;
                                                        }
                                                        let saveOrder = await serviceOrder.create(cartResponse);
                                                        if (saveOrder) {
                                                                let findSlot = await slot.find({ from: { $lte: findCart.fromTime }, to: { $gte: findCart.toTime }, date: replacedDateString, isBooked: false, slotBlocked: false });
                                                                if (findSlot.length > 0) {
                                                                        for (let i = 0; i < findSlot.length; i++) {
                                                                                let updateSlot = await slot.findByIdAndUpdate({ _id: findSlot[i]._id }, { $set: { isBooked: true } }, { new: true });
                                                                        }
                                                                }
                                                                const data4 = await User.findOne({ userType: "ADMIN" });
                                                                await adminNotification.create({
                                                                        orderUserId: req.user._id,
                                                                        userId: data4._id,
                                                                        title: `${data3.firstName} ${data3.lastName}, book online ${saveOrder.total}`,
                                                                        body: findCart.services[0].serviceId.description,
                                                                })
                                                                var transporter = nodemailer.createTransport({ service: 'gmail', auth: { "user": "info@shahinahoja.com", "pass": "gganlypsemwqhwlh" } });
                                                                let mailOptions = {
                                                                        from: '<do_not_reply@gmail.com>',
                                                                        to: `${req.user.email}`,
                                                                        cc: 'info@shahinahoja.com',
                                                                        subject: 'Order Received',
                                                                        text: `You have received a new order`,
                                                                        html: `<html lang="en">
                                                                                <head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>Email</title></head>
                                                                                <body>
                                                                                    <div style="width: 100%; height: 100%"><div style="background-color: white;max-width: 600px;margin: auto;border: 1px solid black;"><div style="  width: 90%;  margin: auto;  margin-top: 2rem;  margin-bottom: 4rem;"><buttonstyle="color: white;border-left: 50%;padding: 5px;height: 2rem;width: 7rem;border-radius: 1rem;background-color: blueviolet;border: none;outline: none;">Confirmed</button><div style="margin-top: 2rem"><p style="font-size: 30px; font-weight: bold">Looking forward to seeing you soon Nisan</p></div><p style="margin-top: 1rem">This is a friendly reminder about your appointment on<span style="color: rgb(153, 74, 228)">${formattedDate}</span>with Shahina Hoja Aesthetics.</p>
                                                                                    <div><a href="https://shahina-web.vercel.app/"><button style="width: 100%;padding: 10px;background-color: black;color: white;border: none;outline: none;cursor: pointer;border-radius: 3px;font-size: 1rem;">Get directions</button></a><a href="https://shahina-web.vercel.app/" target='_blank'><button style="width: 100%;padding: 10px;cursor: pointers;outline: none;border-radius: 3px;cursor: pointer;font-size: 1rem;margin-top: 1rem;">Manage appointment</button></a></div>
                                                                                    <div style="margin-top: 1.5rem"><h4 style="font-size: 1.5rem; font-weight: bold">Appointment details</h4><div style="margin-top: 1rem;display: flex;justify-content: space-between;"><div>
                                                                                    <ul>${findCart.services.map((service, index) => `<h5 style="font-weight: bold; font-size: 1rem">${service.serviceId.name}                   $ ${service.price}</h5><p style="color: rgb(131, 120, 120)"> ${service.totalTime}  with  Shahina</p>`).join('')}</ul></div></div><hr style="margin-top: 0.5rem; line-height: 7px" /><div style="margin-top: 0.5rem;display: flex;justify-content: space-between;"><div><p style="font-weight: bold">Total</p></div><p style="font-weight: bold">$ ${saveOrder.total}</p>
                                                                                                    </div><hr style="margin-top: 1rem" /></div>
                                                                                                <p style="color: rgb(142, 133, 133); margin-top: 0.5rem">Booking ref: ${orderId}</p>
                                                                                
                                                                                                <div>
                                                                                                    <h3 style="margin-top: 1rem">Location</h3>
                                                                                                    <div style="margin-top: 0.5rem;display: flex;justify-content: space-between;">
                                                                                                        <div style="line-height: 20px">
                                                                                                            <h5>Shahine Hoja Aesthetics</h5>
                                                                                                            <p style="color: rgb(100, 28, 162)">
                                                                                                                Shahina Hoja Aesthetics
905 Watters Creek Boulevard ,141 Allen, 75013, Texas, Us
                                                                                                            </p>
                                                                                                        </div>
                                                                                                        <img src="https://res.cloudinary.com/djgrqoefp/image/upload/v1704388341/shahina/contactDetail/lv8rvmn6nbkzbzekiexq.png"
                                                                                                            style="height: 50px; width: 50px; margin-left:25px; border-radius: 10px" />
                                                                                                    </div>
                                                                                                </div>
                                                                                
                                                                                                <div style="margin-top: 1.5rem; line-height: 20px">
                                                                                                    <h3>Cancellation Policy</h3>
                                                                                                    <p style="margin-top: 1rem">
                                                                                                        Please avoid Cancellation with in <strong>48 hours</strong> of your
                                                                                                        appointment
                                                                                                    </p>
                                                                                                </div>
                                                                                
                                                                                                <div style="margin-top: 1.5rem; line-height: 20px">
                                                                                                    <h3>Important Info</h3>
                                                                                                    <p style="margin-top: 1rem">
                                                                                                        We are now offering payment plans through cherry. if you're
                                                                                                        interseted , please apply hare appointment
                                                                                                    </p>
                                                                                                    <p style="color: blueviolet; cursor: pointer">
                                                                                                    https://pay.withcherry.com/shahinahoja
                                                                                                    </p>
                                                                                                </div>
                                                                                                <p style="margin-top: 2.5rem">
                                                                                                    we send you this because you have booked with shahine hoja Aesthics,
                                                                                                    which partners with for appoinment and payments.
                                                                                                </p>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </body>
                                                                                </html>`
                                                                };
                                                                let info1 = await transporter.sendMail(mailOptions);
                                                                if (info1) {
                                                                        serviceOrderId = saveOrder._id;
                                                                } else {
                                                                        serviceOrderId = saveOrder._id;
                                                                }
                                                        }
                                                }
                                                orderObjTotalAmount = orderObjPaidAmount;
                                                if (cartResponse.coupon != (null || undefined)) {
                                                        if (cartResponse.coupon.completeVisit == 5 && data3.orderVisit > 5) {
                                                                if (cartResponse.coupon.used == false) {
                                                                        if (cartResponse.coupon.per == "Percentage") {
                                                                                couponDiscount = ((orderObjPaidAmount * cartResponse.coupon.discount) / 100);
                                                                                orderObjPaidAmount = orderObjPaidAmount - ((orderObjPaidAmount * cartResponse.coupon.discount) / 100);
                                                                        } else {
                                                                                couponDiscount = cartResponse.coupon.discount;
                                                                                orderObjPaidAmount = orderObjPaidAmount - cartResponse.coupon.discount;
                                                                        }
                                                                }
                                                        } else {
                                                                if (cartResponse.coupon.used == false) {
                                                                        if (cartResponse.coupon.per == "Percentage") {
                                                                                couponDiscount = ((orderObjPaidAmount * cartResponse.coupon.discount) / 100);
                                                                                orderObjPaidAmount = orderObjPaidAmount - ((orderObjPaidAmount * cartResponse.coupon.discount) / 100);
                                                                        } else {
                                                                                couponDiscount = cartResponse.coupon.discount;
                                                                                orderObjPaidAmount = orderObjPaidAmount - cartResponse.coupon.discount;
                                                                        }
                                                                }
                                                        }
                                                }
                                                if (cartResponse.gifts.length > 0) {
                                                        let total = 0, subTotal = 0;
                                                        cartResponse.gifts.forEach(async (cartGift) => {
                                                                cartGift.total = parseFloat((cartGift.giftPriceId.price * cartGift.quantity).toFixed(2));
                                                                cartGift.subTotal = parseFloat((cartGift.giftPriceId.price * cartGift.quantity).toFixed(2));
                                                                subTotal += cartGift.subTotal;
                                                                total += cartGift.total;
                                                                let obj = {
                                                                        senderUser: req.user._id,
                                                                        code: cartResponse.orderId,
                                                                        title: 'Buy a gift Card',
                                                                        email: cartGift.email,
                                                                        description: "Your friend Gift a gift card",
                                                                        price: cartGift.giftPriceId.price,
                                                                        discount: cartGift.giftPriceId.giftCardrewards,
                                                                        per: "Amount",
                                                                }
                                                                orderObjPaidAmount = orderObjPaidAmount + total;
                                                                let saveOrder = await coupanModel.create(obj);
                                                                if (saveOrder) {
                                                                        giftOrderId = saveOrder._id;
                                                                        let orderObj = {
                                                                                userId: req.user._id,
                                                                                orderId: orderId,
                                                                                giftOrder: giftOrderId,
                                                                                productOrder: productOrderId,
                                                                                serviceOrder: serviceOrderId,
                                                                                orderObjTotalAmount: orderObjTotalAmount.toFixed(2),
                                                                                couponDiscount: couponDiscount,
                                                                                orderObjPaidAmount: orderObjPaidAmount.toFixed(2),
                                                                        }
                                                                        let saveOrder1 = await userOrders.create(orderObj);
                                                                        return res.status(200).json({ msg: "product added to cart", data: saveOrder1 });
                                                                }
                                                        });
                                                } else if (cartResponse.services.length > 0 && cartResponse.products.length > 0) {
                                                        orderObjTotalAmount = orderObjPaidAmount;
                                                        let orderObj = {
                                                                userId: req.user._id,
                                                                orderId: orderId,
                                                                productOrder: productOrderId,
                                                                serviceOrder: serviceOrderId,
                                                                orderObjTotalAmount: orderObjTotalAmount.toFixed(2),
                                                                applyCoupan: cartResponse.coupon,
                                                                couponDiscount: couponDiscount,
                                                                orderObjPaidAmount: orderObjPaidAmount.toFixed(2),
                                                        }
                                                        let saveOrder1 = await userOrders.create(orderObj);
                                                        return res.status(200).json({ msg: "product added to cart", data: saveOrder1 });
                                                } else if (cartResponse.services.length > 0 && cartResponse.products.length == 0) {
                                                        orderObjTotalAmount = orderObjPaidAmount;
                                                        let orderObj = {
                                                                userId: req.user._id,
                                                                orderId: orderId,
                                                                serviceOrder: serviceOrderId,
                                                                orderObjTotalAmount: orderObjTotalAmount.toFixed(2),
                                                                applyCoupan: cartResponse.coupon,
                                                                couponDiscount: couponDiscount,
                                                                orderStatus: "confirmed",
                                                                orderObjPaidAmount: orderObjPaidAmount.toFixed(2),
                                                        }
                                                        let saveOrder1 = await userOrders.create(orderObj);
                                                        return res.status(200).json({ msg: "product added to cart", data: saveOrder1 });
                                                } else {
                                                        orderObjTotalAmount = orderObjPaidAmount;
                                                        let orderObj = {
                                                                userId: req.user._id,
                                                                orderId: orderId,
                                                                productOrder: productOrderId,
                                                                serviceOrder: serviceOrderId,
                                                                orderObjTotalAmount: orderObjTotalAmount.toFixed(2),
                                                                applyCoupan: cartResponse.coupon,
                                                                couponDiscount: couponDiscount,
                                                                orderObjPaidAmount: orderObjPaidAmount.toFixed(2),
                                                        }
                                                        let saveOrder1 = await userOrders.create(orderObj);
                                                        return res.status(200).json({ msg: "product added to cart", data: saveOrder1 });
                                                }
                                        } else {
                                                return res.status(400).json({ status: 400, msg: "This Slot already booked. ", data: {} });
                                        }
                                } else {
                                        if (cartResponse.products.length > 0 || cartResponse.frequentlyBuyProductSchema.length > 0) {
                                                let shipping = 0, productArray = [], frequentlyBuyProductArray = [], offerDiscount = 0, productFBPTotal = 0, membershipDiscount = 0, membershipDiscountPercentage = 0, total = 0, subTotal = 0;
                                                for (const cartProduct of cartResponse.products) {
                                                        if (cartProduct.productId.multipleSize == true) {
                                                                for (let i = 0; i < cartProduct.productId.sizePrice.length; i++) {
                                                                        if ((cartProduct.productId.sizePrice[i]._id == cartProduct.priceId) == true) {
                                                                                if (data3.isSubscription === true) {
                                                                                        const findSubscription = await Subscription.findById(data3.subscriptionId);
                                                                                        if (findSubscription) {
                                                                                                membershipDiscountPercentage = findSubscription.discount;
                                                                                        }
                                                                                        let x = (parseFloat((cartProduct.productId.sizePrice[i].price * cartProduct.quantity).toFixed(2)) * parseFloat((membershipDiscountPercentage / 100).toFixed(2)));
                                                                                        cartProduct.membershipDiscount = parseFloat(x.toFixed(2))
                                                                                        membershipDiscount += x;
                                                                                        cartProduct.subTotal = parseFloat((cartProduct.productId.sizePrice[i].price * cartProduct.quantity).toFixed(2));
                                                                                        cartProduct.total = parseFloat((cartProduct.productId.sizePrice[i].price * cartProduct.quantity).toFixed(2) - x);
                                                                                        cartProduct.offerDiscount = 0.00;
                                                                                        offerDiscount += cartProduct.offerDiscount;
                                                                                        subTotal += cartProduct.subTotal;
                                                                                        total += (cartProduct.total - membershipDiscount);
                                                                                        productFBPTotal += cartProduct.total
                                                                                        const newCartItem = {
                                                                                                productId: cartProduct.productId._id,
                                                                                                price: cartProduct.productId.sizePrice[i].price,
                                                                                                size: cartProduct.size,
                                                                                                quantity: cartProduct.quantity,
                                                                                        };
                                                                                        productArray.push(newCartItem);
                                                                                } else {
                                                                                        membershipDiscount += 0;
                                                                                        cartProduct.membershipDiscount = membershipDiscount
                                                                                        cartProduct.subTotal = parseFloat((cartProduct.productId.sizePrice[i].price * cartProduct.quantity).toFixed(2));
                                                                                        cartProduct.total = parseFloat((cartProduct.productId.sizePrice[i].price * cartProduct.quantity).toFixed(2));
                                                                                        cartProduct.offerDiscount = 0.00;
                                                                                        offerDiscount += cartProduct.offerDiscount;
                                                                                        subTotal += cartProduct.subTotal;
                                                                                        total += (cartProduct.total);
                                                                                        productFBPTotal += cartProduct.total
                                                                                        const newCartItem = {
                                                                                                productId: cartProduct.productId._id,
                                                                                                price: cartProduct.productId.sizePrice[i].price,
                                                                                                size: cartProduct.size,
                                                                                                quantity: cartProduct.quantity,
                                                                                        };
                                                                                        productArray.push(newCartItem);
                                                                                }
                                                                        }
                                                                }
                                                        } else {
                                                                if (data3.isSubscription === true) {
                                                                        const findSubscription = await Subscription.findById(data3.subscriptionId);
                                                                        if (findSubscription) {
                                                                                membershipDiscountPercentage = findSubscription.discount;
                                                                        }
                                                                        let x = (parseFloat((cartProduct.productId.price * cartProduct.quantity).toFixed(2)) * parseFloat((membershipDiscountPercentage / 100).toFixed(2)));
                                                                        cartProduct.membershipDiscount = parseFloat(x.toFixed(2))
                                                                        membershipDiscount += x;
                                                                        cartProduct.subTotal = parseFloat((cartProduct.productId.price * cartProduct.quantity).toFixed(2));
                                                                        cartProduct.total = parseFloat((cartProduct.productId.price * cartProduct.quantity).toFixed(2) - x);
                                                                        cartProduct.offerDiscount = 0.00;
                                                                        offerDiscount += cartProduct.offerDiscount;
                                                                        subTotal += cartProduct.subTotal;
                                                                        total += (cartProduct.total - membershipDiscount);
                                                                        productFBPTotal += cartProduct.total
                                                                        const newCartItem = {
                                                                                productId: cartProduct.productId._id,
                                                                                price: cartProduct.productId.price,
                                                                                quantity: cartProduct.quantity,
                                                                        };
                                                                        productArray.push(newCartItem)
                                                                } else {
                                                                        let x = 0.00;
                                                                        cartProduct.membershipDiscount = parseFloat(x.toFixed(2))
                                                                        membershipDiscount += x;
                                                                        cartProduct.subTotal = parseFloat((cartProduct.productId.price * cartProduct.quantity).toFixed(2));
                                                                        cartProduct.total = parseFloat((cartProduct.productId.price * cartProduct.quantity).toFixed(2));
                                                                        cartProduct.offerDiscount = 0.00;
                                                                        offerDiscount += cartProduct.offerDiscount;
                                                                        subTotal += cartProduct.subTotal;
                                                                        total += cartProduct.total;
                                                                        productFBPTotal += cartProduct.total
                                                                        const newCartItem = {
                                                                                productId: cartProduct.productId._id,
                                                                                price: cartProduct.productId.price,
                                                                                quantity: cartProduct.quantity,
                                                                        };
                                                                        productArray.push(newCartItem)
                                                                }
                                                        }
                                                }
                                                cartResponse.frequentlyBuyProductSchema.forEach((cartFBP) => {
                                                        cartFBP.total = parseFloat((cartFBP.frequentlyBuyProductId.price * cartFBP.quantity).toFixed(2));
                                                        cartFBP.subTotal = parseFloat((cartFBP.frequentlyBuyProductId.price * cartFBP.quantity).toFixed(2));
                                                        subTotal += cartFBP.subTotal;
                                                        total += cartFBP.total;
                                                        const newCartItem = {
                                                                frequentlyBuyProductId: cartFBP.frequentlyBuyProductId._id,
                                                                price: cartFBP.frequentlyBuyProductId.price,
                                                                quantity: cartFBP.quantity,
                                                        };
                                                        frequentlyBuyProductArray.push(newCartItem);
                                                });
                                                cartResponse.subTotal = subTotal;
                                                cartResponse.memberShipPer = Number(membershipDiscountPercentage);
                                                cartResponse.memberShip = parseFloat(membershipDiscount).toFixed(2)
                                                cartResponse.offerDiscount = Number(offerDiscount);
                                                if (cartResponse.pickupFromStore == true) {
                                                        shipping = 0.00;
                                                        cartResponse.shipping = parseFloat(shipping.toFixed(2));
                                                        cartResponse.pickUp = data1;
                                                        cartResponse.billingAddresss = data5;
                                                        cartResponse.total = cartResponse.subTotal - membershipDiscount
                                                        orderObjPaidAmount = orderObjPaidAmount + cartResponse.subTotal - membershipDiscount;
                                                } else {
                                                        if (productFBPTotal <= 150) {
                                                                shipping = 8.00;
                                                                cartResponse.shipping = parseFloat(shipping.toFixed(2));
                                                        } else {
                                                                shipping = 12.00;
                                                                cartResponse.shipping = parseFloat(shipping.toFixed(2));
                                                        }
                                                        cartResponse.deliveryAddresss = data2;
                                                        cartResponse.billingAddresss = data5;
                                                        cartResponse.shipping = shipping;
                                                        cartResponse.total = cartResponse.subTotal + shipping - membershipDiscount
                                                        orderObjPaidAmount = orderObjPaidAmount + cartResponse.subTotal + shipping - membershipDiscount;
                                                }
                                                cartResponse.products = productArray;
                                                cartResponse.frequentlyBuyProductSchema = frequentlyBuyProductArray;
                                                cartResponse._id = new mongoose.Types.ObjectId();
                                                let saveOrder = await productOrder.create(cartResponse);
                                                productOrderId = saveOrder._id;
                                        }
                                        orderObjTotalAmount = orderObjPaidAmount;
                                        if (cartResponse.gifts.length > 0) {
                                                let total = 0, subTotal = 0;
                                                cartResponse.gifts.forEach(async (cartGift) => {
                                                        cartGift.total = parseFloat((cartGift.giftPriceId.price * cartGift.quantity).toFixed(2));
                                                        cartGift.subTotal = parseFloat((cartGift.giftPriceId.price * cartGift.quantity).toFixed(2));
                                                        subTotal += cartGift.subTotal;
                                                        total += cartGift.total;
                                                        let obj = {
                                                                senderUser: req.user._id,
                                                                code: cartResponse.orderId,
                                                                title: 'Buy a gift Card',
                                                                email: cartGift.email,
                                                                description: "Your friend Gift a gift card",
                                                                price: cartGift.giftPriceId.price,
                                                                discount: cartGift.giftPriceId.giftCardrewards,
                                                                per: "Amount",
                                                        }
                                                        orderObjPaidAmount = orderObjPaidAmount + total;
                                                        let saveOrder = await coupanModel.create(obj);
                                                        if (saveOrder) {
                                                                giftOrderId = saveOrder._id;
                                                                let orderObj = {
                                                                        userId: req.user._id,
                                                                        orderId: orderId,
                                                                        giftOrder: giftOrderId,
                                                                        productOrder: productOrderId,
                                                                        orderObjTotalAmount: orderObjTotalAmount.toFixed(2),
                                                                        orderObjPaidAmount: orderObjPaidAmount.toFixed(2),
                                                                }
                                                                let saveOrder1 = await userOrders.create(orderObj);
                                                                return res.status(200).json({ msg: "product added to cart", data: saveOrder1 });
                                                        }
                                                });
                                        } else {
                                                orderObjTotalAmount = orderObjPaidAmount;
                                                let orderObj = {
                                                        userId: req.user._id,
                                                        orderId: orderId,
                                                        productOrder: productOrderId,
                                                        orderObjTotalAmount: orderObjTotalAmount.toFixed(2),
                                                        orderObjPaidAmount: orderObjPaidAmount.toFixed(2),
                                                }
                                                let saveOrder1 = await userOrders.create(orderObj);
                                                return res.status(200).json({ msg: "product added to cart", data: saveOrder1 });
                                        }
                                }
                        } else {
                                return res.status(200).json({ success: false, msg: "Cart is empty", cart: {} });
                        }
                } else {
                        let findCart = await Cart.findOne({ user: req.user._id }).populate([{ path: "products.productId", select: { reviews: 0 } }, { path: "gifts.giftPriceId", select: { reviews: 0 } }, { path: "AddOnservicesSchema.addOnservicesId", select: { reviews: 0 } }, { path: "services.serviceId", select: { reviews: 0 } }, { path: 'frequentlyBuyProductSchema.frequentlyBuyProductId', populate: { path: 'products', model: 'Product' }, select: { reviews: 0 } }, { path: "coupon", select: "couponCode discount expirationDate used per" },]);
                        if (findCart) {
                                const data1 = await Address.findOne({ type: "Admin" }).select('address appartment landMark -_id');
                                const data2 = await Address.findOne({ user: req.user._id, addressType: "Shipping" }).select('address appartment city state zipCode -_id');
                                const data5 = await Address.findOne({ user: req.user._id, addressType: "Billing" }).select('address appartment city state zipCode -_id');
                                const data3 = await User.findOne({ _id: req.user._id });
                                let orderObjPaidAmount = 0, productOrderId, serviceOrderId, giftOrderId, couponDiscount = 0, orderObjTotalAmount = 0;
                                if (findCart.coupon && moment().isAfter(findCart.coupon.expirationDate, "day")) { findCart.coupon = undefined; findCart.save(); }
                                const cartResponse = findCart.toObject();
                                let orderId = await reffralCode();
                                cartResponse.orderId = orderId;
                                if (cartResponse.services.length > 0 || cartResponse.AddOnservicesSchema.length > 0) {
                                        const dateObject = new Date(findCart.date);
                                        const dateString = dateObject.toISOString().split('T')[0];
                                        const newTime = "00:00:00.000+00:00";
                                        const replacedDateString = `${dateString}T${newTime}`;
                                        let findSlot1 = await slot.find({ from: { $lte: findCart.fromTime }, to: { $gte: findCart.toTime }, date: replacedDateString, isBooked: false, slotBlocked: false });
                                        if (findSlot1.length > 0) {
                                                if (cartResponse.products.length > 0 || cartResponse.frequentlyBuyProductSchema.length > 0) {
                                                        let shipping = 0, productArray = [], frequentlyBuyProductArray = [], offerDiscount = 0, productFBPTotal = 0, membershipDiscount = 0, membershipDiscountPercentage = 0, total = 0, subTotal = 0;
                                                        for (const cartProduct of cartResponse.products) {
                                                                if (cartProduct.productId.multipleSize == true) {
                                                                        for (let i = 0; i < cartProduct.productId.sizePrice.length; i++) {
                                                                                if ((cartProduct.productId.sizePrice[i]._id == cartProduct.priceId) == true) {
                                                                                        if (data3.isSubscription === true) {
                                                                                                const findSubscription = await Subscription.findById(data3.subscriptionId);
                                                                                                if (findSubscription) {
                                                                                                        membershipDiscountPercentage = findSubscription.discount;
                                                                                                }
                                                                                                let x = (parseFloat((cartProduct.productId.sizePrice[i].price * cartProduct.quantity).toFixed(2)) * parseFloat((membershipDiscountPercentage / 100).toFixed(2)));
                                                                                                cartProduct.membershipDiscount = parseFloat(x.toFixed(2))
                                                                                                membershipDiscount += x;
                                                                                                cartProduct.subTotal = parseFloat((cartProduct.productId.sizePrice[i].price * cartProduct.quantity).toFixed(2));
                                                                                                cartProduct.total = parseFloat((cartProduct.productId.sizePrice[i].price * cartProduct.quantity).toFixed(2) - x);
                                                                                                cartProduct.offerDiscount = 0.00;
                                                                                                offerDiscount += cartProduct.offerDiscount;
                                                                                                subTotal += cartProduct.subTotal;
                                                                                                total += (cartProduct.total - membershipDiscount);
                                                                                                productFBPTotal += cartProduct.total
                                                                                                const newCartItem = {
                                                                                                        productId: cartProduct.productId._id,
                                                                                                        price: cartProduct.productId.sizePrice[i].price,
                                                                                                        size: cartProduct.size,
                                                                                                        quantity: cartProduct.quantity,
                                                                                                };
                                                                                                productArray.push(newCartItem);
                                                                                        } else {
                                                                                                membershipDiscount += 0;
                                                                                                cartProduct.membershipDiscount = membershipDiscount
                                                                                                cartProduct.subTotal = parseFloat((cartProduct.productId.sizePrice[i].price * cartProduct.quantity).toFixed(2));
                                                                                                cartProduct.total = parseFloat((cartProduct.productId.sizePrice[i].price * cartProduct.quantity).toFixed(2));
                                                                                                cartProduct.offerDiscount = 0.00;
                                                                                                offerDiscount += cartProduct.offerDiscount;
                                                                                                subTotal += cartProduct.subTotal;
                                                                                                total += (cartProduct.total);
                                                                                                productFBPTotal += cartProduct.total
                                                                                                const newCartItem = {
                                                                                                        productId: cartProduct.productId._id,
                                                                                                        price: cartProduct.productId.sizePrice[i].price,
                                                                                                        size: cartProduct.size,
                                                                                                        quantity: cartProduct.quantity,
                                                                                                };
                                                                                                productArray.push(newCartItem);
                                                                                        }
                                                                                }
                                                                        }
                                                                } else {
                                                                        if (data3.isSubscription === true) {
                                                                                const findSubscription = await Subscription.findById(data3.subscriptionId);
                                                                                if (findSubscription) {
                                                                                        membershipDiscountPercentage = findSubscription.discount;
                                                                                }
                                                                                let x = (parseFloat((cartProduct.productId.price * cartProduct.quantity).toFixed(2)) * parseFloat((membershipDiscountPercentage / 100).toFixed(2)));
                                                                                cartProduct.membershipDiscount = parseFloat(x.toFixed(2))
                                                                                membershipDiscount += x;
                                                                                cartProduct.subTotal = parseFloat((cartProduct.productId.price * cartProduct.quantity).toFixed(2));
                                                                                cartProduct.total = parseFloat((cartProduct.productId.price * cartProduct.quantity).toFixed(2) - x);
                                                                                cartProduct.offerDiscount = 0.00;
                                                                                offerDiscount += cartProduct.offerDiscount;
                                                                                subTotal += cartProduct.subTotal;
                                                                                total += (cartProduct.total - membershipDiscount);
                                                                                productFBPTotal += cartProduct.total
                                                                                const newCartItem = {
                                                                                        productId: cartProduct.productId._id,
                                                                                        price: cartProduct.productId.price,
                                                                                        quantity: cartProduct.quantity,
                                                                                };
                                                                                productArray.push(newCartItem)
                                                                        } else {
                                                                                let x = 0.00;
                                                                                cartProduct.membershipDiscount = parseFloat(x.toFixed(2))
                                                                                membershipDiscount += x;
                                                                                cartProduct.subTotal = parseFloat((cartProduct.productId.price * cartProduct.quantity).toFixed(2));
                                                                                cartProduct.total = parseFloat((cartProduct.productId.price * cartProduct.quantity).toFixed(2));
                                                                                cartProduct.offerDiscount = 0.00;
                                                                                offerDiscount += cartProduct.offerDiscount;
                                                                                subTotal += cartProduct.subTotal;
                                                                                total += cartProduct.total;
                                                                                productFBPTotal += cartProduct.total
                                                                                const newCartItem = {
                                                                                        productId: cartProduct.productId._id,
                                                                                        price: cartProduct.productId.price,
                                                                                        quantity: cartProduct.quantity,
                                                                                };
                                                                                productArray.push(newCartItem)
                                                                        }
                                                                }
                                                        }
                                                        cartResponse.frequentlyBuyProductSchema.forEach((cartFBP) => {
                                                                cartFBP.total = parseFloat((cartFBP.frequentlyBuyProductId.price * cartFBP.quantity).toFixed(2));
                                                                cartFBP.subTotal = parseFloat((cartFBP.frequentlyBuyProductId.price * cartFBP.quantity).toFixed(2));
                                                                subTotal += cartFBP.subTotal;
                                                                total += cartFBP.total;
                                                                const newCartItem = {
                                                                        frequentlyBuyProductId: cartFBP.frequentlyBuyProductId._id,
                                                                        price: cartFBP.frequentlyBuyProductId.price,
                                                                        quantity: cartFBP.quantity,
                                                                };
                                                                frequentlyBuyProductArray.push(newCartItem);
                                                        });
                                                        cartResponse.subTotal = subTotal;
                                                        cartResponse.memberShipPer = Number(membershipDiscountPercentage);
                                                        cartResponse.memberShip = parseFloat(membershipDiscount).toFixed(2)
                                                        cartResponse.offerDiscount = Number(offerDiscount);
                                                        if (cartResponse.pickupFromStore == true) {
                                                                shipping = 0.00;
                                                                cartResponse.shipping = parseFloat(shipping.toFixed(2));
                                                                cartResponse.pickUp = data1;
                                                                cartResponse.billingAddresss = data5;
                                                                cartResponse.total = cartResponse.subTotal - membershipDiscount
                                                                orderObjPaidAmount = orderObjPaidAmount + cartResponse.subTotal - membershipDiscount;
                                                        } else {
                                                                if (productFBPTotal <= 150) {
                                                                        shipping = 8.00;
                                                                        cartResponse.shipping = parseFloat(shipping.toFixed(2));
                                                                } else {
                                                                        shipping = 12.00;
                                                                        cartResponse.shipping = parseFloat(shipping.toFixed(2));
                                                                }
                                                                cartResponse.deliveryAddresss = data2;
                                                                cartResponse.billingAddresss = data5;
                                                                cartResponse.shipping = shipping;
                                                                cartResponse.total = cartResponse.subTotal + shipping - membershipDiscount
                                                                orderObjPaidAmount = orderObjPaidAmount + cartResponse.subTotal + shipping - membershipDiscount;
                                                        }
                                                        cartResponse.products = productArray;
                                                        cartResponse.frequentlyBuyProductSchema = frequentlyBuyProductArray;
                                                        cartResponse._id = new mongoose.Types.ObjectId();
                                                        let saveOrder = await productOrder.create(cartResponse);
                                                        productOrderId = saveOrder._id;
                                                }
                                                if (cartResponse.services.length > 0 || cartResponse.AddOnservicesSchema.length > 0) {
                                                        let totalTime = 0;
                                                        let offerDiscount = 0, membershipDiscount = 0, membershipDiscountPercentage = 0, total = 0, subTotal = 0;
                                                        if (cartResponse.services.length > 0) {
                                                                for (const cartProduct of cartResponse.services) {
                                                                        if (cartProduct.serviceId.type === "offer") {
                                                                                cartProduct.subTotal = parseFloat((cartProduct.serviceId.price * cartProduct.quantity).toFixed(2));
                                                                                cartProduct.total = parseFloat((cartProduct.serviceId.discountPrice * cartProduct.quantity).toFixed(2));
                                                                                cartProduct.offerDiscount = parseFloat(((cartProduct.serviceId.price - cartProduct.serviceId.discountPrice) * cartProduct.quantity).toFixed(2));
                                                                                offerDiscount += cartProduct.offerDiscount;
                                                                                subTotal += cartProduct.subTotal;
                                                                                total += cartProduct.total;
                                                                        }
                                                                        if (cartProduct.serviceId.type === "Service") {
                                                                                if (data3.isSubscription === true) {
                                                                                        if (cartProduct.serviceId.multipleSize == true) {
                                                                                                let x = (parseFloat((cartProduct.sizePrice * cartProduct.quantity).toFixed(2)) - parseFloat((cartProduct.memberprice * cartProduct.quantity).toFixed(2)));
                                                                                                cartProduct.membershipDiscount = parseFloat(x.toFixed(2))
                                                                                                membershipDiscount += x;
                                                                                                cartProduct.subTotal = parseFloat((cartProduct.sizePrice * cartProduct.quantity).toFixed(2));
                                                                                                cartProduct.total = parseFloat((cartProduct.memberprice * cartProduct.quantity).toFixed(2));
                                                                                                cartProduct.offerDiscount = 0.00;
                                                                                                offerDiscount += cartProduct.offerDiscount;
                                                                                                total += cartProduct.total;
                                                                                                subTotal += cartProduct.subTotal;
                                                                                        } else {
                                                                                                let x = (parseFloat((cartProduct.serviceId.price * cartProduct.quantity).toFixed(2)) - parseFloat((cartProduct.serviceId.mPrice * cartProduct.quantity).toFixed(2)));
                                                                                                cartProduct.membershipDiscount = parseFloat(x.toFixed(2))
                                                                                                membershipDiscount += x;
                                                                                                cartProduct.subTotal = parseFloat((cartProduct.serviceId.price * cartProduct.quantity).toFixed(2));
                                                                                                cartProduct.total = parseFloat((cartProduct.serviceId.mPrice * cartProduct.quantity).toFixed(2));
                                                                                                cartProduct.offerDiscount = 0.00;
                                                                                                offerDiscount += cartProduct.offerDiscount;
                                                                                                total += cartProduct.total;
                                                                                                subTotal += cartProduct.subTotal;
                                                                                        }
                                                                                } else {
                                                                                        if (cartProduct.serviceId.multipleSize == true) {
                                                                                                let x = 0
                                                                                                cartProduct.membershipDiscount = parseFloat(x.toFixed(2))
                                                                                                membershipDiscount += x;
                                                                                                cartProduct.subTotal = parseFloat((cartProduct.sizePrice * cartProduct.quantity).toFixed(2));
                                                                                                cartProduct.total = parseFloat((cartProduct.sizePrice * cartProduct.quantity).toFixed(2) - x);
                                                                                                cartProduct.offerDiscount = 0.00;
                                                                                                offerDiscount += cartProduct.offerDiscount;
                                                                                                total += cartProduct.total;
                                                                                                subTotal += cartProduct.subTotal;
                                                                                        } else {
                                                                                                let x = 0
                                                                                                cartProduct.membershipDiscount = parseFloat(x.toFixed(2))
                                                                                                membershipDiscount += x;
                                                                                                cartProduct.subTotal = parseFloat((cartProduct.serviceId.price * cartProduct.quantity).toFixed(2));
                                                                                                cartProduct.total = parseFloat((cartProduct.serviceId.price * cartProduct.quantity).toFixed(2) - x);
                                                                                                cartProduct.offerDiscount = 0.00;
                                                                                                offerDiscount += cartProduct.offerDiscount;
                                                                                                total += cartProduct.total;
                                                                                                subTotal += cartProduct.subTotal;
                                                                                        }
                                                                                }
                                                                        }
                                                                }
                                                        }
                                                        if (cartResponse.AddOnservicesSchema.length > 0) {
                                                                cartResponse.AddOnservicesSchema.forEach((cartGift) => {
                                                                        cartGift.total = parseFloat((cartGift.addOnservicesId.price * cartGift.quantity).toFixed(2));
                                                                        cartGift.subTotal = parseFloat((cartGift.addOnservicesId.price * cartGift.quantity).toFixed(2));
                                                                        subTotal += cartGift.subTotal;
                                                                        total += cartGift.total;
                                                                });
                                                        }
                                                        if (findCart.toTime != (null || undefined)) {
                                                                if (findCart.services.length > 0) {
                                                                        for (let i = 0; i < findCart.services.length; i++) {
                                                                                totalTime = totalTime + findCart.services[i].serviceId.totalMin;
                                                                        }
                                                                }
                                                                if (findCart.AddOnservicesSchema.length > 0) {
                                                                        for (let i = 0; i < findCart.AddOnservicesSchema.length; i++) {
                                                                                totalTime = totalTime + findCart.AddOnservicesSchema[i].addOnservicesId.totalMin;
                                                                        }
                                                                }
                                                        }
                                                        cartResponse.date = findCart.date;
                                                        cartResponse.time = findCart.time;
                                                        cartResponse.suggesstion = findCart.suggesstion;
                                                        cartResponse.memberShipPer = Number(membershipDiscountPercentage);
                                                        cartResponse.memberShip = parseFloat(membershipDiscount).toFixed(2)
                                                        cartResponse.offerDiscount = Number(offerDiscount);
                                                        cartResponse.subTotal = subTotal;
                                                        cartResponse.total = total;
                                                        cartResponse.serviceAddresss = data1;
                                                        orderObjPaidAmount = orderObjPaidAmount + total;
                                                        cartResponse._id = new mongoose.Types.ObjectId();
                                                        cartResponse.orderStatus = "confirmed";
                                                        const inputDate = new Date(findCart.toTime);
                                                        const options = {
                                                                weekday: 'long',
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric',
                                                                hour: 'numeric',
                                                                minute: 'numeric',
                                                                hour12: true
                                                        };
                                                        const formattedDate = inputDate.toLocaleString('en-US', { ...options, timeZone: 'UTC' });
                                                        if (totalTime > 0) {
                                                                var hours2 = Math.floor(totalTime / 60);
                                                                var minutes2 = totalTime % 60;
                                                                let timeInMin = hours2 + "hr" + " " + minutes2 + "min"
                                                                cartResponse.timeInMin = timeInMin;
                                                        }
                                                        let saveOrder = await serviceOrder.create(cartResponse);
                                                        if (saveOrder) {
                                                                let findSlot = await slot.find({ from: { $lte: findCart.fromTime }, to: { $gte: findCart.toTime }, date: replacedDateString, isBooked: false, slotBlocked: false });
                                                                if (findSlot.length > 0) {
                                                                        for (let i = 0; i < findSlot.length; i++) {
                                                                                let updateSlot = await slot.findByIdAndUpdate({ _id: findSlot[i]._id }, { $set: { isBooked: true } }, { new: true });
                                                                        }
                                                                }
                                                                const data4 = await User.findOne({ userType: "ADMIN" });
                                                                await adminNotification.create({
                                                                        orderUserId: req.user._id,
                                                                        userId: data4._id,
                                                                        title: `${data3.firstName} ${data3.lastName}, book online ${saveOrder.total}`,
                                                                        body: findCart.services[0].serviceId.description,
                                                                })
                                                                var transporter = nodemailer.createTransport({ service: 'gmail', auth: { "user": "info@shahinahoja.com", "pass": "gganlypsemwqhwlh" } });
                                                                let mailOptions = {
                                                                        from: '<do_not_reply@gmail.com>',
                                                                        to: `${req.user.email}`,
                                                                        cc: 'info@shahinahoja.com',
                                                                        subject: 'Order Received',
                                                                        text: `You have received a new order`,
                                                                        html: `<html lang="en">
                                                                                <head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>Email</title></head>
                                                                                <body>
                                                                                    <div style="width: 100%; height: 100%"><div style="background-color: white;max-width: 600px;margin: auto;border: 1px solid black;"><div style="  width: 90%;  margin: auto;  margin-top: 2rem;  margin-bottom: 4rem;"><buttonstyle="color: white;border-left: 50%;padding: 5px;height: 2rem;width: 7rem;border-radius: 1rem;background-color: blueviolet;border: none;outline: none;">Confirmed</button><div style="margin-top: 2rem"><p style="font-size: 30px; font-weight: bold">Looking forward to seeing you soon Nisan</p></div><p style="margin-top: 1rem">This is a friendly reminder about your appointment on<span style="color: rgb(153, 74, 228)">${formattedDate}</span>with Shahina Hoja Aesthetics.</p>
                                                                                    <div><a href="https://shahina-web.vercel.app/"><button style="width: 100%;padding: 10px;background-color: black;color: white;border: none;outline: none;cursor: pointer;border-radius: 3px;font-size: 1rem;">Get directions</button></a><a href="https://shahina-web.vercel.app/" target='_blank'><button style="width: 100%;padding: 10px;cursor: pointers;outline: none;border-radius: 3px;cursor: pointer;font-size: 1rem;margin-top: 1rem;">Manage appointment</button></a></div>
                                                                                    <div style="margin-top: 1.5rem"><h4 style="font-size: 1.5rem; font-weight: bold">Appointment details</h4><div style="margin-top: 1rem;display: flex;justify-content: space-between;"><div>
                                                                                    <ul>${findCart.services.map((service, index) => `<h5 style="font-weight: bold; font-size: 1rem">${service.serviceId.name}                   $ ${service.price}</h5><p style="color: rgb(131, 120, 120)"> ${service.totalTime}  with  Shahina</p>`).join('')}</ul></div></div><hr style="margin-top: 0.5rem; line-height: 7px" /><div style="margin-top: 0.5rem;display: flex;justify-content: space-between;"><div><p style="font-weight: bold">Total</p></div><p style="font-weight: bold">$ ${saveOrder.total}</p>
                                                                                                    </div><hr style="margin-top: 1rem" /></div>
                                                                                                <p style="color: rgb(142, 133, 133); margin-top: 0.5rem">Booking ref: ${orderId}</p>
                                                                                
                                                                                                <div>
                                                                                                    <h3 style="margin-top: 1rem">Location</h3>
                                                                                                    <div style="margin-top: 0.5rem;display: flex;justify-content: space-between;">
                                                                                                        <div style="line-height: 20px">
                                                                                                            <h5>Shahine Hoja Aesthetics</h5>
                                                                                                            <p style="color: rgb(100, 28, 162)">
                                                                                                                Shahina Hoja Aesthetics
905 Watters Creek Boulevard ,141 Allen, 75013, Texas, Us
                                                                                                            </p>
                                                                                                        </div>
                                                                                                        <img src="https://res.cloudinary.com/djgrqoefp/image/upload/v1704388341/shahina/contactDetail/lv8rvmn6nbkzbzekiexq.png"
                                                                                                            style="height: 50px; width: 50px; margin-left:25px; border-radius: 10px" />
                                                                                                    </div>
                                                                                                </div>
                                                                                
                                                                                                <div style="margin-top: 1.5rem; line-height: 20px">
                                                                                                    <h3>Cancellation Policy</h3>
                                                                                                    <p style="margin-top: 1rem">
                                                                                                        Please avoid Cancellation with in <strong>48 hours</strong> of your
                                                                                                        appointment
                                                                                                    </p>
                                                                                                </div>
                                                                                
                                                                                                <div style="margin-top: 1.5rem; line-height: 20px">
                                                                                                    <h3>Important Info</h3>
                                                                                                    <p style="margin-top: 1rem">
                                                                                                        We are now offering payment plans through cherry. if you're
                                                                                                        interseted , please apply hare appointment
                                                                                                    </p>
                                                                                                    <p style="color: blueviolet; cursor: pointer">
                                                                                                    https://pay.withcherry.com/shahinahoja
                                                                                                    </p>
                                                                                                </div>
                                                                                                <p style="margin-top: 2.5rem">
                                                                                                    we send you this because you have booked with shahine hoja Aesthics,
                                                                                                    which partners with for appoinment and payments.
                                                                                                </p>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </body>
                                                                                </html>`
                                                                };
                                                                let info1 = await transporter.sendMail(mailOptions);
                                                                if (info1) {
                                                                        serviceOrderId = saveOrder._id;
                                                                } else {
                                                                        serviceOrderId = saveOrder._id;
                                                                }
                                                        }
                                                }
                                                orderObjTotalAmount = orderObjPaidAmount;
                                                if (cartResponse.coupon != (null || undefined)) {
                                                        if (cartResponse.coupon.completeVisit == 5 && data3.orderVisit > 5) {
                                                                if (cartResponse.coupon.used == false) {
                                                                        if (cartResponse.coupon.per == "Percentage") {
                                                                                couponDiscount = ((orderObjPaidAmount * cartResponse.coupon.discount) / 100);
                                                                                orderObjPaidAmount = orderObjPaidAmount - ((orderObjPaidAmount * cartResponse.coupon.discount) / 100);
                                                                        } else {
                                                                                couponDiscount = cartResponse.coupon.discount;
                                                                                orderObjPaidAmount = orderObjPaidAmount - cartResponse.coupon.discount;
                                                                        }
                                                                }
                                                        } else {
                                                                if (cartResponse.coupon.used == false) {
                                                                        if (cartResponse.coupon.per == "Percentage") {
                                                                                couponDiscount = ((orderObjPaidAmount * cartResponse.coupon.discount) / 100);
                                                                                orderObjPaidAmount = orderObjPaidAmount - ((orderObjPaidAmount * cartResponse.coupon.discount) / 100);
                                                                        } else {
                                                                                couponDiscount = cartResponse.coupon.discount;
                                                                                orderObjPaidAmount = orderObjPaidAmount - cartResponse.coupon.discount;
                                                                        }
                                                                }
                                                        }
                                                }
                                                if (cartResponse.gifts.length > 0) {
                                                        let total = 0, subTotal = 0;
                                                        cartResponse.gifts.forEach(async (cartGift) => {
                                                                cartGift.total = parseFloat((cartGift.giftPriceId.price * cartGift.quantity).toFixed(2));
                                                                cartGift.subTotal = parseFloat((cartGift.giftPriceId.price * cartGift.quantity).toFixed(2));
                                                                subTotal += cartGift.subTotal;
                                                                total += cartGift.total;
                                                                let obj = {
                                                                        senderUser: req.user._id,
                                                                        code: cartResponse.orderId,
                                                                        title: 'Buy a gift Card',
                                                                        email: cartGift.email,
                                                                        description: "Your friend Gift a gift card",
                                                                        price: cartGift.giftPriceId.price,
                                                                        discount: cartGift.giftPriceId.giftCardrewards,
                                                                        per: "Amount",
                                                                }
                                                                orderObjPaidAmount = orderObjPaidAmount + total;
                                                                let saveOrder = await coupanModel.create(obj);
                                                                if (saveOrder) {
                                                                        giftOrderId = saveOrder._id;
                                                                        let orderObj = {
                                                                                userId: req.user._id,
                                                                                orderId: orderId,
                                                                                giftOrder: giftOrderId,
                                                                                productOrder: productOrderId,
                                                                                serviceOrder: serviceOrderId,
                                                                                orderObjTotalAmount: orderObjTotalAmount.toFixed(2),
                                                                                couponDiscount: couponDiscount,
                                                                                orderObjPaidAmount: orderObjPaidAmount.toFixed(2),
                                                                        }
                                                                        let saveOrder1 = await userOrders.create(orderObj);
                                                                        return res.status(200).json({ msg: "product added to cart", data: saveOrder1 });
                                                                }
                                                        });
                                                } else if (cartResponse.services.length > 0 && cartResponse.products.length > 0) {
                                                        orderObjTotalAmount = orderObjPaidAmount;
                                                        let orderObj = {
                                                                userId: req.user._id,
                                                                orderId: orderId,
                                                                productOrder: productOrderId,
                                                                serviceOrder: serviceOrderId,
                                                                orderObjTotalAmount: orderObjTotalAmount.toFixed(2),
                                                                applyCoupan: cartResponse.coupon,
                                                                couponDiscount: couponDiscount,
                                                                orderObjPaidAmount: orderObjPaidAmount.toFixed(2),
                                                        }
                                                        let saveOrder1 = await userOrders.create(orderObj);
                                                        return res.status(200).json({ msg: "product added to cart", data: saveOrder1 });
                                                } else if (cartResponse.services.length > 0 && cartResponse.products.length == 0) {
                                                        orderObjTotalAmount = orderObjPaidAmount;
                                                        let orderObj = {
                                                                userId: req.user._id,
                                                                orderId: orderId,
                                                                serviceOrder: serviceOrderId,
                                                                orderObjTotalAmount: orderObjTotalAmount.toFixed(2),
                                                                applyCoupan: cartResponse.coupon,
                                                                couponDiscount: couponDiscount,
                                                                orderStatus: "confirmed",
                                                                orderObjPaidAmount: orderObjPaidAmount.toFixed(2),
                                                        }
                                                        let saveOrder1 = await userOrders.create(orderObj);
                                                        return res.status(200).json({ msg: "product added to cart", data: saveOrder1 });
                                                } else {
                                                        orderObjTotalAmount = orderObjPaidAmount;
                                                        let orderObj = {
                                                                userId: req.user._id,
                                                                orderId: orderId,
                                                                productOrder: productOrderId,
                                                                serviceOrder: serviceOrderId,
                                                                orderObjTotalAmount: orderObjTotalAmount.toFixed(2),
                                                                applyCoupan: cartResponse.coupon,
                                                                couponDiscount: couponDiscount,
                                                                orderObjPaidAmount: orderObjPaidAmount.toFixed(2),
                                                        }
                                                        let saveOrder1 = await userOrders.create(orderObj);
                                                        return res.status(200).json({ msg: "product added to cart", data: saveOrder1 });
                                                }
                                        } else {
                                                return res.status(400).json({ status: 400, msg: "This Slot already booked. ", data: {} });
                                        }
                                } else {
                                        if (cartResponse.products.length > 0 || cartResponse.frequentlyBuyProductSchema.length > 0) {
                                                let shipping = 0, productArray = [], frequentlyBuyProductArray = [], offerDiscount = 0, productFBPTotal = 0, membershipDiscount = 0, membershipDiscountPercentage = 0, total = 0, subTotal = 0;
                                                for (const cartProduct of cartResponse.products) {
                                                        if (cartProduct.productId.multipleSize == true) {
                                                                for (let i = 0; i < cartProduct.productId.sizePrice.length; i++) {
                                                                        if ((cartProduct.productId.sizePrice[i]._id == cartProduct.priceId) == true) {
                                                                                if (data3.isSubscription === true) {
                                                                                        const findSubscription = await Subscription.findById(data3.subscriptionId);
                                                                                        if (findSubscription) {
                                                                                                membershipDiscountPercentage = findSubscription.discount;
                                                                                        }
                                                                                        let x = (parseFloat((cartProduct.productId.sizePrice[i].price * cartProduct.quantity).toFixed(2)) * parseFloat((membershipDiscountPercentage / 100).toFixed(2)));
                                                                                        cartProduct.membershipDiscount = parseFloat(x.toFixed(2))
                                                                                        membershipDiscount += x;
                                                                                        cartProduct.subTotal = parseFloat((cartProduct.productId.sizePrice[i].price * cartProduct.quantity).toFixed(2));
                                                                                        cartProduct.total = parseFloat((cartProduct.productId.sizePrice[i].price * cartProduct.quantity).toFixed(2) - x);
                                                                                        cartProduct.offerDiscount = 0.00;
                                                                                        offerDiscount += cartProduct.offerDiscount;
                                                                                        subTotal += cartProduct.subTotal;
                                                                                        total += (cartProduct.total - membershipDiscount);
                                                                                        productFBPTotal += cartProduct.total
                                                                                        const newCartItem = {
                                                                                                productId: cartProduct.productId._id,
                                                                                                price: cartProduct.productId.sizePrice[i].price,
                                                                                                size: cartProduct.size,
                                                                                                quantity: cartProduct.quantity,
                                                                                        };
                                                                                        productArray.push(newCartItem);
                                                                                } else {
                                                                                        membershipDiscount += 0;
                                                                                        cartProduct.membershipDiscount = membershipDiscount
                                                                                        cartProduct.subTotal = parseFloat((cartProduct.productId.sizePrice[i].price * cartProduct.quantity).toFixed(2));
                                                                                        cartProduct.total = parseFloat((cartProduct.productId.sizePrice[i].price * cartProduct.quantity).toFixed(2));
                                                                                        cartProduct.offerDiscount = 0.00;
                                                                                        offerDiscount += cartProduct.offerDiscount;
                                                                                        subTotal += cartProduct.subTotal;
                                                                                        total += (cartProduct.total);
                                                                                        productFBPTotal += cartProduct.total
                                                                                        const newCartItem = {
                                                                                                productId: cartProduct.productId._id,
                                                                                                price: cartProduct.productId.sizePrice[i].price,
                                                                                                size: cartProduct.size,
                                                                                                quantity: cartProduct.quantity,
                                                                                        };
                                                                                        productArray.push(newCartItem);
                                                                                }
                                                                        }
                                                                }
                                                        } else {
                                                                if (data3.isSubscription === true) {
                                                                        const findSubscription = await Subscription.findById(data3.subscriptionId);
                                                                        if (findSubscription) {
                                                                                membershipDiscountPercentage = findSubscription.discount;
                                                                        }
                                                                        let x = (parseFloat((cartProduct.productId.price * cartProduct.quantity).toFixed(2)) * parseFloat((membershipDiscountPercentage / 100).toFixed(2)));
                                                                        cartProduct.membershipDiscount = parseFloat(x.toFixed(2))
                                                                        membershipDiscount += x;
                                                                        cartProduct.subTotal = parseFloat((cartProduct.productId.price * cartProduct.quantity).toFixed(2));
                                                                        cartProduct.total = parseFloat((cartProduct.productId.price * cartProduct.quantity).toFixed(2) - x);
                                                                        cartProduct.offerDiscount = 0.00;
                                                                        offerDiscount += cartProduct.offerDiscount;
                                                                        subTotal += cartProduct.subTotal;
                                                                        total += (cartProduct.total - membershipDiscount);
                                                                        productFBPTotal += cartProduct.total
                                                                        const newCartItem = {
                                                                                productId: cartProduct.productId._id,
                                                                                price: cartProduct.productId.price,
                                                                                quantity: cartProduct.quantity,
                                                                        };
                                                                        productArray.push(newCartItem)
                                                                } else {
                                                                        let x = 0.00;
                                                                        cartProduct.membershipDiscount = parseFloat(x.toFixed(2))
                                                                        membershipDiscount += x;
                                                                        cartProduct.subTotal = parseFloat((cartProduct.productId.price * cartProduct.quantity).toFixed(2));
                                                                        cartProduct.total = parseFloat((cartProduct.productId.price * cartProduct.quantity).toFixed(2));
                                                                        cartProduct.offerDiscount = 0.00;
                                                                        offerDiscount += cartProduct.offerDiscount;
                                                                        subTotal += cartProduct.subTotal;
                                                                        total += cartProduct.total;
                                                                        productFBPTotal += cartProduct.total
                                                                        const newCartItem = {
                                                                                productId: cartProduct.productId._id,
                                                                                price: cartProduct.productId.price,
                                                                                quantity: cartProduct.quantity,
                                                                        };
                                                                        productArray.push(newCartItem)
                                                                }
                                                        }
                                                }
                                                cartResponse.frequentlyBuyProductSchema.forEach((cartFBP) => {
                                                        cartFBP.total = parseFloat((cartFBP.frequentlyBuyProductId.price * cartFBP.quantity).toFixed(2));
                                                        cartFBP.subTotal = parseFloat((cartFBP.frequentlyBuyProductId.price * cartFBP.quantity).toFixed(2));
                                                        subTotal += cartFBP.subTotal;
                                                        total += cartFBP.total;
                                                        const newCartItem = {
                                                                frequentlyBuyProductId: cartFBP.frequentlyBuyProductId._id,
                                                                price: cartFBP.frequentlyBuyProductId.price,
                                                                quantity: cartFBP.quantity,
                                                        };
                                                        frequentlyBuyProductArray.push(newCartItem);
                                                });
                                                cartResponse.subTotal = subTotal;
                                                cartResponse.memberShipPer = Number(membershipDiscountPercentage);
                                                cartResponse.memberShip = parseFloat(membershipDiscount).toFixed(2)
                                                cartResponse.offerDiscount = Number(offerDiscount);
                                                if (cartResponse.pickupFromStore == true) {
                                                        shipping = 0.00;
                                                        cartResponse.shipping = parseFloat(shipping.toFixed(2));
                                                        cartResponse.pickUp = data1;
                                                        cartResponse.billingAddresss = data5;
                                                        cartResponse.total = cartResponse.subTotal - membershipDiscount
                                                        orderObjPaidAmount = orderObjPaidAmount + cartResponse.subTotal - membershipDiscount;
                                                } else {
                                                        if (productFBPTotal <= 150) {
                                                                shipping = 8.00;
                                                                cartResponse.shipping = parseFloat(shipping.toFixed(2));
                                                        } else {
                                                                shipping = 12.00;
                                                                cartResponse.shipping = parseFloat(shipping.toFixed(2));
                                                        }
                                                        cartResponse.deliveryAddresss = data2;
                                                        cartResponse.billingAddresss = data5;
                                                        cartResponse.shipping = shipping;
                                                        cartResponse.total = cartResponse.subTotal + shipping - membershipDiscount
                                                        orderObjPaidAmount = orderObjPaidAmount + cartResponse.subTotal + shipping - membershipDiscount;
                                                }
                                                cartResponse.products = productArray;
                                                cartResponse.frequentlyBuyProductSchema = frequentlyBuyProductArray;
                                                cartResponse._id = new mongoose.Types.ObjectId();
                                                let saveOrder = await productOrder.create(cartResponse);
                                                productOrderId = saveOrder._id;
                                        }
                                        orderObjTotalAmount = orderObjPaidAmount;
                                        if (cartResponse.gifts.length > 0) {
                                                let total = 0, subTotal = 0;
                                                cartResponse.gifts.forEach(async (cartGift) => {
                                                        cartGift.total = parseFloat((cartGift.giftPriceId.price * cartGift.quantity).toFixed(2));
                                                        cartGift.subTotal = parseFloat((cartGift.giftPriceId.price * cartGift.quantity).toFixed(2));
                                                        subTotal += cartGift.subTotal;
                                                        total += cartGift.total;
                                                        let obj = {
                                                                senderUser: req.user._id,
                                                                code: cartResponse.orderId,
                                                                title: 'Buy a gift Card',
                                                                email: cartGift.email,
                                                                description: "Your friend Gift a gift card",
                                                                price: cartGift.giftPriceId.price,
                                                                discount: cartGift.giftPriceId.giftCardrewards,
                                                                per: "Amount",
                                                        }
                                                        orderObjPaidAmount = orderObjPaidAmount + total;
                                                        let saveOrder = await coupanModel.create(obj);
                                                        if (saveOrder) {
                                                                giftOrderId = saveOrder._id;
                                                                let orderObj = {
                                                                        userId: req.user._id,
                                                                        orderId: orderId,
                                                                        giftOrder: giftOrderId,
                                                                        productOrder: productOrderId,
                                                                        orderObjTotalAmount: orderObjTotalAmount.toFixed(2),
                                                                        orderObjPaidAmount: orderObjPaidAmount.toFixed(2),
                                                                }
                                                                let saveOrder1 = await userOrders.create(orderObj);
                                                                return res.status(200).json({ msg: "product added to cart", data: saveOrder1 });
                                                        }
                                                });
                                        } else {
                                                orderObjTotalAmount = orderObjPaidAmount;
                                                let orderObj = {
                                                        userId: req.user._id,
                                                        orderId: orderId,
                                                        productOrder: productOrderId,
                                                        orderObjTotalAmount: orderObjTotalAmount.toFixed(2),
                                                        orderObjPaidAmount: orderObjPaidAmount.toFixed(2),
                                                }
                                                let saveOrder1 = await userOrders.create(orderObj);
                                                return res.status(200).json({ msg: "product added to cart", data: saveOrder1 });
                                        }
                                }
                        } else {
                                return res.status(200).json({ success: false, msg: "Cart is empty", cart: {} });
                        }
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.placeOrderApp = async (req, res) => {
        try {
                let findUserOrder = await userOrders.findOne({ orderId: req.params.orderId });
                if (findUserOrder) {
                        let memberShipPer = 0.00, offerDiscount = 0, subTotals = 0, couponDiscount = Number(findUserOrder.couponDiscount) || 0;
                        let line_items = [];
                        if (findUserOrder.productOrder != (null || undefined)) {
                                let discount = 0, total = 0, subTotal = 0;
                                let findOrder = await productOrder.findById({ _id: findUserOrder.productOrder }).populate([{ path: "products.productId", select: { reviews: 0 } },
                                { path: 'frequentlyBuyProductSchema.frequentlyBuyProductId', populate: { path: 'products', model: 'Product' }, select: { reviews: 0 } },
                                { path: "coupon", select: "couponCode discount expirationDate" },]);
                                findOrder.products.forEach((cartProduct) => {
                                        let price;
                                        cartProduct.total = parseFloat((cartProduct.price * cartProduct.quantity).toFixed(2));
                                        cartProduct.subTotal = parseFloat((cartProduct.price * cartProduct.quantity).toFixed(2));
                                        cartProduct.discount = 0.00;
                                        price = parseFloat((cartProduct.price * cartProduct.quantity).toFixed(2));
                                        subTotal += cartProduct.subTotal;
                                        discount += cartProduct.discount;
                                        total += cartProduct.total;
                                        let name;
                                        if (cartProduct.size != (null || undefined)) {
                                                name = `${cartProduct.productId.name} (${cartProduct.size})`;
                                        } else {
                                                name = `${cartProduct.productId.name}`;
                                        }
                                        let obj2 = {
                                                price_data: {
                                                        currency: "usd",
                                                        product_data: {
                                                                name: name,
                                                        },
                                                        unit_amount: `${Math.round(price * 100)}`,
                                                },
                                                quantity: 1,
                                        }
                                        subTotals = subTotals + price
                                        console.log("1662", subTotals);
                                        line_items.push(obj2)
                                });
                                findOrder.frequentlyBuyProductSchema.forEach((cartProduct) => {
                                        let price;
                                        cartProduct.total = cartProduct.frequentlyBuyProductId.price * cartProduct.quantity;
                                        cartProduct.subTotal = cartProduct.frequentlyBuyProductId.price * cartProduct.quantity;
                                        cartProduct.discount = 0;
                                        subTotal += cartProduct.subTotal;
                                        discount += cartProduct.discount;
                                        total += cartProduct.total;
                                        price = cartProduct.frequentlyBuyProductId.price * cartProduct.quantity
                                        let obj2 = {
                                                price_data: {
                                                        currency: "usd",
                                                        product_data: {
                                                                name: `Frequently`,
                                                        },
                                                        unit_amount: `${Math.round(price * 100)}`,
                                                },
                                                quantity: 1,
                                        }
                                        subTotals = subTotals + price
                                        console.log("1685", subTotals);
                                        line_items.push(obj2)
                                });
                                let delivery = Number(findOrder.shipping);
                                let obj3 = {
                                        price_data: {
                                                currency: "usd",
                                                product_data: {
                                                        name: `Delivery Charge`,
                                                },
                                                unit_amount: `${Math.round(delivery * 100)}`,
                                        },
                                        quantity: 1,
                                }
                                subTotals = subTotals + delivery
                                console.log("1700", subTotals);
                                line_items.push(obj3)
                                memberShipPer += findOrder.memberShip;
                        }
                        if (findUserOrder.giftOrder != (null || undefined)) {
                                let total = 0, subTotal = 0;
                                let findOrder3 = await coupanModel.findById({ _id: findUserOrder.giftOrder, orderStatus: "unconfirmed" });
                                let price;
                                findOrder3.total = findOrder3.price * 1;
                                findOrder3.subTotal = findOrder3.price * 1;
                                price = findOrder3.price * 1
                                subTotal += findOrder3.subTotal;
                                total += findOrder3.total;
                                let obj2 = {
                                        price_data: {
                                                currency: "usd",
                                                product_data: {
                                                        name: `${findOrder3.title}`,
                                                },
                                                unit_amount: `${Math.round(price * 100)}`,
                                        },
                                        quantity: 1,
                                }
                                subTotals = subTotals + price
                                console.log("1700", subTotals);
                                line_items.push(obj2)
                        }
                        let metadataString = line_items.slice(0, 3).map(item => item.price_data.product_data.name).join(', ');
                        console.log(line_items);
                        const metadata = {
                                order_id: findUserOrder.orderId,
                                line_items: metadataString,
                        };
                        if (memberShipPer > 0) {
                                if (offerDiscount > 0) {
                                        if (couponDiscount > 0) {
                                                subTotals = subTotals - offerDiscount - memberShipPer - couponDiscount;
                                        } else {
                                                subTotals = subTotals - memberShipPer - offerDiscount;
                                        }
                                } else {
                                        if (couponDiscount > 0) {
                                                subTotals = subTotals - memberShipPer - couponDiscount;
                                        } else {
                                                subTotals = subTotals - memberShipPer;
                                        }
                                };
                                console.log(memberShipPer, subTotals, offerDiscount);
                                const paymentIntent = await stripe.paymentIntents.create({
                                        amount: Math.round(subTotals * 100),
                                        currency: 'usd',
                                        payment_method_types: ['card'],
                                        customer: req.user.stripeCustomerId,
                                        receipt_email: req.user.email,
                                        description: 'Order Payment',
                                        statement_descriptor: 'ORDER',
                                        metadata: metadata,
                                        application_fee_amount: 0,
                                });
                                return res.status(200).json({ paymentIntent: paymentIntent })
                        } else if (offerDiscount > 0 && memberShipPer == 0) {
                                if (couponDiscount > 0) {
                                        subTotals = subTotals - offerDiscount - couponDiscount;
                                } else {
                                        subTotals = subTotals - offerDiscount;
                                }
                                const paymentIntent = await stripe.paymentIntents.create({
                                        amount: Math.round(subTotals * 100),
                                        currency: 'usd',
                                        payment_method_types: ['card'],
                                        customer: req.user.stripeCustomerId,
                                        receipt_email: req.user.email,
                                        description: 'Order Payment',
                                        statement_descriptor: 'ORDER',
                                        metadata: metadata,
                                        application_fee_amount: 0,
                                });
                                return res.status(200).json({ paymentIntent: paymentIntent })
                        } else {
                                const paymentIntent = await stripe.paymentIntents.create({
                                        amount: Math.round(subTotals * 100),
                                        currency: 'usd',
                                        payment_method_types: ['card'],
                                        customer: req.user.stripeCustomerId,
                                        receipt_email: req.user.email,
                                        description: 'Order Payment',
                                        statement_descriptor: 'ORDER',
                                        metadata: metadata,
                                        application_fee_amount: 0,
                                });
                                return res.status(200).json({ paymentIntent: paymentIntent })
                        }
                } else {
                        return res.status(404).json({ message: "No data found", data: {} });
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.successOrderApp = async (req, res) => {
        try {
                let findUserOrder = await userOrders.findOne({ orderId: req.params.orderId }).populate('applyCoupan');
                if (findUserOrder) {
                        const user = await User.findById({ _id: findUserOrder.userId });
                        if (!user) {
                                return res.status(404).send({ status: 404, message: "User not found or token expired." });
                        }
                        let update2 = await userOrders.findOneAndUpdate({ orderId: findUserOrder.orderId }, { $set: { orderStatus: "confirmed", paymentStatus: "paid" } }, { new: true });
                        let find1 = await productOrder.findOne({ orderId: findUserOrder.orderId }).populate([{ path: "products.productId", select: { reviews: 0 } }, { path: 'frequentlyBuyProductSchema.frequentlyBuyProductId', populate: { path: 'products', model: 'Product' }, }, { path: "coupon", select: "couponCode discount expirationDate" },]);
                        if (find1) {
                                let update = await productOrder.findOneAndUpdate({ orderId: findUserOrder.orderId }, { $set: { orderStatus: "confirmed", paymentStatus: "paid" } }, { new: true });
                        }
                        let find3 = await coupanModel.findOne({ orderId: findUserOrder.orderId });
                        if (find3) {
                                let findOrder3 = await coupanModel.findOneAndUpdate({ code: findUserOrder.orderId }, { $set: { orderStatus: "confirmed", paymentStatus: "paid" } }, { new: true });
                                if (findOrder3) {
                                        var transporter = nodemailer.createTransport({ service: 'gmail', auth: { "user": "info@shahinahoja.com", "pass": "gganlypsemwqhwlh" } });
                                        let mailOptions = { from: 'info@shahinahoja.com', to: findOrder3.email, subject: 'Gift Card Provide by Your friend', text: `Gift Card Provide by Your friend Coupan Code is ${findOrder3.code}`, };
                                        let info = await transporter.sendMail(mailOptions);
                                }
                        }
                        await User.findOneAndUpdate({ _id: user._id }, { $set: { appOrder: user.appOrder + 1 } }, { new: true });
                        var transporter = nodemailer.createTransport({ service: 'gmail', auth: { "user": "info@shahinahoja.com", "pass": "gganlypsemwqhwlh" } });
                        let mailOption1 = {
                                from: '<do_not_reply@gmail.com>',
                                to: 'info@shahinahoja.com',
                                subject: 'Order Received',
                                text: `You have received a new order`,
                                html: `
                                  <p>You have received a new order:</p>
                                  <p>Name: ${user.firstName} ${user.lastName}</p>
                                  <p>Email: ${user.email}</p>
                                  <p>Contact Number: ${user.phone}</p>
                                  <p>Order Id: ${findUserOrder.orderId}</p>
                                  <p>Order Amount: ${findUserOrder.orderObjPaidAmount}</p>
                                  <p>Product Details:</p>
                                  <ul>
                                    ${find1.products.map((product, index) => `
                                      <li>
                                        Product ${index + 1}:
                                        <ul>
                                          <li>Name: ${product.productId.name}</li>
                                          <li>Price: ${product.price}</li>
                                          <li>Quantity: ${product.quantity}</li>
                                        </ul>
                                      </li>
                                    `).join('')}
                                  </ul>
                                `,
                        };
                        let info1 = await transporter.sendMail(mailOption1);
                        if (info1) {
                                let deleteCart = await Cart.findOneAndDelete({ user: findUserOrder.userId });
                                if (deleteCart) {
                                        return res.status(200).json({ message: "Payment success.", status: 200, data: update2 });
                                }
                        } else {
                                let deleteCart = await Cart.findOneAndDelete({ user: findUserOrder.userId });
                                if (deleteCart) {
                                        return res.status(200).json({ message: "Payment success.", status: 200, data: update2 });
                                }
                        }
                } else {
                        return res.status(404).json({ message: "No data found", data: {} });
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.cancelOrderApp = async (req, res) => {
        try {
                let findUserOrder = await userOrders.findOne({ orderId: req.params.orderId });
                if (findUserOrder) {
                        return res.status(201).json({ message: "Payment failed.", status: 201, orderId: req.params.orderId });
                } else {
                        return res.status(404).json({ message: "No data found", data: {} });
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
const calculateCartResponse5 = async (cart, userId) => {
        try {
                await cart.populate([{ path: "products.productId", select: { reviews: 0 } }, { path: "gifts.giftPriceId", populate: { path: 'giftId', model: 'gift' }, select: { reviews: 0 } }, { path: "AddOnservicesSchema.addOnservicesId", select: { reviews: 0 } }, { path: "services.serviceId", select: { reviews: 0 } }, { path: 'frequentlyBuyProductSchema.frequentlyBuyProductId', populate: { path: 'products', model: 'Product' }, select: { reviews: 0 } }, { path: "coupon", select: "couponCode discount expirationDate used per" }]);
                console.log(cart);
                const data1 = await Address.findOne({ type: "Admin" }).select('address appartment landMark -_id');
                const data2 = await Address.findOne({ user: userId, addressType: "Shipping" }).select('address appartment city state zipCode -_id');
                const data5 = await Address.findOne({ user: userId, addressType: "Billing" }).select('address appartment city state zipCode -_id');
                const data3 = await User.findOne({ _id: userId });
                const data4 = await contact.findOne().select('name image phone email numOfReviews google mapLink map ratings -_id');
                let offerDiscount = 0, productFBPTotal = 0, onProductDiscount = 0, membershipDiscount = 0, shipping = 0, membershipDiscountPercentage = 0, total = 0, subTotal = 0;
                let totalTime = 0;
                if (cart.toTime != (null || undefined)) {
                        if (cart.services.length > 0) {
                                for (let i = 0; i < cart.services.length; i++) {
                                        totalTime = totalTime + cart.services[i].totalMin;
                                }
                        }
                        if (cart.AddOnservicesSchema.length > 0) {
                                for (let i = 0; i < cart.AddOnservicesSchema.length; i++) {
                                        totalTime = totalTime + cart.AddOnservicesSchema[i].totalMin;
                                }
                        }
                        var dateTimeString = cart.toTime;
                        var dateTimeObject = new Date(dateTimeString);
                        let d = dateTimeObject.toISOString().split('T')[0];
                        var hours1 = dateTimeObject.getUTCHours();
                        var minutes1 = dateTimeObject.getUTCMinutes();
                        const hours = parseInt(hours1);
                        const minutes = parseInt(minutes1);
                        const providedTimeInMinutes = hours * 60 + minutes;
                        let fromTimeInMinutes = providedTimeInMinutes + totalTime;
                        const fromTime = new Date(d);
                        fromTime.setMinutes(fromTimeInMinutes);
                        cart.fromTime = fromTime;
                        cart.save();
                }
                const cartResponse = cart.toObject();
                if (cartResponse.services.length > 0) {
                        for (const cartProduct of cartResponse.services) {
                                if (cartProduct.serviceId.type === "offer") {
                                        cartProduct.subTotal = parseFloat((cartProduct.serviceId.price * cartProduct.quantity).toFixed(2));
                                        cartProduct.total = parseFloat((cartProduct.price * cartProduct.quantity).toFixed(2));
                                        cartProduct.offerDiscount = parseFloat(((cartProduct.serviceId.price - cartProduct.price) * cartProduct.quantity).toFixed(2));
                                        offerDiscount += cartProduct.offerDiscount;
                                        subTotal += cartProduct.subTotal;
                                        total += cartProduct.total;
                                }
                                if (cartProduct.serviceId.type === "Service") {
                                        if (data3.isSubscription === true) {
                                                if (cartProduct.serviceId.multipleSize == true) {
                                                        let x = (parseFloat((cartProduct.price * cartProduct.quantity).toFixed(2)) - parseFloat((cartProduct.memberprice * cartProduct.quantity).toFixed(2)));
                                                        cartProduct.membershipDiscount = parseFloat(x.toFixed(2))
                                                        membershipDiscount += x;
                                                        cartProduct.subTotal = parseFloat((cartProduct.price * cartProduct.quantity).toFixed(2));
                                                        cartProduct.total = parseFloat((cartProduct.memberprice * cartProduct.quantity).toFixed(2));
                                                        cartProduct.offerDiscount = 0.00;
                                                        offerDiscount += cartProduct.offerDiscount;
                                                        total += cartProduct.total;
                                                        subTotal += cartProduct.subTotal;
                                                } else {
                                                        let x = (parseFloat((cartProduct.serviceId.price * cartProduct.quantity).toFixed(2)) - parseFloat((cartProduct.serviceId.mPrice * cartProduct.quantity).toFixed(2)));
                                                        cartProduct.membershipDiscount = parseFloat(x.toFixed(2))
                                                        membershipDiscount += x;
                                                        cartProduct.subTotal = parseFloat((cartProduct.price * cartProduct.quantity).toFixed(2));
                                                        cartProduct.total = parseFloat((cartProduct.price * cartProduct.quantity).toFixed(2));
                                                        cartProduct.offerDiscount = 0.00;
                                                        offerDiscount += cartProduct.offerDiscount;
                                                        total += cartProduct.total;
                                                        subTotal += cartProduct.subTotal;
                                                }
                                        } else {
                                                if (cartProduct.serviceId.multipleSize == true) {
                                                        let x = 0
                                                        cartProduct.membershipDiscount = parseFloat(x.toFixed(2))
                                                        membershipDiscount += x;
                                                        cartProduct.subTotal = parseFloat((cartProduct.price * cartProduct.quantity).toFixed(2));
                                                        cartProduct.total = parseFloat((cartProduct.price * cartProduct.quantity).toFixed(2) - x);
                                                        cartProduct.offerDiscount = 0.00;
                                                        offerDiscount += cartProduct.offerDiscount;
                                                        total += cartProduct.total;
                                                        subTotal += cartProduct.subTotal;
                                                } else {
                                                        let x = 0
                                                        cartProduct.membershipDiscount = parseFloat(x.toFixed(2))
                                                        membershipDiscount += x;
                                                        cartProduct.subTotal = parseFloat((cartProduct.price * cartProduct.quantity).toFixed(2));
                                                        cartProduct.total = parseFloat((cartProduct.price * cartProduct.quantity).toFixed(2) - x);
                                                        cartProduct.offerDiscount = 0.00;
                                                        offerDiscount += cartProduct.offerDiscount;
                                                        total += cartProduct.total;
                                                        subTotal += cartProduct.subTotal;
                                                }
                                        }
                                }
                        }
                }
                if (cartResponse.AddOnservicesSchema.length > 0) {
                        cartResponse.AddOnservicesSchema.forEach((cartGift) => {
                                cartGift.total = parseFloat((cartGift.price * cartGift.quantity).toFixed(2));
                                cartGift.subTotal = parseFloat((cartGift.price * cartGift.quantity).toFixed(2));
                                subTotal += cartGift.subTotal;
                                total += cartGift.total;
                        });
                }
                if (cartResponse.products.length > 0) {
                        for (const cartProduct of cartResponse.products) {
                                console.log(cartProduct);
                                if (cartProduct.productId.multipleSize == true) {
                                        for (let i = 0; i < cartProduct.productId.sizePrice.length; i++) {
                                                if ((cartProduct.productId.sizePrice[i]._id == cartProduct.priceId) == true) {
                                                        if (data3.isSubscription === true) {
                                                                const findSubscription = await Subscription.findById(data3.subscriptionId);
                                                                if (findSubscription) {
                                                                        membershipDiscountPercentage = findSubscription.discount;
                                                                }
                                                                let x = (parseFloat((cartProduct.productId.sizePrice[i].price * cartProduct.quantity).toFixed(2)) * parseFloat((membershipDiscountPercentage / 100).toFixed(2)));
                                                                cartProduct.membershipDiscount = parseFloat(x.toFixed(2))
                                                                membershipDiscount += x;
                                                                cartProduct.subTotal = parseFloat((cartProduct.productId.sizePrice[i].price * cartProduct.quantity).toFixed(2));
                                                                cartProduct.total = parseFloat((cartProduct.productId.sizePrice[i].price * cartProduct.quantity).toFixed(2) - x);
                                                                cartProduct.offerDiscount = 0.00;
                                                                offerDiscount += cartProduct.offerDiscount;
                                                                subTotal += cartProduct.subTotal;
                                                                total += cartProduct.total;
                                                                productFBPTotal += cartProduct.total
                                                        } else {
                                                                let x = 0;
                                                                cartProduct.membershipDiscount = x
                                                                membershipDiscount += x;
                                                                cartProduct.subTotal = parseFloat((cartProduct.productId.sizePrice[i].price * cartProduct.quantity).toFixed(2));
                                                                cartProduct.total = parseFloat((cartProduct.productId.sizePrice[i].price * cartProduct.quantity).toFixed(2));
                                                                cartProduct.offerDiscount = 0.00;
                                                                offerDiscount += cartProduct.offerDiscount;
                                                                subTotal += cartProduct.subTotal;
                                                                total += cartProduct.total;
                                                                productFBPTotal += cartProduct.total
                                                        }
                                                }
                                        }
                                } else {
                                        if (data3.isSubscription === true) {
                                                const findSubscription = await Subscription.findById(data3.subscriptionId);
                                                if (findSubscription) {
                                                        membershipDiscountPercentage = findSubscription.discount;
                                                }
                                                let x = (parseFloat((cartProduct.productId.price * cartProduct.quantity).toFixed(2)) * parseFloat((membershipDiscountPercentage / 100).toFixed(2)));
                                                cartProduct.membershipDiscount = parseFloat(x.toFixed(2))
                                                membershipDiscount += x;
                                                cartProduct.subTotal = parseFloat((cartProduct.productId.price * cartProduct.quantity).toFixed(2));
                                                cartProduct.total = parseFloat((cartProduct.productId.price * cartProduct.quantity).toFixed(2) - x);
                                                cartProduct.offerDiscount = 0.00;
                                                offerDiscount += cartProduct.offerDiscount;
                                                subTotal += cartProduct.subTotal;
                                                total += cartProduct.total;
                                                productFBPTotal += cartProduct.total
                                        } else {
                                                let x = 0;
                                                cartProduct.membershipDiscount = x
                                                membershipDiscount += x;
                                                cartProduct.subTotal = parseFloat((cartProduct.productId.price * cartProduct.quantity).toFixed(2));
                                                cartProduct.total = parseFloat((cartProduct.productId.price * cartProduct.quantity).toFixed(2));
                                                cartProduct.offerDiscount = 0.00;
                                                offerDiscount += cartProduct.offerDiscount;
                                                subTotal += cartProduct.subTotal;
                                                total += cartProduct.total;
                                                productFBPTotal += cartProduct.total
                                        }
                                }
                        }
                }
                if (cartResponse.frequentlyBuyProductSchema.length > 0) {
                        cartResponse.frequentlyBuyProductSchema.forEach((cartFBP) => {
                                cartFBP.total = parseFloat((cartFBP.frequentlyBuyProductId.price * cartFBP.quantity).toFixed(2));
                                cartFBP.subTotal = parseFloat((cartFBP.frequentlyBuyProductId.price * cartFBP.quantity).toFixed(2));
                                subTotal += cartFBP.subTotal;
                                total += cartFBP.total;
                                productFBPTotal += cartFBP.total
                        });
                }
                if (cartResponse.products.length > 0 || cartResponse.frequentlyBuyProductSchema.length > 0) {
                        if (cartResponse.pickupFromStore == true) {
                                shipping = 0.00;
                                cartResponse.shipping = parseFloat(shipping.toFixed(2));
                        } else {
                                if (productFBPTotal <= 150) {
                                        shipping = 8.00;
                                        cartResponse.shipping = parseFloat(shipping.toFixed(2));
                                } else {
                                        shipping = 12.00;
                                        cartResponse.shipping = parseFloat(shipping.toFixed(2));
                                }
                        }
                }
                if (cartResponse.gifts.length > 0) {
                        cartResponse.gifts.forEach((cartGift) => {
                                cartGift.total = parseFloat((cartGift.giftPriceId.price * cartGift.quantity).toFixed(2));
                                cartGift.subTotal = parseFloat((cartGift.giftPriceId.price * cartGift.quantity).toFixed(2));
                                subTotal += cartGift.subTotal;
                                total += cartGift.total;
                        });
                }
                cartResponse.subTotal = parseFloat(subTotal.toFixed(2));
                cartResponse.onProductDiscount = parseFloat(onProductDiscount.toFixed(2));
                cartResponse.offerDiscount = parseFloat(offerDiscount.toFixed(2));
                cartResponse.membershipDiscount = parseFloat(membershipDiscount.toFixed(2));
                cartResponse.shipping = parseFloat(shipping.toFixed(2));
                if (cartResponse.coupon) {
                        if (cartResponse.coupon.completeVisit == 5 && data3.orderVisit > 5) {
                                if (cartResponse.coupon.used == false) {
                                        if (cartResponse.coupon.per == "Percentage") {
                                                cartResponse.couponDiscount = ((total * cartResponse.coupon.discount) / 100);
                                                total = total - ((total * cartResponse.coupon.discount) / 100);
                                        } else {
                                                cartResponse.couponDiscount = cartResponse.coupon.discount;
                                                total = total - cartResponse.coupon.discount;
                                        }
                                }
                        } else {
                                if (cartResponse.coupon.used == false) {
                                        if (cartResponse.coupon.per == "Percentage") {
                                                cartResponse.couponDiscount = ((total * cartResponse.coupon.discount) / 100);
                                                total = total - ((total * cartResponse.coupon.discount) / 100);
                                        } else {
                                                cartResponse.couponDiscount = cartResponse.coupon.discount;
                                                total = total - cartResponse.coupon.discount;
                                        }
                                }
                        }
                } else {
                        cartResponse.couponDiscount = 0
                }
                cartResponse.total = parseFloat((total + shipping).toFixed(2));
                cartResponse.pickUp = data1;
                cartResponse.deliveryAddresss = data2;
                cartResponse.contactDetail = data4;
                cartResponse.billingAddresss = data5;
                if (totalTime > 0) {
                        var hours2 = Math.floor(totalTime / 60);
                        var minutes2 = totalTime % 60;
                        let timeInMin = hours2 + "hr" + " " + minutes2 + "min"
                        cartResponse.timeInMin = timeInMin;
                }
                return cartResponse;
        } catch (error) {
                throw error;
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
exports.createPaymentCard = async (req, res, next) => {
        try {
                const data = await User.findOne({ _id: req.user._id, });
                if (data) {
                        const saveData = {
                                user: req.user._id,
                                name: req.body.name,
                                number: req.body.number,
                                month: req.body.month,
                                year: req.body.year,
                                cvv: req.body.cvv,
                                cardType: req.body.cardType,
                        };
                        const saved = await userCard.create(saveData);
                        return res.status(200).json({ status: 200, message: "Card details saved.", data: saved })
                } else {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                }
        } catch (err) {
                console.log(err);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.getPaymentCard = async (req, res, next) => {
        try {
                const data = await User.findOne({ _id: req.user._id, });
                if (data) {
                        const getData = await userCard.find({ user: req.user._id });
                        return res.status(200).json({ status: 200, message: "Card details fetch.", data: getData })
                } else {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                }
        } catch (err) {
                console.log(err);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.updatePaymentCard = async (req, res, next) => {
        try {
                const data = await User.findOne({ _id: req.user._id, });
                if (data) {
                        const payment = await userCard.findById(req.params.id);
                        if (!payment) {
                                return res.status(404).json({ status: 404, message: "Card details not fetch", data: {} });
                        } else {
                                let obj = {
                                        name: req.body.name || payment.name,
                                        number: req.body.number || payment.number,
                                        month: req.body.month || payment.month,
                                        year: req.body.year || payment.year,
                                        cvv: req.body.cvv || payment.cvv,
                                        cardType: req.body.cardType || payment.cardType,
                                }
                                let saved = await userCard.findByIdAndUpdate(payment._id, { obj }, { new: true });
                                return res.status(200).json({ status: 200, message: "Card details Updated Successfully.", data: saved })
                        }
                } else {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                }
        } catch (err) {
                console.log(err);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.DeletePaymentCard = async (req, res, next) => {
        try {
                const payment = await userCard.findById(req.params.id);
                if (!payment) {
                        return res.status(404).json({ status: 404, message: "Card details not fetch", data: {} });
                } else {
                        const data = await userCard.findByIdAndDelete({ _id: payment._id, });
                        return res.status(200).json({ status: 200, message: "Card details Delete Successfully.", data: {} })
                }
        } catch (err) {
                console.log(err);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
// exports.savecard = async (req, res, next) => {
//         try {
//                 const { email, cardNumber, expMonth, expYear, cvc } = req.body;
//                 stripe.tokens.create({ card: { number: cardNumber, exp_month: expMonth, exp_year: expYear, cvc: cvc, } }).then(async (cardToken) => {


//                         console.log(cardToken);
//                         return
//                         const customer = await stripe.customers.list({ email });
//                         if (customer.data.length > 0) {
//                                 const updatedCustomer = await stripe.customers.update(customer.data[0].id, { source: cardToken, });
//                                 return res.json({ message: 'Card updated successfully!', customer: updatedCustomer });
//                         } else {
//                                 const newCustomer = await stripe.customers.create({ email, source: cardToken, });
//                                 return res.json({ message: 'Card saved successfully!', customer: newCustomer });
//                         }
//                 }).catch((error) => {
//                         console.log(error);
//                         return res.status(500).json({ message: 'Error saving card' });
//                 });
//         } catch (error) {
//                 console.error(error);
//                 return res.status(500).json({ message: 'Error saving card' });
//         }
// };
exports.savecard = async (req, res, next) => {
        console.log(req.user);
        const customer = await stripe1.customers.list({ email: req.user.email });
        if (customer.data.length > 0) {
                const intent = await stripe1.setupIntents.create({
                        customer: customer.id,
                        automatic_payment_methods: { enabled: true },
                });
                return res.json({ client_secret: intent });
        } else {
                const customer = await stripe1.customers.create({ email: req.user.email });
                const intent = await stripe1.setupIntents.create({
                        customer: customer.id,
                        automatic_payment_methods: { enabled: true },
                });
                return res.json({ client_secret: intent });
        }
};
exports.savecardlist = async (req, res, next) => {
        const paymentMethods = await stripe.paymentMethods.list({
                customer: req.params.customerId,
                type: 'card',
        });
        return res.json({ client_secret: paymentMethods });
};
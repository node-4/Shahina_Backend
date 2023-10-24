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
const recentlyView = require("../models/recentlyView");
const moment = require("moment")
const nodemailer = require("nodemailer");
const logger = require("@zohocrm/nodejs-sdk-2.0/routes/logger/logger");
const stripe = require("stripe")('sk_test_51Kr67EJsxpRH9smipLQrIzDFv69P1b1pPk96ba1A4HJGYJEaR7cpAaU4pkCeAIMT9B46D7amC77I3eNEBTIRF2e800Y7zIPNTS'); // test
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
                const { phone, password } = req.body;
                const user = await User.findOne({ phone: phone, userType: "USER" });
                if (!user) {
                        return res
                                .status(404)
                                .send({ message: "user not found ! not registered" });
                }
                const isValidPassword = bcrypt.compareSync(password, user.password);
                if (!isValidPassword) {
                        return res.status(401).send({ message: "Wrong password" });
                }
                const accessToken = jwt.sign({ id: user._id }, authConfig.secret, {
                        expiresIn: authConfig.accessTokenTime,
                });
                let obj = {
                        firstName: user.firstName,
                        lastName: user.lastName,
                        phone: user.phone,
                        email: user.email,
                        userType: user.userType,
                }
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
                                let update = await User.findByIdAndUpdate({ _id: data._id }, { $set: { totalVisit: data.totalVisit + 1, checkIn: data.checkIn - 1 } }, { new: true });
                                if (update) {
                                        return res.status(200).json({ status: 200, message: "CheckIn successfully.", data: update });
                                }
                        } else {
                                let update = await User.findByIdAndUpdate({ _id: data._id }, { $set: { totalVisit: data.totalVisit + 1, } }, { new: true });
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
                const servicesList = await services.find({ categoryId: req.query.categoryId, type: "Service" });
                const servicesWithDynamicFields = [];
                const userData = await User.findOne({ _id: req.user._id, }).select('-password').populate('subscriptionId');
                for (const service of servicesList) {
                        let membshipPrice = 0;
                        if (userData.isSubscription == true) {
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
exports.addToCart = async (req, res, next) => {
        try {
                const itemType = req.params.type;
                const itemId = req.params.id;
                const itemData = await getItemData(itemType, itemId);
                if (!itemData) {
                        return res.status(400).send({ msg: `${itemType} not found` });
                }
                let cart = await Cart.findOne({ user: req.user._id });
                if (!cart) {
                        cart = await Cart.create({ user: req.user._id });
                }
                const cartField = getCartFieldByItemType(itemType);
                const itemIndex = cart[cartField].findIndex((cartItem) => cartItem.priceId == (null || undefined) ? ((cartItem[itemType + 'Id'].toString() === itemId)) : ((cartItem[itemType + 'Id'].toString() === itemId) && (cartItem.priceId === req.body.priceId)));
                if (itemIndex < 0) {
                        if (itemType == 'giftPrice') {
                                let obj = { [itemType + 'Id']: itemId, email: req.body.email, quantity: req.body.quantity };
                                cart[cartField].push(obj);
                        } else if (itemType == 'product') {
                                let obj = { [itemType + 'Id']: itemId, quantity: req.body.quantity, size: req.body.size, priceId: req.body.priceId, sizePrice: req.body.sizePrice };
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
                        } else {
                                cart[cartField][itemIndex].quantity = req.body.quantity;
                        }
                }
                await cart.save();
                return res.status(200).json({ msg: `${itemType} added to cart`, data: cart });
        } catch (error) {
                next(error);
        }
};
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
                await cart.populate([{ path: "products.productId", select: { reviews: 0 } }, { path: "gifts.giftPriceId", populate: { path: 'giftId', model: 'gift' }, select: { reviews: 0 } }, { path: "AddOnservicesSchema.addOnservicesId", select: { reviews: 0 } }, { path: "services.serviceId", select: { reviews: 0 } }, { path: 'frequentlyBuyProductSchema.frequentlyBuyProductId', populate: { path: 'products', model: 'Product' }, select: { reviews: 0 } }, { path: "coupon", select: "couponCode discount expirationDate" },]);
                const data1 = await Address.findOne({ type: "Admin" }).select('address appartment landMark -_id');
                const data2 = await Address.findOne({ user: userId, addressType: "Shipping" }).select('address appartment city state zipCode -_id');
                const data5 = await Address.findOne({ user: userId, addressType: "Billing" }).select('address appartment city state zipCode -_id');
                const data3 = await User.findOne({ _id: userId });
                const data4 = await contact.findOne().select('name image phone email numOfReviews ratings -_id');
                let offerDiscount = 0, onProductDiscount = 0, membershipDiscount = 0, shipping = 0, membershipDiscountPercentage = 0, total = 0, subTotal = 0;
                const cartResponse = cart.toObject();
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
                                                console.log(data3.isSubscription);
                                                const findSubscription = await Subscription.findById(data3.subscriptionId);
                                                if (findSubscription) {
                                                        membershipDiscountPercentage = findSubscription.discount;
                                                }
                                                membershipDiscount = (parseFloat((cartProduct.serviceId.price * cartProduct.quantity).toFixed(2)) * parseFloat((membershipDiscountPercentage / 100).toFixed(2)));
                                                cartProduct.membershipDiscount = parseFloat(membershipDiscount.toFixed(2))
                                                cartProduct.subTotal = parseFloat((cartProduct.serviceId.price * cartProduct.quantity).toFixed(2));
                                                cartProduct.total = parseFloat((cartProduct.serviceId.price * cartProduct.quantity).toFixed(2) - membershipDiscount);
                                                cartProduct.offerDiscount = 0.00;
                                                offerDiscount += cartProduct.offerDiscount;
                                                total += cartProduct.total;
                                                subTotal += cartProduct.subTotal;
                                        } else {
                                                membershipDiscount = 0;
                                                cartProduct.membershipDiscount = membershipDiscount
                                                cartProduct.subTotal = parseFloat((cartProduct.serviceId.price * cartProduct.quantity).toFixed(2));
                                                cartProduct.total = parseFloat((cartProduct.serviceId.price * cartProduct.quantity).toFixed(2));
                                                cartProduct.offerDiscount = 0.00;
                                                offerDiscount += cartProduct.offerDiscount;
                                                subTotal += cartProduct.subTotal;
                                                total += cartProduct.total;
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
                if (cartResponse.products.length > 0) {
                        cartResponse.products.forEach((cartProduct) => {
                                if (cartProduct.productId.multipleSize == true) {
                                        for (let i = 0; i < cartProduct.productId.sizePrice.length; i++) {
                                                if ((cartProduct.productId.sizePrice[i]._id == cartProduct.priceId) == true) {
                                                        if (cartProduct.productId.discountActive === true) {
                                                                cartProduct.total = parseFloat((cartProduct.productId.price * cartProduct.quantity).toFixed(2));
                                                                cartProduct.subTotal = parseFloat((cartProduct.productId.discountPrice * cartProduct.quantity).toFixed(2));
                                                                cartProduct.onProductDiscount = parseFloat(((cartProduct.productId.price - cartProduct.productId.discountPrice) * cartProduct.quantity).toFixed(2));
                                                        } else {
                                                                cartProduct.total = parseFloat((cartProduct.productId.sizePrice[i].price * cartProduct.quantity).toFixed(2));
                                                                cartProduct.subTotal = parseFloat((cartProduct.productId.sizePrice[i].price * cartProduct.quantity).toFixed(2));
                                                                cartProduct.onProductDiscount = 0.00;
                                                        }
                                                        subTotal += cartProduct.subTotal;
                                                        onProductDiscount += cartProduct.onProductDiscount;
                                                        total += cartProduct.total;
                                                }
                                        }
                                } else {
                                        if (cartProduct.productId.discountActive === true) {
                                                cartProduct.total = parseFloat((cartProduct.productId.price * cartProduct.quantity).toFixed(2));
                                                cartProduct.subTotal = parseFloat((cartProduct.productId.discountPrice * cartProduct.quantity).toFixed(2));
                                                cartProduct.onProductDiscount = parseFloat(((cartProduct.productId.price - cartProduct.productId.discountPrice) * cartProduct.quantity).toFixed(2));
                                        } else {
                                                cartProduct.total = parseFloat((cartProduct.productId.price * cartProduct.quantity).toFixed(2));
                                                cartProduct.subTotal = parseFloat((cartProduct.productId.price * cartProduct.quantity).toFixed(2));
                                                cartProduct.onProductDiscount = 0.00;
                                        }
                                        subTotal += cartProduct.subTotal;
                                        onProductDiscount += cartProduct.onProductDiscount;
                                        total += cartProduct.total;
                                }
                        });
                        if (cartResponse.pickupFromStore == true) {
                                shipping = 0.00;
                                cartResponse.shipping = parseFloat(shipping.toFixed(2));
                        } else {
                                shipping = 10.00;
                                cartResponse.shipping = parseFloat(shipping.toFixed(2));
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
                if (cartResponse.frequentlyBuyProductSchema.length > 0) {
                        cartResponse.frequentlyBuyProductSchema.forEach((cartFBP) => {
                                cartFBP.total = parseFloat((cartFBP.frequentlyBuyProductId.price * cartFBP.quantity).toFixed(2));
                                cartFBP.subTotal = parseFloat((cartFBP.frequentlyBuyProductId.price * cartFBP.quantity).toFixed(2));
                                subTotal += cartFBP.subTotal;
                                total += cartFBP.total;
                        });
                }
                cartResponse.subTotal = parseFloat(subTotal.toFixed(2));
                cartResponse.onProductDiscount = parseFloat(onProductDiscount.toFixed(2));
                cartResponse.offerDiscount = parseFloat(offerDiscount.toFixed(2));
                cartResponse.membershipDiscount = parseFloat(membershipDiscount.toFixed(2));
                cartResponse.shipping = parseFloat(shipping.toFixed(2));
                cartResponse.total = parseFloat(total.toFixed(2)) + parseFloat(shipping.toFixed(2));
                cartResponse.pickUp = data1;
                cartResponse.deliveryAddresss = data2;
                cartResponse.contactDetail = data4;
                cartResponse.billingAddresss = data5;
                return cartResponse;
        } catch (error) {
                throw error;
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
                const itemIndex = cart[cartField].findIndex((cartItem) => cartItem[itemType + 'Id'].toString() === itemId);
                if (itemIndex === -1) {
                        return res.status(404).json({ success: false, msg: `${itemType} not found in cart`, cart: {} });
                }
                cart[cartField].splice(itemIndex, 1);
                await cart.save();
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
                        let findCart = await Cart.findOne({ user: userData._id });
                        if (findCart) {
                                const d = new Date(req.body.date);
                                let text = d.toISOString();
                                let update = await Cart.findByIdAndUpdate({ _id: findCart._id }, { $set: { date: text, time: req.body.time } }, { new: true });
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
                        let update1 = await Cart.findByIdAndUpdate({ _id: findCart._id }, { $set: { suggesstion: req.body.suggestion }, }, { new: true });
                        return res.status(200).json({ status: 200, message: "suggestion add to cart Successfully.", data: update1 })
                } else {
                        return res.status(404).json({ status: 404, message: "Cart is empty.", data: {} });
                }
        } catch (error) {
                console.error(error);
                return res.status(500).send({ status: 500, message: "Server error" + error.message });
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
                        let findCart = await Cart.findOne({ user: req.user._id }).populate([{ path: "products.productId", select: { reviews: 0 } }, { path: "gifts.giftPriceId", select: { reviews: 0 } }, { path: "AddOnservicesSchema.addOnservicesId", select: { reviews: 0 } }, { path: "services.serviceId", select: { reviews: 0 } }, { path: 'frequentlyBuyProductSchema.frequentlyBuyProductId', populate: { path: 'products', model: 'Product' }, select: { reviews: 0 } }, { path: "coupon", select: "couponCode discount expirationDate" },]);
                        if (findCart) {
                                const data1 = await Address.findOne({ type: "Admin" }).select('address appartment landMark -_id');
                                const data2 = await Address.findOne({ user: req.user._id, addressType: "Shipping" }).select('address appartment city state zipCode -_id');
                                const data5 = await Address.findOne({ user: req.user._id, addressType: "Billing" }).select('address appartment city state zipCode -_id');
                                const data3 = await User.findOne({ _id: req.user._id });
                                let orderObjPaidAmount = 0, productOrderId, serviceOrderId, giftOrderId;
                                if (findCart.coupon && moment().isAfter(findCart.coupon.expirationDate, "day")) { findCart.coupon = undefined; findCart.save(); }
                                const cartResponse = findCart.toObject();
                                let orderId = await reffralCode();
                                cartResponse.orderId = orderId;
                                if (cartResponse.products.length > 0 || cartResponse.frequentlyBuyProductSchema.length > 0) {
                                        let onProductDiscount = 0, shipping = 0, total = 0, subTotal = 0;
                                        cartResponse.products.forEach((cartProduct) => {
                                                if (cartProduct.productId.multipleSize == true) {
                                                        for (let i = 0; i < cartProduct.productId.sizePrice.length; i++) {
                                                                if ((cartProduct.productId.sizePrice[i]._id == cartProduct.priceId) == true) {
                                                                        if (cartProduct.productId.discountActive === true) {
                                                                                cartProduct.total = parseFloat((cartProduct.productId.price * cartProduct.quantity).toFixed(2));
                                                                                cartProduct.subTotal = parseFloat((cartProduct.productId.discountPrice * cartProduct.quantity).toFixed(2));
                                                                                cartProduct.onProductDiscount = parseFloat(((cartProduct.productId.price - cartProduct.productId.discountPrice) * cartProduct.quantity).toFixed(2));
                                                                        } else {
                                                                                cartProduct.total = parseFloat((cartProduct.productId.sizePrice[i].price * cartProduct.quantity).toFixed(2));
                                                                                cartProduct.subTotal = parseFloat((cartProduct.productId.sizePrice[i].price * cartProduct.quantity).toFixed(2));
                                                                                cartProduct.onProductDiscount = 0.00;
                                                                        }
                                                                        subTotal += cartProduct.subTotal;
                                                                        onProductDiscount += cartProduct.onProductDiscount;
                                                                        total += cartProduct.total;
                                                                }
                                                        }
                                                } else {
                                                        if (cartProduct.productId.discountActive === true) {
                                                                cartProduct.total = parseFloat((cartProduct.productId.price * cartProduct.quantity).toFixed(2));
                                                                cartProduct.subTotal = parseFloat((cartProduct.productId.discountPrice * cartProduct.quantity).toFixed(2));
                                                                cartProduct.onProductDiscount = parseFloat(((cartProduct.productId.price - cartProduct.productId.discountPrice) * cartProduct.quantity).toFixed(2));
                                                        } else {
                                                                cartProduct.total = parseFloat((cartProduct.productId.price * cartProduct.quantity).toFixed(2));
                                                                cartProduct.subTotal = parseFloat((cartProduct.productId.price * cartProduct.quantity).toFixed(2));
                                                                cartProduct.onProductDiscount = 0.00;
                                                        }
                                                        subTotal += cartProduct.subTotal;
                                                        onProductDiscount += cartProduct.onProductDiscount;
                                                        total += cartProduct.total;
                                                }
                                        });
                                        cartResponse.frequentlyBuyProductSchema.forEach((cartFBP) => {
                                                cartFBP.total = parseFloat((cartFBP.frequentlyBuyProductId.price * cartFBP.quantity).toFixed(2));
                                                cartFBP.subTotal = parseFloat((cartFBP.frequentlyBuyProductId.price * cartFBP.quantity).toFixed(2));
                                                subTotal += cartFBP.subTotal;
                                                total += cartFBP.total;
                                        });
                                        cartResponse.subTotal = subTotal;
                                        cartResponse.discount = onProductDiscount;
                                        cartResponse.total = total;
                                        if (cartResponse.pickupFromStore == true) {
                                                shipping = 0.00;
                                                cartResponse.shipping = parseFloat(shipping.toFixed(2));
                                                cartResponse.pickUp = data1;
                                                cartResponse.billingAddresss = data5;
                                        } else {
                                                shipping = 10.00;
                                                cartResponse.shipping = parseFloat(shipping.toFixed(2));
                                                cartResponse.deliveryAddresss = data2;
                                                cartResponse.billingAddresss = data5;
                                                cartResponse.shipping = shipping;
                                                cartResponse.total = cartResponse.subTotal + shipping;
                                        }
                                        orderObjPaidAmount = orderObjPaidAmount + cartResponse.total;
                                        cartResponse._id = new mongoose.Types.ObjectId();
                                        let saveOrder = await productOrder.create(cartResponse);
                                        productOrderId = saveOrder._id;
                                }
                                if (cartResponse.services.length > 0 || cartResponse.AddOnservicesSchema.length > 0) {
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
                                                                        console.log(data3.isSubscription);
                                                                        const findSubscription = await Subscription.findById(data3.subscriptionId);
                                                                        if (findSubscription) {
                                                                                membershipDiscountPercentage = findSubscription.discount;
                                                                        }
                                                                        membershipDiscount = (parseFloat((cartProduct.serviceId.price * cartProduct.quantity).toFixed(2)) * parseFloat((membershipDiscountPercentage / 100).toFixed(2)));
                                                                        cartProduct.membershipDiscount = parseFloat(membershipDiscount).toFixed(2)
                                                                        cartProduct.subTotal = parseFloat((cartProduct.serviceId.price * cartProduct.quantity).toFixed(2));
                                                                        cartProduct.total = parseFloat((cartProduct.serviceId.price * cartProduct.quantity).toFixed(2) - membershipDiscount);
                                                                        cartProduct.offerDiscount = 0.00;
                                                                        offerDiscount += cartProduct.offerDiscount;
                                                                        total += cartProduct.total;
                                                                        subTotal += cartProduct.subTotal;
                                                                } else {
                                                                        membershipDiscount = 0;
                                                                        cartProduct.membershipDiscount = parseFloat(membershipDiscount).toFixed(2)
                                                                        cartProduct.subTotal = parseFloat((cartProduct.serviceId.price * cartProduct.quantity).toFixed(2));
                                                                        cartProduct.total = parseFloat((cartProduct.serviceId.price * cartProduct.quantity).toFixed(2));
                                                                        cartProduct.offerDiscount = 0.00;
                                                                        offerDiscount += cartProduct.offerDiscount;
                                                                        subTotal += cartProduct.subTotal;
                                                                        total += cartProduct.total;
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
                                        let saveOrder = await serviceOrder.create(cartResponse);
                                        serviceOrderId = saveOrder._id;
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
                                                                orderObjPaidAmount: orderObjPaidAmount,
                                                        }
                                                        let saveOrder1 = await userOrders.create(orderObj);
                                                        return res.status(200).json({ msg: "product added to cart", data: saveOrder1 });
                                                }
                                        });
                                } else {
                                        let orderObj = {
                                                userId: req.user._id,
                                                orderId: orderId,
                                                productOrder: productOrderId,
                                                serviceOrder: serviceOrderId,
                                                orderObjPaidAmount: orderObjPaidAmount,
                                        }
                                        let saveOrder1 = await userOrders.create(orderObj);
                                        return res.status(200).json({ msg: "product added to cart", data: saveOrder1 });
                                }
                        } else {
                                return res.status(200).json({ success: false, msg: "Cart is empty", cart: {} });
                        }
                } else {
                        let findCart = await Cart.findOne({ user: req.user._id }).populate([{ path: "products.productId", select: { reviews: 0 } }, { path: "gifts.giftPriceId", select: { reviews: 0 } }, { path: "AddOnservicesSchema.addOnservicesId", select: { reviews: 0 } }, { path: "services.serviceId", select: { reviews: 0 } }, { path: 'frequentlyBuyProductSchema.frequentlyBuyProductId', populate: { path: 'products', model: 'Product' }, select: { reviews: 0 } }, { path: "coupon", select: "couponCode discount expirationDate" },]);
                        if (findCart) {
                                const data1 = await Address.findOne({ type: "Admin" }).select('address appartment landMark -_id');
                                const data2 = await Address.findOne({ user: req.user._id, addressType: "Shipping" }).select('address appartment city state zipCode -_id');
                                const data5 = await Address.findOne({ user: req.user._id, addressType: "Billing" }).select('address appartment city state zipCode -_id');
                                const data3 = await User.findOne({ _id: req.user._id });
                                let orderObjPaidAmount = 0, productOrderId, serviceOrderId, giftOrderId;
                                if (findCart.coupon && moment().isAfter(findCart.coupon.expirationDate, "day")) { findCart.coupon = undefined; findCart.save(); }
                                const cartResponse = findCart.toObject();
                                let orderId = await reffralCode();
                                cartResponse.orderId = orderId;
                                if (cartResponse.products.length > 0 || cartResponse.frequentlyBuyProductSchema.length > 0) {
                                        let onProductDiscount = 0, shipping = 0, total = 0, subTotal = 0;
                                        cartResponse.products.forEach((cartProduct) => {
                                                if (cartProduct.productId.multipleSize == true) {
                                                        for (let i = 0; i < cartProduct.productId.sizePrice.length; i++) {
                                                                if ((cartProduct.productId.sizePrice[i]._id == cartProduct.priceId) == true) {
                                                                        if (cartProduct.productId.discountActive === true) {
                                                                                cartProduct.total = parseFloat((cartProduct.productId.price * cartProduct.quantity).toFixed(2));
                                                                                cartProduct.subTotal = parseFloat((cartProduct.productId.discountPrice * cartProduct.quantity).toFixed(2));
                                                                                cartProduct.onProductDiscount = parseFloat(((cartProduct.productId.price - cartProduct.productId.discountPrice) * cartProduct.quantity).toFixed(2));
                                                                        } else {
                                                                                cartProduct.total = parseFloat((cartProduct.productId.sizePrice[i].price * cartProduct.quantity).toFixed(2));
                                                                                cartProduct.subTotal = parseFloat((cartProduct.productId.sizePrice[i].price * cartProduct.quantity).toFixed(2));
                                                                                cartProduct.onProductDiscount = 0.00;
                                                                        }
                                                                        subTotal += cartProduct.subTotal;
                                                                        onProductDiscount += cartProduct.onProductDiscount;
                                                                        total += cartProduct.total;
                                                                }
                                                        }
                                                } else {
                                                        if (cartProduct.productId.discountActive === true) {
                                                                cartProduct.total = parseFloat((cartProduct.productId.price * cartProduct.quantity).toFixed(2));
                                                                cartProduct.subTotal = parseFloat((cartProduct.productId.discountPrice * cartProduct.quantity).toFixed(2));
                                                                cartProduct.onProductDiscount = parseFloat(((cartProduct.productId.price - cartProduct.productId.discountPrice) * cartProduct.quantity).toFixed(2));
                                                        } else {
                                                                cartProduct.total = parseFloat((cartProduct.productId.price * cartProduct.quantity).toFixed(2));
                                                                cartProduct.subTotal = parseFloat((cartProduct.productId.price * cartProduct.quantity).toFixed(2));
                                                                cartProduct.onProductDiscount = 0.00;
                                                        }
                                                        subTotal += cartProduct.subTotal;
                                                        onProductDiscount += cartProduct.onProductDiscount;
                                                        total += cartProduct.total;
                                                }
                                        });
                                        cartResponse.frequentlyBuyProductSchema.forEach((cartFBP) => {
                                                cartFBP.total = parseFloat((cartFBP.frequentlyBuyProductId.price * cartFBP.quantity).toFixed(2));
                                                cartFBP.subTotal = parseFloat((cartFBP.frequentlyBuyProductId.price * cartFBP.quantity).toFixed(2));
                                                subTotal += cartFBP.subTotal;
                                                total += cartFBP.total;
                                        });
                                        cartResponse.subTotal = subTotal;
                                        cartResponse.discount = onProductDiscount;
                                        cartResponse.total = total;
                                        if (cartResponse.pickupFromStore == true) {
                                                shipping = 0.00;
                                                cartResponse.shipping = parseFloat(shipping.toFixed(2));
                                                cartResponse.pickUp = data1;
                                                cartResponse.billingAddresss = data5;
                                        } else {
                                                shipping = 10.00;
                                                cartResponse.shipping = parseFloat(shipping.toFixed(2));
                                                cartResponse.deliveryAddresss = data2;
                                                cartResponse.billingAddresss = data5;
                                                cartResponse.shipping = shipping;
                                                cartResponse.total = cartResponse.subTotal + shipping;
                                        }
                                        orderObjPaidAmount = orderObjPaidAmount + cartResponse.total;
                                        cartResponse._id = new mongoose.Types.ObjectId();
                                        let saveOrder = await productOrder.create(cartResponse);
                                        productOrderId = saveOrder._id;
                                }
                                if (cartResponse.services.length > 0 || cartResponse.AddOnservicesSchema.length > 0) {
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
                                                                        console.log(data3.isSubscription);
                                                                        const findSubscription = await Subscription.findById(data3.subscriptionId);
                                                                        if (findSubscription) {
                                                                                membershipDiscountPercentage = findSubscription.discount;
                                                                        }
                                                                        membershipDiscount = (parseFloat((cartProduct.serviceId.price * cartProduct.quantity).toFixed(2)) * parseFloat((membershipDiscountPercentage / 100).toFixed(2)));
                                                                        cartProduct.membershipDiscount = parseFloat(membershipDiscount).toFixed(2)
                                                                        cartProduct.subTotal = parseFloat((cartProduct.serviceId.price * cartProduct.quantity).toFixed(2));
                                                                        cartProduct.total = parseFloat((cartProduct.serviceId.price * cartProduct.quantity).toFixed(2) - membershipDiscount);
                                                                        cartProduct.offerDiscount = 0.00;
                                                                        offerDiscount += cartProduct.offerDiscount;
                                                                        total += cartProduct.total;
                                                                        subTotal += cartProduct.subTotal;
                                                                } else {
                                                                        membershipDiscount = 0;
                                                                        cartProduct.membershipDiscount = parseFloat(membershipDiscount).toFixed(2)
                                                                        cartProduct.subTotal = parseFloat((cartProduct.serviceId.price * cartProduct.quantity).toFixed(2));
                                                                        cartProduct.total = parseFloat((cartProduct.serviceId.price * cartProduct.quantity).toFixed(2));
                                                                        cartProduct.offerDiscount = 0.00;
                                                                        offerDiscount += cartProduct.offerDiscount;
                                                                        subTotal += cartProduct.subTotal;
                                                                        total += cartProduct.total;
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
                                        let saveOrder = await serviceOrder.create(cartResponse);
                                        serviceOrderId = saveOrder._id;
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
                                                                orderObjPaidAmount: orderObjPaidAmount,
                                                        }
                                                        let saveOrder1 = await userOrders.create(orderObj);
                                                        return res.status(200).json({ msg: "product added to cart", data: saveOrder1 });
                                                }
                                        });
                                } else {
                                        let orderObj = {
                                                userId: req.user._id,
                                                orderId: orderId,
                                                productOrder: productOrderId,
                                                serviceOrder: serviceOrderId,
                                                orderObjPaidAmount: orderObjPaidAmount,
                                        }
                                        let saveOrder1 = await userOrders.create(orderObj);
                                        return res.status(200).json({ msg: "product added to cart", data: saveOrder1 });
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
                        let memberShipPer = 0;
                        let line_items = [];
                        if (findUserOrder.productOrder != (null || undefined)) {
                                let discount = 0, total = 0, subTotal = 0;
                                let findOrder = await productOrder.findById({ _id: findUserOrder.productOrder }).populate([{ path: "products.productId", select: { reviews: 0 } },
                                { path: 'frequentlyBuyProductSchema.frequentlyBuyProductId', populate: { path: 'products', model: 'Product' }, select: { reviews: 0 } },
                                { path: "coupon", select: "couponCode discount expirationDate" },]);
                                findOrder.products.forEach((cartProduct) => {
                                        let price;
                                        if (cartProduct.productId.multipleSize == true) {
                                                for (let i = 0; i < cartProduct.productId.sizePrice.length; i++) {
                                                        if ((cartProduct.productId.sizePrice[i]._id == cartProduct.priceId) == true) {
                                                                if (cartProduct.productId.discountActive === true) {
                                                                        cartProduct.total = parseFloat((cartProduct.productId.price * cartProduct.quantity).toFixed(2));
                                                                        cartProduct.subTotal = parseFloat((cartProduct.productId.discountPrice * cartProduct.quantity).toFixed(2));
                                                                        cartProduct.discount = parseFloat(((cartProduct.productId.price - cartProduct.productId.discountPrice) * cartProduct.quantity).toFixed(2));
                                                                        price = cartProduct.productId.discountPrice * cartProduct.quantity
                                                                } else {
                                                                        cartProduct.total = parseFloat((cartProduct.productId.sizePrice[i].price * cartProduct.quantity).toFixed(2));
                                                                        cartProduct.subTotal = parseFloat((cartProduct.productId.sizePrice[i].price * cartProduct.quantity).toFixed(2));
                                                                        cartProduct.discount = 0.00;
                                                                        price = parseFloat((cartProduct.productId.sizePrice[i].price * cartProduct.quantity).toFixed(2));
                                                                }
                                                                subTotal += cartProduct.subTotal;
                                                                discount += cartProduct.discount;
                                                                total += cartProduct.total;
                                                                let obj2 = {
                                                                        price_data: {
                                                                                currency: "usd",
                                                                                product_data: {
                                                                                        name: `${cartProduct.productId.name} (${cartProduct.size})`,
                                                                                },
                                                                                unit_amount: `${Math.round(price * 100)}`,
                                                                        },
                                                                        quantity: 1,
                                                                }
                                                                console.log("1381", obj2);
                                                                line_items.push(obj2)
                                                        }
                                                }
                                        } else {
                                                if (cartProduct.productId.discountActive === true) {
                                                        cartProduct.total = parseFloat((cartProduct.productId.price * cartProduct.quantity).toFixed(2));
                                                        cartProduct.subTotal = parseFloat((cartProduct.productId.discountPrice * cartProduct.quantity).toFixed(2));
                                                        cartProduct.discount = parseFloat(((cartProduct.productId.price - cartProduct.productId.discountPrice) * cartProduct.quantity).toFixed(2));
                                                        price = cartProduct.productId.discountPrice * cartProduct.quantity
                                                } else {
                                                        cartProduct.total = parseFloat((cartProduct.productId.price * cartProduct.quantity).toFixed(2));
                                                        cartProduct.subTotal = parseFloat((cartProduct.productId.price * cartProduct.quantity).toFixed(2));
                                                        cartProduct.discount = 0.00;
                                                        price = cartProduct.productId.price * cartProduct.quantity
                                                }
                                                subTotal += cartProduct.subTotal;
                                                discount += cartProduct.discount;
                                                total += cartProduct.total;
                                                let obj2 = {
                                                        price_data: {
                                                                currency: "usd",
                                                                product_data: {
                                                                        name: `${cartProduct.productId.name}`,
                                                                },
                                                                unit_amount: `${Math.round(price * 100)}`,
                                                        },
                                                        quantity: 1,
                                                }
                                                console.log("1805", obj2);
                                                line_items.push(obj2)
                                        }
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
                        if (findUserOrder.serviceOrder != (null || undefined)) {
                                let findOrder1 = await serviceOrder.findById({ _id: findUserOrder.serviceOrder }).populate([{ path: "AddOnservicesSchema.addOnservicesId", select: { reviews: 0 } }, { path: "services.serviceId", select: { reviews: 0 } }, { path: "coupon", select: "couponCode discount expirationDate" },]);
                                let discount = 0, total = 0, subTotal = 0;
                                findOrder1.services.forEach((cartProduct) => {
                                        let price;
                                        if (cartProduct.serviceId.discountActive == true) {
                                                cartProduct.total = cartProduct.serviceId.price * cartProduct.quantity;
                                                cartProduct.subTotal = cartProduct.serviceId.discountPrice * cartProduct.quantity;
                                                cartProduct.discount = (cartProduct.serviceId.price - cartProduct.serviceId.discountPrice) * cartProduct.quantity;
                                                price = cartProduct.serviceId.discountPrice * cartProduct.quantity
                                        } else {
                                                cartProduct.total = cartProduct.serviceId.price * cartProduct.quantity;
                                                cartProduct.subTotal = cartProduct.serviceId.price * cartProduct.quantity;
                                                cartProduct.discount = 0;
                                                price = cartProduct.serviceId.price * cartProduct.quantity
                                        }
                                        subTotal += cartProduct.subTotal;
                                        discount += cartProduct.discount;
                                        total += cartProduct.total;
                                        let obj2 = {
                                                price_data: {
                                                        currency: "usd",
                                                        product_data: {
                                                                name: `${cartProduct.serviceId.name}`,
                                                        },
                                                        unit_amount: `${Math.round(price * 100)}`,
                                                },
                                                quantity: 1,
                                        }
                                        line_items.push(obj2)
                                });
                                findOrder1.AddOnservicesSchema.forEach((cartGift) => {
                                        let price;
                                        cartGift.total = cartGift.addOnservicesId.price * cartGift.quantity;
                                        cartGift.subTotal = cartGift.addOnservicesId.price * cartGift.quantity;
                                        cartGift.discount = 0;
                                        subTotal += cartGift.subTotal;
                                        discount += cartGift.discount;
                                        total += cartGift.total;
                                        price = cartGift.addOnservicesId.price * cartGift.quantity
                                        let obj2 = {
                                                price_data: {
                                                        currency: "usd",
                                                        product_data: {
                                                                name: `${cartGift.addOnservicesId.name}`,
                                                        },
                                                        unit_amount: `${Math.round(price * 100)}`,
                                                },
                                                quantity: 1,
                                        }
                                        line_items.push(obj2)
                                });
                                memberShipPer = findOrder1.memberShip;
                        }
                        if (memberShipPer > 0) {
                                const couponId = await stripe.coupons.create({
                                        name: "Member Ship Discount",
                                        currency: 'usd',
                                        amount_off: memberShipPer.toFixed() * 100,
                                        duration: "once",
                                })
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
                                                        coupon: couponId.id, // Replace with your coupon ID
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
                        let find1 = await productOrder.findOne({ orderId: findUserOrder.orderId });
                        if (find1) {
                                let update = await productOrder.findOneAndUpdate({ orderId: findUserOrder.orderId }, { $set: { orderStatus: "confirmed", paymentStatus: "paid" } }, { new: true });
                        }
                        let find2 = await serviceOrder.findOne({ orderId: findUserOrder.orderId });
                        if (find2) {
                                let update1 = await serviceOrder.findOneAndUpdate({ orderId: findUserOrder.orderId }, { $set: { orderStatus: "confirmed", paymentStatus: "paid" } }, { new: true });
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
                        let mailOption1 = { from: '<do_not_reply@gmail.com>', to: 'info@shahinahoja.com', subject: 'Order Received', text: `You have received a new order, OrderId: ${findUserOrder.orderId}, Order Amount: ${findUserOrder.orderObjPaidAmount} `, };
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
exports.getProductOrders = async (req, res, next) => {
        try {
                const orders = await productOrder.find({ user: req.user._id, orderStatus: "confirmed" }).populate([
                        { path: "products.productId", select: { reviews: 0 } },
                        { path: "frequentlyBuyProductSchema.frequentlyBuyProductId", select: { reviews: 0 } }, { path: "coupon", select: "couponCode discount expirationDate" },]);
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
                        { path: "frequentlyBuyProductSchema.frequentlyBuyProductId", select: { reviews: 0 } },
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
                        const orders = await serviceOrder.find({ user: req.user._id, orderStatus: "confirmed", serviceStatus: req.query.serviceStatus }).populate([{ path: "AddOnservicesSchema.addOnservicesId", select: { reviews: 0 } }, { path: "services.serviceId", select: { reviews: 0 } }, { path: "coupon", select: "couponCode discount expirationDate" },]);
                        if (orders.length == 0) {
                                return res.status(404).json({ status: 404, message: "Orders not found", data: {} });
                        }
                        return res.status(200).json({ status: 200, msg: "orders of user", data: orders })
                } else {
                        const orders = await serviceOrder.find({ user: req.user._id, orderStatus: "confirmed" }).populate([{ path: "AddOnservicesSchema.addOnservicesId", select: { reviews: 0 } }, { path: "services.serviceId", select: { reviews: 0 } }, { path: "coupon", select: "couponCode discount expirationDate" },]);
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
                const orders = await serviceOrder.findById({ _id: req.params.id }).populate([{ path: "AddOnservicesSchema.addOnservicesId", select: { reviews: 0 } }, { path: "services.serviceId", select: { reviews: 0 } }, { path: "coupon", select: "couponCode discount expirationDate" },]);
                if (!orders) {
                        return res.status(404).json({ status: 404, message: "Orders not found", data: {} });
                }
                return res.status(200).json({ status: 200, msg: "orders of user", data: orders })
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
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
                const cart = await recentlyView.find({ user: req.user._id, type: "S" }).populate({ path: "services", select:"name images price discountPrice discount" }).sort({ "updateAt": -1 });
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
                const cart = await recentlyView.find({ user: req.user._id, type: "P" }).populate({ path: "products" ,select:"name productImages price sizePrice"}).sort({ "updateAt": -1 });
                if (!cart) {
                        return res.status(200).json({ success: false, msg: "No recentlyView", cart: {} });
                }
                return res.status(200).json({ success: true, msg: "recentlyView retrieved successfully", cart: cart });
        } catch (error) {
                console.log(error);
                next(error);
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
const ticketCode = async () => {
        var digits = "0123456789012345678901234567890123456789";
        let OTP = '';
        for (let i = 0; i < 8; i++) {
                OTP += digits[Math.floor(Math.random() * 36)];
        }
        return OTP;
}
exports.getCartApp = async (req, res, next) => {
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
                        let findCart = await Cart.findOne({ user: req.user._id }).populate([{ path: "products.productId", select: { reviews: 0 } }, { path: "gifts.giftPriceId", select: { reviews: 0 } }, { path: "AddOnservicesSchema.addOnservicesId", select: { reviews: 0 } }, { path: "services.serviceId", select: { reviews: 0 } }, { path: 'frequentlyBuyProductSchema.frequentlyBuyProductId', populate: { path: 'products', model: 'Product' }, select: { reviews: 0 } }, { path: "coupon", select: "couponCode discount expirationDate" },]);
                        if (findCart) {
                                const data1 = await Address.findOne({ type: "Admin" }).select('address appartment landMark -_id');
                                const data2 = await Address.findOne({ user: req.user._id, addressType: "Shipping" }).select('address appartment city state zipCode -_id');
                                const data5 = await Address.findOne({ user: req.user._id, addressType: "Billing" }).select('address appartment city state zipCode -_id');
                                const data3 = await User.findOne({ _id: req.user._id });
                                let orderObjPaidAmount = 0, productOrderId, serviceOrderId, giftOrderId;
                                if (findCart.coupon && moment().isAfter(findCart.coupon.expirationDate, "day")) { findCart.coupon = undefined; findCart.save(); }
                                const cartResponse = findCart.toObject();
                                let orderId = await reffralCode();
                                cartResponse.orderId = orderId;
                                if (cartResponse.products.length > 0 || cartResponse.frequentlyBuyProductSchema.length > 0) {
                                        let onProductDiscount = 0, shipping = 0, total = 0, subTotal = 0;
                                        cartResponse.products.forEach((cartProduct) => {
                                                if (cartProduct.productId.multipleSize == true) {
                                                        for (let i = 0; i < cartProduct.productId.sizePrice.length; i++) {
                                                                if ((cartProduct.productId.sizePrice[i]._id == cartProduct.priceId) == true) {
                                                                        if (cartProduct.productId.discountActive === true) {
                                                                                cartProduct.total = parseFloat((cartProduct.productId.price * cartProduct.quantity).toFixed(2));
                                                                                cartProduct.subTotal = parseFloat((cartProduct.productId.discountPrice * cartProduct.quantity).toFixed(2));
                                                                                cartProduct.onProductDiscount = parseFloat(((cartProduct.productId.price - cartProduct.productId.discountPrice) * cartProduct.quantity).toFixed(2));
                                                                        } else {
                                                                                cartProduct.total = parseFloat((cartProduct.productId.sizePrice[i].price * cartProduct.quantity).toFixed(2));
                                                                                cartProduct.subTotal = parseFloat((cartProduct.productId.sizePrice[i].price * cartProduct.quantity).toFixed(2));
                                                                                cartProduct.onProductDiscount = 0.00;
                                                                        }
                                                                        subTotal += cartProduct.subTotal;
                                                                        onProductDiscount += cartProduct.onProductDiscount;
                                                                        total += cartProduct.total;
                                                                }
                                                        }
                                                } else {
                                                        if (cartProduct.productId.discountActive === true) {
                                                                cartProduct.total = parseFloat((cartProduct.productId.price * cartProduct.quantity).toFixed(2));
                                                                cartProduct.subTotal = parseFloat((cartProduct.productId.discountPrice * cartProduct.quantity).toFixed(2));
                                                                cartProduct.onProductDiscount = parseFloat(((cartProduct.productId.price - cartProduct.productId.discountPrice) * cartProduct.quantity).toFixed(2));
                                                        } else {
                                                                cartProduct.total = parseFloat((cartProduct.productId.price * cartProduct.quantity).toFixed(2));
                                                                cartProduct.subTotal = parseFloat((cartProduct.productId.price * cartProduct.quantity).toFixed(2));
                                                                cartProduct.onProductDiscount = 0.00;
                                                        }
                                                        subTotal += cartProduct.subTotal;
                                                        onProductDiscount += cartProduct.onProductDiscount;
                                                        total += cartProduct.total;
                                                }
                                        });
                                        cartResponse.frequentlyBuyProductSchema.forEach((cartFBP) => {
                                                cartFBP.total = parseFloat((cartFBP.frequentlyBuyProductId.price * cartFBP.quantity).toFixed(2));
                                                cartFBP.subTotal = parseFloat((cartFBP.frequentlyBuyProductId.price * cartFBP.quantity).toFixed(2));
                                                subTotal += cartFBP.subTotal;
                                                total += cartFBP.total;
                                        });
                                        cartResponse.subTotal = subTotal;
                                        cartResponse.discount = onProductDiscount;
                                        cartResponse.total = total;
                                        if (cartResponse.pickupFromStore == true) {
                                                shipping = 0.00;
                                                cartResponse.shipping = parseFloat(shipping.toFixed(2));
                                                cartResponse.pickUp = data1;
                                                cartResponse.billingAddresss = data5;
                                        } else {
                                                shipping = 10.00;
                                                cartResponse.shipping = parseFloat(shipping.toFixed(2));
                                                cartResponse.deliveryAddresss = data2;
                                                cartResponse.billingAddresss = data5;
                                                cartResponse.shipping = shipping;
                                                cartResponse.total = cartResponse.subTotal + shipping;
                                        }
                                        orderObjPaidAmount = orderObjPaidAmount + cartResponse.total;
                                        cartResponse._id = new mongoose.Types.ObjectId();
                                        let saveOrder = await productOrder.create(cartResponse);
                                        productOrderId = saveOrder._id;
                                }
                                if (cartResponse.services.length > 0 || cartResponse.AddOnservicesSchema.length > 0) {
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
                                                                        console.log(data3.isSubscription);
                                                                        const findSubscription = await Subscription.findById(data3.subscriptionId);
                                                                        if (findSubscription) {
                                                                                membershipDiscountPercentage = findSubscription.discount;
                                                                        }
                                                                        membershipDiscount = (parseFloat((cartProduct.serviceId.price * cartProduct.quantity).toFixed(2)) * parseFloat((membershipDiscountPercentage / 100).toFixed(2)));
                                                                        cartProduct.membershipDiscount = parseFloat(membershipDiscount).toFixed(2)
                                                                        cartProduct.subTotal = parseFloat((cartProduct.serviceId.price * cartProduct.quantity).toFixed(2));
                                                                        cartProduct.total = parseFloat((cartProduct.serviceId.price * cartProduct.quantity).toFixed(2) - membershipDiscount);
                                                                        cartProduct.offerDiscount = 0.00;
                                                                        offerDiscount += cartProduct.offerDiscount;
                                                                        total += cartProduct.total;
                                                                        subTotal += cartProduct.subTotal;
                                                                } else {
                                                                        membershipDiscount = 0;
                                                                        cartProduct.membershipDiscount = parseFloat(membershipDiscount).toFixed(2)
                                                                        cartProduct.subTotal = parseFloat((cartProduct.serviceId.price * cartProduct.quantity).toFixed(2));
                                                                        cartProduct.total = parseFloat((cartProduct.serviceId.price * cartProduct.quantity).toFixed(2));
                                                                        cartProduct.offerDiscount = 0.00;
                                                                        offerDiscount += cartProduct.offerDiscount;
                                                                        subTotal += cartProduct.subTotal;
                                                                        total += cartProduct.total;
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
                                        let saveOrder = await serviceOrder.create(cartResponse);
                                        serviceOrderId = saveOrder._id;
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
                                                                orderObjPaidAmount: orderObjPaidAmount,
                                                        }
                                                        let saveOrder1 = await userOrders.create(orderObj);
                                                        return res.status(200).json({ msg: "product added to cart", data: saveOrder1 });
                                                }
                                        });
                                } else {
                                        let orderObj = {
                                                userId: req.user._id,
                                                orderId: orderId,
                                                productOrder: productOrderId,
                                                serviceOrder: serviceOrderId,
                                                orderObjPaidAmount: orderObjPaidAmount,
                                        }
                                        let saveOrder1 = await userOrders.create(orderObj);
                                        return res.status(200).json({ msg: "product added to cart", data: saveOrder1 });
                                }
                        } else {
                                return res.status(200).json({ success: false, msg: "Cart is empty", cart: {} });
                        }
                } else {
                        let findCart = await Cart.findOne({ user: req.user._id }).populate([{ path: "products.productId", select: { reviews: 0 } }, { path: "gifts.giftPriceId", select: { reviews: 0 } }, { path: "AddOnservicesSchema.addOnservicesId", select: { reviews: 0 } }, { path: "services.serviceId", select: { reviews: 0 } }, { path: 'frequentlyBuyProductSchema.frequentlyBuyProductId', populate: { path: 'products', model: 'Product' }, select: { reviews: 0 } }, { path: "coupon", select: "couponCode discount expirationDate" },]);
                        if (findCart) {
                                const data1 = await Address.findOne({ type: "Admin" }).select('address appartment landMark -_id');
                                const data2 = await Address.findOne({ user: req.user._id, addressType: "Shipping" }).select('address appartment city state zipCode -_id');
                                const data5 = await Address.findOne({ user: req.user._id, addressType: "Billing" }).select('address appartment city state zipCode -_id');
                                const data3 = await User.findOne({ _id: req.user._id });
                                let orderObjPaidAmount = 0, productOrderId, serviceOrderId, giftOrderId;
                                if (findCart.coupon && moment().isAfter(findCart.coupon.expirationDate, "day")) { findCart.coupon = undefined; findCart.save(); }
                                const cartResponse = findCart.toObject();
                                let orderId = await reffralCode();
                                cartResponse.orderId = orderId;
                                if (cartResponse.products.length > 0 || cartResponse.frequentlyBuyProductSchema.length > 0) {
                                        let onProductDiscount = 0, shipping = 0, total = 0, subTotal = 0;
                                        cartResponse.products.forEach((cartProduct) => {
                                                if (cartProduct.productId.multipleSize == true) {
                                                        for (let i = 0; i < cartProduct.productId.sizePrice.length; i++) {
                                                                if ((cartProduct.productId.sizePrice[i]._id == cartProduct.priceId) == true) {
                                                                        if (cartProduct.productId.discountActive === true) {
                                                                                cartProduct.total = parseFloat((cartProduct.productId.price * cartProduct.quantity).toFixed(2));
                                                                                cartProduct.subTotal = parseFloat((cartProduct.productId.discountPrice * cartProduct.quantity).toFixed(2));
                                                                                cartProduct.onProductDiscount = parseFloat(((cartProduct.productId.price - cartProduct.productId.discountPrice) * cartProduct.quantity).toFixed(2));
                                                                        } else {
                                                                                cartProduct.total = parseFloat((cartProduct.productId.sizePrice[i].price * cartProduct.quantity).toFixed(2));
                                                                                cartProduct.subTotal = parseFloat((cartProduct.productId.sizePrice[i].price * cartProduct.quantity).toFixed(2));
                                                                                cartProduct.onProductDiscount = 0.00;
                                                                        }
                                                                        subTotal += cartProduct.subTotal;
                                                                        onProductDiscount += cartProduct.onProductDiscount;
                                                                        total += cartProduct.total;
                                                                }
                                                        }
                                                } else {
                                                        if (cartProduct.productId.discountActive === true) {
                                                                cartProduct.total = parseFloat((cartProduct.productId.price * cartProduct.quantity).toFixed(2));
                                                                cartProduct.subTotal = parseFloat((cartProduct.productId.discountPrice * cartProduct.quantity).toFixed(2));
                                                                cartProduct.onProductDiscount = parseFloat(((cartProduct.productId.price - cartProduct.productId.discountPrice) * cartProduct.quantity).toFixed(2));
                                                        } else {
                                                                cartProduct.total = parseFloat((cartProduct.productId.price * cartProduct.quantity).toFixed(2));
                                                                cartProduct.subTotal = parseFloat((cartProduct.productId.price * cartProduct.quantity).toFixed(2));
                                                                cartProduct.onProductDiscount = 0.00;
                                                        }
                                                        subTotal += cartProduct.subTotal;
                                                        onProductDiscount += cartProduct.onProductDiscount;
                                                        total += cartProduct.total;
                                                }
                                        });
                                        cartResponse.frequentlyBuyProductSchema.forEach((cartFBP) => {
                                                cartFBP.total = parseFloat((cartFBP.frequentlyBuyProductId.price * cartFBP.quantity).toFixed(2));
                                                cartFBP.subTotal = parseFloat((cartFBP.frequentlyBuyProductId.price * cartFBP.quantity).toFixed(2));
                                                subTotal += cartFBP.subTotal;
                                                total += cartFBP.total;
                                        });
                                        cartResponse.subTotal = subTotal;
                                        cartResponse.discount = onProductDiscount;
                                        cartResponse.total = total;
                                        if (cartResponse.pickupFromStore == true) {
                                                shipping = 0.00;
                                                cartResponse.shipping = parseFloat(shipping.toFixed(2));
                                                cartResponse.pickUp = data1;
                                                cartResponse.billingAddresss = data5;
                                        } else {
                                                shipping = 10.00;
                                                cartResponse.shipping = parseFloat(shipping.toFixed(2));
                                                cartResponse.deliveryAddresss = data2;
                                                cartResponse.billingAddresss = data5;
                                                cartResponse.shipping = shipping;
                                                cartResponse.total = cartResponse.subTotal + shipping;
                                        }
                                        orderObjPaidAmount = orderObjPaidAmount + cartResponse.total;
                                        cartResponse._id = new mongoose.Types.ObjectId();
                                        let saveOrder = await productOrder.create(cartResponse);
                                        productOrderId = saveOrder._id;
                                }
                                if (cartResponse.services.length > 0 || cartResponse.AddOnservicesSchema.length > 0) {
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
                                                                        console.log(data3.isSubscription);
                                                                        const findSubscription = await Subscription.findById(data3.subscriptionId);
                                                                        if (findSubscription) {
                                                                                membershipDiscountPercentage = findSubscription.discount;
                                                                        }
                                                                        membershipDiscount = (parseFloat((cartProduct.serviceId.price * cartProduct.quantity).toFixed(2)) * parseFloat((membershipDiscountPercentage / 100).toFixed(2)));
                                                                        cartProduct.membershipDiscount = parseFloat(membershipDiscount).toFixed(2)
                                                                        cartProduct.subTotal = parseFloat((cartProduct.serviceId.price * cartProduct.quantity).toFixed(2));
                                                                        cartProduct.total = parseFloat((cartProduct.serviceId.price * cartProduct.quantity).toFixed(2) - membershipDiscount);
                                                                        cartProduct.offerDiscount = 0.00;
                                                                        offerDiscount += cartProduct.offerDiscount;
                                                                        total += cartProduct.total;
                                                                        subTotal += cartProduct.subTotal;
                                                                } else {
                                                                        membershipDiscount = 0;
                                                                        cartProduct.membershipDiscount = parseFloat(membershipDiscount).toFixed(2)
                                                                        cartProduct.subTotal = parseFloat((cartProduct.serviceId.price * cartProduct.quantity).toFixed(2));
                                                                        cartProduct.total = parseFloat((cartProduct.serviceId.price * cartProduct.quantity).toFixed(2));
                                                                        cartProduct.offerDiscount = 0.00;
                                                                        offerDiscount += cartProduct.offerDiscount;
                                                                        subTotal += cartProduct.subTotal;
                                                                        total += cartProduct.total;
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
                                        let saveOrder = await serviceOrder.create(cartResponse);
                                        serviceOrderId = saveOrder._id;
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
                                                                orderObjPaidAmount: orderObjPaidAmount,
                                                        }
                                                        let saveOrder1 = await userOrders.create(orderObj);
                                                        return res.status(200).json({ msg: "product added to cart", data: saveOrder1 });
                                                }
                                        });
                                } else {
                                        let orderObj = {
                                                userId: req.user._id,
                                                orderId: orderId,
                                                productOrder: productOrderId,
                                                serviceOrder: serviceOrderId,
                                                orderObjPaidAmount: orderObjPaidAmount,
                                        }
                                        let saveOrder1 = await userOrders.create(orderObj);
                                        return res.status(200).json({ msg: "product added to cart", data: saveOrder1 });
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
                        let memberShipPer = 0;
                        let line_items = [];
                        if (findUserOrder.productOrder != (null || undefined)) {
                                let discount = 0, total = 0, subTotal = 0;
                                let findOrder = await productOrder.findById({ _id: findUserOrder.productOrder }).populate([{ path: "products.productId", select: { reviews: 0 } },
                                { path: 'frequentlyBuyProductSchema.frequentlyBuyProductId', populate: { path: 'products', model: 'Product' }, select: { reviews: 0 } },
                                { path: "coupon", select: "couponCode discount expirationDate" },]);
                                findOrder.products.forEach((cartProduct) => {
                                        let price;
                                        if (cartProduct.productId.multipleSize == true) {
                                                for (let i = 0; i < cartProduct.productId.sizePrice.length; i++) {
                                                        if ((cartProduct.productId.sizePrice[i]._id == cartProduct.priceId) == true) {
                                                                if (cartProduct.productId.discountActive === true) {
                                                                        cartProduct.total = parseFloat((cartProduct.productId.price * cartProduct.quantity).toFixed(2));
                                                                        cartProduct.subTotal = parseFloat((cartProduct.productId.discountPrice * cartProduct.quantity).toFixed(2));
                                                                        cartProduct.discount = parseFloat(((cartProduct.productId.price - cartProduct.productId.discountPrice) * cartProduct.quantity).toFixed(2));
                                                                        price = cartProduct.productId.discountPrice * cartProduct.quantity
                                                                } else {
                                                                        cartProduct.total = parseFloat((cartProduct.productId.sizePrice[i].price * cartProduct.quantity).toFixed(2));
                                                                        cartProduct.subTotal = parseFloat((cartProduct.productId.sizePrice[i].price * cartProduct.quantity).toFixed(2));
                                                                        cartProduct.discount = 0.00;
                                                                        price = parseFloat((cartProduct.productId.sizePrice[i].price * cartProduct.quantity).toFixed(2));
                                                                }
                                                                subTotal += cartProduct.subTotal;
                                                                discount += cartProduct.discount;
                                                                total += cartProduct.total;
                                                                let obj2 = {
                                                                        price_data: {
                                                                                currency: "usd",
                                                                                product_data: {
                                                                                        name: `${cartProduct.productId.name} (${cartProduct.size})`,
                                                                                },
                                                                                unit_amount: `${Math.round(price * 100)}`,
                                                                        },
                                                                        quantity: 1,
                                                                }
                                                                console.log("1381", obj2);
                                                                line_items.push(obj2)
                                                        }
                                                }
                                        } else {
                                                if (cartProduct.productId.discountActive === true) {
                                                        cartProduct.total = parseFloat((cartProduct.productId.price * cartProduct.quantity).toFixed(2));
                                                        cartProduct.subTotal = parseFloat((cartProduct.productId.discountPrice * cartProduct.quantity).toFixed(2));
                                                        cartProduct.discount = parseFloat(((cartProduct.productId.price - cartProduct.productId.discountPrice) * cartProduct.quantity).toFixed(2));
                                                        price = cartProduct.productId.discountPrice * cartProduct.quantity
                                                } else {
                                                        cartProduct.total = parseFloat((cartProduct.productId.price * cartProduct.quantity).toFixed(2));
                                                        cartProduct.subTotal = parseFloat((cartProduct.productId.price * cartProduct.quantity).toFixed(2));
                                                        cartProduct.discount = 0.00;
                                                        price = cartProduct.productId.price * cartProduct.quantity
                                                }
                                                subTotal += cartProduct.subTotal;
                                                discount += cartProduct.discount;
                                                total += cartProduct.total;
                                                let obj2 = {
                                                        price_data: {
                                                                currency: "usd",
                                                                product_data: {
                                                                        name: `${cartProduct.productId.name}`,
                                                                },
                                                                unit_amount: `${Math.round(price * 100)}`,
                                                        },
                                                        quantity: 1,
                                                }
                                                console.log("1805", obj2);
                                                line_items.push(obj2)
                                        }
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
                        if (findUserOrder.serviceOrder != (null || undefined)) {
                                let findOrder1 = await serviceOrder.findById({ _id: findUserOrder.serviceOrder }).populate([{ path: "AddOnservicesSchema.addOnservicesId", select: { reviews: 0 } }, { path: "services.serviceId", select: { reviews: 0 } }, { path: "coupon", select: "couponCode discount expirationDate" },]);
                                let discount = 0, total = 0, subTotal = 0;
                                findOrder1.services.forEach((cartProduct) => {
                                        let price;
                                        if (cartProduct.serviceId.discountActive == true) {
                                                cartProduct.total = cartProduct.serviceId.price * cartProduct.quantity;
                                                cartProduct.subTotal = cartProduct.serviceId.discountPrice * cartProduct.quantity;
                                                cartProduct.discount = (cartProduct.serviceId.price - cartProduct.serviceId.discountPrice) * cartProduct.quantity;
                                                price = cartProduct.serviceId.discountPrice * cartProduct.quantity
                                        } else {
                                                cartProduct.total = cartProduct.serviceId.price * cartProduct.quantity;
                                                cartProduct.subTotal = cartProduct.serviceId.price * cartProduct.quantity;
                                                cartProduct.discount = 0;
                                                price = cartProduct.serviceId.price * cartProduct.quantity
                                        }
                                        subTotal += cartProduct.subTotal;
                                        discount += cartProduct.discount;
                                        total += cartProduct.total;
                                        let obj2 = {
                                                price_data: {
                                                        currency: "usd",
                                                        product_data: {
                                                                name: `${cartProduct.serviceId.name}`,
                                                        },
                                                        unit_amount: `${Math.round(price * 100)}`,
                                                },
                                                quantity: 1,
                                        }
                                        line_items.push(obj2)
                                });
                                findOrder1.AddOnservicesSchema.forEach((cartGift) => {
                                        let price;
                                        cartGift.total = cartGift.addOnservicesId.price * cartGift.quantity;
                                        cartGift.subTotal = cartGift.addOnservicesId.price * cartGift.quantity;
                                        cartGift.discount = 0;
                                        subTotal += cartGift.subTotal;
                                        discount += cartGift.discount;
                                        total += cartGift.total;
                                        price = cartGift.addOnservicesId.price * cartGift.quantity
                                        let obj2 = {
                                                price_data: {
                                                        currency: "usd",
                                                        product_data: {
                                                                name: `${cartGift.addOnservicesId.name}`,
                                                        },
                                                        unit_amount: `${Math.round(price * 100)}`,
                                                },
                                                quantity: 1,
                                        }
                                        line_items.push(obj2)
                                });
                                memberShipPer = findOrder1.memberShip;
                        }
                        if (memberShipPer > 0) {
                                const couponId = await stripe.coupons.create({
                                        name: "Member Ship Discount",
                                        currency: 'usd',
                                        amount_off: memberShipPer.toFixed() * 100,
                                        duration: "once",
                                })
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
                                                        coupon: couponId.id, // Replace with your coupon ID
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
exports.successOrderApp = async (req, res) => {
        try {
                let findUserOrder = await userOrders.findOne({ orderId: req.params.orderId });
                if (findUserOrder) {
                        const user = await User.findById({ _id: findUserOrder.userId });
                        if (!user) {
                                return res.status(404).send({ status: 404, message: "User not found or token expired." });
                        }
                        let update2 = await userOrders.findOneAndUpdate({ orderId: findUserOrder.orderId }, { $set: { orderStatus: "confirmed", paymentStatus: "paid" } }, { new: true });
                        let find1 = await productOrder.findOne({ orderId: findUserOrder.orderId });
                        if (find1) {
                                let update = await productOrder.findOneAndUpdate({ orderId: findUserOrder.orderId }, { $set: { orderStatus: "confirmed", paymentStatus: "paid" } }, { new: true });
                        }
                        let find2 = await serviceOrder.findOne({ orderId: findUserOrder.orderId });
                        if (find2) {
                                let update1 = await serviceOrder.findOneAndUpdate({ orderId: findUserOrder.orderId }, { $set: { orderStatus: "confirmed", paymentStatus: "paid" } }, { new: true });
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
                        let mailOption1 = { from: '<do_not_reply@gmail.com>', to: 'info@shahinahoja.com', subject: 'Order Received', text: `You have received a new order, OrderId: ${findUserOrder.orderId}, Order Amount: ${findUserOrder.orderObjPaidAmount} `, };
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
exports.overAllSearch = async (req, res) => {
        try {
                const query = req.query.search;
                const productResults = await product.find({ $or: [{ name: { $regex: query, $options: 'i' } }, { description: { $regex: query, $options: 'i' } },], })
                const serviceResults = await services.find({ $or: [{ name: { $regex: query, $options: 'i' } }, { description: { $regex: query, $options: 'i' } },], });
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










// const calculateCartResponse = async (cart, userId, isServiceCart = false) => {
//         try {
//                 await cart.populate([
//                         { path: "products.productId", select: { reviews: 0 } },
//                         { path: "gifts.giftId", populate: { path: 'giftId', model: 'gift' }, select: { reviews: 0 } },
//                         { path: "AddOnservicesSchema.addOnservicesId", select: { reviews: 0 } },
//                         { path: "services.serviceId", select: { reviews: 0 } },
//                         { path: 'frequentlyBuyProductSchema.frequentlyBuyProductId', populate: { path: 'products', model: 'Product' }, select: { reviews: 0 } },
//                         { path: "coupon", select: "couponCode discount expirationDate" },
//                 ]);
//                 console.log(cart);
//                 const data1 = await Address.findOne({ type: "Admin" }).select('address appartment landMark -_id');
//                 const data2 = await Address.findOne({ user: userId, addressType: "Shipping" }).select('address appartment city state zipCode -_id');
//                 const data5 = await Address.findOne({ user: userId, addressType: "Billing" }).select('address appartment city state zipCode -_id');
//                 const data3 = await User.findOne({ _id: userId });
//                 const data4 = await contact.findOne().select('name image phone email numOfReviews ratings -_id');
//                 let discount = 0, couponDiscount = 0, membershipDiscount = 0, shipping = 10, membershipDiscountPercentage, serviceCharge = 10, memberShipPer;
//                 if (data3 && data3.isSubscription === true) {
//                         const findSubscription = await Subscription.findById(data3.subscriptionId);
//                         if (findSubscription) {
//                                 membershipDiscountPercentage = findSubscription.discount;
//                         }
//                 } else {
//                         membershipDiscountPercentage = 0;
//                 }
//                 if (cart.coupon && moment().isAfter(cart.coupon.expirationDate, "day")) {
//                         cart.coupon = undefined;
//                         cart.save();
//                 }
//                 const cartResponse = cart.toObject();
//                 let total = 0, subTotal = 0, grandTotal = 0;
//                 cartResponse.products.forEach((cartProduct) => {
//                         if (cartProduct.productId.multipleSize == true) {
//                                 for (let i = 0; i < cartProduct.productId.sizePrice.length; i++) {
//                                         if ((cartProduct.productId.sizePrice[i]._id == cartProduct.priceId) == true) {
//                                                 if (cartProduct.productId.discountActive === true) {
//                                                         cartProduct.total = parseFloat((cartProduct.productId.price * cartProduct.quantity).toFixed(2));
//                                                         cartProduct.subTotal = parseFloat((cartProduct.productId.discountPrice * cartProduct.quantity).toFixed(2));
//                                                         cartProduct.discount = parseFloat(((cartProduct.productId.price - cartProduct.productId.discountPrice) * cartProduct.quantity).toFixed(2));
//                                                 } else {
//                                                         cartProduct.total = parseFloat((cartProduct.productId.sizePrice[i].price * cartProduct.quantity).toFixed(2));
//                                                         cartProduct.subTotal = parseFloat((cartProduct.productId.sizePrice[i].price * cartProduct.quantity).toFixed(2));
//                                                         cartProduct.discount = 0.00;
//                                                 }
//                                                 subTotal += cartProduct.subTotal;
//                                                 discount += cartProduct.discount;
//                                                 total += cartProduct.total;
//                                         }
//                                 }
//                         } else {
//                                 if (cartProduct.productId.discountActive === true) {
//                                         cartProduct.total = parseFloat((cartProduct.productId.price * cartProduct.quantity).toFixed(2));
//                                         cartProduct.subTotal = parseFloat((cartProduct.productId.discountPrice * cartProduct.quantity).toFixed(2));
//                                         cartProduct.discount = parseFloat(((cartProduct.productId.price - cartProduct.productId.discountPrice) * cartProduct.quantity).toFixed(2));
//                                 } else {
//                                         cartProduct.total = parseFloat((cartProduct.productId.price * cartProduct.quantity).toFixed(2));
//                                         cartProduct.subTotal = parseFloat((cartProduct.productId.price * cartProduct.quantity).toFixed(2));
//                                         cartProduct.discount = 0.00;
//                                 }
//                                 subTotal += cartProduct.subTotal;
//                                 discount += cartProduct.discount;
//                                 total += cartProduct.total;
//                         }
//                 });
//                 cartResponse.gifts.forEach((cartGift) => {
//                         if (cartGift.giftId.discountActive === true) {
//                                 cartGift.total = parseFloat((cartGift.giftId.price * cartGift.quantity).toFixed(2));
//                                 cartGift.subTotal = parseFloat((cartGift.giftId.discountPrice * cartGift.quantity).toFixed(2));
//                                 cartGift.discount = parseFloat(((cartGift.giftId.price - cartGift.giftId.discountPrice) * cartGift.quantity).toFixed(2));
//                         } else {
//                                 cartGift.total = parseFloat((cartGift.giftId.price * cartGift.quantity).toFixed(2));
//                                 cartGift.subTotal = parseFloat((cartGift.giftId.price * cartGift.quantity).toFixed(2));
//                                 cartGift.discount = 0.00;
//                         }
//                         subTotal += cartGift.subTotal;
//                         discount += cartGift.discount;
//                         total += cartGift.total;
//                 });
//                 cartResponse.frequentlyBuyProductSchema.forEach((cartFBP) => {
//                         cartFBP.total = parseFloat((cartFBP.frequentlyBuyProductId.price * cartFBP.quantity).toFixed(2));
//                         cartFBP.subTotal = parseFloat((cartFBP.frequentlyBuyProductId.price * cartFBP.quantity).toFixed(2));
//                         subTotal += cartFBP.subTotal;
//                         total += cartFBP.total;
//                 });
//                 if (data3 && data3.isSubscription == true) {
//                         const findSubscription = await Subscription.findById(data3.subscriptionId);
//                         if (findSubscription) {
//                                 memberShipPer = findSubscription.discount;
//                         }
//                 } else {
//                         memberShipPer = 0;
//                 }
//                 if (isServiceCart) {
//                         cartResponse.serviceCharge = parseFloat(serviceCharge.toFixed(2));
//                         cartResponse.AddOnservicesSchema.forEach((cartGift) => {
//                                 cartGift.total = parseFloat((cartGift.addOnservicesId.price * cartGift.quantity).toFixed(2));
//                                 cartGift.subTotal = parseFloat((cartGift.addOnservicesId.price * cartGift.quantity).toFixed(2));
//                                 cartGift.discount = 0.00;
//                                 subTotal += cartGift.subTotal;
//                                 discount += cartGift.discount;
//                                 total += cartGift.total;
//                         });
//                         cartResponse.services.forEach((cartProduct) => {
//                                 console.log(cartProduct);
//                                 if (cartProduct.serviceId.discountActive == true) {
//                                         cartProduct.total = parseFloat((cartProduct.serviceId.price * cartProduct.quantity).toFixed(2));
//                                         cartProduct.subTotal = parseFloat((cartProduct.serviceId.discountPrice * cartProduct.quantity).toFixed(2));
//                                         cartProduct.discount = parseFloat(((cartProduct.serviceId.price - cartProduct.serviceId.discountPrice) * cartProduct.quantity).toFixed(2));
//                                 } else {
//                                         cartProduct.total = parseFloat((cartProduct.serviceId.price * cartProduct.quantity).toFixed(2));
//                                         cartProduct.subTotal = parseFloat((cartProduct.serviceId.price * cartProduct.quantity).toFixed(2));
//                                         cartProduct.discount = 0.00;
//                                 }
//                                 subTotal += cartProduct.subTotal;
//                                 discount += cartProduct.discount;
//                                 total += cartProduct.total;
//                         });
//                 }
//                 if (cartResponse.products.length > 0) {
//                         if (cartResponse.pickupFromStore == true) {
//                                 shipping = 0;
//                                 grandTotal = parseFloat((grandTotal + shipping).toFixed(2));
//                                 cartResponse.shipping = parseFloat(shipping.toFixed(2));
//                         } else {
//                                 grandTotal = parseFloat((grandTotal + shipping).toFixed(2));
//                                 cartResponse.shipping = parseFloat(shipping.toFixed(2));
//                         }
//                 }
//                 if (cartResponse.services.length > 0) {
//                         grandTotal = parseFloat((grandTotal + serviceCharge).toFixed(2));
//                         cartResponse.serviceCharge = parseFloat(shipping.toFixed(2));
//                 }
//                 if (cartResponse.coupon) {
//                         couponDiscount = parseFloat(((0.01 * cart.coupon.discount) * subTotal).toFixed(2));
//                 }
//                 if (cartResponse.gifts.length > 0 && cartResponse.services.length == 0 && cartResponse.products.length == 0) {
//                         cartResponse.total = parseFloat(subTotal.toFixed(2));
//                         grandTotal = parseFloat((total).toFixed(2));
//                 } else {
//                         cartResponse.total = parseFloat(subTotal.toFixed(2)) + parseFloat(shipping.toFixed(2));
//                         membershipDiscount = parseFloat((membershipDiscountPercentage / 100) * (parseFloat(subTotal.toFixed(2)) + parseFloat(shipping.toFixed(2))).toFixed(2));
//                         grandTotal = parseFloat((total - membershipDiscount).toFixed(2));
//                 }
//                 cartResponse.discount = parseFloat(discount.toFixed(2));
//                 cartResponse.membershipDiscount = parseFloat(membershipDiscount.toFixed(2));
//                 cartResponse.couponDiscount = parseFloat(couponDiscount.toFixed(2));
//                 cartResponse.subTotal = parseFloat(subTotal.toFixed(2));
//                 cartResponse.grandTotal = parseFloat(grandTotal.toFixed(2));
//                 cartResponse.contactDetail = data4;
//                 cartResponse.pickUp = data1;
//                 cartResponse.deliveryAddresss = data2;
//                 cartResponse.billingAddresss = data5;
//                 return cartResponse;
//         } catch (error) {
//                 throw error;
//         }
// };
// exports.checkout = async (req, res) => {
//         try {
//                 let findOrder = await productOrder.find({ user: req.user._id, orderStatus: "unconfirmed" });
//                 let findOrder1 = await serviceOrder.find({ user: req.user._id, orderStatus: "unconfirmed" });
//                 let findOrder2 = await userOrders.find({ user: req.user._id, orderStatus: "unconfirmed" });
//                 let findOrder3 = await coupanModel.find({ senderUser: req.user._id, orderStatus: "unconfirmed" });
//                 if (findOrder.length > 0 || findOrder1.length > 0 || findOrder2.length > 0 || findOrder3.length > 0) {
//                         if (findOrder.length > 0) {
//                                 for (let i = 0; i < findOrder.length; i++) {
//                                         await productOrder.findByIdAndDelete({ _id: findOrder[i]._id });
//                                 }
//                         }
//                         if (findOrder1.length > 0) {
//                                 for (let i = 0; i < findOrder1.length; i++) {
//                                         await serviceOrder.findByIdAndDelete({ _id: findOrder1[i]._id });
//                                 }
//                         }
//                         if (findOrder2.length > 0) {
//                                 for (let i = 0; i < findOrder2.length; i++) {
//                                         await userOrders.findByIdAndDelete({ _id: findOrder2[i]._id });
//                                 }
//                         }
//                         if (findOrder3.length > 0) {
//                                 for (let i = 0; i < findOrder3.length; i++) {
//                                         await coupanModel.findByIdAndDelete({ _id: findOrder3[i]._id });
//                                 }
//                         }
//                         let findCart = await Cart.findOne({ user: req.user._id }).populate([{ path: "products.productId", select: { reviews: 0 } }, { path: "gifts.giftId", select: { reviews: 0 } }, { path: "AddOnservicesSchema.addOnservicesId", select: { reviews: 0 } }, { path: "services.serviceId", select: { reviews: 0 } }, { path: 'frequentlyBuyProductSchema.frequentlyBuyProductId', populate: { path: 'products', model: 'Product' }, select: { reviews: 0 } }, { path: "coupon", select: "couponCode discount expirationDate" },]);
//                         if (findCart) {
//                                 const data1 = await Address.findOne({ type: "Admin" }).select('address appartment landMark -_id');
//                                 const data2 = await Address.findOne({ user: req.user._id, addressType: "Shipping" }).select('address appartment city state zipCode -_id');
//                                 const data5 = await Address.findOne({ user: req.user._id, addressType: "Billing" }).select('address appartment city state zipCode -_id');
//                                 const data3 = await User.findOne({ _id: req.user._id });
//                                 let discount = 0, couponDiscount = 0, memberShip = 0, shipping = 10, memberShipPer, total1 = 0, total = 0, subTotal = 0, grandTotal = 0, coupan = 0, serviceCharge = 10;
//                                 let orderObjPaidAmount = 0, productOrderId, serviceOrderId, giftOrderId;
//                                 if (findCart.coupon && moment().isAfter(findCart.coupon.expirationDate, "day")) { findCart.coupon = undefined; findCart.save(); }
//                                 const cartResponse = findCart.toObject();
//                                 let orderId = await reffralCode();
//                                 cartResponse.orderId = orderId;
//                                 if (cartResponse.products.length > 0 || cartResponse.frequentlyBuyProductSchema.length > 0) {
//                                         if (data3) {
//                                                 if (data3.isSubscription == true) {
//                                                         const findSubscription = await Subscription.findById(data3.subscriptionId);
//                                                         if (findSubscription) {
//                                                                 memberShipPer = findSubscription.discount
//                                                         }
//                                                 } else {
//                                                         memberShipPer = 0;
//                                                 }
//                                         }
//                                         cartResponse.products.forEach((cartProduct) => {
//                                                 if (cartProduct.productId.multipleSize == true) {
//                                                         for (let i = 0; i < cartProduct.productId.sizePrice.length; i++) {
//                                                                 if ((cartProduct.productId.sizePrice[i]._id == cartProduct.priceId) == true) {
//                                                                         if (cartProduct.productId.discountActive === true) {
//                                                                                 cartProduct.total = parseFloat((cartProduct.productId.price * cartProduct.quantity).toFixed(2));
//                                                                                 cartProduct.subTotal = parseFloat((cartProduct.productId.discountPrice * cartProduct.quantity).toFixed(2));
//                                                                                 cartProduct.discount = parseFloat(((cartProduct.productId.price - cartProduct.productId.discountPrice) * cartProduct.quantity).toFixed(2));
//                                                                         } else {
//                                                                                 cartProduct.total = parseFloat((cartProduct.productId.sizePrice[i].price * cartProduct.quantity).toFixed(2));
//                                                                                 cartProduct.subTotal = parseFloat((cartProduct.productId.sizePrice[i].price * cartProduct.quantity).toFixed(2));
//                                                                                 cartProduct.discount = 0.00;
//                                                                         }
//                                                                         subTotal += cartProduct.subTotal;
//                                                                         discount += cartProduct.discount;
//                                                                         total += cartProduct.total;
//                                                                 }
//                                                         }
//                                                 } else {
//                                                         if (cartProduct.productId.discountActive === true) {
//                                                                 cartProduct.total = parseFloat((cartProduct.productId.price * cartProduct.quantity).toFixed(2));
//                                                                 cartProduct.subTotal = parseFloat((cartProduct.productId.discountPrice * cartProduct.quantity).toFixed(2));
//                                                                 cartProduct.discount = parseFloat(((cartProduct.productId.price - cartProduct.productId.discountPrice) * cartProduct.quantity).toFixed(2));
//                                                         } else {
//                                                                 cartProduct.total = parseFloat((cartProduct.productId.price * cartProduct.quantity).toFixed(2));
//                                                                 cartProduct.subTotal = parseFloat((cartProduct.productId.price * cartProduct.quantity).toFixed(2));
//                                                                 cartProduct.discount = 0.00;
//                                                         }
//                                                         subTotal += cartProduct.subTotal;
//                                                         discount += cartProduct.discount;
//                                                         total += cartProduct.total;
//                                                 }
//                                         });
//                                         cartResponse.frequentlyBuyProductSchema.forEach((cartProduct) => {
//                                                 cartProduct.total = cartProduct.frequentlyBuyProductId.price * cartProduct.quantity;
//                                                 cartProduct.subTotal = cartProduct.frequentlyBuyProductId.price * cartProduct.quantity;
//                                                 cartProduct.discount = 0;
//                                                 subTotal += cartProduct.subTotal;
//                                                 discount += cartProduct.discount;
//                                                 total += cartProduct.total;
//                                         });
//                                         if (cartResponse.coupon) {
//                                                 coupan = 0.01 * findCart.coupon.discount * subTotal;
//                                         }
//                                         cartResponse.total = total;
//                                         cartResponse.discount = discount;
//                                         cartResponse.coupan = couponDiscount;
//                                         cartResponse.subTotal = subTotal;
//                                         if (findCart.pickupFromStore == true) {
//                                                 cartResponse.pickUp = data1;
//                                                 cartResponse.billingAddresss = data5;
//                                                 total1 = subTotal - coupan;
//                                                 memberShip = (total1 * memberShipPer) / 100;
//                                                 cartResponse.memberShip = memberShip;
//                                                 cartResponse.memberShipPer = memberShipPer;
//                                                 grandTotal = total1 - memberShip;
//                                                 cartResponse.grandTotal = grandTotal;
//                                         } else {
//                                                 cartResponse.deliveryAddresss = data2;
//                                                 cartResponse.billingAddresss = data5;
//                                                 cartResponse.shipping = shipping;
//                                                 total1 = subTotal - couponDiscount + shipping;
//                                                 memberShip = (total1 * memberShipPer) / 100;
//                                                 cartResponse.memberShip = memberShip;
//                                                 cartResponse.memberShipPer = memberShipPer;
//                                                 grandTotal = total1 - memberShip;
//                                                 cartResponse.grandTotal = grandTotal;
//                                         }
//                                         orderObjPaidAmount = orderObjPaidAmount + grandTotal;
//                                         cartResponse._id = new mongoose.Types.ObjectId();
//                                         let saveOrder = await productOrder.create(cartResponse);
//                                         productOrderId = saveOrder._id;
//                                 }
//                                 if (cartResponse.services.length > 0 || cartResponse.AddOnservicesSchema.length > 0) {
//                                         if (data3) {
//                                                 if (data3.isSubscription == true) {
//                                                         const findSubscription = await Subscription.findById(data3.subscriptionId);
//                                                         if (findSubscription) {
//                                                                 memberShipPer = findSubscription.discount
//                                                         }
//                                                 } else {
//                                                         memberShipPer = 0;
//                                                 }
//                                         }
//                                         if (cartResponse.services.length > 0) {
//                                                 cartResponse.services.forEach((cartProduct) => {
//                                                         if (cartProduct.serviceId.discountActive == true) {
//                                                                 cartProduct.total = cartProduct.serviceId.price * cartProduct.quantity;
//                                                                 cartProduct.subTotal = cartProduct.serviceId.discountPrice * cartProduct.quantity;
//                                                                 let discount1 = (cartProduct.serviceId.price - cartProduct.serviceId.discountPrice) * cartProduct.quantity;
//                                                                 cartProduct.discount = discount1.toFixed(2)
//                                                                 discount = discount1.toFixed(2)
//                                                         } else {
//                                                                 cartProduct.total = cartProduct.serviceId.price * cartProduct.quantity;
//                                                                 cartProduct.subTotal = cartProduct.serviceId.price * cartProduct.quantity;
//                                                                 cartProduct.discount = discount;
//                                                                 discount = discount
//                                                         }
//                                                         subTotal += cartProduct.subTotal;
//                                                         discount += cartProduct.discount;
//                                                         total += cartProduct.total;
//                                                 });
//                                         }
//                                         if (cartResponse.AddOnservicesSchema.length > 0) {
//                                                 cartResponse.AddOnservicesSchema.forEach((cartGift) => {
//                                                         cartGift.total = cartGift.addOnservicesId.price * cartGift.quantity;
//                                                         cartGift.subTotal = cartGift.addOnservicesId.price * cartGift.quantity;
//                                                         cartGift.discount = 0;
//                                                         subTotal += cartGift.subTotal;
//                                                         discount += cartGift.discount;
//                                                         total += cartGift.total;
//                                                 });
//                                         }
//                                         if (cartResponse.coupon) {
//                                                 coupan = 0.01 * findCart.coupon.discount * subTotal;
//                                         }
//                                         cartResponse.date = findCart.date;
//                                         cartResponse.time = findCart.time;
//                                         cartResponse.suggesstion = findCart.suggesstion;
//                                         cartResponse.total = total;
//                                         // cartResponse.discount = Number(discount);
//                                         cartResponse.coupan = coupan;
//                                         cartResponse.subTotal = subTotal;
//                                         cartResponse.serviceCharge = serviceCharge;
//                                         total1 = subTotal - coupan + serviceCharge;
//                                         memberShip = ((total1 * memberShipPer) / 100).toFixed(2);
//                                         cartResponse.memberShip = memberShip;
//                                         cartResponse.memberShipPer = memberShipPer;
//                                         grandTotal = total1 - memberShip;
//                                         cartResponse.grandTotal = parseFloat(grandTotal).toFixed(2);
//                                         cartResponse.serviceAddresss = data1;
//                                         orderObjPaidAmount = orderObjPaidAmount + grandTotal;
//                                         cartResponse._id = new mongoose.Types.ObjectId();
//                                         console.log(cartResponse);
//                                         let saveOrder = await serviceOrder.create(cartResponse);
//                                         serviceOrderId = saveOrder._id;
//                                 }
//                                 if (cartResponse.gifts.length > 0) {
//                                         cartResponse.gifts.forEach(async (cartGift) => {
//                                                 cartGift.total = parseFloat((cartGift.giftId.price * cartGift.quantity).toFixed(2));
//                                                 cartGift.subTotal = parseFloat((cartGift.giftId.price * cartGift.quantity).toFixed(2));
//                                                 cartGift.discount = 0.00;
//                                                 subTotal += cartGift.subTotal;
//                                                 discount += cartGift.discount;
//                                                 total += cartGift.total;
//                                                 let obj = {
//                                                         senderUser: req.user._id,
//                                                         code: cartResponse.orderId,
//                                                         title: 'Buy a gift Card',
//                                                         email: cartGift.email,
//                                                         description: "Your friend Gift a gift card",
//                                                         price: cartGift.giftId.price,
//                                                         discount: cartGift.giftId.giftCardrewards,
//                                                         per: "Amount",
//                                                 }
//                                                 orderObjPaidAmount = orderObjPaidAmount + cartGift.giftId.price;
//                                                 let saveOrder = await coupanModel.create(obj);
//                                                 if (saveOrder) {
//                                                         giftOrderId = saveOrder._id;
//                                                         let orderObj = {
//                                                                 userId: req.user._id,
//                                                                 orderId: orderId,
//                                                                 giftOrder: giftOrderId,
//                                                                 productOrder: productOrderId,
//                                                                 serviceOrder: serviceOrderId,
//                                                                 orderObjPaidAmount: orderObjPaidAmount,
//                                                         }
//                                                         let saveOrder1 = await userOrders.create(orderObj);
//                                                         return res.status(200).json({ msg: "product added to cart", data: saveOrder1 });
//                                                 }
//                                         });
//                                 } else {
//                                         let orderObj = {
//                                                 userId: req.user._id,
//                                                 orderId: orderId,
//                                                 productOrder: productOrderId,
//                                                 serviceOrder: serviceOrderId,
//                                                 orderObjPaidAmount: orderObjPaidAmount,
//                                         }
//                                         let saveOrder1 = await userOrders.create(orderObj);
//                                         return res.status(200).json({ msg: "product added to cart", data: saveOrder1 });
//                                 }
//                         } else {
//                                 return res.status(200).json({ success: false, msg: "Cart is empty", cart: {} });
//                         }
//                 } else {
//                         let findCart = await Cart.findOne({ user: req.user._id }).populate([{ path: "products.productId", select: { reviews: 0 } }, { path: "gifts.giftId", select: { reviews: 0 } }, { path: "AddOnservicesSchema.addOnservicesId", select: { reviews: 0 } }, { path: "services.serviceId", select: { reviews: 0 } }, { path: 'frequentlyBuyProductSchema.frequentlyBuyProductId', populate: { path: 'products', model: 'Product' }, select: { reviews: 0 } }, { path: "coupon", select: "couponCode discount expirationDate" },]);
//                         if (findCart) {
//                                 const data1 = await Address.findOne({ type: "Admin" }).select('address appartment landMark -_id');
//                                 const data2 = await Address.findOne({ user: req.user._id, addressType: "Shipping" }).select('address appartment city state zipCode -_id');
//                                 const data5 = await Address.findOne({ user: req.user._id, addressType: "Billing" }).select('address appartment city state zipCode -_id');
//                                 const data3 = await User.findOne({ _id: req.user._id });
//                                 let discount = 0, couponDiscount = 0, memberShip = 0, shipping = 10, memberShipPer, total1 = 0, total = 0, subTotal = 0, grandTotal = 0, coupan = 0, serviceCharge = 10;
//                                 let orderObjPaidAmount = 0, productOrderId, serviceOrderId, giftOrderId;
//                                 if (findCart.coupon && moment().isAfter(findCart.coupon.expirationDate, "day")) { findCart.coupon = undefined; findCart.save(); }
//                                 const cartResponse = findCart.toObject();
//                                 let orderId = await reffralCode();
//                                 cartResponse.orderId = orderId;
//                                 if (cartResponse.products.length > 0 || cartResponse.frequentlyBuyProductSchema.length > 0) {
//                                         if (data3) {
//                                                 if (data3.isSubscription == true) {
//                                                         const findSubscription = await Subscription.findById(data3.subscriptionId);
//                                                         if (findSubscription) {
//                                                                 memberShipPer = findSubscription.discount
//                                                         }
//                                                 } else {
//                                                         memberShipPer = 0;
//                                                 }
//                                         }
//                                         cartResponse.products.forEach((cartProduct) => {
//                                                 if (cartProduct.productId.multipleSize == true) {
//                                                         for (let i = 0; i < cartProduct.productId.sizePrice.length; i++) {
//                                                                 if ((cartProduct.productId.sizePrice[i]._id == cartProduct.priceId) == true) {
//                                                                         if (cartProduct.productId.discountActive === true) {
//                                                                                 cartProduct.total = parseFloat((cartProduct.productId.price * cartProduct.quantity).toFixed(2));
//                                                                                 cartProduct.subTotal = parseFloat((cartProduct.productId.discountPrice * cartProduct.quantity).toFixed(2));
//                                                                                 cartProduct.discount = parseFloat(((cartProduct.productId.price - cartProduct.productId.discountPrice) * cartProduct.quantity).toFixed(2));
//                                                                         } else {
//                                                                                 cartProduct.total = parseFloat((cartProduct.productId.sizePrice[i].price * cartProduct.quantity).toFixed(2));
//                                                                                 cartProduct.subTotal = parseFloat((cartProduct.productId.sizePrice[i].price * cartProduct.quantity).toFixed(2));
//                                                                                 cartProduct.discount = 0.00;
//                                                                         }
//                                                                         subTotal += cartProduct.subTotal;
//                                                                         discount += cartProduct.discount;
//                                                                         total += cartProduct.total;
//                                                                 }
//                                                         }
//                                                 } else {
//                                                         if (cartProduct.productId.discountActive === true) {
//                                                                 cartProduct.total = parseFloat((cartProduct.productId.price * cartProduct.quantity).toFixed(2));
//                                                                 cartProduct.subTotal = parseFloat((cartProduct.productId.discountPrice * cartProduct.quantity).toFixed(2));
//                                                                 cartProduct.discount = parseFloat(((cartProduct.productId.price - cartProduct.productId.discountPrice) * cartProduct.quantity).toFixed(2));
//                                                         } else {
//                                                                 cartProduct.total = parseFloat((cartProduct.productId.price * cartProduct.quantity).toFixed(2));
//                                                                 cartProduct.subTotal = parseFloat((cartProduct.productId.price * cartProduct.quantity).toFixed(2));
//                                                                 cartProduct.discount = 0.00;
//                                                         }
//                                                         subTotal += cartProduct.subTotal;
//                                                         discount += cartProduct.discount;
//                                                         total += cartProduct.total;
//                                                 }
//                                         });
//                                         cartResponse.frequentlyBuyProductSchema.forEach((cartProduct) => {
//                                                 cartProduct.total = cartProduct.frequentlyBuyProductId.price * cartProduct.quantity;
//                                                 cartProduct.subTotal = cartProduct.frequentlyBuyProductId.price * cartProduct.quantity;
//                                                 cartProduct.discount = 0;
//                                                 subTotal += cartProduct.subTotal;
//                                                 discount += cartProduct.discount;
//                                                 total += cartProduct.total;
//                                         });
//                                         if (cartResponse.coupon) {
//                                                 coupan = 0.01 * findCart.coupon.discount * subTotal;
//                                         }
//                                         cartResponse.total = total;
//                                         cartResponse.discount = discount;
//                                         cartResponse.coupan = couponDiscount;
//                                         cartResponse.subTotal = subTotal;
//                                         if (findCart.pickupFromStore == true) {
//                                                 cartResponse.pickUp = data1;
//                                                 cartResponse.billingAddresss = data5;
//                                                 total1 = subTotal - coupan;
//                                                 memberShip = (total1 * memberShipPer) / 100;
//                                                 cartResponse.memberShip = memberShip;
//                                                 cartResponse.memberShipPer = memberShipPer;
//                                                 grandTotal = total1 - memberShip;
//                                                 cartResponse.grandTotal = grandTotal;
//                                         } else {
//                                                 cartResponse.deliveryAddresss = data2;
//                                                 cartResponse.billingAddresss = data5;
//                                                 cartResponse.shipping = shipping;
//                                                 total1 = subTotal - couponDiscount + shipping;
//                                                 memberShip = (total1 * memberShipPer) / 100;
//                                                 cartResponse.memberShip = memberShip;
//                                                 cartResponse.memberShipPer = memberShipPer;
//                                                 grandTotal = total1 - memberShip;
//                                                 cartResponse.grandTotal = grandTotal;
//                                         }
//                                         orderObjPaidAmount = orderObjPaidAmount + grandTotal;
//                                         cartResponse._id = new mongoose.Types.ObjectId();
//                                         let saveOrder = await productOrder.create(cartResponse);
//                                         productOrderId = saveOrder._id;
//                                 }
//                                 if (cartResponse.services.length > 0 || cartResponse.AddOnservicesSchema.length > 0) {
//                                         if (data3) {
//                                                 if (data3.isSubscription == true) {
//                                                         const findSubscription = await Subscription.findById(data3.subscriptionId);
//                                                         if (findSubscription) {
//                                                                 memberShipPer = findSubscription.discount
//                                                         }
//                                                 } else {
//                                                         memberShipPer = 0;
//                                                 }
//                                         }
//                                         if (cartResponse.services.length > 0) {
//                                                 cartResponse.services.forEach((cartProduct) => {
//                                                         if (cartProduct.serviceId.discountActive == true) {
//                                                                 cartProduct.total = cartProduct.serviceId.price * cartProduct.quantity;
//                                                                 cartProduct.subTotal = cartProduct.serviceId.discountPrice * cartProduct.quantity;
//                                                                 let discount1 = (cartProduct.serviceId.price - cartProduct.serviceId.discountPrice) * cartProduct.quantity;
//                                                                 cartProduct.discount = discount1.toFixed(2)
//                                                         } else {
//                                                                 cartProduct.total = cartProduct.serviceId.price * cartProduct.quantity;
//                                                                 cartProduct.subTotal = cartProduct.serviceId.price * cartProduct.quantity;
//                                                                 cartProduct.discount = discount;
//                                                         }
//                                                         subTotal += cartProduct.subTotal;
//                                                         discount += cartProduct.discount;
//                                                         total += cartProduct.total;
//                                                 });
//                                         }
//                                         if (cartResponse.AddOnservicesSchema.length > 0) {
//                                                 cartResponse.AddOnservicesSchema.forEach((cartGift) => {
//                                                         cartGift.total = cartGift.addOnservicesId.price * cartGift.quantity;
//                                                         cartGift.subTotal = cartGift.addOnservicesId.price * cartGift.quantity;
//                                                         cartGift.discount = 0;
//                                                         subTotal += cartGift.subTotal;
//                                                         discount += cartGift.discount;
//                                                         total += cartGift.total;
//                                                 });
//                                         }
//                                         if (cartResponse.coupon) {
//                                                 coupan = 0.01 * findCart.coupon.discount * subTotal;
//                                         }
//                                         cartResponse.date = findCart.date;
//                                         cartResponse.time = findCart.time;
//                                         cartResponse.suggesstion = findCart.suggesstion;
//                                         cartResponse.total = total;
//                                         cartResponse.discount = Number(discount);
//                                         cartResponse.coupan = coupan;
//                                         cartResponse.subTotal = subTotal;
//                                         cartResponse.serviceCharge = serviceCharge;
//                                         total1 = subTotal - coupan + serviceCharge;
//                                         memberShip = ((total1 * memberShipPer) / 100).toFixed(2);
//                                         cartResponse.memberShip = memberShip;
//                                         cartResponse.memberShipPer = memberShipPer;
//                                         grandTotal = total1 - memberShip;
//                                         cartResponse.grandTotal = parseFloat(grandTotal).toFixed(2);
//                                         cartResponse.serviceAddresss = data1;
//                                         orderObjPaidAmount = orderObjPaidAmount + grandTotal;
//                                         cartResponse._id = new mongoose.Types.ObjectId();
//                                         let saveOrder = await serviceOrder.create(cartResponse);
//                                         serviceOrderId = saveOrder._id;
//                                 }
//                                 if (cartResponse.gifts.length > 0) {
//                                         cartResponse.gifts.forEach(async (cartGift) => {
//                                                 cartGift.total = parseFloat((cartGift.giftId.price * cartGift.quantity).toFixed(2));
//                                                 cartGift.subTotal = parseFloat((cartGift.giftId.price * cartGift.quantity).toFixed(2));
//                                                 cartGift.discount = 0.00;
//                                                 subTotal += cartGift.subTotal;
//                                                 discount += cartGift.discount;
//                                                 total += cartGift.total;
//                                                 let obj = {
//                                                         senderUser: req.user._id,
//                                                         code: cartResponse.orderId,
//                                                         title: 'Buy a gift Card',
//                                                         email: cartGift.email,
//                                                         description: "Your friend Gift a gift card",
//                                                         price: cartGift.giftId.price,
//                                                         discount: cartGift.giftId.giftCardrewards,
//                                                         per: "Amount",
//                                                 }
//                                                 orderObjPaidAmount = orderObjPaidAmount + cartGift.giftId.price;
//                                                 let saveOrder = await coupanModel.create(obj);
//                                                 if (saveOrder) {
//                                                         giftOrderId = saveOrder._id;
//                                                         let orderObj = {
//                                                                 userId: req.user._id,
//                                                                 orderId: orderId,
//                                                                 giftOrder: giftOrderId,
//                                                                 productOrder: productOrderId,
//                                                                 serviceOrder: serviceOrderId,
//                                                                 orderObjPaidAmount: orderObjPaidAmount,
//                                                         }
//                                                         let saveOrder1 = await userOrders.create(orderObj);
//                                                         return res.status(200).json({ msg: "product added to cart", data: saveOrder1 });
//                                                 }
//                                         });
//                                 } else {
//                                         let orderObj = {
//                                                 userId: req.user._id,
//                                                 orderId: orderId,
//                                                 productOrder: productOrderId,
//                                                 serviceOrder: serviceOrderId,
//                                                 orderObjPaidAmount: orderObjPaidAmount,
//                                         }
//                                         let saveOrder1 = await userOrders.create(orderObj);
//                                         return res.status(200).json({ msg: "product added to cart", data: saveOrder1 });
//                                 }
//                         } else {
//                                 return res.status(200).json({ success: false, msg: "Cart is empty", cart: {} });
//                         }
//                 }
//         } catch (error) {
//                 console.log(error);
//                 return res.status(501).send({ status: 501, message: "server error.", data: {}, });
//         }
// };

// exports.placeOrder = async (req, res) => {
//         try {
//                 let findUserOrder = await userOrders.findOne({ orderId: req.params.orderId });
//                 if (findUserOrder) {
//                         let memberShipPer
//                         const data3 = await User.findOne({ _id: req.user._id });
//                         if (data3) {
//                                 if (data3.isSubscription == true) {
//                                         const findSubscription = await Subscription.findById(data3.subscriptionId);
//                                         if (findSubscription) {
//                                                 memberShipPer = Number(findSubscription.discount)
//                                         }
//                                 } else {
//                                         memberShipPer = 0;
//                                 }
//                         }
//                         let line_items = [];
//                         if (findUserOrder.productOrder != (null || undefined)) {
//                                 let discount = 0, total = 0, subTotal = 0;
//                                 let findOrder = await productOrder.findById({ _id: findUserOrder.productOrder }).populate([{ path: "products.productId", select: { reviews: 0 } },
//                                 { path: 'frequentlyBuyProductSchema.frequentlyBuyProductId', populate: { path: 'products', model: 'Product' }, select: { reviews: 0 } },
//                                 { path: "coupon", select: "couponCode discount expirationDate" },]);
//                                 findOrder.products.forEach((cartProduct) => {
//                                         let price;
//                                         if (cartProduct.productId.multipleSize == true) {
//                                                 for (let i = 0; i < cartProduct.productId.sizePrice.length; i++) {
//                                                         if ((cartProduct.productId.sizePrice[i]._id == cartProduct.priceId) == true) {
//                                                                 if (cartProduct.productId.discountActive === true) {
//                                                                         cartProduct.total = parseFloat((cartProduct.productId.price * cartProduct.quantity).toFixed(2));
//                                                                         cartProduct.subTotal = parseFloat((cartProduct.productId.discountPrice * cartProduct.quantity).toFixed(2));
//                                                                         cartProduct.discount = parseFloat(((cartProduct.productId.price - cartProduct.productId.discountPrice) * cartProduct.quantity).toFixed(2));
//                                                                         price = cartProduct.productId.discountPrice * cartProduct.quantity
//                                                                 } else {
//                                                                         cartProduct.total = parseFloat((cartProduct.productId.sizePrice[i].price * cartProduct.quantity).toFixed(2));
//                                                                         cartProduct.subTotal = parseFloat((cartProduct.productId.sizePrice[i].price * cartProduct.quantity).toFixed(2));
//                                                                         cartProduct.discount = 0.00;
//                                                                         price = parseFloat((cartProduct.productId.sizePrice[i].price * cartProduct.quantity).toFixed(2));
//                                                                 }
//                                                                 subTotal += cartProduct.subTotal;
//                                                                 discount += cartProduct.discount;
//                                                                 total += cartProduct.total;
//                                                                 let obj2 = {
//                                                                         price_data: {
//                                                                                 currency: "usd",
//                                                                                 product_data: {
//                                                                                         name: `${cartProduct.productId.name} (${cartProduct.size})`,
//                                                                                 },
//                                                                                 unit_amount: `${Math.round(price * 100)}`,
//                                                                         },
//                                                                         quantity: 1,
//                                                                 }
//                                                                 line_items.push(obj2)
//                                                         }
//                                                 }
//                                         } else {
//                                                 if (cartProduct.productId.discountActive === true) {
//                                                         cartProduct.total = parseFloat((cartProduct.productId.price * cartProduct.quantity).toFixed(2));
//                                                         cartProduct.subTotal = parseFloat((cartProduct.productId.discountPrice * cartProduct.quantity).toFixed(2));
//                                                         cartProduct.discount = parseFloat(((cartProduct.productId.price - cartProduct.productId.discountPrice) * cartProduct.quantity).toFixed(2));
//                                                         price = cartProduct.productId.discountPrice * cartProduct.quantity
//                                                 } else {
//                                                         cartProduct.total = parseFloat((cartProduct.productId.price * cartProduct.quantity).toFixed(2));
//                                                         cartProduct.subTotal = parseFloat((cartProduct.productId.price * cartProduct.quantity).toFixed(2));
//                                                         cartProduct.discount = 0.00;
//                                                         price = cartProduct.productId.price * cartProduct.quantity
//                                                 }
//                                                 subTotal += cartProduct.subTotal;
//                                                 discount += cartProduct.discount;
//                                                 total += cartProduct.total;
//                                                 let obj2 = {
//                                                         price_data: {
//                                                                 currency: "usd",
//                                                                 product_data: {
//                                                                         name: `${cartProduct.productId.name}`,
//                                                                 },
//                                                                 unit_amount: `${Math.round(price * 100)}`,
//                                                         },
//                                                         quantity: 1,
//                                                 }
//                                                 console.log("1805", obj2);
//                                                 line_items.push(obj2)
//                                         }
//                                 });
//                                 findOrder.frequentlyBuyProductSchema.forEach((cartProduct) => {
//                                         let price;
//                                         cartProduct.total = cartProduct.frequentlyBuyProductId.price * cartProduct.quantity;
//                                         cartProduct.subTotal = cartProduct.frequentlyBuyProductId.price * cartProduct.quantity;
//                                         cartProduct.discount = 0;
//                                         subTotal += cartProduct.subTotal;
//                                         discount += cartProduct.discount;
//                                         total += cartProduct.total;
//                                         price = cartProduct.frequentlyBuyProductId.price * cartProduct.quantity
//                                         let obj2 = {
//                                                 price_data: {
//                                                         currency: "usd",
//                                                         product_data: {
//                                                                 name: `Frequently`,
//                                                         },
//                                                         unit_amount: `${Math.round(price * 100)}`,
//                                                 },
//                                                 quantity: 1,
//                                         }
//                                         line_items.push(obj2)
//                                 });
//                                 let delivery = Number(findOrder.shipping);
//                                 let obj3 = {
//                                         price_data: {
//                                                 currency: "usd",
//                                                 product_data: {
//                                                         name: `Delivery Charge`,
//                                                 },
//                                                 unit_amount: `${Math.round(delivery * 100)}`,
//                                         },
//                                         quantity: 1,
//                                 }
//                                 line_items.push(obj3)
//                         }
//                         if (findUserOrder.giftOrder != (null || undefined)) {
//                                 let total = 0, subTotal = 0;
//                                 let findOrder3 = await coupanModel.findById({ _id: findUserOrder.giftOrder, orderStatus: "unconfirmed" });
//                                 let price;
//                                 findOrder3.total = findOrder3.price * 1;
//                                 findOrder3.subTotal = findOrder3.price * 1;
//                                 price = findOrder3.price * 1
//                                 subTotal += findOrder3.subTotal;
//                                 total += findOrder3.total;
//                                 let obj2 = {
//                                         price_data: {
//                                                 currency: "usd",
//                                                 product_data: {
//                                                         name: `${findOrder3.title}`,
//                                                 },
//                                                 unit_amount: `${Math.round(price * 100)}`,
//                                         },
//                                         quantity: 1,
//                                 }
//                                 line_items.push(obj2)
//                         }
//                         if (findUserOrder.serviceOrder != (null || undefined)) {
//                                 let findOrder1 = await serviceOrder.findById({ _id: findUserOrder.serviceOrder }).populate([{ path: "AddOnservicesSchema.addOnservicesId", select: { reviews: 0 } }, { path: "services.serviceId", select: { reviews: 0 } }, { path: "coupon", select: "couponCode discount expirationDate" },]);
//                                 let discount = 0, total = 0, subTotal = 0;
//                                 findOrder1.services.forEach((cartProduct) => {
//                                         let price;
//                                         if (cartProduct.serviceId.discountActive == true) {
//                                                 cartProduct.total = cartProduct.serviceId.price * cartProduct.quantity;
//                                                 cartProduct.subTotal = cartProduct.serviceId.discountPrice * cartProduct.quantity;
//                                                 cartProduct.discount = (cartProduct.serviceId.price - cartProduct.serviceId.discountPrice) * cartProduct.quantity;
//                                                 price = cartProduct.serviceId.discountPrice * cartProduct.quantity
//                                         } else {
//                                                 cartProduct.total = cartProduct.serviceId.price * cartProduct.quantity;
//                                                 cartProduct.subTotal = cartProduct.serviceId.price * cartProduct.quantity;
//                                                 cartProduct.discount = 0;
//                                                 price = cartProduct.serviceId.price * cartProduct.quantity
//                                         }
//                                         subTotal += cartProduct.subTotal;
//                                         discount += cartProduct.discount;
//                                         total += cartProduct.total;
//                                         let obj2 = {
//                                                 price_data: {
//                                                         currency: "usd",
//                                                         product_data: {
//                                                                 name: `${cartProduct.serviceId.name}`,
//                                                         },
//                                                         unit_amount: `${Math.round(price * 100)}`,
//                                                 },
//                                                 quantity: 1,
//                                         }
//                                         line_items.push(obj2)
//                                 });
//                                 findOrder1.AddOnservicesSchema.forEach((cartGift) => {
//                                         let price;
//                                         cartGift.total = cartGift.addOnservicesId.price * cartGift.quantity;
//                                         cartGift.subTotal = cartGift.addOnservicesId.price * cartGift.quantity;
//                                         cartGift.discount = 0;
//                                         subTotal += cartGift.subTotal;
//                                         discount += cartGift.discount;
//                                         total += cartGift.total;
//                                         price = cartGift.addOnservicesId.price * cartGift.quantity
//                                         let obj2 = {
//                                                 price_data: {
//                                                         currency: "usd",
//                                                         product_data: {
//                                                                 name: `${cartGift.addOnservicesId.name}`,
//                                                         },
//                                                         unit_amount: `${Math.round(price * 100)}`,
//                                                 },
//                                                 quantity: 1,
//                                         }
//                                         line_items.push(obj2)
//                                 });
//                                 let delivery = Number(findOrder1.serviceCharge);
//                                 let obj4 = {
//                                         price_data: {
//                                                 currency: "usd",
//                                                 product_data: {
//                                                         name: `Service Charge`,
//                                                 },
//                                                 unit_amount: `${Math.round(delivery * 100)}`,
//                                         },
//                                         quantity: 1,
//                                 }
//                                 line_items.push(obj4)
//                         }
//                         if (memberShipPer > 0) {
//                                 const couponId = await stripe.coupons.create({
//                                         name: "Member Ship Discount",
//                                         percent_off: memberShipPer,
//                                         duration: "once",
//                                 })
//                                 const session = await stripe.checkout.sessions.create({
//                                         payment_method_types: ["card"],
//                                         success_url: `https://shahina-web.vercel.app/thanks/${findUserOrder.orderId}`,
//                                         cancel_url: `https://shahina-web.vercel.app/failed/${findUserOrder.orderId}`,
//                                         customer_email: req.user.email,
//                                         client_reference_id: findUserOrder.orderId,
//                                         line_items: line_items,
//                                         mode: "payment",
//                                         discounts: [
//                                                 {
//                                                         coupon: couponId.id, // Replace with your coupon ID
//                                                 },
//                                         ],
//                                 });
//                                 return res.status(200).json({ status: "success", session: session, });
//                         } else {
//                                 const session = await stripe.checkout.sessions.create({
//                                         payment_method_types: ["card"],
//                                         success_url: `https://shahina-web.vercel.app/thanks/${findUserOrder.orderId}`,
//                                         cancel_url: `https://shahina-web.vercel.app/failed/${findUserOrder.orderId}`,
//                                         customer_email: req.user.email,
//                                         client_reference_id: findUserOrder.orderId,
//                                         line_items: line_items,
//                                         mode: "payment",
//                                 });
//                                 return res.status(200).json({ status: "success", session: session, });
//                         }

//                 } else {
//                         return res.status(404).json({ message: "No data found", data: {} });
//                 }
//         } catch (error) {
//                 console.log(error);
//                 return res.status(501).send({ status: 501, message: "server error.", data: {}, });
//         }
// };
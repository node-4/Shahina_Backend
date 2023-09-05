const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authConfig = require("../configs/auth.config");
var newOTP = require("otp-generators");
const User = require("../models/userModel");
exports.registration = async (req, res) => {
        try {
                const user = await User.findOne({ _id: req.user._id });
                if (user) {
                        if (req.body.refferalCode == null || req.body.refferalCode == undefined) {
                                req.body.otp = newOTP.generate(4, { alphabets: false, upperCase: false, specialChar: false, });
                                req.body.otpExpiration = new Date(Date.now() + 5 * 60 * 1000);
                                req.body.accountVerification = false;
                                req.body.refferalCode = await reffralCode();
                                const userCreate = await User.findOneAndUpdate({ _id: user._id }, req.body, { new: true, });
                                let obj = { id: userCreate._id, phone: userCreate.phone }
                                return res.status(200).send({ status: 200, message: "Registered successfully ", data: obj, });
                        } else {
                                const findUser = await User.findOne({ refferalCode: req.body.refferalCode });
                                if (findUser) {
                                        req.body.otp = newOTP.generate(4, { alphabets: false, upperCase: false, specialChar: false, });
                                        req.body.otpExpiration = new Date(Date.now() + 5 * 60 * 1000);
                                        req.body.accountVerification = false;
                                        req.body.userType = "USER";
                                        req.body.refferalCode = await reffralCode();
                                        req.body.refferUserId = findUser._id;
                                        const userCreate = await User.findOneAndUpdate({ _id: user._id }, req.body, { new: true, });
                                        if (userCreate) {
                                                let updateWallet = await User.findOneAndUpdate({ _id: findUser._id }, { $push: { joinUser: userCreate._id } }, { new: true });
                                                let obj = { id: userCreate._id, phone: userCreate.phone }
                                                return res.status(200).send({ status: 200, message: "Registered successfully ", data: obj, });
                                        }
                                } else {
                                        return res.status(404).send({ status: 404, message: "Invalid refferal code", data: {} });
                                }
                        }
                } else {
                        return res.status(404).send({ status: 404, msg: "Not found" });
                }
        } catch (error) {
                console.error(error);
                return res.status(500).json({ message: "Server error" });
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
exports.loginWithPhone = async (req, res) => {
        try {
                const { phone } = req.body;
                const user = await User.findOne({ phone: phone, userType: "USER" });
                if (!user) {
                        let otp = newOTP.generate(4, { alphabets: false, upperCase: false, specialChar: false, });
                        let otpExpiration = new Date(Date.now() + 5 * 60 * 1000);
                        let accountVerification = false;
                        const newUser = await User.create({ phone: phone, otp, otpExpiration, accountVerification, userType: "USER" });
                        let obj = { id: newUser._id, otp: newUser.otp, phone: newUser.phone }
                        return res.status(200).send({ status: 200, message: "logged in successfully", data: obj });
                } else {
                        const userObj = {};
                        userObj.otp = newOTP.generate(4, { alphabets: false, upperCase: false, specialChar: false, });
                        userObj.otpExpiration = new Date(Date.now() + 5 * 60 * 1000);
                        userObj.accountVerification = false;
                        const updated = await User.findOneAndUpdate({ phone: phone, userType: "USER" }, userObj, { new: true, });
                        let obj = { id: updated._id, otp: updated.otp, phone: updated.phone }
                        return res.status(200).send({ status: 200, message: "logged in successfully", data: obj });
                }
        } catch (error) {
                console.error(error);
                return res.status(500).json({ message: "Server error" });
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
                        completeProfile: updated.completeProfile
                }
                return res.status(200).send({ status: 200, message: "logged in successfully", data: obj });
        } catch (err) {
                console.log(err.message);
                return res.status(500).send({ error: "internal server error" + err.message });
        }
};
exports.getProfile = async (req, res) => {
        try {
                const data = await User.findOne({ _id: req.user._id, }).select('fullName email phone gender alternatePhone dob address1 address2 image refferalCode');
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
                                fullName: req.body.fullName || data.fullName,
                                email: req.body.email || data.email,
                                phone: req.body.phone || data.phone,
                                gender: req.body.gender || data.gender,
                                alternatePhone: req.body.alternatePhone || data.alternatePhone,
                                dob: req.body.dob || data.dob,
                                address1: req.body.address1 || data.address1,
                                address2: req.body.address2 || data.address2,
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
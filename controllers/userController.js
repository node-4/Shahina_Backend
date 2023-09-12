const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authConfig = require("../configs/auth.config");
var newOTP = require("otp-generators");
const Subscription = require("../models/subscription");
const banner = require("../models/bannerModel");
const Gallary = require("../models/gallary");
const User = require("../models/Auth/userModel");
const Category = require("../models/Service/Category")
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
const coupan = require("../models/Auth/coupan");
const Address = require("../models/Auth/addrees");
const moment = require("moment")

exports.registration = async (req, res) => {
        try {
                if (req.body.refferalCode == null || req.body.refferalCode == undefined) {
                        req.body.otp = newOTP.generate(4, { alphabets: false, upperCase: false, specialChar: false, });
                        req.body.otpExpiration = new Date(Date.now() + 5 * 60 * 1000);
                        req.body.accountVerification = false;
                        req.body.refferalCode = await reffralCode();
                        req.body.password = bcrypt.hashSync(req.body.password, 8);
                        req.body.userType = "USER";
                        const userCreate = await User.create(req.body);
                        return res.status(200).send({ status: 200, message: "Registered successfully ", data: userCreate, });
                } else {
                        const findUser = await User.findOne({ refferalCode: req.body.refferalCode });
                        if (findUser) {
                                req.body.otp = newOTP.generate(4, { alphabets: false, upperCase: false, specialChar: false, });
                                req.body.otpExpiration = new Date(Date.now() + 5 * 60 * 1000);
                                req.body.accountVerification = false;
                                req.body.userType = "USER";
                                req.body.refferalCode = await reffralCode();
                                req.body.refferUserId = findUser._id;
                                req.body.password = bcrypt.hashSync(req.body.password, 8);
                                const userCreate = await User.create(req.body);
                                if (userCreate) {
                                        let updateWallet = await User.findOneAndUpdate({ _id: findUser._id }, { $push: { joinUser: userCreate._id } }, { new: true });
                                        return res.status(200).send({ status: 200, message: "Registered successfully ", data: userCreate, });
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
                        // var transporter = nodemailer.createTransport({
                        //         service: 'gmail',
                        //         auth: {
                        //                 "user": "krishvapes@gmail.com",
                        //                 "pass": "fggmdyhrilxhmyig"
                        //         }
                        // });
                        // let mailOptions;
                        // mailOptions = {
                        //         from: 'krishvapes@gmail.com',
                        //         to: req.body.email,
                        //         subject: 'Forget password verification',
                        //         text: `Your Account Verification Code is ${otp}`,
                        // };
                        // let info = await transporter.sendMail(mailOptions);
                        // if (info) {
                        let accountVerification = false;
                        let otpExpiration = new Date(Date.now() + 5 * 60 * 1000);
                        const updated = await User.findOneAndUpdate({ _id: data._id }, { $set: { accountVerification: accountVerification, otp: otp, otpExpiration: otpExpiration } }, { new: true, });
                        if (updated) {
                                res.status(200).json({ message: "Otp send to your email.", status: 200, data: updated._id });
                        }
                        // } else {
                        //         res.status(200).json({ message: "Otp not send on your mail please check.", status: 200, data: {} });
                        // }
                }
        } catch (err) {
                console.log(err.message);
                return res.status(500).send({ msg: "internal server error", error: err.message, });
        }
};
exports.forgotVerifyotp = async (req, res) => {
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
                const data = await User.findOne({ _id: req.user._id, }).select('-password');
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
                                const data1 = await Address.findOne({ admin: data._id });
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
                                const data1 = await Address.findOne({ user: data._id });
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
exports.addToCart = async (req, res, next) => {
        try {
                const product = req.params.id;
                const data = await product.findById(req.params.id)
                if (!data || data.length === 0) {
                        return res.status(400).send({ msg: "Product not found" });
                }
                let cart = await Cart.findOne({ user: req.user._id, });
                if (!cart) {
                        let products = [];
                        let obj = { productId: data._id, quantity: 1 };
                        products.push(obj)
                        cart = await Cart.create({ user: req.user._id, products: products });
                        return res.status(200).json({ msg: "product added to cart", data: cart });
                } else {
                        if (cart.services.length == 0) {
                                const productIndex = cart.products.findIndex((cartProduct) => { return cartProduct.product.toString() == product; });
                                if (productIndex < 0) {
                                        cart.products.push({ product });
                                } else {
                                        cart.products[productIndex].quantity++;
                                }
                                await cart.save();
                                return res.status(200).json({ msg: "product added to cart", });
                        } else {
                                return res.status(200).json({ msg: "First Remove service from cart.", });
                        }
                }
        } catch (error) {
                next(error);
        }
};
exports.getCart = async (req, res, next) => {
        try {
                const cart = await Cart.findOne({ user: req.user._id });
                if (!cart) {
                        return res.status(200).json({ success: false, msg: "cart", cart: {} })
                } else {
                        const cartResponse = await getCartResponse(cart, req.user._id);
                        return res.status(200).json({ success: true, msg: "cart", cart: cartResponse })
                }
        } catch (error) {
                console.log(error)
                next(error);
        }
}
exports.addServiceToCart = async (req, res, next) => {
        try {
                const serviceId = req.params.id;
                let cart = await Cart.findOne({ user: req.user._id, });
                if (!cart) {
                        let services = [];
                        let obj = { serviceId: serviceId, quantity: 1 };
                        services.push(obj)
                        cart = await Cart.create({ user: req.user._id, services: services });
                        return res.status(200).json({ msg: "service added to cart", data: cart });
                } else {
                        if (cart.products.length == 0) {
                                const productIndex = cart.services.findIndex((cartService) => { return cartService.serviceId.toString() == serviceId; });
                                console.log(productIndex);
                                if (productIndex < 0) {
                                        cart.services.push({ services });
                                } else {
                                        cart.services[productIndex].quantity++;
                                }
                                await cart.save();
                                return res.status(200).json({ msg: "service added to cart", data: cart });
                        } else {
                                return res.status(200).json({ msg: "First Remove Product from cart.", });
                        }
                }

        } catch (error) {
                next(error);
        }
};
const getCartResponse = async (cart, userId) => {
        try {
                await cart.populate([{ path: "products.productId", select: { reviews: 0 } }, { path: "services.serviceId", select: { reviews: 0 } }, { path: "coupon", select: "couponCode discount expirationDate" },]);
                const data1 = await Address.findOne({ type: "Admin" }).select('houseFlat appartment landMark -_id');
                const data2 = await Address.findOne({ user: userId }).select('houseFlat appartment landMark -_id');
                if (cart.coupon && moment().isAfter(cart.coupon.expirationDate, "day")) { cart.coupon = undefined; cart.save(); }
                const cartResponse = cart.toObject();
                let discount = 0, coupan = 0, memberShip = 0, shipping = 10, memberShipPer = 10;
                let total1 = 0, total = 0, subTotal = 0, grandTotal = 0;
                cartResponse.products.forEach((cartProduct) => {
                        if (cartProduct.productId.discountActive == true) {
                                cartProduct.total = cartProduct.productId.price * cartProduct.quantity;
                                cartProduct.subTotal = cartProduct.productId.discountPrice * cartProduct.quantity;
                                cartProduct.discount = (cartProduct.productId.price - cartProduct.productId.discountPrice) * cartProduct.quantity;
                        }
                        subTotal += cartProduct.subTotal;
                        discount += cartProduct.discount;
                        total += cartProduct.total;
                });
                cartResponse.services.forEach((cartProduct) => {
                        if (cartProduct.serviceId.discountActive == true) {
                                cartProduct.total = cartProduct.serviceId.price * cartProduct.quantity;
                                cartProduct.subTotal = cartProduct.serviceId.discountPrice * cartProduct.quantity;
                                cartProduct.discount = (cartProduct.serviceId.price - cartProduct.serviceId.discountPrice) * cartProduct.quantity;
                        }
                        subTotal += cartProduct.subTotal;
                        discount += cartProduct.discount;
                        total += cartProduct.total;
                });
                if (cartResponse.coupon) {
                        coupan = 0.01 * cart.coupon.discount * subTotal;
                }
                cartResponse.total = total;
                cartResponse.discount = discount;
                cartResponse.coupan = coupan;
                cartResponse.subTotal = subTotal;
                cartResponse.shipping = shipping;
                total1 = subTotal - coupan + shipping;
                memberShip = (total1 * memberShipPer) / 100;
                cartResponse.memberShip = memberShip;
                cartResponse.memberShipPer = memberShipPer;
                grandTotal = total1 - memberShip;
                cartResponse.grandTotal = grandTotal;
                if(cart.pickupFromStore == true){
                        cartResponse.pickUp = data1;
                }else{
                        cartResponse.deliveryAddresss = data2;
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
const ticketCode = async () => {
        var digits = "0123456789012345678901234567890123456789";
        let OTP = '';
        for (let i = 0; i < 8; i++) {
                OTP += digits[Math.floor(Math.random() * 36)];
        }
        return OTP;
}
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
const cartService = require("../models/Auth/cartService");
const coupan = require("../models/Auth/coupan");
const Address = require("../models/Auth/addrees");
const serviceOrder = require("../models/Auth/serviceOrder");
const productOrder = require("../models/Auth/productOrder");
const transactionModel = require("../models/transactionModel");
const frequentlyBuyProduct = require("../models/frequentlyBuyProduct");
const addOnservices = require("../models/Service/addOnservices");
const giftCard = require("../models/giftCard");
const moment = require("moment")
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
                                return res.status(200).send({ status: 200, message: "Registered successfully ", data: userCreate, });
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
                                                let updateWallet = await User.findOneAndUpdate({ _id: findUser._id }, { $push: { joinUser: userCreate._id }, $set: { wallet: findUser.wallet + 300 } }, { new: true });
                                                return res.status(200).send({ status: 200, message: "Registered successfully ", data: userCreate, });
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
                        // var transporter = nodemailer.createTransport({
                        //         service: 'gmail',
                        //         auth: {
                        //                 "user": "info@shahinahoja.com",
                        //                 "pass": "gganlypsemwqhwlh"
                        //         }
                        // });
                        // let mailOptions;
                        // mailOptions = {
                        //         from: 'info@shahinahoja.com',
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
                                return res.status(200).json({ message: "Otp send to your email.", status: 200, data: updated });
                        }
                        // } else {
                        //    return     res.status(200).json({ message: "Otp not send on your mail please check.", status: 200, data: {} });
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
/////////////////////////////////////////////////////////////////////////////////////////// Product Cart Start ////////////////////////////////////////////////////////////////////
exports.addToCart = async (req, res, next) => {
        try {
                const productId = req.params.id;
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
                        const productIndex = cart.products.findIndex((cartProduct) => { return cartProduct.productId.toString() == productId; });
                        if (productIndex < 0) {
                                cart.products.push({ productId });
                        } else {
                                cart.products[productIndex].quantity++;
                        }
                        await cart.save();
                        return res.status(200).json({ msg: "product added to cart", data: cart });
                }
        } catch (error) {
                next(error);
        }
};
exports.addFBPToCart = async (req, res, next) => {
        try {
                const frequentlyBuyProductId = req.params.id;
                const data = await frequentlyBuyProduct.findById(req.params.id)
                if (!data || data.length === 0) {
                        return res.status(400).send({ msg: "Frequently Buy Product not found" });
                }
                let cart = await Cart.findOne({ user: req.user._id, });
                if (!cart) {
                        let frequentlyBuyProductSchema = [];
                        let obj = { frequentlyBuyProductId: data._id, quantity: 1 };
                        frequentlyBuyProductSchema.push(obj)
                        cart = await Cart.create({ user: req.user._id, frequentlyBuyProductSchema: frequentlyBuyProductSchema });
                        return res.status(200).json({ msg: "Frequently Buy Product added to cart", data: cart });
                } else {
                        const productIndex = cart.frequentlyBuyProductSchema.findIndex((cartProduct) => { return cartProduct.frequentlyBuyProductId.toString() == frequentlyBuyProductId; });
                        if (productIndex < 0) {
                                cart.frequentlyBuyProductSchema.push({ frequentlyBuyProductId });
                        } else {
                                cart.frequentlyBuyProductSchema[productIndex].quantity++;
                        }
                        await cart.save();
                        return res.status(200).json({ msg: "Frequently Buy Product added to cart", data: cart });
                }
        } catch (error) {
                next(error);
        }
};
exports.addGiftCardToCart = async (req, res, next) => {
        try {
                const giftId = req.params.id;
                const data = await giftCard.findById(req.params.id)
                if (!data || data.length === 0) {
                        return res.status(400).send({ msg: "GiftCard not found" });
                }
                let cart = await Cart.findOne({ user: req.user._id, });
                if (!cart) {
                        let gifts = [];
                        let obj = { giftId: data._id, quantity: 1 };
                        gifts.push(obj)
                        cart = await Cart.create({ user: req.user._id, gifts: gifts });
                        return res.status(200).json({ msg: "GiftCard added to cart", data: cart });
                } else {
                        const giftIndex = cart.gifts.findIndex((cartGift) => { return cartGift.giftId.toString() == giftId; });
                        if (giftIndex < 0) {
                                cart.gifts.push({ giftId });
                        } else {
                                cart.gifts[giftIndex].quantity++;
                        }
                        await cart.save();
                        return res.status(200).json({ msg: "GiftCard added to cart", });
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
exports.checkoutForProduct = async (req, res) => {
        try {
                let findOrder = await productOrder.find({ user: req.user._id, orderStatus: "unconfirmed" });
                if (findOrder.length > 0) {
                        for (let i = 0; i < findOrder.length; i++) {
                                console.log("-----------");
                                await productOrder.findByIdAndDelete({ _id: findOrder[i]._id });
                        }
                        let findCart = await Cart.findOne({ user: req.user._id }).populate([{ path: "products.productId", select: { reviews: 0 } }, { path: "gifts.giftId", select: { reviews: 0 } }, { path: "frequentlyBuyProductSchema.frequentlyBuyProductId", select: { reviews: 0 } }, { path: "coupon", select: "couponCode discount expirationDate" },]);
                        if (findCart) {
                                const data1 = await Address.findOne({ type: "Admin" }).select('houseFlat appartment landMark -_id');
                                const data2 = await Address.findOne({ user: req.user._id }).select('houseFlat appartment landMark -_id');
                                const data3 = await User.findOne({ _id: req.user._id })
                                let discount = 0, coupan = 0, memberShip = 0, shipping = 10, memberShipPer, total1 = 0, total = 0, subTotal = 0, grandTotal = 0;
                                if (data3) {
                                        if (data3.isSubscription == true) {
                                                const findSubscription = await Subscription.findById(data3.subscriptionId);
                                                if (findSubscription) {
                                                        memberShipPer = findSubscription.discount
                                                }
                                        } else {
                                                memberShipPer = 0;
                                        }
                                }
                                if (findCart.coupon && moment().isAfter(findCart.coupon.expirationDate, "day")) { findCart.coupon = undefined; findCart.save(); }
                                const cartResponse = findCart.toObject();
                                cartResponse.products.forEach((cartProduct) => {
                                        if (cartProduct.productId.discountActive == true) {
                                                cartProduct.total = cartProduct.productId.price * cartProduct.quantity;
                                                cartProduct.subTotal = cartProduct.productId.discountPrice * cartProduct.quantity;
                                                cartProduct.discount = (cartProduct.productId.price - cartProduct.productId.discountPrice) * cartProduct.quantity;
                                        } else {
                                                cartProduct.total = cartProduct.productId.price * cartProduct.quantity;
                                                cartProduct.subTotal = cartProduct.productId.price * cartProduct.quantity;
                                                cartProduct.discount = 0;
                                        }
                                        subTotal += cartProduct.subTotal;
                                        discount += cartProduct.discount;
                                        total += cartProduct.total;
                                });
                                cartResponse.gifts.forEach((cartGift) => {
                                        if (cartGift.giftId.discountActive == true) {
                                                cartGift.total = cartGift.giftId.price * cartGift.quantity;
                                                cartGift.subTotal = cartGift.giftId.discountPrice * cartGift.quantity;
                                                cartGift.discount = (cartGift.giftId.price - cartGift.giftId.discountPrice) * cartGift.quantity;
                                        } else {
                                                cartGift.total = cartGift.giftId.price * cartGift.quantity;
                                                cartGift.subTotal = cartGift.giftId.price * cartGift.quantity;
                                                cartGift.discount = 0;
                                        }
                                        subTotal += cartGift.subTotal;
                                        discount += cartGift.discount;
                                        total += cartGift.total;
                                });
                                cartResponse.frequentlyBuyProductSchema.forEach((cartProduct) => {
                                        cartProduct.total = cartProduct.frequentlyBuyProductId.price * cartProduct.quantity;
                                        cartProduct.subTotal = cartProduct.frequentlyBuyProductId.price * cartProduct.quantity;
                                        cartProduct.discount = 0;
                                        subTotal += cartProduct.subTotal;
                                        discount += cartProduct.discount;
                                        total += cartProduct.total;
                                });
                                if (cartResponse.coupon) {
                                        coupan = 0.01 * findCart.coupon.discount * subTotal;
                                }
                                cartResponse.total = total;
                                cartResponse.discount = discount;
                                cartResponse.coupan = coupan;
                                cartResponse.subTotal = subTotal;
                                if (findCart.pickupFromStore == true) {
                                        cartResponse.pickUp = data1;
                                        total1 = subTotal - coupan;
                                        memberShip = (total1 * memberShipPer) / 100;
                                        cartResponse.memberShip = memberShip;
                                        cartResponse.memberShipPer = memberShipPer;
                                        grandTotal = total1 - memberShip;
                                        cartResponse.grandTotal = grandTotal;
                                } else {
                                        cartResponse.deliveryAddresss = data2;
                                        cartResponse.shipping = shipping;
                                        total1 = subTotal - coupan + shipping;
                                        memberShip = (total1 * memberShipPer) / 100;
                                        cartResponse.memberShip = memberShip;
                                        cartResponse.memberShipPer = memberShipPer;
                                        grandTotal = total1 - memberShip;
                                        cartResponse.grandTotal = grandTotal;
                                }
                                cartResponse.orderId = await reffralCode();
                                let saveOrder = await productOrder.create(cartResponse);
                                return res.status(200).json({ msg: "product added to cart", data: saveOrder });
                        }
                } else {
                        let findCart = await Cart.findOne({ user: req.user._id }).populate([{ path: "products.productId", select: { reviews: 0 } }, { path: "gifts.giftId", select: { reviews: 0 } }, { path: "frequentlyBuyProductSchema.frequentlyBuyProductId", select: { reviews: 0 } }, { path: "coupon", select: "couponCode discount expirationDate" },]);
                        if (findCart) {
                                const data1 = await Address.findOne({ type: "Admin" }).select('houseFlat appartment landMark -_id');
                                const data2 = await Address.findOne({ user: req.user._id }).select('houseFlat appartment landMark -_id');
                                const data3 = await User.findOne({ _id: req.user._id })
                                let discount = 0, coupan = 0, memberShip = 0, shipping = 10, memberShipPer, total1 = 0, total = 0, subTotal = 0, grandTotal = 0;
                                if (data3) {
                                        if (data3.isSubscription == true) {
                                                const findSubscription = await Subscription.findById(data3.subscriptionId);
                                                if (findSubscription) {
                                                        memberShipPer = findSubscription.discount
                                                }
                                        } else {
                                                memberShipPer = 0;
                                        }
                                }
                                if (findCart.coupon && moment().isAfter(findCart.coupon.expirationDate, "day")) { findCart.coupon = undefined; findCart.save(); }
                                const cartResponse = findCart.toObject();
                                cartResponse.products.forEach((cartProduct) => {
                                        if (cartProduct.productId.discountActive == true) {
                                                cartProduct.total = cartProduct.productId.price * cartProduct.quantity;
                                                cartProduct.subTotal = cartProduct.productId.discountPrice * cartProduct.quantity;
                                                cartProduct.discount = (cartProduct.productId.price - cartProduct.productId.discountPrice) * cartProduct.quantity;
                                        } else {
                                                cartProduct.total = cartProduct.productId.price * cartProduct.quantity;
                                                cartProduct.subTotal = cartProduct.productId.price * cartProduct.quantity;
                                                cartProduct.discount = 0;
                                        }
                                        subTotal += cartProduct.subTotal;
                                        discount += cartProduct.discount;
                                        total += cartProduct.total;
                                });
                                cartResponse.gifts.forEach((cartGift) => {
                                        if (cartGift.giftId.discountActive == true) {
                                                cartGift.total = cartGift.giftId.price * cartGift.quantity;
                                                cartGift.subTotal = cartGift.giftId.discountPrice * cartGift.quantity;
                                                cartGift.discount = (cartGift.giftId.price - cartGift.giftId.discountPrice) * cartGift.quantity;
                                        } else {
                                                cartGift.total = cartGift.giftId.price * cartGift.quantity;
                                                cartGift.subTotal = cartGift.giftId.price * cartGift.quantity;
                                                cartGift.discount = 0;
                                        }
                                        subTotal += cartGift.subTotal;
                                        discount += cartGift.discount;
                                        total += cartGift.total;
                                });
                                cartResponse.frequentlyBuyProductSchema.forEach((cartProduct) => {
                                        cartProduct.total = cartProduct.frequentlyBuyProductId.price * cartProduct.quantity;
                                        cartProduct.subTotal = cartProduct.frequentlyBuyProductId.price * cartProduct.quantity;
                                        cartProduct.discount = 0;
                                        subTotal += cartProduct.subTotal;
                                        discount += cartProduct.discount;
                                        total += cartProduct.total;
                                });
                                if (cartResponse.coupon) {
                                        coupan = 0.01 * findCart.coupon.discount * subTotal;
                                }
                                cartResponse.total = total;
                                cartResponse.discount = discount;
                                cartResponse.coupan = coupan;
                                cartResponse.subTotal = subTotal;
                                if (findCart.pickupFromStore == true) {
                                        cartResponse.pickUp = data1;
                                        total1 = subTotal - coupan;
                                        memberShip = (total1 * memberShipPer) / 100;
                                        cartResponse.memberShip = memberShip;
                                        cartResponse.memberShipPer = memberShipPer;
                                        grandTotal = total1 - memberShip;
                                        cartResponse.grandTotal = grandTotal;
                                } else {
                                        cartResponse.deliveryAddresss = data2;
                                        cartResponse.shipping = shipping;
                                        total1 = subTotal - coupan + shipping;
                                        memberShip = (total1 * memberShipPer) / 100;
                                        cartResponse.memberShip = memberShip;
                                        cartResponse.memberShipPer = memberShipPer;
                                        grandTotal = total1 - memberShip;
                                        cartResponse.grandTotal = grandTotal;
                                }
                                cartResponse.orderId = await reffralCode();
                                let saveOrder = await productOrder.create(cartResponse);
                                return res.status(200).json({ msg: "product added to cart", data: saveOrder });
                        }
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.placeOrderForProduct = async (req, res) => {
        try {
                let findUserOrder = await productOrder.findOne({ orderId: req.params.orderId }).populate([{ path: "products.productId", select: { reviews: 0 } }, { path: "gifts.giftId", select: { reviews: 0 } }, { path: "frequentlyBuyProductSchema.frequentlyBuyProductId", select: { reviews: 0 } }, { path: "coupon", select: "couponCode discount expirationDate" },]);
                if (findUserOrder) {
                        let line_items = [];
                        const cartResponse = findUserOrder.toObject();
                        let discount = 0, total = 0, subTotal = 0;
                        cartResponse.products.forEach((cartProduct) => {
                                let price;
                                if (cartProduct.productId.discountActive == true) {
                                        cartProduct.total = cartProduct.productId.price * cartProduct.quantity;
                                        cartProduct.subTotal = cartProduct.productId.discountPrice * cartProduct.quantity;
                                        cartProduct.discount = (cartProduct.productId.price - cartProduct.productId.discountPrice) * cartProduct.quantity;
                                        price = cartProduct.productId.discountPrice * cartProduct.quantity
                                } else {
                                        cartProduct.total = cartProduct.productId.price * cartProduct.quantity;
                                        cartProduct.subTotal = cartProduct.productId.price * cartProduct.quantity;
                                        cartProduct.discount = 0;
                                        price = cartProduct.productId.price * cartProduct.quantity
                                }
                                subTotal += cartProduct.subTotal;
                                discount += cartProduct.discount;
                                total += cartProduct.total;
                                let obj2 = {
                                        price_data: {
                                                currency: "inr",
                                                product_data: {
                                                        name: `${cartProduct.productId.name}`,
                                                },
                                                unit_amount: `${Math.round(price * 100)}`,
                                        },
                                        quantity: 1,
                                }
                                line_items.push(obj2)
                        });
                        cartResponse.gifts.forEach((cartGift) => {
                                let price;
                                if (cartGift.giftId.discountActive == true) {
                                        cartGift.total = cartGift.giftId.price * cartGift.quantity;
                                        cartGift.subTotal = cartGift.giftId.discountPrice * cartGift.quantity;
                                        cartGift.discount = (cartGift.giftId.price - cartGift.giftId.discountPrice) * cartGift.quantity;
                                        price = cartGift.giftId.discountPrice * cartGift.quantity
                                } else {
                                        cartGift.total = cartGift.giftId.price * cartGift.quantity;
                                        cartGift.subTotal = cartGift.giftId.price * cartGift.quantity;
                                        cartGift.discount = 0;
                                        price = cartGift.giftId.price * cartGift.quantity
                                }
                                subTotal += cartGift.subTotal;
                                discount += cartGift.discount;
                                total += cartGift.total;
                                let obj2 = {
                                        price_data: {
                                                currency: "inr",
                                                product_data: {
                                                        name: `${cartGift.giftId.name}`,
                                                },
                                                unit_amount: `${Math.round(price * 100)}`,
                                        },
                                        quantity: 1,
                                }
                                line_items.push(obj2)
                        });
                        cartResponse.frequentlyBuyProductSchema.forEach((cartProduct) => {
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
                                                currency: "inr",
                                                product_data: {
                                                        name: `Frequently`,
                                                },
                                                unit_amount: `${Math.round(price * 100)}`,
                                        },
                                        quantity: 1,
                                }
                                line_items.push(obj2)
                        });
                        let delivery = Number(findUserOrder.shipping);
                        let obj3 = {
                                price_data: {
                                        currency: "inr",
                                        product_data: {
                                                name: `Delivery Charge`,
                                        },
                                        unit_amount: `${Math.round(delivery * 100)}`,
                                },
                                quantity: 1,
                        }
                        line_items.push(obj3)
                        const session = await stripe.checkout.sessions.create({
                                payment_method_types: ["card"],
                                success_url: `https://krishwholesale.co.uk/order-success/${findUserOrder.orderId}`,
                                cancel_url: `https://krishwholesale.co.uk/order-failure/${findUserOrder.orderId}`,
                                customer_email: req.user.email,
                                client_reference_id: findUserOrder.orderId,
                                line_items: line_items,
                                mode: "payment",
                        });
                        return res.status(200).json({ status: "success", session: session, });
                } else {
                        return res.status(404).json({ message: "No data found", data: {} });
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.cancelOrderForProduct = async (req, res) => {
        try {
                let findUserOrder = await productOrder.findOne({ orderId: req.params.orderId });
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
exports.successOrderForProduct = async (req, res) => {
        try {
                let findUserOrder = await productOrder.findOne({ orderId: req.params.orderId });
                if (findUserOrder) {
                        const user = await User.findById({ _id: findUserOrder.user });
                        if (!user) {
                                return res.status(404).send({ status: 404, message: "User not found or token expired." });
                        }
                        let update = await productOrder.findByIdAndUpdate({ _id: findUserOrder._id }, { $set: { orderStatus: "confirmed", paymentStatus: "paid" } }, { new: true });
                        let deleteCart = await Cart.findOneAndDelete({ user: findUserOrder.user });
                        if (deleteCart) {
                                return res.status(200).json({ message: "Payment success.", status: 200, data: update });
                        }
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
                const orders = await productOrder.find({ user: req.user._id, orderStatus: "confirmed" }).populate([{ path: "products.productId", select: { reviews: 0 } }, { path: "gifts.giftId", select: { reviews: 0 } }, { path: "frequentlyBuyProductSchema.frequentlyBuyProductId", select: { reviews: 0 } }, { path: "coupon", select: "couponCode discount expirationDate" },]);
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
                const orders = await productOrder.findById({ _id: req.params.id }).populate([{ path: "products.productId", select: { reviews: 0 } }, { path: "gifts.giftId", select: { reviews: 0 } }, { path: "frequentlyBuyProductSchema.frequentlyBuyProductId", select: { reviews: 0 } }, { path: "coupon", select: "couponCode discount expirationDate" },]);
                if (!orders) {
                        return res.status(404).json({ status: 404, message: "Orders not found", data: {} });
                }
                return res.status(200).json({ status: 200, msg: "orders of user", data: orders })
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
const getCartResponse = async (cart, userId) => {
        try {
                await cart.populate([{ path: "products.productId", select: { reviews: 0 } }, { path: "gifts.giftId", select: { reviews: 0 } },
                { path: "frequentlyBuyProductSchema.frequentlyBuyProductId", select: { reviews: 0 } },
                { path: "coupon", select: "couponCode discount expirationDate" },]);
                const data1 = await Address.findOne({ type: "Admin" }).select('houseFlat appartment landMark -_id');
                const data2 = await Address.findOne({ user: userId }).select('houseFlat appartment landMark -_id');
                const data3 = await User.findOne({ _id: userId })
                const data4 = await contact.findOne().select('name image phone email numOfReviews ratings -_id');
                let discount = 0, coupan = 0, memberShip = 0, shipping = 10, memberShipPer;
                if (data3) {
                        if (data3.isSubscription == true) {
                                const findSubscription = await Subscription.findById(data3.subscriptionId);
                                if (findSubscription) {
                                        memberShipPer = findSubscription.discount
                                }
                        } else {
                                memberShipPer = 0;
                        }
                }
                if (cart.coupon && moment().isAfter(cart.coupon.expirationDate, "day")) { cart.coupon = undefined; cart.save(); }
                const cartResponse = cart.toObject();
                let total1 = 0, total = 0, subTotal = 0, grandTotal = 0;
                cartResponse.products.forEach((cartProduct) => {
                        if (cartProduct.productId.discountActive == true) {
                                cartProduct.total = cartProduct.productId.price * cartProduct.quantity;
                                cartProduct.subTotal = cartProduct.productId.discountPrice * cartProduct.quantity;
                                cartProduct.discount = (cartProduct.productId.price - cartProduct.productId.discountPrice) * cartProduct.quantity;
                        } else {
                                cartProduct.total = cartProduct.productId.price * cartProduct.quantity;
                                cartProduct.subTotal = cartProduct.productId.price * cartProduct.quantity;
                                cartProduct.discount = 0;
                        }
                        subTotal += cartProduct.subTotal;
                        discount += cartProduct.discount;
                        total += cartProduct.total;
                });
                cartResponse.gifts.forEach((cartGift) => {
                        if (cartGift.giftId.discountActive == true) {
                                cartGift.total = cartGift.giftId.price * cartGift.quantity;
                                cartGift.subTotal = cartGift.giftId.discountPrice * cartGift.quantity;
                                cartGift.discount = (cartGift.giftId.price - cartGift.giftId.discountPrice) * cartGift.quantity;
                        } else {
                                cartGift.total = cartGift.giftId.price * cartGift.quantity;
                                cartGift.subTotal = cartGift.giftId.price * cartGift.quantity;
                                cartGift.discount = 0;
                        }
                        subTotal += cartGift.subTotal;
                        discount += cartGift.discount;
                        total += cartGift.total;
                });
                cartResponse.frequentlyBuyProductSchema.forEach((cartProduct) => {
                        cartProduct.total = cartProduct.frequentlyBuyProductId.price * cartProduct.quantity;
                        cartProduct.subTotal = cartProduct.frequentlyBuyProductId.price * cartProduct.quantity;
                        cartProduct.discount = 0;
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
                cartResponse.contactDetail = data4;
                if (cart.pickupFromStore == true) {
                        cartResponse.pickUp = data1;
                } else {
                        cartResponse.deliveryAddresss = data2;
                }
                return cartResponse;
        } catch (error) {
                throw error;
        }
};
/////////////////////////////////////////////////////////////////////////////////////////// Product  Cart End ////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////// service Cart Start ////////////////////////////////////////////////////////////////////
exports.addServiceToCart = async (req, res, next) => {
        try {
                const serviceId = req.params.id;
                let cart = await cartService.findOne({ user: req.user._id, });
                if (!cart) {
                        let services = [];
                        let obj = { serviceId: serviceId, quantity: 1 };
                        services.push(obj)
                        cart = await cartService.create({ user: req.user._id, services: services });
                        return res.status(200).json({ msg: "service added to cart", data: cart });
                } else {
                        const productIndex = cart.services.findIndex((cartService) => { return cartService.serviceId.toString() == serviceId; });
                        if (productIndex < 0) {
                                let obj = { serviceId: serviceId, quantity: 1 };
                                cart.services.push(obj);
                        } else {
                                cart.services[productIndex].quantity++;
                        }
                        await cart.save();
                        return res.status(200).json({ msg: "service added to cart", data: cart });
                }
        } catch (error) {
                next(error);
        }
};
exports.addOnServiceToCart = async (req, res, next) => {
        try {
                const addOnservicesId = req.params.id;
                let cart = await cartService.findOne({ user: req.user._id, });
                if (!cart) {
                        let services = [];
                        let obj = { addOnservicesId: addOnservicesId, quantity: 1 };
                        services.push(obj)
                        cart = await cartService.create({ user: req.user._id, AddOnservicesSchema: services });
                        return res.status(200).json({ msg: "Add On Service added to cart", data: cart });
                } else {
                        const productIndex = cart.AddOnservicesSchema.findIndex((cartService) => { return cartService.addOnservicesId.toString() == addOnservicesId; });
                        if (productIndex < 0) {
                                let obj = { addOnservicesId: addOnservicesId, quantity: 1 };
                                cart.AddOnservicesSchema.push(obj);
                        } else {
                                cart.AddOnservicesSchema[productIndex].quantity++;
                        }
                        await cart.save();
                        return res.status(200).json({ msg: "Add On Service added to cart", data: cart });
                }
        } catch (error) {
                next(error);
        }
};
exports.getServiceCart = async (req, res, next) => {
        try {
                const cart = await cartService.findOne({ user: req.user._id });
                if (!cart) {
                        return res.status(200).json({ success: false, msg: "cart", cart: {} })
                } else {
                        const cartResponse = await getServiceCartResponse(cart, req.user._id);
                        return res.status(200).json({ success: true, msg: "cart", cart: cartResponse })
                }
        } catch (error) {
                console.log(error)
                next(error);
        }
}
exports.addDateAndtimetoServiceCart = async (req, res) => {
        try {
                let userData = await User.findOne({ _id: req.user._id });
                if (!userData) {
                        return res.status(404).send({ status: 404, message: "User not found" });
                } else {
                        let findCart = await cartService.findOne({ user: userData._id });
                        if (findCart) {
                                const d = new Date(req.body.date);
                                let text = d.toISOString();
                                let update = await cartService.findByIdAndUpdate({ _id: findCart._id }, { $set: { date: text, time: req.body.time } }, { new: true });
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
                let findCart = await cartService.findOne({ user: req.user._id });
                if (findCart) {
                        let update1 = await cartService.findByIdAndUpdate({ _id: findCart._id }, { $set: { suggesstion: req.body.suggestion }, }, { new: true });
                        return res.status(200).json({ status: 200, message: "suggestion add to cart Successfully.", data: update1 })
                } else {
                        return res.status(404).json({ status: 404, message: "Cart is empty.", data: {} });
                }
        } catch (error) {
                console.error(error);
                return res.status(500).send({ status: 500, message: "Server error" + error.message });
        }
};
exports.deleteServicefromcart = async (req, res) => {
        try {
                let findCart = await cartService.findOne({ user: req.user._id });
                if (findCart) {
                        for (let i = 0; i < findCart.services.length; i++) {
                                if (findCart.services.length > 1) {
                                        if (((findCart.services[i].serviceId).toString() == req.params.id) == true) {
                                                let updateCart = await cartService.findByIdAndUpdate({ _id: findCart._id, 'services.serviceId': req.params.id }, { $pull: { 'services': { serviceId: req.params.id, quantity: findCart.services[i].quantity, } } }, { new: true })
                                                if (updateCart) {
                                                        return res.status(200).send({ message: "Service delete from cart.", data: updateCart, });
                                                }
                                        }
                                } else {
                                        let updateProject = await cartService.findByIdAndDelete({ _id: findCart._id });
                                        if (updateProject) {
                                                let findCart1 = await cartService.findOne({ user: req.user._id });
                                                if (!findCart1) {
                                                        return res.status(200).send({ status: 200, "message": "No Data Found ", cart: [] });
                                                }
                                        }
                                }
                        }
                } else {
                        return res.status(200).send({ status: 200, "message": "No Data Found ", cart: [] });
                }

        } catch (error) {
                console.log("353====================>", error)
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.checkoutForService = async (req, res) => {
        try {
                let findOrder = await serviceOrder.find({ user: req.user._id, orderStatus: "unconfirmed" });
                if (findOrder.length > 0) {
                        for (let i = 0; i < findOrder.length; i++) {
                                await serviceOrder.findByIdAndDelete({ _id: findOrder[i]._id });
                        }
                        let findCart = await cartService.findOne({ user: req.user._id }).populate([{ path: "AddOnservicesSchema.addOnservicesId", select: { reviews: 0 } }, { path: "services.serviceId", select: { reviews: 0 } }, { path: "coupon", select: "couponCode discount expirationDate" },]);
                        if (findCart) {
                                const data1 = await Address.findOne({ type: "Admin" }).select('houseFlat appartment landMark -_id');
                                const data3 = await User.findOne({ _id: req.user._id })
                                let discount = 0, coupan = 0, memberShip = 0, serviceCharge = 10, memberShipPer;
                                if (data3) {
                                        if (data3.isSubscription == true) {
                                                const findSubscription = await Subscription.findById(data3.subscriptionId);
                                                if (findSubscription) {
                                                        memberShipPer = findSubscription.discount
                                                }
                                        } else {
                                                memberShipPer = 0;
                                        }
                                }
                                if (findCart.coupon && moment().isAfter(findCart.coupon.expirationDate, "day")) { findCart.coupon = undefined; findCart.save(); }
                                const cartResponse = findCart.toObject();
                                let total1 = 0, total = 0, subTotal = 0, grandTotal = 0;
                                cartResponse.services.forEach((cartProduct) => {
                                        if (cartProduct.serviceId.discountActive == true) {
                                                cartProduct.total = cartProduct.serviceId.price * cartProduct.quantity;
                                                cartProduct.subTotal = cartProduct.serviceId.discountPrice * cartProduct.quantity;
                                                cartProduct.discount = (cartProduct.serviceId.price - cartProduct.serviceId.discountPrice) * cartProduct.quantity;
                                        } else {
                                                cartProduct.total = cartProduct.serviceId.price * cartProduct.quantity;
                                                cartProduct.subTotal = cartProduct.serviceId.price * cartProduct.quantity;
                                                cartProduct.discount = 0;
                                        }
                                        subTotal += cartProduct.subTotal;
                                        discount += cartProduct.discount;
                                        total += cartProduct.total;
                                });
                                cartResponse.AddOnservicesSchema.forEach((cartGift) => {
                                        cartGift.total = cartGift.addOnservicesId.price * cartGift.quantity;
                                        cartGift.subTotal = cartGift.addOnservicesId.price * cartGift.quantity;
                                        cartGift.discount = 0;
                                        subTotal += cartGift.subTotal;
                                        discount += cartGift.discount;
                                        total += cartGift.total;
                                });
                                if (cartResponse.coupon) {
                                        coupan = 0.01 * findCart.coupon.discount * subTotal;
                                }
                                cartResponse.date = findCart.date;
                                cartResponse.time = findCart.time;
                                cartResponse.suggesstion = findCart.suggesstion;
                                cartResponse.total = total;
                                cartResponse.discount = discount;
                                cartResponse.coupan = coupan;
                                cartResponse.subTotal = subTotal;
                                cartResponse.serviceCharge = serviceCharge;
                                total1 = subTotal - coupan + serviceCharge;
                                memberShip = (total1 * memberShipPer) / 100;
                                cartResponse.memberShip = memberShip;
                                cartResponse.memberShipPer = memberShipPer;
                                grandTotal = total1 - memberShip;
                                cartResponse.grandTotal = grandTotal;
                                cartResponse.orderId = await reffralCode();
                                cartResponse.serviceAddresss = data1;
                                let saveOrder = await serviceOrder.create(cartResponse);
                                return res.status(200).json({ msg: "Order create successfully", data: saveOrder });
                        }
                } else {
                        let findCart = await cartService.findOne({ user: req.user._id }).populate([{ path: "AddOnservicesSchema.addOnservicesId", select: { reviews: 0 } }, { path: "services.serviceId", select: { reviews: 0 } }, { path: "coupon", select: "couponCode discount expirationDate" },]);
                        if (findCart) {
                                const data1 = await Address.findOne({ type: "Admin" }).select('houseFlat appartment landMark -_id');
                                const data3 = await User.findOne({ _id: req.user._id })
                                let discount = 0, coupan = 0, memberShip = 0, serviceCharge = 10, memberShipPer;
                                if (data3) {
                                        if (data3.isSubscription == true) {
                                                const findSubscription = await Subscription.findById(data3.subscriptionId);
                                                if (findSubscription) {
                                                        memberShipPer = findSubscription.discount
                                                }
                                        } else {
                                                memberShipPer = 0;
                                        }
                                }
                                if (findCart.coupon && moment().isAfter(findCart.coupon.expirationDate, "day")) { findCart.coupon = undefined; findCart.save(); }
                                const cartResponse = findCart.toObject();
                                let total1 = 0, total = 0, subTotal = 0, grandTotal = 0;
                                cartResponse.services.forEach((cartProduct) => {
                                        if (cartProduct.serviceId.discountActive == true) {
                                                cartProduct.total = cartProduct.serviceId.price * cartProduct.quantity;
                                                cartProduct.subTotal = cartProduct.serviceId.discountPrice * cartProduct.quantity;
                                                cartProduct.discount = (cartProduct.serviceId.price - cartProduct.serviceId.discountPrice) * cartProduct.quantity;
                                        } else {
                                                cartProduct.total = cartProduct.serviceId.price * cartProduct.quantity;
                                                cartProduct.subTotal = cartProduct.serviceId.price * cartProduct.quantity;
                                                cartProduct.discount = 0;
                                        }
                                        subTotal += cartProduct.subTotal;
                                        discount += cartProduct.discount;
                                        total += cartProduct.total;
                                });
                                cartResponse.AddOnservicesSchema.forEach((cartGift) => {
                                        cartGift.total = cartGift.addOnservicesId.price * cartGift.quantity;
                                        cartGift.subTotal = cartGift.addOnservicesId.price * cartGift.quantity;
                                        cartGift.discount = 0;
                                        subTotal += cartGift.subTotal;
                                        discount += cartGift.discount;
                                        total += cartGift.total;
                                });
                                if (cartResponse.coupon) {
                                        coupan = 0.01 * findCart.coupon.discount * subTotal;
                                }
                                cartResponse.date = findCart.date;
                                cartResponse.time = findCart.time;
                                cartResponse.suggesstion = findCart.suggesstion;
                                cartResponse.total = total;
                                cartResponse.discount = discount;
                                cartResponse.coupan = coupan;
                                cartResponse.subTotal = subTotal;
                                cartResponse.serviceCharge = serviceCharge;
                                total1 = subTotal - coupan + serviceCharge;
                                memberShip = (total1 * memberShipPer) / 100;
                                cartResponse.memberShip = memberShip;
                                cartResponse.memberShipPer = memberShipPer;
                                grandTotal = total1 - memberShip;
                                cartResponse.grandTotal = grandTotal;
                                cartResponse.orderId = await reffralCode();
                                cartResponse.serviceAddresss = data1;
                                let saveOrder = await serviceOrder.create(cartResponse);
                                return res.status(200).json({ msg: "Order create successfully", data: saveOrder });
                        }
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.placeOrderForService = async (req, res) => {
        try {
                let findUserOrder = await serviceOrder.findOne({ orderId: req.params.orderId }).populate([{ path: "AddOnservicesSchema.addOnservicesId", select: { reviews: 0 } }, { path: "services.serviceId", select: { reviews: 0 } }, { path: "coupon", select: "couponCode discount expirationDate" },]);
                if (findUserOrder) {
                        let line_items = [];
                        const cartResponse = findUserOrder.toObject();
                        let discount = 0, total = 0, subTotal = 0;
                        cartResponse.services.forEach((cartProduct) => {
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
                                                currency: "inr",
                                                product_data: {
                                                        name: `${cartProduct.serviceId.name}`,
                                                },
                                                unit_amount: `${Math.round(price * 100)}`,
                                        },
                                        quantity: 1,
                                }
                                line_items.push(obj2)
                        });
                        cartResponse.AddOnservicesSchema.forEach((cartGift) => {
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
                                                currency: "inr",
                                                product_data: {
                                                        name: `${cartGift.addOnservicesId.name}`,
                                                },
                                                unit_amount: `${Math.round(price * 100)}`,
                                        },
                                        quantity: 1,
                                }
                                line_items.push(obj2)
                        });
                        let delivery = Number(findUserOrder.serviceCharge);
                        let obj3 = {
                                price_data: {
                                        currency: "inr",
                                        product_data: {
                                                name: `Service Charge`,
                                        },
                                        unit_amount: `${Math.round(delivery * 100)}`,
                                },
                                quantity: 1,
                        }
                        line_items.push(obj3)
                        const session = await stripe.checkout.sessions.create({
                                payment_method_types: ["card"],
                                success_url: `https://krishwholesale.co.uk/order-success/${findUserOrder.orderId}`,
                                cancel_url: `https://krishwholesale.co.uk/order-failure/${findUserOrder.orderId}`,
                                customer_email: req.user.email,
                                client_reference_id: findUserOrder.orderId,
                                line_items: line_items,
                                mode: "payment",
                        });
                        return res.status(200).json({ status: "success", session: session, });
                } else {
                        return res.status(404).json({ message: "No data found", data: {} });
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.cancelOrderForService = async (req, res) => {
        try {
                let findUserOrder = await serviceOrder.findOne({ orderId: req.params.orderId });
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
exports.successOrderForService = async (req, res) => {
        try {
                let findUserOrder = await serviceOrder.findOne({ orderId: req.params.orderId });
                if (findUserOrder) {
                        const user = await User.findById({ _id: findUserOrder.user });
                        if (!user) {
                                return res.status(404).send({ status: 404, message: "User not found or token expired." });
                        }
                        let update = await serviceOrder.findByIdAndUpdate({ _id: findUserOrder._id }, { $set: { orderStatus: "confirmed", paymentStatus: "paid" } }, { new: true });
                        let deleteCart = await cartService.findOneAndDelete({ user: findUserOrder.user });
                        if (deleteCart) {
                                return res.status(200).json({ message: "Payment success.", status: 200, data: update });
                        }
                } else {
                        return res.status(404).json({ message: "No data found", data: {} });
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.cartData = async (req, res, next) => {
        try {
                const productsCount = await services.count();
                const apiFeature = await services.aggregate([
                        { $lookup: { from: "categories", localField: "categoryId", foreignField: "_id", as: "categoryId" } },
                        { $unwind: "$categoryId" },
                ]);
                const userCart = await cartService.findOne({ userId: req.user._id });
                if (userCart) {
                        const categoriesWithServicesInCart = {};
                        apiFeature.forEach((product) => {
                                const cartItem = userCart.services.find((cartItem) => cartItem.serviceId?.equals(product._id));
                                if (cartItem) {
                                        if (!categoriesWithServicesInCart[product.categoryId._id]) {
                                                categoriesWithServicesInCart[product.categoryId._id] = {
                                                        category: product.categoryId,
                                                        services: [],
                                                };
                                        }
                                        categoriesWithServicesInCart[product.categoryId._id].services.push({
                                                ...product,
                                                isInCart: true,
                                                quantityInCart: 1,
                                        });
                                } else {
                                        if (!categoriesWithServicesInCart[product.categoryId._id]) {
                                                categoriesWithServicesInCart[product.categoryId._id] = {
                                                        category: product.categoryId,
                                                        services: [],
                                                };
                                        }
                                        categoriesWithServicesInCart[product.categoryId._id].services.push({
                                                ...product,
                                                isInCart: false,
                                                quantityInCart: 0,
                                        });
                                }
                        });
                        const result = Object.values(categoriesWithServicesInCart);
                        return res.status(200).json({ status: 200, message: "Service data found.", data: result, count: productsCount });
                } else {
                        const categoriesWithServicesInCart = {};
                        apiFeature.forEach((product) => {
                                if (!categoriesWithServicesInCart[product.categoryId._id]) {
                                        categoriesWithServicesInCart[product.categoryId._id] = {
                                                category: product.categoryId,
                                                services: [],
                                        };
                                }
                                categoriesWithServicesInCart[product.categoryId._id].services.push({
                                        ...product,
                                        isInCart: false,
                                        quantityInCart: 0,
                                });
                        });
                        const result = Object.values(categoriesWithServicesInCart);
                        return res.status(200).json({ status: 200, message: "Service data found.", data: result, count: productsCount });
                }
        } catch (err) {
                console.log(err);
                return res.status(500).send({ message: "Internal server error while creating Product" });
        }
};
exports.getServiceOrders = async (req, res, next) => {
        try {
                const orders = await serviceOrder.find({ user: req.user._id, orderStatus: "confirmed" }).populate([{ path: "AddOnservicesSchema.addOnservicesId", select: { reviews: 0 } }, { path: "services.serviceId", select: { reviews: 0 } }, { path: "coupon", select: "couponCode discount expirationDate" },]);
                if (orders.length == 0) {
                        return res.status(404).json({ status: 404, message: "Orders not found", data: {} });
                }
                return res.status(200).json({ status: 200, msg: "orders of user", data: orders })
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
const getServiceCartResponse = async (cartService, userId) => {
        try {
                console.log(cartService);
                await cartService.populate([
                        { path: "AddOnservicesSchema.addOnservicesId", select: { reviews: 0 } },
                        { path: "services.serviceId", select: { reviews: 0 } },
                        { path: "coupon", select: "couponCode discount expirationDate" },
                ]);
                const data1 = await Address.findOne({ type: "Admin" }).select('houseFlat appartment landMark -_id');
                const data2 = await Address.findOne({ user: userId }).select('houseFlat appartment landMark -_id');
                const data3 = await User.findOne({ _id: userId })
                const data4 = await contact.findOne().select('name image phone email numOfReviews ratings -_id');
                let discount = 0, coupan = 0, memberShip = 0, serviceCharge = 10, memberShipPer;
                if (data3) {
                        if (data3.isSubscription == true) {
                                const findSubscription = await Subscription.findById(data3.subscriptionId);
                                if (findSubscription) {
                                        memberShipPer = findSubscription.discount
                                }
                        } else {
                                memberShipPer = 0;
                        }
                }
                if (cartService.coupon && moment().isAfter(cartService.coupon.expirationDate, "day")) { cartService.coupon = undefined; cartService.save(); }
                const cartResponse = cartService.toObject();
                let total1 = 0, total = 0, subTotal = 0, grandTotal = 0;
                cartResponse.AddOnservicesSchema.forEach((cartGift) => {
                        cartGift.total = cartGift.addOnservicesId.price * cartGift.quantity;
                        cartGift.subTotal = cartGift.addOnservicesId.price * cartGift.quantity;
                        cartGift.discount = 0;
                        subTotal += cartGift.subTotal;
                        discount += cartGift.discount;
                        total += cartGift.total;
                });
                cartResponse.services.forEach((cartProduct) => {
                        if (cartProduct.serviceId.discountActive == true) {
                                cartProduct.total = cartProduct.serviceId.price * cartProduct.quantity;
                                cartProduct.subTotal = cartProduct.serviceId.discountPrice * cartProduct.quantity;
                                cartProduct.discount = (cartProduct.serviceId.price - cartProduct.serviceId.discountPrice) * cartProduct.quantity;
                        } else {
                                cartProduct.total = cartProduct.serviceId.price * cartProduct.quantity;
                                cartProduct.subTotal = cartProduct.serviceId.price * cartProduct.quantity;
                                cartProduct.discount = 0;
                        }
                        subTotal += cartProduct.subTotal;
                        discount += cartProduct.discount;
                        total += cartProduct.total;
                });
                if (cartResponse.coupon) {
                        coupan = 0.01 * cartService.coupon.discount * subTotal;
                }
                cartResponse.total = total;
                cartResponse.discount = discount;
                cartResponse.coupan = coupan;
                cartResponse.subTotal = subTotal;
                cartResponse.serviceCharge = serviceCharge;
                total1 = subTotal - coupan + serviceCharge;
                memberShip = (total1 * memberShipPer) / 100;
                cartResponse.memberShip = memberShip;
                cartResponse.memberShipPer = memberShipPer;
                grandTotal = total1 - memberShip;
                cartResponse.grandTotal = grandTotal;
                cartResponse.contactDetail = data4;
                cartResponse.serviceAddresss = data1;

                return cartResponse;
        } catch (error) {
                throw error;
        }
};
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
                                        $match: { "discountActive": true },
                                },
                        ]);
                        return res.status(200).json({ status: 200, message: "Product data found.", data: apiFeature, count: productsCount });
                } else {
                        let apiFeature = await services.aggregate([
                                { $lookup: { from: "categories", localField: "categoryId", foreignField: "_id", as: "categoryId" } },
                                { $unwind: "$categoryId" },
                                { $match: { "discountActive": true } },
                        ]);
                        return res.status(200).json({ status: 200, message: "Product data found.", data: apiFeature, count: productsCount });
                }
        } catch (err) {
                console.log(err);
                return res.status(500).send({ message: "Internal server error while creating Product", });
        }
};
/////////////////////////////////////////////////////////////////////////////////////////// service Cart End ////////////////////////////////////////////////////////////////////
exports.getSubscription = async (req, res) => {
        try {
                const findSubscription = await Subscription.find();
                return res.status(200).json({ status: 200, message: "Subscription detail successfully.", data: findSubscription });
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
                const cart = await coupan.findOne({ user: req.user._id });
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
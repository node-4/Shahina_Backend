const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authConfig = require("../configs/auth.config");
var newOTP = require("otp-generators");
const mongoose = require('mongoose');
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
const serviceOrder = require("../models/Auth/serviceOrder");
const productOrder = require("../models/Auth/productOrder");
const ingredients = require("../models/ingredients");
const giftCard = require("../models/giftCard");
const giftPrice = require("../models/giftPrice");
const Cart = require("../models/Auth/cartModel");
const userOrders = require("../models/Auth/userOrders");
const slot = require("../models/slot");
const shippingCharges = require("../models/shippingCharges");
const acneQuiz = require("../models/acneQuiz");
const acneQuizSuggession = require("../models/acneQuizSuggession");
const frequentlyBuyProduct = require("../models/frequentlyBuyProduct");
const addOnservices = require("../models/Service/addOnservices");
const deliverOrde = require("../models/deliverOrde");
const recentlyView = require("../models/recentlyView");
const Address = require("../models/Auth/addrees");
const coupanModel = require("../models/Auth/coupan");
const transactionModel = require("../models/transactionModel");
const notification = require("../models/notification");
const adminNotification = require("../models/adminNotification");
const commonFunction = require("../middlewares/commonFunction");
const XLSX = require("xlsx");
const fs = require("fs");
const nodemailer = require("nodemailer");
const moment = require("moment")
const { SendleClient } = require('sendle-node');
// public
// const client = new SendleClient({
//         sendleId: 'shahina_hoja_gmail_c',
//         apiKey: 'KkZkQ3MdyRtwsT3s9rMww5w5',
//         sandbox: false,
// });
// test 
const client = new SendleClient({
        sendleId: 'SANDBOX_shahina_hoja_gmail_c',
        apiKey: 'sandbox_W5xZ3WFY8zBPdpQP5x8w3WQf',
        sandbox: true,
});
exports.registration = async (req, res) => {
        const { phone, email } = req.body;
        try {
                req.body.email = email.split(" ").join("").toLowerCase();
                let user = await User.findOne({ $and: [{ $or: [{ email: req.body.email }, { phone: phone }] }], userType: "ADMIN" });
                if (!user) {
                        req.body.password = bcrypt.hashSync(req.body.password, 8);
                        req.body.userType = "ADMIN";
                        req.body.accountVerification = true;
                        req.body.refferalCode = await reffralCode();
                        const userCreate = await User.create(req.body);
                        return res.status(200).send({ message: "registered successfully ", data: userCreate, });
                } else {
                        return res.status(409).send({ message: "Already Exist", data: [] });
                }
        } catch (error) {
                console.error(error);
                return res.status(500).json({ message: "Server error" });
        }
};
exports.signin = async (req, res) => {
        try {
                const { email, password } = req.body;
                const user = await User.findOne({ email: email });
                if (!user) {
                        return res.status(404).send({ message: "user not found ! not registered" });
                }
                const isValidPassword = bcrypt.compareSync(password, user.password);
                if (!isValidPassword) {
                        return res.status(401).send({ message: "Wrong password" });
                }
                const accessToken = jwt.sign({ id: user._id }, authConfig.secret, { expiresIn: authConfig.accessTokenTime, });
                return res.status(201).send({ data: user, accessToken: accessToken });
        } catch (error) {
                console.error(error);
                return res.status(500).send({ message: "Server error" + error.message });
        }
};
exports.update = async (req, res) => {
        try {
                const { fullName, firstName, lastName, email, phone, password } = req.body;
                const user = await User.findById(req.user.id);
                if (!user) {
                        return res.status(404).send({ message: "not found" });
                }
                user.fullName = fullName || user.fullName;
                user.firstName = firstName || user.firstName;
                user.lastName = lastName || user.lastName;
                user.email = email || user.email;
                user.phone = phone || user.phone;
                if (req.body.password) {
                        user.password = bcrypt.hashSync(password, 8) || user.password;
                }
                const updated = await user.save();
                return res.status(200).send({ message: "updated", data: updated });
        } catch (err) {
                console.log(err);
                return res.status(500).send({
                        message: "internal server error " + err.message,
                });
        }
};
exports.clientRegistration = async (req, res) => {
        try {
                if (req.body.phone != (null || undefined)) {
                        let findUser = await User.findOne({ phone: req.body.phone });
                        if (findUser) {
                                return res.status(409).send({ status: 409, message: "User already registered with these details. ", data: {}, });
                        }
                }
                if (req.body.email != (null || undefined)) {
                        let findUser = await User.findOne({ email: req.body.email });
                        if (findUser) {
                                return res.status(409).send({ status: 409, message: "User already registered with these details. ", data: {}, });
                        }
                }
                req.body.otp = newOTP.generate(4, { alphabets: false, upperCase: false, specialChar: false, });
                req.body.otpExpiration = new Date(Date.now() + 5 * 60 * 1000);
                req.body.accountVerification = false;
                req.body.refferalCode = await reffralCode();
                if (req.body.password != (null || undefined)) {
                        req.body.password = bcrypt.hashSync(req.body.password, 8);
                }
                req.body.userType = "USER";
                const userCreate = await User.create(req.body);
                return res.status(200).send({ status: 200, message: "Registered successfully ", data: userCreate, });
        } catch (error) {
                console.error(error);
                return res.status(500).json({ message: "Server error" });
        }
};
exports.getAllUser = async (req, res) => {
        try {
                const user = await User.find({ userType: "USER" });
                if (user.length == 0) {
                        return res.status(404).send({ message: "not found" });
                }
                return res.status(200).send({ message: "Get user details.", data: user });
        } catch (err) {
                console.log(err);
                return res.status(500).send({
                        message: "internal server error " + err.message,
                });
        }
};
exports.viewUser = async (req, res) => {
        try {
                const data = await User.findById(req.params.id);
                if (!data) {
                        return res.status(400).send({ msg: "not found" });
                }
                return res.status(200).send({ msg: "Data found successfully", data: data });
        } catch (err) {
                console.log(err.message);
                return res.status(500).send({ msg: "internal server error", error: err.message, });
        }
};
exports.updateClientProfile = async (req, res) => {
        try {
                const data = await User.findById(req.params.id);
                if (data) {
                        let obj = {
                                firstName: req.body.firstName || data.firstName,
                                lastName: req.body.lastName || data.lastName,
                                fullName: req.body.fullName || data.fullName,
                                email: req.body.email || data.email,
                                countryCode: req.body.countryCode || data.countryCode,
                                phone: req.body.phone || data.phone,
                                gender: req.body.gender || data.gender,
                                dob: req.body.dob || data.dob,
                                bio: req.body.bio || data.bio,
                                showOnAllBooking: req.body.showOnAllBooking || data.showOnAllBooking,
                                sendEmailNotification: req.body.sendEmailNotification || data.sendEmailNotification,
                                sendTextNotification: req.body.sendTextNotification || data.sendTextNotification,
                                sendEmailMarketingNotification: req.body.sendEmailMarketingNotification || data.sendEmailMarketingNotification,
                                sendTextMarketingNotification: req.body.sendTextMarketingNotification || data.sendTextMarketingNotification,
                                preferredLAnguage: req.body.preferredLAnguage || data.preferredLAnguage,
                                sendConfirmationAppointmentWithCard: req.body.sendConfirmationAppointmentWithCard || data.sendConfirmationAppointmentWithCard,
                                sendReminder: req.body.sendReminder || data.sendReminder,
                        }
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
exports.sendReminder = async (req, res) => {
        try {
                const data = await User.findById(req.params.id);
                if (data) {
                        if (data.sendReminder == true) {
                                let update = await User.findByIdAndUpdate({ _id: data._id }, { $set: { sendReminder: false } }, { new: true });
                                if (update) {
                                        return res.status(200).json({ status: 200, message: "Send reminder update successfully.", data: update });
                                }
                        } else {
                                let update = await User.findByIdAndUpdate({ _id: data._id }, { $set: { sendReminder: true } }, { new: true });
                                if (update) {
                                        return res.status(200).json({ status: 200, message: "Send reminder update successfully.", data: update });
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
exports.sendConfirmationAppointmentWithCard = async (req, res) => {
        try {
                const data = await User.findById(req.params.id);
                if (data) {
                        if (data.sendConfirmationAppointmentWithCard == true) {
                                let update = await User.findByIdAndUpdate({ _id: data._id }, { $set: { sendConfirmationAppointmentWithCard: false } }, { new: true });
                                if (update) {
                                        return res.status(200).json({ status: 200, message: "Send reminder update successfully.", data: update });
                                }
                        } else {
                                let update = await User.findByIdAndUpdate({ _id: data._id }, { $set: { sendConfirmationAppointmentWithCard: true } }, { new: true });
                                if (update) {
                                        return res.status(200).json({ status: 200, message: "Send reminder update successfully.", data: update });
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
exports.deleteUser = async (req, res) => {
        try {
                const data = await User.findByIdAndDelete(req.params.id);
                if (!data) {
                        return res.status(400).send({ msg: "not found" });
                }
                return res.status(200).send({ msg: "deleted", data: data });
        } catch (err) {
                console.log(err.message);
                return res.status(500).send({ msg: "internal server error", error: err.message, });
        }
};
exports.activeBlockUser = async (req, res) => {
        try {
                const data = await User.findById(req.params.id);
                if (!data) {
                        return res.status(400).send({ msg: "not found" });
                }
                if (data.userStatus == "Block") {
                        const data1 = await User.findByIdAndUpdate({ _id: data._id }, { $set: { userStatus: "Active" } }, { new: true });
                        if (data1) {
                                return res.status(200).send({ msg: "Client block successfully", data: data1 });
                        }
                }
                if (data.userStatus == "Active") {
                        const data1 = await User.findByIdAndUpdate({ _id: data._id }, { $set: { userStatus: "Block" } }, { new: true });
                        if (data1) {
                                return res.status(200).send({ msg: "Client unblock successfully", data: data1 });
                        }
                }
        } catch (err) {
                console.log(err.message);
                return res.status(500).send({ msg: "internal server error", error: err.message, });
        }
};
exports.createCategory = async (req, res) => {
        try {
                let findCategory = await Category.findOne({ name: req.body.name });
                if (findCategory) {
                        return res.status(409).json({ message: "Category already exit.", status: 404, data: {} });
                } else {
                        let fileUrl;
                        if (req.file) {
                                fileUrl = req.file ? req.file.path : "";
                        }
                        const data = { name: req.body.name, image: fileUrl };
                        const category = await Category.create(data);
                        return res.status(200).json({ message: "Category add successfully.", status: 200, data: category });
                }
        } catch (error) {
                return res.status(500).json({ status: 500, message: "internal server error ", data: error.message, });
        }
};
exports.getCategories = async (req, res) => {
        const categories = await Category.find({});
        return res.status(201).json({ message: "Category Found", status: 200, data: categories, });
};
exports.updateCategory = async (req, res) => {
        const { id } = req.params;
        const category = await Category.findById(id);
        if (!category) {
                return res.status(404).json({ message: "Category Not Found", status: 404, data: {} });
        }
        let fileUrl;
        if (req.file) {
                fileUrl = req.file ? req.file.path : "";
        }
        category.image = fileUrl || category.image;
        category.name = req.body.name || category.name;
        let update = await category.save();
        return res.status(200).json({ message: "Updated Successfully", data: update });
};
exports.removeCategory = async (req, res) => {
        const { id } = req.params;
        const category = await Category.findById(id);
        if (!category) {
                return res.status(404).json({ message: "Category Not Found", status: 404, data: {} });
        } else {
                await Category.findByIdAndDelete(category._id);
                return res.status(200).json({ message: "Category Deleted Successfully !" });
        }
};
exports.createBrands = async (req, res) => {
        try {
                let findBrand = await Brand.findOne({ name: req.body.name });
                if (findBrand) {
                        return res.status(409).json({ message: "Brand already exit.", status: 409, data: {} });
                } else {
                        let fileUrl;
                        if (req.file) {
                                fileUrl = req.file ? req.file.path : "";
                        }
                        const data = { name: req.body.name, image: fileUrl };
                        const category = await Brand.create(data);
                        return res.status(200).json({ message: "Brand add successfully.", status: 200, data: category });
                }
        } catch (error) {
                return res.status(500).json({ status: 500, message: "internal server error ", data: error.message, });
        }
};
exports.getBrands = async (req, res) => {
        const categories = await Brand.find({});
        if (categories.length > 0) {
                return res.status(201).json({ message: "Brand Found", status: 200, data: categories, });
        }
        return res.status(201).json({ message: "Brand not Found", status: 404, data: {}, });

};
exports.updateBrand = async (req, res) => {
        const { id } = req.params;
        const category = await Brand.findById(id);
        if (!category) {
                return res.status(404).json({ message: "Brand Not Found", status: 404, data: {} });
        }
        let fileUrl;
        if (req.file) {
                fileUrl = req.file ? req.file.path : "";
        }
        category.image = fileUrl || category.image;
        category.name = req.body.name || category.name;
        let update = await category.save();
        return res.status(200).json({ message: "Updated Successfully", data: update });
};
exports.removeBrand = async (req, res) => {
        const { id } = req.params;
        const category = await Brand.findById(id);
        if (!category) {
                return res.status(404).json({ message: "Brand Not Found", status: 404, data: {} });
        } else {
                await Brand.findByIdAndDelete(category._id);
                return res.status(200).json({ message: "Brand Deleted Successfully !" });
        }
};
exports.createNutritions = async (req, res) => {
        try {
                let findNutrition = await Nutrition.findOne({ name: req.body.name });
                if (findNutrition) {
                        return res.status(409).json({ message: "Nutrition already exit.", status: 404, data: {} });
                } else {
                        let fileUrl;
                        if (req.file) {
                                fileUrl = req.file ? req.file.path : "";
                        }
                        const data = { name: req.body.name, image: fileUrl };
                        const category = await Nutrition.create(data);
                        return res.status(200).json({ message: "Nutrition add successfully.", status: 200, data: category });
                }
        } catch (error) {
                return res.status(500).json({ status: 500, message: "internal server error ", data: error.message, });
        }
};
exports.getNutritions = async (req, res) => {
        const categories = await Nutrition.find({});
        if (categories.length > 0) {
                return res.status(201).json({ message: "Nutrition Found", status: 200, data: categories, });
        }
        return res.status(201).json({ message: "Nutrition not Found", status: 404, data: {}, });

};
exports.updateNutrition = async (req, res) => {
        const { id } = req.params;
        const category = await Nutrition.findById(id);
        if (!category) {
                return res.status(404).json({ message: "Nutrition Not Found", status: 404, data: {} });
        }
        let fileUrl;
        if (req.file) {
                fileUrl = req.file ? req.file.path : "";
        }
        category.image = fileUrl || category.image;
        category.name = req.body.name || category.name;
        let update = await category.save();
        return res.status(200).json({ message: "Updated Successfully", data: update });
};
exports.removeNutrition = async (req, res) => {
        const { id } = req.params;
        const category = await Nutrition.findById(id);
        if (!category) {
                return res.status(404).json({ message: "Nutrition Not Found", status: 404, data: {} });
        } else {
                await Nutrition.findByIdAndDelete(category._id);
                return res.status(200).json({ message: "Nutrition Deleted Successfully !" });
        }
};
exports.createProductTypes = async (req, res) => {
        try {
                let findProductType = await ProductType.findOne({ name: req.body.name });
                if (findProductType) {
                        return res.status(409).json({ message: "ProductType already exit.", status: 404, data: {} });
                } else {
                        let fileUrl;
                        if (req.file) {
                                fileUrl = req.file ? req.file.path : "";
                        }
                        const data = { name: req.body.name, image: fileUrl };
                        const category = await ProductType.create(data);
                        return res.status(200).json({ message: "ProductType add successfully.", status: 200, data: category });
                }
        } catch (error) {
                return res.status(500).json({ status: 500, message: "internal server error ", data: error.message, });
        }
};
exports.getProductTypes = async (req, res) => {
        const categories = await ProductType.find({});
        if (categories.length > 0) {
                return res.status(201).json({ message: "ProductType Found", status: 200, data: categories, });
        }
        return res.status(201).json({ message: "ProductType not Found", status: 404, data: {}, });

};
exports.updateProductType = async (req, res) => {
        const { id } = req.params;
        const category = await ProductType.findById(id);
        if (!category) {
                return res.status(404).json({ message: "ProductType Not Found", status: 404, data: {} });
        }
        let fileUrl;
        if (req.file) {
                fileUrl = req.file ? req.file.path : "";
        }
        category.image = fileUrl || category.image;
        category.name = req.body.name || category.name;
        let update = await category.save();
        return res.status(200).json({ message: "Updated Successfully", data: update });
};
exports.removeProductType = async (req, res) => {
        const { id } = req.params;
        const category = await ProductType.findById(id);
        if (!category) {
                return res.status(404).json({ message: "ProductType Not Found", status: 404, data: {} });
        } else {
                await ProductType.findByIdAndDelete(category._id);
                return res.status(200).json({ message: "ProductType Deleted Successfully !" });
        }
};
exports.createSkinConditions = async (req, res) => {
        try {
                let findSkinCondition = await SkinCondition.findOne({ name: req.body.name });
                if (findSkinCondition) {
                        return res.status(409).json({ message: "SkinCondition already exit.", status: 404, data: {} });
                } else {
                        let fileUrl;
                        if (req.file) {
                                fileUrl = req.file ? req.file.path : "";
                        }
                        const data = { name: req.body.name, image: fileUrl };
                        const category = await SkinCondition.create(data);
                        return res.status(200).json({ message: "SkinCondition add successfully.", status: 200, data: category });
                }
        } catch (error) {
                return res.status(500).json({ status: 500, message: "internal server error ", data: error.message, });
        }
};
exports.getSkinConditions = async (req, res) => {
        const categories = await SkinCondition.find({});
        if (categories.length > 0) {
                return res.status(201).json({ message: "SkinCondition Found", status: 200, data: categories, });
        }
        return res.status(201).json({ message: "SkinCondition not Found", status: 404, data: {}, });

};
exports.updateSkinCondition = async (req, res) => {
        const { id } = req.params;
        const category = await SkinCondition.findById(id);
        if (!category) {
                return res.status(404).json({ message: "SkinCondition Not Found", status: 404, data: {} });
        }
        let fileUrl;
        if (req.file) {
                fileUrl = req.file ? req.file.path : "";
        }
        category.image = fileUrl || category.image;
        category.name = req.body.name || category.name;
        let update = await category.save();
        return res.status(200).json({ message: "Updated Successfully", data: update });
};
exports.removeSkinCondition = async (req, res) => {
        const { id } = req.params;
        const category = await SkinCondition.findById(id);
        if (!category) {
                return res.status(404).json({ message: "SkinCondition Not Found", status: 404, data: {} });
        } else {
                await SkinCondition.findByIdAndDelete(category._id);
                return res.status(200).json({ message: "SkinCondition Deleted Successfully !" });
        }
};
exports.createSkinTypes = async (req, res) => {
        try {
                let findSkinType = await SkinType.findOne({ name: req.body.name });
                if (findSkinType) {
                        return res.status(409).json({ message: "SkinType already exit.", status: 404, data: {} });
                } else {
                        let fileUrl;
                        if (req.file) {
                                fileUrl = req.file ? req.file.path : "";
                        }
                        const data = { name: req.body.name, image: fileUrl };
                        const category = await SkinType.create(data);
                        return res.status(200).json({ message: "SkinType add successfully.", status: 200, data: category });
                }
        } catch (error) {
                return res.status(500).json({ status: 500, message: "internal server error ", data: error.message, });
        }
};
exports.getSkinTypes = async (req, res) => {
        const categories = await SkinType.find({});
        if (categories.length > 0) {
                return res.status(201).json({ message: "SkinType Found", status: 200, data: categories, });
        }
        return res.status(201).json({ message: "SkinType not Found", status: 404, data: {}, });

};
exports.updateSkinType = async (req, res) => {
        const { id } = req.params;
        const category = await SkinType.findById(id);
        if (!category) {
                return res.status(404).json({ message: "SkinType Not Found", status: 404, data: {} });
        }
        let fileUrl;
        if (req.file) {
                fileUrl = req.file ? req.file.path : "";
        }
        category.image = fileUrl || category.image;
        category.name = req.body.name || category.name;
        let update = await category.save();
        return res.status(200).json({ message: "Updated Successfully", data: update });
};
exports.removeSkinType = async (req, res) => {
        const { id } = req.params;
        const category = await SkinType.findById(id);
        if (!category) {
                return res.status(404).json({ message: "SkinType Not Found", status: 404, data: {} });
        } else {
                await SkinType.findByIdAndDelete(category._id);
                return res.status(200).json({ message: "SkinType Deleted Successfully !" });
        }
};
exports.createProduct = async (req, res) => {
        try {
                const nutritionIds = req.body.nutritionId;
                const productTypeIds = req.body.productTypeId;
                const skinConditionIds = req.body.skinConditionId;
                const skinTypeIds = req.body.skinTypeId;
                const brandIds = req.body.brandId;
                const productPromises = [];
                if (brandIds != (null || undefined)) {
                        if (brandIds || brandIds.length > 0) {
                                for (const brandId of brandIds) {
                                        const data5 = await Brand.findById(brandId);
                                        if (!data5 || data5.length === 0) {
                                                return res.status(400).send({ status: 404, msg: `Brand with ID ${brandId} not found` });
                                        }
                                        req.body.brandId = brandId;
                                        req.body.nutritionId = null;
                                        req.body.skinTypeId = null;
                                        req.body.productTypeId = null;
                                        req.body.skinConditionId = null;
                                        const constructedProductData = constructProductData(req);
                                        const productCreated = await product.create(constructedProductData);
                                        productPromises.push(productCreated);
                                }
                        }
                }
                if ((skinTypeIds != (null || undefined))) {
                        if (skinTypeIds || skinTypeIds.length > 0) {
                                for (const skinTypeId of skinTypeIds) {
                                        const data4 = await SkinType.findById(skinTypeId);
                                        if (!data4 || data4.length === 0) {
                                                return res.status(400).send({ status: 404, msg: `SkinType with ID ${skinTypeId} not found` });
                                        }
                                        req.body.skinTypeId = skinTypeId;
                                        req.body.nutritionId = null;
                                        req.body.brandId = null;
                                        req.body.productTypeId = null;
                                        req.body.skinConditionId = null;
                                        const constructedProductData = constructProductData(req);
                                        const productCreated = await product.create(constructedProductData);
                                        productPromises.push(productCreated);
                                }
                        }
                }
                if (skinConditionIds != (null || undefined)) {
                        if (skinConditionIds || skinConditionIds.length > 0) {
                                for (const skinConditionId of skinConditionIds) {
                                        const data3 = await SkinCondition.findById(skinConditionId);
                                        if (!data3 || data3.length === 0) {
                                                return res.status(400).send({ status: 404, msg: `SkinCondition with ID ${skinConditionId} not found` });
                                        }
                                        req.body.skinConditionId = skinConditionId;
                                        req.body.nutritionId = null;
                                        req.body.skinTypeId = null;
                                        req.body.productTypeId = null;
                                        req.body.brandId = null;
                                        const constructedProductData = constructProductData(req);
                                        const productCreated = await product.create(constructedProductData);
                                        productPromises.push(productCreated);
                                }
                        }
                }
                if (productTypeIds != (null || undefined)) {
                        if (productTypeIds || productTypeIds.length > 0) {
                                for (const productTypeId of productTypeIds) {
                                        const data2 = await ProductType.findById(productTypeId);
                                        if (!data2 || data2.length === 0) {
                                                return res.status(400).send({ status: 404, msg: `ProductType with ID ${productTypeId} not found` });
                                        }
                                        req.body.productTypeId = productTypeId;
                                        req.body.nutritionId = null;
                                        req.body.skinTypeId = null;
                                        req.body.brandId = null;
                                        req.body.skinConditionId = null;
                                        const constructedProductData = constructProductData(req);
                                        const productCreated = await product.create(constructedProductData);
                                        productPromises.push(productCreated);
                                }
                        }
                }
                if (nutritionIds != (null || undefined)) {
                        if (nutritionIds || nutritionIds.length > 0) {
                                for (const nutritionId of nutritionIds) {
                                        const data0 = await Nutrition.findById(nutritionId);
                                        if (!data0 || data0.length === 0) {
                                                return res.status(400).send({ status: 404, msg: `Nutrition with ID ${nutritionId} not found` });
                                        }
                                        req.body.nutritionId = nutritionId;
                                        req.body.brandId = null;
                                        req.body.skinTypeId = null;
                                        req.body.productTypeId = null;
                                        req.body.skinConditionId = null;
                                        const constructedProductData = constructProductData(req);
                                        const productCreated = await product.create(constructedProductData);
                                        productPromises.push(productCreated);
                                }
                        }
                }
                const products = await Promise.all(productPromises);
                return res.status(201).send({ status: 200, message: "Products added successfully", data: products });
        } catch (err) {
                console.log(err);
                return res.status(500).send({ message: "Internal server error while creating Products", data: err });
        }
};
const constructProductData = (body) => {
        let productImages = [], result = [], howTouse = [], additionalInfo = [], sizePrice = [];
        if (body.files['image'] !== (null || undefined)) {
                let docs = body.files['image'];
                for (let i = 0; i < docs.length; i++) {
                        let obj = {
                                image: docs[i].path
                        };
                        productImages.push(obj);
                }
        }
        if (body.files['result'] !== (null || undefined)) {
                let docs = body.files['result'];
                for (let i = 0; i < docs.length; i++) {
                        result.push(docs[i].path);
                }
        }
        if (body.body.step !== undefined) {
                for (let i = 0; i < body.body.step.length; i++) {
                        let obj = {
                                step: body.body.step[i],
                                description: body.body.stepDescription[i]
                        };
                        howTouse.push(obj);
                }
        }
        if (body.body.title !== undefined) {
                additionalInfo = body.body.title.map((title, i) => ({
                        title,
                        description: body.body.addDescription[i]
                }));
        }
        const status = (stock) => stock > 0 ? "STOCK" : "OUTOFSTOCK";
        if (body.body.stock > 0) {
                body.body.status = status(body.body.stock);
        } else {
                body.body.status = status(body.body.stock);
        }
        if (body.body.multipleSize === 'true') {
                sizePrice = body.body.sizes.map((size, i) => {
                        const sizeStatus = status(body.body.multipleStock[i]);
                        return {
                                size,
                                price: body.body.multiplePrice[i],
                                stock: body.body.multipleStock[i],
                                status: sizeStatus
                        };
                });
        } else {
                body.body.size = body.body.size;
        }
        body.body.howTouse = howTouse;
        body.body.additionalInfo = additionalInfo;
        body.body.productImages = productImages;
        body.body.sizePrice = sizePrice;
        body.body.result = result;
        return body.body;
};
exports.paginateProductSearch = async (req, res) => {
        try {
                const { search, fromDate, toDate, brandId, nutritionId, productTypeId, skinConditionId, skinTypeId, quantity, status, page, limit } = req.query;
                let query = {};
                if (search) {
                        query.$or = [
                                { "name": { $regex: req.query.search, $options: "i" }, },
                                { "description": { $regex: req.query.search, $options: "i" }, },
                        ]
                }
                if (status) {
                        query.status = status
                }
                if (brandId) {
                        query.brandId = brandId
                }
                if (nutritionId) {
                        query.nutritionId = nutritionId
                }
                if (productTypeId) {
                        query.productTypeId = productTypeId
                }
                if (skinConditionId) {
                        query.skinConditionId = skinConditionId
                }
                if (skinTypeId) {
                        query.skinTypeId = skinTypeId
                }
                if (quantity) {
                        query.quantity = quantity
                }
                if (fromDate && !toDate) {
                        query.createdAt = { $gte: fromDate };
                }
                if (!fromDate && toDate) {
                        query.createdAt = { $lte: toDate };
                }
                if (fromDate && toDate) {
                        query.$and = [
                                { createdAt: { $gte: fromDate } },
                                { createdAt: { $lte: toDate } },
                        ]
                }
                let options = {
                        page: Number(page) || 1,
                        limit: Number(limit) || 15,
                        sort: { createdAt: -1 },
                        populate: ('brandId nutritionId productTypeId skinConditionId skinTypeId')
                };
                let data = await product.paginate(query, options);
                return res.status(200).json({ status: 200, message: "Product data found.", data: data });

        } catch (err) {
                return res.status(500).send({ msg: "internal server error ", error: err.message, });
        }
};
exports.getIdProduct = async (req, res) => {
        try {
                const data = await product.findById(req.params.id).populate('brandId')
                if (!data || data.length === 0) {
                        return res.status(400).send({ msg: "not found" });
                }
                return res.status(200).json({ status: 200, message: "Product data found.", data: data });
        } catch (err) {
                return res.status(500).send({ msg: "internal server error ", error: err.message, });
        }
};
exports.getIdProductByToken = async (req, res) => {
        try {
                const productId = req.params.id;
                const productData = await product.findById(productId).populate('brandId');

                if (!productData) {
                        return res.status(400).json({ msg: "Product not found" });
                }

                const userData = await User.findOne({ _id: req.user._id }).select('-password').populate('subscriptionId');
                const isSubscription = userData.isSubscription || false;

                let sizePrice = [];

                if (productData.multipleSize) {
                        sizePrice = productData.sizePrice.map(size => {
                                const membershipDiscount = isSubscription ? size.price * (userData.subscriptionId.discount / 100) : 0;
                                const membshipPrice = isSubscription ? size.price - membershipDiscount : 0;
                                return {
                                        _id: size._id,
                                        size: size.size,
                                        price: size.price,
                                        stock: size.stock,
                                        status: size.status,
                                        membershipDiscount,
                                        membshipPrice,
                                        membershipDiscountPer: isSubscription ? userData.subscriptionId.discount : 0,
                                };
                        });
                }
                const productDetails = {
                        brandId: productData.brandId,
                        nutritionId: productData.nutritionId,
                        productTypeId: productData.productTypeId,
                        skinConditionId: productData.skinConditionId,
                        skinTypeId: productData.skinTypeId,
                        name: productData.name,
                        description: productData.description,
                        size: productData.size,
                        multipleSize: productData.multipleSize,
                        contents: productData.contents,
                        result: productData.result,
                        benfit: productData.benfit,
                        additionalInfo: productData.additionalInfo,
                        howTouse: productData.howTouse,
                        methodToUse: productData.methodToUse,
                        returnPolicy: productData.returnPolicy,
                        keyIngredients: productData.keyIngredients,
                        ingredients: productData.ingredients,
                        price: productData.price,
                        sizePrice,
                        ratings: productData.ratings,
                        productImages: productData.productImages,
                        stock: productData.stock,
                        numOfReviews: productData.numOfReviews,
                        reviews: productData.reviews,
                        status: productData.howTouse,
                        beforeAfterImage: productData.beforeAfterImage,
                        acneType: productData.acneType,
                        considerAcne: productData.considerAcne,
                };

                if (!productData.multipleSize) {
                        productDetails.membershipDiscount = isSubscription ? productData.price * (userData.subscriptionId.discount / 100) : 0;
                        productDetails.membshipPrice = isSubscription ? productData.price - productDetails.membershipDiscount : 0;
                        productDetails.membershipDiscountPer = isSubscription ? userData.subscriptionId.discount : 0;
                }

                const findData = await recentlyView.findOne({ user: req.user._id, products: productData._id });
                if (findData) {
                        await recentlyView.findByIdAndUpdate(findData._id, { $set: { products: productData._id } });
                } else {
                        await recentlyView.create({ user: req.user._id, products: productData._id, type: "P" });
                }

                return res.status(200).json({ status: 200, message: "Product data found.", data: productDetails });
        } catch (err) {
                return res.status(500).json({ msg: "Internal server error", error: err.message });
        }
};
exports.editProduct = async (req, res) => {
        try {
                const data = await product.findById(req.params.id);
                if (!data) {
                        return res.status(400).send({ msg: "not found" });
                } else {
                        console.log(req.body);
                        if (req.body.brandId != (null || undefined)) {
                                const data0 = await Brand.findById(req.body.brandId);
                                if (!data0 || data0.length === 0) {
                                        return res.status(400).send({ status: 404, msg: "Brand not found" });
                                }
                        }
                        if (req.body.nutritionId != (null || undefined)) {
                                const data1 = await Nutrition.findById(req.body.nutritionId);
                                if (!data1 || data1.length === 0) {
                                        return res.status(400).send({ status: 404, msg: "Nutrition not found" });
                                }
                        }
                        if (req.body.productTypeId != (null || undefined)) {
                                const data2 = await ProductType.findById(req.body.productTypeId);
                                if (!data2 || data2.length === 0) {
                                        return res.status(400).send({ status: 404, msg: "ProductType not found" });
                                }
                        }
                        if (req.body.skinConditionId != (null || undefined)) {
                                const data3 = await SkinCondition.findById(req.body.skinConditionId);
                                if (!data3 || data3.length === 0) {
                                        return res.status(400).send({ status: 404, msg: "SkinCondition not found" });
                                }
                        }
                        if (req.body.skinTypeId != (null || undefined)) {
                                const data4 = await SkinType.findById(req.body.skinTypeId);
                                if (!data4 || data4.length === 0) {
                                        return res.status(400).send({ status: 404, msg: "SkinType not found" });
                                }
                        }
                        let productImages = [], result = [], howTouse = [], additionalInfo = [], sizePrice = [];
                        if (req.files['image'] != (null || undefined)) {
                                let docs = req.files['image'];
                                for (let i = 0; i < docs.length; i++) {
                                        let obj = {
                                                image: docs[i].path
                                        }
                                        productImages.push(obj)
                                }
                        } else {
                                productImages = data.productImages
                        }
                        if (req.files['result'] != (null || undefined)) {
                                let docs = req.files['result'];
                                for (let i = 0; i < docs.length; i++) {
                                        result.push(docs[i].path)
                                }
                        } else {
                                result = data.result
                        }
                        if (req.body.step != (null || undefined)) {
                                if (req.body.step.length > 0) {
                                        for (let i = 0; i < req.body.step.length; i++) {
                                                let obj = {
                                                        step: req.body.step[i],
                                                        description: req.body.stepDescription[i]
                                                }
                                                howTouse.push(obj)
                                        }
                                }

                        } else {
                                howTouse = data.howTouse;
                        }
                        if (req.body.title != undefined) {
                                for (let i = 0; i < req.body.title.length; i++) {
                                        let obj = {
                                                title: req.body.title[i],
                                                description: req.body.addDescription[i]
                                        }
                                        additionalInfo.push(obj)
                                }
                        }
                        if (req.body.multipleSize == 'true') {
                                for (let i = 0; i < req.body.sizes.length; i++) {
                                        let status;
                                        if (req.body.multipleStock[i] > 0) { status = "STOCK" }
                                        if (req.body.multipleStock[i] <= 0) { status = "OUTOFSTOCK" }
                                        let obj = {
                                                size: req.body.sizes[i],
                                                price: req.body.multiplePrice[i],
                                                stock: req.body.multipleStock[i],
                                                status: status
                                        }
                                        sizePrice.push(obj)
                                }
                        } else {
                                req.body.sizePrice = data.sizePrice;
                        }
                        if (req.body.quantity > 0) { req.body.status = "STOCK" }
                        if (req.body.quantity <= 0) { req.body.status = "OUTOFSTOCK" }
                        let productObj = {
                                brandId: req.body.brandId || data.brandId,
                                nutritionId: req.body.nutritionId || data.nutritionId,
                                productTypeId: req.body.productTypeId || data.productTypeId,
                                skinConditionId: req.body.skinConditionId || data.skinConditionId,
                                skinTypeId: req.body.skinTypeId || data.skinTypeId,
                                name: req.body.name || data.name,
                                description: req.body.description || data.description,
                                additionalInfo: additionalInfo || data.additionalInfo,
                                howTouse: howTouse,
                                ingredients: req.body.ingredients || data.ingredients,
                                price: req.body.price || data.price,
                                quantity: req.body.quantity || data.quantity,
                                ratings: data.ratings,
                                productImages: productImages,
                                result: result,
                                numOfReviews: data.numOfReviews,
                                reviews: data.reviews,
                                status: data.status,
                        }
                        const data5 = await product.findByIdAndUpdate({ _id: data._id }, { $set: productObj }, { new: true });
                        return res.status(200).json({ status: 200, message: "Product update successfully.", data: data5 });
                }
        } catch (err) {
                console.log(err);
                return res.status(500).send({ msg: "internal server error ", error: err.message, });
        }
};
exports.deleteProduct = async (req, res) => {
        try {
                const data = await product.findById(req.params.id);
                if (!data) {
                        return res.status(400).send({ msg: "not found" });
                } else {
                        const data1 = await product.findByIdAndDelete(data._id);
                        return res.status(200).json({ status: 200, message: "Product delete successfully.", data: {} });
                }
        } catch (err) {
                return res.status(500).send({ msg: "internal server error ", error: err.message, });
        }
};
exports.createProductReview = async (req, res, next) => {
        try {
                const data = await User.findOne({ _id: req.user._id, });
                if (!data) {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                } else {
                        const { rating, skinType, acenSeverity, skinTone, skinConcern, comment, productId } = req.body;
                        const findProducts = await product.findById(productId);
                        if (findProducts.reviews.length == 0) {
                                const review = {
                                        user: req.user._id,
                                        name: req.user.name,
                                        rating: Number(rating),
                                        skinType,
                                        acenSeverity,
                                        skinTone,
                                        skinConcern,
                                        comment
                                };
                                findProducts.reviews.push(review);
                                findProducts.numOfReviews = findProducts.reviews.length;
                        } else {
                                const isReviewed = findProducts.reviews.find((rev) => { rev.user.toString() === req.user._id.toString() });
                                if (isReviewed) {
                                        findProducts.reviews.forEach((rev) => {
                                                if (rev.user.toString() === req.user._id.toString()) (rev.rating = rating), (rev.comment = comment);
                                        });
                                } else {
                                        const review = {
                                                user: req.user._id,
                                                name: req.user.name,
                                                rating: Number(rating),
                                                skinType,
                                                acenSeverity,
                                                skinTone,
                                                skinConcern,
                                                comment
                                        };
                                        findProducts.reviews.push(review);
                                        findProducts.numOfReviews = findProducts.reviews.length;
                                }
                        }
                        let avg = 0;
                        findProducts.reviews.forEach((rev) => { avg += rev.rating; });
                        findProducts.ratings = avg / findProducts.reviews.length;
                        await findProducts.save({ validateBeforeSave: false })
                        const findProduct = await product.findById(productId);
                        return res.status(200).json({ status: 200, data: findProduct.reviews });
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.getProductReviews = async (req, res, next) => {
        const findProduct = await product.findById(req.params.id).populate({ path: 'reviews.user' });
        if (!findProduct) {
                return res.status(404).json({ message: "Product not found.", status: 404, data: {} });
        }
        return res.status(200).json({ status: 200, reviews: findProduct.reviews, });
};
exports.deleteProductReview = async (req, res, next) => {
        try {
                const id = req.body.reviewId;
                const productId = req.body.productId;
                const findProduct = await product.findById(productId)
                if (!findProduct) {
                        return res.status(404).json({ status: 404, message: "Product not found", data: {} });
                }
                const reviewIndex = findProduct.reviews.findIndex(
                        (review) => review._id.toString() === id.toString()
                );
                if (reviewIndex === -1) {
                        return res.status(404).json({ status: 404, message: "Review not found", data: {} });
                }
                findProduct.reviews.splice(reviewIndex, 1);
                findProduct.numOfReviews = findProduct.reviews.length;
                if (findProduct.reviews.length > 0) {
                        let avg = 0;
                        findProduct.reviews.forEach((rev) => {
                                avg += rev.rating;
                        });
                        findProduct.ratings = avg / findProduct.reviews.length;
                } else {
                        findProduct.ratings = 0;
                }
                await findProduct.save({ validateBeforeSave: false });
                return res.status(200).json({ status: 200, message: "Review deleted", data: findProduct.reviews });
        } catch (error) {
                console.log(error);
                return res.status(500).send({ status: 500, message: "Server error.", data: {} });
        }
};
exports.createService = async (req, res) => {
        try {
                const categoryIds = req.body.categoryId;
                if (categoryIds || categoryIds.length > 0) {
                        const productPromises = [];
                        for (const categoryId of categoryIds) {
                                const data5 = await Category.findById({ _id: categoryId });
                                if (!data5 || data5.length === 0) {
                                        return res.status(400).send({ status: 404, msg: `category with ID ${categoryId} not found` });
                                }
                                let images = [], beforeAfterImage, sizePrice = [];
                                if (req.files['image'] != (null || undefined)) {
                                        let docs = req.files['image'];
                                        for (let i = 0; i < docs.length; i++) {
                                                let obj = {
                                                        img: docs[i].path
                                                }
                                                images.push(obj)
                                        }
                                }
                                if (req.files['beforeAfterImage'] != (null || undefined)) {
                                        let docs = req.files['beforeAfterImage'];
                                        beforeAfterImage = docs[0].path
                                }
                                if (req.body.type == 'offer') {
                                        const price = req.body.price;
                                        const discountPrice = req.body.discountPrice;
                                        const discountDifference = price - discountPrice;
                                        req.body.discount = Number((discountDifference / price) * 100).toFixed();
                                } else {
                                        if (req.body.multipleSize == 'true') {
                                                for (let i = 0; i < req.body.sizes.length; i++) {
                                                        let obj = {
                                                                size: req.body.sizes[i],
                                                                price: req.body.multiplePrice[i],
                                                                mPrice: req.body.memberPrice[i],
                                                        }
                                                        sizePrice.push(obj)
                                                }
                                        } else {
                                                req.body.size = req.body.size;
                                        }
                                }
                                req.body.sizePrice = sizePrice;
                                req.body.images = images;
                                req.body.beforeAfterImage = beforeAfterImage;
                                req.body.categoryId = categoryId;
                                function convertTimeToMinutes(timeString) {
                                        const regex = /(\d+)\s*hr(?:\s*(\d*)\s*min)?/;
                                        const regex1 = /(\d+)\s*(?:min)?/;
                                        const match = timeString.match(regex);
                                        const match1 = timeString.match(regex1);
                                        if (!match) {
                                                if (!match1) {
                                                        throw new Error("Invalid time format");
                                                }
                                        }
                                        let hours, minutes;
                                        if (match) {
                                                hours = parseInt(match[1]) || 0;
                                                minutes = parseInt(match[2]) || 0;
                                        }
                                        if (match1) {
                                                hours = 0;
                                                minutes = parseInt(match1[1]) || 0;
                                        }
                                        return hours * 60 + minutes;
                                }
                                req.body.totalMin = convertTimeToMinutes(req.body.totalTime)
                                const productCreated = await services.create(req.body);
                                productPromises.push(productCreated);
                        }
                        const ProductCreated = await Promise.all(productPromises);
                        return res.status(201).send({ status: 200, message: "Service added successfully", data: ProductCreated });
                }
                // const data = await Category.findById(req.body.categoryId);
                // if (!data || data.length === 0) {
                //         return res.status(400).send({ status: 404, msg: "not found" });
                // }

                // const ProductCreated = await services.create(req.body);
                // if (ProductCreated) {
                //         return res.status(201).send({ status: 200, message: "Service add successfully", data: ProductCreated, });
                // }
        } catch (err) {
                console.log(err);
                return res.status(500).send({ message: "Internal server error while creating Service", });
        }
};
exports.paginateServiceSearch = async (req, res) => {
        try {
                const { search, fromDate, toDate, categoryId, status, page, limit } = req.query;
                let query = { type: "Service" };
                if (search) {
                        query.$or = [
                                { "name": { $regex: req.query.search, $options: "i" }, },
                                { "description": { $regex: req.query.search, $options: "i" }, },
                        ]
                }
                if (status) {
                        query.status = status
                }
                if (categoryId) {
                        query.categoryId = categoryId
                }
                if (fromDate && !toDate) {
                        query.createdAt = { $gte: fromDate };
                }
                if (!fromDate && toDate) {
                        query.createdAt = { $lte: toDate };
                }
                if (fromDate && toDate) {
                        query.$and = [
                                { createdAt: { $gte: fromDate } },
                                { createdAt: { $lte: toDate } },
                        ]
                }
                let options = {
                        page: Number(page) || 1,
                        limit: Number(limit) || 100,
                        sort: { createdAt: -1 },
                        populate: ('categoryId')
                };
                let data = await services.paginate(query, options);
                return res.status(200).json({ status: 200, message: "service data found.", data: data });

        } catch (err) {
                return res.status(500).send({ msg: "internal server error ", error: err.message, });
        }
};
exports.getAllServices = async (req, res) => {
        try {
                const findSubscription = await services.find({ type: 'Service', multipleSize: { $ne: true } }).lean();
                if (findSubscription.length === 0) {
                        return res.status(404).send({ status: 404, message: "Services Not found", data: {} });
                } else {
                        const uniqueServices = findSubscription.reduce((acc, service) => {
                                if (!acc.some((s) => s.name === service.name)) {
                                        acc.push(service);
                                }
                                return acc;
                        }, []);
                        return res.status(200).send({ status: 200, message: "Services found successfully.", data: uniqueServices });
                }
        } catch (error) {
                console.log(error);
                return res.status(500).json({ status: 500, error: "Internal Server Error" });
        }
};
// exports.getAllServices = async (req, res) => {
//         try {
//                 const findSubscription = await services.find({ type: 'Service' }).lean();
//                 if (findSubscription.length == 0) {
//                         return res.status(404).send({ status: 404, message: "Services Not found", data: {} });
//                 } else {
//                         return res.status(200).send({ status: 200, message: "Services found successfully.",data: findSubscription, length : findSubscription.length  });
//                 }
//         } catch (error) {
//                 console.log(error);
//                 return res.status(500).json({ status: 500, error: "Internal Server Error" });
//         }
// };
exports.getServiceByToken = async (req, res, next) => {
        try {
                if (req.query.categoryId != (null || undefined)) {
                        const servicesList = await services.find({ categoryId: req.query.categoryId, type: "Service" });
                        const servicesWithDynamicFields = [];
                        const userCart = await Cart.findOne({ user: req.user._id });
                        for (const service of servicesList) {
                                let isInCart = false;
                                let quantityInCart = 0;
                                if (userCart) {
                                        const cartItem = userCart.services.find((cartItem) => cartItem.serviceId?.equals(service._id));
                                        if (cartItem) {
                                                isInCart = true;
                                                quantityInCart = cartItem.quantity;
                                        }
                                }
                                const serviceWithDynamicFields = {
                                        ...service.toObject(),
                                        isInCart,
                                        quantityInCart,
                                };
                                servicesWithDynamicFields.push(serviceWithDynamicFields);
                        }
                        return res.status(200).json({ status: 200, message: "Services data found.", data: servicesWithDynamicFields, });
                } else {
                        const servicesList = await services.find({ type: "Service" });
                        const servicesWithDynamicFields = [];
                        const userCart = await Cart.findOne({ user: req.user._id });
                        for (const service of servicesList) {
                                let isInCart = false;
                                let quantityInCart = 0;
                                if (userCart) {
                                        const cartItem = userCart.services.find((cartItem) => cartItem.serviceId?.equals(service._id));
                                        if (cartItem) {
                                                isInCart = true;
                                                quantityInCart = cartItem.quantity;
                                        }
                                }
                                const serviceWithDynamicFields = {
                                        ...service.toObject(),
                                        isInCart,
                                        quantityInCart,
                                };
                                servicesWithDynamicFields.push(serviceWithDynamicFields);
                        }
                        return res.status(200).json({ status: 200, message: "Services data found.", data: servicesWithDynamicFields, });
                }
        } catch (err) {
                console.log(err);
                return res.status(500).send({ message: "Internal server error while fetching services" });
        }
};
exports.getIdService = async (req, res) => {
        try {
                const data = await services.findById(req.params.id).populate('categoryId')
                if (!data || data.length === 0) {
                        return res.status(400).send({ msg: "not found" });
                }
                return res.status(200).json({ status: 200, message: "Service data found.", data: data });
        } catch (err) {
                return res.status(500).send({ msg: "internal server error ", error: err.message, });
        }
};
exports.getIdServiceByToken = async (req, res) => {
        try {
                const data = await services.findById(req.params.id).populate('categoryId');
                if (!data) {
                        return res.status(400).send({ msg: "Service not found" });
                } else {
                        if (data.type = "Service") {
                                const userData = await User.findOne({ _id: req.user._id }).select('-password').populate('subscriptionId');
                                let membshipPrice = 0;
                                let membershipDiscount = 0;
                                let membershipDiscountPer = 0;
                                if (userData.isSubscription == true) {
                                        membershipDiscountPer = userData.subscriptionId.discount;
                                        membershipDiscount = parseFloat(data.price) * parseFloat((userData.subscriptionId.discount / 100).toFixed(2));
                                        membshipPrice = parseFloat(data.price) - parseFloat(membershipDiscount).toFixed(2);
                                } else {
                                        membershipDiscountPer = 0
                                        membershipDiscount = 0
                                        membshipPrice = 0;
                                }
                                const serviceWithDynamicFields = {
                                        ...data.toObject(),
                                        membershipDiscountPer,
                                        membershipDiscount,
                                        membshipPrice,
                                };
                                const findData = await recentlyView.findOne({ user: req.user._id, services: data._id });
                                if (findData) {
                                        const saved = await recentlyView.findByIdAndUpdate({ _id: findData._id }, { $set: { services: data._id } }, { new: true });
                                        if (saved) {
                                                return res.status(200).json({ status: 200, message: "Service data found.", data: serviceWithDynamicFields });
                                        }
                                } else {
                                        const saved = await recentlyView.create({ user: req.user._id, services: data._id, type: "S" });
                                        if (saved) {
                                                return res.status(200).json({ status: 200, message: "Service data found.", data: serviceWithDynamicFields });
                                        }
                                }
                        } else {
                                const findData = await recentlyView.findOne({ user: req.user._id, services: data._id });
                                if (findData) {
                                        const saved = await recentlyView.findByIdAndUpdate({ _id: findData._id }, { $set: { services: data._id } }, { new: true });
                                        if (saved) {
                                                return res.status(200).json({ status: 200, message: "Service data found.", data: data });
                                        }
                                } else {
                                        const saved = await recentlyView.create({ user: req.user._id, services: data._id, type: "S" });
                                        if (saved) {
                                                return res.status(200).json({ status: 200, message: "Service data found.", data: data });
                                        }
                                }
                        }
                }
        } catch (err) {
                return res.status(500).send({ msg: "Internal server error", error: err.message });
        }
};
exports.editService = async (req, res) => {
        try {
                const data = await services.findById(req.params.id);
                if (!data) {
                        return res.status(400).send({ msg: "not found" });
                } else {
                        if (req.body.categoryId != (null || undefined)) {
                                const data = await Category.findById(req.body.categoryId);
                                if (!data || data.length === 0) {
                                        return res.status(400).send({ status: 404, msg: "not found" });
                                }
                        }
                        let images = [], beforeAfterImage, sizePrice = [];
                        if (req.files['image'] != (null || undefined)) {
                                let docs = req.files['image'];
                                for (let i = 0; i < docs.length; i++) {
                                        let obj = {
                                                img: docs[i].path
                                        }
                                        images.push(obj)
                                }
                        } else {
                                images = data.images
                        }
                        if (req.files['beforeAfterImage'] != (null || undefined)) {
                                let docs = req.files['beforeAfterImage'];
                                beforeAfterImage = docs[0].path
                        } else {
                                beforeAfterImage = data.beforeAfterImage
                        }
                        let price = 0, mPrice = 0, discount = 0, discountPrice = 0;
                        if (req.body.type != (null || undefined) && (req.body.type == 'offer')) {
                                if ((req.body.price != (null || undefined)) && (req.body.discountPrice != (null || undefined))) {
                                        const price1 = req.body.price;
                                        price = req.body.price
                                        discountPrice = req.body.discountPrice;
                                        const discountDifference = price1 - discountPrice;
                                        discount = Number((discountDifference / price1) * 100).toFixed();
                                } else {
                                        price = data.price;
                                        discountPrice = data.discountPrice;
                                        discount = data.discount;
                                }
                        } else if (req.body.type != (null || undefined) && (req.body.type == 'Service')) {
                                if (req.body.multipleSize == 'true') {
                                        if (req.body.sizes.length > 0) {
                                                for (let i = 0; i < req.body.sizes.length; i++) {
                                                        let obj = {
                                                                size: req.body.sizes[i],
                                                                price: req.body.multiplePrice[i],
                                                                mPrice: req.body.memberPrice[i],
                                                        }
                                                        sizePrice.push(obj)
                                                }
                                        } else {
                                                sizePrice = data.sizePrice
                                        }
                                } else {
                                        if (req.body.price != (null || undefined)) {
                                                price = req.body.price;
                                                mPrice = req.body.mPrice;
                                                discountPrice = 0;
                                                discount = 0;
                                        } else {
                                                price = data.price;
                                                mPrice = data.mPrice;
                                                discountPrice = data.discountPrice;
                                                discount = data.discount;
                                        }
                                }
                        } else {
                                if (data.type == 'Service') {
                                        if (data.multipleSize == 'true') {
                                                sizePrice = data.sizePrice
                                        } else {
                                                price = data.price;
                                                mPrice = data.mPrice;
                                                discountPrice = data.discountPrice;
                                                discount = data.discount;
                                        }
                                }
                                if (data.type == 'offer') {
                                        price = data.price;
                                        discountPrice = data.discountPrice;
                                        discount = data.discount;
                                }
                        }
                        req.body.images = images;
                        let totalMin, totalTime;
                        if (req.body.totalTime != (null || undefined)) {
                                let totalMin1 = convertTimeToMinutes(req.body.totalTime);
                                function convertTimeToMinutes(timeString) {
                                        const regex = /(\d+)\s*hr(?:\s*(\d*)\s*min)?/;
                                        const regex1 = /(\d+)\s*(?:min)?/;
                                        const match = timeString.match(regex);
                                        const match1 = timeString.match(regex1);
                                        if (!match) {
                                                if (!match1) {
                                                        throw new Error("Invalid time format");
                                                }
                                        }
                                        let hours, minutes;
                                        if (match) {
                                                hours = parseInt(match[1]) || 0;
                                                minutes = parseInt(match[2]) || 0;
                                        }
                                        if (match1) {
                                                hours = 0;
                                                minutes = parseInt(match1[1]) || 0;
                                        }
                                        return hours * 60 + minutes;
                                }
                                totalTime = req.body.totalTime;
                                totalMin = totalMin1;
                        } else {
                                totalTime = data.totalTime;
                                totalMin = data.totalMin;
                        }
                        let productObj = {
                                categoryId: req.body.categoryId || data.categoryId,
                                name: req.body.name || data.name,
                                images: images,
                                beforeAfterImage: beforeAfterImage,
                                benfit: req.body.benfit || data.benfit,
                                session: req.body.session || data.session,
                                sizePrice: sizePrice,
                                area: req.body.area || data.area,
                                price: price,
                                mPrice: mPrice,
                                description: req.body.description || data.description,
                                discountPrice: discountPrice,
                                discount: discount,
                                totalTime: totalTime,
                                totalMin: totalMin
                        }
                        const data1 = await services.findByIdAndUpdate({ _id: data._id }, { $set: productObj }, { new: true });
                        return res.status(200).json({ status: 200, message: "Service update successfully.", data: data1 });
                }
        } catch (err) {
                console.log(err);
                return res.status(500).send({ msg: "internal server error ", error: err.message, });
        }
};
exports.deleteService = async (req, res) => {
        try {
                const data = await services.findById(req.params.id);
                if (!data) {
                        return res.status(400).send({ msg: "not found" });
                } else {
                        const data1 = await services.findByIdAndDelete(data._id);
                        return res.status(200).json({ status: 200, message: "Service delete successfully.", data: {} });
                }
        } catch (err) {
                return res.status(500).send({ msg: "internal server error ", error: err.message, });
        }
};
exports.getAllSubscription = async (req, res) => {
        try {
                const findSubscription = await Subscription.find();
                if (findSubscription.length == 0) {
                        return res.status(404).send({ status: 404, message: "Subscription Not found", data: {} });
                } else {
                        return res.status(200).send({ status: 200, message: "Subscription found successfully.", data: findSubscription });
                }
        } catch (error) {
                return res.status(500).json({ status: 500, error: "Internal Server Error" });
        }
};
exports.createSubscription = async (req, res) => {
        try {
                let findSubscription = await Subscription.findOne({ plan: req.body.plan });
                if (findSubscription) {
                        return res.status(409).send({ status: 409, message: "Subscription Already exit", data: {} });
                } else {
                        const newCategory = await Subscription.create(req.body);
                        return res.status(200).send({ status: 200, message: "Subscription Create successfully.", data: newCategory });
                }
        } catch (error) {
                return res.status(500).json({ status: 500, error: "Internal Server Error" });
        }
};
exports.getSubscriptionById = async (req, res) => {
        try {
                const findSubscription = await Subscription.findById(req.params.id);
                if (!findSubscription) {
                        return res.status(404).send({ status: 404, message: "Subscription Not found", data: {} });
                } else {
                        return res.status(200).send({ status: 200, message: "Subscription found successfully.", data: findSubscription });
                }
        } catch (error) {
                return res.status(500).json({ status: 500, error: "Internal Server Error" });
        }
};
exports.updateSubscription = async (req, res) => {
        try {
                const findSubscription = await Subscription.findById(req.params.id);
                if (!findSubscription) {
                        return res.status(404).send({ status: 404, message: "Subscription Not found", data: {} });
                } else {
                        let obj = {
                                plan: req.body.plan || findSubscription.plan,
                                price: req.body.price || findSubscription.price,
                                month: req.body.month || findSubscription.month,
                                discount: req.body.discount || findSubscription.discount,
                                details: req.body.details || findSubscription.details
                        }
                        const updatedCategory = await Subscription.findByIdAndUpdate(findSubscription._id, obj, { new: true });
                        return res.status(200).send({ status: 200, message: "Subscription found successfully.", data: updatedCategory });
                }
        } catch (error) {
                return res.status(500).json({ status: 500, error: "Internal Server Error" });
        }
};
exports.deleteSubscription = async (req, res) => {
        try {
                const findSubscription = await Subscription.findByIdAndDelete(req.params.id);
                if (!findSubscription) {
                        return res.status(404).send({ status: 404, message: "Subscription Not found", data: {} });
                }
                return res.status(200).send({ status: 200, message: "Subscription deleted successfully.", data: {} });
        } catch (error) {
                return res.status(500).json({ status: 500, error: "Internal Server Error" });
        }
};
exports.createPartner = async (req, res) => {
        try {
                const findData = await banner.findOne({ type: "Partner" });
                if (!findData) {
                        let partnerImage = [], data;
                        if (req.files) {
                                for (let i = 0; i < req.files.length; i++) {
                                        partnerImage.push(req.files[i].path)
                                }
                        }
                        data = {
                                title: req.body.title,
                                desc: req.body.desc,
                                partnerImage: partnerImage,
                                type: "Partner"
                        };
                        const Banner = await banner.create(data);
                        return res.status(200).json({ message: "Partner add successfully.", status: 200, data: Banner });
                } else {
                        let partnerImage = [], data;
                        if (req.files) {
                                for (let i = 0; i < req.files.length; i++) {
                                        partnerImage.push(req.files[i].path)
                                }
                        }
                        data = {
                                title: req.body.title || findData.title,
                                desc: req.body.desc || findData.desc,
                                partnerImage: partnerImage || findData.partnerImage,
                                type: "Partner"
                        };
                        const Banner = await banner.findByIdAndUpdate({ _id: findData._id }, { $set: data }, { new: true })
                        return res.status(200).json({ message: "Partner update successfully.", status: 200, data: Banner });
                }
        } catch (error) {
                return res.status(500).json({ status: 500, message: "internal server error ", data: error.message, });
        }
};
exports.createShopPage = async (req, res) => {
        try {
                const findData = await banner.findOne({ type: "shopPage" });
                if (!findData) {
                        let shopImage = [], data, shopDetails = [];
                        if (req.files['shopImage'] != (null || undefined)) {
                                let docs = req.files['shopImage'];
                                console.log(docs);
                                for (let i = 0; i < docs.length; i++) {
                                        shopImage.push(docs[i].path)
                                }
                        }
                        if ((req.files['images'].length == req.body.title.length) && (req.files['images'].length == req.body.desc.length)) {
                                if (req.files['images'] != (null || undefined)) {
                                        let image = req.files['images'];
                                        console.log(image);
                                        for (let i = 0; i < image.length; i++) {
                                                let obj = {
                                                        title: req.body.title[i],
                                                        desc: req.body.desc[i],
                                                        image: image[i].path,
                                                }
                                                shopDetails.push(obj)
                                        }
                                }
                        }
                        data = {
                                shopDetails: shopDetails,
                                shopImage: shopImage,
                                type: "shopPage"
                        };
                        const Banner = await banner.create(data);
                        return res.status(200).json({ message: "ShopPage data add successfully.", status: 200, data: Banner });
                } else {
                        let shopImage = [], data, shopDetails = [];
                        if (req.files['shopImage'] != (null || undefined)) {
                                let docs = req.files['shopImage'];
                                console.log(docs);
                                for (let i = 0; i < docs.length; i++) {
                                        shopImage.push(docs[i].path)
                                }
                        }
                        if ((req.files['images'].length == req.body.title.length) && (req.files['images'].length == req.body.desc.length)) {
                                if (req.files['images'] != (null || undefined)) {
                                        let image = req.files['images'];
                                        console.log(image);
                                        for (let i = 0; i < image.length; i++) {
                                                let obj = {
                                                        title: req.body.title[i],
                                                        desc: req.body.desc[i],
                                                        image: image[i].path,
                                                }
                                                shopDetails.push(obj)
                                        }
                                }
                        }
                        data = {
                                shopDetails: shopDetails || findData.shopDetails,
                                shopImage: shopImage || findData.shopImage,
                                type: "shopPage"
                        };
                        const Banner = await banner.findByIdAndUpdate({ _id: findData._id }, { $set: data }, { new: true })
                        return res.status(200).json({ message: "Shop update successfully.", status: 200, data: Banner });

                }
        } catch (error) {
                return res.status(500).json({ status: 500, message: "internal server error ", data: error.message, });
        }
};
exports.createServicePage = async (req, res) => {
        try {
                const findData = await banner.findOne({ type: "servicePage" });
                if (!findData) {
                        let serviceImage = [], data;
                        if (req.files) {
                                for (let i = 0; i < req.files.length; i++) {
                                        serviceImage.push(req.files[i].path)
                                }
                        }
                        data = {
                                serviceImage: serviceImage,
                                type: "servicePage"
                        };
                        const Banner = await banner.create(data);
                        return res.status(200).json({ message: "servicePage add successfully.", status: 200, data: Banner });
                } else {
                        let serviceImage = [], data;
                        if (req.files) {
                                for (let i = 0; i < req.files.length; i++) {
                                        serviceImage.push(req.files[i].path)
                                }
                        }
                        data = {
                                serviceImage: serviceImage || findData.serviceImage,
                                type: "servicePage"
                        };
                        const Banner = await banner.findByIdAndUpdate({ _id: findData._id }, { $set: data }, { new: true })
                        return res.status(200).json({ message: "servicePage update successfully.", status: 200, data: Banner });
                }
        } catch (error) {
                return res.status(500).json({ status: 500, message: "internal server error ", data: error.message, });
        }
};
exports.createBanner = async (req, res) => {
        try {
                const findData = await banner.findOne({ type: req.body.type });
                if (findData) {
                        let data;
                        let bannerImage;
                        if (req.file.path) {
                                bannerImage = req.file.path
                        }
                        data = {
                                title: req.body.title || findData.title,
                                desc: req.body.desc || findData.desc,
                                bannerName: req.body.bannerName || findData.bannerName,
                                bannerImage: bannerImage || findData.bannerImage,
                                type: req.body.type || findData.type,
                        };
                        const Banner = await banner.findByIdAndUpdate({ _id: findData._id }, { $set: data }, { new: true })
                        return res.status(200).json({ message: "Banner update successfully.", status: 200, data: Banner });
                } else {
                        let bannerImage, data;
                        if (req.file.path) {
                                bannerImage = req.file.path
                        }
                        data = {
                                title: req.body.title,
                                desc: req.body.desc,
                                bannerName: req.body.bannerName,
                                bannerImage: bannerImage,
                                type: req.body.type
                        };
                        const Banner = await banner.create(data);
                        return res.status(200).json({ message: "Banner add successfully.", status: 200, data: Banner });
                }
        } catch (error) {
                return res.status(500).json({ status: 500, message: "internal server error ", data: error.message, });
        }
};
exports.createHomePageBanner = async (req, res) => {
        try {
                const findData = await banner.findOne({ type: "HomePage" });
                if (findData) {
                        let bannerImage, data;
                        if (req.file.path) {
                                bannerImage = req.file.path
                        }
                        data = {
                                title: req.body.title || findData.title,
                                description: req.body.description || findData.description,
                                bannerImage: bannerImage || findData.bannerImage,
                                type: "HomePage"
                        };
                        const Banner = await banner.findByIdAndUpdate({ _id: findData._id }, { $set: data }, { new: true })
                        return res.status(200).json({ message: "Banner update successfully.", status: 200, data: Banner });
                } else {
                        let bannerImage, data;
                        if (req.file.path) {
                                bannerImage = req.file.path
                        }
                        data = {
                                title: req.body.title,
                                description: req.body.description,
                                bannerImage: bannerImage,
                                type: 'HomePage'
                        };
                        const Banner = await banner.create(data);
                        return res.status(200).json({ message: "Banner add successfully.", status: 200, data: Banner });
                }
        } catch (error) {
                return res.status(500).json({ status: 500, message: "internal server error ", data: error.message, });
        }
};
exports.getBanner = async (req, res) => {
        try {
                const data = await banner.find({ type: req.params.type })
                if (data.length === 0) {
                        return res.status(400).send({ msg: "not found" });
                }
                return res.status(200).json({ status: 200, message: "Banner data found.", data: data });
        } catch (err) {
                return res.status(500).send({ msg: "internal server error ", error: err.message, });
        }
};
exports.getAllBanner = async (req, res) => {
        try {
                const data = await banner.find({})
                if (data.length === 0) {
                        return res.status(400).send({ msg: "not found" });
                }
                return res.status(200).json({ status: 200, message: "Banner data found.", data: data });
        } catch (err) {
                return res.status(500).send({ msg: "internal server error ", error: err.message, });
        }
};
exports.getIdBanner = async (req, res) => {
        try {
                const data = await banner.findById(req.params.id);
                if (!data) {
                        return res.status(400).send({ msg: "not found" });
                }
                return res.status(200).json({ status: 200, message: "Banner data found.", data: data });
        } catch (err) {
                return res.status(500).send({ msg: "internal server error ", error: err.message, });
        }
}
exports.deleteBanner = async (req, res) => {
        try {
                const data = await banner.findByIdAndDelete(req.params.id);
                if (!data) {
                        return res.status(400).send({ msg: "not found" });
                }
                return res.status(200).send({ msg: "deleted", data: data });
        } catch (err) {
                console.log(err.message);
                return res.status(500).send({ msg: "internal server error", error: err.message, });
        }
};
exports.updateBanner = async (req, res) => {
        try {
                const findData = await banner.findById(req.params.id);
                if (!findData) {
                        return res.status(400).send({ msg: "not found" });
                }
                let data;
                let bannerImage;
                if (req.file.path) {
                        bannerImage = req.file.path
                }
                data = {
                        title: req.body.title || findData.title,
                        desc: req.body.desc || findData.desc,
                        bannerName: req.body.bannerName || findData.bannerName,
                        bannerImage: bannerImage || findData.bannerImage,
                        type: req.body.type || findData.type,
                };
                const Banner = await banner.findByIdAndUpdate({ _id: findData._id }, { $set: data }, { new: true })
                return res.status(200).json({ message: "Banner update successfully.", status: 200, data: Banner });
        } catch (error) {
                return res.status(500).json({ status: 500, message: "internal server error ", data: error.message, });
        }
};
exports.createPromotionBanner = async (req, res) => {
        try {
                let bannerImage, data;
                const findData = await banner.findOne({ type: "Promotion" })
                if (findData) {
                        if (req.file.path) {
                                bannerImage = req.file.path
                        }
                        data = {
                                title: req.body.title || findData.title,
                                desc: req.body.desc || findData.desc,
                                off: req.body.off || findData.off,
                                refferalCode: req.user.refferalCode || findData.refferalCode,
                                appleLink: req.body.appleLink || findData.appleLink,
                                playstoreLink: req.body.playstoreLink || findData.playstoreLink,
                                bannerImage: bannerImage || findData.bannerImage,
                                type: 'Promotion'
                        };
                        const Banner = await banner.findByIdAndUpdate({ _id: findData._id }, { $set: data }, { new: true })
                        return res.status(200).json({ message: "Banner update successfully.", status: 200, data: Banner });
                } else {
                        if (req.file.path) {
                                bannerImage = req.file.path
                        }
                        data = {
                                title: req.body.title,
                                desc: req.body.desc,
                                refferalCode: req.user.refferalCode,
                                off: req.body.off,
                                appleLink: req.body.appleLink,
                                playstoreLink: req.body.playstoreLink,
                                bannerImage: bannerImage,
                                type: 'Promotion'
                        };
                        const Banner = await banner.create(data);
                        return res.status(200).json({ message: "Banner add successfully.", status: 200, data: Banner });
                }
        } catch (error) {
                return res.status(500).json({ status: 500, message: "internal server error ", data: error.message, });
        }
};
exports.createGallarys = async (req, res) => {
        try {
                let fileUrl;
                if (req.file) {
                        fileUrl = req.file ? req.file.path : "";
                }
                const data = { description: req.body.description, image: fileUrl };
                const category = await Gallary.create(data);
                return res.status(200).json({ message: "Gallary add successfully.", status: 200, data: category });
        } catch (error) {
                return res.status(500).json({ status: 500, message: "internal server error ", data: error.message, });
        }
};
exports.getGallarys = async (req, res) => {
        const categories = await Gallary.find({});
        if (categories.length > 0) {
                return res.status(201).json({ message: "Gallary Found", status: 200, data: categories, });
        }
        return res.status(201).json({ message: "Gallary not Found", status: 404, data: {}, });

};
exports.updateGallary = async (req, res) => {
        const { id } = req.params;
        const category = await Gallary.findById(id);
        if (!category) {
                return res.status(404).json({ message: "Gallary Not Found", status: 404, data: {} });
        }
        let fileUrl;
        if (req.file) {
                fileUrl = req.file ? req.file.path : "";
        }
        category.image = fileUrl || category.image;
        category.description = req.body.description || category.description;
        let update = await category.save();
        return res.status(200).json({ message: "Updated Successfully", data: update });
};
exports.removeGallary = async (req, res) => {
        const { id } = req.params;
        const category = await Gallary.findById(id);
        if (!category) {
                return res.status(404).json({ message: "Gallary Not Found", status: 404, data: {} });
        } else {
                await Gallary.findByIdAndDelete(category._id);
                return res.status(200).json({ message: "Gallary Deleted Successfully !" });
        }
};
exports.addContactDetails = async (req, res) => {
        try {
                const user = await User.findById(req.user._id);
                if (!user) {
                        return res.status(404).send({ message: "not found" });
                } else {
                        let findContact = await contact.findOne();
                        if (findContact) {
                                let image;
                                if (req.file) {
                                        image = req.file ? req.file.path : "";
                                }
                                let obj = {
                                        image: image || findContact.image,
                                        name: req.body.name || findContact.name,
                                        fb: req.body.fb || findContact.fb,
                                        google: req.body.google || findContact.google,
                                        instagram: req.body.instagram || findContact.instagram,
                                        map: req.body.map || findContact.map,
                                        mapLink: req.body.mapLink || findContact.mapLink,
                                        address: req.body.address || findContact.address,
                                        phone: req.body.phone || findContact.phone,
                                        email: req.body.email || findContact.email,
                                        monToFriday: req.body.monToFriday || findContact.monToFriday,
                                        saturday: req.body.saturday || findContact.saturday,
                                        sundayClose: req.body.sundayClose || findContact.sundayClose,
                                        numOfReviews: req.body.numOfReviews || findContact.numOfReviews,
                                        ratings: req.body.ratings || findContact.ratings,
                                }
                                let updateContact = await contact.findByIdAndUpdate({ _id: findContact._id }, { $set: obj }, { new: true });
                                if (updateContact) {
                                        return res.status(200).json({ message: "Contact detail update successfully.", status: 200, data: updateContact });
                                }
                        } else {
                                if (req.file) {
                                        req.body.image = req.file ? req.file.path : "";
                                }
                                let result2 = await contact.create(req.body);
                                if (result2) {
                                        return res.status(200).json({ message: "Contact detail add successfully.", status: 200, data: result2 });
                                }
                        }
                }
        } catch (err) {
                console.log(err.message);
                return res.status(500).send({ msg: "internal server error", error: err.message, });
        }
};
exports.viewContactDetails = async (req, res) => {
        try {
                let findcontactDetails = await contact.findOne({});
                if (!findcontactDetails) {
                        return res.status(404).json({ message: "Contact detail not found.", status: 404, data: {} });
                } else {
                        return res.status(200).json({ message: "Contact detail found successfully.", status: 200, data: findcontactDetails });
                }
        } catch (err) {
                console.log(err.message);
                return res.status(500).send({ msg: "internal server error", error: err.message, });
        }
};
exports.addQuery = async (req, res) => {
        try {
                if ((req.body.name == (null || undefined)) || (req.body.email == (null || undefined)) || (req.body.name == "") || (req.body.email == "")) {
                        return res.status(404).json({ message: "name and email provide!", status: 404, data: {} });
                } else {
                        const Data = await helpandSupport.create(req.body);
                        return res.status(200).json({ message: "Help and Support  create.", status: 200, data: Data });
                }

        } catch (err) {
                return res.status(500).send({ msg: "internal server error", error: err.message, });
        }
};
exports.getAllHelpandSupport = async (req, res) => {
        try {
                const data = await helpandSupport.find();
                if (data.length == 0) {
                        return res.status(404).json({ message: "Help and Support not found.", status: 404, data: {} });
                }
                return res.status(200).json({ message: "Help and Support  found.", status: 200, data: data });
        } catch (err) {
                return res.status(500).send({ msg: "internal server error", error: err.message, });
        }
};
exports.getHelpandSupportById = async (req, res) => {
        try {
                const data = await helpandSupport.findById(req.params.id);
                if (!data) {
                        return res.status(404).json({ message: "Help and Support not found.", status: 404, data: {} });
                }
                return res.status(200).json({ message: "Help and Support  found.", status: 200, data: data });
        } catch (err) {
                return res.status(500).send({ msg: "internal server error", error: err.message, });
        }
};
exports.deleteHelpandSupport = async (req, res) => {
        try {
                const data = await helpandSupport.findById(req.params.id);
                if (!data) {
                        return res.status(404).json({ message: "Help and Support not found.", status: 404, data: {} });
                }
                await helpandSupport.deleteOne({ _id: req.params.id });
                return res.status(200).json({ message: "Help and Support  delete.", status: 200, data: {} });
        } catch (err) {
                return res.status(500).send({ msg: "internal server error", error: err.message, });
        }
};
exports.createNews = async (req, res) => {
        try {
                let fileUrl;
                if (req.file) {
                        fileUrl = req.file ? req.file.path : "";
                }
                const data = { description: req.body.description, title: req.body.title, image: fileUrl };
                const category = await News.create(data);
                return res.status(200).json({ message: "News add successfully.", status: 200, data: category });
        } catch (error) {
                return res.status(500).json({ status: 500, message: "internal server error ", data: error.message, });
        }
};
exports.getNews = async (req, res) => {
        const categories = await News.find({});
        if (categories.length > 0) {
                return res.status(201).json({ message: "News Found", status: 200, data: categories, });
        }
        return res.status(201).json({ message: "News not Found", status: 404, data: {}, });

};
exports.updateNews = async (req, res) => {
        const { id } = req.params;
        const category = await News.findById(id);
        if (!category) {
                return res.status(404).json({ message: "News Not Found", status: 404, data: {} });
        }
        let fileUrl;
        if (req.file) {
                fileUrl = req.file ? req.file.path : "";
        }
        category.image = fileUrl || category.image;
        category.title = req.body.title || category.title;
        category.description = req.body.description || category.description;
        let update = await category.save();
        return res.status(200).json({ message: "Updated Successfully", data: update });
};
exports.removeNews = async (req, res) => {
        const { id } = req.params;
        const category = await News.findById(id);
        if (!category) {
                return res.status(404).json({ message: "News Not Found", status: 404, data: {} });
        } else {
                await News.findByIdAndDelete(category._id);
                return res.status(200).json({ message: "News Deleted Successfully !" });
        }
};
exports.createClientReview = async (req, res) => {
        try {
                const { userName, title, description } = req.body;
                const findReview = new ClientReview({ userName, title, description, });
                const savedClientReview = await findReview.save();
                return res.status(201).json({ status: 201, data: savedClientReview });
        } catch (error) {
                console.error(error);
                return res.status(500).json({ error: "Failed to create clientReview" });
        }
};
exports.updateClientReview = async (req, res) => {
        const { id } = req.params;
        const category = await ClientReview.findById(id);
        if (!category) {
                return res.status(404).json({ message: "News Not Found", status: 404, data: {} });
        }
        category.userName = req.body.userName || category.userName;
        category.title = req.body.title || category.title;
        category.description = req.body.description || category.description;
        let update = await category.save();
        return res.status(200).json({ message: "Updated Successfully", data: update });
};
exports.getAllClientReviews = async (req, res) => {
        try {
                const findReview = await ClientReview.find();
                if (findReview.length > 0) {
                        return res.status(201).json({ message: "clientReview Found", status: 200, data: findReview, });
                }
                return res.status(201).json({ message: "clientReview not Found", status: 404, data: {}, });
        } catch (error) {
                console.error(error);
                return res.status(500).json({ error: "Failed to retrieve clientReviews" });
        }
};
exports.getClientReviewById = async (req, res) => {
        try {
                const findReview = await ClientReview.findById(req.params.id);
                if (findReview) {
                        return res.status(201).json({ message: "clientReview Found", status: 200, data: findReview, });
                }
                return res.status(201).json({ message: "clientReview not Found", status: 404, data: {}, });
        } catch (error) {
                console.error(error);
                return res.status(500).json({ error: "Failed to retrieve clientReview" });
        }
};
exports.removeClientReview = async (req, res) => {
        const { id } = req.params;
        const findReview = await ClientReview.findById(id);
        if (!findReview) {
                return res.status(404).json({ message: "clientReview Not Found", status: 404, data: {} });
        } else {
                await ClientReview.findByIdAndDelete(findReview._id);
                return res.status(200).json({ message: "clientReview Deleted Successfully !" });
        }
};
exports.getProductOrder = async (req, res) => {
        try {
                console.log("------------------------");
                const { search, fromDate, toDate, page, limit } = req.query;
                let query = { orderStatus: "confirmed" };
                if (search) {
                        query.$or = [
                                { "orderId": { $regex: req.query.search, $options: "i" }, },
                        ]
                }
                if (fromDate && !toDate) {
                        query.createdAt = { $gte: fromDate };
                }
                if (!fromDate && toDate) {
                        query.createdAt = { $lte: toDate };
                }
                if (fromDate && toDate) {
                        query.$and = [
                                { createdAt: { $gte: fromDate } },
                                { createdAt: { $lte: toDate } },
                        ]
                }
                let options = {
                        page: Number(page) || 1,
                        limit: Number(limit) || 50,
                        sort: { createdAt: -1 },
                        populate: ([
                                { path: "products.productId", select: { reviews: 0 } },
                                { path: "frequentlyBuyProductSchema.frequentlyBuyProductId", select: { reviews: 0 } },
                                { path: "coupon", select: "couponCode discount expirationDate" },
                                { path: 'user' }
                        ])
                };
                let data = await productOrder.paginate(query, options);
                return res.status(200).json({ status: 200, message: "Orders data found.", data: data });

        } catch (err) {
                return res.status(500).send({ msg: "internal server error ", error: err.message, });
        }
};
exports.getServiceOrders = async (req, res) => {
        try {
                console.log("------------------------");
                const { search, fromDate, toDate, page, limit } = req.query;
                let query = { orderStatus: { $in: ["adminUnconfirmed", "confirmed", "cancel"] } };
                if (search) {
                        query.$or = [
                                { "orderId": { $regex: req.query.search, $options: "i" }, },
                        ]
                }
                if (fromDate && !toDate) {
                        query.createdAt = { $gte: fromDate };
                }
                if (!fromDate && toDate) {
                        query.createdAt = { $lte: toDate };
                }
                if (fromDate && toDate) {
                        query.$and = [
                                { createdAt: { $gte: fromDate } },
                                { createdAt: { $lte: toDate } },
                        ]
                }
                let options = {
                        page: Number(page) || 1,
                        limit: Number(limit) || 50,
                        sort: { createdAt: -1 },
                        populate: ([
                                { path: "AddOnservicesSchema.addOnservicesId", select: { reviews: 0 } },
                                { path: "services.serviceId", select: { reviews: 0 } },
                                { path: "coupon", select: "couponCode discount expirationDate" },
                                { path: 'user' }
                        ])
                };
                let data = await serviceOrder.paginate(query, options);
                return res.status(200).json({ status: 200, message: "Orders data found.", data: data });

        } catch (err) {
                return res.status(500).send({ msg: "internal server error ", error: err.message, });
        }
};
exports.getServiceOrderswithDate = async (req, res) => {
        try {
                let aggregationPipeline = [
                        {
                                $group: {
                                        _id: {
                                                year: { $year: "$date" },
                                                month: { $month: "$date" },
                                                day: { $dayOfMonth: "$date" },
                                        },
                                        totalOrders: { $sum: 1 },
                                },
                        },
                        {
                                $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 },
                        },
                ];
                const totalOrderCounts = await serviceOrder.aggregate(aggregationPipeline);
                const datewiseOrders = await serviceOrder
                        .find({ orderStatus: { $in: ["adminUnconfirmed", "confirmed", "cancel"] } })
                        .populate([
                                { path: "services.serviceId", select: { reviews: 0 } },
                                { path: "AddOnservicesSchema.addOnservicesId", select: { reviews: 0 } },
                                { path: "coupon", select: "couponCode discount expirationDate" },
                                { path: "user" },
                        ])
                        .sort({ date: 1 });
                const datewiseData = datewiseOrders.reduce((result, order) => {
                        const { date, fromTime, toTime, services } = order;
                        console.log(date, fromTime, toTime);
                        const dateObject = new Date(date);
                        const orderDate = `${dateObject.getDate()}/${dateObject.getMonth() + 1}/${dateObject.getFullYear()}`;

                        const orderTime = new Date(toTime).toUTCString([], { hour: '2-digit', minute: '2-digit' });

                        if (!result[orderDate]) {
                                result[orderDate] = {
                                        totalOrders: 0,
                                        orders: [],
                                };
                        }

                        result[orderDate].orders.push({
                                ...order._doc,
                                orderTime,
                        });

                        return result;
                }, {});
                totalOrderCounts.forEach((order) => {
                        const { year, month, day } = order._id;
                        const date = `${day}/${month}/${year}`;

                        if (datewiseData[date]) {
                                datewiseData[date].totalOrders = order.totalOrders;
                                datewiseData[date].day = day;
                                datewiseData[date].month = month;
                                datewiseData[date].year = year;
                        }
                });
                const datewiseDataArray = Object.keys(datewiseData).map((date) => ({
                        date,
                        ...datewiseData[date],
                }));
                const datewiseDataArrayFormatted = datewiseDataArray.map((entry) => {
                        const [day, month, year] = entry.date.split('/');
                        const orderTime = entry.orders[0].orderTime;
                        const orderDateTime = new Date(orderTime);
                        let orderHour = orderDateTime.getHours();
                        let orderMinute = orderDateTime.getMinutes();
                        orderHour += 6;
                        orderMinute += 30;
                        if (orderMinute >= 60) {
                                orderMinute -= 60;
                                orderHour += 1;
                        }
                        const formattedOrderHour = orderHour.toString().padStart(2, '0');
                        const formattedOrderMinute = orderMinute.toString().padStart(2, '0');
                        return {
                                date: Number(day),
                                month: Number(month),
                                year: Number(year),
                                orderTime: `${formattedOrderHour}:${formattedOrderMinute}`,
                                orderHour,
                                orderMinute,
                                totalOrders: entry.totalOrders,
                                orders: entry.orders,
                        };
                });
                const response = {
                        status: 200,
                        message: "Orders data found.",
                        data: datewiseDataArrayFormatted,
                };
                const jsonResponse = JSON.stringify(response, (key, value) => {
                        if (key.startsWith("$__")) return undefined;
                        if (key.startsWith("$isNew")) return undefined;
                        return value;
                });
                return res.status(200).json(JSON.parse(jsonResponse));
        } catch (err) {
                console.log(err);
                return res.status(500).json({ status: 500, message: "Internal server error", error: err.message });
        }
};
exports.createIngredients = async (req, res) => {
        try {
                let findIngredients = await ingredients.findOne({ name: req.body.name, type: req.body.type });
                if (findIngredients) {
                        return res.status(409).json({ message: "Ingredients already exit.", status: 404, data: {} });
                } else {
                        const data = { name: req.body.name, type: req.body.type, };
                        const category = await ingredients.create(data);
                        return res.status(200).json({ message: "Ingredients add successfully.", status: 200, data: {} });
                }
        } catch (error) {
                return res.status(500).json({ status: 500, message: "internal server error ", data: error.message, });
        }
};
exports.getIngredients = async (req, res) => {
        const categories = await ingredients.find({});
        if (categories.length > 0) {
                return res.status(201).json({ message: "Ingredients Found", status: 200, data: categories, });
        }
        return res.status(201).json({ message: "Ingredients not Found", status: 404, data: {}, });

};
exports.updateIngredients = async (req, res) => {
        const { id } = req.params;
        const category = await ingredients.findById(id);
        if (!category) {
                return res.status(404).json({ message: "Ingredients Not Found", status: 404, data: {} });
        }
        category.type = req.body.type || category.type;
        category.name = req.body.name || category.name;
        let update = await category.save();
        return res.status(200).json({ message: "Updated Successfully", data: update });
};
exports.removeIngredients = async (req, res) => {
        const { id } = req.params;
        const category = await ingredients.findById(id);
        if (!category) {
                return res.status(404).json({ message: "Ingredients Not Found", status: 404, data: {} });
        } else {
                await ingredients.findByIdAndDelete(category._id);
                return res.status(200).json({ message: "Ingredients Deleted Successfully !" });
        }
};
exports.getIngredientsBytype = async (req, res) => {
        const categories = await ingredients.find({ type: req.params.type });
        if (categories.length > 0) {
                return res.status(201).json({ message: "Ingredients Found", status: 200, data: categories, });
        }
        return res.status(201).json({ message: "Ingredients not Found", status: 404, data: {}, });

};
exports.checkIngredient = async (req, res) => {
        const categories = await ingredients.findOne({ name: req.params.name });
        if (categories) {
                return res.status(200).json({ message: "Oops, Product is not safe for your skin.", status: 200, data: categories, });
        } else {
                return res.status(200).json({ message: "Congratulations, Product is safe for your skin.", status: 200, data: {}, });
        }

};
exports.createGiftCard = async (req, res) => {
        try {
                const findGiftCard = await giftCard.findOne({});
                if (findGiftCard) {
                        let image;
                        if (req.file) {
                                image = req.file.path;
                        } else {
                                image = findGiftCard.image;
                        }
                        let obj = {
                                name: req.body.name || findGiftCard.name,
                                image: image,
                                description: req.body.description || findGiftCard.description,
                        }
                        const ProductCreated = await giftCard.findByIdAndUpdate({ _id: findGiftCard._id }, { $set: obj }, { new: true });
                        if (ProductCreated) {
                                let priceArray = [];
                                if (req.body.giftCardrewards == (null || undefined)) {
                                        priceArray = findGiftCard.priceArray
                                } else {
                                        for (let i = 0; i < req.body.giftCardrewards.length; i++) {
                                                let x = {
                                                        giftCardrewards: Number(req.body.giftCardrewards[i]),
                                                        price: Number(req.body.price[i]),
                                                        giftId: ProductCreated._id
                                                }
                                                const Save = await giftPrice.create(x);
                                                priceArray.push(Save._id)
                                        }
                                }
                                const data1 = await giftCard.findByIdAndUpdate({ _id: ProductCreated._id }, { $set: { priceArray: priceArray } }, { new: true });
                                return res.status(201).send({ status: 200, message: "GiftCard add successfully", data: ProductCreated, });
                        }
                } else {
                        if (req.file) {
                                req.body.image = req.file.path
                        }
                        const ProductCreated = await giftCard.create(req.body);
                        if (ProductCreated) {
                                let priceArray = [];
                                for (let i = 0; i < req.body.giftCardrewards.length; i++) {
                                        let x = {
                                                giftCardrewards: Number(req.body.giftCardrewards[i]),
                                                price: Number(req.body.price[i]),
                                                giftId: ProductCreated._id
                                        }
                                        const Save = await giftPrice.create(x);
                                        priceArray.push(Save._id)
                                }
                                const data1 = await giftCard.findByIdAndUpdate({ _id: ProductCreated._id }, { $set: { priceArray: priceArray } }, { new: true });
                                return res.status(201).send({ status: 200, message: "GiftCard add successfully", data: data1, });
                        }
                }
        } catch (err) {
                console.log(err);
                return res.status(500).send({ message: "Internal server error while creating Product", });
        }
};
exports.getIdGiftCard = async (req, res) => {
        try {
                const data = await giftCard.findById(req.params.id)
                if (!data || data.length === 0) {
                        return res.status(400).send({ msg: "not found" });
                }
                return res.status(200).json({ status: 200, message: "GiftCard data found.", data: data });
        } catch (err) {
                return res.status(500).send({ msg: "internal server error ", error: err.message, });
        }
};
exports.getGiftCards = async (req, res) => {
        const categories = await giftCard.find({}).populate('priceArray');
        if (categories.length > 0) {
                return res.status(201).json({ message: "GiftCard Found", status: 200, data: categories, });
        }
        return res.status(201).json({ message: "Ingredients not Found", status: 404, data: {}, });
};
exports.updateGiftPrice = async (req, res) => {
        try {
                const data = await giftPrice.findById(req.params.id);
                if (!data) {
                        return res.status(400).send({ msg: "not found" });
                } else {
                        const data1 = await giftPrice.findByIdAndUpdate({ _id: data._id }, { $set: { giftCardrewards: req.body.giftCardrewards, price: req.body.price, } }, { new: true });
                        return res.status(200).json({ status: 200, message: "GiftPrice update successfully.", data: data1 });
                }
        } catch (err) {
                return res.status(500).send({ msg: "internal server error ", error: err.message, });
        }
};
exports.deleteGiftPrice = async (req, res) => {
        try {
                const data = await giftPrice.findById(req.params.id);
                if (!data) {
                        return res.status(400).send({ msg: "not found" });
                } else {
                        const data1 = await giftPrice.findByIdAndDelete(data._id);
                        return res.status(200).json({ status: 200, message: "GiftPrice delete successfully.", data: {} });
                }
        } catch (err) {
                return res.status(500).send({ msg: "internal server error ", error: err.message, });
        }
};
exports.deleteGiftCard = async (req, res) => {
        try {
                const data = await giftCard.findById(req.params.id);
                if (!data) {
                        return res.status(400).send({ msg: "not found" });
                } else {
                        const data1 = await giftCard.findByIdAndDelete(data._id);
                        return res.status(200).json({ status: 200, message: "GiftCard delete successfully.", data: {} });
                }
        } catch (err) {
                return res.status(500).send({ msg: "internal server error ", error: err.message, });
        }
};
exports.createShippingCharges = async (req, res) => {
        try {
                let findShippingCharges = await shippingCharges.findOne({ from: req.body.from, to: req.body.to, charges: req.body.charges, });
                if (findShippingCharges) {
                        return res.status(409).json({ message: "Shipping Charges already exit.", status: 404, data: {} });
                } else {
                        const data = { from: req.body.from, to: req.body.to, charges: req.body.charges, };
                        const category = await shippingCharges.create(data);
                        return res.status(200).json({ message: "Shipping Charges add successfully.", status: 200, data: category });
                }
        } catch (error) {
                return res.status(500).json({ status: 500, message: "internal server error ", data: error.message, });
        }
};
exports.getShippingCharges = async (req, res) => {
        const categories = await shippingCharges.find({});
        if (categories.length > 0) {
                return res.status(201).json({ message: "Shipping Charges Found", status: 200, data: categories, });
        }
        return res.status(201).json({ message: "Shipping Charges not Found", status: 404, data: {}, });

};
exports.updateShippingCharges = async (req, res) => {
        const { id } = req.params;
        const category = await shippingCharges.findById(id);
        if (!category) {
                return res.status(404).json({ message: "Shipping Charges Not Found", status: 404, data: {} });
        }
        category.from = req.body.from || category.from;
        category.to = req.body.to || category.to;
        category.charges = req.body.charges || category.charges;
        let update = await category.save();
        return res.status(200).json({ message: "Updated Successfully", data: update });
};
exports.removeShippingCharges = async (req, res) => {
        const { id } = req.params;
        const category = await shippingCharges.findById(id);
        if (!category) {
                return res.status(404).json({ message: "Shipping Charges Not Found", status: 404, data: {} });
        } else {
                await shippingCharges.findByIdAndDelete(category._id);
                return res.status(200).json({ message: "Shipping Charges Deleted Successfully !" });
        }
};
exports.createAcneQuiz = async (req, res) => {
        try {
                let option1image, option2image, option3image, option4image;
                if (req.files['option1image']) {
                        option1image = req.files['option1image'];
                        req.body.option1image = option1image[0].path;
                } else {
                        return res.status(404).json({ message: "Provide option 1 image.", status: 404, data: {} });
                }
                if (req.files['option2image']) {
                        option2image = req.files['option2image'];
                        req.body.option2image = option2image[0].path;
                } else {
                        return res.status(404).json({ message: "Provide option 2 image.", status: 404, data: {} });
                }
                if (req.files['option3image']) {
                        option3image = req.files['option3image'];
                        req.body.option3image = option3image[0].path;
                }
                if (req.files['option4image']) {
                        option4image = req.files['option4image'];
                        req.body.option4image = option4image[0].path;
                }
                const Banner = await acneQuiz.create(req.body);
                return res.status(200).json({ message: "Acne Quiz create successfully.", status: 200, data: Banner });
        } catch (error) {
                console.log(error);
                return res.status(500).json({ status: 500, message: "internal server error ", data: error.message, });
        }
};
exports.getAcneQuiz = async (req, res) => {
        const categories = await acneQuiz.find({});
        if (categories.length > 0) {
                return res.status(201).json({ message: "Acne Quiz Found", status: 200, data: categories, });
        }
        return res.status(201).json({ message: "Acne Quiz not Found", status: 404, data: {}, });

};
exports.removeAcneQuiz = async (req, res) => {
        const { id } = req.params;
        const category = await acneQuiz.findById(id);
        if (!category) {
                return res.status(404).json({ message: "Acne Quiz Not Found", status: 404, data: {} });
        } else {
                await acneQuiz.findByIdAndDelete(category._id);
                return res.status(200).json({ message: "Acne Quiz Deleted Successfully !" });
        }
};
exports.updateAcneQuiz = async (req, res) => {
        const { id } = req.params;
        const category = await acneQuiz.findById(id);
        if (!category) {
                return res.status(404).json({ message: "Acne Quiz Not Found", status: 404, data: {} });
        }
        let option1image, option2image, option3image, option4image;
        if (req.files['option1image']) {
                option1image = req.files['option1image'];
                req.body.option1image = option1image[0].path;
        }
        if (req.files['option2image']) {
                option2image = req.files['option2image'];
                req.body.option2image = option2image[0].path;
        }
        if (req.files['option3image']) {
                option3image = req.files['option3image'];
                req.body.option3image = option3image[0].path;
        }
        if (req.files['option4image']) {
                option4image = req.files['option4image'];
                req.body.option4image = option4image[0].path;
        }
        category.question = req.body.question || category.question;
        category.option1 = req.body.option1 || category.option1;
        category.option1image = req.body.option1image || category.option1image;
        category.option2 = req.body.option2 || category.option2;
        category.option2image = req.body.option2image || category.option2image;
        category.option3 = req.body.option3 || category.option3;
        category.option3image = req.body.option3image || category.option3image;
        category.option4 = req.body.option4 || category.option4;
        category.option4image = req.body.option4image || category.option4image;
        let update = await category.save();
        return res.status(200).json({ message: "Updated Successfully", data: update });
};
exports.createAcneQuizSuggession = async (req, res) => {
        try {
                let findAcneQuizSuggession = await acneQuizSuggession.findOne({ answer1: req.body.answer1, answer2: req.body.answer2, answer3: req.body.answer3, answer4: req.body.answer4, });
                if (findAcneQuizSuggession) {
                        return res.status(409).json({ message: "Acne Quiz Suggession already exit.", status: 404, data: {} });
                } else {
                        let data;
                        if (req.body.productId != (null || undefined)) {
                                const findProduct = await product.findById({ _id: req.body.productId })
                                if (!findProduct || findProduct.length === 0) {
                                        return res.status(400).send({ msg: "not found" });
                                }
                                data = { answer1: req.body.answer1, answer2: req.body.answer2, answer3: req.body.answer3, answer4: req.body.answer4, productId: findProduct._id };
                        }
                        if (req.body.frequentlyBuyProductId != (null || undefined)) {
                                const findProduct = await frequentlyBuyProduct.findById({ _id: req.body.frequentlyBuyProductId })
                                if (!findProduct || findProduct.length === 0) {
                                        return res.status(400).send({ msg: "not found" });
                                }
                                data = { answer1: req.body.answer1, answer2: req.body.answer2, answer3: req.body.answer3, answer4: req.body.answer4, frequentlyBuyProductId: findProduct._id };
                        }
                        const category = await acneQuizSuggession.create(data);
                        return res.status(200).json({ message: "Acne Quiz Suggession add successfully.", status: 200, data: category });
                }
        } catch (error) {
                return res.status(500).json({ status: 500, message: "internal server error ", data: error.message, });
        }
};
exports.getAcneQuizSuggession = async (req, res) => {
        const categories = await acneQuizSuggession.find({});
        if (categories.length > 0) {
                return res.status(201).json({ message: "Acne Quiz Suggession Found", status: 200, data: categories, });
        }
        return res.status(201).json({ message: "Acne Quiz Suggession not Found", status: 404, data: {}, });

};
exports.updateAcneQuizSuggession = async (req, res) => {
        const { id } = req.params;
        const category = await acneQuizSuggession.findById(id);
        if (!category) {
                return res.status(404).json({ message: "Acne Quiz Suggession Not Found", status: 404, data: {} });
        }
        let productId, frequentlyBuyProductId;
        if (req.body.productId != (null || undefined)) {
                const findProduct = await product.findById({ _id: req.body.productId })
                if (!findProduct || findProduct.length === 0) {
                        return res.status(400).send({ msg: "not found" });
                } else {
                        category.productId = findProduct._id;
                }
        } else if (req.body.frequentlyBuyProductId != (null || undefined)) {
                const findProduct = await frequentlyBuyProduct.findById({ _id: req.body.frequentlyBuyProductId })
                if (!findProduct || findProduct.length === 0) {
                        return res.status(400).send({ msg: "not found" });
                } else {
                        category.frequentlyBuyProductId = findProduct._id;
                }
        } else {
                category.productId = category.productId;
                category.frequentlyBuyProductId = category.frequentlyBuyProductId;
        }
        category.answer1 = req.body.answer1 || category.answer1;
        category.answer2 = req.body.answer2 || category.answer2;
        category.answer3 = req.body.answer3 || category.answer3;
        category.answer4 = req.body.answer4 || category.answer4;
        let update = await category.save();
        return res.status(200).json({ message: "Updated Successfully", data: update });
};
exports.removeAcneQuizSuggession = async (req, res) => {
        const { id } = req.params;
        const category = await acneQuizSuggession.findById(id);
        if (!category) {
                return res.status(404).json({ message: "Acne Quiz Suggession Not Found", status: 404, data: {} });
        } else {
                await acneQuizSuggession.findByIdAndDelete(category._id);
                return res.status(200).json({ message: "Acne Quiz Suggession Deleted Successfully !" });
        }
};
exports.getAcneQuizSuggessionByAnswer = async (req, res) => {
        const categories = await acneQuizSuggession.findOne({ answer1: req.query.answer1, answer2: req.query.answer2, answer3: req.query.answer3, answer4: req.query.answer4, }).select('productId')
                .populate([{ path: 'productId' }, { path: 'frequentlyBuyProductId', populate: { path: 'products', model: 'Product' }, select: { reviews: 0 } },])

        if (categories) {
                return res.status(201).json({ message: "Acne Quiz Suggession Found", status: 200, data: categories, });
        }
        return res.status(201).json({ message: "Acne Quiz Suggession not Found", status: 404, data: {}, });

};
exports.createFrequentlyBuyProduct = async (req, res) => {
        try {
                for (let i = 0; i < req.body.products.length; i++) {
                        const findProduct = await product.findById({ _id: req.body.products[i] })
                        if (!findProduct || findProduct.length === 0) {
                                return res.status(400).send({ msg: "not found", data: {} });
                        }
                }
                const data = { price: req.body.price, products: req.body.products };
                const category = await frequentlyBuyProduct.create(data);
                return res.status(200).json({ message: "Frequently Buy Product add successfully.", status: 200, data: category });
        } catch (error) {
                return res.status(500).json({ status: 500, message: "internal server error ", data: error.message, });
        }
};
exports.getFrequentlyBuyProduct = async (req, res) => {
        const categories = await frequentlyBuyProduct.find({}).populate('products');
        if (categories.length > 0) {
                return res.status(201).json({ message: "Frequently Buy Product Found", status: 200, data: categories, });
        }
        return res.status(201).json({ message: "Frequently Buy Product not Found", status: 404, data: {}, });

};
exports.updateFrequentlyBuyProduct = async (req, res) => {
        const { id } = req.params;
        const category = await frequentlyBuyProduct.findById(id);
        if (!category) {
                return res.status(404).json({ message: "Frequently Buy Product Not Found", status: 404, data: {} });
        }
        if (req.body.products != (null || undefined)) {
                for (let i = 0; i < req.body.products.length; i++) {
                        const findProduct = await product.findById({ _id: req.body.products[i] })
                        if (!findProduct || findProduct.length === 0) {
                                return res.status(400).send({ msg: "not found", data: {} });
                        }
                }
        } else {
                req.body.products = category.products;
        }
        category.price = req.body.price || category.price;
        category.products = req.body.products || category.products;
        let update = await category.save();
        return res.status(200).json({ message: "Updated Successfully", data: update });
};
exports.removeFrequentlyBuyProduct = async (req, res) => {
        const { id } = req.params;
        const category = await frequentlyBuyProduct.findById(id);
        if (!category) {
                return res.status(404).json({ message: "Frequently Buy Product Not Found", status: 404, data: {} });
        } else {
                await frequentlyBuyProduct.findByIdAndDelete(category._id);
                return res.status(200).json({ message: "Frequently Buy Product Deleted Successfully !" });
        }
};
exports.getFrequentlyBuyProductbyProductId = async (req, res) => {
        const categories = await frequentlyBuyProduct.findOne({ products: { $in: req.params.productId } }).populate('products');
        if (categories) {
                return res.status(201).json({ message: "Frequently Buy Product Found", status: 200, data: categories, });
        }
        return res.status(201).json({ message: "Frequently Buy Product not Found", status: 404, data: {}, });

};
exports.createAddOnServices = async (req, res) => {
        try {
                let findSlot = await addOnservices.findOne({ name: req.body.name });
                if (findSlot) {
                        return res.status(409).json({ message: "AddOnServices already exit.", status: 404, data: {} });
                } else {
                        let image;
                        if (req.file) {
                                image = req.file ? req.file.path : "";
                        }
                        function convertTimeToMinutes(timeString) {
                                const regex = /(\d+)\s*hr(?:\s*(\d*)\s*min)?/;
                                const regex1 = /(\d+)\s*(?:min)?/;
                                const match = timeString.match(regex);
                                const match1 = timeString.match(regex1);
                                if (!match) {
                                        if (!match1) {
                                                throw new Error("Invalid time format");
                                        }
                                }
                                let hours, minutes;
                                if (match) {
                                        hours = parseInt(match[1]) || 0;
                                        minutes = parseInt(match[2]) || 0;
                                }
                                if (match1) {
                                        hours = 0;
                                        minutes = parseInt(match1[1]) || 0;
                                }
                                return hours * 60 + minutes;
                        }
                        req.body.totalMin = convertTimeToMinutes(req.body.totalTime)
                        const data = { name: req.body.name, price: req.body.price, totalTime: req.body.totalTime, totalMin: req.body.totalMin, image: image, description: req.body.description, };
                        const category = await addOnservices.create(data);
                        return res.status(200).json({ message: "AddOnServices add successfully.", status: 200, data: category });
                }
        } catch (error) {
                console.log(error);
                return res.status(500).json({ status: 500, message: "internal server error ", data: error.message, });
        }
};
exports.getAddOnServices = async (req, res) => {
        const categories = await addOnservices.find({});
        if (categories.length > 0) {
                return res.status(201).json({ message: "AddOnServices Found", status: 200, data: categories, });
        }
        return res.status(201).json({ message: "AddOnServices not Found", status: 404, data: {}, });

};
exports.getAddOnServiceByToken = async (req, res, next) => {
        try {
                const servicesList = await addOnservices.find({});
                const servicesWithDynamicFields = [];
                const userCart = await Cart.findOne({ user: req.user._id });
                for (const service of servicesList) {
                        let isInCart = false;
                        let quantityInCart = 0;
                        if (userCart) {
                                const cartItem = userCart.AddOnservicesSchema.find((cartItem) => cartItem.addOnservicesId?.equals(service._id));
                                if (cartItem) {
                                        isInCart = true;
                                        quantityInCart = cartItem.quantity;
                                }
                        }
                        const serviceWithDynamicFields = {
                                ...service.toObject(),
                                isInCart,
                                quantityInCart,
                        };
                        servicesWithDynamicFields.push(serviceWithDynamicFields);
                }
                return res.status(200).json({ status: 200, message: "Add On Services data found.", data: servicesWithDynamicFields, });
        } catch (err) {
                console.log(err);
                return res.status(500).send({ message: "Internal server error while fetching services" });
        }
};
exports.updateAddOnServices = async (req, res) => {
        const { id } = req.params;
        const category = await addOnservices.findById(id);
        if (!category) {
                return res.status(404).json({ message: "AddOnServices Not Found", status: 404, data: {} });
        }
        const category1 = await addOnservices.findOne({ _id: { $ne: id }, name: req.body.name });
        if (category1) {
                return res.status(404).json({ message: "AddOnServices already exit", status: 404, data: {} });
        }
        if (req.file) {
                category.image = req.file ? req.file.path : "";
        } else {
                category.image = category.image;
        }
        if (req.body.totalTime != (null || undefined)) {
                req.body.totalMin = convertTimeToMinutes(req.body.totalTime)
                function convertTimeToMinutes(timeString) {
                        const regex = /(\d+)\s*hr(?:\s*(\d*)\s*min)?/;
                        const regex1 = /(\d+)\s*(?:min)?/;
                        const match = timeString.match(regex);
                        const match1 = timeString.match(regex1);
                        if (!match) {
                                if (!match1) {
                                        throw new Error("Invalid time format");
                                }
                        }
                        let hours, minutes;
                        if (match) {
                                hours = parseInt(match[1]) || 0;
                                minutes = parseInt(match[2]) || 0;
                        }
                        if (match1) {
                                hours = 0;
                                minutes = parseInt(match1[1]) || 0;
                        }
                        return hours * 60 + minutes;
                }
                category.totalTime = req.body.totalTime;
                category.totalMin = req.body.totalMin;
        } else {
                category.totalTime = category.totalTime;
                category.totalMin = category.totalMin;
        }
        category.name = req.body.name || category.name;
        category.price = req.body.price || category.price;
        category.time = req.body.time || category.time;
        category.description = req.body.description || category.description;
        let update = await category.save();
        return res.status(200).json({ message: "Updated Successfully", data: update });
};
exports.removeAddOnServices = async (req, res) => {
        const { id } = req.params;
        const category = await addOnservices.findById(id);
        if (!category) {
                return res.status(404).json({ message: "AddOnServices Not Found", status: 404, data: {} });
        } else {
                await addOnservices.findByIdAndDelete(category._id);
                return res.status(200).json({ message: "AddOnServices Deleted Successfully !" });
        }
};
exports.getProductOrderbyId = async (req, res, next) => {
        try {
                const orders = await productOrder.findById({ _id: req.params.id }).populate([
                        { path: 'user' },
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
exports.getServiceOrderbyId = async (req, res, next) => {
        try {
                const orders = await serviceOrder.findById({ _id: req.params.id }).populate([
                        { path: 'user' },
                        { path: "AddOnservicesSchema.addOnservicesId", select: { reviews: 0 } }, { path: "services.serviceId", select: { reviews: 0 } }, { path: "coupon", select: "couponCode discount expirationDate" },]);
                if (!orders) {
                        return res.status(404).json({ status: 404, message: "Orders not found", data: {} });
                }
                return res.status(200).json({ status: 200, msg: "orders of user", data: orders })
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.updateDeliveryStatus = async (req, res, next) => {
        try {
                const orders = await productOrder.findById({ _id: req.params.id });
                if (!orders) {
                        return res.status(404).json({ status: 404, message: "Orders not found", data: {} });
                }
                let update = await productOrder.findByIdAndUpdate({ _id: orders._id }, { $set: { deliveryStatus: "Done" } }, { new: true });
                if (update) {
                        return res.status(200).json({ status: 200, msg: "Order Status update", data: update })
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.updateServiceStatus = async (req, res, next) => {
        try {
                const orders = await serviceOrder.findById({ _id: req.params.id });
                if (!orders) {
                        return res.status(404).json({ status: 404, message: "Orders not found", data: {} });
                }
                let update = await serviceOrder.findByIdAndUpdate({ _id: orders._id }, { $set: { serviceStatus: "Done", paymentStatus: "paid" } }, { new: true });
                if (update) {
                        let update3 = await userOrders.findOneAndUpdate({ orderId: orders.orderId }, { $set: { serviceStatus: "Done", servicePaymentStatus: "paid" } }, { new: true });
                        return res.status(200).json({ status: 200, msg: "Order Status update", data: update })
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.createShipment = async (req, res) => {
        try {
                const orders = await productOrder.findById({ _id: req.body.productOrderId });
                if (!orders) {
                        return res.status(404).json({ status: 404, message: "Orders not found", data: {} });
                }
                const order = await client.orders.create(req.body);
                if (order) {
                        req.body = order
                        const category = await deliverOrde.create(req.body);
                        if (category) {
                                category.productOrderId = orders._id;
                                let update = await category.save();
                                return res.json(update);
                        }
                }
        } catch (error) {
                console.error('Internal Server Error:', error);
                return res.status(500).json({ error: 'Internal Server Error' });
        }
};
exports.getAllShipment = async (req, res) => {
        try {
                const data = await deliverOrde.find({})
                if (data.length === 0) {
                        return res.status(400).send({ msg: "not found" });
                }
                return res.status(200).json({ status: 200, message: "Shipment data found.", data: data });
        } catch (err) {
                return res.status(500).send({ msg: "internal server error ", error: err.message, });
        }
};
exports.getShipmentByproductOrderId = async (req, res) => {
        try {
                const data = await deliverOrde.findOne({ productOrderId: req.params.productOrderId })
                if (!data) {
                        return res.status(400).send({ status: 404, msg: "not found" });
                }
                return res.status(200).json({ status: 200, message: "Shipment data found.", data: data });
        } catch (err) {
                return res.status(500).send({ msg: "internal server error ", error: err.message, });
        }
};
exports.getAllcoupan = async (req, res, next) => {
        try {
                const cart = await coupanModel.find({ orderStatus: { $ne: "unconfirmed" } }).populate('user senderUser');
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
exports.getAllTransaction = async (req, res, next) => {
        try {
                const cart = await transactionModel.find().populate('user subscriptionId');
                if (!cart) {
                        return res.status(200).json({ success: false, msg: "Get transaction.", data: {} })
                } else {
                        return res.status(200).json({ success: true, msg: "Get transaction.", data: cart })
                }
        } catch (error) {
                console.log(error)
                next(error);
        }
}
exports.sendNotification = async (req, res) => {
        try {
                const admin = await User.findById({ _id: req.user._id });
                if (!admin) {
                        return res.status(404).json({ status: 404, message: "Admin not found" });
                } else {
                        if (req.body.total == "ALL") {
                                let userData = await User.find({ userType: req.body.sendTo });
                                if (userData.length == 0) {
                                        return res.status(404).json({ status: 404, message: "User not found" });
                                } else {
                                        let obj1 = {
                                                userId: admin._id,
                                                title: req.body.title,
                                                body: req.body.body,
                                                date: req.body.date,
                                                image: req.body.image,
                                                time: req.body.time,
                                        }
                                        await notification.create(obj1)
                                        for (let i = 0; i < userData.length; i++) {
                                                if (userData.deviceToken != null || userData.deviceToken != undefined) {
                                                        let result = await commonFunction.pushNotificationforUser(userData[i].deviceToken, req.body.title, req.body.body);
                                                        let obj = {
                                                                userId: userData[i]._id,
                                                                title: req.body.title,
                                                                body: req.body.body,
                                                                date: req.body.date,
                                                                image: req.body.image,
                                                                time: req.body.time,
                                                        }
                                                        await notification.create(obj)
                                                        return res.status(200).json({ status: 200, message: "Notification send successfully." });
                                                } else {
                                                        let obj = {
                                                                userId: userData[i]._id,
                                                                title: req.body.title,
                                                                body: req.body.body,
                                                                date: req.body.date,
                                                                image: req.body.image,
                                                                time: req.body.time,
                                                        }
                                                        await notification.create(obj)
                                                        return res.status(200).json({ status: 200, message: "Notification send successfully." });
                                                }
                                        }
                                }
                        }
                        if (req.body.total == "SINGLE") {
                                let userData = await User.findById({ _id: req.body._id, userType: req.body.sendTo });
                                if (!userData) {
                                        return res.status(404).json({ status: 404, message: "Employee not found" });
                                } else {
                                        if (userData.deviceToken != null || userData.deviceToken != undefined) {
                                                let result = await commonFunction.pushNotificationforUser(userData.deviceToken, req.body.title, req.body.body);
                                                let obj = {
                                                        userId: userData._id,
                                                        title: req.body.title,
                                                        body: req.body.body,
                                                        date: req.body.date,
                                                        image: req.body.image,
                                                        time: req.body.time,
                                                }
                                                let data = await notification.create(obj)
                                                if (data) {
                                                        let obj1 = {
                                                                userId: admin._id,
                                                                title: req.body.title,
                                                                body: req.body.body,
                                                                date: req.body.date,
                                                                image: req.body.image,
                                                                time: req.body.time,
                                                        }
                                                        await notification.create(obj1)
                                                        return res.status(200).json({ status: 200, message: "Notification send successfully.", data: data });
                                                }
                                        } else {
                                                let obj = {
                                                        userId: userData._id,
                                                        title: req.body.title,
                                                        body: req.body.body,
                                                        date: req.body.date,
                                                        image: req.body.image,
                                                        time: req.body.time,
                                                }
                                                let data = await notification.create(obj)
                                                if (data) {
                                                        let obj1 = {
                                                                userId: admin._id,
                                                                title: req.body.title,
                                                                body: req.body.body,
                                                                date: req.body.date,
                                                                image: req.body.image,
                                                                time: req.body.time,
                                                        }
                                                        await notification.create(obj1)
                                                        return res.status(200).json({ status: 200, message: "Notification send successfully.", data: data });
                                                }
                                        }
                                }
                        }
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
}
exports.allAdminNotification = async (req, res) => {
        try {
                const admin = await User.findById({ _id: req.user._id });
                if (!admin) {
                        return res.status(404).json({ status: 404, message: "Admin not found" });
                } else {
                        let findNotification = await adminNotification.find({ userId: admin._id }).populate('orderUserId');
                        if (findNotification.length == 0) {
                                return res.status(404).json({ status: 404, message: "Notification data not found successfully.", data: {} })
                        } else {
                                return res.status(200).json({ status: 200, message: "Notification data found successfully.", data: findNotification })
                        }
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
}
exports.allNotification = async (req, res) => {
        try {
                const admin = await User.findById({ _id: req.user._id });
                if (!admin) {
                        return res.status(404).json({ status: 404, message: "Admin not found" });
                } else {
                        let findNotification = await notification.find({ userId: admin._id }).populate('userId');
                        if (findNotification.length == 0) {
                                return res.status(404).json({ status: 404, message: "Notification data not found successfully.", data: {} })
                        } else {
                                return res.status(200).json({ status: 200, message: "Notification data found successfully.", data: findNotification })
                        }
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
}
exports.addCoupan = async (req, res) => {
        try {
                if (req.body.completeVisit != (null || undefined)) {
                        const data = await coupanModel.findOne({ used: false, user: req.body.user, completeVisit: { $gt: 0 } });
                        if (data) {
                                return res.json({ status: 409, message: 'Coupan already exit.', data: {} });
                        }
                }
                if (req.file) {
                        req.body.image = req.file.path;
                }
                const d = new Date(req.body.expirationDate);
                req.body.expirationDate = d.toISOString();
                const de = new Date(req.body.activationDate);
                req.body.activationDate = de.toISOString();
                req.body.code = await reffralCode();
                req.body.orderStatus = "confirmed";
                req.body.paymentStatus = 'paid'
                let saveStore = await coupanModel(req.body).save();
                if (saveStore) {
                        const data = await User.findOne({ _id: req.body.user, });
                        if (data) {
                                let update = await User.findByIdAndUpdate({ _id: data._id }, { $set: { checkIn: data.checkIn + (req.body.completeVisit || 0) } }, { new: true });
                                if (update) {
                                        return res.json({ status: 200, message: 'Coupan add successfully.', data: saveStore });
                                }
                        }
                }
        } catch (error) {
                console.error(error);
                return res.status(500).send({ status: 500, message: "Server error" + error.message });
        }
};
exports.deleteCoupan = async (req, res) => {
        try {
                const data = await coupanModel.findById(req.params.id);
                if (!data) {
                        return res.status(404).json({ message: "Coupan not found.", status: 404, data: {} });
                }
                await coupanModel.findByIdAndDelete({ _id: req.params.id });
                return res.status(200).json({ message: "Coupan  delete.", status: 200, data: {} });
        } catch (err) {
                return res.status(500).send({ msg: "internal server error", error: err.message, });
        }
};
exports.uploadClient = async (req, res) => {
        try {
                const file = req.file;
                const path = file.path;
                await new Promise((resolve, reject) => {
                        fs.access(path, fs.constants.F_OK, (err) => {
                                if (err) {
                                        console.error('File does not exist');
                                        reject(err);
                                } else {
                                        resolve();
                                }
                        });
                });
                const workbook = XLSX.readFile(file.path);
                const sheet = workbook.Sheets[workbook.SheetNames[0]];
                const orders = XLSX.utils.sheet_to_json(sheet);
                console.log(orders);
                orders.forEach(async (orderData) => {
                        let findUser1 = await User.findOne({ $and: [{ $or: [{ email: orderData["email"] }, { phone: orderData["phone"] }] }] });
                        if (!findUser1) {
                                const orderObj = {
                                        firstName: orderData["firstName"],
                                        lastName: orderData["lastName"],
                                        gender: orderData["gender"],
                                        dob: orderData["dob"],
                                        phone: orderData["phone"],
                                        email: orderData["email"],
                                        refferalCode: await reffralCode(),
                                        userType: "USER"
                                };
                                const order = await User.create(orderObj);
                        }
                });
                fs.unlink(path, (err) => {
                        if (err) {
                                console.error(err);
                                return res.status(500).json({ message: "Error deleting file" });
                        }
                });
                return res.status(200).json({ message: "Data uploaded successfully" });

        } catch (error) {
                console.log(error);
                return res.status(500).json({ status: 0, message: error.message });
        }
};
const reffralCode = async () => {
        var digits = "ABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZ";
        let OTP = '';
        for (let i = 0; i < 6; i++) {
                OTP += digits[Math.floor(Math.random() * 36)];
        }
        return OTP;
}
exports.createSlot = async (req, res) => {
        try {
                const fromTime = new Date(req.body.from);
                const toTime = new Date(req.body.to);
                const halfHour = 15 * 60 * 1000;
                while (fromTime.getTime() < toTime.getTime()) {
                        const slotEndTime = new Date(fromTime.getTime() + halfHour);
                        let findSlot = await slot.findOne({ date: req.body.date, from: fromTime.toISOString(), to: slotEndTime.toISOString() });
                        if (!findSlot) {
                                const slot1 = new slot({
                                        date: req.body.date,
                                        from: fromTime.toISOString(),
                                        to: slotEndTime.toISOString(),
                                });
                                await slot1.save();
                                fromTime.setTime(slotEndTime.getTime());
                        }
                }
                return res.status(200).json({ message: "Slots added successfully.", status: 200, data: {}, });
        } catch (error) {
                return res.status(500).json({ status: 500, message: "Internal server error ", data: error.message, });
        }
};
exports.getSlot = async (req, res) => {
        if (req.query.date) {
                const categories = await slot.find({ date: req.query.date, slotBlocked: false });
                if (categories.length > 0) {
                        return res.status(201).json({ message: "Slot Found", status: 200, data: categories, });
                }
                return res.status(201).json({ message: "Slot not Found", status: 404, data: {}, });

        } else {
                const categories = await slot.find({ slotBlocked: false });
                if (categories.length > 0) {
                        return res.status(201).json({ message: "Slot Found", status: 200, data: categories, });
                }
                return res.status(201).json({ message: "Slot not Found", status: 404, data: {}, });
        }
};
exports.getAvailableSlotOnwhichDate = async (req, res) => {
        try {
                const { year, month } = req.query;
                if ((year == (null || undefined)) && (month == (null || undefined))) {
                        const currentDate = new Date();
                        const year = currentDate.getFullYear();
                        const month = currentDate.getMonth() + 1;
                        const startDate = moment(`${year}-${month}-01`).startOf('month');
                        const endDate = moment(startDate).endOf('month');
                        const slots = await slot.find({ date: { $gte: startDate, $lte: endDate } }).sort({ date: 1 });
                        if (slots.length === 0) {
                                return res.json({ allSlot: [] });
                        }
                        let uniqueDates = new Set();
                        let allSlot = [];
                        for (let i = 0; i < slots.length; i++) {
                                if (!uniqueDates.has(slots[i].date.toString())) {
                                        const categories = await slot.find({ date: slots[i].date, slotBlocked: false }).count();
                                        const allBooked = categories === 0 ? 'yes' : 'no';
                                        let obj = {
                                                date: slots[i].date,
                                                allBooked: allBooked,
                                        };
                                        allSlot.push(obj);
                                        uniqueDates.add(slots[i].date.toString());
                                }
                        }
                        return res.json({ allSlot });
                } else {
                        const startDate = moment(`${year}-${month}-01`).startOf('month');
                        const endDate = moment(startDate).endOf('month');
                        const slots = await slot.find({ date: { $gte: startDate, $lte: endDate } }).sort({ date: 1 });
                        if (slots.length === 0) {
                                return res.json({ allSlot: [] });
                        }
                        let uniqueDates = new Set();
                        let allSlot = [];
                        for (let i = 0; i < slots.length; i++) {
                                if (!uniqueDates.has(slots[i].date.toString())) {
                                        const categories = await slot.find({ date: slots[i].date, slotBlocked: false }).count();
                                        const allBooked = categories === 0 ? 'yes' : 'no';
                                        let obj = {
                                                date: slots[i].date,
                                                allBooked: allBooked,
                                        };
                                        allSlot.push(obj);
                                        uniqueDates.add(slots[i].date.toString());
                                }
                        }
                        return res.json({ allSlot });
                }
        } catch (error) {
                console.error(error);
                res.status(500).json({ error: 'Internal Server Error' });
        }
};
exports.getSlotForAdmin = async (req, res) => {
        try {
                const { fromDate, date, toDate, page, limit } = req.query;
                let query = {};
                const categories = await slot.find({});
                if (date) {
                        query.date = date;
                }
                if (fromDate && !toDate) {
                        query.date = { $gte: fromDate };
                }
                if (!fromDate && toDate) {
                        query.date = { $lte: toDate };
                }
                if (fromDate && toDate) {
                        query.$and = [
                                { date: { $gte: fromDate } },
                                { date: { $lte: toDate } },
                        ]
                }
                let options = {
                        page: Number(page) || 1,
                        limit: Number(limit) || categories.length,
                        sort: { from: 1 },
                };
                let data = await slot.paginate(query, options);
                return res.status(200).json({ status: 200, message: "Slot data found.", data: data });

        } catch (err) {
                return res.status(500).send({ msg: "internal server error ", error: err.message, });
        }
};
exports.updateSlot = async (req, res) => {
        const { id } = req.params;
        const category = await slot.findById(id);
        if (!category) {
                return res.status(404).json({ message: "Slot Not Found", status: 404, data: {} });
        }
        category.date = req.body.date || category.date;
        category.from = req.body.from || category.from;
        category.to = req.body.to || category.to;
        let update = await category.save();
        return res.status(200).json({ message: "Updated Successfully", data: update });
};
exports.removeSlot = async (req, res) => {
        const { id } = req.params;
        const category = await slot.findById(id);
        if (!category) {
                return res.status(404).json({ message: "Slot Not Found", status: 404, data: {} });
        } else {
                await slot.findByIdAndDelete(category._id);
                return res.status(200).json({ message: "Slot Deleted Successfully !" });
        }
};
exports.slotBlocked = async (req, res) => {
        try {
                let x2 = `${req.body.date}T00:00:00.000Z`
                let x = `${req.body.date}T${req.body.from}:00.000Z`
                let x1 = `${req.body.date}T${req.body.to}:00.000Z`
                console.log({ from: { $gte: new Date(x) } }, { to: { $lte: new Date(x1) } });
                console.log({ from: { $gte: new Date(x) }, to: { $lte: new Date(x1) }, date: new Date(x2), isBooked: false });
                let findSlot = await slot.find({ from: { $gte: new Date(x) }, to: { $lte: new Date(x1) }, date: new Date(x2), isBooked: false });
                if (findSlot.length > 0) {
                        let data = [];
                        for (let i = 0; i < findSlot.length; i++) {
                                let updateSlot = await slot.findByIdAndUpdate({ _id: findSlot[i]._id }, { $set: { slotBlocked: true, title: req.body.title, description: req.body.description } }, { new: true });
                                data.push(updateSlot)
                        }
                        return res.status(200).json({ message: "Slots Blocked  found.", status: 200, data: data, length: findSlot.length, });
                } else {
                        return res.status(404).json({ message: "Slots not  found.", status: 404, data: {}, });
                }
        } catch (error) {
                console.log(error);
                return res.status(500).json({ status: 500, message: "Internal server error ", data: error.message, });
        }
};
exports.slotUnBlocked = async (req, res) => {
        try {
                let x2 = `${req.body.date}T00:00:00.000Z`
                let x = `${req.body.date}T${req.body.from}:00.000Z`
                let x1 = `${req.body.date}T${req.body.to}:00.000Z`
                console.log({ from: { $gte: new Date(x) } }, { to: { $lte: new Date(x1) } });
                console.log({ from: { $gte: new Date(x) }, to: { $lte: new Date(x1) }, date: new Date(x2), isBooked: false });
                let findSlot = await slot.find({ from: { $gte: new Date(x) }, to: { $lte: new Date(x1) }, date: new Date(x2) });
                if (findSlot.length > 0) {
                        let data = [];
                        for (let i = 0; i < findSlot.length; i++) {
                                let updateSlot = await slot.findByIdAndUpdate({ _id: findSlot[i]._id }, { $set: { slotBlocked: false, } }, { new: true });
                                data.push(updateSlot)
                        }
                        return res.status(200).json({ message: "Slots Blocked  found.", status: 200, data: findSlot, length: findSlot.length });
                } else {
                        return res.status(404).json({ message: "Slots not  found.", status: 404, data: {}, });
                }
        } catch (error) {
                console.log(error);
                return res.status(500).json({ status: 500, message: "Internal server error ", data: error.message, });
        }
};
exports.addSuggestionToServiceCart = async (req, res) => {
        try {
                let findCart = await Cart.findOne({ user: req.params.userId });
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
exports.editSuggestionInCart = async (req, res) => {
        try {
                const findCart = await Cart.findOne({ user: req.params.userId });
                if (findCart) {
                        const suggestionIndex = findCart.suggesstion.findIndex((suggestion) => suggestion._id.toString() === req.params.suggesstionId);
                        if (suggestionIndex !== -1) {
                                findCart.suggesstion[suggestionIndex].suggesstion = req.body.suggestion;
                                const updateCart = await findCart.save();
                                return res.status(200).send({ message: "Suggestion updated in cart.", data: updateCart, });
                        } else {
                                return res.status(404).send({ status: 404, message: "Suggestion not found in the cart.", data: [], });
                        }
                } else {
                        return res.status(404).send({ status: 404, message: "Order not found.", data: [], });
                }
        } catch (error) {
                console.error("Error in editSuggestionfromOrder:", error);
                return res.status(500).send({ status: 500, message: "Server error.", data: {}, });
        }
};
exports.deleteSuggestionfromCart = async (req, res) => {
        try {
                let findCart = await Cart.findOne({ user: req.params.userId });
                if (findCart) {
                        for (let i = 0; i < findCart.suggesstion.length; i++) {
                                if (findCart.suggesstion.length > 0) {
                                        if (((findCart.suggesstion[i]._id).toString() == req.params.suggesstionId) == true) {
                                                let updateCart = await Cart.findByIdAndUpdate({ _id: findCart._id, 'suggesstion._id': req.params.suggesstionId }, {
                                                        $pull: {
                                                                'suggesstion':
                                                                {
                                                                        _id: req.params.suggesstionId,
                                                                        suggesstion: findCart.suggesstion[i].suggesstion,
                                                                }
                                                        }
                                                }, { new: true })
                                                if (updateCart) {
                                                        return res.status(200).send({ message: "suggesstion delete from Cart.", data: updateCart, });
                                                }
                                        }
                                } else {
                                        return res.status(200).send({ status: 200, message: "No Data Found ", data: [] });
                                }
                        }
                } else {
                        return res.status(200).send({ status: 200, message: "No Data Found ", cart: [] });
                }
        } catch (error) {
                console.log("353====================>", error)
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.noShowUpdate = async (req, res) => {
        try {
                let findCart = await serviceOrder.findOne({ _id: req.params.id }).populate([{ path: "user", }, { path: "AddOnservicesSchema.addOnservicesId", select: { reviews: 0 } }, { path: "services.serviceId", select: { reviews: 0 } }, { path: "coupon", select: "couponCode discount expirationDate" },]);
                if (findCart) {
                        const user = await User.findById({ _id: findCart.user._id });
                        if (!user) {
                                return res.status(404).send({ status: 404, message: "User not found or token expired." });
                        }
                        let update1 = await serviceOrder.findByIdAndUpdate({ _id: findCart._id }, { $set: { noShow: true }, }, { new: true });
                        if (update1) {
                                const inputDate = new Date(update.toTime);
                                const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true };
                                const formattedDate = inputDate.toLocaleString('en-US', { ...options, timeZone: 'UTC' });
                                console.log(formattedDate);
                                var transporter = nodemailer.createTransport({ service: 'gmail', auth: { "user": "info@shahinahoja.com", "pass": "gganlypsemwqhwlh" } });
                                let mailOption1 = {
                                        from: '<do_not_reply@gmail.com>',
                                        to: `${user.email}`,
                                        subject: 'Did not show',
                                        html: `<!DOCTYPE html> <html lang="en">
                                          <head>
                                            <meta charset="UTF-8" />
                                            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                                            <title>Email</title>
                                          </head>
                                          <body>
                                            <div style="width: 100%; height: 100%">
                                              <divstyle="background-color: white;max-width: 600px;margin: auto;border: 1px solid black;">
                                                <div
                                                  style="width: 90%;margin: auto;margin-top: 2rem;margin-bottom: 4rem;">
                                                  <h1 style="margin-bottom: 2rem">View message</h1>
                                                  <button
                                                    style="
                                                      color: white;
                                                      border-left: 50%;
                                                      padding: 5px;
                                                      height: 2rem;
                                                      width: 7rem;
                                                      border-radius: 1rem;
                                                      background-color: red;
                                                      border: none;
                                                      outline: none;
                                                    "
                                                  >
                                                    Did not show
                                                  </button>
                                                  <div style="margin-top: 2rem">
                                                    <p style="font-size: 30px; font-weight: bold">
                                                      ${findCart.user.firstName}, you missed your appointment at Shahina Hoja Aesthetics
                                                    </p>
                                                  </div>
                                                  <p style="margin-top: 1rem">
                                                    <span style="color: rgb(153, 74, 228)"
                                                      >${formattedDate}</span
                                                    >
                                                  </p>
                                                  <div>
                                                    <button
                                                      style="
                                                        width: 100%;
                                                        padding: 10px;
                                                        background-color: black;
                                                        color: white;
                                                        border: none;outline: none;cursor: pointer;border-radius: 3px;font-size: 1rem;
                                                      "
                                                    >
                                                      Rebook your appointment
                                                    </button>
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
                                                          <h5 style="font-weight: bold; font-size: 1rem">${service.serviceId.name} $ ${service.price}</h5>
                                                          <p style="color: rgb(131, 120, 120)"> ${service.totalTime} with Shahina</p>
                                                          `).join('')}
                                                        </ul>
                                                      </div>
                                                    </div>
                                                    <hr style="margin-top: 0.5rem; line-height: 7px" />
                                                    <div style="margin-top: 0.5rem;display: flex;justify-content: space-between;">
                                                      <div>
                                                        <p style="font-weight: bold">Total</p>
                                                      </div>
                                                      <p style="font-weight: bold">$ ${update1.total}</p>
                                                    </div>
                                                    <hr style="margin-top: 1rem" />
                                                  </div>
                                                  <p style="color: rgb(142, 133, 133); margin-top: 0.5rem">Booking ref: ${update1.orderId}</p>
                                        
                                                  <div>
                                                    <h3 style="margin-top: 1rem">Location</h3>
                                                    <div
                                                      style="
                                                        margin-top: 0.5rem;
                                                        display: flex;
                                                        justify-content: space-between;
                                                      "
                                                    >
                                                      <div style="line-height: 0px">
                                                        <h5>Shahine Hoja Aesthetics</h5>
                                                        <p style="color: rgb(100, 28, 162)">
                                                          905 Watters Creek Boulevard ,141 Allen, 75013, Texas, Us
                                                        </p>
                                                      </div>
                                                      <img src="https://res.cloudinary.com/djgrqoefp/image/upload/v1704388341/shahina/contactDetail/lv8rvmn6nbkzbzekiexq.png" style="height: 50px; width: 50px; margin-left:25px; border-radius: 10px" />
                                                    </div>
                                                  </div>
                                        
                                                  <div style="margin-top: 1.5rem; line-height: 20px">
                                                    <h3>Cancellation Policy</h3>
                                                    <p style="margin-top: 1rem">
                                                      Please avoid Cancellation with in <strong>48 hours</strong> of your appointment
                                                    </p>
                                                  </div>
                                        
                                                  <p style="margin-top: 2.5rem">
                                                    We sent you this email because you have booked with Shahina Hoja Aesthetics, which partners with appointment and payments.
                                                  </p>
                                                </div>
                                              </div>
                                            </div>
                                          </body>
                                        </html>`,
                                };
                                let info1 = await transporter.sendMail(mailOption1);
                                if (info1) {
                                        return res.status(200).json({ status: 200, message: "No show update Successfully.", data: update1 })
                                } else {
                                        return res.status(200).json({ status: 200, message: "No show update Successfully.", data: update1 })
                                }
                        }
                } else {
                        return res.status(404).json({ status: 404, message: "Cart is empty.", data: {} });
                }
        } catch (error) {
                console.error(error);
                return res.status(500).send({ status: 500, message: "Server error" + error.message });
        }
};
exports.reSechduleOrder = async (req, res) => {
        try {
                const d = new Date(req.params.date);
                let text = d.toISOString();
                let findCart = await serviceOrder.findOne({ _id: req.params.orderId, }).populate([{ path: "user" }, { path: "AddOnservicesSchema.addOnservicesId", select: { reviews: 0 } }, { path: "services.serviceId", select: { reviews: 0 } },]);
                if (findCart) {
                        console.log(findCart);
                        let totalTime = 0;
                        for (let i = 0; i < findCart.services.length; i++) {
                                totalTime = totalTime + findCart.services[i].totalMin;
                        }
                        for (let i = 0; i < findCart.AddOnservicesSchema.length; i++) {
                                totalTime = totalTime + findCart.AddOnservicesSchema[i].totalMin;
                        }
                        const timeArray = req.body.time.split(':');
                        const hours = parseInt(timeArray[0]);
                        const minutes = parseInt(timeArray[1]);
                        const providedTimeInMinutes = hours * 60 + minutes;
                        let fromTimeInMinutes = providedTimeInMinutes + totalTime + 30;
                        const fromTime = new Date(d);
                        fromTime.setMinutes(fromTimeInMinutes);
                        let x = `${req.params.date}T${req.body.time}:00.000Z`
                        let update = await serviceOrder.findByIdAndUpdate({ _id: findCart._id }, { $set: { date: text, toTime: x, fromTime: fromTime, }, }, { new: true });
                        if (update) {
                                const inputDate = new Date(update.toTime);
                                const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true };
                                const formattedDate = inputDate.toLocaleString('en-US', { ...options, timeZone: 'UTC' });
                                console.log(formattedDate);
                                if (req.body.mailSend != (null || undefined)) {
                                        if (req.body.mailSend == "yes") {
                                                var transporter = nodemailer.createTransport({ service: 'gmail', auth: { "user": "info@shahinahoja.com", "pass": "gganlypsemwqhwlh" } });
                                                let mailOptions = {
                                                        from: '<do_not_reply@gmail.com>',
                                                        to: `${findCart.user.email}`,
                                                        cc: 'info@shahinahoja.com',
                                                        subject: 'Appointment has been rescheduled',
                                                        html: `<!DOCTYPE html>
                                                        <html lang="en">
                                                        <head>
                                                          <meta charset="UTF-8" />
                                                          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                                                          <title>Email</title>
                                                        </head>
                                                        <body>
                                                          <div style="width: 100%; height: 100%">
                                                            <divstyle="background-color: white;max-width: 600px;margin: auto;border: 1px solid black;">
                                                              <divstyle="width: 90%;margin: auto;margin-top: 2rem;margin-bottom: 4rem;">
                                                                <h1 style="margin-bottom: 2rem">View message</h1>
                                                                <buttonstyle="color: white;border-left: 50%;padding: 5px;height: 2rem;width: 7rem;border-radius:
                                                                  1rem;background-color: blueviolet;border: none;outline: none;">Confirmed</button>
                                                                  <div style="margin-top: 2rem">
                                                                    <p style="font-size: 30px; font-weight: bold">
                                                                      Hi ${findCart.user.firstName},your appointment has been rescheduled
                                                                    </p>
                                                                  </div>
                                                                  <p style="margin-top: 1rem">
                                                                    <span style="color: rgb(153, 74, 228)">${formattedDate}</span>
                                                                    with shahine hoja Aesthetics
                                                                  </p>
                                                                  <div>
                                                                    <buttonstyle="width: 100%;padding: 10px;cursor: pointers;outline: none;border-radius: 3px;cursor:
                                                                      pointer;font-size: 1rem;margin-top: 1rem;">Manage appointment</button>
                                                                  </div>
                                                                  <div style="margin-top: 1.5rem">
                                                                    <h4 style="font-size: 1.5rem; font-weight: bold">
                                                                      Appointment details
                                                                    </h4>
                                                                    <div style="margin-top: 1rem;display: flex;justify-content: space-between;">
                                                                      <div>
                                                                        <ul>
                                                                          ${findCart.services.map((service, index) => `
                                                                          <h5 style="font-weight: bold; font-size: 1rem">${service.serviceId.name} $ ${service.price}</h5>
                                                                          <p style="color: rgb(131, 120, 120)"> ${service.totalTime} with Shahina</p>
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
                                                                    <div style="
                                                                        margin-top: 0.5rem;
                                                                        display: flex;
                                                                        justify-content: space-between;
                                                                      ">
                                                                      <div style="line-height: 0px">
                                                                        <h5>Shahine Hoja Aesthetics</h5>
                                                                        <p style="color: rgb(100, 28, 162)">
                                                                          905 Watters Creek Boulevard ,141 Allen, 75013, Texas, Us
                                                                        </p>
                                                                      </div>
                                                                      <img
                                                                        src="https://res.cloudinary.com/djgrqoefp/image/upload/v1704388341/shahina/contactDetail/lv8rvmn6nbkzbzekiexq.png"
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
                                                                  <p style="margin-top: 2.5rem">
                                                                    we send you this because you have booked with shahine hoja Aesthics,
                                                                    which partners with for appoinment and payments.
                                                                  </p>
                                                          </div>
                                                          </div>
                                                          </div>
                                                        </body>
                                                        </html>`,
                                                };
                                                let info1 = await transporter.sendMail(mailOptions);
                                                if (info1) {
                                                        return res.status(200).send({ status: 200, message: "Resechdule successfully.", data: update });
                                                } else {
                                                        return res.status(200).send({ status: 200, message: "Resechdule successfully.", data: update });
                                                }
                                        } else {
                                                return res.status(200).send({ status: 200, message: "Resechdule successfully.", data: update });
                                        }
                                } else {
                                        return res.status(200).send({ status: 200, message: "Resechdule successfully.", data: update });
                                }
                        }
                } else {
                        return res.status(404).send({ status: 404, message: "Your order is not found." });
                }
        } catch (error) {
                console.error(error);
                return res.status(500).send({ status: 500, message: "Server error" + error.message });
        }
};
exports.deleteCartItem = async (req, res, next) => {
        try {
                const itemId = req.params.id;
                let cart = await Cart.findOne({ user: req.params.userId });
                if (!cart) {
                        return res.status(404).json({ status: 404, msg: `ServiceOrder is empty`, cart: {} });
                }
                const itemIndex = cart.services.findIndex((cartItem) => cartItem.serviceId.toString() === itemId);
                if (itemIndex === -1) {
                        return res.status(404).json({ status: 404, msg: `service not found in cart`, cart: {} });
                }
                cart.services.splice(itemIndex, 1);
                await cart.save();
                if (cart.services.length > 0) {
                        return res.status(200).json({ status: 200, msg: `removed from cart`, cart: cart });
                } else {
                        return res.status(200).json({ status: 200, msg: "Cart is empty", cart: {} });
                }
        } catch (error) {
                console.log(error);
                return res.status(500).json({ status: 500, msg: "internal server error", error: error });
        }
};
exports.addToCart = async (req, res, next) => {
        try {
                const d = new Date(req.body.date);
                let text = d.toISOString();
                const data3 = await User.findOne({ _id: req.body.userId });
                let cart = await Cart.findOne({ user: req.body.userId });
                if (!cart) {
                        let findService = await services.findById({ _id: req.params.id });
                        if (!findService) {
                                return res.status(404).json({ message: "Service Not Found", status: 404, data: {} });
                        } else {
                                let totalTime = findService.totalMin;
                                const timeArray = req.body.time.split(':');
                                const hours = parseInt(timeArray[0]);
                                const minutes = parseInt(timeArray[1]);
                                const providedTimeInMinutes = hours * 60 + minutes;
                                let fromTimeInMinutes = providedTimeInMinutes + totalTime + 30;
                                const fromTime = new Date(d);
                                fromTime.setMinutes(fromTimeInMinutes);
                                let x = `${req.body.date}T${req.body.time}:00.000Z`;
                                let discountProvide, price;
                                if (req.body.discount > 0) {
                                        discountProvide = true
                                } else {
                                        discountProvide = false
                                }
                                if (data3.isSubscription === true) {
                                        price = findService.mPrice
                                } else {
                                        price = findService.price
                                }
                                let ser = {
                                        serviceId: findService._id,
                                        discount: req.body.discount,
                                        discountProvide: discountProvide,
                                        price: price,
                                        totalTime: findService.totalTime,
                                        totalMin: findService.totalMin,
                                        teamMember: req.body.teamMember
                                };
                                let services = [ser];
                                let obj = {
                                        user: req.body.userId,
                                        date: text,
                                        toTime: x,
                                        fromTime: fromTime,
                                        services: services,
                                };
                                let saveCart1 = await Cart.create(obj);
                                if (saveCart1) {
                                        return res.status(200).json({ status: 200, message: 'Service added to cart', data: saveCart1 });
                                }
                        }
                } else {
                        const itemIndex = cart.services.findIndex((cartItem) => cartItem.serviceId.toString() === req.params.id);
                        if (itemIndex === -1) {
                                let findService = await services.findById({ _id: req.params.id });
                                if (!findService) {
                                        return res.status(404).json({ message: "Service Not Found", status: 404, data: {} });
                                }
                                let discountProvide, price;
                                if (req.body.discount > 0) {
                                        discountProvide = true
                                } else {
                                        discountProvide = false
                                }
                                if (data3.isSubscription === true) {
                                        price = findService.mPrice
                                } else {
                                        price = findService.price
                                }
                                let obj = {
                                        serviceId: req.params.id,
                                        quantity: req.body.quantity,
                                        discount: req.body.discount,
                                        discountProvide: discountProvide,
                                        price: price,
                                        totalTime: findService.totalTime,
                                        totalMin: findService.totalMin,
                                        teamMember: req.body.teamMembe
                                };
                                cart.services.push(obj);
                                const totalPromises = cart.services.map(async (service) => {
                                        return service.totalMin * service.quantity;
                                });
                                const totalArray = await Promise.all(totalPromises);
                                let totalTime = totalArray.reduce((total, value) => {
                                        return total + value;
                                }, 0);
                                const timeArray = req.body.time.split(':');
                                const hours = parseInt(timeArray[0]);
                                const minutes = parseInt(timeArray[1]);
                                const providedTimeInMinutes = hours * 60 + minutes;
                                let fromTimeInMinutes = providedTimeInMinutes + totalTime + 90;
                                const fromTime = new Date(d);
                                fromTime.setMinutes(fromTimeInMinutes);
                                let x = `${req.body.date}T${req.body.time}:00.000Z`;
                                cart.toTime = x;
                                cart.fromTime = fromTime;
                                cart.date = text;
                                await cart.save();
                                let saveCart = await Cart.findOne({ _id: cart._id }).populate([{ path: "AddOnservicesSchema.addOnservicesId", select: { reviews: 0 } }, { path: "services.serviceId", select: { reviews: 0 } }, { path: "coupon", select: "couponCode discount expirationDate used per" },]);
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
                                                                        cartProduct.subTotal = parseFloat((cartProduct.price * cartProduct.quantity).toFixed(2));
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
                                if (saveCart.AddOnservicesSchema.length > 0) {
                                        saveCart.AddOnservicesSchema.forEach((cartGift) => {
                                                cartGift.total = parseFloat((cartGift.price * cartGift.quantity).toFixed(2));
                                                cartGift.subTotal = parseFloat((cartGift.price * cartGift.quantity).toFixed(2));
                                                subTotal += cartGift.subTotal;
                                                total += cartGift.total;
                                        });
                                }
                                saveCart.memberShipPer = Number(membershipDiscountPercentage);
                                saveCart.memberShip = parseFloat(membershipDiscount).toFixed(2)
                                saveCart.offerDiscount = Number(offerDiscount);
                                saveCart.subTotal = subTotal;
                                saveCart.total = total;
                                await saveCart.save();
                                return res.status(200).json({ msg: `added to cart`, data: saveCart });
                        } else {
                                let findService = await services.findById({ _id: req.params.id });
                                if (!findService) {
                                        return res.status(404).json({ message: "Service Not Found", status: 404, data: {} });
                                }
                                let discountProvide;
                                if (req.body.discount > 0) {
                                        discountProvide = true
                                } else {
                                        discountProvide = false
                                }
                                let price;
                                if (findService.type == "offer") {
                                        price = findService.discountPrice
                                } else {
                                        if (data3.isSubscription === true) {
                                                price = findService.mPrice
                                        } else {
                                                price = findService.price
                                        }
                                }
                                cart.services[itemIndex].quantity = req.body.quantity;
                                cart.services[itemIndex].price = price;
                                cart.services[itemIndex].totalTime = findService.totalTime;
                                cart.services[itemIndex].totalMin = findService.totalMin;
                                cart.services[itemIndex].discount = req.body.discount;
                                cart.services[itemIndex].discountProvide = discountProvide;
                                cart.services[itemIndex].teamMember = req.body.teamMember;
                                cart.totalTime = cart.services.reduce((total, service) => {
                                        const serviceObj = findService;
                                        return total + serviceObj.totalMin * service.quantity;
                                }, 0);
                                await cart.save();
                                let saveCart = await Cart.findOne({ _id: cart._id }).populate([{ path: "AddOnservicesSchema.addOnservicesId", select: { reviews: 0 } }, { path: "services.serviceId", select: { reviews: 0 } }, { path: "coupon", select: "couponCode discount expirationDate used per" },]);
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
                                                                        cartProduct.subTotal = parseFloat((cartProduct.price * cartProduct.quantity).toFixed(2));
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
                                if (saveCart.AddOnservicesSchema.length > 0) {
                                        saveCart.AddOnservicesSchema.forEach((cartGift) => {
                                                cartGift.total = parseFloat((cartGift.price * cartGift.quantity).toFixed(2));
                                                cartGift.subTotal = parseFloat((cartGift.price * cartGift.quantity).toFixed(2));
                                                subTotal += cartGift.subTotal;
                                                total += cartGift.total;
                                        });
                                }
                                saveCart.memberShipPer = Number(membershipDiscountPercentage);
                                saveCart.memberShip = parseFloat(membershipDiscount).toFixed(2)
                                saveCart.offerDiscount = Number(offerDiscount);
                                saveCart.subTotal = subTotal;
                                saveCart.total = total;
                                await saveCart.save();
                                return res.status(200).json({ msg: `added to cart`, data: saveCart });
                        }
                }
        } catch (error) {
                next(error);
        }
}
exports.editServiceInCart = async (req, res, next) => {
        try {
                const data3 = await User.findOne({ _id: req.body.userId });
                let cart = await Cart.findOne({ user: req.body.userId });
                if (!cart) {
                        return res.status(200).json({ success: false, msg: "Cart is empty", cart: {} });
                } else {
                        const itemIndex = cart.services.findIndex((cartItem) => cartItem.serviceId.toString() === req.params.id);
                        if (itemIndex === -1) {
                                return res.status(404).json({ message: "Service Not Found in cart.", status: 404, data: {} });
                        } else {
                                let findService = await services.findById({ _id: req.params.id });
                                if (!findService) {
                                        return res.status(404).json({ message: "Service Not Found", status: 404, data: {} });
                                }
                                let discountProvide;
                                if (req.body.discount > 0) {
                                        discountProvide = true
                                } else {
                                        discountProvide = false
                                }
                                if (req.body.price != (null || undefined)) {
                                        cart.services[itemIndex].price = req.body.price;
                                } else {
                                        cart.services[itemIndex].price = cart.services[itemIndex].price;
                                }
                                if (req.body.quantity != (null || undefined)) {
                                        cart.services[itemIndex].quantity = req.body.quantity;
                                } else {
                                        cart.services[itemIndex].quantity = cart.services[itemIndex].quantity;
                                }
                                if (req.body.totalTime != (null || undefined)) {
                                        cart.services[itemIndex].totalTime = req.body.totalTime;
                                        cart.services[itemIndex].totalMin = req.body.totalMin;
                                } else {
                                        cart.services[itemIndex].totalTime = cart.services[itemIndex].totalTime;
                                        cart.services[itemIndex].totalMin = cart.services[itemIndex].totalMin;
                                }
                                cart.services[itemIndex].serviceId = req.body.newServiceId;
                                cart.services[itemIndex].discount = req.body.discount;
                                cart.services[itemIndex].discountProvide = discountProvide;
                                cart.services[itemIndex].teamMember = req.body.teamMember;
                                cart.totalTime = cart.services.reduce((total, service) => {
                                        const serviceObj = findService;
                                        return total + serviceObj.totalMin * service.quantity;
                                }, 0);
                                let x = `${req.body.date}T${req.body.time}:00.000Z`;
                                cart.toTime = x;
                                cart.teamMember = req.body.teamMember;
                                await cart.save();
                                let saveCart = await Cart.findOne({ _id: cart._id }).populate([{ path: "AddOnservicesSchema.addOnservicesId", select: { reviews: 0 } }, { path: "services.serviceId", select: { reviews: 0 } }, { path: "coupon", select: "couponCode discount expirationDate used per" },]);
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
                                                                        cartProduct.subTotal = parseFloat((cartProduct.price * cartProduct.quantity).toFixed(2));
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
                                if (saveCart.AddOnservicesSchema.length > 0) {
                                        saveCart.AddOnservicesSchema.forEach((cartGift) => {
                                                cartGift.total = parseFloat((cartGift.price * cartGift.quantity).toFixed(2));
                                                cartGift.subTotal = parseFloat((cartGift.price * cartGift.quantity).toFixed(2));
                                                subTotal += cartGift.subTotal;
                                                total += cartGift.total;
                                        });
                                }
                                saveCart.memberShipPer = Number(membershipDiscountPercentage);
                                saveCart.memberShip = parseFloat(membershipDiscount).toFixed(2)
                                saveCart.offerDiscount = Number(offerDiscount);
                                saveCart.subTotal = subTotal;
                                saveCart.total = total;
                                await saveCart.save();
                                return res.status(200).json({ msg: `added to cart`, data: saveCart });
                        }
                }
        } catch (error) {
                next(error);
        }
}
exports.addToCartAddOnservices = async (req, res, next) => {
        try {
                let cart = await Cart.findOne({ user: req.body.userId });
                if (!cart) {
                        let findService = await addOnservices.findById({ _id: req.params.id });
                        if (!findService) {
                                return res.status(404).json({ message: "Service Not Found", status: 404, data: {} });
                        } else {
                                let ser = {
                                        addOnservicesId: findService._id,
                                        price: findService.price,
                                        totalTime: findService.totalTime,
                                        totalMin: findService.totalMin,
                                        teamMember: req.body.teamMember
                                };
                                let AddOnservicesSchema = [ser];
                                let obj = {
                                        user: req.body.userId,
                                        AddOnservicesSchema: AddOnservicesSchema,
                                };
                                let saveCart1 = await Cart.create(obj);
                                if (saveCart1) {
                                        return res.status(200).json({ status: 200, message: 'Service added to cart', data: saveCart1 });
                                }
                        }
                } else {
                        const itemIndex = cart.AddOnservicesSchema.findIndex((cartItem) => cartItem.addOnservicesId.toString() === req.params.id);
                        if (itemIndex === -1) {
                                let findService = await addOnservices.findById({ _id: req.params.id });
                                if (!findService) {
                                        return res.status(404).json({ message: "Service Not Found", status: 404, data: {} });
                                }
                                let obj = {
                                        addOnservicesId: req.params.id,
                                        quantity: req.body.quantity,
                                        price: findService.price,
                                        totalTime: findService.totalTime,
                                        totalMin: findService.totalMin,
                                        teamMember: req.body.teamMember
                                };
                                cart.AddOnservicesSchema.push(obj);
                                await cart.save();
                                let saveCart = await Cart.findOne({ _id: cart._id }).populate([{ path: "AddOnservicesSchema.addOnservicesId", select: { reviews: 0 } }, { path: "services.serviceId", select: { reviews: 0 } }, { path: "coupon", select: "couponCode discount expirationDate used per" },]);
                                const data3 = await User.findOne({ _id: req.body.userId });
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
                                                                        cartProduct.subTotal = parseFloat((cartProduct.price * cartProduct.quantity).toFixed(2));
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
                                if (saveCart.AddOnservicesSchema.length > 0) {
                                        saveCart.AddOnservicesSchema.forEach((cartGift) => {
                                                cartGift.total = parseFloat((cartGift.price * cartGift.quantity).toFixed(2));
                                                cartGift.subTotal = parseFloat((cartGift.price * cartGift.quantity).toFixed(2));
                                                subTotal += cartGift.subTotal;
                                                total += cartGift.total;
                                        });
                                }
                                saveCart.memberShipPer = Number(membershipDiscountPercentage);
                                saveCart.memberShip = parseFloat(membershipDiscount).toFixed(2)
                                saveCart.offerDiscount = Number(offerDiscount);
                                saveCart.subTotal = subTotal;
                                saveCart.total = total;
                                await saveCart.save();
                                return res.status(200).json({ msg: `added to cart`, data: saveCart });
                        } else {
                                let findService = await addOnservices.findById({ _id: req.params.id });
                                if (!findService) {
                                        return res.status(404).json({ message: "Service Not Found", status: 404, data: {} });
                                }
                                cart.AddOnservicesSchema[itemIndex].price = findService.price;
                                cart.AddOnservicesSchema[itemIndex].totalMin = findService.totalMin;
                                cart.AddOnservicesSchema[itemIndex].totalTime = findService.totalTime;
                                cart.AddOnservicesSchema[itemIndex].quantity = req.body.quantity;
                                cart.AddOnservicesSchema[itemIndex].teamMember = req.body.teamMember;
                                await cart.save();
                                let saveCart = await Cart.findOne({ _id: cart._id }).populate([{ path: "AddOnservicesSchema.addOnservicesId", select: { reviews: 0 } }, { path: "services.serviceId", select: { reviews: 0 } }, { path: "coupon", select: "couponCode discount expirationDate used per" },]);
                                const data3 = await User.findOne({ _id: req.body.userId });
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
                                                                        cartProduct.subTotal = parseFloat((cartProduct.price * cartProduct.quantity).toFixed(2));
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
                                if (saveCart.AddOnservicesSchema.length > 0) {
                                        saveCart.AddOnservicesSchema.forEach((cartGift) => {
                                                cartGift.total = parseFloat((cartGift.price * cartGift.quantity).toFixed(2));
                                                cartGift.subTotal = parseFloat((cartGift.price * cartGift.quantity).toFixed(2));
                                                subTotal += cartGift.subTotal;
                                                total += cartGift.total;
                                        });
                                }
                                saveCart.memberShipPer = Number(membershipDiscountPercentage);
                                saveCart.memberShip = parseFloat(membershipDiscount).toFixed(2)
                                saveCart.offerDiscount = Number(offerDiscount);
                                saveCart.subTotal = subTotal;
                                saveCart.total = total;
                                await saveCart.save();
                                return res.status(200).json({ msg: `added to cart`, data: saveCart });
                        }
                }
        } catch (error) {
                next(error);
        }
}
exports.editAddOnservicesInCart = async (req, res, next) => {
        try {
                let cart = await Cart.findOne({ user: req.body.userId });
                if (!cart) {
                        return res.status(200).json({ success: false, msg: "Cart is empty", cart: {} });
                } else {
                        const itemIndex = cart.AddOnservicesSchema.findIndex((cartItem) => cartItem.addOnservicesId.toString() === req.params.id);
                        if (itemIndex === -1) {
                                return res.status(404).json({ message: "Service Not Found in cart.", status: 404, data: {} });
                        } else {
                                let findService = await addOnservices.findById({ _id: req.params.id });
                                if (!findService) {
                                        return res.status(404).json({ message: "Service Not Found", status: 404, data: {} });
                                }
                                cart.AddOnservicesSchema[itemIndex].addOnservicesId = req.body.newServiceId;
                                cart.AddOnservicesSchema[itemIndex].price = findService.price;
                                cart.AddOnservicesSchema[itemIndex].totalMin = findService.totalMin;
                                cart.AddOnservicesSchema[itemIndex].totalTime = findService.totalTime;
                                cart.AddOnservicesSchema[itemIndex].quantity = req.body.quantity;
                                cart.AddOnservicesSchema[itemIndex].teamMember = req.body.teamMember;
                                let x = `${req.body.date}T${req.body.time}:00.000Z`;
                                cart.toTime = x;
                                cart.teamMember = req.body.teamMember;
                                await cart.save();
                                let saveCart = await Cart.findOne({ _id: cart._id }).populate([{ path: "AddOnservicesSchema.addOnservicesId", select: { reviews: 0 } }, { path: "services.serviceId", select: { reviews: 0 } }, { path: "coupon", select: "couponCode discount expirationDate used per" },]);
                                const data3 = await User.findOne({ _id: req.body.userId });
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
                                                                        cartProduct.subTotal = parseFloat((cartProduct.price * cartProduct.quantity).toFixed(2));
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
                                if (saveCart.AddOnservicesSchema.length > 0) {
                                        saveCart.AddOnservicesSchema.forEach((cartGift) => {
                                                cartGift.total = parseFloat((cartGift.price * cartGift.quantity).toFixed(2));
                                                cartGift.subTotal = parseFloat((cartGift.price * cartGift.quantity).toFixed(2));
                                                subTotal += cartGift.subTotal;
                                                total += cartGift.total;
                                        });
                                }
                                saveCart.memberShipPer = Number(membershipDiscountPercentage);
                                saveCart.memberShip = parseFloat(membershipDiscount).toFixed(2)
                                saveCart.offerDiscount = Number(offerDiscount);
                                saveCart.subTotal = subTotal;
                                saveCart.total = total;
                                await saveCart.save();
                                return res.status(200).json({ msg: `added to cart`, data: saveCart });
                        }
                }
        } catch (error) {
                next(error);
        }
}
exports.deleteAddOnservicesFromCart = async (req, res, next) => {
        try {
                const itemId = req.params.id;
                let cart = await Cart.findOne({ user: req.params.userId });
                if (!cart) {
                        return res.status(404).json({ status: 404, msg: `ServiceOrder is empty`, cart: {} });
                }
                const itemIndex = cart.AddOnservicesSchema.findIndex((cartItem) => cartItem.addOnservicesId.toString() === itemId);
                if (itemIndex === -1) {
                        return res.status(404).json({ status: 404, msg: `service not found in cart`, cart: {} });
                }
                cart.AddOnservicesSchema.splice(itemIndex, 1);
                await cart.save();
                if (cart.AddOnservicesSchema.length > 0) {
                        return res.status(200).json({ status: 200, msg: `removed from cart`, cart: cart });
                } else {
                        return res.status(200).json({ status: 200, msg: "Cart is empty", cart: {} });
                }
        } catch (error) {
                console.log(error);
                return res.status(500).json({ status: 500, msg: "internal server error", error: error });
        }
};
exports.getCart = async (req, res, next) => {
        try {
                const cart = await Cart.findOne({ user: req.params.userId });
                if (!cart) {
                        return res.status(200).json({ success: false, msg: "Cart is empty", cart: {} });
                }
                let cartResponse;
                if (cart.services.length > 0) {
                        cartResponse = await calculateCartResponse(cart, req.params.userId, true);
                } else {
                        cartResponse = await calculateCartResponse(cart, req.params.userId);
                }
                return res.status(200).json({ success: true, msg: "Cart retrieved successfully", cart: cartResponse });
        } catch (error) {
                console.log(error);
                next(error);
        }
};
const calculateCartResponse = async (cart, userId) => {
        try {
                await cart.populate([{ path: 'user' }, { path: "gifts.giftPriceId", populate: { path: 'giftId', model: 'gift' }, select: { reviews: 0 } }, { path: "AddOnservicesSchema.addOnservicesId", select: { reviews: 0 } }, { path: "services.serviceId", select: { reviews: 0 } }, { path: "coupon", select: "couponCode discount expirationDate used per" }]);
                const data1 = await Address.findOne({ type: "Admin" }).select('address appartment landMark -_id');
                const data2 = await Address.findOne({ user: userId, addressType: "Shipping" }).select('address appartment city state zipCode -_id');
                const data5 = await Address.findOne({ user: userId, addressType: "Billing" }).select('address appartment city state zipCode -_id');
                const data3 = await User.findOne({ _id: userId });
                console.log(data3);
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
                let offerDiscount = 0, onProductDiscount = 0, membershipDiscount = 0, shipping = 0, total = 0, subTotal = 0;
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
                                                        let x = 0;
                                                        cartProduct.membershipDiscount = parseFloat(x.toFixed(2))
                                                        membershipDiscount += x;
                                                        cartProduct.subTotal = parseFloat((cartProduct.price * cartProduct.quantity).toFixed(2));
                                                        cartProduct.total = parseFloat((cartProduct.price * cartProduct.quantity).toFixed(2));
                                                        cartProduct.offerDiscount = 0.00;
                                                        offerDiscount += cartProduct.offerDiscount;
                                                        total += cartProduct.total;
                                                        subTotal += cartProduct.subTotal;
                                                } else {
                                                        let x = 0;
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
                                                        let x = 0;
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
        };
};
exports.checkout = async (req, res) => {
        try {
                let findOrder1 = await serviceOrder.find({ user: req.params.userId, orderStatus: "unconfirmed" });
                let findOrder2 = await userOrders.find({ user: req.params.userId, orderStatus: "unconfirmed" });
                if (findOrder1.length > 0 || findOrder2.length > 0) {
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
                        let findCart = await Cart.findOne({ user: req.params.userId }).populate([{ path: "AddOnservicesSchema.addOnservicesId", select: { reviews: 0 } }, { path: "services.serviceId", select: { reviews: 0 } }, { path: "coupon", select: "couponCode discount expirationDate used per" },]);
                        if (findCart) {
                                const data1 = await Address.findOne({ type: "Admin" }).select('address appartment landMark -_id');
                                const data3 = await User.findOne({ _id: req.params.userId });
                                let orderObjPaidAmount = 0, serviceOrderId, couponDiscount = 0, orderObjTotalAmount = 0;
                                if (findCart.coupon && moment().isAfter(findCart.coupon.expirationDate, "day")) { findCart.coupon = undefined; findCart.save(); }
                                const cartResponse = findCart.toObject();
                                let orderId = await reffralCode();
                                cartResponse.orderId = orderId;
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
                                                                                let x = 0;
                                                                                cartProduct.membershipDiscount = parseFloat(x.toFixed(2))
                                                                                membershipDiscount += x;
                                                                                cartProduct.subTotal = parseFloat((cartProduct.price * cartProduct.quantity).toFixed(2));
                                                                                cartProduct.total = parseFloat((cartProduct.memberprice * cartProduct.quantity).toFixed(2));
                                                                                cartProduct.offerDiscount = 0.00;
                                                                                offerDiscount += cartProduct.offerDiscount;
                                                                                total += cartProduct.total;
                                                                                subTotal += cartProduct.subTotal;
                                                                        } else {
                                                                                let x = 0;
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
                                        cartResponse.date = findCart.date;
                                        cartResponse.toTime = findCart.toTime;
                                        cartResponse.fromTime = findCart.fromTime;
                                        cartResponse.suggesstion = findCart.suggesstion;
                                        cartResponse.memberShipPer = Number(membershipDiscountPercentage);
                                        cartResponse.memberShip = parseFloat(membershipDiscount).toFixed(2)
                                        cartResponse.offerDiscount = Number(offerDiscount);
                                        cartResponse.subTotal = subTotal;
                                        cartResponse.total = total;
                                        cartResponse.serviceAddresss = data1;
                                        if (findCart.toTime != (null || undefined)) {
                                                if (findCart.services.length > 0) {
                                                        for (let i = 0; i < findCart.services.length; i++) {
                                                                totalTime = totalTime + findCart.services[i].totalMin;
                                                        }
                                                }
                                                if (findCart.AddOnservicesSchema.length > 0) {
                                                        for (let i = 0; i < findCart.AddOnservicesSchema.length; i++) {
                                                                totalTime = totalTime + findCart.AddOnservicesSchema[i].totalMin;
                                                        }
                                                }
                                        }
                                        const dateObject = new Date(findCart.date);
                                        const dateString = dateObject.toISOString().split('T')[0];
                                        const newTime = "00:00:00.000+00:00";
                                        const replacedDateString = `${dateString}T${newTime} `;
                                        console.log({ from: { $lte: findCart.fromTime }, to: { $gte: findCart.toTime }, date: new Date(dateObject), isBooked: false });
                                        let findSlot1 = await slot.find({ from: { $lte: findCart.fromTime }, to: { $gte: findCart.toTime }, date: new Date(dateObject), isBooked: false });
                                        if (findSlot1.length > 0) {
                                                orderObjTotalAmount = orderObjTotalAmount + total;
                                                cartResponse._id = new mongoose.Types.ObjectId();
                                                cartResponse.orderStatus = "adminUnconfirmed";
                                                if (totalTime > 0) {
                                                        var hours2 = Math.floor(totalTime / 60);
                                                        var minutes2 = totalTime % 60;
                                                        let timeInMin = hours2 + "hr" + " " + minutes2 + "min"
                                                        cartResponse.timeInMin = timeInMin;
                                                }
                                                let saveOrder = await serviceOrder.create(cartResponse);
                                                if (saveOrder) {
                                                        let findSlot = await slot.find({ from: { $lte: findCart.fromTime }, to: { $gte: findCart.toTime }, date: dateObject, isBooked: false });
                                                        if (findSlot.length > 0) {
                                                                for (let i = 0; i < findSlot.length; i++) {
                                                                        let updateSlot = await slot.findByIdAndUpdate({ _id: findSlot[i]._id }, { $set: { isBooked: true } }, { new: true });
                                                                }
                                                        }
                                                        var transporter = nodemailer.createTransport({ service: 'gmail', auth: { "user": "info@shahinahoja.com", "pass": "gganlypsemwqhwlh" } });
                                                        let mailOptions = {
                                                                from: '<do_not_reply@gmail.com>',
                                                                to: `${data3.email}`,
                                                                subject: 'Order Received',
                                                                text: `You have received a new order`,
                                                                html: `<p> You have received a new order:</p>
                                                                  <p>Order Id: ${saveOrder.orderId}</p>
                                                                  <p>Order Amount: ${saveOrder.total}</p>
                                                                  <p>Hi ${data3.firstName} ${data3.lastName}, your appointment is confirmed</p>
                                                                  <p>Your appointment with Shahina Hoja Aesthetics is now booked for ${saveOrder.date}  at ${saveOrder.toTime}.</p>
                                                                  <p>Appointment details:</p>
                                                                  <ul>
                                                                    ${findCart.services.map((service, index) => `
                                                                      <li>
                                                                        Service ${index + 1}:
                                                                        <ul>
                                                                          <li>Name: ${service.serviceId.name}</li>
                                                                          <li>Price: ${service.price}</li>
                                                                          <li>Quantity: ${service.quantity}</li>
                                                                        </ul>
                                                                      </li>
                                                                    `).join('')}
                                                                  </ul>
                                                                  <p>Location</p>
                                                                  <p>Shahina Hoja Aesthetics</p>
                                                                  <p>905 Watters Creek Boulevard, 141,</p>
                                                                  <p> Allen, 75013, Texas, US</p>
                                                                  <p>Cancellation policy</p>
                                                                  <p>Please avoid cancelling within 48 hours of your appointment.</p>
                                                                  <p>Important info.</p>
                                                                  <p>Your appointment is now confirmed! Are you interested in paying in installments with Cherry payment plans? Get pre-approved today! Applying won't harm your credit! https://pay.withcherry.com/shahinahoja.</p>
                                                                  <p>We sent you this email because you have booked with Shahina Hoja Aesthetics, which partners for appointments and payments.</p>
                                        `,
                                                        };
                                                        let info1 = await transporter.sendMail(mailOptions);
                                                        serviceOrderId = saveOrder._id;
                                                }
                                        } else {
                                                return res.status(400).json({ status: 400, msg: "This Slot already booked. ", data: {} });
                                        }
                                }
                                if (cartResponse.services.length > 0) {
                                        orderObjTotalAmount = orderObjTotalAmount;
                                        let orderObj = {
                                                userId: req.params.userId,
                                                orderId: orderId,
                                                serviceOrder: serviceOrderId,
                                                orderObjTotalAmount: orderObjTotalAmount.toFixed(2),
                                                applyCoupan: cartResponse.coupon,
                                                couponDiscount: couponDiscount,
                                                orderStatus: "confirmed",
                                                orderObjPaidAmount: orderObjPaidAmount.toFixed(2),
                                        }
                                        let saveOrder1 = await userOrders.create(orderObj);
                                        if (saveOrder1) {
                                                let deleteCart = await Cart.findOneAndDelete({ user: req.params.userId });
                                                return res.status(200).json({ msg: "service order", data: saveOrder1 });
                                        }
                                }
                        } else {
                                return res.status(200).json({ success: false, msg: "Cart is empty", cart: {} });
                        }
                } else {
                        let findCart = await Cart.findOne({ user: req.params.userId }).populate([{ path: "AddOnservicesSchema.addOnservicesId", select: { reviews: 0 } }, { path: "services.serviceId", select: { reviews: 0 } }, { path: "coupon", select: "couponCode discount expirationDate used per" },]);
                        if (findCart) {
                                const data1 = await Address.findOne({ type: "Admin" }).select('address appartment landMark -_id');
                                const data3 = await User.findOne({ _id: req.params.userId });
                                let orderObjPaidAmount = 0, serviceOrderId, couponDiscount = 0, orderObjTotalAmount = 0;
                                if (findCart.coupon && moment().isAfter(findCart.coupon.expirationDate, "day")) { findCart.coupon = undefined; findCart.save(); }
                                const cartResponse = findCart.toObject();
                                let orderId = await reffralCode();
                                cartResponse.orderId = orderId;
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
                                                                                let x = 0;
                                                                                cartProduct.membershipDiscount = parseFloat(x.toFixed(2))
                                                                                membershipDiscount += x;
                                                                                cartProduct.subTotal = parseFloat((cartProduct.price * cartProduct.quantity).toFixed(2));
                                                                                cartProduct.total = parseFloat((cartProduct.memberprice * cartProduct.quantity).toFixed(2));
                                                                                cartProduct.offerDiscount = 0.00;
                                                                                offerDiscount += cartProduct.offerDiscount;
                                                                                total += cartProduct.total;
                                                                                subTotal += cartProduct.subTotal;
                                                                        } else {
                                                                                let x = 0;
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
                                        cartResponse.date = findCart.date;
                                        cartResponse.toTime = findCart.toTime;
                                        cartResponse.fromTime = findCart.fromTime;
                                        cartResponse.suggesstion = findCart.suggesstion;
                                        cartResponse.memberShipPer = Number(membershipDiscountPercentage);
                                        cartResponse.memberShip = parseFloat(membershipDiscount).toFixed(2)
                                        cartResponse.offerDiscount = Number(offerDiscount);
                                        cartResponse.subTotal = subTotal;
                                        cartResponse.total = total;
                                        cartResponse.serviceAddresss = data1;
                                        if (findCart.toTime != (null || undefined)) {
                                                if (findCart.services.length > 0) {
                                                        for (let i = 0; i < findCart.services.length; i++) {
                                                                totalTime = totalTime + findCart.services[i].totalMin;
                                                        }
                                                }
                                                if (findCart.AddOnservicesSchema.length > 0) {
                                                        for (let i = 0; i < findCart.AddOnservicesSchema.length; i++) {
                                                                totalTime = totalTime + findCart.AddOnservicesSchema[i].totalMin;
                                                        }
                                                }
                                        }
                                        const dateObject = new Date(findCart.date);
                                        const dateString = dateObject.toISOString().split('T')[0];
                                        const newTime = "00:00:00.000+00:00";
                                        const replacedDateString = `${dateString}T${newTime} `;
                                        console.log({ from: { $lte: findCart.fromTime }, to: { $gte: findCart.toTime }, date: new Date(dateObject), isBooked: false });
                                        let findSlot1 = await slot.find({ from: { $lte: findCart.fromTime }, to: { $gte: findCart.toTime }, date: new Date(dateObject), isBooked: false });
                                        if (findSlot1.length > 0) {
                                                orderObjTotalAmount = orderObjTotalAmount + total;
                                                cartResponse._id = new mongoose.Types.ObjectId();
                                                cartResponse.orderStatus = "adminUnconfirmed";
                                                if (totalTime > 0) {
                                                        var hours2 = Math.floor(totalTime / 60);
                                                        var minutes2 = totalTime % 60;
                                                        let timeInMin = hours2 + "hr" + " " + minutes2 + "min"
                                                        cartResponse.timeInMin = timeInMin;
                                                }
                                                let saveOrder = await serviceOrder.create(cartResponse);
                                                if (saveOrder) {
                                                        let findSlot = await slot.find({ from: { $lte: findCart.fromTime }, to: { $gte: findCart.toTime }, date: dateObject, isBooked: false });
                                                        if (findSlot.length > 0) {
                                                                for (let i = 0; i < findSlot.length; i++) {
                                                                        let updateSlot = await slot.findByIdAndUpdate({ _id: findSlot[i]._id }, { $set: { isBooked: true } }, { new: true });
                                                                }
                                                        }
                                                        var transporter = nodemailer.createTransport({ service: 'gmail', auth: { "user": "info@shahinahoja.com", "pass": "gganlypsemwqhwlh" } });
                                                        let mailOptions = {
                                                                from: '<do_not_reply@gmail.com>',
                                                                to: `${data3.email}`,
                                                                subject: 'Order Received',
                                                                text: `You have received a new order`,
                                                                html: `<p> You have received a new order:</p>
                                                                  <p>Order Id: ${saveOrder.orderId}</p>
                                                                  <p>Order Amount: ${saveOrder.total}</p>
                                                                  <p>Hi ${data3.firstName} ${data3.lastName}, your appointment is confirmed</p>
                                                                  <p>Your appointment with Shahina Hoja Aesthetics is now booked for ${saveOrder.date}  at ${saveOrder.toTime}.</p>
                                                                  <p>Appointment details:</p>
                                                                  <ul>
                                                                    ${findCart.services.map((service, index) => `
                                                                      <li>
                                                                        Service ${index + 1}:
                                                                        <ul>
                                                                          <li>Name: ${service.serviceId.name}</li>
                                                                          <li>Price: ${service.price}</li>
                                                                          <li>Quantity: ${service.quantity}</li>
                                                                        </ul>
                                                                      </li>
                                                                    `).join('')}
                                                                  </ul>
                                                                  <p>Location</p>
                                                                  <p>Shahina Hoja Aesthetics</p>
                                                                  <p>905 Watters Creek Boulevard, 141,</p>
                                                                  <p> Allen, 75013, Texas, US</p>
                                                                  <p>Cancellation policy</p>
                                                                  <p>Please avoid cancelling within 48 hours of your appointment.</p>
                                                                  <p>Important info.</p>
                                                                  <p>Your appointment is now confirmed! Are you interested in paying in installments with Cherry payment plans? Get pre-approved today! Applying won't harm your credit! https://pay.withcherry.com/shahinahoja.</p>
                                                                  <p>We sent you this email because you have booked with Shahina Hoja Aesthetics, which partners for appointments and payments.</p>
                                        `,
                                                        };
                                                        let info1 = await transporter.sendMail(mailOptions);
                                                        serviceOrderId = saveOrder._id;
                                                }
                                        } else {
                                                return res.status(400).json({ status: 400, msg: "This Slot already booked. ", data: {} });
                                        }
                                }
                                if (cartResponse.services.length > 0) {
                                        orderObjTotalAmount = orderObjTotalAmount;
                                        let orderObj = {
                                                userId: req.params.userId,
                                                orderId: orderId,
                                                serviceOrder: serviceOrderId,
                                                orderObjTotalAmount: orderObjTotalAmount.toFixed(2),
                                                applyCoupan: cartResponse.coupon,
                                                couponDiscount: couponDiscount,
                                                orderStatus: "confirmed",
                                                orderObjPaidAmount: orderObjPaidAmount.toFixed(2),
                                        }
                                        let saveOrder1 = await userOrders.create(orderObj);
                                        if (saveOrder1) {
                                                let deleteCart = await Cart.findOneAndDelete({ user: req.params.userId });
                                                return res.status(200).json({ msg: "service order", data: saveOrder1 });
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
exports.addSuggestionToServiceOrder = async (req, res) => {
        try {
                let findCart = await serviceOrder.findOne({ _id: req.params.id });
                if (findCart) {
                        let obj = {
                                suggesstion: req.body.suggestion
                        };
                        let update1 = await serviceOrder.findByIdAndUpdate({ _id: findCart._id }, { $push: { suggesstion: obj }, }, { new: true });
                        return res.status(200).json({ status: 200, message: "suggestion add to serviceOrder Successfully.", data: update1 })
                } else {
                        return res.status(404).json({ status: 404, message: "serviceOrder is not found.", data: {} });
                }
        } catch (error) {
                console.error(error);
                return res.status(500).send({ status: 500, message: "Server error" + error.message });
        }
};
exports.editSuggestionfromOrder = async (req, res) => {
        try {
                const findCart = await serviceOrder.findOne({ _id: req.params.id });
                if (findCart) {
                        const suggestionIndex = findCart.suggesstion.findIndex((suggestion) => suggestion._id.toString() === req.params.suggesstionId);
                        if (suggestionIndex !== -1) {
                                findCart.suggesstion[suggestionIndex].suggesstion = req.body.suggestion;
                                const updateCart = await findCart.save();
                                return res.status(200).send({ message: "Suggestion updated in order.", data: updateCart, });
                        } else {
                                return res.status(404).send({ status: 404, message: "Suggestion not found in the order.", data: [], });
                        }
                } else {
                        return res.status(404).send({ status: 404, message: "Order not found.", data: [], });
                }
        } catch (error) {
                console.error("Error in editSuggestionfromOrder:", error);
                return res.status(500).send({ status: 500, message: "Server error.", data: {}, });
        }
};
exports.deleteSuggestionfromOrder = async (req, res) => {
        try {
                let findCart = await serviceOrder.findOne({ _id: req.params.id });
                if (findCart) {
                        for (let i = 0; i < findCart.suggesstion.length; i++) {
                                if (findCart.suggesstion.length > 0) {
                                        if (((findCart.suggesstion[i]._id).toString() == req.params.suggesstionId) == true) {
                                                let updateCart = await serviceOrder.findByIdAndUpdate({ _id: findCart._id, 'suggesstion._id': req.params.suggesstionId }, {
                                                        $pull: {
                                                                'suggesstion':
                                                                {
                                                                        _id: req.params.suggesstionId,
                                                                        suggesstion: findCart.suggesstion[i].suggesstion,
                                                                }
                                                        }
                                                }, { new: true })
                                                if (updateCart) {
                                                        return res.status(200).send({ message: "suggesstion delete from order.", data: updateCart, });
                                                }
                                        }
                                } else {
                                        return res.status(200).send({ status: 200, message: "No Data Found ", data: [] });
                                }
                        }
                } else {
                        return res.status(200).send({ status: 200, message: "No Data Found ", cart: [] });
                }
        } catch (error) {
                console.log("353====================>", error)
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.getServiceOrdersByuserId = async (req, res, next) => {
        try {
                if (req.query.serviceStatus != (null || undefined)) {
                        const orders = await serviceOrder.find({ user: req.params.userId, serviceStatus: req.query.serviceStatus, orderStatus: ["confirmed" || "adminUnconfirmed"] }).sort({ createdAt: -1 }).populate([{ path: "AddOnservicesSchema.addOnservicesId", select: { reviews: 0 } }, { path: "services.serviceId", select: { reviews: 0 } }, { path: "coupon", select: "couponCode discount expirationDate" },]);
                        if (orders.length == 0) {
                                return res.status(404).json({ status: 404, message: "Orders not found", data: {} });
                        }
                        return res.status(200).json({ status: 200, msg: "orders of user", data: orders })
                } else {
                        const orders = await serviceOrder.find({ user: req.params.userId, orderStatus: ["confirmed" || "adminUnconfirmed"] }).sort({ createdAt: -1 }).populate([{ path: "AddOnservicesSchema.addOnservicesId", select: { reviews: 0 } }, { path: "services.serviceId", select: { reviews: 0 } }, { path: "coupon", select: "couponCode discount expirationDate" },]);
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
exports.editServiceInOrders = async (req, res, next) => {
        try {
                const cart = await serviceOrder.findById({ _id: req.params.id })
                if (!cart) {
                        return res.status(200).json({ success: false, msg: "Order not found.", cart: {} });
                } else {
                        const itemIndex = cart.services.findIndex((cartItem) => cartItem.serviceId.toString() === req.body.serviceId);
                        if (itemIndex === -1) {
                                return res.status(404).json({ message: "Service Not Found in cart.", status: 404, data: {} });
                        } else {
                                let findService = await services.findById({ _id: req.body.serviceId });
                                if (!findService) {
                                        return res.status(404).json({ message: "Service Not Found", status: 404, data: {} });
                                }
                                let discountProvide;
                                if (req.body.discount > 0) {
                                        discountProvide = true
                                } else {
                                        discountProvide = false
                                }
                                if (req.body.price != (null || undefined)) {
                                        cart.services[itemIndex].price = req.body.price;
                                } else {
                                        cart.services[itemIndex].price = cart.services[itemIndex].price;
                                }
                                if (req.body.quantity != (null || undefined)) {
                                        cart.services[itemIndex].quantity = req.body.quantity;
                                } else {
                                        cart.services[itemIndex].quantity = cart.services[itemIndex].quantity;
                                }
                                if (req.body.totalTime != (null || undefined)) {
                                        cart.services[itemIndex].totalTime = req.body.totalTime;
                                        cart.services[itemIndex].totalMin = req.body.totalMin;
                                } else {
                                        cart.services[itemIndex].totalTime = cart.services[itemIndex].totalTime;
                                        cart.services[itemIndex].totalMin = cart.services[itemIndex].totalMin;
                                }
                                cart.services[itemIndex].serviceId = req.body.newServiceId;
                                cart.services[itemIndex].discount = req.body.discount;
                                cart.services[itemIndex].discountProvide = discountProvide;
                                cart.services[itemIndex].teamMember = req.body.teamMember;
                                let x = `${req.body.date}T${req.body.time}:00.000Z`;
                                const d = new Date(req.body.date);
                                let text = d.toISOString();
                                cart.date = text;
                                cart.toTime = x;
                                cart.teamMember = req.body.teamMember;
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
                                }
                                const dateObject = new Date(cart.date);
                                const dateString = dateObject.toISOString().split('T')[0];
                                const newTime = "00:00:00.000+00:00";
                                const replacedDateString = `${dateString}T${newTime} `;
                                let findOrderData = await serviceOrder.findOne({ _id: cart._id, to: cart.toTime, date: replacedDateString })
                                if (findOrderData) {
                                        if (totalTime > 0) {
                                                var hours2 = Math.floor(totalTime / 60);
                                                var minutes2 = totalTime % 60;
                                                let timeInMin = hours2 + "hr" + " " + minutes2 + "min"
                                                cart.timeInMin = timeInMin;
                                                await cart.save();
                                        }
                                        let saveCart = await serviceOrder.findOne({ _id: cart._id }).populate([{ path: "AddOnservicesSchema.addOnservicesId", select: { reviews: 0 } }, { path: "services.serviceId", select: { reviews: 0 } }, { path: "coupon", select: "couponCode discount expirationDate used per" },]);
                                        let offerDiscount = 0, membershipDiscount = 0, membershipDiscountPercentage = 0, total = 0, subTotal = 0;
                                        if (saveCart.services.length > 0) {
                                                for (const cartProduct of saveCart.services) {
                                                        if (cartProduct.serviceId.type === "offer") {
                                                                cartProduct.subTotal = parseFloat((cartProduct.price * cartProduct.quantity).toFixed(2));
                                                                cartProduct.total = parseFloat((cartProduct.price * cartProduct.quantity).toFixed(2));
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
                                        if (isNaN(membershipDiscount)) {
                                                membershipDiscount = 0;
                                        }
                                        saveCart.memberShipPer = Number(membershipDiscountPercentage);
                                        saveCart.memberShip = parseFloat(membershipDiscount).toFixed(2)
                                        saveCart.offerDiscount = Number(offerDiscount);
                                        saveCart.subTotal = subTotal;
                                        saveCart.total = total;
                                        await saveCart.save();
                                        return res.status(200).json({ msg: `added to cart`, data: saveCart });
                                } else {
                                        let findSlot1 = await slot.find({ from: { $lte: cart.fromTime }, to: { $gte: cart.toTime }, date: replacedDateString, isBooked: false, slotBlocked: false });
                                        if (findSlot1.length > 0) {
                                                for (let i = 0; i < findSlot1.length; i++) {
                                                        let updateSlot = await slot.findByIdAndUpdate({ _id: findSlot1[i]._id }, { $set: { isBooked: true, } }, { new: true });
                                                        console.log(updateSlot);
                                                }
                                                if (totalTime > 0) {
                                                        var hours2 = Math.floor(totalTime / 60);
                                                        var minutes2 = totalTime % 60;
                                                        let timeInMin = hours2 + "hr" + " " + minutes2 + "min"
                                                        cart.timeInMin = timeInMin;
                                                        await cart.save();
                                                }
                                                let saveCart = await serviceOrder.findOne({ _id: cart._id }).populate([{ path: "AddOnservicesSchema.addOnservicesId", select: { reviews: 0 } }, { path: "services.serviceId", select: { reviews: 0 } }, { path: "coupon", select: "couponCode discount expirationDate used per" },]);
                                                let offerDiscount = 0, membershipDiscount = 0, membershipDiscountPercentage = 0, total = 0, subTotal = 0;
                                                if (saveCart.services.length > 0) {
                                                        for (const cartProduct of saveCart.services) {
                                                                if (cartProduct.serviceId.type === "offer") {
                                                                        cartProduct.subTotal = parseFloat((cartProduct.price * cartProduct.quantity).toFixed(2));
                                                                        cartProduct.total = parseFloat((cartProduct.price * cartProduct.quantity).toFixed(2));
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
                                                if (isNaN(membershipDiscount)) {
                                                        membershipDiscount = 0;
                                                }
                                                saveCart.memberShipPer = Number(membershipDiscountPercentage);
                                                saveCart.memberShip = parseFloat(membershipDiscount).toFixed(2)
                                                saveCart.offerDiscount = Number(offerDiscount);
                                                saveCart.subTotal = subTotal;
                                                saveCart.total = total;
                                                await saveCart.save();
                                                return res.status(200).json({ msg: `added to cart`, data: saveCart });
                                        } else {
                                                return res.status(400).json({ status: 400, msg: "This Slot already booked or blocked. ", data: {} });
                                        }
                                }
                        }
                }
        } catch (error) {
                next(error);
        }
}
exports.editAddOnservicesInOrders = async (req, res, next) => {
        try {
                const cart = await serviceOrder.findById({ _id: req.params.id })
                if (!cart) {
                        return res.status(200).json({ success: false, msg: "Order not found", cart: {} });
                } else {
                        const itemIndex = cart.AddOnservicesSchema.findIndex((cartItem) => cartItem.addOnservicesId.toString() === req.body.addOnservicesId);
                        if (itemIndex === -1) {
                                return res.status(404).json({ message: "Service Not Found in cart.", status: 404, data: {} });
                        } else {
                                let findService = await addOnservices.findById({ _id: req.body.addOnservicesId });
                                if (!findService) {
                                        return res.status(404).json({ message: "AddOnservices Not Found", status: 404, data: {} });
                                }
                                let discountProvide;
                                if (req.body.discount > 0) {
                                        discountProvide = true
                                } else {
                                        discountProvide = false
                                }
                                if (req.body.price != (null || undefined)) {
                                        cart.AddOnservicesSchema[itemIndex].price = req.body.price;
                                } else {
                                        cart.AddOnservicesSchema[itemIndex].price = cart.AddOnservicesSchema[itemIndex].price;
                                }
                                if (req.body.quantity != (null || undefined)) {
                                        cart.AddOnservicesSchema[itemIndex].quantity = req.body.quantity;
                                } else {
                                        cart.AddOnservicesSchema[itemIndex].quantity = cart.AddOnservicesSchema[itemIndex].quantity;
                                }
                                if (req.body.totalTime != (null || undefined)) {
                                        cart.AddOnservicesSchema[itemIndex].totalTime = req.body.totalTime;
                                        cart.AddOnservicesSchema[itemIndex].totalMin = req.body.totalMin;
                                } else {
                                        cart.AddOnservicesSchema[itemIndex].totalTime = cart.AddOnservicesSchema[itemIndex].totalTime;
                                        cart.AddOnservicesSchema[itemIndex].totalMin = cart.AddOnservicesSchema[itemIndex].totalMin;
                                }
                                cart.AddOnservicesSchema[itemIndex].teamMember = req.body.teamMember;
                                cart.AddOnservicesSchema[itemIndex].addOnservicesId = req.body.newAddOnservicesId;
                                let x = `${req.body.date}T${req.body.time}:00.000Z`;
                                const d = new Date(req.body.date);
                                let text = d.toISOString();
                                cart.date = text;
                                cart.toTime = x;
                                cart.teamMember = req.body.teamMember;
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
                                }
                                const dateObject = new Date(cart.date);
                                const dateString = dateObject.toISOString().split('T')[0];
                                const newTime = "00:00:00.000+00:00";
                                const replacedDateString = `${dateString}T${newTime} `;
                                let findOrderData = await serviceOrder.findOne({ _id: cart._id, to: cart.toTime, date: replacedDateString })
                                if (findOrderData) {
                                        if (totalTime > 0) {
                                                var hours2 = Math.floor(totalTime / 60);
                                                var minutes2 = totalTime % 60;
                                                let timeInMin = hours2 + "hr" + " " + minutes2 + "min"
                                                cart.timeInMin = timeInMin;
                                                await cart.save();
                                        }
                                        let saveCart = await serviceOrder.findOne({ _id: cart._id }).populate([{ path: "AddOnservicesSchema.addOnservicesId", select: { reviews: 0 } }, { path: "services.serviceId", select: { reviews: 0 } }, { path: "coupon", select: "couponCode discount expirationDate used per" },]);
                                        let offerDiscount = 0, membershipDiscount = 0, membershipDiscountPercentage = 0, total = 0, subTotal = 0;
                                        if (saveCart.services.length > 0) {
                                                for (const cartProduct of saveCart.services) {
                                                        if (cartProduct.serviceId.type === "offer") {
                                                                cartProduct.subTotal = parseFloat((cartProduct.price * cartProduct.quantity).toFixed(2));
                                                                cartProduct.total = parseFloat((cartProduct.price * cartProduct.quantity).toFixed(2));
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
                                        if (isNaN(membershipDiscount)) {
                                                membershipDiscount = 0;
                                        }
                                        saveCart.memberShipPer = Number(membershipDiscountPercentage);
                                        saveCart.memberShip = parseFloat(membershipDiscount).toFixed(2)
                                        saveCart.offerDiscount = Number(offerDiscount);
                                        saveCart.subTotal = subTotal;
                                        saveCart.total = total;
                                        await saveCart.save();
                                        return res.status(200).json({ msg: `added to cart`, data: saveCart });
                                } else {
                                        let findSlot1 = await slot.find({ from: { $lte: cart.fromTime }, to: { $gte: cart.toTime }, date: replacedDateString, isBooked: false, slotBlocked: false });
                                        if (findSlot1.length > 0) {
                                                for (let i = 0; i < findSlot1.length; i++) {
                                                        let updateSlot = await slot.findByIdAndUpdate({ _id: findSlot1[i]._id }, { $set: { isBooked: true, } }, { new: true });
                                                        console.log(updateSlot);
                                                }
                                                if (totalTime > 0) {
                                                        var hours2 = Math.floor(totalTime / 60);
                                                        var minutes2 = totalTime % 60;
                                                        let timeInMin = hours2 + "hr" + " " + minutes2 + "min"
                                                        cart.timeInMin = timeInMin;
                                                        await cart.save();
                                                }
                                                let saveCart = await serviceOrder.findOne({ _id: cart._id }).populate([{ path: "AddOnservicesSchema.addOnservicesId", select: { reviews: 0 } }, { path: "services.serviceId", select: { reviews: 0 } }, { path: "coupon", select: "couponCode discount expirationDate used per" },]);
                                                let offerDiscount = 0, membershipDiscount = 0, membershipDiscountPercentage = 0, total = 0, subTotal = 0;
                                                if (saveCart.services.length > 0) {
                                                        for (const cartProduct of saveCart.services) {
                                                                if (cartProduct.serviceId.type === "offer") {
                                                                        cartProduct.subTotal = parseFloat((cartProduct.price * cartProduct.quantity).toFixed(2));
                                                                        cartProduct.total = parseFloat((cartProduct.price * cartProduct.quantity).toFixed(2));
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
                                                if (isNaN(membershipDiscount)) {
                                                        membershipDiscount = 0;
                                                }
                                                saveCart.memberShipPer = Number(membershipDiscountPercentage);
                                                saveCart.memberShip = parseFloat(membershipDiscount).toFixed(2)
                                                saveCart.offerDiscount = Number(offerDiscount);
                                                saveCart.subTotal = subTotal;
                                                saveCart.total = total;
                                                await saveCart.save();
                                                return res.status(200).json({ msg: `added to cart`, data: saveCart });
                                        } else {
                                                return res.status(400).json({ status: 400, msg: "This Slot already booked or blocked. ", data: {} });
                                        }
                                }
                        }
                }
        } catch (error) {
                next(error);
        }
}
exports.addServiceInOrders = async (req, res, next) => {
        try {
                const cart = await serviceOrder.findById({ _id: req.params.id })
                if (!cart) {
                        return res.status(200).json({ success: false, msg: "Cart is empty", cart: {} });
                } else {
                        const itemIndex = cart.services.findIndex((cartItem) => cartItem.serviceId.toString() === req.body.serviceId);
                        if (itemIndex === -1) {
                                let findService = await services.findById({ _id: req.body.serviceId });
                                if (!findService) {
                                        return res.status(404).json({ message: "Service Not Found", status: 404, data: {} });
                                }
                                let obj = {
                                        serviceId: req.body.serviceId,
                                        quantity: req.body.quantity,
                                        price: findService.price,
                                        totalTime: findService.totalTime,
                                        totalMin: findService.totalMin,
                                        teamMember: req.body.teamMember
                                };
                                cart.services.push(obj);
                                const totalPromises = cart.services.map(async (service) => {
                                        return service.totalMin * service.quantity;
                                });
                                const totalPromises1 = cart.AddOnservicesSchema.map(async (service) => {
                                        return service.totalMin * service.quantity;
                                });
                                const [totalArray, totalArray1] = await Promise.all([Promise.all(totalPromises), Promise.all(totalPromises1)]);
                                const totalTime = totalArray.concat(totalArray1).reduce((total, value) => {
                                        return total + value;
                                }, 0);
                                const timeArray = req.body.time.split(':');
                                const hours = parseInt(timeArray[0]);
                                const minutes = parseInt(timeArray[1]);
                                const providedTimeInMinutes = hours * 60 + minutes;
                                let fromTimeInMinutes = providedTimeInMinutes + totalTime + 90;
                                const d = new Date(req.body.date);
                                let text = d.toISOString();
                                const fromTime = new Date(d);
                                fromTime.setMinutes(fromTimeInMinutes);
                                let x = `${req.body.date}T${req.body.time}:00.000Z`;
                                cart.toTime = x;
                                cart.fromTime = fromTime;
                                cart.date = text;
                                const dateObject = new Date(cart.date);
                                const dateString = dateObject.toISOString().split('T')[0];
                                const newTime = "00:00:00.000+00:00";
                                const replacedDateString = `${dateString}T${newTime} `;
                                let findOrderData = await serviceOrder.findOne({ _id: cart._id, to: cart.toTime, date: replacedDateString })
                                if (findOrderData) {
                                        await cart.save();
                                        let saveCart = await serviceOrder.findOne({ _id: cart._id }).populate([{ path: "AddOnservicesSchema.addOnservicesId", select: { reviews: 0 } }, { path: "services.serviceId", select: { reviews: 0 } }, { path: "coupon", select: "couponCode discount expirationDate used per" },]);
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
                                        return res.status(200).json({ msg: `added to cart`, data: saveCart });
                                } else {
                                        let findSlot1 = await slot.find({ from: { $lte: cart.fromTime }, to: { $gte: cart.toTime }, date: replacedDateString, isBooked: false, slotBlocked: false });
                                        if (findSlot1.length > 0) {
                                                for (let i = 0; i < findSlot1.length; i++) {
                                                        let updateSlot = await slot.findByIdAndUpdate({ _id: findSlot1[i]._id }, { $set: { isBooked: true, } }, { new: true });
                                                        console.log(updateSlot);
                                                }
                                                await cart.save();
                                                let saveCart = await serviceOrder.findOne({ _id: cart._id }).populate([{ path: "AddOnservicesSchema.addOnservicesId", select: { reviews: 0 } }, { path: "services.serviceId", select: { reviews: 0 } }, { path: "coupon", select: "couponCode discount expirationDate used per" },]);
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
                                                return res.status(200).json({ msg: `added to cart`, data: saveCart });
                                        } else {
                                                return res.status(400).json({ status: 400, msg: "This Slot already booked or blocked. ", data: {} });
                                        }
                                }
                        } else {
                                return res.status(404).json({ message: "Service already in order.", status: 404, data: {} });
                        }
                }
        } catch (error) {
                next(error);
        }
}
exports.addOnservicesInOrders = async (req, res, next) => {
        try {
                const cart = await serviceOrder.findById({ _id: req.params.id })
                if (!cart) {
                        return res.status(200).json({ success: false, msg: "Cart is empty", cart: {} });
                } else {
                        const itemIndex = cart.AddOnservicesSchema.findIndex((cartItem) => cartItem.addOnservicesId.toString() === req.body.addOnservicesId);
                        if (itemIndex === -1) {
                                let findService = await addOnservices.findById({ _id: req.body.addOnservicesId });
                                if (!findService) {
                                        return res.status(404).json({ message: "AddOnservices Not Found", status: 404, data: {} });
                                }
                                let obj = {
                                        addOnservicesId: req.body.addOnservicesId,
                                        quantity: req.body.quantity,
                                        price: findService.price,
                                        totalTime: findService.totalTime,
                                        totalMin: findService.totalMin,
                                        teamMember: req.body.teamMember
                                };
                                cart.AddOnservicesSchema.push(obj);
                                const totalPromises = cart.services.map(async (service) => {
                                        return service.totalMin * service.quantity;
                                });
                                const totalPromises1 = cart.AddOnservicesSchema.map(async (service) => {
                                        return service.totalMin * service.quantity;
                                });
                                const [totalArray, totalArray1] = await Promise.all([Promise.all(totalPromises), Promise.all(totalPromises1)]);
                                const totalTime = totalArray.concat(totalArray1).reduce((total, value) => {
                                        return total + value;
                                }, 0);
                                const timeArray = req.body.time.split(':');
                                const hours = parseInt(timeArray[0]);
                                const minutes = parseInt(timeArray[1]);
                                const providedTimeInMinutes = hours * 60 + minutes;
                                let fromTimeInMinutes = providedTimeInMinutes + totalTime + 90;
                                const d = new Date(req.body.date);
                                let text = d.toISOString();
                                const fromTime = new Date(d);
                                fromTime.setMinutes(fromTimeInMinutes);
                                let x = `${req.body.date}T${req.body.time}:00.000Z`;
                                cart.toTime = x;
                                cart.fromTime = fromTime;
                                cart.date = text;
                                const dateObject = new Date(cart.date);
                                const dateString = dateObject.toISOString().split('T')[0];
                                const newTime = "00:00:00.000+00:00";
                                const replacedDateString = `${dateString}T${newTime} `;
                                let findOrderData = await serviceOrder.findOne({ _id: cart._id, to: cart.toTime, date: replacedDateString })
                                if (findOrderData) {
                                        await cart.save();
                                        let saveCart = await serviceOrder.findOne({ _id: cart._id }).populate([{ path: "AddOnservicesSchema.addOnservicesId", select: { reviews: 0 } }, { path: "services.serviceId", select: { reviews: 0 } }, { path: "coupon", select: "couponCode discount expirationDate used per" },]);
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
                                        return res.status(200).json({ msg: `added to cart`, data: saveCart });
                                } else {
                                        let findSlot1 = await slot.find({ from: { $lte: cart.fromTime }, to: { $gte: cart.toTime }, date: replacedDateString, isBooked: false, slotBlocked: false });
                                        if (findSlot1.length > 0) {
                                                await cart.save();
                                                for (let i = 0; i < findSlot1.length; i++) {
                                                        let updateSlot = await slot.findByIdAndUpdate({ _id: findSlot1[i]._id }, { $set: { isBooked: true, } }, { new: true });
                                                        console.log(updateSlot);
                                                }
                                                let saveCart = await serviceOrder.findOne({ _id: cart._id }).populate([{ path: "AddOnservicesSchema.addOnservicesId", select: { reviews: 0 } }, { path: "services.serviceId", select: { reviews: 0 } }, { path: "coupon", select: "couponCode discount expirationDate used per" },]);
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
                                                return res.status(200).json({ msg: `added to cart`, data: saveCart });
                                        } else {
                                                return res.status(400).json({ status: 400, msg: "This Slot already booked or blocked. ", data: {} });
                                        }
                                }
                        } else {
                                return res.status(404).json({ message: "Service already in order.", status: 404, data: {} });
                        }
                }
        } catch (error) {
                next(error);
        }
}
exports.deleteServicefromOrders = async (req, res, next) => {
        try {
                const cart = await serviceOrder.findById({ _id: req.params.id })
                if (!cart) {
                        return res.status(404).json({ status: 404, msg: `ServiceOrder is empty`, cart: {} });
                }
                const itemIndex = cart.services.findIndex((cartItem) => cartItem.serviceId.toString() === req.body.serviceId);
                if (itemIndex === -1) {
                        return res.status(404).json({ status: 404, msg: `service not found in cart`, cart: {} });
                }
                cart.services.splice(itemIndex, 1);
                await cart.save();
                if (cart.services.length > 0 || cart.AddOnservicesSchema.length > 0) {
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
                                await cart.save();
                        }
                        let offerDiscount = 0, membershipDiscount = 0, membershipDiscountPercentage = 0, total = 0, subTotal = 0;
                        if (cart.services.length > 0) {
                                for (const cartProduct of cart.services) {
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
                        if (cart.AddOnservicesSchema.length > 0) {
                                cart.AddOnservicesSchema.forEach((cartGift) => {
                                        cartGift.total = parseFloat((cartGift.price * cartGift.quantity).toFixed(2));
                                        cartGift.subTotal = parseFloat((cartGift.price * cartGift.quantity).toFixed(2));
                                        subTotal += cartGift.subTotal;
                                        total += cartGift.total;
                                });
                        }
                        cart.memberShipPer = Number(membershipDiscountPercentage);
                        cart.memberShip = parseFloat(membershipDiscount).toFixed(2)
                        cart.offerDiscount = Number(offerDiscount);
                        cart.subTotal = subTotal;
                        cart.total = total;
                        if (totalTime > 0) {
                                var hours2 = Math.floor(totalTime / 60);
                                var minutes2 = totalTime % 60;
                                let timeInMin = hours2 + "hr" + " " + minutes2 + "min"
                                cart.timeInMin = timeInMin;
                        }
                        await cart.save();
                        return res.status(200).json({ status: 200, msg: `service delete from order`, cart: cart });
                } else {
                        return res.status(200).json({ status: 200, msg: "Cart is empty", cart: {} });
                }
        } catch (error) {
                console.log(error);
                return res.status(500).json({ status: 500, msg: "internal server error", error: error });
        }
};
exports.deleteAddOnServicefromOrders = async (req, res, next) => {
        try {
                const cart = await serviceOrder.findById({ _id: req.params.id })
                if (!cart) {
                        return res.status(404).json({ status: 404, msg: `ServiceOrder is empty`, cart: {} });
                }
                const itemIndex = cart.AddOnservicesSchema.findIndex((cartItem) => cartItem.addOnservicesId.toString() === req.body.addOnservicesId);
                if (itemIndex === -1) {
                        return res.status(404).json({ status: 404, msg: `Add On services not found in cart`, cart: {} });
                }
                cart.AddOnservicesSchema.splice(itemIndex, 1);
                await cart.save();
                if (cart.services.length > 0 || cart.AddOnservicesSchema.length > 0) {
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
                                await cart.save();
                        }
                        let offerDiscount = 0, membershipDiscount = 0, membershipDiscountPercentage = 0, total = 0, subTotal = 0;
                        if (cart.services.length > 0) {
                                for (const cartProduct of cart.services) {
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
                        if (cart.AddOnservicesSchema.length > 0) {
                                cart.AddOnservicesSchema.forEach((cartGift) => {
                                        cartGift.total = parseFloat((cartGift.price * cartGift.quantity).toFixed(2));
                                        cartGift.subTotal = parseFloat((cartGift.price * cartGift.quantity).toFixed(2));
                                        subTotal += cartGift.subTotal;
                                        total += cartGift.total;
                                });
                        }
                        cart.memberShipPer = Number(membershipDiscountPercentage);
                        cart.memberShip = parseFloat(membershipDiscount).toFixed(2)
                        cart.offerDiscount = Number(offerDiscount);
                        cart.subTotal = subTotal;
                        cart.total = total;
                        if (totalTime > 0) {
                                var hours2 = Math.floor(totalTime / 60);
                                var minutes2 = totalTime % 60;
                                let timeInMin = hours2 + "hr" + " " + minutes2 + "min"
                                cart.timeInMin = timeInMin;
                        }
                        await cart.save();
                        return res.status(200).json({ status: 200, msg: `AddOnservice delete from order`, cart: cart });
                } else {
                        return res.status(200).json({ status: 200, msg: "Cart is empty", cart: {} });
                }
        } catch (error) {
                console.log(error);
                return res.status(500).json({ status: 500, msg: "internal server error", error: error });
        }
};
async function getItemData(itemType, itemId) {
        switch (itemType) {
                case 'product':
                        return await product.findById(itemId);
                case 'service':
                        return await services.findById(itemId);
                case 'gift':
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
                case 'gift':
                        return 'gifts';
                case 'frequentlyBuyProduct':
                        return 'frequentlyBuyProductSchema';
                case 'addOnservices':
                        return 'AddOnservicesSchema';
                default:
                        return null;
        }
}
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
                                        let mailOptions = { from: 'info@shahinahoja.com', to: findOrder3.email, subject: 'Gift Card Provide by Your friend', text: `Gift Card Provide by Your friend Coupan Code is ${findOrder3.code} `, };
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
exports.addSubAdmin = async (req, res) => {
        try {
                let findUser = await User.findOne({ $and: [{ $or: [{ email: req.body.email }, { phone: req.body.phone }] }, { userType: "SUBADMIN" }] });
                if (findUser) {
                        return res.status(409).send({ status: 409, message: "Subadmin already with these details. ", data: {}, });
                } else {
                        req.body.otp = newOTP.generate(4, { alphabets: false, upperCase: false, specialChar: false, });
                        req.body.otpExpiration = new Date(Date.now() + 5 * 60 * 1000);
                        req.body.accountVerification = false;
                        req.body.refferalCode = await reffralCode();
                        req.body.password = bcrypt.hashSync(req.body.password, 8);
                        req.body.userType = "SUBADMIN";
                        const userCreate = await User.create(req.body);
                        return res.status(200).send({ status: 200, message: "Subadmin create successfully ", data: userCreate, });
                }
        } catch (error) {
                console.error(error);
                return res.status(500).json({ message: "Server error" });
        }
};
exports.updateSubAdminProfile = async (req, res) => {
        try {
                const data = await User.findOne({ _id: req.params.id });
                if (data) {
                        let obj = {
                                firstName: req.body.firstName || data.firstName,
                                lastName: req.body.lastName || data.lastName,
                                fullName: req.body.fullName || data.fullName,
                                email: req.body.email || data.email,
                                countryCode: req.body.countryCode || data.countryCode,
                                phone: req.body.phone || data.phone,
                                gender: req.body.gender || data.gender,
                                dob: req.body.dob || data.dob,
                                bio: req.body.bio || data.bio,
                                permissions: req.body.permissions || data.permissions,
                        }
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
exports.getAllSubAdmin = async (req, res) => {
        try {
                const user = await User.find({ userType: "SUBADMIN" });
                if (user.length == 0) {
                        return res.status(404).send({ message: "not found" });
                }
                return res.status(200).send({ message: "Get SubAdmin details.", data: user });
        } catch (err) {
                console.log(err);
                return res.status(500).send({
                        message: "internal server error " + err.message,
                });
        }
};
async function generateSlots() {
        try {
                function getAmPm(date) {
                        const hours = date.getUTCHours();
                        if (hours >= 12 && hours < 24) {
                                return 'PM';
                        } else {
                                return 'AM';
                        }
                }
                async function generateSlots(startDate, numberOfDays = 365) {
                        const intervalMilliseconds = 24 * 60 * 60 * 1000;
                        let currentDate = new Date(startDate);
                        currentDate.setUTCHours(9, 0, 0, 0);
                        const endDate = new Date(currentDate.getTime() + numberOfDays * intervalMilliseconds);
                        const slots = [];
                        for (; currentDate.getTime() < endDate.getTime(); currentDate.setDate(currentDate.getDate() + 1)) {
                                const startTime = new Date(currentDate.getTime());
                                const endTime = new Date(currentDate.getTime() + 8 * 60 * 60 * 1000);
                                const halfHour = 15 * 60 * 1000;
                                while (startTime.getTime() < endTime.getTime()) {
                                        const slotEndTime = new Date(startTime.getTime() + halfHour);
                                        let obj = {
                                                date: currentDate.toISOString().split('T')[0],
                                                from: startTime.toISOString(),
                                                to: slotEndTime.toISOString(),
                                                fromAmPm: getAmPm(startTime),
                                                toAmPm: getAmPm(slotEndTime),
                                        }
                                        let findSlot = await slot.findOne(obj);
                                        if (!findSlot) {
                                                const slot1 = new slot(obj);
                                                await slot1.save();
                                                slots.push(obj);
                                        }
                                        startTime.setTime(slotEndTime.getTime());
                                }
                        }
                        return slots;
                }
                const generatedSlots = generateSlots(new Date());
                console.log(generatedSlots);
        } catch (error) {
                console.log("Slots error.", error);
        }
}
// generateSlots()
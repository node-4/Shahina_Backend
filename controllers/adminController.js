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
const serviceOrder = require("../models/Auth/serviceOrder");
const productOrder = require("../models/Auth/productOrder");
const ingredients = require("../models/ingredients");
const giftCard = require("../models/giftCard");
const giftPrice = require("../models/giftPrice");
const Cart = require("../models/Auth/cartModel");
const slot = require("../models/slot");
const shippingCharges = require("../models/shippingCharges");
const acneQuiz = require("../models/acneQuiz");
const acneQuizSuggession = require("../models/acneQuizSuggession");
const frequentlyBuyProduct = require("../models/frequentlyBuyProduct");
const addOnservices = require("../models/Service/addOnservices");
const deliverOrde = require("../models/deliverOrde");
// const axios = require('axios');
// const sendleApiKey = 'KkZkQ3MdyRtwsT3s9rMww5w5';
// const sendleApiBaseUrl = 'https://api.sendle.com';
// const sdk = require('api')('@sendle/v1.0#25eje35llbmpa1g');
const { SendleClient } = require('sendle-node');
exports.registration = async (req, res) => {
        const { phone, email } = req.body;
        try {
                req.body.email = email.split(" ").join("").toLowerCase();
                let user = await User.findOne({ $and: [{ $or: [{ email: req.body.email }, { phone: phone }] }], userType: "ADMIN" });
                if (!user) {
                        req.body.password = bcrypt.hashSync(req.body.password, 8);
                        req.body.userType = "ADMIN";
                        req.body.accountVerification = true;
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
                const user = await User.findOne({ email: email, userType: "ADMIN" });
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
                        fullName: user.fullName,
                        firstName: user.fullName,
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
        } catch (error) {
                console.error(error);
                return res.status(500).json({ message: "Server error" });
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
                let productImages = [], howTouse = [], additionalInfo = [], sizePrice = [];
                if (req.files) {
                        for (let i = 0; i < req.files.length; i++) {
                                let obj = {
                                        image: req.files[i].path
                                }
                                productImages.push(obj)
                        }
                }
                if (req.body.step != undefined) {
                        for (let i = 0; i < req.body.step.length; i++) {
                                let obj = {
                                        step: req.body.step[i],
                                        description: req.body.stepDescription[i]
                                }
                                howTouse.push(obj)
                        }
                }
                if (req.body.title != undefined) {
                        for (let i = 0; i < req.body.title.length; i++) {
                                let obj = {
                                        title: req.body.title[i],
                                        addDescription: req.body.addDescription[i]
                                }
                                howTouse.push(obj)
                        }
                }
                if (req.body.stock > 0) { req.body.status = "STOCK" }
                if (req.body.stock <= 0) { req.body.status = "OUTOFSTOCK" }
                if (req.body.discountAllow == 'true') {
                        req.body.discountPrice = (Number(req.body.price) - (Number(req.body.price) * req.body.discount) / 100)
                } else {
                        req.body.discountPrice = 0;
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
                        req.body.size = req.body.size;
                }
                req.body.howTouse = howTouse;
                req.body.additionalInfo = additionalInfo;
                req.body.productImages = productImages;
                const ProductCreated = await product.create(req.body);
                if (ProductCreated) {
                        return res.status(201).send({ status: 200, message: "Product add successfully", data: ProductCreated, });
                }
        } catch (err) {
                console.log(err);
                return res.status(500).send({ message: "Internal server error while creating Product", });
        }
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
                        populate: ('brandId')
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
exports.editProduct = async (req, res) => {
        try {
                const data = await product.findById(req.params.id);
                if (!data) {
                        return res.status(400).send({ msg: "not found" });
                } else {
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
                        let productImages = [], howTouse = [];
                        if (req.files) {
                                for (let i = 0; i < req.files.length; i++) {
                                        let obj = {
                                                image: req.files[i].path
                                        }
                                        productImages.push(obj)
                                }
                        }
                        for (let i = 0; i < req.body.step.length; i++) {
                                let obj = {
                                        step: req.body.step[i],
                                        description: req.body.stepDescription[i]
                                }
                                howTouse.push(obj)
                        }
                        if (req.body.quantity > 0) { req.body.status = "STOCK" }
                        if (req.body.quantity <= 0) { req.body.status = "OUTOFSTOCK" }
                        if (req.body.discountAllow == 'true') {
                                req.body.discountPrice = (Number(req.body.price) - (Number(req.body.price) * req.body.discount) / 100)
                        } else {
                                req.body.discountPrice = 0;
                        }
                        let productObj = {
                                brandId: req.body.brandId || data.brandId,
                                nutritionId: req.body.nutritionId || data.nutritionId,
                                productTypeId: req.body.productTypeId || data.productTypeId,
                                skinConditionId: req.body.skinConditionId || data.skinConditionId,
                                skinTypeId: req.body.skinTypeId || data.skinTypeId,
                                name: req.body.name || data.name,
                                description: req.body.description || data.description,
                                contents: req.body.contents || data.contents,
                                howTouse: howTouse || data.howTouse,
                                ingredients: req.body.ingredients || data.ingredients,
                                price: req.body.price || data.price,
                                costPrice: req.body.costPrice || data.costPrice,
                                quantity: req.body.quantity || data.quantity,
                                discount: req.body.discount || data.discount,
                                discountPrice: req.body.discountPrice || data.discountPrice,
                                ratings: data.ratings,
                                productImages: productImages || data.productImages,
                                numOfReviews: data.numOfReviews,
                                reviews: data.reviews,
                                status: data.status,
                        }
                        const data5 = await product.findByIdAndUpdate({ _id: data._id }, { $set: productObj }, { new: true });
                        return res.status(200).json({ status: 200, message: "Product update successfully.", data: data5 });
                }
        } catch (err) {
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
        const findProduct = await product.findById(req.params.id).populate({ path: 'reviews.user', select: 'fullName' });
        if (!findProduct) {
                return res.status(404).json({ message: "Product not found.", status: 404, data: {} });
        }
        return res.status(200).json({ status: 200, reviews: findProduct.reviews, });
};
exports.createService = async (req, res) => {
        try {
                const data = await Category.findById(req.body.categoryId);
                if (!data || data.length === 0) {
                        return res.status(400).send({ status: 404, msg: "not found" });
                }
                let images = [];
                if (req.files) {
                        for (let i = 0; i < req.files.length; i++) {
                                let obj = {
                                        img: req.files[i].path
                                }
                                images.push(obj)
                        }
                }
                if (req.body.discountActive == 'true') {
                        req.body.discountPrice = (req.body.price - ((req.body.price * req.body.discount) / 100)).toFixed(2)
                } else {
                        req.body.discountPrice = 0
                }
                req.body.images = images;
                const ProductCreated = await services.create(req.body);
                if (ProductCreated) {
                        return res.status(201).send({ status: 200, message: "Product add successfully", data: ProductCreated, });
                }
        } catch (err) {
                console.log(err);
                return res.status(500).send({ message: "Internal server error while creating Product", });
        }
};
exports.paginateServiceSearch = async (req, res) => {
        try {
                const { search, fromDate, toDate, categoryId, status, page, limit } = req.query;
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
                        limit: Number(limit) || 15,
                        sort: { createdAt: -1 },
                        populate: ('categoryId')
                };
                let data = await services.paginate(query, options);
                return res.status(200).json({ status: 200, message: "service data found.", data: data });

        } catch (err) {
                return res.status(500).send({ msg: "internal server error ", error: err.message, });
        }
};
exports.getServiceByToken = async (req, res, next) => {
        try {
                const servicesList = await services.find({ categoryId: req.query.categoryId });
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
                return res.status(200).json({ status: 200, message: "Product data found.", data: data });
        } catch (err) {
                return res.status(500).send({ msg: "internal server error ", error: err.message, });
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
                        let images = [];
                        if (req.files) {
                                for (let i = 0; i < req.files.length; i++) {
                                        let obj = {
                                                img: req.files[i].path
                                        }
                                        images.push(obj)
                                }
                        }
                        if (req.body.discountActive == 'true') {
                                req.body.discountPrice = req.body.price - ((req.body.price * req.body.discount) / 100)
                        } else {
                                req.body.discountPrice = 0
                        }
                        req.body.images = images;
                        let productObj = {
                                categoryId: req.body.categoryId || data.categoryId,
                                name: req.body.name || data.name,
                                images: images || data.images,
                                price: req.body.price || data.price,
                                description: req.body.description || data.description,
                                discountPrice: req.body.discountPrice || data.discountPrice,
                                discount: req.body.discount || data.discount,
                                discountActive: req.body.discountActive || data.discountActive,
                        }
                        const data1 = await services.findByIdAndUpdate({ _id: data._id }, { $set: productObj }, { new: true });
                        return res.status(200).json({ status: 200, message: "Service update successfully.", data: data1 });
                }
        } catch (err) {
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
                        let partnerImage, data;
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
                        let partnerImage, data;
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
                                shopDetails: req.body.shopDetails || findData.shopDetails,
                                shopImage: req.body.shopImage || findData.shopImage,
                                type: "shopPage"
                        };
                        const Banner = await banner.findByIdAndUpdate({ _id: findData._id }, { $set: data }, { new: true })
                        return res.status(200).json({ message: "Partner update successfully.", status: 200, data: Banner });

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
                                        twitter: req.body.twitter || findContact.twitter,
                                        google: req.body.google || findContact.google,
                                        instagram: req.body.instagram || findContact.instagram,
                                        map: req.body.map || findContact.map,
                                        mapLink: req.body.mapLink || findContact.mapLink,
                                        address: req.body.address || findContact.address,
                                        phone: req.body.phone || findContact.phone,
                                        email: req.body.email || findContact.email,
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
exports.getProductOrder = async (req, res, next) => {
        try {
                const orders = await productOrder.find({ orderStatus: "confirmed" }).populate([{ path: "products.productId", select: { reviews: 0 } }, { path: "gifts.giftId", select: { reviews: 0 } },
                { path: "frequentlyBuyProductSchema.frequentlyBuyProductId", select: { reviews: 0 } },
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
exports.getServiceOrders = async (req, res, next) => {
        try {
                const orders = await serviceOrder.find({ orderStatus: "confirmed" }).populate([{ path: "AddOnservicesSchema.addOnservicesId", select: { reviews: 0 } }, { path: "services.serviceId", select: { reviews: 0 } }, { path: "coupon", select: "couponCode discount expirationDate" },]);
                if (orders.length == 0) {
                        return res.status(404).json({ status: 404, message: "Orders not found", data: {} });
                }
                return res.status(200).json({ status: 200, msg: "orders of user", data: orders })
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
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
                return res.status(200).json({ message: "A Unfortunately, there is a comedogenic ingredient.", status: 200, data: categories, });
        } else {
                return res.status(200).json({ message: "Congratuations! This product does not have any comedogenic ingredient.", status: 200, data: {}, });
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
exports.createSlot = async (req, res) => {
        try {
                let findSlot = await slot.findOne({ date: req.body.date, from: req.body.from, to: req.body.to, });
                if (findSlot) {
                        return res.status(409).json({ message: "Slot already exit.", status: 404, data: {} });
                } else {
                        const data = { date: req.body.date, from: req.body.from, to: req.body.to, };
                        const category = await slot.create(data);
                        return res.status(200).json({ message: "Slot add successfully.", status: 200, data: category });
                }
        } catch (error) {
                return res.status(500).json({ status: 500, message: "internal server error ", data: error.message, });
        }
};
exports.getSlot = async (req, res) => {
        const categories = await slot.find({});
        if (categories.length > 0) {
                return res.status(201).json({ message: "Slot Found", status: 200, data: categories, });
        }
        return res.status(201).json({ message: "Slot not Found", status: 404, data: {}, });

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
                        const findProduct = await product.findById({ _id: req.body.productId })
                        if (!findProduct || findProduct.length === 0) {
                                return res.status(400).send({ msg: "not found" });
                        }
                        const data = { answer1: req.body.answer1, answer2: req.body.answer2, answer3: req.body.answer3, answer4: req.body.answer4, productId: findProduct._id };
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
        let productId;
        if (req.body.productId != (null || undefined)) {
                const findProduct = await product.findById({ _id: req.body.productId })
                if (!findProduct || findProduct.length === 0) {
                        return res.status(400).send({ msg: "not found" });
                } else {
                        productId = findProduct._id;
                }
        } else {
                productId = category.productId;
        }
        category.productId = productId;
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
        const categories = await acneQuizSuggession.findOne({ answer1: req.query.answer1, answer2: req.query.answer2, answer3: req.query.answer3, answer4: req.query.answer4, }).select('productId').populate({ path: 'productId' })
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
        const categories = await frequentlyBuyProduct.findOne({ products: { $in: req.params.productId } });
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
                        const data = { name: req.body.name, price: req.body.price, time: req.body.time, description: req.body.description, };
                        const category = await addOnservices.create(data);
                        return res.status(200).json({ message: "AddOnServices add successfully.", status: 200, data: category });
                }
        } catch (error) {
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
        if (!category1) {
                return res.status(404).json({ message: "AddOnServices already exit", status: 404, data: {} });
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
const client = new SendleClient({
        sendleId: 'shahina_hoja_gmail_c',
        apiKey: 'KkZkQ3MdyRtwsT3s9rMww5w5',
        sandbox: false,
});
exports.createShipment = async (req, res) => {
        try {
                // let shipmentData = {
                //         first_mile_option: 'pickup',
                //         description: 'Test',
                //         weight: {
                //                 value: '1',
                //                 units: 'kg',
                //         },
                //         customer_reference: '1337',
                //         metadata: {
                //                 userId: 100,
                //         },
                //         sender: {
                //                 contact: {
                //                         name: 'Lex Luthor',
                //                 },
                //                 address: {
                //                         address_line1: '123 Main Street', // U.S. address
                //                         suburb: 'Los Angeles', // U.S. suburb
                //                         state_name: 'CA', // U.S. state
                //                         postcode: '90001', // U.S. postal code
                //                         country: 'US', // Country set to the United States
                //                 },
                //         },
                //         receiver: {
                //                 instructions: 'Signature on Delivery',
                //                 contact: {
                //                         name: 'Clark Kent',
                //                         email: 'clarkissuper@dailyplanet.xyz',
                //                         company: 'Daily Planet',
                //                 },
                //                 address: {
                //                         address_line1: '456 Elm Street', // U.S. address
                //                         suburb: 'New York', // U.S. suburb
                //                         state_name: 'NY', // U.S. state
                //                         postcode: '10001', // U.S. postal code
                //                         country: 'US', // Country set to the United States
                //                 },
                //         },
                // }
                const order = await client.orders.create(req.body);
                if (order) {
                        req.body = order
                        const category = await deliverOrde.create(req.body);
                        return res.json(category);
                }
        } catch (error) {
                console.error('Internal Server Error:', error);
                return res.status(500).json({ error: 'Internal Server Error' });
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


// const sendleApi = axios.create({
//         baseURL: sendleApiBaseUrl,
//         headers: {
//                 Authorization: `Bearer ${sendleApiKey}`,
//                 'Content-Type': 'application/json',
//         },
// });
// async function createSendleOrder(orderData) {
//         try {
//                 const response = await sendleApi.post('/api/orders', orderData);
//                 return response.data;
//         } catch (error) {
//                 throw error;
//         }
// };

// exports.createShipment = async (req, res) => {
//         try {
//                 sdk.auth('shahina_hoja_gmail_c', 'KkZkQ3MdyRtwsT3s9rMww5w5');
//                 sdk.server('https://api.sendle.com');
//                 const response = await sdk.createOrder({
//                         sender: {
//                                 contact: { name: 'Your Name' },
//                                 address: {
//                                         country: 'US',
//                                         address_line1: '123 Main Street',
//                                         suburb: 'Los Angeles',
//                                         postcode: '90001',
//                                         state_name: 'CA'
//                                 }
//                         },
//                         receiver: {
//                                 contact: { name: 'Receiver Name' },
//                                 address: {
//                                         country: 'US',
//                                         address_line1: '456 Elm Street', // Replace with receiver's address
//                                         suburb: 'New York', // Replace with receiver's suburb
//                                         postcode: '10001', // Replace with receiver's postcode
//                                         state_code: 'NY' // Replace with receiver's state code
//                                 }

//                                 // address: {
//                                 //         country: 'AU',
//                                 //         address_line1: '456 Elm Street',
//                                 //         suburb: 'Sydney',
//                                 //         postcode: '2000',
//                                 //         state_code: 'NSW'
//                                 //         // country: 'AU',
//                                 //         // address_line1: 'Receiver Address Line 1',
//                                 //         // suburb: 'Receiver Suburb',
//                                 //         // postcode: '10001',
//                                 //         // state_code: 'NY'
//                                 // }
//                         },
//                         weight: { units: 'kg', value: '2' },
//                         volume: { value: '84.95073', units: 'l' },
//                         dimensions: { units: 'cm', length: '30', width: '30', height: '10' },
//                         description: 'Shipment Description',
//                         hide_pickup_address: true,
//                         contents: [
//                                 {
//                                         description: 'Item 1 Description',
//                                         value: 'Item 1 Value',
//                                         country_of_origin: 'US',
//                                         hs_code: 'Item 1 HS Code'
//                                 }
//                         ],
//                         contents_type: 'Merchandise'
//                 });
//                 if (response.status === 200) {
//                         return res.status(200).json(response.data);
//                 } else {
//                         console.error('Sendle API Error:', response.statusText);
//                         return res.status(response.status).json(response.data);
//                 }
//         } catch (error) {
//                 console.error('Internal Server Error:', error);
//                 return res.status(500).json({ error: 'Internal Server Error' });
//         }
// };

// exports.createShipment = async (req, res) => {
//         try {
//                 createSendleOrder(orderData)
//                         .then((orderResponse) => {
//                                 console.log('Order created successfully:', orderResponse);
//                         })
//                         .catch((error) => {
//                                 console.error('Error creating order:', error);
//                         });

//         } catch (error) {
//                 console.error('Error creating shipment:', error.response ? error.response.data : error.message);
//                 throw error;
//         }
// }

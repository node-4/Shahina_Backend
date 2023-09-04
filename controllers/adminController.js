const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authConfig = require("../configs/auth.config");
var newOTP = require("otp-generators");
const User = require("../models/userModel");
const Category = require("../models/Category")
const Brand = require('../models/brand');
const product = require('../models/product');
const services = require('../models/services');
const Subscription = require("../models/subscription");
const banner = require("../models/bannerModel");
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
                        return res.status(409).json({ message: "Brand already exit.", status: 404, data: {} });
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
exports.createProduct = async (req, res) => {
        try {
                const data = await Brand.findById(req.body.brandId);
                if (!data || data.length === 0) {
                        return res.status(400).send({ status: 404, msg: "not found" });
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
                if (req.body.discount == 'true') {

                } else {

                }
                req.body.howTouse = howTouse;
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
                const { search, fromDate, toDate, brandId, quantity, status, page, limit } = req.query;
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
                                const data1 = await Brand.findById(req.body.brandId);
                                if (!data1 || data1.length === 0) {
                                        return res.status(400).send({ status: 404, msg: "not found" });
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
                        if (req.body.discount == 'true') {

                        } else {

                        }
                        let productObj = {
                                brandId: data.brandId,
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
                        const data1 = await product.findByIdAndUpdate({ _id: data._id }, { $set: productObj }, { new: true });
                        return res.status(200).json({ status: 200, message: "Product update successfully.", data: data1 });
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
                        req.body.discountPrice = req.body.price - ((req.body.price * req.body.discount) / 100)
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
exports.createBanner = async (req, res) => {
        try {
                let bannerImage, data;
                if (req.file.path) {
                        bannerImage = req.file.path
                }
                data = {
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
const reffralCode = async () => {
        var digits = "ABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZ";
        let OTP = '';
        for (let i = 0; i < 6; i++) {
                OTP += digits[Math.floor(Math.random() * 36)];
        }
        return OTP;
}
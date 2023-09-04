const auth = require("../controllers/adminController");
const authJwt = require("../middlewares/authJwt");
var multer = require("multer");
const path = require("path");
const express = require("express");
const router = express()
const { productUpload, upload, bannerUpload, blogUpload, aboutusUpload, subCategoryUpload, categoryUpload, serviceUpload, BrandUpload, E4UUpload, offerUpload } = require('../middlewares/imageUpload')
module.exports = (app) => {
        app.post("/api/v1/admin/registration", auth.registration);
        app.post("/api/v1/admin/login", auth.signin);
        app.put("/api/v1/admin/update", [authJwt.verifyToken], auth.update);
        app.post("/api/v1/admin/Brand/addBrand", [authJwt.verifyToken], BrandUpload.single('image'), auth.createBrands);
        app.get("/api/v1/admin/Brand/allBrand", auth.getBrands);
        app.put("/api/v1/admin/Brand/updateBrand/:id", [authJwt.verifyToken], BrandUpload.single('image'), auth.updateBrand);
        app.delete("/api/v1/admin/Brand/deleteBrand/:id", [authJwt.verifyToken], auth.removeBrand);
        app.post("/api/v1/admin/Category/addCategory", [authJwt.verifyToken], categoryUpload.single('image'), auth.createCategory);
        app.get("/api/v1/admin/Category/allCategory", auth.getCategories);
        app.put("/api/v1/admin/Category/updateCategory/:id", [authJwt.verifyToken], categoryUpload.single('image'), auth.updateCategory);
        app.delete("/api/v1/admin/Category/deleteCategory/:id", [authJwt.verifyToken], auth.removeCategory);
        app.post("/api/v1/admin/Product/addProduct", [authJwt.verifyToken], upload.array('image'), auth.createProduct);
        app.get("/api/v1/Product/all/paginateProductSearch", auth.paginateProductSearch);
        app.get("/api/v1/Product/:id", auth.getIdProduct);
        app.put("/api/v1/Product/editProduct/:id", [authJwt.verifyToken], upload.array('image'), auth.editProduct);
        app.delete("/api/v1/Product/deleteProduct/:id", [authJwt.verifyToken], auth.deleteProduct);
        app.post("/api/v1/product/createProductReview", [authJwt.verifyToken], auth.createProductReview);
        app.get("/api/v1/product/getProductReviews/:id", [authJwt.verifyToken], auth.getProductReviews);
        app.post("/api/v1/admin/Service/addService", [authJwt.verifyToken], upload.array('image'), auth.createService);
        app.get("/api/v1/Service/all/paginateServiceSearch", auth.paginateServiceSearch);
        app.get("/api/v1/Service/:id", auth.getIdService);
        app.put("/api/v1/Service/editService/:id", [authJwt.verifyToken], upload.array('image'), auth.editService);
        app.delete("/api/v1/Service/deleteService/:id", [authJwt.verifyToken], auth.deleteService);
        app.post("/api/v1/Subscription", auth.createSubscription);
        app.get("/api/v1/Subscription", auth.getAllSubscription);
        app.get("/api/v1/Subscription/byId/:id", auth.getSubscriptionById);
        app.put("/api/v1/Subscription/:id", auth.updateSubscription);
        app.delete("/api/v1/Subscription/:id", auth.deleteSubscription);
        app.post("/api/v1/Banner/addBanner", [authJwt.verifyToken], bannerUpload.single('image'), auth.createBanner);
        app.get("/api/v1/Banner/getBanner/:type", auth.getBanner);
        app.get("/api/v1/Banner/:id", auth.getIdBanner);
        app.delete("/api/v1/Banner/:id", [authJwt.verifyToken], auth.deleteBanner);
        app.put("/api/v1/Banner/updateBanner/:id", [authJwt.verifyToken], bannerUpload.single('image'), auth.updateBanner);
}
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
}
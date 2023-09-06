const auth = require("../controllers/userController");
const authJwt = require("../middlewares/authJwt");
const express = require("express");
const router = express()
const { productUpload, upload, bannerUpload, blogUpload, gallaryUpload, NutritionUpload, ProductTypeUpload, SkinConditionUpload, SkinTypeUpload,
        aboutusUpload, subCategoryUpload, categoryUpload, userProfileUpload, serviceUpload, BrandUpload, E4UUpload, offerUpload } = require('../middlewares/imageUpload')

module.exports = (app) => {
        app.post("/api/v1/user/registration", auth.registration);
        app.post("/api/v1/user/signin", auth.signin);
        app.post("/api/v1/user/forgetPassword", auth.forgetPassword);
        app.post("/api/v1/user/forgotVerifyotp/:id", auth.forgotVerifyotp);
        app.post("/api/v1/user/changePassword/:id", auth.changePassword);
        app.post("/api/v1/user/resendOtp/:id", auth.resendOTP);
        app.post("/api/v1/user/:id", auth.verifyOtp);
        app.get("/api/v1/user/getProfile", [authJwt.verifyToken], auth.getProfile);
        app.put("/api/v1/user/updateProfile", [authJwt.verifyToken], userProfileUpload.single('image'), auth.updateProfile);
        app.post("/api/v1/user/social/Login", auth.socialLogin);
}
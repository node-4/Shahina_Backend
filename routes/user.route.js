const auth = require("../controllers/userController");
const authJwt = require("../middlewares/authJwt");
const { productUpload, bannerUpload, blogUpload, aboutusUpload, subCategoryUpload, categoryUpload, serviceUpload, userProfileUpload } = require('../middlewares/imageUpload')
const express = require("express");
const router = express()
module.exports = (app) => {
        app.post("/api/v1/user/registration", [authJwt.verifyToken], auth.registration);
        app.post("/api/v1/user/socialLogin", auth.socialLogin);
        app.post("/api/v1/user/loginWithPhone", auth.loginWithPhone);
        app.post("/api/v1/user/:id", auth.verifyOtp);
        app.post("/api/v1/user/resendOtp/:id", auth.resendOTP);
        app.get("/api/v1/user/getProfile", [authJwt.verifyToken], auth.getProfile);
        app.put("/api/v1/user/updateProfile", [authJwt.verifyToken], userProfileUpload.single('image'), auth.updateProfile);
}
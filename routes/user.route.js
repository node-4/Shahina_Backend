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
        app.post("/api/v1/user/address/new", [authJwt.verifyToken], auth.createAddress);
        app.get("/api/v1/user/getAddress", [authJwt.verifyToken], auth.getallAddress);
        app.delete('/api/v1/user/address/:id', [authJwt.verifyToken], auth.deleteAddress);
        app.get('/api/v1/user/address/:id', [authJwt.verifyToken], auth.getAddressbyId);
        app.post('/api/v1/cart/:id', [authJwt.verifyToken], auth.addToCart)
        app.post('/api/v1/cart/gift/:id', [authJwt.verifyToken], auth.addGiftCardToCart)
        app.get('/api/v1/cart', [authJwt.verifyToken], auth.getCart);
        app.get('/api/v1/cartData', [authJwt.verifyToken], auth.cartData);
        app.put('/api/v1/updatePickupFromStore', [authJwt.verifyToken], auth.updatePickupFromStore);
        app.put('/api/v1/deletecartItem/:id', [authJwt.verifyToken], auth.deletecartItem)
        app.put("/api/v1/cart/addDateAndtimetoCart", [authJwt.verifyToken], auth.addDateAndtimetoCart);
        app.put("/api/v1/cart/addSuggestionToCart", [authJwt.verifyToken], auth.addSuggestionToCart);
        app.post('/api/v1/cart/service/:id', [authJwt.verifyToken], auth.addServiceToCart)
        app.post('/api/v1/checkout', [authJwt.verifyToken], auth.checkoutForProduct);
        app.post("/api/v1/placeOrder/:orderId", [authJwt.verifyToken], auth.placeOrderForProduct);
        app.get("/api/v1/successOrder/:orderId", [authJwt.verifyToken], auth.successOrder);
        app.get("/api/v1/cancelOrder/:orderId", [authJwt.verifyToken], auth.cancelOrder);
        app.get("/api/v1/Orders", [authJwt.verifyToken], auth.getOrders);
        app.get("/api/v1/viewOrder/:id", [authJwt.verifyToken], auth.getOrderbyId);
        app.post('/api/v1/checkoutForService', [authJwt.verifyToken], auth.checkoutForService);
        app.post("/api/v1/placeOrderForService/:orderId", [authJwt.verifyToken], auth.placeOrderForService);
        app.get("/api/v1/Service/getOnSale/Service", auth.getOnSaleService);
        app.get('/api/v1/getSubscription', auth.getSubscription);
        app.post("/api/v1/takeSubscription/:id", [authJwt.verifyToken], auth.takeSubscription);
        app.post("/api/v1/verifySubscription/:transactionId", [authJwt.verifyToken], auth.verifySubscription);
}
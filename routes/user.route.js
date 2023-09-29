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
        // Product cart start
        app.post('/api/v1/cart/:id', [authJwt.verifyToken], auth.addToCart)
        app.post('/api/v1/cart/FBP/:id', [authJwt.verifyToken], auth.addFBPToCart)
        app.post('/api/v1/cart/gift/:id', [authJwt.verifyToken], auth.addGiftCardToCart)
        app.put('/api/v1/updatePickupFromStore', [authJwt.verifyToken], auth.updatePickupFromStore);
        app.get('/api/v1/cart', [authJwt.verifyToken], auth.getCart);
        app.post('/api/v1/checkoutForProduct', [authJwt.verifyToken], auth.checkoutForProduct);
        app.post("/api/v1/placeOrderForProduct/:orderId", [authJwt.verifyToken], auth.placeOrderForProduct);
        app.get("/api/v1/successOrderForProduct/:orderId", [authJwt.verifyToken], auth.successOrderForProduct);
        app.get("/api/v1/cancelOrderForProduct/:orderId", [authJwt.verifyToken], auth.cancelOrderForProduct);
        app.get("/api/v1/productOrders", [authJwt.verifyToken], auth.getProductOrders);
        app.get("/api/v1/viewproductOrder/:id", [authJwt.verifyToken], auth.getProductOrderbyId);
        // service cart start 
        app.post('/api/v1/cart/service/:id', [authJwt.verifyToken], auth.addServiceToCart)
        app.post('/api/v1/cart/addOnservice/:id', [authJwt.verifyToken], auth.addOnServiceToCart)
        app.get('/api/v1/serviceCart', [authJwt.verifyToken], auth.getServiceCart);
        app.put("/api/v1/cart/addDateAndtimetoServiceCart", [authJwt.verifyToken], auth.addDateAndtimetoServiceCart);
        app.put("/api/v1/cart/addSuggestionToServiceCart", [authJwt.verifyToken], auth.addSuggestionToServiceCart);
        app.put('/api/v1/deleteServicefromcart/:id', [authJwt.verifyToken], auth.deleteServicefromcart)
        app.post('/api/v1/checkoutForService', [authJwt.verifyToken], auth.checkoutForService);
        app.post("/api/v1/placeOrderForService/:orderId", [authJwt.verifyToken], auth.placeOrderForService);
        app.get("/api/v1/successOrderForService/:orderId", [authJwt.verifyToken], auth.successOrderForService);
        app.get("/api/v1/cancelOrderForService/:orderId", [authJwt.verifyToken], auth.cancelOrderForService);
        app.get('/api/v1/cartData', [authJwt.verifyToken], auth.cartData);
        app.get("/api/v1/Service/getOnSale/Service", auth.getOnSaleService);
        app.get("/api/v1/serviceOrders", [authJwt.verifyToken], auth.getServiceOrders);
        app.get("/api/v1/viewserviceOrder/:id", [authJwt.verifyToken], auth.getServiceOrderbyId);
        // service cart end 
        app.get('/api/v1/getSubscription', auth.getSubscription);
        app.post("/api/v1/takeSubscription/:id", [authJwt.verifyToken], auth.takeSubscription);
        app.post("/api/v1/verifySubscription/:transactionId", [authJwt.verifyToken], auth.verifySubscription);
}
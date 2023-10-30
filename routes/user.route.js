const auth = require("../controllers/userController");
const authJwt = require("../middlewares/authJwt");
const express = require("express");
const router = express()
const { productUpload, upload, bannerUpload, blogUpload, gallaryUpload, NutritionUpload, ProductTypeUpload, SkinConditionUpload, SkinTypeUpload,
        aboutusUpload, subCategoryUpload, categoryUpload, userProfileUpload, serviceUpload, BrandUpload, E4UUpload, offerUpload } = require('../middlewares/imageUpload')

module.exports = (app) => {
        app.post("/api/v1/user/registration", auth.registration);
        app.post("/api/v1/user/registrationforApp", auth.registrationforApp);
        app.post("/api/v1/user/signin", auth.signin);
        app.post("/api/v1/user/forgetPassword", auth.forgetPassword);
        app.post("/api/v1/user/forgotVerifyotp", auth.forgotVerifyotp);
        app.post("/api/v1/user/changePassword/:id", auth.changePassword);
        app.post("/api/v1/user/resendOtp/:id", auth.resendOTP);
        app.post("/api/v1/user/:id", auth.verifyOtp);
        app.get("/api/v1/user/getProfile", [authJwt.verifyToken], auth.getProfile);
        app.put("/api/v1/user/checkIn", [authJwt.verifyToken], auth.checkIn);
        app.put("/api/v1/user/updateProfile", [authJwt.verifyToken], userProfileUpload.single('image'), auth.updateProfile);
        app.put("/api/v1/user/removeProfile", [authJwt.verifyToken], auth.removeProfile);
        app.post("/api/v1/user/social/Login", auth.socialLogin);
        app.post("/api/v1/user/address/new", [authJwt.verifyToken], auth.createAddress);
        app.get("/api/v1/user/getAddress", [authJwt.verifyToken], auth.getallAddress);
        app.delete('/api/v1/user/address/:id', [authJwt.verifyToken], auth.deleteAddress);
        app.get('/api/v1/user/address/:id', [authJwt.verifyToken], auth.getAddressbyId);
        app.get('/api/v1/getSubscription', auth.getSubscription);
        app.get('/api/v1/getSubscriptionForApp', [authJwt.verifyToken], auth.getSubscriptionApp);
        app.post("/api/v1/takeSubscription/:id", [authJwt.verifyToken], auth.takeSubscription);
        app.post("/api/v1/verifySubscription/:transactionId", [authJwt.verifyToken], auth.verifySubscription);
        app.get("/api/v1/getAllcoupan", [authJwt.verifyToken], auth.getAllcoupan);
        app.get('/api/v1/getServiceByTokenFormembership', [authJwt.verifyToken], auth.getServiceByTokenFormembership);
        app.get('/api/v1/cart', [authJwt.verifyToken], auth.getCart);
        app.put('/api/v1/applyCoupan', [authJwt.verifyToken], auth.applyCoupan);
        app.post('/api/v1/add-to-cart/:type/:id', [authJwt.verifyToken], auth.addToCart);
        app.delete('/api/cart/delete/:type/:id', [authJwt.verifyToken], auth.deleteCartItem);
        app.put("/api/v1/cart/addDateAndtimetoServiceCart", [authJwt.verifyToken], auth.addDateAndtimetoServiceCart);
        app.put("/api/v1/cart/addSuggestionToServiceCart", [authJwt.verifyToken], auth.addSuggestionToServiceCart);
        app.put('/api/v1/updatePickupFromStore', [authJwt.verifyToken], auth.updatePickupFromStore);
        app.post('/api/v1/checkout', [authJwt.verifyToken], auth.checkout);
        app.post("/api/v1/placeOrder/:orderId", [authJwt.verifyToken], auth.placeOrder);
        app.get("/api/v1/successOrder/:orderId", [authJwt.verifyToken], auth.successOrder);
        app.get("/api/v1/cancelOrder/:orderId", [authJwt.verifyToken], auth.cancelOrder);
        app.get("/api/v1/productOrders", [authJwt.verifyToken], auth.getProductOrders);
        app.get("/api/v1/viewproductOrder/:id", [authJwt.verifyToken], auth.getProductOrderbyId);
        app.get("/api/v1/serviceOrders", [authJwt.verifyToken], auth.getServiceOrders);
        app.get("/api/v1/viewserviceOrder/:id", [authJwt.verifyToken], auth.getServiceOrderbyId);
        app.get("/api/v1/Service/getOnSale/Service", auth.getOnSaleService);
        app.post("/api/v1/takeSubscriptionFromWebsite/:id", [authJwt.verifyToken], auth.takeSubscriptionFromWebsite);
        app.post("/api/v1/cancelMemberShips", [authJwt.verifyToken], auth.cancelMemberShip);
        app.get('/api/v1/getRecentlyProductView', [authJwt.verifyToken], auth.getRecentlyProductView);
        app.get('/api/v1/getRecentlyServicesView', [authJwt.verifyToken], auth.getRecentlyServicesView);
        app.get('/api/v1/cartApp', [authJwt.verifyToken], auth.getCartApp);
        app.post('/api/v1/checkoutApp', [authJwt.verifyToken], auth.checkoutApp);
        app.post("/api/v1/placeOrder1/:orderId", [authJwt.verifyToken], auth.placeOrderApp);
        app.get("/api/v1/successOrderApp/:orderId", [authJwt.verifyToken], auth.successOrderApp);
        app.get("/api/v1/cancelOrderApp/:orderId", [authJwt.verifyToken], auth.cancelOrderApp);
        app.get("/api/v1/overAllSearch", auth.overAllSearch);

        // Product cart start
        // app.post('/api/v1/cart/:id', [authJwt.verifyToken], auth.addToCart)
        // app.post('/api/v1/cart/FBP/:id', [authJwt.verifyToken], auth.addFBPToCart)
        // app.post('/api/v1/cart/gift/:id', [authJwt.verifyToken], auth.addGiftCardToCart)
        // app.get('/api/v1/cart', [authJwt.verifyToken], auth.getCart);
        // app.put('/api/v1/deleteProductfromcart/:id', [authJwt.verifyToken], auth.deleteProductfromcart)
        // app.put('/api/v1/deletefrequentlyBuyProductfromcart/:id', [authJwt.verifyToken], auth.deletefrequentlyBuyProductfromcart)
        // app.put('/api/v1/deleteGiftCardfromcart/:id', [authJwt.verifyToken], auth.deleteGiftCardfromcart)
        // app.post('/api/v1/checkoutForProduct', [authJwt.verifyToken], auth.checkoutForProduct);
        // app.post("/api/v1/placeOrderForProduct/:orderId", [authJwt.verifyToken], auth.placeOrderForProduct);
        // app.get("/api/v1/successOrderForProduct/:orderId", [authJwt.verifyToken], auth.successOrderForProduct);
        // app.get("/api/v1/cancelOrderForProduct/:orderId", [authJwt.verifyToken], auth.cancelOrderForProduct);
        // // service cart start 
        // app.post('/api/v1/cart/service/:id', [authJwt.verifyToken], auth.addServiceToCart)
        // app.post('/api/v1/cart/addOnservice/:id', [authJwt.verifyToken], auth.addOnServiceToCart)
        // app.get('/api/v1/serviceCart', [authJwt.verifyToken], auth.getServiceCart);
        // app.put('/api/v1/deleteServicefromcart/:id', [authJwt.verifyToken], auth.deleteServicefromcart)
        // app.post('/api/v1/checkoutForService', [authJwt.verifyToken], auth.checkoutForService);
        // app.post("/api/v1/placeOrderForService/:orderId", [authJwt.verifyToken], auth.placeOrderForService);
        // app.get("/api/v1/successOrderForService/:orderId", [authJwt.verifyToken], auth.successOrderForService);
        // app.get("/api/v1/cancelOrderForService/:orderId", [authJwt.verifyToken], auth.cancelOrderForService);
        // app.get('/api/v1/cartData', [authJwt.verifyToken], auth.cartData);
        // service cart end 

}
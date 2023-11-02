const auth = require("../controllers/adminController");
const authJwt = require("../middlewares/authJwt");
var multer = require("multer");
const path = require("path");
const express = require("express");
const router = express()
const { productUpload, quiz, upload, bannerUpload,upload100, upload23, upload24, blogUpload, newsUpload, gallaryUpload, NutritionUpload, ProductTypeUpload, SkinConditionUpload, SkinTypeUpload,
        aboutusUpload, subCategoryUpload, shopPageUpload, upload20, servicePageUpload, categoryUpload, serviceUpload, BrandUpload, E4UUpload, offerUpload } = require('../middlewares/imageUpload')
module.exports = (app) => {
        app.post("/api/v1/admin/registration", auth.registration);
        app.post("/api/v1/admin/clientRegistration", [authJwt.verifyToken], auth.clientRegistration);
        app.post("/api/v1/admin/login", auth.signin);
        app.get("/api/v1/admin/getAllUser", auth.getAllUser);
        app.get("/api/v1/admin/viewUser/:id", auth.viewUser);
        app.delete("/api/v1/admin/deleteUser/:id", [authJwt.verifyToken], auth.deleteUser);
        app.put("/api/v1/admin/update", [authJwt.verifyToken], auth.update);
        app.post("/api/v1/admin/Brand/addBrand", [authJwt.verifyToken], BrandUpload.single('image'), auth.createBrands);
        app.get("/api/v1/admin/Brand/allBrand", auth.getBrands);
        app.put("/api/v1/admin/Brand/updateBrand/:id", [authJwt.verifyToken], BrandUpload.single('image'), auth.updateBrand);
        app.delete("/api/v1/admin/Brand/deleteBrand/:id", [authJwt.verifyToken], auth.removeBrand);
        app.post("/api/v1/admin/Nutrition/addNutrition", [authJwt.verifyToken], NutritionUpload.single('image'), auth.createNutritions);
        app.get("/api/v1/admin/Nutrition/allNutrition", auth.getNutritions);
        app.put("/api/v1/admin/Nutrition/updateNutrition/:id", [authJwt.verifyToken], NutritionUpload.single('image'), auth.updateNutrition);
        app.delete("/api/v1/admin/Nutrition/deleteNutrition/:id", [authJwt.verifyToken], auth.removeNutrition);
        app.post("/api/v1/admin/ProductType/addProductType", [authJwt.verifyToken], ProductTypeUpload.single('image'), auth.createProductTypes);
        app.get("/api/v1/admin/ProductType/allProductType", auth.getProductTypes);
        app.put("/api/v1/admin/ProductType/updateProductType/:id", [authJwt.verifyToken], ProductTypeUpload.single('image'), auth.updateProductType);
        app.delete("/api/v1/admin/ProductType/deleteProductType/:id", [authJwt.verifyToken], auth.removeProductType);
        app.post("/api/v1/admin/SkinCondition/addSkinCondition", [authJwt.verifyToken], SkinConditionUpload.single('image'), auth.createSkinConditions);
        app.get("/api/v1/admin/SkinCondition/allSkinCondition", auth.getSkinConditions);
        app.put("/api/v1/admin/SkinCondition/updateSkinCondition/:id", [authJwt.verifyToken], SkinConditionUpload.single('image'), auth.updateSkinCondition);
        app.delete("/api/v1/admin/SkinCondition/deleteSkinCondition/:id", [authJwt.verifyToken], auth.removeSkinCondition);
        app.post("/api/v1/admin/SkinType/addSkinType", [authJwt.verifyToken], SkinTypeUpload.single('image'), auth.createSkinTypes);
        app.get("/api/v1/admin/SkinType/allSkinType", auth.getSkinTypes);
        app.put("/api/v1/admin/SkinType/updateSkinType/:id", [authJwt.verifyToken], SkinTypeUpload.single('image'), auth.updateSkinType);
        app.delete("/api/v1/admin/SkinType/deleteSkinType/:id", [authJwt.verifyToken], auth.removeSkinType);
        app.post("/api/v1/admin/Category/addCategory", [authJwt.verifyToken], categoryUpload.single('image'), auth.createCategory);
        app.get("/api/v1/admin/Category/allCategory", auth.getCategories);
        app.put("/api/v1/admin/Category/updateCategory/:id", [authJwt.verifyToken], categoryUpload.single('image'), auth.updateCategory);
        app.delete("/api/v1/admin/Category/deleteCategory/:id", [authJwt.verifyToken], auth.removeCategory);
        app.post("/api/v1/admin/Product/addProduct", [authJwt.verifyToken], upload23, auth.createProduct);
        app.get("/api/v1/Product/all/paginateProductSearch", auth.paginateProductSearch);
        app.get("/api/v1/Product/:id", auth.getIdProduct);
        app.get("/api/v1/Product/byToken/:id", [authJwt.verifyToken], auth.getIdProductByToken);
        app.put("/api/v1/Product/editProduct/:id", [authJwt.verifyToken], upload23, auth.editProduct);
        app.delete("/api/v1/Product/deleteProduct/:id", [authJwt.verifyToken], auth.deleteProduct);
        app.post("/api/v1/product/createProductReview", [authJwt.verifyToken], auth.createProductReview);
        app.get("/api/v1/product/getProductReviews/:id", [authJwt.verifyToken], auth.getProductReviews);
        app.post("/api/v1/admin/Service/addService", [authJwt.verifyToken], upload24, auth.createService);
        app.get("/api/v1/Service/all/paginateServiceSearch", auth.paginateServiceSearch);
        app.get("/api/v1/Service/all/getServiceByToken", [authJwt.verifyToken], auth.getServiceByToken);
        app.get("/api/v1/Service/:id", auth.getIdService);
        app.get("/api/v1/Service/byToken/:id", [authJwt.verifyToken], auth.getIdServiceByToken);
        app.put("/api/v1/Service/editService/:id", [authJwt.verifyToken], upload24, auth.editService);
        app.delete("/api/v1/Service/deleteService/:id", [authJwt.verifyToken], auth.deleteService);
        app.post("/api/v1/Subscription", auth.createSubscription);
        app.get("/api/v1/Subscription", auth.getAllSubscription);
        app.get("/api/v1/Subscription/byId/:id", auth.getSubscriptionById);
        app.put("/api/v1/Subscription/:id", auth.updateSubscription);
        app.delete("/api/v1/Subscription/:id", auth.deleteSubscription);
        app.post("/api/v1/Banner/addBanner", [authJwt.verifyToken], bannerUpload.single('image'), auth.createBanner);
        app.post("/api/v1/Banner/createHomePageBanner", [authJwt.verifyToken], bannerUpload.single('image'), auth.createHomePageBanner);
        app.post("/api/v1/Banner/createPromotionBanner", [authJwt.verifyToken], bannerUpload.single('image'), auth.createPromotionBanner);
        app.get("/api/v1/Banner/getBanner/:type", auth.getBanner);
        app.get("/api/v1/Banner/getAllBanner", auth.getAllBanner);
        app.get("/api/v1/Banner/:id", auth.getIdBanner);
        app.delete("/api/v1/Banner/:id", [authJwt.verifyToken], auth.deleteBanner);
        app.put("/api/v1/Banner/updateBanner/:id", [authJwt.verifyToken], bannerUpload.single('image'), auth.updateBanner);
        app.post("/api/v1/Partner/addPartner", [authJwt.verifyToken], bannerUpload.array('images'), auth.createPartner);
        app.post("/api/v1/ShopPage/addShopPage", [authJwt.verifyToken], shopPageUpload, auth.createShopPage);
        app.post("/api/v1/ServicePage/addServicePage", [authJwt.verifyToken], servicePageUpload.array('images'), auth.createServicePage);
        app.post("/api/v1/Gallary/addGallary", [authJwt.verifyToken], gallaryUpload.single('image'), auth.createGallarys);
        app.get("/api/v1/Gallary/getGallary", auth.getGallarys);
        app.delete("/api/v1/Gallary/:id", [authJwt.verifyToken], auth.removeGallary);
        app.put("/api/v1/Gallary/updateGallary/:id", [authJwt.verifyToken], gallaryUpload.single('image'), auth.updateGallary);
        app.post("/api/v1/ContactDetails/addContactDetails", [authJwt.verifyToken], upload20.single('image'), auth.addContactDetails);
        app.get("/api/v1/ContactDetails/viewContactDetails", auth.viewContactDetails);
        app.post("/api/v1/help/addQuery", auth.addQuery);
        app.get("/api/v1/help/all", auth.getAllHelpandSupport);
        app.get("/api/v1/help/:id", auth.getHelpandSupportById);
        app.delete("/api/v1/help/:id", auth.deleteHelpandSupport);
        app.post("/api/v1/News/addNews", [authJwt.verifyToken], newsUpload.single('image'), auth.createNews);
        app.get("/api/v1/News/getNews", auth.getNews);
        app.delete("/api/v1/News/:id", [authJwt.verifyToken], auth.removeNews);
        app.put("/api/v1/News/updateNews/:id", [authJwt.verifyToken], newsUpload.single('image'), auth.updateNews);
        app.post("/api/v1/clientReview/addclientReview", [authJwt.verifyToken], auth.createClientReview);
        app.put("/api/v1/clientReview/put/:id", [authJwt.verifyToken], auth.updateClientReview);
        app.get("/api/v1/clientReview", auth.getAllClientReviews);
        app.delete("/api/v1/clientReview/:id", [authJwt.verifyToken], auth.removeClientReview);
        app.get("/api/v1/clientReview/get/:id", [authJwt.verifyToken], auth.getClientReviewById);
        app.get("/api/v1/admin/ProductOrder", [authJwt.verifyToken], auth.getProductOrder);
        app.get("/api/v1/admin/ServiceOrders", [authJwt.verifyToken], auth.getServiceOrders);
        app.get("/api/v1/admin/getServiceOrderswithDate", [authJwt.verifyToken], auth.getServiceOrderswithDate);
        app.post("/api/v1/admin/Ingredient/addIngredient", [authJwt.verifyToken], auth.createIngredients);
        app.get("/api/v1/admin/Ingredient/allIngredient", auth.getIngredients);
        app.get("/api/v1/admin/Ingredient/allIngredientbyType/:type", auth.getIngredientsBytype);
        app.put("/api/v1/admin/Ingredient/updateIngredient/:id", [authJwt.verifyToken], auth.updateIngredients);
        app.delete("/api/v1/admin/Ingredient/deleteIngredient/:id", [authJwt.verifyToken], auth.removeIngredients);
        app.get("/api/v1/admin/Ingredient/checkIngredient/:name", auth.checkIngredient);
        app.post("/api/v1/admin/GiftCards/addgiftCard", [authJwt.verifyToken], upload.single('image'), auth.createGiftCard);
        app.get("/api/v1/admin/GiftCards/allgiftCard", auth.getGiftCards);
        app.get("/api/v1/GiftCards/:id", auth.getIdGiftCard);
        app.put("/api/v1/GiftCards/updateGiftPrice/:id", [authJwt.verifyToken], auth.updateGiftPrice);
        app.delete("/api/v1/GiftCards/deleteGiftPrice/:id", [authJwt.verifyToken], auth.deleteGiftPrice);
        app.delete("/api/v1/GiftCards/deletegiftCard/:id", [authJwt.verifyToken], auth.deleteGiftCard);
        app.post("/api/v1/admin/Slot/addSlot", [authJwt.verifyToken], auth.createSlot);
        app.get("/api/v1/admin/Slot/allSlot", auth.getSlot);
        app.put("/api/v1/admin/Slot/updateSlot/:id", [authJwt.verifyToken], auth.updateSlot);
        app.delete("/api/v1/admin/Slot/deleteSlot/:id", [authJwt.verifyToken], auth.removeSlot);
        app.post("/api/v1/admin/ShippingCharges/addShippingCharges", [authJwt.verifyToken], auth.createShippingCharges);
        app.get("/api/v1/admin/ShippingCharges/allShippingCharges", auth.getShippingCharges);
        app.put("/api/v1/admin/ShippingCharges/updateShippingCharges/:id", [authJwt.verifyToken], auth.updateShippingCharges);
        app.delete("/api/v1/admin/ShippingCharges/deleteShippingCharges/:id", [authJwt.verifyToken], auth.removeShippingCharges);
        app.post("/api/v1/AcneQuiz/addAcneQuiz", [authJwt.verifyToken], quiz, auth.createAcneQuiz);
        app.get("/api/v1/AcneQuiz", auth.getAcneQuiz);
        app.put("/api/v1/AcneQuiz/updateAcneQuiz/:id", [authJwt.verifyToken], quiz, auth.updateAcneQuiz);
        app.delete("/api/v1/admin/AcneQuiz/deleteAcneQuiz/:id", [authJwt.verifyToken], auth.removeAcneQuiz);
        app.post("/api/v1/AcneQuizSuggession/addAcneQuizSuggession", [authJwt.verifyToken], auth.createAcneQuizSuggession);
        app.get("/api/v1/AcneQuizSuggession", auth.getAcneQuizSuggession);
        app.put("/api/v1/AcneQuizSuggession/updateAcneQuiz/:id", [authJwt.verifyToken], auth.updateAcneQuizSuggession);
        app.delete("/api/v1/admin/AcneQuizSuggession/deleteAcneQuizSuggession/:id", [authJwt.verifyToken], auth.removeAcneQuizSuggession);
        app.get("/api/v1/AcneQuizSuggession/getAcneQuizSuggessionByAnswer", [authJwt.verifyToken], auth.getAcneQuizSuggessionByAnswer);
        app.post("/api/v1/FrequentlyBuyProduct/addFrequentlyBuyProduct", [authJwt.verifyToken], auth.createFrequentlyBuyProduct);
        app.get("/api/v1/FrequentlyBuyProduct", auth.getFrequentlyBuyProduct);
        app.put("/api/v1/FrequentlyBuyProduct/updateFrequentlyBuyProduct/:id", [authJwt.verifyToken], auth.updateFrequentlyBuyProduct);
        app.delete("/api/v1/admin/FrequentlyBuyProduct/deleteFrequentlyBuyProduct/:id", [authJwt.verifyToken], auth.removeFrequentlyBuyProduct);
        app.get("/api/v1/FrequentlyBuyProduct/byProduct/:productId", auth.getFrequentlyBuyProductbyProductId);
        app.post("/api/v1/admin/AddOnServices/addAddOnServices", [authJwt.verifyToken], upload.single('image'), auth.createAddOnServices);
        app.get("/api/v1/admin/AddOnServices/allAddOnServices", auth.getAddOnServices);
        app.get("/api/v1/AddOnServices/getAddOnServiceByToken", [authJwt.verifyToken], auth.getAddOnServiceByToken);
        app.put("/api/v1/admin/AddOnServices/updateAddOnServices/:id", [authJwt.verifyToken], upload.single('image'), auth.updateAddOnServices);
        app.delete("/api/v1/admin/AddOnServices/deleteAddOnServices/:id", [authJwt.verifyToken], auth.removeAddOnServices);
        app.post("/api/v1/admin/createShipment", auth.createShipment);
        app.get("/api/v1/admin/getAllShipment", [authJwt.verifyToken], auth.getAllShipment);
        app.post('/api/v1/admin/addtoCart/:type/:id', [authJwt.verifyToken], auth.addToCart);
        app.get('/api/v1/admin/getCart/:userId', [authJwt.verifyToken], auth.getCart);
        app.post('/api/v1/admin/checkout/:userId', [authJwt.verifyToken], auth.checkout);
        app.get("/api/v1/admin/successOrder/:orderId", [authJwt.verifyToken], auth.successOrder);
        app.get("/api/v1/admin/cancelOrder/:orderId", [authJwt.verifyToken], auth.cancelOrder);
        app.get("/api/v1/admin/viewproductOrder/:id", auth.getProductOrderbyId);
        app.get("/api/v1/admin/viewserviceOrder/:id", auth.getServiceOrderbyId);
        app.delete('/api/admin/cart/delete/:type/:id/:userId', [authJwt.verifyToken], auth.deleteCartItem);
        app.get("/api/v1/admin/getAllcoupan", [authJwt.verifyToken], auth.getAllcoupan);
        app.post("/api/v1/admin/addCoupan", [authJwt.verifyToken], upload.single('image'), auth.addCoupan);
        app.delete("/api/v1/admin/Coupan/:id", [authJwt.verifyToken], auth.deleteCoupan);
        app.get("/api/v1/admin/getAllTransaction", [authJwt.verifyToken], auth.getAllTransaction);
        app.post("/api/v1/admin/notification/sendNotification", authJwt.verifyToken, auth.sendNotification);
        app.get("/api/v1/admin/notification/allNotification", authJwt.verifyToken, auth.allNotification);
        app.post("/api/v1/admin/uploadClient", authJwt.verifyToken, upload100.single('file'), auth.uploadClient);
        // app.post('/api/v1/admin/chatapi', auth.chatapi);
}
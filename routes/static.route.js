const staticContent = require('../controllers/static.Controller');
const authJwt = require("../middlewares/authJwt");
const express = require("express");
const router = express();
const { productUpload, upload, aboutUs, bannerUpload, blogUpload, gallaryUpload, NutritionUpload, ProductTypeUpload, SkinConditionUpload, SkinTypeUpload,
        aboutusUpload, subCategoryUpload, categoryUpload, userProfileUpload, serviceUpload, BrandUpload, E4UUpload, offerUpload } = require('../middlewares/imageUpload')

module.exports = (app) => {
        app.post('/api/v1/static/createAboutus', [authJwt.verifyToken], aboutUs.single('image'), staticContent.createAboutUs);
        app.delete('/api/v1/static/aboutUs/:id', [authJwt.verifyToken], staticContent.deleteAboutUs);
        app.get('/api/v1/static/getAboutUs', staticContent.getAboutUs);
        app.get('/api/v1/static/aboutUs/:id', staticContent.getAboutUsById);
        app.post('/api/v1/static/createPrivacy', [authJwt.verifyToken], staticContent.createPrivacy);
        app.put('/api/v1/static/privacy/:id', [authJwt.verifyToken], staticContent.updatePrivacy);
        app.delete('/api/v1/static/privacy/:id', [authJwt.verifyToken], staticContent.deletePrivacy);
        app.get('/api/v1/static/getPrivacy', staticContent.getPrivacy);
        app.get('/api/v1/static/privacy/:id', staticContent.getPrivacybyId);
        app.post('/api/v1/static/createTerms', [authJwt.verifyToken], staticContent.createTerms);
        app.put('/api/v1/static/terms/:id', [authJwt.verifyToken], staticContent.updateTerms);
        app.delete('/api/v1/static/terms/:id', [authJwt.verifyToken], staticContent.deleteTerms);
        app.get('/api/v1/static/getTerms', staticContent.getTerms);
        app.get('/api/v1/static/terms/:id', staticContent.getTermsbyId);
        app.post("/api/v1/static/faq/createFaq", [authJwt.verifyToken], staticContent.createFaq);
        app.put("/api/v1/static/faq/:id", [authJwt.verifyToken], staticContent.updateFaq);
        app.delete("/api/v1/static/faq/:id", [authJwt.verifyToken], staticContent.deleteFaq);
        app.get("/api/v1/static/faq/All", staticContent.getAllFaqs);
        app.get("/api/v1/static/faq/:id", staticContent.getFaqById);
        app.post('/api/v1/static/createReturnPrivacy', [authJwt.verifyToken], staticContent.createReturnPrivacy);
        app.get('/api/v1/static/getReturnPrivacy', staticContent.getReturnPrivacy);
        app.post('/api/v1/static/createShippingPrivacy', [authJwt.verifyToken], staticContent.createShippingPrivacy);
        app.get('/api/v1/static/getShippingPrivacy', staticContent.getShippingPrivacy);
        app.post('/api/v1/static/createMembershipTerm', [authJwt.verifyToken], staticContent.createMembershipTerm);
        app.get('/api/v1/static/getMembershipTerm', staticContent.getMembershipTerm);
}
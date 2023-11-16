var multer = require("multer");
const authConfig = require("../configs/auth.config");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
cloudinary.config({ cloud_name: authConfig.cloud_name, api_key: authConfig.api_key, api_secret: authConfig.api_secret, });
const storage100 = multer.diskStorage({
        destination: function (req, file, cb) {
                cb(null, "FormPdf/");
        },
        filename: function (req, file, cb) {
                cb(null, file.originalname);
        },
});
const upload100 = multer({ storage: storage100 });

const storage = new CloudinaryStorage({ cloudinary: cloudinary, params: { folder: "shahina/images/product", allowed_formats: ["jpg", "avif", "webp", "jpeg", "png", "PNG", "xlsx", "xls", "pdf", "PDF"], }, });
const upload = multer({ storage: storage });
const productUpload = upload.fields([{ name: 'images', maxCount: 20 }, { name: 'image', maxCount: 1 }]);
const storage1 = new CloudinaryStorage({ cloudinary: cloudinary, params: { folder: "shahina/images/banner", allowed_formats: ["jpg", "avif", "webp", "jpeg", "png", "PNG", "xlsx", "xls", "pdf", "PDF"], }, });
const bannerUpload = multer({ storage: storage1 });
const storage2 = new CloudinaryStorage({ cloudinary: cloudinary, params: { folder: "shahina/images/blog", allowed_formats: ["jpg", "avif", "webp", "jpeg", "png", "PNG", "xlsx", "xls", "pdf", "PDF"], }, });
const blogUpload = multer({ storage: storage2 });
const storage3 = new CloudinaryStorage({ cloudinary: cloudinary, params: { folder: "shahina/images/about", allowed_formats: ["jpg", "avif", "webp", "jpeg", "png", "PNG", "xlsx", "xls", "pdf", "PDF"], }, });
const upload3 = multer({ storage: storage3 });
const aboutusUpload = upload3.fields([{ name: 'aboutusImages', maxCount: 10 }, { name: 'aboutusImage', maxCount: 1 }]);
const storage4 = new CloudinaryStorage({ cloudinary: cloudinary, params: { folder: "shahina/images/category", allowed_formats: ["jpg", "avif", "webp", "jpeg", "png", "PNG", "xlsx", "xls", "pdf", "PDF"], }, });
const categoryUpload = multer({ storage: storage4 });
const storage5 = new CloudinaryStorage({ cloudinary: cloudinary, params: { folder: "shahina/images/subCategory", allowed_formats: ["jpg", "avif", "webp", "jpeg", "png", "PNG", "xlsx", "xls", "pdf", "PDF"], }, });
const subCategoryUpload = multer({ storage: storage5 });
const storage6 = new CloudinaryStorage({ cloudinary: cloudinary, params: { folder: "shahina/service", allowed_formats: ["jpg", "avif", "webp", "jpeg", "png", "PNG", "xlsx", "xls", "pdf", "PDF"], }, });
const serviceUpload = multer({ storage: storage6 });
const storage7 = new CloudinaryStorage({ cloudinary: cloudinary, params: { folder: "shahina/userProfile", allowed_formats: ["jpg", "avif", "webp", "jpeg", "png", "PNG", "xlsx", "xls", "pdf", "PDF"], }, });
const userProfileUpload = multer({ storage: storage7 });
const storage8 = new CloudinaryStorage({ cloudinary: cloudinary, params: { folder: "shahina/Brand", allowed_formats: ["jpg", "avif", "webp", "jpeg", "png", "PNG", "xlsx", "xls", "pdf", "PDF"], }, });
const BrandUpload = multer({ storage: storage8 });
const storage9 = new CloudinaryStorage({ cloudinary: cloudinary, params: { folder: "shahina/E4u", allowed_formats: ["jpg", "avif", "webp", "jpeg", "png", "PNG", "xlsx", "xls", "pdf", "PDF"], }, });
const E4UUpload = multer({ storage: storage9 });
const storage10 = new CloudinaryStorage({ cloudinary: cloudinary, params: { folder: "shahina/offer", allowed_formats: ["jpg", "avif", "webp", "jpeg", "png", "PNG", "xlsx", "xls", "pdf", "PDF"], }, });
const offerUpload = multer({ storage: storage10 });
const storage11 = new CloudinaryStorage({ cloudinary: cloudinary, params: { folder: "shahina/Nutrition", allowed_formats: ["jpg", "avif", "webp", "jpeg", "png", "PNG", "xlsx", "xls", "pdf", "PDF"], }, });
const NutritionUpload = multer({ storage: storage11 });
const storage12 = new CloudinaryStorage({ cloudinary: cloudinary, params: { folder: "shahina/ProductType", allowed_formats: ["jpg", "avif", "webp", "jpeg", "png", "PNG", "xlsx", "xls", "pdf", "PDF"], }, });
const ProductTypeUpload = multer({ storage: storage12 });
const storage13 = new CloudinaryStorage({ cloudinary: cloudinary, params: { folder: "shahina/SkinCondition", allowed_formats: ["jpg", "avif", "webp", "jpeg", "png", "PNG", "xlsx", "xls", "pdf", "PDF"], }, });
const SkinConditionUpload = multer({ storage: storage13 });
const storage14 = new CloudinaryStorage({ cloudinary: cloudinary, params: { folder: "shahina/SkinCondition", allowed_formats: ["jpg", "avif", "webp", "jpeg", "png", "PNG", "xlsx", "xls", "pdf", "PDF"], }, });
const SkinTypeUpload = multer({ storage: storage14 });
const storage15 = new CloudinaryStorage({ cloudinary: cloudinary, params: { folder: "shahina/SkinCondition", allowed_formats: ["jpg", "avif", "webp", "jpeg", "png", "PNG", "xlsx", "xls", "pdf", "PDF"], }, });
const gallaryUpload = multer({ storage: storage15 })
const storage16 = new CloudinaryStorage({ cloudinary: cloudinary, params: { folder: "shahina/about", allowed_formats: ["jpg", "avif", "webp", "jpeg", "png", "PNG", "xlsx", "xls", "pdf", "PDF"], }, });
const aboutUs = multer({ storage: storage16 })
const storage17 = new CloudinaryStorage({ cloudinary: cloudinary, params: { folder: "shahina/news", allowed_formats: ["jpg", "avif", "webp", "jpeg", "png", "PNG", "xlsx", "xls", "pdf", "PDF"], }, });
const newsUpload = multer({ storage: storage17 })
const storage18 = new CloudinaryStorage({ cloudinary: cloudinary, params: { folder: "shahina/shopPage", allowed_formats: ["jpg", "avif", "webp", "jpeg", "png", "PNG", "xlsx", "xls", "pdf", "PDF"], }, });
const upload18 = multer({ storage: storage18 });
const shopPageUpload = upload18.fields([{ name: 'shopImage', maxCount: 10 }, { name: 'images', maxCount: 10 }]);
const storage19 = new CloudinaryStorage({ cloudinary: cloudinary, params: { folder: "shahina/news", allowed_formats: ["jpg", "avif", "webp", "jpeg", "png", "PNG", "xlsx", "xls", "pdf", "PDF"], }, });
const servicePageUpload = multer({ storage: storage19 })
const storage20 = new CloudinaryStorage({ cloudinary: cloudinary, params: { folder: "shahina/contactDetail", allowed_formats: ["jpg", "avif", "webp", "jpeg", "png", "PNG", "xlsx", "xls", "pdf", "PDF"], }, });
const upload20 = multer({ storage: storage20 });
const storage120 = new CloudinaryStorage({ cloudinary: cloudinary, params: { folder: "shahina/shopPage", allowed_formats: ["jpg", "avif", "webp", "jpeg", "png", "PNG", "xlsx", "xls", "pdf", "PDF"], }, });
const upload22 = multer({ storage: storage120 });
const quiz = upload22.fields([
        { name: 'option1image', maxCount: 1 },
        { name: 'option2image', maxCount: 1 },
        { name: 'option3image', maxCount: 1 },
        { name: 'option4image', maxCount: 1 },]);
const upload23 = upload.fields([{ name: 'image', maxCount: 20 }, { name: 'result', maxCount: 5 }]);

const upload24 = upload.fields([{ name: 'image', maxCount: 20 }, { name: 'beforeAfterImage', maxCount: 1 }]);

module.exports = { upload, productUpload, upload23, upload24, quiz,upload100, newsUpload, bannerUpload, aboutUs, servicePageUpload, upload20, shopPageUpload, blogUpload, aboutusUpload, gallaryUpload, NutritionUpload, SkinTypeUpload, ProductTypeUpload, SkinConditionUpload, subCategoryUpload, categoryUpload, serviceUpload, E4UUpload, userProfileUpload, BrandUpload, offerUpload };

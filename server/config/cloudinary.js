// Cloudinary configuration for image uploads
const cloudinary = require("cloudinary").v2;
const multerStorageCloudinary = require("multer-storage-cloudinary");
const CloudinaryStorage = multerStorageCloudinary.CloudinaryStorage || multerStorageCloudinary;
const multer = require("multer");

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "campuscrib",
        allowedFormats: ["png", "jpg", "jpeg", "webp"],
        transformation: [{ width: 800, height: 600, crop: "limit", quality: "auto" }],
    },
});

const upload = multer({ storage });

module.exports = { cloudinary, upload };

// Cloudinary configuration for image uploads
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

// Validate credentials exist
if (!process.env.CLOUD_NAME || !process.env.CLOUD_API_KEY || !process.env.CLOUD_API_SECRET) {
    console.error("⚠️  Missing Cloudinary credentials! Image uploads will fail.");
}

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
});

// Listing images storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "campuscrib",
        allowedFormats: ["png", "jpg", "jpeg", "webp"],
        transformation: [{ width: 800, height: 600, crop: "limit", quality: "auto" }],
    },
});

// QR code images storage (for owner payment)
const qrStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "campuscrib/qrcodes",
        allowedFormats: ["png", "jpg", "jpeg", "webp"],
        transformation: [{ width: 400, height: 400, crop: "limit", quality: "auto" }],
    },
});

const upload = multer({ storage });
const qrUpload = multer({ storage: qrStorage });

module.exports = { cloudinary, upload, qrUpload };


// Cloudinary configuration for image uploads
// Uses multer (memory storage) + cloudinary SDK directly
// — avoids multer-storage-cloudinary which is incompatible with multer v2 + cloudinary v2
const cloudinary = require("cloudinary").v2;
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

// Multer stores files in memory as Buffer — we then stream to Cloudinary manually
const memoryStorage = multer.memoryStorage();

const upload = multer({
    storage: memoryStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    fileFilter: (req, file, cb) => {
        const allowed = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Only PNG, JPG, JPEG, and WebP images are allowed."), false);
        }
    },
});

// Same multer instance for QR codes (same validation, different Cloudinary folder used at upload time)
const qrUpload = multer({
    storage: memoryStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Only PNG, JPG, JPEG, and WebP images are allowed."), false);
        }
    },
});

/**
 * Upload a buffer to Cloudinary
 * @param {Buffer} fileBuffer — the file data from req.file.buffer
 * @param {string} folder — Cloudinary folder name (e.g. "CampusCrib_Image")
 * @param {object} transformation — optional Cloudinary transformation
 * @returns {Promise<{url: string, filename: string}>}
 */
const uploadToCloudinary = (fileBuffer, folder, transformation = []) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder,
                allowed_formats: ["png", "jpg", "jpeg", "webp"],
                transformation,
            },
            (error, result) => {
                if (error) return reject(error);
                resolve({
                    url: result.secure_url,
                    filename: result.public_id,
                });
            }
        );
        stream.end(fileBuffer);
    });
};

module.exports = { cloudinary, upload, qrUpload, uploadToCloudinary };

// Auth routes — register/login user profile in our database
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { verifyToken } = require("../middleware/auth");
const { qrUpload } = require("../config/cloudinary");

// POST /api/auth/register — Create user profile after Firebase signup
router.post("/register", verifyToken, async (req, res) => {
    try {
        // Check if user already exists
        const existingUser = await User.findOne({ firebaseUid: req.firebaseUser.uid });
        if (existingUser) {
            return res.json({ user: existingUser, message: "User already exists" });
        }

        const { name, phone, role, collegeName, userType, businessName, businessAddress } = req.body;

        const newUser = new User({
            firebaseUid: req.firebaseUser.uid,
            name: name || req.firebaseUser.name || "User",
            email: req.firebaseUser.email,
            phone,
            profileImage: req.firebaseUser.picture || "",
            role: role || "student",
            collegeName,
            userType,
            businessName,
            businessAddress,
            // Owners start as unverified
            verificationStatus: role === "owner" ? "pending" : "none",
        });

        await newUser.save();
        res.status(201).json({ user: newUser, message: "Profile created successfully" });
    } catch (error) {
        console.error("Register error:", error);
        res.status(500).json({ error: error.message });
    }
});

// GET /api/auth/me — Get current user profile
router.get("/me", verifyToken, async (req, res) => {
    try {
        const user = await User.findOne({ firebaseUid: req.firebaseUser.uid });
        if (!user) {
            return res.status(404).json({ error: "Profile not found. Please complete registration." });
        }
        res.json({ user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/auth/profile — Update user profile
router.put("/profile", verifyToken, async (req, res) => {
    try {
        const user = await User.findOne({ firebaseUid: req.firebaseUser.uid });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const { name, phone, collegeName, userType, businessName, businessAddress, paymentInfo } = req.body;
        if (name) user.name = name;
        if (phone) user.phone = phone;
        if (collegeName) user.collegeName = collegeName;
        if (userType) user.userType = userType;
        if (businessName) user.businessName = businessName;
        if (businessAddress) user.businessAddress = businessAddress;

        // Owner payment info
        if (paymentInfo && user.role === "owner") {
            user.paymentInfo = {
                ...user.paymentInfo?.toObject?.() || {},
                ...paymentInfo,
            };
        }

        await user.save();
        res.json({ user, message: "Profile updated successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/auth/profile/qr-code — Owner uploads payment QR code image
router.put("/profile/qr-code", verifyToken, qrUpload.single("qrCodeImage"), async (req, res) => {
    try {
        const user = await User.findOne({ firebaseUid: req.firebaseUser.uid });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        if (user.role !== "owner") {
            return res.status(403).json({ error: "Only owners can upload QR codes" });
        }
        if (!req.file) {
            return res.status(400).json({ error: "No QR code image provided" });
        }

        // Save Cloudinary URL to paymentInfo
        if (!user.paymentInfo) {
            user.paymentInfo = {};
        }
        user.paymentInfo.qrCodeImage = req.file.path;
        user.markModified("paymentInfo");
        await user.save();

        res.json({ user, qrCodeUrl: req.file.path, message: "QR code uploaded successfully" });
    } catch (error) {
        console.error("QR upload error:", error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

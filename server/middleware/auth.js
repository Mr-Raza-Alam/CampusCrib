// Authentication middleware — verifies Firebase token from React client
const admin = require("../config/firebase");
const User = require("../models/User");

// Verify Firebase Auth token and attach user to req
const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "No authentication token provided" });
        }

        const token = authHeader.split("Bearer ")[1];
        const decodedToken = await admin.auth().verifyIdToken(token);

        // Find user in our database
        const user = await User.findOne({ firebaseUid: decodedToken.uid });

        if (!user) {
            // User exists in Firebase but not in our DB — attach basic info
            req.firebaseUser = decodedToken;
            req.user = null;
        } else {
            req.user = user;
            req.firebaseUser = decodedToken;
        }

        next();
    } catch (error) {
        console.error("Auth error:", error.message);
        return res.status(401).json({ error: "Invalid or expired token" });
    }
};

// Ensure user is authenticated AND exists in our database
const isAuthenticated = async (req, res, next) => {
    await verifyToken(req, res, () => {
        if (!req.user) {
            return res.status(401).json({ error: "Please complete your profile first" });
        }
        next();
    });
};

// Role-based access control
const isAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
    }
    next();
};

const isOwner = (req, res, next) => {
    if (!req.user || req.user.role !== "owner") {
        return res.status(403).json({ error: "Property owner access required" });
    }
    next();
};

const isVerifiedOwner = (req, res, next) => {
    if (!req.user || req.user.role !== "owner" || !req.user.isVerified) {
        return res.status(403).json({ error: "Verified property owner access required" });
    }
    next();
};

const isOwnerOrAdmin = (req, res, next) => {
    if (!req.user || (req.user.role !== "owner" && req.user.role !== "admin")) {
        return res.status(403).json({ error: "Owner or Admin access required" });
    }
    next();
};

module.exports = {
    verifyToken,
    isAuthenticated,
    isAdmin,
    isOwner,
    isVerifiedOwner,
    isOwnerOrAdmin,
};

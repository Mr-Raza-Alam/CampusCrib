// User model — supports 3 roles: student, owner, admin
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
    firebaseUid: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true,
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        trim: true,
    },
    phone: {
        type: String,
        match: [/^[6-9]\d{9}$/, "Please enter a valid 10-digit mobile number"],
        sparse: true,
    },
    role: {
        type: String,
        enum: ["student", "owner", "admin"],
        default: "student",
    },
    profileImage: {
        type: String,
        default: "",
    },
    // Owner-specific fields
    isVerified: {
        type: Boolean,
        default: false, // Admin must verify owners before they can list
    },
    verificationStatus: {
        type: String,
        enum: ["none", "pending", "approved", "rejected"],
        default: "none",
    },
    businessName: {
        type: String,
        trim: true,
    },
    businessAddress: {
        type: String,
        trim: true,
    },
    // Student-specific fields
    collegeName: {
        type: String,
        trim: true,
    },
    userType: {
        type: String,
        enum: ["student", "parent", "faculty", "other"],
        default: "student",
    },
}, {
    timestamps: true, // adds createdAt and updatedAt automatically
});

module.exports = mongoose.model("User", userSchema);

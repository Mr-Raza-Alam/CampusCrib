// Listing model — rooms/PGs listed by verified owners
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./Review.js");

const listingSchema = new Schema({
    title: {
        type: String,
        required: [true, "Title is required"],
        trim: true,
    },
    description: {
        type: String,
        required: [true, "Description is required"],
    },
    image: {
        url: String,
        filename: String,
    },
    price: {
        type: Number,
        required: [true, "Price is required"],
        min: [0, "Price cannot be negative"],
    },
    location: {
        type: String,
        required: [true, "Location is required"],
    },
    country: {
        type: String,
        default: "India",
    },
    // New fields for college accommodation
    roomType: {
        type: String,
        enum: ["Single", "Shared", "PG", "Apartment", "Hostel", "single", "shared", "pg", "apartment", "hostel"],
        default: "Single",
    },
    amenities: [{
        type: String,
    }],
    maxOccupancy: {
        type: Number,
        default: 1,
        min: 1,
    },
    availableRooms: {
        type: Number,
        default: 1,
        min: 0,
    },
    status: {
        type: String,
        enum: ["available", "booked", "full", "inactive"],
        default: "available",
    },
    approvalStatus: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending", // Admin must approve before listing goes live
    },
    nearbyCollege: {
        type: String,
        trim: true,
    },
    distanceFromCollege: {
        type: String, // e.g., "500m", "1.2km"
    },
    // Property rules & deposit (transparency for students)
    securityDeposit: {
        type: Number,
        default: 0,
        min: 0,
    },
    refundPolicy: {
        type: String,
        default: "No refund policy specified",
    },
    propertyRules: [{
        type: String,
    }],
    customRules: {
        type: String,
        trim: true,
    },
    // Relations
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: "Review",
    }],
    // Geolocation for map
    geometry: {
        type: {
            type: String,
            enum: ["Point"],
            required: true,
        },
        coordinates: {
            type: [Number],
            required: true,
        },
    },
}, {
    timestamps: true,
});

// Delete all reviews when a listing is deleted
listingSchema.post("findOneAndDelete", async (listing) => {
    if (listing) {
        await Review.deleteMany({ _id: { $in: listing.reviews } });
    }
});

module.exports = mongoose.model("Listing", listingSchema);

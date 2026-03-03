// Booking model — students send booking requests to room owners
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
    listing: {
        type: Schema.Types.ObjectId,
        ref: "Listing",
        required: true,
    },
    student: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    status: {
        type: String,
        enum: ["pending", "accepted", "rejected", "cancelled"],
        default: "pending",
    },
    message: {
        type: String,
        trim: true, // Optional message from student to owner
    },
    moveInDate: {
        type: Date,
    },
    duration: {
        type: String, // e.g., "6 months", "1 year"
        trim: true,
    },
    contactPhone: {
        type: String,
        required: [true, "Contact number is required for booking"],
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model("Booking", bookingSchema);

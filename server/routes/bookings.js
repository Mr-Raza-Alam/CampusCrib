// Booking routes — students send booking requests to owners
const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");
const Listing = require("../models/Listing");
const { isAuthenticated, isOwnerOrAdmin } = require("../middleware/auth");
const { validateBooking } = require("../middleware/validate");

// POST /api/bookings/:listingId — Student sends booking request
router.post("/:listingId", isAuthenticated, validateBooking, async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.listingId);
        if (!listing) {
            return res.status(404).json({ error: "Listing not found" });
        }
        if (listing.status === "full") {
            return res.status(400).json({ error: "This room is fully booked" });
        }

        const booking = new Booking({
            listing: listing._id,
            student: req.user._id,
            owner: listing.owner,
            message: req.body.message,
            moveInDate: req.body.moveInDate,
            duration: req.body.duration,
            contactPhone: req.body.contactPhone,
        });

        await booking.save();
        res.status(201).json({ booking, message: "Booking request sent! The owner will respond soon." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/bookings/my — Get current user's bookings (student or owner)
router.get("/my", isAuthenticated, async (req, res) => {
    try {
        let bookings;
        if (req.user.role === "owner") {
            // Owner sees booking requests for their listings
            bookings = await Booking.find({ owner: req.user._id })
                .populate("student", "name email phone profileImage collegeName")
                .populate({
                    path: "listing",
                    select: "title image price location securityDeposit refundPolicy propertyRules customRules",
                })
                .sort({ createdAt: -1 });
        } else {
            // Student sees their own booking requests
            bookings = await Booking.find({ student: req.user._id })
                .populate("owner", "name email phone businessName paymentInfo")
                .populate({
                    path: "listing",
                    select: "title image price location securityDeposit refundPolicy propertyRules customRules",
                })
                .sort({ createdAt: -1 });
        }

        res.json({ bookings, count: bookings.length });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/bookings/:id/respond — Owner accepts/rejects booking OR confirms payment
router.put("/:id/respond", isAuthenticated, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ error: "Booking not found" });
        }

        if (booking.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: "Only the property owner can respond to this booking" });
        }

        const { status } = req.body;
        if (!["accepted", "rejected", "confirmed"].includes(status)) {
            return res.status(400).json({ error: "Status must be 'accepted', 'rejected', or 'confirmed'" });
        }

        // Only allow confirming after payment_confirmed
        if (status === "confirmed" && booking.status !== "payment_confirmed") {
            return res.status(400).json({ error: "Cannot confirm booking until student confirms payment" });
        }

        booking.status = status;
        await booking.save();
        res.json({ booking, message: `Booking ${status} successfully` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/bookings/:id/confirm-payment — Student confirms they have paid
router.put("/:id/confirm-payment", isAuthenticated, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ error: "Booking not found" });
        }

        if (booking.student.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: "Only the booking student can confirm payment" });
        }

        if (booking.status !== "accepted") {
            return res.status(400).json({ error: "Booking must be accepted before confirming payment" });
        }

        booking.status = "payment_confirmed";
        booking.paymentConfirmedAt = new Date();
        await booking.save();
        res.json({ booking, message: "Payment confirmation sent to owner!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/bookings/:id — Student or Owner cancels/deletes their booking
router.delete("/:id", isAuthenticated, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ error: "Booking not found" });
        }

        // Check if the current user is either the student who made it or the owner who received it
        if (booking.student.toString() !== req.user._id.toString() && booking.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: "Only the student or the owner can delete this booking" });
        }

        await booking.deleteOne();
        res.json({ message: "Booking deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

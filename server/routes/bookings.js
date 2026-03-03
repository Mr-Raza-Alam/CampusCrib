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
                .populate("listing", "title image price location")
                .sort({ createdAt: -1 });
        } else {
            // Student sees their own booking requests
            bookings = await Booking.find({ student: req.user._id })
                .populate("owner", "name phone businessName")
                .populate("listing", "title image price location")
                .sort({ createdAt: -1 });
        }

        res.json({ bookings, count: bookings.length });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/bookings/:id/respond — Owner accepts/rejects booking
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
        if (!["accepted", "rejected"].includes(status)) {
            return res.status(400).json({ error: "Status must be 'accepted' or 'rejected'" });
        }

        booking.status = status;
        await booking.save();
        res.json({ booking, message: `Booking ${status} successfully` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

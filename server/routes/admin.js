// Admin routes — admin dashboard API endpoints
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Listing = require("../models/Listing");
const Review = require("../models/Review");
const Booking = require("../models/Booking");
const { isAuthenticated, isAdmin } = require("../middleware/auth");

// All admin routes require authentication + admin role
router.use(isAuthenticated, isAdmin);

// GET /api/admin/stats — Dashboard overview statistics
router.get("/stats", async (req, res) => {
    try {
        const [totalUsers, totalOwners, totalStudents, totalListings, pendingListings, totalBookings, totalReviews, pendingOwners] =
            await Promise.all([
                User.countDocuments(),
                User.countDocuments({ role: "owner" }),
                User.countDocuments({ role: "student" }),
                Listing.countDocuments(),
                Listing.countDocuments({ approvalStatus: "pending" }),
                Booking.countDocuments(),
                Review.countDocuments(),
                User.countDocuments({ role: "owner", verificationStatus: "pending" }),
            ]);

        res.json({
            stats: {
                totalUsers, totalOwners, totalStudents,
                totalListings, pendingListings,
                totalBookings, totalReviews, pendingOwners,
            },
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/admin/users — Get all users
router.get("/users", async (req, res) => {
    try {
        const { role, search } = req.query;
        const filter = {};
        if (role) filter.role = role;
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
            ];
        }

        const users = await User.find(filter).sort({ createdAt: -1 });
        res.json({ users, count: users.length });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/admin/users/:id/verify — Verify/reject room owner
router.put("/users/:id/verify", async (req, res) => {
    try {
        const { status } = req.body; // "approved" or "rejected"
        if (!["approved", "rejected"].includes(status)) {
            return res.status(400).json({ error: "Status must be 'approved' or 'rejected'" });
        }

        const user = await User.findById(req.params.id);
        if (!user || user.role !== "owner") {
            return res.status(404).json({ error: "Owner not found" });
        }

        user.verificationStatus = status;
        user.isVerified = status === "approved";
        await user.save();

        res.json({ user, message: `Owner ${status} successfully` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/admin/listings — Get all listings (including pending)
router.get("/listings", async (req, res) => {
    try {
        const { approvalStatus, search } = req.query;
        const filter = {};
        if (approvalStatus) filter.approvalStatus = approvalStatus;
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: "i" } },
                { location: { $regex: search, $options: "i" } },
            ];
        }

        const listings = await Listing.find(filter)
            .populate("owner", "name email businessName")
            .sort({ createdAt: -1 });

        res.json({ listings, count: listings.length });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/admin/listings/:id/approve — Approve/reject listing
router.put("/listings/:id/approve", async (req, res) => {
    try {
        const { status } = req.body;
        if (!["approved", "rejected"].includes(status)) {
            return res.status(400).json({ error: "Status must be 'approved' or 'rejected'" });
        }

        const listing = await Listing.findByIdAndUpdate(
            req.params.id,
            { approvalStatus: status },
            { new: true }
        );

        if (!listing) {
            return res.status(404).json({ error: "Listing not found" });
        }

        res.json({ listing, message: `Listing ${status} successfully` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/admin/listings/:id — Delete any listing
router.delete("/listings/:id", async (req, res) => {
    try {
        const listing = await Listing.findByIdAndDelete(req.params.id);
        if (!listing) {
            return res.status(404).json({ error: "Listing not found" });
        }
        res.json({ message: "Listing deleted by admin" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/admin/reviews/:id — Delete any review
router.delete("/reviews/:id", async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) {
            return res.status(404).json({ error: "Review not found" });
        }

        await Listing.findByIdAndUpdate(review.listing, {
            $pull: { reviews: review._id },
        });
        await Review.findByIdAndDelete(req.params.id);

        res.json({ message: "Review deleted by admin" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

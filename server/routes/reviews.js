// Review routes
const express = require("express");
const router = express.Router();
const Review = require("../models/Review");
const Listing = require("../models/Listing");
const { isAuthenticated } = require("../middleware/auth");
const { validateReview } = require("../middleware/validate");

// POST /api/reviews/:listingId — Add review to a listing
router.post("/:listingId", isAuthenticated, validateReview, async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.listingId);
        if (!listing) {
            return res.status(404).json({ error: "Listing not found" });
        }

        const review = new Review({
            comment: req.body.comment,
            rating: req.body.rating,
            listing: listing._id,
            author: req.user._id,
        });

        await review.save();
        listing.reviews.push(review._id);
        await listing.save();

        // Populate author before sending back
        await review.populate("author", "name profileImage");

        res.status(201).json({ review, message: "Review added successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/reviews/:reviewId — Delete review (author or admin)
router.delete("/:reviewId", isAuthenticated, async (req, res) => {
    try {
        const review = await Review.findById(req.params.reviewId);
        if (!review) {
            return res.status(404).json({ error: "Review not found" });
        }

        if (review.author.toString() !== req.user._id.toString() && req.user.role !== "admin") {
            return res.status(403).json({ error: "You can only delete your own reviews" });
        }

        // Remove review reference from listing
        await Listing.findByIdAndUpdate(review.listing, {
            $pull: { reviews: review._id },
        });

        await Review.findByIdAndDelete(req.params.reviewId);
        res.json({ message: "Review deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

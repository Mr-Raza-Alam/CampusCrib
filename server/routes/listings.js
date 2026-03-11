// Listing routes — CRUD operations for room listings
const express = require("express");
const router = express.Router();
const Listing = require("../models/Listing");
const { isAuthenticated, isOwner, isVerifiedOwner } = require("../middleware/auth");
const { validateListing } = require("../middleware/validate");
const { upload } = require("../config/cloudinary");

// GET /api/listings — Get all approved listings (public)
router.get("/", async (req, res) => {
    try {
        const { search, roomType, minPrice, maxPrice, amenities, sort } = req.query;

        // Build filter — only show approved & available listings to public
        const filter = { approvalStatus: "approved", status: { $ne: "inactive" } };

        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: "i" } },
                { location: { $regex: search, $options: "i" } },
                { nearbyCollege: { $regex: search, $options: "i" } },
                { country: { $regex: search, $options: "i" } },
            ];
        }
        if (roomType) filter.roomType = roomType;
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }
        if (amenities) {
            const amenityList = amenities.split(",");
            filter.amenities = { $all: amenityList };
        }

        // Sort options
        let sortOption = { createdAt: -1 }; // default: newest
        if (sort === "price_asc") sortOption = { price: 1 };
        else if (sort === "price_desc") sortOption = { price: -1 };

        const listings = await Listing.find(filter)
            .populate("owner", "name profileImage businessName")
            .sort(sortOption);

        res.json({ listings, count: listings.length });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/listings/my — Get current owner's listings (auth required)
router.get("/my", isAuthenticated, async (req, res) => {
    try {
        const listings = await Listing.find({ owner: req.user._id })
            .sort({ createdAt: -1 });

        res.json({ listings, count: listings.length });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/listings/:id — Get single listing (public)
router.get("/:id", async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id)
            .populate("owner", "name email phone profileImage businessName")
            .populate({
                path: "reviews",
                populate: { path: "author", select: "name profileImage" },
            });

        if (!listing) {
            return res.status(404).json({ error: "Listing not found" });
        }
        res.json({ listing });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/listings — Create new listing (verified owner only, goes live immediately)
router.post("/", isAuthenticated, isVerifiedOwner, (req, res, next) => {
    upload.single("image")(req, res, (err) => {
        if (err) {
            console.error("Multer/Cloudinary upload error:", err);
            return res.status(400).json({ error: "Image upload failed: " + err.message });
        }
        next();
    });
}, validateListing, async (req, res) => {
    try {
        const newListing = new Listing({
            ...req.body,
            owner: req.user._id,
            approvalStatus: "approved", // Verified owners' listings go live immediately
            geometry: {
                type: "Point",
                coordinates: req.body.coordinates
                    ? JSON.parse(req.body.coordinates)
                    : [78.9629, 20.5937], // Default: India center
            },
        });

        if (req.file) {
            newListing.image = {
                url: req.file.path,
                filename: req.file.filename,
            };
        }

        await newListing.save();
        res.status(201).json({ listing: newListing, message: "Listing created! Waiting for admin approval." });
    } catch (error) {
        console.error("Create listing error:", error.name, error.message);
        if (error.errors) {
            console.error("Validation errors:", Object.keys(error.errors).map(k => `${k}: ${error.errors[k].message}`));
        }
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/listings/:id — Update listing (owner of this listing only)
router.put("/:id", isAuthenticated, upload.single("image"), async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id);
        if (!listing) {
            return res.status(404).json({ error: "Listing not found" });
        }

        // Only the owner or admin can update
        if (listing.owner.toString() !== req.user._id.toString() && req.user.role !== "admin") {
            return res.status(403).json({ error: "You don't have permission to edit this listing" });
        }

        const updates = { ...req.body };
        if (req.file) {
            updates.image = { url: req.file.path, filename: req.file.filename };
        }
        if (req.body.coordinates) {
            updates.geometry = { type: "Point", coordinates: JSON.parse(req.body.coordinates) };
        }

        const updatedListing = await Listing.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
        res.json({ listing: updatedListing, message: "Listing updated successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/listings/:id — Delete listing (owner or admin)
router.delete("/:id", isAuthenticated, async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id);
        if (!listing) {
            return res.status(404).json({ error: "Listing not found" });
        }

        if (listing.owner.toString() !== req.user._id.toString() && req.user.role !== "admin") {
            return res.status(403).json({ error: "You don't have permission to delete this listing" });
        }

        await Listing.findByIdAndDelete(req.params.id);
        res.json({ message: "Listing deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

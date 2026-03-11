// Joi validation schemas
const Joi = require("joi");

const listingSchema = Joi.object({
    title: Joi.string().required().min(3).max(100),
    description: Joi.string().required().min(10).max(2000),
    price: Joi.number().required().min(0),
    location: Joi.string().required(),
    country: Joi.string().default("India"),
    roomType: Joi.string().valid("Single", "Shared", "PG", "Apartment", "Hostel", "single", "shared", "pg", "apartment", "hostel"),
    amenities: Joi.alternatives().try(
        Joi.array().items(Joi.string()),
        Joi.string()
    ),
    maxOccupancy: Joi.number().min(1).default(1),
    availableRooms: Joi.number().min(0).default(1),
    nearbyCollege: Joi.string().allow(""),
    distanceFromCollege: Joi.string().allow(""),
    securityDeposit: Joi.number().min(0).default(0),
    refundPolicy: Joi.string().allow(""),
    propertyRules: Joi.alternatives().try(
        Joi.array().items(Joi.string()),
        Joi.string()
    ),
    customRules: Joi.string().allow(""),
}).unknown(true);

const reviewSchema = Joi.object({
    comment: Joi.string().required().min(3).max(500),
    rating: Joi.number().required().min(1).max(5),
});

const bookingSchema = Joi.object({
    message: Joi.string().allow("").max(500),
    moveInDate: Joi.date().allow(null, ""),
    duration: Joi.string().allow(""),
    contactPhone: Joi.string().allow("").pattern(/^[6-9]\d{9}$/),
}).unknown(true);

// Validation middleware factory
const validate = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, { abortEarly: false, allowUnknown: true });
        if (error) {
            const messages = error.details.map((el) => el.message);
            return res.status(400).json({ error: "Validation failed", details: messages });
        }
        next();
    };
};

module.exports = {
    validateListing: validate(listingSchema),
    validateReview: validate(reviewSchema),
    validateBooking: validate(bookingSchema),
    listingSchema,
    reviewSchema,
    bookingSchema,
};

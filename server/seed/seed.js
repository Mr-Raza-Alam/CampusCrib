// Seed script — populates CampusCrib database with sample data
require("dotenv").config();
const mongoose = require("mongoose");
const Listing = require("../models/Listing");
const User = require("../models/User");
const Review = require("../models/Review");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/campuscrib";

const sampleListings = [
    {
        title: "Sunny Single Room Near IIT Delhi",
        description: "Bright, fully furnished single room with attached bathroom. 5-minute walk from IIT Delhi main gate. Includes study table, wardrobe, and high-speed WiFi. Ideal for students who prefer privacy.",
        price: 7000,
        location: "Hauz Khas, New Delhi",
        country: "India",
        roomType: "single",
        amenities: ["wifi", "furnished", "power_backup", "water"],
        maxOccupancy: 1,
        availableRooms: 3,
        nearbyCollege: "IIT Delhi",
        distanceFromCollege: "500m",
        image: {
            url: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800",
            filename: "seed_room_1",
        },
        geometry: { type: "Point", coordinates: [77.1926, 28.5459] },
    },
    {
        title: "Boys PG With Home-Cooked Meals",
        description: "Comfortable PG accommodation with 3 home-cooked meals daily. Shared rooms (2 per room), common study area, and 24/7 water supply. Perfect for first-year students.",
        price: 9500,
        location: "Kamla Nagar, Delhi",
        country: "India",
        roomType: "pg",
        amenities: ["wifi", "food", "laundry", "water", "security"],
        maxOccupancy: 2,
        availableRooms: 5,
        nearbyCollege: "Delhi University",
        distanceFromCollege: "1.2km",
        image: {
            url: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800",
            filename: "seed_room_2",
        },
        geometry: { type: "Point", coordinates: [77.2065, 28.6862] },
    },
    {
        title: "AC Shared Room - Girls Only",
        description: "Air-conditioned shared room for female students. Vegetarian meals, laundry service, and CCTV security. Walking distance from Jamia Millia Islamia campus.",
        price: 8500,
        location: "Okhla, New Delhi",
        country: "India",
        roomType: "shared",
        amenities: ["wifi", "ac", "food", "laundry", "security", "water"],
        maxOccupancy: 3,
        availableRooms: 2,
        nearbyCollege: "Jamia Millia Islamia",
        distanceFromCollege: "800m",
        image: {
            url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800",
            filename: "seed_room_3",
        },
        geometry: { type: "Point", coordinates: [77.2807, 28.5613] },
    },
    {
        title: "Budget-Friendly Room Near NIT Patna",
        description: "Affordable single room suitable for NIT students. Basic furnishing with bed, table, and fan. Shared kitchen and bathroom. Very close to campus.",
        price: 3500,
        location: "Ashok Rajpath, Patna",
        country: "India",
        roomType: "single",
        amenities: ["wifi", "water"],
        maxOccupancy: 1,
        availableRooms: 4,
        nearbyCollege: "NIT Patna",
        distanceFromCollege: "300m",
        image: {
            url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800",
            filename: "seed_room_4",
        },
        geometry: { type: "Point", coordinates: [85.1737, 25.6207] },
    },
    {
        title: "Premium Studio Apartment - BHU",
        description: "Fully independent studio apartment with kitchenette. AC, attached bathroom, balcony with garden view. 10-minute auto ride from BHU campus. Best for senior students or research scholars.",
        price: 12000,
        location: "Lanka, Varanasi",
        country: "India",
        roomType: "apartment",
        amenities: ["wifi", "ac", "furnished", "power_backup", "water", "parking"],
        maxOccupancy: 2,
        availableRooms: 1,
        nearbyCollege: "Banaras Hindu University",
        distanceFromCollege: "2km",
        image: {
            url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
            filename: "seed_room_5",
        },
        geometry: { type: "Point", coordinates: [83.0068, 25.2677] },
    },
    {
        title: "Cozy PG Near BITS Pilani - Goa Campus",
        description: "Peaceful PG in a residential area near BITS Goa. Includes breakfast and dinner, WiFi, and weekly room cleaning. Close to beach too!",
        price: 11000,
        location: "Zuarinagar, Goa",
        country: "India",
        roomType: "pg",
        amenities: ["wifi", "food", "laundry", "furnished"],
        maxOccupancy: 2,
        availableRooms: 3,
        nearbyCollege: "BITS Pilani - Goa Campus",
        distanceFromCollege: "1.5km",
        image: {
            url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
            filename: "seed_room_6",
        },
        geometry: { type: "Point", coordinates: [73.8835, 15.3909] },
    },
    {
        title: "Furnished Room With Gym Access",
        description: "Modern furnished room in a residential complex with gym and parking. 24/7 power backup. Near SRM University campus. Ideal for fitness-loving students.",
        price: 8000,
        location: "Kattankulathur, Chennai",
        country: "India",
        roomType: "single",
        amenities: ["wifi", "ac", "furnished", "gym", "parking", "power_backup", "security"],
        maxOccupancy: 1,
        availableRooms: 2,
        nearbyCollege: "SRM University",
        distanceFromCollege: "1km",
        image: {
            url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800",
            filename: "seed_room_7",
        },
        geometry: { type: "Point", coordinates: [80.0428, 12.8231] },
    },
    {
        title: "Hostel-Style Shared Room - VIT Vellore",
        description: "Affordable hostel-style accommodation. 4-sharing room with bunk beds, common bathrooms, and mess facility. Best for budget-conscious students.",
        price: 4000,
        location: "Katpadi, Vellore",
        country: "India",
        roomType: "hostel",
        amenities: ["wifi", "food", "water", "security"],
        maxOccupancy: 4,
        availableRooms: 8,
        nearbyCollege: "VIT Vellore",
        distanceFromCollege: "600m",
        image: {
            url: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800",
            filename: "seed_room_8",
        },
        geometry: { type: "Point", coordinates: [79.1553, 12.9692] },
    },
    {
        title: "Spacious 2BHK Flat for Sharing",
        description: "Spacious 2BHK apartment ideal for 3-4 students to share. Fully furnished with kitchen, washing machine, and balcony. Near IIT Bombay campus.",
        price: 15000,
        location: "Powai, Mumbai",
        country: "India",
        roomType: "apartment",
        amenities: ["wifi", "ac", "furnished", "laundry", "parking", "power_backup"],
        maxOccupancy: 4,
        availableRooms: 1,
        nearbyCollege: "IIT Bombay",
        distanceFromCollege: "1.8km",
        image: {
            url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
            filename: "seed_room_9",
        },
        geometry: { type: "Point", coordinates: [72.9052, 19.1334] },
    },
    {
        title: "Girls PG With Homely Atmosphere",
        description: "Safe and hygienic girls-only PG run by a family. Home-cooked veg meals, curfew timing at 9 PM, and CCTV monitored. Parents can visit anytime. Near Jadavpur University.",
        price: 7500,
        location: "Jadavpur, Kolkata",
        country: "India",
        roomType: "pg",
        amenities: ["wifi", "food", "water", "security", "laundry"],
        maxOccupancy: 2,
        availableRooms: 3,
        nearbyCollege: "Jadavpur University",
        distanceFromCollege: "700m",
        image: {
            url: "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800",
            filename: "seed_room_10",
        },
        geometry: { type: "Point", coordinates: [88.3697, 22.4966] },
    },
    {
        title: "Modern Room Near IIIT Hyderabad",
        description: "Contemporary furnished room with AC, high-speed internet, and power backup. Gated community with 24/7 security. 10-minute walk to IIIT-H campus.",
        price: 9000,
        location: "Gachibowli, Hyderabad",
        country: "India",
        roomType: "single",
        amenities: ["wifi", "ac", "furnished", "power_backup", "security", "water"],
        maxOccupancy: 1,
        availableRooms: 2,
        nearbyCollege: "IIIT Hyderabad",
        distanceFromCollege: "900m",
        image: {
            url: "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=800",
            filename: "seed_room_11",
        },
        geometry: { type: "Point", coordinates: [78.3498, 17.4451] },
    },
    {
        title: "Budget PG Near NIT Rourkela",
        description: "Simple and clean PG accommodation for NIT students. Basic meals included. Walking distance from campus gate. Good for students on a tight budget.",
        price: 4500,
        location: "Sector 1, Rourkela",
        country: "India",
        roomType: "pg",
        amenities: ["wifi", "food", "water"],
        maxOccupancy: 3,
        availableRooms: 6,
        nearbyCollege: "NIT Rourkela",
        distanceFromCollege: "400m",
        image: {
            url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800",
            filename: "seed_room_12",
        },
        geometry: { type: "Point", coordinates: [84.8536, 22.2525] },
    },
];

const seedDB = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB for seeding...");

        // Clear existing data
        await Listing.deleteMany({});
        await User.deleteMany({});
        await Review.deleteMany({});
        console.log("Cleared existing data.");

        // Create admin user
        const adminUser = await User.create({
            firebaseUid: "admin_seed_001",
            name: "CampusCrib Admin",
            email: "admin@campuscrib.com",
            role: "admin",
            isVerified: true,
            verificationStatus: "approved",
        });
        console.log("Created admin user.");

        // Create sample owner
        const ownerUser = await User.create({
            firebaseUid: "owner_seed_001",
            name: "Rajesh Kumar Properties",
            email: "rajesh@example.com",
            phone: "9876543210",
            role: "owner",
            isVerified: true,
            verificationStatus: "approved",
            businessName: "Kumar Room Solutions",
            businessAddress: "Kamla Nagar, Delhi",
        });
        console.log("Created sample owner.");

        // Create sample student
        const studentUser = await User.create({
            firebaseUid: "student_seed_001",
            name: "Ankit Sharma",
            email: "ankit@student.com",
            phone: "8765432109",
            role: "student",
            collegeName: "IIT Delhi",
            userType: "student",
        });
        console.log("Created sample student.");

        // Insert listings with owner reference & approved status
        const listings = sampleListings.map((listing) => ({
            ...listing,
            owner: ownerUser._id,
            approvalStatus: "approved",
            status: "available",
        }));

        const insertedListings = await Listing.insertMany(listings);
        console.log(`Inserted ${insertedListings.length} listings.`);

        // Add sample reviews to first 3 listings
        const sampleReviews = [
            { comment: "Great room! Clean and well maintained. WiFi speed is excellent.", rating: 5 },
            { comment: "Good value for money. Owner is very cooperative and helpful.", rating: 4 },
            { comment: "Nice location, very close to campus. Food quality could be better.", rating: 3 },
        ];

        for (let i = 0; i < 3; i++) {
            const review = await Review.create({
                comment: sampleReviews[i].comment,
                rating: sampleReviews[i].rating,
                listing: insertedListings[i]._id,
                author: studentUser._id,
            });
            insertedListings[i].reviews.push(review._id);
            await insertedListings[i].save();
        }
        console.log("Added sample reviews.");

        console.log("\nSeeding complete!");
        console.log(`  Admin:    ${adminUser.email}`);
        console.log(`  Owner:    ${ownerUser.email}`);
        console.log(`  Student:  ${studentUser.email}`);
        console.log(`  Listings: ${insertedListings.length}`);
        console.log(`  Reviews:  3`);

        mongoose.connection.close();
    } catch (error) {
        console.error("Seeding error:", error);
        mongoose.connection.close();
        process.exit(1);
    }
};

seedDB();

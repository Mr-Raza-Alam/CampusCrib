// Database connection configuration
const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        const dbUrl = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/campuscrib";
        const conn = await mongoose.connect(dbUrl);
        console.log(`MongoDB connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB connection error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;

// CampusCrib — Express API Server Entry Point
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();
const PORT = process.env.PORT || 3300;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests from any localhost port (dev) or configured CLIENT_URL (prod)
        const clientUrl = process.env.CLIENT_URL;
        if (!origin || (origin && origin.match(/^http:\/\/localhost:\d+$/)) || origin === clientUrl) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/listings", require("./routes/listings"));
app.use("/api/reviews", require("./routes/reviews"));
app.use("/api/bookings", require("./routes/bookings"));
app.use("/api/admin", require("./routes/admin"));

// Health check
app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "CampusCrib API is running" });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
});

// Error handler
app.use((err, req, res, next) => {
    console.error("Server error:", err.message);
    const status = err.status || 500;
    res.status(status).json({
        error: err.message || "Internal server error",
    });
});

app.listen(PORT, () => {
    console.log(`CampusCrib server running at http://localhost:${PORT}`);
});

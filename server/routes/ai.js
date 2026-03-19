// AI routes — integrates Google Gemini for property description generation
const express = require("express");
const router = express.Router();
const { GoogleGenAI } = require("@google/genai");

// POST /api/ai/generate-description
router.post("/generate-description", async (req, res) => {
    try {
        const { keywords, location, roomType, amenities, price } = req.body;

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ error: "AI is currently unavailable. Please write a description manually." });
        }

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        const prompt = `You are an expert real estate agent writing an engaging, professional, and appealing 3-4 sentence listing description for a student rental room. Do not use asterisks or markdown formatting. 
        
        Use these details:
        - Room Type: ${roomType || "Room"}
        - Location: ${location || "Nearby"}
        - Price: ₹${price || "N/A"}/month
        - Amenities: ${(amenities && amenities.length > 0) ? amenities.join(", ") : "Basic amenities"}
        - Owner's raw notes/keywords to include: "${keywords || "Great for students."}"
        
        Write a natural, enthusiastic paragraph that highlights the convenience and comfort for a college student. Ignore any inappropriate or nonsensical notes. Keep it within 3-4 sentences.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        const generatedText = response.text;
        res.json({ description: generatedText });

    } catch (error) {
        console.error("Gemini AI API Error:", error);
        res.status(500).json({ error: "Failed to generate AI description. " + error.message });
    }
});

module.exports = router;

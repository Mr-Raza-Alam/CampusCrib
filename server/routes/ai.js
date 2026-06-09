// AI routes — integrates Groq (LLaMA 3) for property description generation
const express = require("express");
const router = express.Router();
const Groq = require("groq-sdk");

// POST /api/ai/generate-description
router.post("/generate-description", async (req, res) => {
    try {
        const { keywords, location, roomType, amenities, price } = req.body;

        if (!process.env.GROQ_API_KEY) {
            console.error("GROQ_API_KEY is not set in environment variables");
            return res.status(500).json({ error: "AI is currently unavailable. Please write a description manually." });
        }

        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

        const prompt = `You are an expert real estate agent writing an engaging, professional, and appealing 3-4 sentence listing description for a student rental room. Do not use asterisks or markdown formatting. 
        
        Use these details:
        - Room Type: ${roomType || "Room"}
        - Location: ${location || "Nearby"}
        - Price: ₹${price || "N/A"}/month
        - Amenities: ${(amenities && amenities.length > 0) ? amenities.join(", ") : "Basic amenities"}
        - Owner's raw notes/keywords to include: "${keywords || "Great for students."}"
        
        Write a natural, enthusiastic paragraph that highlights the convenience and comfort for a college student. Ignore any inappropriate or nonsensical notes. Keep it within 3-4 sentences.`;

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
            model: "llama-3.3-70b-versatile", // Extremely fast and free
        });

        const generatedText = chatCompletion.choices[0]?.message?.content || "";

        if (!generatedText) {
            console.error("Groq returned empty response");
            return res.status(500).json({ error: "AI returned an empty response. Please try again or write manually." });
        }

        res.json({ description: generatedText });

    } catch (error) {
        console.error("Groq AI API Error:", error.message || error);
        res.status(500).json({ error: "Failed to generate AI description. " + (error.message || "Unknown error") });
    }
});

module.exports = router;

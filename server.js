const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static("public"));

app.post("/api/tts", async (req, res) => {
    try {
        const text = (req.body && req.body.text || "").trim();
        if (!text) {
            return res.status(400).json({ error: "Text is required" });
        }

        const apiKey = process.env.ELEVENLABS_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: "ELEVENLABS_API_KEY not configured" });
        }

        // Use your preferred voice here
        const voiceId = process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM"; // e.g. "Rachel"
        const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "xi-api-key": apiKey,
                "Content-Type": "application/json",
                "Accept": "audio/mpeg"
            },
            body: JSON.stringify({
                text,
                model_id: "eleven_multilingual_v2"
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("ElevenLabs error:", response.status, errorText);
            return res.status(500).json({ error: "ElevenLabs API error", details: errorText });
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        res.setHeader("Content-Type", "audio/mpeg");
        res.send(buffer);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

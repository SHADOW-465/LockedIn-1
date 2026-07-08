import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Setup JSON body parser with generous limit for base64 images
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Initialize Google GenAI if key exists
let ai: GoogleGenAI | null = null;
const apiKey = process.env.GEMINI_API_KEY;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

function getAI(): GoogleGenAI {
  if (!ai) {
    // If key is missing, throw a clear message but don't crash on start
    throw new Error(
      "GEMINI_API_KEY is not configured in the developer environment. Please set it in Settings > Secrets."
    );
  }
  return ai;
}

// ==========================================
// API Endpoints
// ==========================================

// 1. Verification Endpoint (Analyses the proof upload image)
app.post("/api/verify-proof", async (req, res) => {
  try {
    const { imageBase64, userNotes } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: "No image content provided." });
    }

    const client = getAI();
    // Prepare multi-part content
    const imagePart = {
      inlineData: {
        mimeType: "image/jpeg",
        data: imageBase64.replace(/^data:image\/\w+;base64,/, ""),
      },
    };

    const promptText = `
      You are the LOCKEDIN-X Physical Compliance and Lock Verification AI. 
      Analyze this user-uploaded photo which serves as proof that they are maintaining their commitment (self-directed chastity device, locker, or keyholder compliance).
      
      User Notes: "${userNotes || "None"}"
      
      Verify the following aspects objectively, supportively, and strictly:
      1. Image Quality (Good, Poor, or Unclear)
      2. Lock Detected (Whether a discipline lock, lockbox, padlock, physical cage, or device is visible in the shot)
      3. Position Valid (Is it properly aligned, secure, and authentic?)
      4. Time Valid (Is it genuine and freshly captured?)

      Respond strictly in JSON format matching the schema provided. Be calm, dignified, and objective.
    `;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [imagePart, { text: promptText }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            verified: { type: Type.BOOLEAN },
            confidence: { type: Type.INTEGER, description: "Confidence score out of 100" },
            lockDetected: { type: Type.BOOLEAN },
            imageQuality: { type: Type.STRING, description: "Good, Fair, or Poor" },
            positionValid: { type: Type.BOOLEAN },
            timeValid: { type: Type.BOOLEAN },
            explanation: { type: Type.STRING, description: "Calm, short summary of the verification results" },
          },
          required: ["verified", "confidence", "lockDetected", "imageQuality", "positionValid", "timeValid", "explanation"],
        },
      },
    });

    const result = JSON.parse(response.text || "{}");
    res.json(result);
  } catch (error: any) {
    console.error("Verification Error:", error);
    res.status(500).json({
      error: error.message || "Failed to analyze image verification proof.",
      verified: false,
      confidence: 0,
      lockDetected: false,
      imageQuality: "Poor",
      positionValid: false,
      timeValid: false,
      explanation: "An error occurred during verification processing: " + (error.message || ""),
    });
  }
});

// 2. Chat / Companion Endpoint
app.post("/api/ai/chat", async (req, res) => {
  try {
    const { messages, userProfile, memoryHighlights } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required." });
    }

    const client = getAI();
    
    // Construct system instruction based on user's identity and memory context
    const userName = userProfile?.name || "Arjun";
    const commitment = userProfile?.commitment || "remain locked to build self-control and focus";
    const currentStreak = userProfile?.currentStreak || 0;
    
    let systemInstruction = `
      You are the LOCKEDIN-X Companion, an elite, highly supportive, calm, and grounded AI coach.
      The user is named ${userName}. Their sacred commitment is to: "${commitment}".
      They are currently on Day ${currentStreak} of their lock session.
      
      Your style guide:
      - Tone is calm, dignified, concise, and reflecting quiet confidence.
      - NEVER judge, scold, or lecture.
      - Never invent user memories. Speak only based on the conversation and any highlights provided.
      - Support the user as an observer and chronicler of their commitment.
      
      User Memory Context:
      ${JSON.stringify(memoryHighlights || [])}
    `;

    // Process messages into Gemini format
    const chatContents = messages.map((m: any) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: chatContents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({ reply: response.text });
  } catch (error: any) {
    console.error("AI Chat Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate companion response." });
  }
});

// 3. Daily Reflection and Memoir Page Writer Endpoint
app.post("/api/ai/memoir-page", async (req, res) => {
  try {
    const { dayNumber, date, mood, journalText, difficulty, verified, lockDetails } = req.body;

    const client = getAI();

    const promptText = `
      Write today's page of the user's Living Memoir.
      Details:
      - Day Number: ${dayNumber}
      - Date: ${date}
      - Mood: ${mood} (Scale of 1-5)
      - Journal: "${journalText || "No notes written today."}"
      - Difficulty: ${difficulty}/10
      - Physical Verification: ${verified ? "Verified Compliant via Photo Proof" : "No verification photo captured today"}
      
      Generate a beautiful, narrative, autobiographical page for today's entry. 
      Requirements:
      - Written in a peaceful, elegant, highly reflective third-person or warm first-person narrative style (e.g. "Today was quieter than most...").
      - Highlight the user's growing discipline.
      - Include a suggested title for this day's story.
      - Include a short, inspirational, quiet quote customized for the user's state today.
      - Respond strictly in JSON matching the specified schema.
    `;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptText,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            story: { type: Type.STRING, description: "Elegant, flowing, paragraph narrative of the day" },
            quote: { type: Type.STRING, description: "A meaningful custom quote for the day" },
            insight: { type: Type.STRING, description: "A quiet, short annotation about their progress" },
            chapterSuggestion: { type: Type.STRING, description: "Chapter name recommendation (e.g. 'The Beginning', 'Finding Stability')" }
          },
          required: ["title", "story", "quote", "insight", "chapterSuggestion"],
        },
      },
    });

    const result = JSON.parse(response.text || "{}");
    res.json(result);
  } catch (error: any) {
    console.error("Memoir Writer Error:", error);
    res.status(500).json({
      error: error.message || "Failed to compose memoir page.",
      title: `Day ${req.body.dayNumber || 1} - Continuing the Journey`,
      story: `Today marked another step in the process of self-command. Though words may be short, the commitment remains steady. The simple act of completing this day adds another permanent brick to the foundation of your personal discipline.`,
      quote: "Discipline is the slow, deliberate work of choosing what we want most over what we want now.",
      insight: "You maintained your rhythm. Consistency is silently solidifying.",
      chapterSuggestion: "The Foundation"
    });
  }
});

// ==========================================
// Vite Integration & Static Server
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`LOCKEDIN-X Server running on port ${PORT}`);
  });
}

startServer();

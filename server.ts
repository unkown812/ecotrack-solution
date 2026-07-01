import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Body parsing with safe size limits for image uploads
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ limit: "15mb", extended: true }));

// Lazy initializer for the Gemini AI SDK client
let aiInstance: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured in the environment.");
    }
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiInstance;
}

// ----------------------------------------------------------------------
// AI API Endpoints
// ----------------------------------------------------------------------

// 1. MEAL RECOGNITION (Image Scan)
app.post("/api/gemini/scan-meal", async (req, res) => {
  const { image, mimeType } = req.body;

  if (!image || !mimeType) {
    return res.status(400).json({ error: "Missing image data or mimeType" });
  }

  // Define high-fidelity fallback responses in case the API key is missing or error occurs
  const fallbackScan = {
    foodName: "Eco Garden Salad & Warm Soup",
    type: "veg",
    co2: 0.65,
    description: "A light, plant-forward meal with organic ingredients. Producing this generates roughly 0.65 kg CO2 of carbon emissions, saving 1.2 kg compared to meat-based alternatives.",
    confidence: 0.95,
    isFallback: true
  };

  try {
    // Check if API key is configured first
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "MY_GEMINI_API_KEY") {
      console.warn("GEMINI_API_KEY is not configured. Serving local high-fidelity fallback scan response.");
      return res.json(fallbackScan);
    }

    const ai = getGeminiClient();

    const imagePart = {
      inlineData: {
        mimeType,
        data: image,
      },
    };

    const textPart = {
      text: "Analyze this image of food and identify it. Tell me if it is veg or non-veg, estimate the carbon footprint (CO2 in kg) for a reasonable standard portion, write a 1-2 sentence description detailing its core carbon impact components, and supply your scan confidence.",
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            foodName: {
              type: Type.STRING,
              description: "The name of the food item or dish detected.",
            },
            type: {
              type: Type.STRING,
              description: "Dietary type of the food: 'veg' or 'non-veg'.",
            },
            co2: {
              type: Type.NUMBER,
              description: "The estimated CO2 emission in kilograms (kg) for a standard single portion.",
            },
            description: {
              type: Type.STRING,
              description: "A short 1-2 sentence breakdown of its carbon footprint components.",
            },
            confidence: {
              type: Type.NUMBER,
              description: "The detection confidence score as a decimal (0.0 to 1.0).",
            },
          },
          required: ["foodName", "type", "co2", "description", "confidence"],
        },
      },
    });

    if (response && response.text) {
      const parsedData = JSON.parse(response.text.trim());
      return res.json({ ...parsedData, isFallback: false });
    } else {
      throw new Error("Empty response from Gemini Core.");
    }
  } catch (error: any) {
    console.error("Gemini Scan Meal Error:", error.message || error);
    // Return high-fidelity fallback response for continuous app availability
    return res.json({
      ...fallbackScan,
      errorInfo: error.message || "Request limit reached"
    });
  }
});

// 2. BEHAVIORAL INSIGHTS ENGINE
app.post("/api/gemini/insights", async (req, res) => {
  const { trips = [], energyLogs = [], meals = [] } = req.body;

  // Aggregate user stats for prompt injection
  const totalTripCo2 = trips.reduce((sum: number, t: any) => sum + (t.co2_emission || t.co2 || 0), 0);
  const totalTripDistance = trips.reduce((sum: number, t: any) => sum + (t.distance || 0), 0);

  const totalEnergyCo2 = energyLogs.reduce((sum: number, e: any) => sum + (e.co2_emission || e.co2 || 0), 0);
  const totalMealCo2 = meals.reduce((sum: number, m: any) => sum + (m.co2_emission || m.co2 || 0), 0);
  const totalCo2 = totalTripCo2 + totalEnergyCo2 + totalMealCo2;

  // Let's create realistic fallbacks based on actual user data
  const fallbackInsights = {
    summary: `You have tracked a total of ${(totalCo2).toFixed(1)} kg CO₂ overall. Great job starting your tracking! Your biggest carbon footprint category is ${totalTripCo2 > totalEnergyCo2 && totalTripCo2 > totalMealCo2
        ? "Trips & Travel"
        : totalEnergyCo2 > totalMealCo2
          ? "Home Energy Usage"
          : "Dietary Footprint"
      }. Focused reduction here will yield the highest impact.`,
    tips: [
      totalTripDistance > 0 && totalTripCo2 > 0
        ? `Commuting sustainably: Switching some vehicle trips to bus, walking, or hybrid/electric travel would save up to ${(totalTripCo2 * 0.4).toFixed(1)} kg CO2 per month.`
        : "Car pooling or riding a bike for short distances under 5km earns double EcoBucks and keeps your profile at 0g CO2.",
      totalEnergyCo2 > 0
        ? "Phantom loads count: Unplugging home chargers, appliances, and setting AC/heaters 2°C higher will lower your electricity footprint by 8-10%."
        : "Transitioning to LED light bulbs and energy-star certified appliances can shave off nearly 100kg CO2 per year.",
      totalMealCo2 > 0
        ? "Plant-based wins: Substituting animal products for high-protein legumes/veg meals just twice a week slashes food emissions by an extra 15%."
        : "Log more meals with our AI Meal Scanner to get a complete breakdown of dietary carbon impact!"
    ],
    isFallback: true
  };

  try {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "MY_GEMINI_API_KEY") {
      return res.json(fallbackInsights);
    }

    const ai = getGeminiClient();

    const statsPrompt = `
      The user's sustainability log context is:
      - Total cumulative carbon: ${totalCo2.toFixed(1)} kg CO2
      - Travel stats: ${totalTripDistance.toFixed(1)} km traveled, resulting in ${totalTripCo2.toFixed(1)} kg CO2 emissions.
      - Energy stats: ${totalEnergyCo2.toFixed(1)} kg CO2 emitted from user-logged bills.
      - Dietary stats: ${totalMealCo2.toFixed(1)} kg CO2 emitted from user-logged food.

      Generate a personalized 2-3 sentence weekly summary encouraging the user, and exactly 3 actionable behavioral tips tailored contextually to reduce their highest carbon source.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: statsPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
              description: "A warm, personal, encouraging 2-3 sentence weekly ecological progress summary.",
            },
            tips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Exactly 3 distinct, highly actionable behavioral recommendations or carbon reduction tips.",
            },
          },
          required: ["summary", "tips"],
        },
      },
    });

    if (response && response.text) {
      const parsedData = JSON.parse(response.text.trim());
      return res.json({ ...parsedData, isFallback: false });
    } else {
      throw new Error("No text response from Gemini.");
    }
  } catch (error: any) {
    console.error("Gemini Insights Error:", error.message || error);
    return res.json({
      ...fallbackInsights,
      errorInfo: error.message || "Using fallback engine"
    });
  }
});

// 3. CHATBOT (EcoBot conversational AI)
app.post("/api/gemini/chat", async (req, res) => {
  const { message, trips = [], energyLogs = [], meals = [], userName = "there" } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  const fallbackResponse = {
    response: `Hi ${userName}! I'm EcoBot. Here are some quick sustainability tips:\n\n1. **Walk or bike** for trips under 5km — zero emissions and max EcoBucks.\n2. **Switch to LED bulbs** — they use 75% less energy.\n3. **Eat more plant-based meals** — vegetarian meals have 1.5 kg CO₂ vs 4.5 kg for non-veg.\n4. **Unplug devices** — phantom power can be 10% of your bill.\n\nWhat would you like to know more about?`,
    suggestedTipId: null,
    isFallback: true,
  };

  try {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "MY_GEMINI_API_KEY") {
      return res.json(fallbackResponse);
    }

    const ai = getGeminiClient();

    const totalTripCo2 = trips.reduce((sum: number, t: any) => sum + (t.co2_emission || 0), 0);
    const totalTripDistance = trips.reduce((sum: number, t: any) => sum + (t.distance || 0), 0);
    const totalEnergyCo2 = energyLogs.reduce((sum: number, e: any) => sum + (e.co2_emission || 0), 0);
    const totalMealCo2 = meals.reduce((sum: number, m: any) => sum + (m.co2_emission || 0), 0);
    const totalCo2 = totalTripCo2 + totalEnergyCo2 + totalMealCo2;

    const contextSummary = `
User context:
- Name: ${userName}
- Total lifetime CO₂: ${totalCo2.toFixed(1)} kg
- Travel: ${totalTripDistance.toFixed(1)} km, ${totalTripCo2.toFixed(1)} kg CO₂
- Energy: ${totalEnergyCo2.toFixed(1)} kg CO₂
- Meals logged: ${meals.length} (${meals.filter((m: any) => m.type === "veg").length} veg, ${meals.filter((m: any) => m.type === "non-veg").length} non-veg)
`;

    const prompt = `${contextSummary}

The user message is: "${message}"

You are EcoBot, a friendly sustainability assistant. Respond in a warm, conversational tone.
Keep responses concise (2-4 sentences). Offer specific, actionable advice based on their data.
If they ask about emissions, use the constants: Car=0.17, Bus=0.08, Train=0.04, Walk/Bike=0 kg/km; Electricity=0.005 kg/₹, Gas=0.0025 kg/₹; Veg meal=1.5 kg, Non-veg meal=4.5 kg.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            response: {
              type: Type.STRING,
              description: "The friendly chatbot response to the user.",
            },
            suggestedTipId: {
              type: Type.STRING,
              description: "If the response includes a specific eco tip, reference its ID. Otherwise null.",
            },
          },
          required: ["response"],
        },
      },
    });

    if (response && response.text) {
      const parsed = JSON.parse(response.text.trim());
      return res.json({ ...parsed, isFallback: false });
    } else {
      throw new Error("Empty response from Gemini.");
    }
  } catch (error: any) {
    console.error("Gemini Chat Error:", error.message || error);
    return res.json(fallbackResponse);
  }
});

// ----------------------------------------------------------------------
// Vite Dev Server / Production Servings
// ----------------------------------------------------------------------
async function startServer() {
  // Serve public/static files (blog pages, robots.txt, sitemap.xml, etc.)
  const publicPath = path.join(process.cwd(), "public");
  app.use(express.static(publicPath, {
    maxAge: process.env.NODE_ENV === "production" ? "7d" : 0,
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".html")) {
        res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
      }
    },
  }));

  if (process.env.NODE_ENV !== "production") {
    // Development Mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production Mode
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath, {
      maxAge: "1y",
      immutable: true,
    }));
    // SPA fallback for app routes, but NOT for blog/* (those are static HTML)
    app.get(/^\/(?!blog\/).*$/, (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "127.0.0.1", () => {
    console.log(`MahiKosh running on http://localhost:${PORT}`);
  });
}

startServer();
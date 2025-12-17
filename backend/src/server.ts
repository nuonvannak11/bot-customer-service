import express from "express";
import middlewares from "./middleware";
import { get_env } from "./utils/util";
import { errorHandler } from "./middleware/errorHandler";
import connectDB from "./config/db";
import setUpRoutes from "./routes";
import redis from "./config/redis";

const app = express();
const port = get_env("PORT", "3100");
connectDB();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

middlewares(app);
setUpRoutes(app);



app.get('/set', async (req, res) => {
  try {
    await redis.set('site_name', 'yyyyyyy', 'EX', 3600);
    res.json({ message: 'Data saved successfully!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get('/get', async (req, res) => {
  try {
    const data = await redis.get('site_name');
    res.json({
      source: 'Redis Database',
      value: data || 'Key not found'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/test', async (req, res) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
  const lockKey = `block:${ip}`;
  const limit = 10; // Allow only 5 requests
  const timeframe = 30; // Per 60 seconds

  try {
    const currentRequests = await redis.incr(lockKey);
    if (currentRequests === 1) {
      await redis.expire(lockKey, timeframe);
    }
    if (currentRequests > limit) {
      return res.status(429).json({
        status: 'Blocked',
        message: 'Too many requests from your IP. Try again in 1 minute.',
        your_ip: ip
      });
    }
    const data = await redis.get('site_name');
    res.json({
      status: 'Success',
      requests_made: currentRequests,
      remaining: limit - currentRequests,
      source: 'Redis Database',
      value: data || 'Key not found'
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});



// import dotenv from 'dotenv';
// import { GoogleGenAI } from "@google/genai";

// dotenv.config();
// const ai = new GoogleGenAI({});

// async function runTextTest() {
//   console.log("Key Loaded (First 5 chars):", process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 5) : "Key Not Found");
//   const testPrompt = "Please confirm that the API connection is working. Respond with the phrase 'API Test Successful' and explain in one sentence why Node.js is popular.";
//   try {
//     const response = await ai.models.generateContent({
//       model: "gemini-2.5-flash",
//       contents: testPrompt,
//     });

//     console.log("--- Gemini Text Test Result ---");
//     console.log(response.text);
//     return response.text;

//   } catch (error) {
//     console.error("Gemini API Error:", error);
//     console.log("Error: Unable to connect to the Gemini API. Check your GEMINI_API_KEY.");
//     return "Error: API connection failed.";
//   }
// }

// runTextTest();
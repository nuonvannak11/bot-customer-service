import express from "express";
import middlewares from "./middleware";
import { get_env } from "./utils/util";
import { errorHandler } from "./middleware/errorHandler";
import connectDB from "./config/db";
import setUpRoutes from "./routes";

const app = express();
const port = get_env("PORT", "3100");
connectDB();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

middlewares(app);
setUpRoutes(app);

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
import axios from "axios";
import { get_env } from "../utils/util";

export async function askText(prompt: string) {
  try {
    const response = await axios.post(
      `${get_env("OPENAI_API_URL")}/chat/completions`,
      {
        model: "gpt-5",
        messages: [{ role: "user", content: prompt }],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${get_env("OPENAI_API_KEY")}`,
        },
      }
    );

    console.log(response.data.choices[0].message.content);
    return response.data.choices[0].message.content;
  } catch (error: any) {
    console.error("Error (askText):", error.response?.data || error.message);
    throw error;
  }
}

export async function analyzePhoto(imageUrl: string) {
  try {
    const response = await axios.post(
      `${get_env("OPENAI_API_URL")}/chat/completions`,
      {
        model: "gpt-5-vision",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: "Describe this image in detail." },
              { type: "image_url", image_url: imageUrl },
            ],
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${get_env("OPENAI_API_KEY")}`,
        },
      }
    );

    console.log(response.data.choices[0].message.content);
    return response.data.choices[0].message.content;
  } catch (error: any) {
    console.error("Error (analyzePhoto):", error.response?.data || error.message);
    throw error;
  }
}

export async function analyzeTextAndPhoto(prompt: string, imageUrl: string) {
  try {
    const response = await axios.post(
      `${get_env("OPENAI_API_URL")}/chat/completions`,
      {
        model: "gpt-5-vision",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: imageUrl },
            ],
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${get_env("OPENAI_API_KEY")}`,
        },
      }
    );

    console.log(response.data.choices[0].message.content);
    return response.data.choices[0].message.content;
  } catch (error: any) {
    console.error("Error (analyzeTextAndPhoto):", error.response?.data || error.message);
    throw error;
  }
}

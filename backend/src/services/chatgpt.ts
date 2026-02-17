import axios from "axios";
import { get_env } from "../utils/get_env";
import { eLog } from "../libs/lib";

class ChatGPT {
  private url: string;
  private headers: any;

  constructor() {
    this.url = get_env("OPENAI_API_URL") + "/chat/completions";
    this.headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${get_env("OPENAI_API_KEY")}`,
    };
  }

  async askText(prompt: string) {
    try {
      const response = await axios.post(
        this.url,
        {
          model: "gpt-5",
          messages: [{ role: "user", content: prompt }],
        },
        {
          headers: this.headers,
        }
      );
      return response.data.choices[0].message.content;
    } catch (error: any) {
      eLog("Error (askText):", error.response?.data || error.message);
      throw error;
    }
  }

  async analyzePhoto(imageUrl: string) {
    try {
      const response = await axios.post(
        this.url,
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
          headers: this.headers,
        }
      );
      return response.data.choices[0].message.content;
    } catch (error: any) {
      eLog("Error (analyzePhoto):", error.response?.data || error.message);
      throw error;
    }
  }

  async analyzeTextAndPhoto(prompt: string, imageUrl: string) {
    try {
      const response = await axios.post(
        this.url,
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
          headers: this.headers,
        }
      );
      return response.data.choices[0].message.content;
    } catch (error: any) {
      eLog("Error (analyzeTextAndPhoto):", error.response?.data || error.message);
      throw error;
    }
  }
}

export default ChatGPT;

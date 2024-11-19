import type { Express } from "express";
import { getMathResponse } from "./ai";

export function registerRoutes(app: Express) {
  app.post("/api/chat", async (req, res) => {
    try {
      const { message } = req.body;
      
      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      const response = await getMathResponse(message);
      res.json({ message: response });
    } catch (error) {
      console.error("Chat API error:", error);
      res.status(500).json({ error: "Failed to process request" });
    }
  });
}

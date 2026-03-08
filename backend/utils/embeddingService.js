import { GoogleGenAI } from "@google/genai";

/**
 * Generate embedding vector for text
 */
export const generateEmbedding = async (text) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const result = await ai.models.embedContent({
      model: "gemini-embedding-001",
      contents: text,
    });

    return result.embeddings[0].values;

  } catch (error) {
    console.error("Embedding generation error:", error);
    console.error("API Key loaded:", !!process.env.GEMINI_API_KEY);
    throw new Error("Failed to generate embedding");
  }
};
// Groq client (chat inference). Model defaults to llama-3.3-70b-versatile and
// can be overridden with GROQ_MODEL. Used by the RAG chat endpoint.
import Groq from "groq-sdk";

export const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

let client: Groq | null = null;

export function getGroq(): Groq {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not set (see .env.example).");
  }
  if (!client) {
    client = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return client;
}

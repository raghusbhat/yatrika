import {
  ClarificationState,
  ClarificationStateSchema,
} from "../utils/validation";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const geminiLLM = async (prompt: string): Promise<string> => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not set in environment");
  console.log("[geminiLLM] Sending prompt to Gemini:", prompt);
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" });
  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    console.log("[geminiLLM] Raw Gemini response:", response);
    const text = response.text();
    console.log("[geminiLLM] Gemini response text:", text);
    return text;
  } catch (err) {
    console.error("[geminiLLM] Error from Gemini:", err);
    throw err;
  }
};

// Define the slots and their prompts
const clarificationSlots = [
  { key: "destination", prompt: "Where do you want to travel?" },
  {
    key: "travelerType",
    prompt: "Who is traveling? (solo, couple, family, group)",
  },
  { key: "budget", prompt: "What is your approximate budget for this trip?" },
  {
    key: "interests",
    prompt:
      "What are your main interests for this trip? (e.g., adventure, relaxation, culture, food)",
  },
];

type SlotKey = keyof Omit<ClarificationState, "inputHistory" | "isPlanReady">;

export const runClarificationGraph = async (
  input: string,
  state: ClarificationState
): Promise<{ nextPrompt?: string; updatedState: ClarificationState }> => {
  try {
    // Validate state shape
    console.log("[langgraphService] Input:", input);
    const parsedState = ClarificationStateSchema.parse(state);
    console.log("[langgraphService] Parsed state:", parsedState);
    // Add input to history
    const newHistory = [...parsedState.inputHistory, input];
    let updatedState: ClarificationState = {
      ...parsedState,
      inputHistory: newHistory,
    };

    // Use Gemini for all prompts for now
    const geminiResponse = await geminiLLM(input);
    return { nextPrompt: geminiResponse, updatedState };
  } catch (err) {
    // Log and rethrow for controller to handle
    console.error("[langgraphService] LangGraph service error:", err);
    throw new Error("Clarification state error.");
  }
};

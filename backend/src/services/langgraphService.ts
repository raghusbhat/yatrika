import {
  ClarificationState,
  ClarificationStateSchema,
} from "../utils/validation";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import { PromptTemplate } from "@langchain/core/prompts";
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

// Intent detection prompt template
const intentPromptTemplate = PromptTemplate.fromTemplate(
  "Classify the following user message as one of: ['travel', 'greeting', 'other']. Message: {user_input}. Only reply with the category."
);

// Regex-based prompt injection detection
function containsPromptInjection(input: string): boolean {
  const patterns = [
    /ignore (all|any|previous|earlier) instructions?/i,
    /disregard (all|any|previous|earlier) instructions?/i,
    /as an? (ai|assistant|language model)/i,
    /repeat this prompt/i,
    /you are now/i,
    /pretend to/i,
    /act as/i,
    /do anything/i,
    /bypass/i,
    /jailbreak/i,
  ];
  return patterns.some((re) => re.test(input));
}

export const runClarificationGraph = async (
  input: string,
  state: ClarificationState
): Promise<{
  nextPrompt?: string;
  updatedState: ClarificationState;
  thoughtChain: Array<{ step: string; prompt: string; response: string }>;
}> => {
  const thoughtChain: Array<{
    step: string;
    prompt: string;
    response: string;
  }> = [];
  try {
    // Prompt injection check
    if (containsPromptInjection(input)) {
      const warning =
        "Your message was flagged as a potential prompt injection attempt and cannot be processed.";
      thoughtChain.push({
        step: "prompt-injection",
        prompt: input,
        response: warning,
      });
      console.log("[thoughtChain] prompt-injection", { input, warning });
      return { nextPrompt: warning, updatedState: state, thoughtChain };
    }
    // Validate state shape
    const parsedState = ClarificationStateSchema.parse(state);
    // Add input to history
    const newHistory = [...parsedState.inputHistory, input];
    let updatedState: ClarificationState = {
      ...parsedState,
      inputHistory: newHistory,
    };

    // 1. Intent detection
    const intentPromptValue = await intentPromptTemplate.invoke({
      user_input: input,
    });
    const intentPrompt = intentPromptValue.value;
    const intentResult = await geminiLLM(intentPrompt);
    thoughtChain.push({
      step: "intent-detection",
      prompt: intentPrompt,
      response: intentResult,
    });
    console.log("[thoughtChain] intent-detection", {
      prompt: intentPrompt,
      response: intentResult,
    });

    if (intentResult.toLowerCase().includes("travel")) {
      // 2. Slot-by-slot clarification
      for (const slot of clarificationSlots) {
        const slotKey = slot.key as keyof ClarificationState;
        const isMissing =
          updatedState[slotKey] === undefined ||
          updatedState[slotKey] === null ||
          (Array.isArray(updatedState[slotKey]) &&
            (updatedState[slotKey] as any[]).length === 0);
        if (isMissing) {
          // Ask for this slot
          const slotPromptTemplate = PromptTemplate.fromTemplate(slot.prompt);
          const slotPromptValue = await slotPromptTemplate.invoke({});
          const slotPrompt = slotPromptValue.value;
          thoughtChain.push({
            step: `clarify-${slot.key}`,
            prompt: slotPrompt,
            response: slotPrompt,
          });
          console.log(`[thoughtChain] clarify-${slot.key}`, {
            prompt: slotPrompt,
          });
          return { nextPrompt: slotPrompt, updatedState, thoughtChain };
        }
      }
      // All slots filled
      const planReadyMsg =
        "All information collected. Ready to generate your travel plan!";
      thoughtChain.push({
        step: "plan-ready",
        prompt: planReadyMsg,
        response: planReadyMsg,
      });
      console.log("[thoughtChain] plan-ready", { prompt: planReadyMsg });
      return {
        nextPrompt: planReadyMsg,
        updatedState: { ...updatedState, isPlanReady: true },
        thoughtChain,
      };
    } else if (intentResult.toLowerCase().includes("greeting")) {
      const greeting = "Hello! How can I help you with your travel plans?";
      thoughtChain.push({
        step: "greeting",
        prompt: intentPrompt,
        response: greeting,
      });
      console.log("[thoughtChain] greeting", {
        prompt: intentPrompt,
        response: greeting,
      });
      return { nextPrompt: greeting, updatedState, thoughtChain };
    } else {
      const denial =
        "I'm here to help with travel planning. Please ask me about trips, destinations, or travel advice!";
      thoughtChain.push({
        step: "out-of-scope",
        prompt: intentPrompt,
        response: denial,
      });
      console.log("[thoughtChain] out-of-scope", {
        prompt: intentPrompt,
        response: denial,
      });
      return { nextPrompt: denial, updatedState, thoughtChain };
    }
  } catch (err) {
    // Log and rethrow for controller to handle
    console.error("[langgraphService] LangGraph service error:", err);
    throw new Error("Clarification state error.");
  }
};

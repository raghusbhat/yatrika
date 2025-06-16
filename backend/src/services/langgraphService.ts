import {
  ClarificationState,
  ClarificationStateSchema,
} from "../utils/validation";

// Mock LLM function to simulate LangChain prompt (replace with real LLM later)
const mockLLM = async (prompt: string): Promise<string> => {
  // For demo, just echo the prompt
  return `MOCK RESPONSE: ${prompt}`;
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
    const parsedState = ClarificationStateSchema.parse(state);
    // Add input to history
    const newHistory = [...parsedState.inputHistory, input];
    let updatedState: ClarificationState = {
      ...parsedState,
      inputHistory: newHistory,
    };

    // Find the first missing slot
    const nextSlot = clarificationSlots.find(
      (slot) => !updatedState[slot.key as SlotKey]
    );

    if (nextSlot) {
      // Ask for the next missing slot
      const nextPrompt = nextSlot.prompt;
      return { nextPrompt, updatedState };
    } else {
      // All slots filled
      updatedState = { ...updatedState, isPlanReady: true };
      return { updatedState };
    }
  } catch (err) {
    // Log and rethrow for controller to handle
    console.error("LangGraph service error:", err);
    throw new Error("Clarification state error.");
  }
};

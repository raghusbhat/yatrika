import {
  ClarificationState,
  ClarificationStateSchema,
} from "../utils/validation";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import { PromptTemplate } from "@langchain/core/prompts";
import { TravelConversationState } from "../utils/conversationState";
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
    key: "groupType",
    prompt: "Who is traveling? (solo, couple, family, group)",
  },
  {
    key: "tripTheme",
    prompt:
      "What type of trip are you looking for? (road trip, beach holiday, spiritual escape, etc.)",
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

// Local slot extraction functions
function extractDestination(input: string): string | null {
  // Simple: if input is a single word or phrase, treat as destination
  if (/^[a-zA-Z ]+$/.test(input.trim()) && input.trim().length > 2)
    return input.trim();
  return null;
}
function extractGroupType(input: string): string | null {
  const types = ["solo", "couple", "family", "group"];
  const found = types.find((t) => input.toLowerCase().includes(t));
  return found || null;
}
function extractBudget(input: string): string | null {
  // Accept numbers/currency
  const match = input.match(
    /\d+[\d,]*(?:\s*(?:usd|inr|eur|rs|dollars?|rupees?|euros?))?/i
  );
  if (match) return match[0];
  // Accept common open/unknown budget phrases
  const openBudgetPhrases = [
    "don't know",
    "not sure",
    "not decided",
    "not yet decided",
    "unlimited",
    "open",
    "any",
    "no limit",
    "flexible",
  ];
  if (openBudgetPhrases.some((phrase) => input.toLowerCase().includes(phrase)))
    return input.trim();
  return null;
}
function extractInterests(input: string): string[] | null {
  const keywords = [
    "adventure",
    "relaxation",
    "culture",
    "food",
    "nature",
    "sports",
    "beach",
    "mountain",
    "history",
    "art",
    "shopping",
    "nightlife",
  ];
  const found = keywords.filter((k) => input.toLowerCase().includes(k));
  if (found.length > 0) return found;
  if (/^[a-zA-Z ]+$/.test(input.trim())) return [input.trim()];
  return null;
}

function isFirstUserMessage(state: ClarificationState): boolean {
  // All slots empty and inputHistory has only one entry
  return (
    (!state.destination || state.destination === "") &&
    (!state.groupType || state.groupType === "") &&
    (!state.budget || state.budget === "") &&
    (!state.interests ||
      (Array.isArray(state.interests) && state.interests.length === 0)) &&
    state.inputHistory.length <= 1
  );
}

const budgetExtractionPromptTemplate = PromptTemplate.fromTemplate(
  `A user was asked for their travel budget. Their response was: '{user_input}'.

Analyze this response and return a single, normalized string representing the budget.
- If it's a number (like '1000 dollars' or '500'), return just the number or number with currency (e.g., '1000 dollars', '500').
- If they mean 'unlimited' or 'open' (like 'zilch', 'nada', 'not worried about cost'), return 'Flexible'.
- If they mean they don't know or it's zero, return 'Not decided'.

User input: '{user_input}'
Your structured response:`
);

const multiSlotExtractionPrompt = `
Extract the following details from the user's message if present.
Return a JSON object with these exact keys:
- source
- destination
- travelDates
- duration
- groupType
- budget
- modeOfTransport
- carModel
- tripTheme
- interests
If a field is not mentioned, set it to null.

User message: "{user_input}"
`;

export async function extractSlotsWithGemini(
  userInput: string
): Promise<Partial<TravelConversationState>> {
  const prompt = multiSlotExtractionPrompt.replace("{user_input}", userInput);
  const geminiResponse = await geminiLLM(prompt);
  try {
    const slots = JSON.parse(geminiResponse);
    return slots;
  } catch (e) {
    // Handle parse error, fallback, or log
    console.error(
      "[extractSlotsWithGemini] Failed to parse Gemini response:",
      geminiResponse
    );
    return {};
  }
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

    // 1. If input is empty (form submission), do NOT call Gemini. Use state directly.
    if (!input || input.trim() === "") {
      console.log(
        "[runClarificationGraph] Path: FORM SUBMISSION (input empty)"
      );
      // Check which slots are missing in state
      const clarificationSlotsKeys = [
        "destination",
        "groupType",
        "tripTheme",
        "budget",
        "interests",
      ];
      const personalizationMsg =
        "To help me plan the perfect trip for you, I'll just need to ask a few quick questions.";
      function isFirstSlotPrompt(state: ClarificationState) {
        const slots = [
          state.destination,
          state.groupType,
          state.tripTheme,
          state.budget,
          state.interests,
        ];
        const filled = slots.filter(
          (v) =>
            v &&
            ((Array.isArray(v) && v.length > 0) ||
              (!Array.isArray(v) && v !== ""))
        ).length;
        return filled === 0;
      }
      let personalizationShown = isFirstSlotPrompt(parsedState);
      for (const slotKey of clarificationSlotsKeys) {
        const isMissing =
          updatedState[slotKey] === undefined ||
          updatedState[slotKey] === null ||
          (Array.isArray(updatedState[slotKey]) &&
            (updatedState[slotKey] as any[]).length === 0) ||
          updatedState[slotKey] === "";
        if (isMissing) {
          // Ask for this slot
          const slotPrompt =
            clarificationSlots.find((s) => s.key === slotKey)?.prompt ||
            `Please provide your ${slotKey}.`;
          const promptToShow = personalizationShown
            ? `${personalizationMsg}\n${slotPrompt}`
            : slotPrompt;
          thoughtChain.push({
            step: `clarify-${slotKey}`,
            prompt: promptToShow,
            response: promptToShow,
          });
          console.log(
            `[runClarificationGraph] Missing slot: ${slotKey}, prompting user:`,
            promptToShow
          );
          return { nextPrompt: promptToShow, updatedState, thoughtChain };
        }
        personalizationShown = false;
      }
      // All slots filled
      const planReadyMsg =
        "All information collected. Ready to generate your travel plan!";
      thoughtChain.push({
        step: "plan-ready",
        prompt: planReadyMsg,
        response: planReadyMsg,
      });
      console.log("[runClarificationGraph] All slots filled. Plan is ready.");
      console.log("[runClarificationGraph] Final state:", updatedState);
      return {
        nextPrompt: planReadyMsg,
        updatedState: { ...updatedState, isPlanReady: true },
        thoughtChain,
      };
    }

    // 2. If input is non-empty (free-form text), first call Gemini for intent detection.
    console.log("[runClarificationGraph] Path: FREE-FORM TEXT (input present)");
    // Intent detection prompt
    const intentPrompt = `Classify the following user message as one of: ['travel', 'greeting', 'other']. Message: ${input}. Only reply with the category.`;
    const intentRaw = await geminiLLM(intentPrompt);
    const intent = intentRaw.trim().toLowerCase();
    thoughtChain.push({
      step: "intent-detection",
      prompt: intentPrompt,
      response: intentRaw,
    });
    console.log(
      `[runClarificationGraph] Gemini intent detection result: '${intent}'`
    );
    if (intent !== "travel") {
      const politeMsg =
        "I specialize in planning travel. Please ask me about trips, destinations, or travel planning!";
      thoughtChain.push({
        step: "intent-rejected",
        prompt: input,
        response: politeMsg,
      });
      console.log(
        "[runClarificationGraph] Intent is not travel. Rejecting with message."
      );
      return { nextPrompt: politeMsg, updatedState, thoughtChain };
    }
    // 3. If intent is travel, call Gemini for slot extraction.
    console.log(
      "[runClarificationGraph] Intent is travel. Calling Gemini for slot extraction."
    );
    const extractedSlotsRaw = await extractSlotsWithGemini(input);
    // Convert nulls to undefined for compatibility with ClarificationState
    const extractedSlots: Record<string, any> = {};
    for (const [key, value] of Object.entries(extractedSlotsRaw)) {
      extractedSlots[key] = value === null ? undefined : value;
    }
    updatedState = { ...updatedState, ...extractedSlots };
    thoughtChain.push({
      step: "multi-slot-extraction",
      prompt: input,
      response: JSON.stringify(extractedSlots),
    });
    console.log("[runClarificationGraph] Extracted slots:", extractedSlots);

    // 4. Determine next missing slot (using clarificationSlots for order)
    const clarificationSlotsKeys = [
      "destination",
      "groupType",
      "tripTheme",
      "budget",
      "interests",
    ];
    const personalizationMsg =
      "To help me plan the perfect trip for you, I'll just need to ask a few quick questions.";
    function isFirstSlotPrompt(state: ClarificationState) {
      const slots = [
        state.destination,
        state.groupType,
        state.tripTheme,
        state.budget,
        state.interests,
      ];
      const filled = slots.filter(
        (v) =>
          v &&
          ((Array.isArray(v) && v.length > 0) ||
            (!Array.isArray(v) && v !== ""))
      ).length;
      return filled === 0;
    }
    let personalizationShown = isFirstSlotPrompt(parsedState);
    for (const slotKey of clarificationSlotsKeys) {
      const isMissing =
        updatedState[slotKey] === undefined ||
        updatedState[slotKey] === null ||
        (Array.isArray(updatedState[slotKey]) &&
          (updatedState[slotKey] as any[]).length === 0) ||
        updatedState[slotKey] === "";
      if (isMissing) {
        // Ask for this slot
        const slotPrompt =
          clarificationSlots.find((s) => s.key === slotKey)?.prompt ||
          `Please provide your ${slotKey}.`;
        const promptToShow = personalizationShown
          ? `${personalizationMsg}\n${slotPrompt}`
          : slotPrompt;
        thoughtChain.push({
          step: `clarify-${slotKey}`,
          prompt: promptToShow,
          response: promptToShow,
        });
        console.log(
          `[runClarificationGraph] Missing slot after extraction: ${slotKey}, prompting user:`,
          promptToShow
        );
        return { nextPrompt: promptToShow, updatedState, thoughtChain };
      }
      personalizationShown = false;
    }
    // All slots filled
    const planReadyMsg =
      "All information collected. Ready to generate your travel plan!";
    thoughtChain.push({
      step: "plan-ready",
      prompt: planReadyMsg,
      response: planReadyMsg,
    });
    console.log(
      "[runClarificationGraph] All slots filled after extraction. Plan is ready."
    );
    console.log("[runClarificationGraph] Final state:", updatedState);
    return {
      nextPrompt: planReadyMsg,
      updatedState: { ...updatedState, isPlanReady: true },
      thoughtChain,
    };
  } catch (err) {
    // Log and rethrow for controller to handle
    console.error("[langgraphService] LangGraph service error:", err);
    throw new Error("Clarification state error.");
  }
};

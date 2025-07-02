import { Request, Response } from "express";
import { runClarificationGraph } from "../services/langgraphService";
import { ClarificationState } from "../utils/validation";

export const startClarification = async (req: Request, res: Response) => {
  try {
    const { input, state, messages, userProfile } = req.body as {
      input: string;
      state: ClarificationState;
      messages?: Array<{ role: string; content: string }>;
      userProfile?: Record<string, any>;
    };
    console.log("[clarifyController] Received from frontend:", {
      input,
      state,
    });
    if (typeof input !== "string" || !state || typeof state !== "object") {
      console.warn("[clarifyController] Invalid input or state", {
        input,
        state,
      });
      return res.status(400).json({ error: "Invalid input or state." });
    }
    // Use the conversation history from frontend, or build from state as fallback
    const conversationHistory =
      messages ||
      (state.inputHistory || []).map((msg, index) => ({
        role: index % 2 === 0 ? "user" : "assistant",
        content: msg,
      }));

    const result = await runClarificationGraph(
      input,
      state,
      conversationHistory,
      userProfile
    );
    console.log("[clarifyController] Responding with:", result);
    res.json(result);
  } catch (err) {
    // Log error securely
    console.error("[clarifyController] Clarification error:", err);
    res
      .status(500)
      .json({ error: "An unexpected error occurred. Please try again." });
  }
};

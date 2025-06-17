import { Request, Response } from "express";
import { runClarificationGraph } from "../services/langgraphService";
import { ClarificationState } from "../utils/validation";

export const startClarification = async (req: Request, res: Response) => {
  try {
    const { input, state } = req.body as {
      input: string;
      state: ClarificationState;
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
    const result = await runClarificationGraph(input, state);
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

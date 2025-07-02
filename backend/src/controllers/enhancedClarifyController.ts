import { Request, Response } from "express";
import {
  runClarificationGraph,
  containsPromptInjection,
  detectTrivialIntent,
} from "../services/langgraphService";
import { PersonalizationService } from "../services/personalizationService";
import { UserProfileManager, UserProfile } from "../utils/userProfile";
import { ClarificationState } from "../utils/validation";

interface EnhancedClarifyRequest {
  input: string;
  state: ClarificationState;
  userProfile?: Record<string, any>; // localStorage data from frontend
}

export const enhancedClarification = async (req: Request, res: Response) => {
  try {
    const {
      input,
      state,
      userProfile: localStorageData,
    } = req.body as EnhancedClarifyRequest;

    console.log("[enhancedClarifyController] Received request:", {
      input,
      state,
      hasUserProfile: !!localStorageData,
    });

    // Validate basic inputs
    if (typeof input !== "string" || !state || typeof state !== "object") {
      console.warn("[enhancedClarifyController] Invalid input or state", {
        input,
        state,
      });
      return res.status(400).json({ error: "Invalid input or state." });
    }

    // Pre-LLM checks: prompt injection and trivial intent
    if (containsPromptInjection(input)) {
      return res.json({ message: "Sorry, your input could not be processed." });
    }
    const trivial = detectTrivialIntent(input);
    if (trivial) {
      const cannedResponses = {
        greeting: "Hello! How can I help you plan your next trip?",
        thanks: "You're welcome! Let me know if you need any travel help.",
        goodbye: "Goodbye! Safe travels!",
      };
      return res.json({ message: cannedResponses[trivial] });
    }

    // Process user profile from localStorage data
    let userProfile: UserProfile = {};
    let profileCompleteness = 0;

    if (localStorageData) {
      try {
        userProfile =
          UserProfileManager.mergeLocalStorageData(localStorageData);
        profileCompleteness = calculateProfileCompleteness(userProfile);
        console.log(
          "[enhancedClarifyController] Processed user profile:",
          userProfile
        );
      } catch (error) {
        console.warn(
          "[enhancedClarifyController] Failed to process user profile:",
          error
        );
      }
    }

    // Fallback: if state.source is empty and userProfile.address.city is available, set it
    if ((!state.source || state.source === "") && userProfile.address?.city) {
      state.source = userProfile.address.city;
    }

    // Build conversation history from state
    const messages = (state.inputHistory || []).map((msg, index) => ({
      role: index % 2 === 0 ? "user" : "assistant",
      content: msg,
    }));

    // Run ultra-smart clarification with conversation history and user profile
    const result = await runClarificationGraph(
      input,
      state,
      messages,
      userProfile
    );

    // TEMPORARILY DISABLED: Skip AI personalization to avoid quota issues
    // Apply only template-based personalization to avoid extra API calls
    if (
      profileCompleteness > 0.1 &&
      result.nextPrompt &&
      Object.keys(userProfile).length > 0
    ) {
      try {
        // Apply lightweight template-based personalization instead of AI calls
        const personalizedPrompt = applyLightweightPersonalization(
          result.nextPrompt,
          userProfile
        );

        result.nextPrompt = personalizedPrompt;

        // Add personalization metadata
        (result as any).personalization = {
          applied: true,
          profileCompleteness: profileCompleteness,
          personalizations: extractAppliedPersonalizations(userProfile),
          fallbackUsed: false,
          method: "template-based", // No API calls
        };

        console.log(
          "[enhancedClarifyController] Template personalization applied"
        );
      } catch (error) {
        console.warn(
          "[enhancedClarifyController] Template personalization failed:",
          error
        );

        // Fallback to no personalization
        (result as any).personalization = {
          applied: false,
          profileCompleteness: profileCompleteness,
          personalizations: [],
          fallbackUsed: true,
          error: "Template personalization failed",
        };
      }
    } else {
      // No personalization applied
      (result as any).personalization = {
        applied: false,
        profileCompleteness: profileCompleteness,
        personalizations: [],
        reason:
          profileCompleteness <= 0.1
            ? "insufficient_profile_data"
            : "no_response_to_personalize",
      };
    }

    console.log("[enhancedClarifyController] Responding with enhanced result");
    res.json(result);
  } catch (err) {
    console.error(
      "[enhancedClarifyController] Enhanced clarification error:",
      err
    );
    res.status(500).json({
      error: "An unexpected error occurred. Please try again.",
      fallback: true,
    });
  }
};

// Utility functions
function applyLightweightPersonalization(
  basePrompt: string,
  profile: UserProfile
): string {
  let personalizedPrompt = basePrompt;

  // Add cultural context
  if (profile.locale?.country) {
    const countryName = profile.locale.country;
    if (countryName === "IN") {
      personalizedPrompt = personalizedPrompt.replace(
        /Great!/,
        "Great! As a fellow Indian traveler,"
      );
    } else if (countryName !== "US") {
      personalizedPrompt = personalizedPrompt.replace(
        /Great!/,
        `Great! From ${countryName},`
      );
    }
  }

  // Add currency context
  if (profile.locale?.currency && profile.locale.currency !== "USD") {
    personalizedPrompt += ` (I'll consider costs in ${profile.locale.currency})`;
  }

  // Add travel preferences context
  if (profile.travelPrefs?.travelClass === "budget") {
    personalizedPrompt += " I'll focus on budget-friendly options.";
  } else if (profile.travelPrefs?.travelClass === "luxury") {
    personalizedPrompt += " I'll include premium experiences.";
  }

  return personalizedPrompt;
}

function calculateProfileCompleteness(profile: UserProfile): number {
  let score = 0;
  const maxScore = 10;

  if (profile.locale?.country) score += 2;
  if (profile.locale?.currency) score += 1;
  if (profile.address?.city) score += 1;
  if (profile.travelPrefs) score += 2;
  if (profile.activityPreferences) score += 3;
  if (profile.behaviorProfile) score += 1;

  return score / maxScore;
}

function extractAppliedPersonalizations(profile: UserProfile): string[] {
  const applied: string[] = [];

  if (profile.locale?.country) applied.push("cultural-context");
  if (profile.locale?.currency) applied.push("currency-localization");
  if (profile.travelPrefs) applied.push("travel-preferences");
  if (profile.activityPreferences) applied.push("activity-matching");
  if (profile.behaviorProfile?.planningStyle)
    applied.push("communication-style");
  if (profile.contextualIntelligence?.crowdTolerance)
    applied.push("crowd-preferences");

  return applied;
}

// Keep the original controller for backwards compatibility
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

    // Build conversation history for basic controller
    const messages = (state.inputHistory || []).map((msg, index) => ({
      role: index % 2 === 0 ? "user" : "assistant",
      content: msg,
    }));

    const result = await runClarificationGraph(input, state, messages);
    console.log("[clarifyController] Responding with:", result);
    res.json(result);
  } catch (err) {
    console.error("[clarifyController] Clarification error:", err);
    res
      .status(500)
      .json({ error: "An unexpected error occurred. Please try again." });
  }
};

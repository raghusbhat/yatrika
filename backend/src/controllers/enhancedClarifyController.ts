import { Request, Response } from "express";
import {
  runClarificationGraph,
  detectTrivialIntent,
} from "../services/langgraphService";
import { PersonalizationService } from "../services/personalizationService";
import { UserProfileManager, UserProfile } from "../utils/userProfile";
import {
  ClarificationState,
  containsPromptInjection,
} from "../utils/validation";

interface EnhancedClarifyRequest {
  input: string;
  state: ClarificationState;
  userProfile?: Record<string, any>; // localStorage data from frontend
}

export const enhancedClarification = async (req: Request, res: Response) => {
  console.log("🎯 [BACKEND CONTROLLER] Request received:", {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    userAgent: req.headers["user-agent"],
    contentLength: req.headers["content-length"],
    hasBody: !!req.body,
  });

  try {
    const {
      input,
      state,
      userProfile: localStorageData,
    } = req.body as EnhancedClarifyRequest;

    console.log("📝 [BACKEND CONTROLLER] Request body parsed:", {
      timestamp: new Date().toISOString(),
      inputLength: input?.length || 0,
      inputPreview: input?.substring(0, 50) + "..." || "empty",
      stateKeys: state ? Object.keys(state) : [],
      hasUserProfile: !!localStorageData,
      userProfileKeys: localStorageData ? Object.keys(localStorageData) : [],
      inputHistoryLength: state?.inputHistory?.length || 0,
    });

    // Validate basic inputs
    if (typeof input !== "string" || !state || typeof state !== "object") {
      console.warn("⚠️ [BACKEND CONTROLLER] Invalid input or state:", {
        timestamp: new Date().toISOString(),
        inputType: typeof input,
        stateType: typeof state,
        input,
        state,
      });
      return res.status(400).json({ error: "Invalid input or state." });
    }

    console.log("🛡️ [BACKEND CONTROLLER] Starting security checks...", {
      timestamp: new Date().toISOString(),
      inputToCheck: input.substring(0, 100) + "...",
    });

    // Pre-LLM checks: prompt injection and trivial intent
    if (containsPromptInjection(input)) {
      console.warn("🚨 [BACKEND CONTROLLER] Prompt injection detected:", {
        timestamp: new Date().toISOString(),
        input: input.substring(0, 100) + "...",
        blocked: true,
      });
      return res.json({ message: "Sorry, your input could not be processed." });
    }

    const trivial = detectTrivialIntent(input);
    if (trivial) {
      console.log("👋 [BACKEND CONTROLLER] Trivial intent detected:", {
        timestamp: new Date().toISOString(),
        intent: trivial,
        input: input.substring(0, 50) + "...",
      });
      const cannedResponses = {
        greeting: "Hello! How can I help you plan your next trip?",
        thanks: "You're welcome! Let me know if you need any travel help.",
        goodbye: "Goodbye! Safe travels!",
      };
      return res.json({ message: cannedResponses[trivial] });
    }

    console.log("✅ [BACKEND CONTROLLER] Security checks passed", {
      timestamp: new Date().toISOString(),
    });

    // Process user profile from localStorage data
    let userProfile: UserProfile = {};
    let profileCompleteness = 0;

    console.log("👤 [BACKEND CONTROLLER] Processing user profile...", {
      timestamp: new Date().toISOString(),
      hasLocalStorageData: !!localStorageData,
    });

    if (localStorageData) {
      try {
        userProfile =
          UserProfileManager.mergeLocalStorageData(localStorageData);
        profileCompleteness = calculateProfileCompleteness(userProfile);
        console.log("✨ [BACKEND CONTROLLER] User profile processed:", {
          timestamp: new Date().toISOString(),
          profileCompleteness: Math.round(profileCompleteness * 100) + "%",
          profileKeys: Object.keys(userProfile),
          hasLocale: !!userProfile.locale,
          hasTravelPrefs: !!userProfile.travelPrefs,
          hasActivityPrefs: !!userProfile.activityPreferences,
        });
      } catch (error) {
        console.warn(
          "⚠️ [BACKEND CONTROLLER] Failed to process user profile:",
          {
            timestamp: new Date().toISOString(),
            error: error instanceof Error ? error.message : String(error),
            localStorageDataKeys: Object.keys(localStorageData),
          }
        );
      }
    }

    // Fallback: if state.source is empty and userProfile.address.city is available, set it
    if ((!state.source || state.source === "") && userProfile.address?.city) {
      state.source = userProfile.address.city;
      console.log("🏠 [BACKEND CONTROLLER] Source city set from profile:", {
        timestamp: new Date().toISOString(),
        sourceCity: state.source,
      });
    }

    // Build conversation history from state
    const messages = (state.inputHistory || []).map((msg, index) => ({
      role: index % 2 === 0 ? "user" : "assistant",
      content: msg,
    }));

    console.log("💬 [BACKEND CONTROLLER] Conversation context prepared:", {
      timestamp: new Date().toISOString(),
      messagesCount: messages.length,
      conversationHistory: messages.slice(-3), // Last 3 messages for context
    });

    // OPTIMIZATION: Detect form submissions and use optimized direct processing
    const hasFilledSlots = Object.entries(state).some(
      ([k, v]) =>
        k !== "inputHistory" &&
        k !== "isPlanReady" &&
        typeof v !== "boolean" &&
        v !== undefined &&
        v !== null &&
        v !== ""
    );
    const isFormSubmission = !input.trim() && hasFilledSlots;

    if (isFormSubmission) {
      console.log(
        "🚀 [BACKEND CONTROLLER] Form submission detected - using optimized flow:",
        {
          timestamp: new Date().toISOString(),
          service: "processFormDirectly",
          filledSlots: Object.entries(state)
            .filter(([k, v]) => k !== "inputHistory" && v)
            .map(([k]) => k),
          optimized: true,
          apiCallsSaved: "1-2 calls avoided",
        }
      );

      // Import the optimized function
      const { processFormDirectly } = await import(
        "../services/langgraphService"
      );

      // Run optimized form processing (single API call)
      const result = await processFormDirectly(state, userProfile);

      console.log(
        "🔄 [BACKEND CONTROLLER] Optimized form processing completed:",
        {
          timestamp: new Date().toISOString(),
          hasNextPrompt: !!result.nextPrompt,
          nextPromptPreview: result.nextPrompt?.substring(0, 100) + "...",
          thoughtChainSteps: result.thoughtChain?.length || 0,
          isPlanReady: result.updatedState?.isPlanReady,
          optimizationUsed: true,
        }
      );

      // Continue to personalization step below with the result
      var optimizedResult = result;
    } else {
      console.log(
        "🧠 [BACKEND CONTROLLER] Conversational input - using full clarification flow:",
        {
          timestamp: new Date().toISOString(),
          service: "runClarificationGraph",
          inputLength: input.length,
          stateFieldsCount: Object.keys(state).length,
          messagesCount: messages.length,
        }
      );

      // Run full conversational clarification with conversation history and user profile
      var optimizedResult = await runClarificationGraph(
        input,
        state,
        messages,
        userProfile
      );

      console.log("🔄 [BACKEND CONTROLLER] LangGraph service completed:", {
        timestamp: new Date().toISOString(),
        hasNextPrompt: !!optimizedResult.nextPrompt,
        nextPromptPreview:
          optimizedResult.nextPrompt?.substring(0, 100) + "...",
        updatedStateKeys: Object.keys(optimizedResult.updatedState),
        thoughtChainSteps: optimizedResult.thoughtChain?.length || 0,
        isPlanReady: optimizedResult.updatedState?.isPlanReady,
      });
    }

    const result = optimizedResult;

    // TEMPORARILY DISABLED: Skip AI personalization to avoid quota issues
    // Apply only template-based personalization to avoid extra API calls
    if (
      profileCompleteness > 0.1 &&
      result.nextPrompt &&
      Object.keys(userProfile).length > 0
    ) {
      console.log("🎨 [BACKEND CONTROLLER] Applying personalization...", {
        timestamp: new Date().toISOString(),
        profileCompleteness: Math.round(profileCompleteness * 100) + "%",
        method: "template-based",
      });

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
          "✨ [BACKEND CONTROLLER] Personalization applied successfully:",
          {
            timestamp: new Date().toISOString(),
            personalizations: extractAppliedPersonalizations(userProfile),
            originalLength: result.nextPrompt.length,
            personalizedLength: personalizedPrompt.length,
          }
        );
      } catch (error) {
        console.warn("⚠️ [BACKEND CONTROLLER] Personalization failed:", {
          timestamp: new Date().toISOString(),
          error: error instanceof Error ? error.message : String(error),
        });

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
      console.log("⏭️ [BACKEND CONTROLLER] Skipping personalization:", {
        timestamp: new Date().toISOString(),
        reason:
          profileCompleteness <= 0.1
            ? "insufficient_profile_data"
            : "no_response_to_personalize",
        profileCompleteness: Math.round(profileCompleteness * 100) + "%",
        hasNextPrompt: !!result.nextPrompt,
      });

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

    console.log("🎉 [BACKEND CONTROLLER] Sending final response:", {
      timestamp: new Date().toISOString(),
      responseKeys: Object.keys(result),
      hasNextPrompt: !!result.nextPrompt,
      hasPersonalization: !!(result as any).personalization?.applied,
      finalResponsePreview: result.nextPrompt?.substring(0, 100) + "...",
    });

    res.json(result);
  } catch (err) {
    console.error("💥 [BACKEND CONTROLLER] Unexpected error:", {
      timestamp: new Date().toISOString(),
      error: err,
      errorType: err instanceof Error ? err.constructor.name : typeof err,
      errorMessage: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    });

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

  // Currency context is now handled in Gemini prompt directly
  // No need for additional currency mentions since Gemini gets full context

  // Add travel preferences context
  if (profile.travelPrefs?.travelClass === "economy") {
    personalizedPrompt += " I'll focus on budget-friendly options.";
  } else if (
    profile.travelPrefs?.travelClass === "business" ||
    profile.travelPrefs?.travelClass === "first"
  ) {
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

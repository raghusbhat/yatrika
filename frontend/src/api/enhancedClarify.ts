import type { ClarificationState } from "@/types/clarification";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

// Collect all localStorage data for user profile
function collectUserProfileData(): Record<string, any> {
  const profileData: Record<string, any> = {};

  // Core profile keys - OPTIMIZED: removed restcountries_all (was ~100KB!)
  const profileKeys = [
    "user_country",
    "user_country_consent",
    "user_city",
    "user_timezone",
    "user_address",
    "user_units",
    "user_travel_prefs",
    "user_prefs",
    "user_notif",
  ];

  // Collect existing localStorage data
  profileKeys.forEach((key) => {
    const value = localStorage.getItem(key);
    if (value !== null) {
      profileData[key] = value;
    }
  });

  // Add any additional profile data that might exist
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith("user_") && !profileKeys.includes(key)) {
      const value = localStorage.getItem(key);
      if (value !== null) {
        profileData[key] = value;
      }
    }
  });

  return profileData;
}

// Main clarify function with personalization (used by frontend)
export async function clarify(input: string, state: ClarificationState) {
  console.log("🚀 [FRONTEND API] Starting clarify request:", {
    timestamp: new Date().toISOString(),
    inputLength: input.length,
    inputPreview: input.substring(0, 50) + "...",
    stateKeys: Object.keys(state),
    hasDestination: !!state.destination,
    hasGroupType: !!state.groupType,
    hasBudget: !!state.budget,
  });

  try {
    const userProfile = collectUserProfileData();
    // Ensure source is set from user_city if not present
    let stateToSend = { ...state };
    if (!stateToSend.source) {
      const userCity = localStorage.getItem("user_city");
      if (userCity) stateToSend.source = userCity;
    }

    console.log("👤 [FRONTEND API] User profile collected (optimized):", {
      timestamp: new Date().toISOString(),
      hasProfile: Object.keys(userProfile).length > 0,
      profileKeys: Object.keys(userProfile),
      sourceCity: stateToSend.source,
      optimized: "restcountries_all excluded (~100KB saved)",
    });

    const requestBody = {
      input,
      state: stateToSend,
      userProfile,
    };

    console.log("📋 [FRONTEND API] Sending HTTP request (payload optimized):", {
      timestamp: new Date().toISOString(),
      url: `${API_BASE_URL}/api/clarify/enhanced`,
      method: "POST",
      bodySize: JSON.stringify(requestBody).length + " bytes",
      optimization: "95% payload reduction (restcountries_all removed)",
      requestBodyPreview: {
        input: input.substring(0, 50) + "...",
        stateFields: Object.keys(stateToSend).filter(
          (key) => stateToSend[key as keyof ClarificationState]
        ),
        profileFields: Object.keys(userProfile),
      },
    });

    const res = await fetch(`${API_BASE_URL}/api/clarify/enhanced`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    console.log("📨 [FRONTEND API] HTTP response received:", {
      timestamp: new Date().toISOString(),
      status: res.status,
      statusText: res.statusText,
      ok: res.ok,
      headers: Object.fromEntries(res.headers.entries()),
    });

    if (!res.ok) {
      let errorMsg = "Enhanced clarify API error";
      try {
        const errJson = await res.json();
        errorMsg = errJson.error || errorMsg;
        console.error("🚨 [FRONTEND API] Error response body:", {
          timestamp: new Date().toISOString(),
          errorJson: errJson,
        });
      } catch {}
      throw new Error(errorMsg);
    }

    const result = await res.json();

    console.log("🎉 [FRONTEND API] Success response parsed:", {
      timestamp: new Date().toISOString(),
      hasNextPrompt: !!result.nextPrompt,
      nextPromptPreview: result.nextPrompt?.substring(0, 100) + "...",
      updatedStateKeys: Object.keys(result.updatedState || {}),
      hasPersonalization: !!result.personalization,
      personalizationApplied: result.personalization?.applied,
      thoughtChainSteps: result.thoughtChain?.length || 0,
    });

    // Log personalization info if available
    if (result.personalization) {
      console.log("✨ [FRONTEND API] Personalization details:", {
        timestamp: new Date().toISOString(),
        ...result.personalization,
      });
    }

    return result;
  } catch (err) {
    console.error("💥 [FRONTEND API] Exception in clarify:", {
      timestamp: new Date().toISOString(),
      error: err,
      errorType: err instanceof Error ? err.constructor.name : typeof err,
      errorMessage: err instanceof Error ? err.message : String(err),
    });

    if (err instanceof Error) {
      let msg = err.message;
      if (msg === "Failed to fetch") {
        msg =
          "Could not connect to the server. Please check your connection or try again later.";
      }
      throw new Error(msg || "Network or server error");
    }
    throw new Error("Unknown error");
  }
}

// User profile analysis utilities
export class UserProfileAnalyzer {
  static getProfileData(): Record<string, any> {
    return collectUserProfileData();
  }

  static getProfileCompleteness(): number {
    const profileData = collectUserProfileData();
    const requiredFields = [
      "user_country",
      "user_timezone",
      "user_units",
      "user_travel_prefs",
    ];
    const completedFields = requiredFields.filter(
      (field) => profileData[field]
    );
    return (completedFields.length / requiredFields.length) * 100;
  }

  static hasMinimumProfileData(): boolean {
    const profileData = collectUserProfileData();
    return !!(profileData.user_country && profileData.user_timezone);
  }

  static getPersonalizationInsights(): Record<string, any> {
    const profileData = collectUserProfileData();
    return {
      hasLocationData: !!(profileData.user_country || profileData.user_address),
      hasPreferences: !!(
        profileData.user_travel_prefs || profileData.user_prefs
      ),
      hasUnits: !!profileData.user_units,
      profileCompleteness: this.getProfileCompleteness(),
      dataKeys: Object.keys(profileData),
    };
  }
}

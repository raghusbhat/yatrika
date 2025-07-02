import type { ClarificationState } from "@/types/clarification";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

// Collect all localStorage data for user profile
function collectUserProfileData(): Record<string, any> {
  const profileData: Record<string, any> = {};

  // Core profile keys
  const profileKeys = [
    "user_country",
    "user_country_consent",
    "user_timezone",
    "user_address",
    "user_units",
    "user_travel_prefs",
    "user_prefs",
    "user_notif",
    "restcountries_all",
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

// Enhanced clarify function with personalization
export async function enhancedClarify(
  input: string,
  state: ClarificationState
) {
  try {
    const userProfile = collectUserProfileData();
    // Ensure source is set from user_city if not present
    let stateToSend = { ...state };
    if (!stateToSend.source) {
      const userCity = localStorage.getItem("user_city");
      if (userCity) stateToSend.source = userCity;
    }
    console.log("[enhancedClarify] Sending request with profile data:", {
      input,
      hasProfile: Object.keys(userProfile).length > 0,
      profileKeys: Object.keys(userProfile),
    });

    const res = await fetch(`${API_BASE_URL}/api/clarify/enhanced`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input,
        state: stateToSend,
        userProfile,
      }),
    });

    if (!res.ok) {
      let errorMsg = "Enhanced clarify API error";
      try {
        const errJson = await res.json();
        errorMsg = errJson.error || errorMsg;
      } catch {}
      throw new Error(errorMsg);
    }

    const result = await res.json();

    // Log personalization info if available
    if (result.personalization) {
      console.log(
        "[enhancedClarify] Personalization applied:",
        result.personalization
      );
    }

    return result;
  } catch (err) {
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

// Ultra-smart clarify with conversation history and user profile
export async function clarifyWithHistory(
  input: string,
  state: ClarificationState,
  messages: Array<{ role: string; content: string }> = [],
  userProfile: Record<string, any> = {}
) {
  try {
    // Ensure source is set from user_city if not present
    let stateToSend = { ...state };
    if (!stateToSend.source) {
      const userCity = localStorage.getItem("user_city");
      if (userCity) stateToSend.source = userCity;
    }
    const res = await fetch(`${API_BASE_URL}/api/clarify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input,
        state: stateToSend,
        messages,
        userProfile,
      }),
    });

    if (!res.ok) {
      let errorMsg = "Ultra-smart clarify API error";
      try {
        const errJson = await res.json();
        errorMsg = errJson.error || errorMsg;
      } catch {}
      throw new Error(errorMsg);
    }

    return await res.json();
  } catch (err) {
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

// Fallback to original clarify function
export async function clarify(input: string, state: ClarificationState) {
  try {
    // Ensure source is set from user_city if not present
    let stateToSend = { ...state };
    if (!stateToSend.source) {
      const userCity = localStorage.getItem("user_city");
      if (userCity) stateToSend.source = userCity;
    }
    const res = await fetch(`${API_BASE_URL}/api/clarify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input, state: stateToSend }),
    });

    if (!res.ok) {
      let errorMsg = "Clarify API error";
      try {
        const errJson = await res.json();
        errorMsg = errJson.error || errorMsg;
      } catch {}
      throw new Error(errorMsg);
    }

    return await res.json();
  } catch (err) {
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

// Smart clarify function with conversation history
export async function smartClarify(
  input: string,
  state: ClarificationState,
  messages: Array<{ role: string; content: string }> = []
) {
  const userProfile = collectUserProfileData();
  // Ensure source is set from user_city if not present
  let stateToSend = { ...state };
  if (!stateToSend.source) {
    const userCity = localStorage.getItem("user_city");
    if (userCity) stateToSend.source = userCity;
  }
  console.log(
    "[smartClarify] Using ultra-smart clarification with conversation history"
  );
  return await clarifyWithHistory(input, stateToSend, messages, userProfile);
}

// Export utility functions for profile management
export const profileUtils = {
  collectUserProfileData,

  // Get profile completeness score
  getProfileCompleteness(): number {
    const profileData = collectUserProfileData();
    const essentialKeys = ["user_country", "user_travel_prefs", "user_prefs"];
    const optionalKeys = [
      "user_address",
      "user_units",
      "user_notif",
      "user_timezone",
    ];

    let score = 0;
    const maxScore = essentialKeys.length * 2 + optionalKeys.length;

    essentialKeys.forEach((key) => {
      if (profileData[key]) score += 2;
    });

    optionalKeys.forEach((key) => {
      if (profileData[key]) score += 1;
    });

    return score / maxScore;
  },

  // Check if user has sufficient profile data for personalization
  hasMinimumProfileData(): boolean {
    const profileData = collectUserProfileData();
    return !!(profileData.user_country || profileData.user_travel_prefs);
  },

  // Get personalization insights for debugging
  getPersonalizationInsights(): Record<string, any> {
    const profileData = collectUserProfileData();
    const insights: Record<string, any> = {
      completeness: profileUtils.getProfileCompleteness(),
      hasMinimumData: profileUtils.hasMinimumProfileData(),
      availableData: {},
      missingCriticalData: [],
    };

    // Parse available data
    if (profileData.user_country) {
      insights.availableData.country = profileData.user_country;
    }

    if (profileData.user_travel_prefs) {
      try {
        insights.availableData.travelPrefs = JSON.parse(
          profileData.user_travel_prefs
        );
      } catch {}
    }

    if (profileData.user_prefs) {
      try {
        insights.availableData.userPrefs = JSON.parse(profileData.user_prefs);
      } catch {}
    }

    // Identify missing critical data
    const criticalKeys = ["user_country", "user_travel_prefs"];
    criticalKeys.forEach((key) => {
      if (!profileData[key]) {
        insights.missingCriticalData.push(key);
      }
    });

    return insights;
  },
};

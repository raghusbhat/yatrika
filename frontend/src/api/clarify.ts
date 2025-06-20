export interface ClarificationState {
  source?: string;
  destination?: string;
  travelDates?: string;
  duration?: string;
  groupType?: "solo" | "couple" | "family" | "friends";
  budget?: string;
  domesticOrInternational?: "domestic" | "international";
  modeOfTransport?:
    | "own car"
    | "rental car"
    | "taxi"
    | "train"
    | "bus"
    | "flight";
  carModel?: string;
  flightPreferences?: string;
  accommodation?: string;
  travelPace?: string;
  occasion?: string;
  foodPreference?: string;
  specialNeeds?: string;
  climatePreference?: string;
  interests?: string[];
  inputHistory: string[];
  isPlanReady: boolean;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

export async function clarify(input: string, state: ClarificationState) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/clarify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input, state }),
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

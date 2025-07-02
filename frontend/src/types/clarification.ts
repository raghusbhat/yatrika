// Shared types for clarification state management

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
  startDate?: string;
  endDate?: string;
  tripTheme?: string;
  flexibleBudget?: boolean;
  flexibleDates?: boolean;
}

export const initialClarificationState: ClarificationState = {
  source: "",
  destination: "",
  travelDates: "",
  duration: "",
  groupType: undefined,
  budget: "",
  domesticOrInternational: undefined,
  modeOfTransport: undefined,
  carModel: "",
  flightPreferences: "",
  accommodation: "",
  travelPace: "",
  occasion: "",
  foodPreference: "",
  specialNeeds: "",
  climatePreference: "",
  interests: [],
  inputHistory: [],
  isPlanReady: false,
  tripTheme: "",
  flexibleBudget: false,
  flexibleDates: false,
};

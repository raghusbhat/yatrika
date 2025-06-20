export interface TravelConversationState {
  source?: string | null;
  destination?: string | null;
  travelDates?: string | null;
  duration?: string | null;
  groupType?: "solo" | "couple" | "family" | "friends" | null;
  budget?: string | null;
  domesticOrInternational?: "domestic" | "international" | null;
  modeOfTransport?:
    | "own car"
    | "rental car"
    | "taxi"
    | "train"
    | "bus"
    | "flight"
    | null;
  carModel?: string | null;
  flightPreferences?: string | null;
  accommodation?: string | null;
  travelPace?: string | null;
  occasion?: string | null;
  foodPreference?: string | null;
  specialNeeds?: string | null;
  climatePreference?: string | null;
  inputHistory: string[];
  isPlanReady: boolean;
}

// Structured itinerary types for beautiful UI display

export interface TripOverview {
  title: string;
  description: string;
  coverImage?: string;
  totalBudget: string;
  duration: string;
  highlights: string[];
  bestTimeToVisit?: string;
}

export interface Activity {
  time: string;
  title: string;
  description: string;
  location: string;
  type:
    | "sightseeing"
    | "food"
    | "activity"
    | "transport"
    | "accommodation"
    | "shopping"
    | "cultural";
  duration?: string;
  cost?: string;
  difficulty?: "easy" | "moderate" | "challenging";
  tips?: string[];
  bookingRequired?: boolean;
}

export interface DailyItinerary {
  day: number;
  date: string;
  title: string;
  theme?: string;
  activities: Activity[];
}

export interface Accommodation {
  name: string;
  type: string;
  priceRange: string;
  rating?: number;
  location: string;
  highlights: string[];
  bookingTip?: string;
}

export interface Restaurant {
  name: string;
  cuisine: string;
  priceRange: string;
  location: string;
  mustTry: string[];
  atmosphere?: string;
  tip?: string;
}

export interface LocalTransport {
  mode: string;
  description: string;
  cost: string;
}

export interface Transportation {
  gettingThere: string;
  localTransport: LocalTransport[];
  tips: string[];
}

export interface PracticalInfo {
  weather: string;
  currency: string;
  language: string;
  timeZone?: string;
  emergencyNumbers: string[];
  culturalTips: string[];
  packingEssentials: string[];
}

export interface BudgetBreakdown {
  accommodation: string;
  food: string;
  transport: string;
  activities: string;
  shopping?: string;
  total: string;
}

export interface StructuredItinerary {
  tripOverview: TripOverview;
  dailyItinerary: DailyItinerary[];
  accommodations: Accommodation[];
  restaurants: Restaurant[];
  transportation: Transportation;
  practicalInfo: PracticalInfo;
  budgetBreakdown: BudgetBreakdown;
}

// UI Display Enums
export const ActivityTypeIcons = {
  sightseeing: "🏛️",
  food: "🍽️",
  activity: "🎯",
  transport: "🚗",
  accommodation: "🏨",
  shopping: "🛍️",
  cultural: "🎭",
} as const;

export const DifficultyColors = {
  easy: "text-green-600 bg-green-100",
  moderate: "text-yellow-600 bg-yellow-100",
  challenging: "text-red-600 bg-red-100",
} as const;

// Media placeholder URLs (to be replaced with actual image/video APIs)
export const getPlaceholderImage = (query: string, width = 400, height = 300) =>
  `https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=${width}&h=${height}&fit=crop&q=80`;

export const getGoogleMapsUrl = (location: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    location
  )}`;

export const getInstagramSearchUrl = (location: string) =>
  `https://www.instagram.com/explore/tags/${encodeURIComponent(
    location.replace(/\s+/g, "")
  )}/`;

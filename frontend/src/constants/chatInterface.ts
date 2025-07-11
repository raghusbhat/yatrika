import * as z from "zod";

// Form validation schema
export const formSchema = z
  .object({
    destination: z.string().optional(),
    groupType: z.string().min(1, "Group type is required."),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
    budget: z.string().optional(),
    interests: z.array(z.string()).optional().nullable(),
    source: z.string().optional(),
    flexibleDates: z.boolean().optional(),
    flexibleBudget: z.boolean().optional(),
    specialNeeds: z.string().optional(),
  })
  .refine(
    (data) => {
      // Must either have both dates, or flexibleDates true
      const hasDates = !!data.startDate && !!data.endDate;
      return hasDates || data.flexibleDates === true;
    },
    {
      message: 'Please enter travel dates or select "My dates are flexible".',
      path: ["startDate"],
    }
  );

// Destination placeholder examples
export const DESTINATION_PLACEHOLDER_EXAMPLES = [
  "Goa, India",
  "Munnar, Kerala, India",
  "Kyoto, Japan",
  "Takayama, Japan",
  "Phuket, Thailand",
  "Hoi An, Vietnam",
  "Cappadocia, Turkey",
  "Santorini, Greece",
  "Meteora, Greece",
  "Paris, France",
  "Rome, Italy",
  "Alberobello, Italy",
  "Zurich, Switzerland",
  "Reykjavik, Iceland",
  "New York City, USA",
  "Sedona, Arizona, USA",
  "Banff National Park, Canada",
  "Queenstown, New Zealand",
  "Machu Picchu, Peru",
  "Petra, Jordan",
  "Cape Town, South Africa",
  "Drakensberg, South Africa",
  "Chefchaouen, Morocco",
];

// Typing animation constants
export const TYPING_SPEED = 60; // ms per character
export const DELETING_SPEED = 30; // ms per character
export const PAUSE_AFTER_TYPING = 1200; // ms to pause after typing
export const PAUSE_AFTER_DELETING = 400; // ms to pause after deleting

// Group type chips
export const GROUP_TYPE_CHIPS = [
  { label: "Solo", value: "solo" },
  { label: "Couple", value: "couple" },
  { label: "Family", value: "family" },
  { label: "Friends", value: "friends" },
];

// Initial journey type chips (icons defined in component)
export const INITIAL_CHIPS = [
  {
    label: "Beach Getaway",
    value: "Beach Getaway",
  },
  {
    label: "Adventure Trip",
    value: "Adventure Trip",
  },
  {
    label: "Cultural Trip",
    value: "Cultural Trip",
  },
  {
    label: "City Break",
    value: "City Break",
  },
  {
    label: "Backpacking",
    value: "Backpacking",
  },
  {
    label: "Family Vacation",
    value: "Family Vacation",
  },
  {
    label: "Spiritual Journey",
    value: "Spiritual Journey",
  },
  {
    label: "Mountain Escape",
    value: "Mountain Escape",
  },
  {
    label: "Romantic Retreat",
    value: "Romantic Retreat",
  },
];

// Interest chips
export const INTEREST_CHIPS = [
  "Adventure",
  "Nature",
  "Beaches",
  "Mountains",
  "Culture",
  "History",
  "Art",
  "Food & Dining",
  "Nightlife",
  "Shopping",
  "Wellness",
  "Wildlife",
  "Sports",
  "Festivals",
  "Family",
  "Photography",
  "Relaxation",
  "Local Experiences",
];

// Step 2: Basic Details fields
export const STEP_2_FIELDS = [
  {
    key: "destination",
    label: "Destination",
    type: "input",
  },
  {
    key: "travelDates",
    label: "Travel Dates",
    type: "date-range",
  },
  {
    key: "groupType",
    label: "Group Type",
    type: "chips",
    options: ["Solo", "Couple", "Family", "Friends"],
  },
  {
    key: "source",
    label: "Departure City (optional)",
    type: "input",
    placeholder: "Departure city",
  },
];

// Step 3: Preferences & Extras fields
export const STEP_3_FIELDS = [
  {
    key: "budget",
    label: "Budget",
    type: "input",
    placeholder: "Your budget range (e.g., ₹20,000, $500)",
  },
  {
    key: "interests",
    label: "Interests",
    type: "input",
    placeholder: "Museums, Adventure, Food & Dining, Nature, Culture...",
  },
  {
    key: "specialNeeds",
    label: "Special Needs",
    type: "input",
    placeholder: "Accessibility, dietary restrictions, etc.",
  },
];

// Animation variants
export const stepVariants = {
  enter: (direction: "forward" | "back") => ({
    x: direction === "forward" ? 80 : -80,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: "forward" | "back") => ({
    x: direction === "forward" ? -80 : 80,
    opacity: 0,
  }),
};

export const conversationTransitionVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.95,
  },
};

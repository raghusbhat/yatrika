import { z } from "zod";

// Define comprehensive user profile schema
export const UserProfileSchema = z.object({
  // Basic locale and location info
  locale: z
    .object({
      country: z.string().optional(),
      timezone: z.string().optional(),
      currency: z.string().optional(),
      dateFormat: z.string().optional(),
      units: z
        .object({
          distance: z.enum(["km", "miles"]).optional(),
          temperature: z.enum(["C", "F"]).optional(),
          weight: z.enum(["kg", "lb"]).optional(),
        })
        .optional(),
    })
    .optional(),

  // Address information
  address: z
    .object({
      line1: z.string().optional(),
      line2: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      postal: z.string().optional(),
      country: z.string().optional(),
      phone: z.string().optional(),
    })
    .optional(),

  // Travel preferences
  travelPrefs: z
    .object({
      travelClass: z
        .enum(["economy", "premium_economy", "business", "first"])
        .optional(),
      dietary: z.string().optional(),
      accessibility: z.string().optional(),
      favorites: z.string().optional(),
    })
    .optional(),

  // Notification preferences
  notifications: z
    .object({
      email: z.boolean().optional(),
      push: z.boolean().optional(),
      price: z.boolean().optional(),
      marketing: z.boolean().optional(),
      travel: z.boolean().optional(),
      security: z.boolean().optional(),
    })
    .optional(),

  // Enhanced personalization data
  behaviorProfile: z
    .object({
      planningStyle: z.enum(["detailed", "flexible", "spontaneous"]).optional(),
      decisionSpeed: z.enum(["quick", "moderate", "thorough"]).optional(),
      researchDepth: z.enum(["minimal", "moderate", "extensive"]).optional(),
      bookingTiming: z.enum(["early", "last-minute", "flexible"]).optional(),
      changeTolerance: z.enum(["low", "medium", "high"]).optional(),
      groupDynamics: z.enum(["leader", "follower", "collaborative"]).optional(),
    })
    .optional(),

  activityPreferences: z
    .object({
      adventureLevel: z.number().min(1).max(10).optional(),
      culturalInterest: z.number().min(1).max(10).optional(),
      natureLover: z.number().min(1).max(10).optional(),
      nightlifeInterest: z.number().min(1).max(10).optional(),
      shoppingInterest: z.number().min(1).max(10).optional(),
      foodExploration: z.number().min(1).max(10).optional(),
      photographyInterest: z.number().min(1).max(10).optional(),
      wellnessFocus: z.number().min(1).max(10).optional(),
      historicalSites: z.number().min(1).max(10).optional(),
      localExperiences: z.number().min(1).max(10).optional(),
    })
    .optional(),

  travelConstraints: z
    .object({
      budgetRange: z
        .object({
          min: z.number().optional(),
          max: z.number().optional(),
          currency: z.string().optional(),
        })
        .optional(),
      timeConstraints: z
        .object({
          maxTravelTime: z.number().optional(),
          preferredDepartureTimes: z.array(z.string()).optional(),
          blackoutDates: z.array(z.string()).optional(),
        })
        .optional(),
      physicalLimitations: z.array(z.string()).optional(),
      visaRestrictions: z.array(z.string()).optional(),
    })
    .optional(),

  contextualIntelligence: z
    .object({
      weatherSensitivity: z
        .object({
          heatTolerance: z.number().min(1).max(10).optional(),
          coldTolerance: z.number().min(1).max(10).optional(),
          rainPreference: z.enum(["avoid", "neutral", "enjoy"]).optional(),
        })
        .optional(),
      crowdTolerance: z.number().min(1).max(10).optional(),
      languageComfort: z.array(z.string()).optional(),
      sustainabilityPriority: z.number().min(1).max(10).optional(),
    })
    .optional(),

  personalityInsights: z
    .object({
      personalityType: z.string().optional(),
      learningStyle: z.enum(["visual", "auditory", "kinesthetic"]).optional(),
      stressTriggers: z.array(z.string()).optional(),
      motivationDrivers: z.array(z.string()).optional(),
      decisionFactors: z.array(z.string()).optional(),
      travelPhilosophy: z
        .enum(["bucket-list", "spontaneous", "educational", "relaxation"])
        .optional(),
    })
    .optional(),

  // AI learning and adaptation
  aiLearningData: z
    .object({
      pastInteractions: z
        .object({
          preferredQuestionTypes: z.array(z.string()).optional(),
          commonClarifications: z.array(z.string()).optional(),
          successfulRecommendations: z.array(z.string()).optional(),
          rejectedSuggestions: z.array(z.string()).optional(),
        })
        .optional(),
      personalizationScores: z
        .object({
          adventure: z.number().min(0).max(1).optional(),
          culture: z.number().min(0).max(1).optional(),
          relaxation: z.number().min(0).max(1).optional(),
          food: z.number().min(0).max(1).optional(),
        })
        .optional(),
      conversationStyle: z
        .enum(["casual", "formal", "detailed", "brief"])
        .optional(),
    })
    .optional(),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;

// Utility functions for user profile management
export class UserProfileManager {
  static validateProfile(data: unknown): UserProfile {
    try {
      return UserProfileSchema.parse(data);
    } catch (error) {
      console.warn("[UserProfileManager] Invalid profile data:", error);
      return {};
    }
  }

  static mergeLocalStorageData(
    localStorageData: Record<string, any>
  ): UserProfile {
    const profile: UserProfile = {};

    // Map localStorage keys to profile structure
    if (localStorageData.user_country) {
      profile.locale = {
        country: localStorageData.user_country,
        ...(profile.locale || {}),
      };
    }

    if (localStorageData.user_timezone) {
      profile.locale = {
        timezone: localStorageData.user_timezone,
        ...(profile.locale || {}),
      };
    }

    if (localStorageData.user_prefs) {
      const prefs = JSON.parse(localStorageData.user_prefs);
      profile.locale = {
        currency: prefs.currency,
        dateFormat: prefs.dateFormat,
        ...(profile.locale || {}),
      };
    }

    if (localStorageData.user_units) {
      const units = JSON.parse(localStorageData.user_units);
      profile.locale = {
        units: units,
        ...(profile.locale || {}),
      };
    }

    if (localStorageData.user_address) {
      profile.address = JSON.parse(localStorageData.user_address);
    }

    if (localStorageData.user_travel_prefs) {
      profile.travelPrefs = JSON.parse(localStorageData.user_travel_prefs);
    }

    if (localStorageData.user_notif) {
      profile.notifications = JSON.parse(localStorageData.user_notif);
    }

    return profile;
  }

  static generatePersonalizationPrompt(profile: UserProfile): string {
    const prompts: string[] = [];

    // Location and cultural context
    if (profile.locale?.country) {
      prompts.push(`User is from ${profile.locale.country}`);
    }

    if (profile.address?.city) {
      prompts.push(
        `Currently located in ${profile.address.city}${
          profile.address.state ? ", " + profile.address.state : ""
        }`
      );
    }

    // Preferences and constraints
    if (profile.locale?.currency) {
      prompts.push(`Prefers ${profile.locale.currency} currency for pricing`);
    }

    if (profile.travelPrefs?.travelClass) {
      prompts.push(`Usually travels ${profile.travelPrefs.travelClass} class`);
    }

    if (profile.travelPrefs?.dietary) {
      prompts.push(`Dietary preference: ${profile.travelPrefs.dietary}`);
    }

    // Activity preferences
    if (profile.activityPreferences) {
      const prefs = profile.activityPreferences;
      const highPrefs: string[] = [];

      if ((prefs.adventureLevel || 0) >= 7)
        highPrefs.push("adventure activities");
      if ((prefs.culturalInterest || 0) >= 7)
        highPrefs.push("cultural experiences");
      if ((prefs.natureLover || 0) >= 7)
        highPrefs.push("nature and outdoor activities");
      if ((prefs.foodExploration || 0) >= 7) highPrefs.push("food exploration");
      if ((prefs.historicalSites || 0) >= 7) highPrefs.push("historical sites");

      if (highPrefs.length > 0) {
        prompts.push(`High interest in: ${highPrefs.join(", ")}`);
      }
    }

    // Behavioral insights
    if (profile.behaviorProfile?.planningStyle) {
      prompts.push(`Planning style: ${profile.behaviorProfile.planningStyle}`);
    }

    if (profile.contextualIntelligence?.crowdTolerance) {
      const tolerance = profile.contextualIntelligence.crowdTolerance;
      if (tolerance <= 3) prompts.push("Prefers less crowded locations");
      else if (tolerance >= 8)
        prompts.push("Comfortable with crowded tourist spots");
    }

    // Weather preferences
    if (profile.contextualIntelligence?.weatherSensitivity) {
      const weather = profile.contextualIntelligence.weatherSensitivity;
      if ((weather.heatTolerance || 0) <= 3)
        prompts.push("Sensitive to hot weather");
      if ((weather.coldTolerance || 0) <= 3)
        prompts.push("Sensitive to cold weather");
      if (weather.rainPreference === "avoid")
        prompts.push("Prefers to avoid rainy destinations");
    }

    return prompts.join(". ") + (prompts.length > 0 ? "." : "");
  }

  static inferPersonalityTraits(profile: UserProfile): Record<string, number> {
    const traits: Record<string, number> = {
      adventure_seeking: 0.5,
      cultural_curiosity: 0.5,
      comfort_preference: 0.5,
      social_interaction: 0.5,
      spontaneity: 0.5,
    };

    // Infer from activity preferences
    if (profile.activityPreferences?.adventureLevel) {
      traits.adventure_seeking =
        profile.activityPreferences.adventureLevel / 10;
    }

    if (profile.activityPreferences?.culturalInterest) {
      traits.cultural_curiosity =
        profile.activityPreferences.culturalInterest / 10;
    }

    // Infer from behavior profile
    if (profile.behaviorProfile?.planningStyle === "spontaneous") {
      traits.spontaneity = 0.9;
    } else if (profile.behaviorProfile?.planningStyle === "detailed") {
      traits.spontaneity = 0.2;
    }

    // Infer from travel class
    if (
      profile.travelPrefs?.travelClass === "business" ||
      profile.travelPrefs?.travelClass === "first"
    ) {
      traits.comfort_preference = 0.8;
    } else if (profile.travelPrefs?.travelClass === "economy") {
      traits.comfort_preference = 0.3;
    }

    return traits;
  }
}

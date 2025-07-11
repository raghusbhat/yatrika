import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { UserProfile, UserProfileManager } from "../utils/userProfile";
import { TravelConversationState } from "../utils/conversationState";

interface PersonalizationContext {
  userProfile: UserProfile;
  conversationState: TravelConversationState;
  currentIntent: string;
  sessionHistory: string[];
}

export class PersonalizationService {
  private geminiLLM: any;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY not set in environment");

    const genAI = new GoogleGenerativeAI(apiKey);
    this.geminiLLM = genAI.getGenerativeModel({
      model: "models/gemini-1.5-flash",
    });
  }

  // Simplified personalization prompt template for better quota management
  private masterTemplate = PromptTemplate.fromTemplate(`
You are Yātrika, an expert AI travel strategist providing personalized recommendations.

USER CONTEXT: {user_profile_summary}
TRAVEL DETAILS: Destination: {destination}, Group: {group_type}, Budget: {budget}
USER PREFERENCES: {preferences}

Provide a personalized response for: {response_type}

Keep the response conversational and helpful, incorporating the user's preferences and cultural context.
`);

  // Destination intelligence prompt
  private destinationIntelligenceTemplate = PromptTemplate.fromTemplate(`
Analyze the destination "{destination}" through the lens of this specific user's profile and preferences.

USER PERSONALIZATION CONTEXT:
{personalization_context}

CURRENT TRAVEL CONTEXT:
- Travel Dates: {travel_dates}
- Duration: {duration}
- Group: {group_type}
- Budget: {budget}

Provide destination intelligence including:
1. PERSONALIZED HIGHLIGHTS: Top 3-5 attractions/experiences matching their interests
2. CULTURAL COMPATIBILITY: How well this destination aligns with their background
3. TIMING OPTIMIZATION: Best times to visit based on their weather/crowd preferences
4. BUDGET ALIGNMENT: Cost expectations and money-saving tips for their travel class
5. PRACTICAL CONSIDERATIONS: Visa, language, accessibility needs
6. HIDDEN GEMS: Lesser-known spots matching their adventure/culture scores

Format as structured recommendation with reasoning for each suggestion.
`);

  // Activity sequencing and timing prompt
  private activitySequencingTemplate = PromptTemplate.fromTemplate(`
Create an optimized daily itinerary for {destination} that maximizes this user's satisfaction.

USER BEHAVIORAL PROFILE:
- Energy Patterns: Morning ({morning_energy}), Afternoon ({afternoon_energy}), Evening ({evening_energy})
- Planning Style: {planning_style}
- Crowd Tolerance: {crowd_tolerance}/10
- Adventure Level: {adventure_level}/10
- Cultural Interest: {cultural_interest}/10

TRAVEL CONTEXT:
Duration: {duration}
Group: {group_type}
Budget: {budget}
Special Requirements: {special_requirements}

OPTIMIZATION RULES:
1. Schedule high-energy activities during their peak energy times
2. Avoid crowded locations during peak hours if they prefer less crowds
3. Balance adventure and relaxation based on their preferences
4. Include buffer time based on their planning flexibility
5. Consider travel time and logistics between activities

Provide a day-by-day breakdown with timing rationale for each activity.
`);

  // Dynamic question generation for missing information
  private questionGenerationTemplate = PromptTemplate.fromTemplate(`
Based on this user's profile and current conversation state, generate the most relevant follow-up question to gather missing information.

USER CONTEXT:
{user_context}

MISSING INFORMATION:
{missing_slots}

CONVERSATION HISTORY:
{conversation_history}

PERSONALIZATION GUIDELINES:
1. Ask questions in their preferred communication style
2. Use examples relevant to their cultural background
3. Consider their decision-making speed (quick/thorough)
4. Avoid overwhelming detailed planners vs spontaneous travelers
5. Reference their past preferences when relevant

Generate 1 focused question that will most improve recommendation quality.
Include 2-3 smart default options based on their profile.
`);

  // Recommendation refinement prompt
  private refinementTemplate = PromptTemplate.fromTemplate(`
Refine and personalize this base travel recommendation using deep user insights.

BASE RECOMMENDATION:
{base_recommendation}

USER DEEP PROFILE:
{deep_profile}

REFINEMENT OBJECTIVES:
1. Adjust activity difficulty to match adventure level
2. Modify cuisine suggestions for dietary preferences
3. Optimize timing for their energy patterns and crowd tolerance
4. Adjust budget recommendations to their spending comfort
5. Include accessibility considerations
6. Add cultural context relevant to their background

Provide the refined recommendation with explanations for key personalizations.
`);

  async generatePersonalizedResponse(
    context: PersonalizationContext,
    responseType: string = "comprehensive"
  ): Promise<string> {
    // RATE LIMIT FIX: Skip API calls for personalization to reduce Gemini usage
    // Use template-based personalization instead to avoid additional API calls
    console.log(
      "[PersonalizationService] Using template-based personalization (rate limit optimization)"
    );

    // Always use fallback personalization to avoid additional API calls
    return this.generateFallbackPersonalizedResponse(context, responseType);
  }

  // Fallback personalization without API calls
  private generateFallbackPersonalizedResponse(
    context: PersonalizationContext,
    responseType: string
  ): string {
    const { userProfile, conversationState } = context;

    let response = "Great choice! ";

    // Add cultural context
    if (userProfile.locale?.country === "IN") {
      response += "As a fellow Indian traveler, ";
    }

    // Add destination-specific info
    if (conversationState.destination) {
      response += `${conversationState.destination} is a wonderful destination `;

      if (conversationState.groupType === "family") {
        response += "for families. ";
      } else if (conversationState.groupType === "couple") {
        response += "for couples. ";
      }
    }

    // Add budget consideration
    if (conversationState.budget === "flexible") {
      response += "With a flexible budget, you'll have great options. ";
    }

    // Add preferences
    const prefs = this.extractPreferences(userProfile);
    if (prefs !== "general interests") {
      response += `Given your interest in ${prefs}, I'll tailor the recommendations accordingly. `;
    }

    response += "Let me create a personalized itinerary for you!";

    return response;
  }

  async generateDestinationIntelligence(
    destination: string,
    context: PersonalizationContext
  ): Promise<string> {
    const personalizationContext =
      UserProfileManager.generatePersonalizationPrompt(context.userProfile);

    const prompt = await this.destinationIntelligenceTemplate.format({
      destination,
      personalization_context: personalizationContext,
      travel_dates: context.conversationState.travelDates || "flexible",
      duration: context.conversationState.duration || "not specified",
      group_type: context.conversationState.groupType || "not specified",
      budget: context.conversationState.budget || "flexible",
    });

    const result = await this.geminiLLM.generateContent(prompt);
    return result.response.text();
  }

  async generateOptimizedItinerary(
    context: PersonalizationContext
  ): Promise<string> {
    const energyPatterns = this.extractEnergyPatterns(context.userProfile);

    const prompt = await this.activitySequencingTemplate.format({
      destination: context.conversationState.destination || "the destination",
      duration: context.conversationState.duration || "3-5 days",
      group_type: context.conversationState.groupType || "travelers",
      budget: context.conversationState.budget || "moderate",
      special_requirements: this.extractSpecialRequirements(
        context.userProfile
      ),
      morning_energy: energyPatterns.morning,
      afternoon_energy: energyPatterns.afternoon,
      evening_energy: energyPatterns.evening,
      planning_style:
        context.userProfile.behaviorProfile?.planningStyle || "flexible",
      crowd_tolerance:
        context.userProfile.contextualIntelligence?.crowdTolerance || 5,
      adventure_level:
        context.userProfile.activityPreferences?.adventureLevel || 5,
      cultural_interest:
        context.userProfile.activityPreferences?.culturalInterest || 5,
    });

    const result = await this.geminiLLM.generateContent(prompt);
    return result.response.text();
  }

  async generatePersonalizedQuestion(
    missingSlots: string[],
    context: PersonalizationContext
  ): Promise<string> {
    const userContext = this.buildUserContextSummary(context.userProfile);

    const prompt = await this.questionGenerationTemplate.format({
      user_context: userContext,
      missing_slots: missingSlots.join(", "),
      conversation_history: context.sessionHistory.slice(-3).join("\n"),
    });

    const result = await this.geminiLLM.generateContent(prompt);
    return result.response.text();
  }

  async refineRecommendation(
    baseRecommendation: string,
    context: PersonalizationContext
  ): Promise<string> {
    const deepProfile = this.buildDeepProfileSummary(context.userProfile);

    const prompt = await this.refinementTemplate.format({
      base_recommendation: baseRecommendation,
      deep_profile: deepProfile,
    });

    const result = await this.geminiLLM.generateContent(prompt);
    return result.response.text();
  }

  // Utility methods for profile analysis
  private getWeatherSensitivityText(profile: UserProfile): string {
    const weather = profile.contextualIntelligence?.weatherSensitivity;
    if (!weather) return "normal weather tolerance";

    const traits: string[] = [];
    if ((weather.heatTolerance || 5) <= 3) traits.push("heat-sensitive");
    if ((weather.coldTolerance || 5) <= 3) traits.push("cold-sensitive");
    if (weather.rainPreference === "avoid") traits.push("rain-averse");

    return traits.length > 0 ? traits.join(", ") : "normal weather tolerance";
  }

  private getCrowdToleranceText(profile: UserProfile): string {
    const tolerance = profile.contextualIntelligence?.crowdTolerance || 5;
    if (tolerance <= 3) return "prefers quieter, less crowded experiences";
    if (tolerance >= 8) return "comfortable with busy, popular attractions";
    return "moderate crowd tolerance";
  }

  private extractEnergyPatterns(profile: UserProfile): {
    morning: number;
    afternoon: number;
    evening: number;
  } {
    // Default energy patterns or extract from profile
    return {
      morning: 0.8,
      afternoon: 0.7,
      evening: 0.6,
    };
  }

  private extractSpecialRequirements(profile: UserProfile): string {
    const requirements: string[] = [];

    if (profile.travelPrefs?.accessibility) {
      requirements.push(`Accessibility: ${profile.travelPrefs.accessibility}`);
    }

    if (profile.travelPrefs?.dietary) {
      requirements.push(`Dietary: ${profile.travelPrefs.dietary}`);
    }

    if (profile.travelConstraints?.physicalLimitations?.length) {
      requirements.push(
        `Physical considerations: ${profile.travelConstraints.physicalLimitations.join(
          ", "
        )}`
      );
    }

    return requirements.join("; ") || "none specified";
  }

  private buildUserContextSummary(profile: UserProfile): string {
    const summary: string[] = [];

    if (profile.locale?.country) {
      summary.push(`From ${profile.locale.country}`);
    }

    if (profile.behaviorProfile?.planningStyle) {
      summary.push(`${profile.behaviorProfile.planningStyle} planner`);
    }

    if (profile.aiLearningData?.conversationStyle) {
      summary.push(
        `prefers ${profile.aiLearningData.conversationStyle} communication`
      );
    }

    return summary.join(", ");
  }

  private buildDeepProfileSummary(profile: UserProfile): string {
    return JSON.stringify(
      {
        activityPreferences: profile.activityPreferences,
        behaviorProfile: profile.behaviorProfile,
        contextualIntelligence: profile.contextualIntelligence,
        travelConstraints: profile.travelConstraints,
      },
      null,
      2
    );
  }

  private extractConstraints(profile: UserProfile): string {
    const constraints: string[] = [];

    if (profile.travelPrefs?.accessibility) {
      constraints.push(`Accessibility: ${profile.travelPrefs.accessibility}`);
    }

    if (profile.travelConstraints?.physicalLimitations?.length) {
      constraints.push(
        `Physical: ${profile.travelConstraints.physicalLimitations.join(", ")}`
      );
    }

    return constraints.join("; ") || "none specified";
  }

  private extractPreferences(profile: UserProfile): string {
    const prefs: string[] = [];

    if (profile.activityPreferences) {
      const activity = profile.activityPreferences;
      if ((activity.adventureLevel || 0) >= 7) prefs.push("high adventure");
      if ((activity.culturalInterest || 0) >= 7)
        prefs.push("cultural immersion");
      if ((activity.foodExploration || 0) >= 7)
        prefs.push("culinary experiences");
    }

    // Add dietary preferences
    if (profile.travelPrefs?.dietary) {
      prefs.push(`${profile.travelPrefs.dietary} dining`);
    }

    return prefs.join(", ") || "general interests";
  }
}

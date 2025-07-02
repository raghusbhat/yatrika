import {
  ClarificationState,
  ClarificationStateSchema,
} from "../utils/validation";
import { TravelConversationState } from "../utils/conversationState";
import { UserProfile, UserProfileManager } from "../utils/userProfile";
import { PersonalizationService } from "./personalizationService";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { PromptTemplate } from "@langchain/core/prompts";
import {
  RunnableSequence,
  RunnablePassthrough,
} from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { z } from "zod";

interface EnhancedClarificationState extends ClarificationState {
  userProfile?: UserProfile;
  personalizationScore?: number;
  adaptivePrompts?: string[];
  contextualInsights?: string[];
}

interface PersonalizedResponse {
  response: string;
  confidence: number;
  personalizationApplied: string[];
  nextOptimalQuestion?: string;
}

export class EnhancedLangGraphService {
  private geminiLLM: any;
  private personalizationService: PersonalizationService;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY not set in environment");

    const genAI = new GoogleGenerativeAI(apiKey);
    this.geminiLLM = genAI.getGenerativeModel({
      model: "models/gemini-1.5-pro",
    });
    this.personalizationService = new PersonalizationService();
  }

  // Enhanced slot extraction with personalization context
  private personalizedExtractionTemplate = PromptTemplate.fromTemplate(`
You are analyzing user input for travel planning with deep personalization context.

USER PROFILE CONTEXT:
{user_profile_context}

USER INPUT: "{user_input}"

PREVIOUS CONVERSATION STATE:
{conversation_state}

Extract travel information and provide personalized interpretations:

Return a JSON object with:
1. extracted_data: Standard travel slots (destination, dates, budget, etc.)
2. personalized_insights: How user profile influences interpretation
3. confidence_scores: 0-1 for each extracted field
4. suggested_clarifications: Smart follow-up questions based on profile

Consider:
- Cultural context for destination preferences
- Budget interpretation based on their travel class
- Activity suggestions matching their interest scores
- Communication style adaptation

JSON Response:
`);

  // Adaptive questioning based on user profile
  private adaptiveQuestionTemplate = PromptTemplate.fromTemplate(`
Generate the next most valuable question for this user based on their profile and conversation state.

USER PROFILE INSIGHTS:
{profile_insights}

CONVERSATION STATE:
{conversation_state}

MISSING INFORMATION:
{missing_slots}

PERSONALIZATION RULES:
1. Consider their decision-making speed: {decision_speed}
2. Match communication style: {communication_style}
3. Respect planning preference: {planning_style}
4. Include cultural context: {cultural_context}

Generate:
1. Primary question (personalized and contextual)
2. 3-4 smart options based on their profile
3. Brief explanation of why this question optimizes their experience

Response format: Conversational and engaging
`);

  // Context-aware response generation
  private contextualResponseTemplate = PromptTemplate.fromTemplate(`
Generate a highly personalized travel response using all available context.

USER DEEP PROFILE:
{user_profile}

TRAVEL CONTEXT:
{travel_context}

CONVERSATION HISTORY:
{conversation_history}

PERSONALIZATION OBJECTIVES:
1. Cultural Sensitivity: Adapt to their background
2. Communication Style: Match their preference
3. Decision Support: Align with their decision-making style
4. Value Optimization: Focus on what matters most to them
5. Practical Relevance: Consider their constraints and preferences

Generate a response that feels tailor-made for this specific user.
Include reasoning for key recommendations.
Anticipate their likely next questions.
`);

  async runEnhancedClarificationGraph(
    input: string,
    state: ClarificationState,
    userProfile?: UserProfile
  ): Promise<{
    nextPrompt?: string;
    updatedState: EnhancedClarificationState;
    personalizedResponse?: PersonalizedResponse;
    thoughtChain: Array<{
      step: string;
      prompt: string;
      response: string;
      personalization?: string;
    }>;
  }> {
    const thoughtChain: Array<{
      step: string;
      prompt: string;
      response: string;
      personalization?: string;
    }> = [];

    try {
      // Enhanced state with personalization
      let enhancedState: EnhancedClarificationState = {
        ...state,
        userProfile,
        personalizationScore: userProfile
          ? this.calculatePersonalizationScore(userProfile)
          : 0,
        adaptivePrompts: [],
        contextualInsights: [],
      };

      // 1. Profile-aware input analysis
      if (input && input.trim() !== "") {
        const personalizedExtraction = await this.extractWithPersonalization(
          input,
          enhancedState,
          thoughtChain
        );

        // Update state with extracted and personalized data
        enhancedState = {
          ...enhancedState,
          ...personalizedExtraction.extractedData,
          contextualInsights: personalizedExtraction.insights,
        };
      }

      // 2. Determine next action based on completeness and personalization
      const missingSlots = this.identifyMissingSlots(enhancedState);

      if (missingSlots.length === 0) {
        // All slots filled - generate personalized itinerary
        const personalizedItinerary = await this.generatePersonalizedItinerary(
          enhancedState,
          thoughtChain
        );

        return {
          nextPrompt: personalizedItinerary.response,
          updatedState: { ...enhancedState, isPlanReady: true },
          personalizedResponse: personalizedItinerary,
          thoughtChain,
        };
      }

      // 3. Generate adaptive next question
      const nextQuestion = await this.generateAdaptiveQuestion(
        missingSlots,
        enhancedState,
        thoughtChain
      );

      return {
        nextPrompt: nextQuestion.response,
        updatedState: enhancedState,
        personalizedResponse: nextQuestion,
        thoughtChain,
      };
    } catch (err) {
      console.error("[EnhancedLangGraphService] Error:", err);
      throw new Error("Enhanced clarification service error.");
    }
  }

  private async extractWithPersonalization(
    input: string,
    state: EnhancedClarificationState,
    thoughtChain: Array<any>
  ): Promise<{
    extractedData: Partial<ClarificationState>;
    insights: string[];
    confidence: Record<string, number>;
  }> {
    const userProfileContext = state.userProfile
      ? UserProfileManager.generatePersonalizationPrompt(state.userProfile)
      : "No user profile available";

    const prompt = await this.personalizedExtractionTemplate.format({
      user_profile_context: userProfileContext,
      user_input: input,
      conversation_state: JSON.stringify(state, null, 2),
    });

    const result = await this.geminiLLM.generateContent(prompt);
    const responseText = result.response.text();

    thoughtChain.push({
      step: "personalized-extraction",
      prompt: prompt,
      response: responseText,
      personalization:
        "Applied user profile context for enhanced interpretation",
    });

    try {
      const parsed = JSON.parse(responseText);
      return {
        extractedData: parsed.extracted_data || {},
        insights: parsed.personalized_insights || [],
        confidence: parsed.confidence_scores || {},
      };
    } catch (e) {
      console.error("Failed to parse personalized extraction:", responseText);
      return {
        extractedData: {},
        insights: [],
        confidence: {},
      };
    }
  }

  private async generateAdaptiveQuestion(
    missingSlots: string[],
    state: EnhancedClarificationState,
    thoughtChain: Array<any>
  ): Promise<PersonalizedResponse> {
    if (!state.userProfile) {
      // Fallback to basic questioning
      return this.generateBasicQuestion(missingSlots[0]);
    }

    const profileInsights = this.extractProfileInsights(state.userProfile);

    const prompt = await this.adaptiveQuestionTemplate.format({
      profile_insights: JSON.stringify(profileInsights, null, 2),
      conversation_state: JSON.stringify(state, null, 2),
      missing_slots: missingSlots.join(", "),
      decision_speed:
        state.userProfile.behaviorProfile?.decisionSpeed || "moderate",
      communication_style:
        state.userProfile.aiLearningData?.conversationStyle || "friendly",
      planning_style:
        state.userProfile.behaviorProfile?.planningStyle || "flexible",
      cultural_context: state.userProfile.locale?.country || "international",
    });

    const result = await this.geminiLLM.generateContent(prompt);
    const response = result.response.text();

    thoughtChain.push({
      step: "adaptive-questioning",
      prompt: prompt,
      response: response,
      personalization: "Generated contextual question based on user profile",
    });

    return {
      response,
      confidence: 0.9,
      personalizationApplied: [
        "profile-based-questioning",
        "cultural-context",
        "communication-style",
      ],
    };
  }

  private async generatePersonalizedItinerary(
    state: EnhancedClarificationState,
    thoughtChain: Array<any>
  ): Promise<PersonalizedResponse> {
    if (!state.userProfile) {
      return this.generateBasicItinerary(state);
    }

    const travelContext = this.buildTravelContext(state);
    const conversationHistory = state.inputHistory.join("\n");

    const prompt = await this.contextualResponseTemplate.format({
      user_profile: JSON.stringify(state.userProfile, null, 2),
      travel_context: travelContext,
      conversation_history: conversationHistory,
    });

    const result = await this.geminiLLM.generateContent(prompt);
    const response = result.response.text();

    thoughtChain.push({
      step: "personalized-itinerary",
      prompt: prompt,
      response: response,
      personalization: "Full personalization applied with user profile context",
    });

    return {
      response,
      confidence: 0.95,
      personalizationApplied: [
        "cultural-adaptation",
        "activity-preferences",
        "budget-optimization",
        "timing-preferences",
        "communication-style",
      ],
    };
  }

  // Advanced LangChain techniques implementation
  async createPersonalizationChain(userProfile: UserProfile) {
    const personalizedPrompt = PromptTemplate.fromTemplate(`
    Based on user profile: {profile}
    Travel query: {query}
    Generate personalized response: {format_instructions}
    `);

    const chain = RunnableSequence.from([
      RunnablePassthrough.assign({
        profile: () => JSON.stringify(userProfile),
        format_instructions: () =>
          "Provide detailed, personalized travel advice",
      }),
      personalizedPrompt,
      this.geminiLLM,
      new StringOutputParser(),
    ]);

    return chain;
  }

  async runWithMemory(
    input: string,
    conversationMemory: string[],
    userProfile: UserProfile
  ) {
    // Implement conversation memory and learning
    const memoryContext = conversationMemory.slice(-5).join("\n");

    const memoryPrompt = PromptTemplate.fromTemplate(`
    Previous conversation context: {memory}
    User profile: {profile}
    Current input: {input}
    
    Provide response that builds on conversation history and user preferences.
    `);

    const result = await memoryPrompt.format({
      memory: memoryContext,
      profile: JSON.stringify(userProfile),
      input,
    });

    return await this.geminiLLM.generateContent(result);
  }

  // Utility methods
  private calculatePersonalizationScore(profile: UserProfile): number {
    let score = 0;
    const maxScore = 10;

    if (profile.locale) score += 1;
    if (profile.travelPrefs) score += 1;
    if (profile.activityPreferences) score += 2;
    if (profile.behaviorProfile) score += 2;
    if (profile.contextualIntelligence) score += 2;
    if (profile.aiLearningData) score += 2;

    return score / maxScore;
  }

  private identifyMissingSlots(state: EnhancedClarificationState): string[] {
    const requiredSlots = ["destination", "groupType", "budget", "interests"];
    return requiredSlots.filter(
      (slot) =>
        !state[slot as keyof ClarificationState] ||
        (Array.isArray(state[slot as keyof ClarificationState]) &&
          (state[slot as keyof ClarificationState] as any[]).length === 0)
    );
  }

  private extractProfileInsights(profile: UserProfile) {
    return {
      preferences: profile.activityPreferences,
      behavior: profile.behaviorProfile,
      constraints: profile.travelConstraints,
      context: profile.contextualIntelligence,
    };
  }

  private buildTravelContext(state: EnhancedClarificationState): string {
    return JSON.stringify(
      {
        destination: state.destination,
        groupType: state.groupType,
        budget: state.budget,
        interests: state.interests,
        travelDates: state.travelDates,
        duration: state.duration,
      },
      null,
      2
    );
  }

  private generateBasicQuestion(missingSlot: string): PersonalizedResponse {
    const questions = {
      destination: "Where would you like to travel?",
      groupType: "Who will be traveling with you?",
      budget: "What's your approximate budget for this trip?",
      interests: "What are your main interests for this trip?",
    };

    return {
      response:
        questions[missingSlot as keyof typeof questions] ||
        "Please provide more details.",
      confidence: 0.5,
      personalizationApplied: [],
    };
  }

  private generateBasicItinerary(
    state: EnhancedClarificationState
  ): PersonalizedResponse {
    return {
      response:
        "Great! I have all the information needed. Let me create your travel plan.",
      confidence: 0.7,
      personalizationApplied: [],
    };
  }
}

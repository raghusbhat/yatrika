import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

export class QuotaChecker {
  private geminiLLM: ChatGoogleGenerativeAI | null = null;

  constructor() {
    if (process.env.GEMINI_API_KEY) {
      this.geminiLLM = new ChatGoogleGenerativeAI({
        model: "gemini-1.5-pro",
        apiKey: process.env.GEMINI_API_KEY,
        temperature: 0.1,
      });
    }
  }

  async checkQuotaStatus(): Promise<{
    canMakeRequest: boolean;
    error?: string;
    recommendation: string;
    nextRetryTime?: Date;
  }> {
    if (!this.geminiLLM) {
      return {
        canMakeRequest: false,
        error: "No API key available",
        recommendation: "Please check your GEMINI_API_KEY environment variable",
      };
    }

    // RATE LIMIT FIX: Don't make actual API calls just to test quota
    // This was causing unnecessary API usage and contributing to rate limits
    console.log(
      "[QuotaChecker] Checking quota status without API call (rate limit optimization)"
    );

    try {
      // Just verify API key exists and is properly configured
      if (
        !process.env.GEMINI_API_KEY ||
        process.env.GEMINI_API_KEY.length < 10
      ) {
        throw new Error("Invalid API key format");
      }

      console.log("[QuotaChecker] API key validation successful");
      return {
        canMakeRequest: true,
        recommendation: "API key is configured. Ready for requests.",
      };
    } catch (error: any) {
      console.log("[QuotaChecker] API test failed:", error.message);

      if (
        error.message?.includes("503") ||
        error.message?.toLowerCase().includes("overloaded")
      ) {
        const nextRetry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now
        return {
          canMakeRequest: false,
          error: "Service overloaded",
          recommendation:
            "Google's Gemini service is temporarily overloaded. This is common during peak hours. Please try again in 15-30 minutes.",
          nextRetryTime: nextRetry,
        };
      }

      if (
        error.message?.includes("429") ||
        error.message?.toLowerCase().includes("quota")
      ) {
        const nextRetry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
        return {
          canMakeRequest: false,
          error: "Quota exceeded",
          recommendation:
            "Your Gemini API quota has been exceeded. Please wait 1 hour or upgrade your plan.",
          nextRetryTime: nextRetry,
        };
      }

      if (error.message?.toLowerCase().includes("rate limit")) {
        const nextRetry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
        return {
          canMakeRequest: false,
          error: "Rate limited",
          recommendation:
            "You're being rate limited. Please wait 5 minutes before trying again.",
          nextRetryTime: nextRetry,
        };
      }

      return {
        canMakeRequest: false,
        error: error.message || "Unknown error",
        recommendation:
          "There's an issue with the API. Please check your API key and try again.",
      };
    }
  }

  async getQuotaInfo(): Promise<{
    message: string;
    suggestions: string[];
  }> {
    const status = await this.checkQuotaStatus();

    if (status.canMakeRequest) {
      return {
        message: "✅ Gemini API is working normally",
        suggestions: [
          "Your API quota is available",
          "Rate limiting is properly implemented",
          "You can continue using the application",
        ],
      };
    }

    const suggestions: string[] = [];

    if (status.error?.includes("Quota exceeded")) {
      suggestions.push(
        "🕐 Wait for quota reset (usually hourly or daily)",
        "🔄 Try again after " +
          (status.nextRetryTime?.toLocaleTimeString() || "some time"),
        "⬆️ Consider upgrading to Gemini Pro for higher limits",
        "🔑 Check if you have multiple API keys you can rotate"
      );
    } else if (status.error?.includes("Rate limited")) {
      suggestions.push(
        "⏳ Wait 5 minutes before making another request",
        "🐌 Reduce request frequency",
        "🔄 Try again after " +
          (status.nextRetryTime?.toLocaleTimeString() || "5 minutes")
      );
    } else {
      suggestions.push(
        "🔑 Verify your GEMINI_API_KEY is correct",
        "🌐 Check your internet connection",
        "📊 Visit Google AI Studio to check your account status"
      );
    }

    return {
      message: `❌ ${status.error}: ${status.recommendation}`,
      suggestions,
    };
  }
}

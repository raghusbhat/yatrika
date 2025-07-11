import dotenv from "dotenv";
import path from "path";

// Explicitly load the .env file from the current working directory.
const envPath = path.resolve(process.cwd(), ".env");
const result = dotenv.config({ path: envPath, debug: true });

console.log(`[Environment] Attempting to load .env file from: ${envPath}`);
if (result.error) {
  console.error("[Environment] FATAL: Error loading .env file:", result.error);
} else if (result.parsed) {
  console.log("[Environment] SUCCESS: .env file loaded and parsed.");
  // console.log('[Environment] Parsed variables:', result.parsed); // Uncomment for deep debugging
} else {
  console.warn("[Environment] WARNING: .env file not found or is empty.");
}

interface EnvironmentConfig {
  PORT: number;
  GEMINI_API_KEY: string | null;
  NODE_ENV: string;
  isProduction: boolean;
  isDevelopment: boolean;
}

class EnvironmentValidator {
  private static logError(variable: string, fallback?: any) {
    const message = fallback
      ? `[Environment] Missing ${variable}, using fallback: ${fallback}`
      : `[Environment] Critical: Missing required variable ${variable}`;

    console.warn(message);
  }

  private static logInfo(variable: string, value: any) {
    console.log(`[Environment] ${variable}: ${value ? "✓ Set" : "✗ Missing"}`);
  }

  static validate(): EnvironmentConfig {
    // Required environment variables
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY || null;

    // Optional with fallbacks
    const PORT = parseInt(process.env.PORT || "3001", 10);
    const NODE_ENV = process.env.NODE_ENV || "development";

    // Log status
    this.logInfo("GEMINI_API_KEY", GEMINI_API_KEY);
    this.logInfo("PORT", PORT);
    this.logInfo("NODE_ENV", NODE_ENV);

    // Warn about missing critical keys
    if (!GEMINI_API_KEY) {
      this.logError("GEMINI_API_KEY");
    }

    return {
      PORT,
      GEMINI_API_KEY,
      NODE_ENV,
      isProduction: NODE_ENV === "production",
      isDevelopment: NODE_ENV === "development",
    };
  }

  static requireGeminiKey(): string {
    const config = this.validate();
    if (!config.GEMINI_API_KEY) {
      throw new Error(
        "GEMINI_API_KEY is required but not set. Please add it to your .env file."
      );
    }
    return config.GEMINI_API_KEY;
  }


}

// Export singleton config
export const env = EnvironmentValidator.validate();
export { EnvironmentValidator };

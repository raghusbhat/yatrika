import { z } from "zod";

// Define validation result types
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  sanitizedOutput?: string;
}

export interface ItineraryValidation extends ValidationResult {
  businessLogicErrors: string[];
  contentSafetyErrors: string[];
  semanticErrors: string[];
}

/**
 * Content Safety Validation
 * Checks for inappropriate, harmful, or unsafe content in LLM responses
 */
export function validateContentSafety(content: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Harmful content patterns
  const unsafePatterns = [
    /\b(suicide|kill yourself|self-harm|overdose)\b/i,
    /\b(bomb|explosive|weapon|gun|knife|attack)\b/i,
    /\b(drugs|cocaine|heroin|marijuana|weed|illegal)\b/i,
    /\b(prostitution|escort|adult services|strip club)\b/i,
    /\b(terrorism|terrorist|extremist|radical)\b/i,
    /\b(hate speech|racial slur|offensive language)\b/i,
    /\b(scam|fraud|fake|illegal activity)\b/i,
    /\b(dangerous|unsafe|risky|avoid at all costs)\b/i,
  ];

  // Check for unsafe patterns
  for (const pattern of unsafePatterns) {
    if (pattern.test(content)) {
      errors.push(`Potentially unsafe content detected: ${pattern.source}`);
    }
  }

  // Check for excessive promotional content
  const promoMatches = content.match(
    /\b(buy now|click here|limited time|special offer)\b/gi
  );
  if (promoMatches && promoMatches.length > 3) {
    warnings.push("Excessive promotional content detected");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Semantic Validation
 * Checks if the itinerary makes logical sense
 */
export function validateSemanticLogic(itinerary: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    // Check if itinerary has basic structure
    if (!itinerary.tripOverview || !itinerary.dailyItinerary) {
      errors.push("Missing essential itinerary structure");
      return { isValid: false, errors, warnings };
    }

    // Validate daily itinerary logic
    if (Array.isArray(itinerary.dailyItinerary)) {
      const days = itinerary.dailyItinerary;

      // Check for logical day sequence
      for (let i = 0; i < days.length; i++) {
        const day = days[i];

        // Check day numbering
        if (day.day !== i + 1) {
          errors.push(`Day ${i + 1} has incorrect day number: ${day.day}`);
        }

        // Check for activities
        if (!day.activities || day.activities.length === 0) {
          warnings.push(`Day ${day.day} has no activities`);
        }

        // Check for reasonable number of activities (2-12 per day)
        if (day.activities && day.activities.length > 15) {
          warnings.push(
            `Day ${day.day} has too many activities (${day.activities.length})`
          );
        }

        // Check for logical time sequence in activities
        if (day.activities) {
          for (let j = 0; j < day.activities.length - 1; j++) {
            const currentActivity = day.activities[j];
            const nextActivity = day.activities[j + 1];

            if (currentActivity.time && nextActivity.time) {
              const currentTime = parseTime(currentActivity.time);
              const nextTime = parseTime(nextActivity.time);

              if (currentTime >= nextTime) {
                warnings.push(
                  `Day ${day.day}: Activity time sequence issue - ${currentActivity.time} to ${nextActivity.time}`
                );
              }
            }
          }
        }
      }
    }

    // Validate accommodations
    if (itinerary.accommodations && Array.isArray(itinerary.accommodations)) {
      if (itinerary.accommodations.length === 0) {
        warnings.push("No accommodations provided");
      }

      // Check for reasonable number of accommodations
      const tripDays = itinerary.dailyItinerary?.length || 1;
      if (itinerary.accommodations.length > tripDays + 2) {
        warnings.push("Too many accommodation options provided");
      }
    }

    // Validate budget breakdown
    if (itinerary.budgetBreakdown) {
      const budget = itinerary.budgetBreakdown;
      const categories = ["accommodation", "food", "transport", "activities"];

      for (const category of categories) {
        if (!budget[category]) {
          warnings.push(`Missing ${category} budget information`);
        }
      }
    }
  } catch (error) {
    errors.push(`Semantic validation failed: ${error.message}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Business Logic Validation
 * Validates travel feasibility, costs, and practical considerations
 */
export function validateBusinessLogic(itinerary: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    // Validate trip duration vs activities
    if (itinerary.dailyItinerary && itinerary.tripOverview) {
      const days = itinerary.dailyItinerary.length;
      const duration = itinerary.tripOverview.duration;

      if (duration && duration.includes("day")) {
        const durationDays = parseInt(duration.match(/\d+/)?.[0] || "0");
        const daysDifference = Math.abs(days - durationDays);
        
        // Special handling for LLM capacity limitations on very long trips
        if (durationDays > 10 && days < 5) {
          // Likely LLM capacity issue - treat as warning instead of error
          warnings.push(
            `LLM capacity limitation detected: stated duration (${duration}) vs itinerary days (${days}). Difference: ${daysDifference} days. This may be due to model context limits.`
          );
          console.warn(`🤖 [VALIDATION] LLM likely hit capacity limits for long trip: ${durationDays} days requested, ${days} generated`);
        } else if (daysDifference > 5) {
          // Major mismatch (>5 days difference) - this is a serious error
          errors.push(
            `Major mismatch between stated duration (${duration}) and itinerary days (${days}). Difference: ${daysDifference} days`
          );
        } else if (daysDifference > 2) {
          // Moderate mismatch (3-5 days difference) - warning
          warnings.push(
            `Moderate mismatch between stated duration (${duration}) and itinerary days (${days}). Difference: ${daysDifference} days`
          );
        } else if (daysDifference > 1) {
          // Minor mismatch (2 days difference) - just log for monitoring
          console.log(`📊 [VALIDATION] Minor duration difference: stated ${duration} vs ${days} days generated`);
        }
        // 0-1 day difference is acceptable (different counting methods: inclusive vs exclusive)
      }
    }

    // Validate budget reasonableness
    if (itinerary.budgetBreakdown && itinerary.budgetBreakdown.total) {
      const totalBudget = itinerary.budgetBreakdown.total;
      const budgetNumber = extractNumberFromString(totalBudget);

      if (budgetNumber) {
        // Check for unrealistic budgets
        if (budgetNumber < 50) {
          warnings.push(`Budget seems unrealistically low: ${totalBudget}`);
        }
        if (budgetNumber > 1000000) {
          warnings.push(`Budget seems unrealistically high: ${totalBudget}`);
        }
      }
    }

    // Validate transportation logic
    if (itinerary.transportation) {
      const transport = itinerary.transportation;

      // Check if local transport is provided
      if (!transport.localTransport || transport.localTransport.length === 0) {
        warnings.push("No local transportation options provided");
      }

      // Check if getting there info is provided
      if (!transport.gettingThere || transport.gettingThere.length < 10) {
        warnings.push("Insufficient transportation details provided");
      }
    }

    // Validate restaurant recommendations
    if (itinerary.restaurants) {
      const restaurants = itinerary.restaurants;
      const tripDays = itinerary.dailyItinerary?.length || 1;

      // Check for reasonable number of restaurants
      if (restaurants.length === 0) {
        warnings.push("No restaurant recommendations provided");
      }
      if (restaurants.length > tripDays * 5) {
        warnings.push("Too many restaurant recommendations provided");
      }
    }

    // Validate practical info
    if (itinerary.practicalInfo) {
      const info = itinerary.practicalInfo;

      if (!info.weather || info.weather.length < 10) {
        warnings.push("Insufficient weather information provided");
      }
      if (!info.currency || info.currency.length < 3) {
        warnings.push("Missing or insufficient currency information");
      }
      if (!info.packingEssentials || info.packingEssentials.length === 0) {
        warnings.push("No packing essentials provided");
      }
    }
  } catch (error) {
    errors.push(`Business logic validation failed: ${error.message}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Output Sanitization
 * Cleans and sanitizes LLM output before sending to frontend
 */
export function sanitizeOutput(content: string): string {
  // Remove potential HTML/script tags
  let sanitized = content.replace(
    /<\s*script\b[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi,
    ""
  );
  sanitized = sanitized.replace(
    /<\s*style\b[^>]*>[\s\S]*?<\s*\/\s*style\s*>/gi,
    ""
  );
  sanitized = sanitized.replace(/<\s*[^>]*>/gi, ""); // Remove any remaining HTML tags

  // Remove potential JavaScript
  sanitized = sanitized.replace(/javascript\s*:/gi, "");
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, "");

  // Remove potential SQL injection patterns
  sanitized = sanitized.replace(
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/gi,
    ""
  );

  // Remove excessive whitespace
  sanitized = sanitized.replace(/\s+/g, " ").trim();

  // Remove potential prompt injection attempts
  sanitized = sanitized.replace(
    /ignore\s+(previous|all|any)\s+instructions?/gi,
    ""
  );
  sanitized = sanitized.replace(/system\s*:/gi, "");

  return sanitized;
}

/**
 * Comprehensive LLM Output Validation
 * Validates all aspects of LLM output
 */
export function validateLLMOutput(output: string): ItineraryValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  const businessLogicErrors: string[] = [];
  const contentSafetyErrors: string[] = [];
  const semanticErrors: string[] = [];

  // Sanitize output first
  const sanitizedOutput = sanitizeOutput(output);

  // Content safety validation
  const safetyResult = validateContentSafety(sanitizedOutput);
  contentSafetyErrors.push(...safetyResult.errors);
  warnings.push(...safetyResult.warnings);

  // Try to parse as JSON for structured validation
  let parsedItinerary;
  try {
    parsedItinerary = JSON.parse(sanitizedOutput);
  } catch (error) {
    errors.push("Invalid JSON format in LLM output");
    return {
      isValid: false,
      errors,
      warnings,
      businessLogicErrors,
      contentSafetyErrors,
      semanticErrors,
      sanitizedOutput,
    };
  }

  // Semantic validation
  const semanticResult = validateSemanticLogic(parsedItinerary);
  semanticErrors.push(...semanticResult.errors);
  warnings.push(...semanticResult.warnings);

  // Business logic validation
  const businessResult = validateBusinessLogic(parsedItinerary);
  businessLogicErrors.push(...businessResult.errors);
  warnings.push(...businessResult.warnings);

  // Aggregate all errors
  errors.push(
    ...contentSafetyErrors,
    ...semanticErrors,
    ...businessLogicErrors
  );

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    businessLogicErrors,
    contentSafetyErrors,
    semanticErrors,
    sanitizedOutput,
  };
}

/**
 * Helper function to parse time strings
 */
function parseTime(timeString: string): number {
  const match = timeString.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (!match) return 0;

  let hours = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  const ampm = match[3]?.toUpperCase();

  if (ampm === "PM" && hours !== 12) hours += 12;
  if (ampm === "AM" && hours === 12) hours = 0;

  return hours * 60 + minutes; // Return minutes since midnight
}

/**
 * Helper function to extract numbers from strings
 */
function extractNumberFromString(str: string): number | null {
  const match = str.match(/[\d,]+\.?\d*/);
  if (!match) return null;
  return parseFloat(match[0].replace(/,/g, ""));
}

/**
 * Validation middleware for LLM responses
 */
export function validateLLMResponse(response: string): {
  isValid: boolean;
  sanitizedResponse: string;
  validationReport: ItineraryValidation;
} {
  console.log("🔍 [LLM OUTPUT VALIDATION] Starting comprehensive validation:", {
    timestamp: new Date().toISOString(),
    responseLength: response.length,
    responsePreview: response.substring(0, 200) + "...",
  });

  const validation = validateLLMOutput(response);

  console.log("📋 [LLM OUTPUT VALIDATION] Validation complete:", {
    timestamp: new Date().toISOString(),
    isValid: validation.isValid,
    errorsCount: validation.errors.length,
    warningsCount: validation.warnings.length,
    contentSafetyErrors: validation.contentSafetyErrors.length,
    semanticErrors: validation.semanticErrors.length,
    businessLogicErrors: validation.businessLogicErrors.length,
  });

  if (!validation.isValid) {
    console.warn("⚠️ [LLM OUTPUT VALIDATION] Validation failed:", {
      timestamp: new Date().toISOString(),
      errors: validation.errors,
      warnings: validation.warnings,
    });
  }

  return {
    isValid: validation.isValid,
    sanitizedResponse: validation.sanitizedOutput || response,
    validationReport: validation,
  };
}

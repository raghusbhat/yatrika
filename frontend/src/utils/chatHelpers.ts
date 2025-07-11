import { format, differenceInCalendarDays } from "date-fns";
import { GROUP_TYPE_CHIPS } from "@/constants/chatInterface";
import type { ClarificationState } from "@/types/clarification";

// Helper to detect which chips to show based on prompt
export function getChipsForPrompt(prompt: string) {
  if (/who is traveling|group type/i.test(prompt)) return GROUP_TYPE_CHIPS;
  return null;
}

// Format date range for display
export function formatDateRange(
  startDate?: Date,
  endDate?: Date,
  flexibleDates?: boolean
) {
  if (flexibleDates) {
    return { dateRange: "Flexible dates", days: null };
  }
  if (startDate && endDate) {
    const start = format(new Date(startDate), "MMM dd");
    const end = format(new Date(endDate), "MMM dd, yyyy");
    const days =
      differenceInCalendarDays(new Date(endDate), new Date(startDate)) + 1;
    return {
      dateRange: `${start} - ${end}`,
      days: `${days} ${days === 1 ? "day" : "days"}`,
    };
  }
  return { dateRange: "Dates not specified", days: null };
}

// Format interests list for display
export function formatInterests(interests?: string[] | null) {
  if (!interests || interests.length === 0) return null;
  return interests.slice(0, 4).join(", ") + (interests.length > 4 ? "..." : "");
}

// Calculate total days between dates
export function calculateTotalDays(
  startDate?: Date,
  endDate?: Date
): number | null {
  if (startDate && endDate && endDate >= startDate) {
    return differenceInCalendarDays(endDate, startDate) + 1;
  }
  return null;
}

// Process form values for API submission
export function processFormValues(
  values: any,
  extractedSlots: Partial<ClarificationState>
): Partial<ClarificationState> {
  // Process interests as string if array
  const processedSlotValues = {
    ...extractedSlots,
    ...values,
    interests: Array.isArray(values.interests)
      ? values.interests
      : typeof values.interests === "string" && values.interests
      ? (values.interests as string)
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      : [],
  };

  return processedSlotValues;
}

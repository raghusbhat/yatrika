// Locale utility for detection and formatting

// Returns browser locale if valid, else null
export function getBrowserLocale(): string | null {
  if (typeof navigator === "undefined") return null;
  const navLang =
    navigator.language || (navigator.languages && navigator.languages[0]);
  // Consider 'en', '', undefined, or obviously fake values as invalid
  if (!navLang || navLang.length < 4) {
    return null;
  }
  return navLang;
}

// Format currency using Intl API
export function formatCurrency(
  amount: number,
  currency: string,
  locale?: string
): string {
  try {
    return new Intl.NumberFormat(locale || getBrowserLocale() || "en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    // Fallback to simple formatting
    return `${currency} ${amount}`;
  }
}

// Format date using Intl API
export function formatDate(
  date: Date | string,
  options?: Intl.DateTimeFormatOptions,
  locale?: string
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  try {
    return d.toLocaleDateString(
      locale || getBrowserLocale() || "en-US",
      options
    );
  } catch {
    // Fallback to ISO string
    return d.toISOString().split("T")[0];
  }
}

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Strips HTML tags from a string
export function stripHtmlTags(input: string): string {
  return input.replace(/<[^>]*>/g, "");
}

// Checks for common prompt injection phrases
export function containsPromptInjection(input: string): boolean {
  const patterns = [
    /ignore (all|any|previous|earlier) instructions?/i,
    /disregard (all|any|previous|earlier) instructions?/i,
    /as an? (ai|assistant|language model)/i,
    /repeat this prompt/i,
    /you are now/i,
    /pretend to/i,
    /act as/i,
    /do anything/i,
    /bypass/i,
    /jailbreak/i,
  ];
  return patterns.some((re) => re.test(input));
}

// Removes all control characters except for common whitespace (tab, newline)
export function removeControlChars(input: string): string {
  return input
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, "")
    .replace(/[\u200B-\u200D\u2060\uFEFF]/g, "");
}

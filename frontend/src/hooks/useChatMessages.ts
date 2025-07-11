import { useState, useRef, useEffect, useCallback } from "react";
import React from "react";
import { enhancedClarify } from "@/api/enhancedClarify";
import type { ClarificationState, Itinerary } from "@/types/clarification";
import { initialClarificationState } from "@/types/clarification";
import { ItineraryCard } from "@/components/chat/ItineraryCard";

// Rate limiting and debouncing configuration
const API_DEBOUNCE_MS = 2000; // 2 second debounce
const MAX_REQUESTS_PER_MINUTE = 10; // Conservative limit

export function useChatMessages() {
  const [inputValue, setInputValue] = useState("");
  const [clarificationState, setClarificationState] =
    useState<ClarificationState>(initialClarificationState);
  const [messages, setMessages] = useState<
    {
      role: "user" | "assistant";
      content: string;
      component?: React.ReactNode;
    }[]
  >([
    {
      role: "assistant",
      content:
        "What kind of journey are you dreaming of? You can type, or show me a photo for inspiration.",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUserMessage, setLastUserMessage] = useState<string | null>(null);
  const [initialChip, setInitialChip] = useState<string | null>(null);
  const [selectedChip, setSelectedChip] = useState<string | null>(null);

  // Rate limiting state
  const lastRequestTime = useRef<number>(0);
  const requestCount = useRef<number>(0);
  const requestTimestamps = useRef<number[]>([]);
  const pendingRequest = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll to bottom
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, error]);

  // Cleanup pending requests on unmount
  useEffect(() => {
    return () => {
      if (pendingRequest.current) {
        clearTimeout(pendingRequest.current);
        pendingRequest.current = null;
      }
    };
  }, []);

  // Rate limiting helper
  const canMakeRequest = useCallback(() => {
    const now = Date.now();

    // Clean up old timestamps (older than 1 minute)
    requestTimestamps.current = requestTimestamps.current.filter(
      (timestamp) => now - timestamp < 60000
    );

    // Check if we're under the rate limit
    if (requestTimestamps.current.length >= MAX_REQUESTS_PER_MINUTE) {
      console.warn("[useChatMessages] Rate limit reached, blocking request");
      return false;
    }

    // Check debounce time
    if (now - lastRequestTime.current < API_DEBOUNCE_MS) {
      console.warn("[useChatMessages] Request too soon, applying debounce");
      return false;
    }

    return true;
  }, []);

  // Rate limit status for UI
  const getRateLimitStatus = useCallback(() => {
    const now = Date.now();

    // Clean up old timestamps
    const validTimestamps = requestTimestamps.current.filter(
      (timestamp) => now - timestamp < 60000
    );

    const remainingRequests = Math.max(
      0,
      MAX_REQUESTS_PER_MINUTE - validTimestamps.length
    );
    const isRateLimited =
      remainingRequests === 0 ||
      now - lastRequestTime.current < API_DEBOUNCE_MS;
    const nextAvailableTime = lastRequestTime.current + API_DEBOUNCE_MS;

    return {
      isRateLimited,
      remainingRequests,
      nextAvailableTime,
    };
  }, []);

  // Enhanced API call wrapper with rate limiting
  const makeEnhancedClarifyRequest = useCallback(
    async (input: string, state: ClarificationState) => {
      // Clear any pending request
      if (pendingRequest.current) {
        clearTimeout(pendingRequest.current);
        pendingRequest.current = null;
      }

      return new Promise<any>((resolve, reject) => {
        const executeRequest = async () => {
          if (!canMakeRequest()) {
            reject(
              new Error(
                "Rate limit exceeded. Please wait a moment before trying again."
              )
            );
            return;
          }

          const now = Date.now();
          lastRequestTime.current = now;
          requestTimestamps.current.push(now);

          console.log("[useChatMessages] Making API request:", {
            input: input.substring(0, 50),
            requestCount: requestTimestamps.current.length,
            lastRequest:
              now -
              (requestTimestamps.current[
                requestTimestamps.current.length - 2
              ] || 0),
          });

          try {
            const result = await enhancedClarify(input, state);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        };

        // Add small delay to prevent rapid-fire requests
        pendingRequest.current = setTimeout(executeRequest, 100);
      });
    },
    [canMakeRequest]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent, retryMessage?: string) => {
      e.preventDefault();
      if (loading) return;

      const messageToSend = retryMessage || inputValue.trim();
      if (!messageToSend) return;

      console.log("🔥 [FRONTEND] Form submission started:", {
        timestamp: new Date().toISOString(),
        messageToSend,
        clarificationState: JSON.stringify(clarificationState, null, 2),
        inputHistoryLength: clarificationState.inputHistory?.length || 0,
      });

      setError(null);
      setMessages((prev) => [
        ...prev,
        { role: "user", content: messageToSend },
      ]);
      setInputValue("");
      setLastUserMessage(messageToSend);
      setLoading(true);

      console.log("📤 [FRONTEND] Making API request to backend...", {
        timestamp: new Date().toISOString(),
        endpoint: "/api/clarify/enhanced",
        messageLength: messageToSend.length,
      });

      try {
        const res = await makeEnhancedClarifyRequest(
          messageToSend,
          clarificationState
        );

        console.log("📥 [FRONTEND] Received response from backend:", {
          timestamp: new Date().toISOString(),
          hasNextPrompt: !!res.nextPrompt,
          isPlanReady: res.updatedState?.isPlanReady,
          hasPersonalization: !!res.personalization,
          responsePreview: res.nextPrompt?.substring(0, 100) + "...",
        });

        setClarificationState(res.updatedState);

        if (res.nextPrompt) {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: res.nextPrompt },
          ]);
          console.log("✅ [FRONTEND] Added AI response to chat UI");
        } else if (res.updatedState.isPlanReady) {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: "Your plan is ready!" },
          ]);
          console.log("🎯 [FRONTEND] Plan ready - final response added");
        }
      } catch (err) {
        let msg = "Sorry, something went wrong.";
        if (err instanceof Error && err.message) msg = err.message;
        console.error("❌ [FRONTEND] Error in form submission:", {
          timestamp: new Date().toISOString(),
          error: err,
          errorMessage: msg,
        });
        setError(msg);
      } finally {
        setLoading(false);
        console.log("🏁 [FRONTEND] Form submission completed:", {
          timestamp: new Date().toISOString(),
          success: !error,
        });
      }
    },
    [loading, inputValue, clarificationState, makeEnhancedClarifyRequest]
  );

  const handleChipClick = useCallback(
    async (chipValue: string) => {
      if (loading) return;

      setMessages((prev) => [...prev, { role: "user", content: chipValue }]);
      setInputValue("");
      setLastUserMessage(chipValue);
      setLoading(true);
      setError(null);

      try {
        const res = await makeEnhancedClarifyRequest(
          chipValue,
          clarificationState
        );
        setClarificationState(res.updatedState);

        if (res.nextPrompt) {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: res.nextPrompt },
          ]);
        } else if (res.updatedState.isPlanReady) {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: "Your plan is ready!" },
          ]);
        }
      } catch (err) {
        let msg = "Sorry, something went wrong.";
        if (err instanceof Error && err.message) msg = err.message;
        setError(msg);
      } finally {
        setLoading(false);
      }
    },
    [loading, clarificationState, makeEnhancedClarifyRequest]
  );

  const handleInitialChipClick = useCallback((chipValue: string) => {
    setSelectedChip(chipValue);
    setInitialChip(chipValue);
  }, []);

  const submitClarificationState = useCallback(
    async (payload: ClarificationState) => {
      setLoading(true);
      setError(null);

      try {
        const res = await makeEnhancedClarifyRequest("", payload);
        setClarificationState(res.updatedState);

        // Check if the response contains a structured itinerary
        if (res.updatedState.isPlanReady && res.nextPrompt) {
          try {
            const itineraryData: Itinerary = JSON.parse(res.nextPrompt);
            // Replace summary card with itinerary
            setMessages((prev) => [
              // Keep all messages except the last one (summary card)
              ...prev.slice(0, prev.length - 1),
              {
                role: "assistant",
                content: "", // No simple text content
                component: React.createElement(ItineraryCard, {
                  itineraryData,
                }),
              },
            ]);
          } catch (e) {
            console.error("Failed to parse itinerary JSON:", e);
            // Fallback to a simpler message if JSON is malformed
            setMessages((prev) => [
              ...prev,
              {
                role: "assistant",
                content:
                  "I've prepared your itinerary, but there was an issue displaying it. Please try again.",
              },
            ]);
          }
        } else if (res.nextPrompt) {
          // Handle regular text-based follow-up questions from the AI
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: res.nextPrompt },
          ]);
        }

        return res;
      } catch (err) {
        let msg = "Sorry, something went wrong.";
        if (err instanceof Error && err.message) msg = err.message;
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [makeEnhancedClarifyRequest]
  );

  const resetMessages = useCallback(() => {
    setInputValue("");
    setClarificationState(initialClarificationState);
    setMessages([
      {
        role: "assistant",
        content: "What kind of journey are you dreaming of?",
      },
    ]);
    setLoading(false);
    setError(null);
    setLastUserMessage(null);
    setInitialChip(null);
    setSelectedChip(null);
  }, []);

  return {
    inputValue,
    setInputValue,
    messages,
    setMessages,
    loading,
    error,
    lastUserMessage,
    initialChip,
    selectedChip,
    clarificationState,
    bottomRef,
    handleSubmit,
    handleChipClick,
    handleInitialChipClick,
    submitClarificationState,
    resetMessages,
    setClarificationState,
    getRateLimitStatus,
  };
}

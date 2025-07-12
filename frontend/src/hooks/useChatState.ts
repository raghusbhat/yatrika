import { useState, useRef, useCallback } from "react";
import type { ClarificationState } from "@/types/clarification";
import { initialClarificationState } from "@/types/clarification";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  component?: React.ReactNode;
}

export const useChatState = () => {
  const [inputValue, setInputValue] = useState("");
  const [clarificationState, setClarificationState] =
    useState<ClarificationState>(initialClarificationState);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>(
    "Processing your request..."
  );
  const [lastUserMessage, setLastUserMessage] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const resetChat = useCallback(() => {
    console.log("[useChatState] Resetting chat to initial state");

    setInputValue("");
    setClarificationState(initialClarificationState);
    setMessages([]);
    setLoading(false);
    setError(null);
    setLastUserMessage(null);
  }, []);

  const addMessage = useCallback((message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const updateLastMessage = useCallback((message: ChatMessage) => {
    setMessages((prev) => [...prev.slice(0, -1), message]);
  }, []);

  const setLoadingWithMessage = useCallback(
    (isLoading: boolean, message?: string) => {
      setLoading(isLoading);
      if (message) {
        setLoadingMessage(message);
      }
    },
    []
  );

  return {
    // State
    inputValue,
    setInputValue,
    clarificationState,
    setClarificationState,
    messages,
    setMessages,
    loading,
    setLoading,
    error,
    setError,
    loadingMessage,
    setLoadingMessage,
    lastUserMessage,
    setLastUserMessage,
    bottomRef,

    // Actions
    resetChat,
    addMessage,
    updateLastMessage,
    setLoadingWithMessage,
  };
};

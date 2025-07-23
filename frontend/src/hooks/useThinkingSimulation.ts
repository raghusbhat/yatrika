import { useState, useCallback, useRef, useEffect } from "react";
import type { ClarificationState } from "@/types/clarification";

interface ThinkingMessage {
  id: string;
  role: "assistant";
  content: string;
  component?: React.ReactNode;
  isThinking?: boolean;
}

interface UseThinkingSimulationOptions {
  minimumDuration?: number; // Minimum time to show thinking (ms)
  maximumDuration?: number; // Maximum time before forcing completion (ms)
}

interface UseThinkingSimulationReturn {
  isThinking: boolean;
  thinkingMessages: ThinkingMessage[];
  startThinking: (clarificationState: ClarificationState) => void;
  completeThinking: () => void;
  replaceThinkingWithResult: (resultMessages: any[]) => void;
}

export const useThinkingSimulation = (
  options: UseThinkingSimulationOptions = {}
): UseThinkingSimulationReturn => {
  const {
    minimumDuration = 8000, // 8 seconds minimum
    maximumDuration = 25000, // 25 seconds maximum
  } = options;

  const [isThinking, setIsThinking] = useState(false);
  const [thinkingMessages, setThinkingMessages] = useState<ThinkingMessage[]>([]);
  const thinkingStartTimeRef = useRef<number>(0);
  const minimumTimerRef = useRef<NodeJS.Timeout>();
  const maximumTimerRef = useRef<NodeJS.Timeout>();
  const isCompletedRef = useRef(false);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (minimumTimerRef.current) clearTimeout(minimumTimerRef.current);
      if (maximumTimerRef.current) clearTimeout(maximumTimerRef.current);
    };
  }, []);

  const startThinking = useCallback((clarificationState: ClarificationState) => {
    console.log("[useThinkingSimulation] Starting thinking simulation");
    
    setIsThinking(true);
    isCompletedRef.current = false;
    thinkingStartTimeRef.current = Date.now();
    
    // Create the thinking component with user's data
    const ThinkingSimulator = require("@/components/chat/ThinkingSimulator").ThinkingSimulator;
    
    const thinkingMessage: ThinkingMessage = {
      id: `thinking-${Date.now()}`,
      role: "assistant",
      content: "🤖 Planning your perfect itinerary...",
      component: (
        <ThinkingSimulator
          destination={clarificationState.destination}
          interests={clarificationState.interests as string[]}
          groupType={clarificationState.groupType}
          budget={clarificationState.budget}
          tripTheme={clarificationState.tripTheme}
          onComplete={() => {
            console.log("[useThinkingSimulation] Thinking component completed");
            // Only complete if minimum time has passed
            const elapsedTime = Date.now() - thinkingStartTimeRef.current;
            if (elapsedTime >= minimumDuration && !isCompletedRef.current) {
              completeThinking();
            }
          }}
        />
      ),
      isThinking: true,
    };

    setThinkingMessages([thinkingMessage]);

    // Set minimum duration timer
    minimumTimerRef.current = setTimeout(() => {
      console.log("[useThinkingSimulation] Minimum duration reached");
      // If the thinking component has already completed, we can finish
      // Otherwise, we wait for the component to complete
    }, minimumDuration);

    // Set maximum duration timer (safety fallback)
    maximumTimerRef.current = setTimeout(() => {
      console.log("[useThinkingSimulation] Maximum duration reached - force completing");
      if (!isCompletedRef.current) {
        completeThinking();
      }
    }, maximumDuration);
  }, [minimumDuration, maximumDuration]);

  const completeThinking = useCallback(() => {
    console.log("[useThinkingSimulation] Completing thinking simulation");
    isCompletedRef.current = true;
    
    // Clear timers
    if (minimumTimerRef.current) clearTimeout(minimumTimerRef.current);
    if (maximumTimerRef.current) clearTimeout(maximumTimerRef.current);
    
    // Don't immediately clear - wait for replaceThinkingWithResult to be called
  }, []);

  const replaceThinkingWithResult = useCallback((resultMessages: any[]) => {
    console.log("[useThinkingSimulation] Replacing thinking with actual result");
    
    setIsThinking(false);
    setThinkingMessages([]);
    
    // Clear any remaining timers
    if (minimumTimerRef.current) clearTimeout(minimumTimerRef.current);
    if (maximumTimerRef.current) clearTimeout(maximumTimerRef.current);
  }, []);

  return {
    isThinking,
    thinkingMessages,
    startThinking,
    completeThinking,
    replaceThinkingWithResult,
  };
};
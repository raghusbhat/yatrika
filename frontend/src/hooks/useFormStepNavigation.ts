import { useState, useCallback } from "react";

export const useFormStepNavigation = () => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isNewChat, setIsNewChat] = useState(true);
  const [intentRejected, setIntentRejected] = useState(false);
  const [navDirection, setNavDirection] = useState<"forward" | "back">(
    "forward"
  );
  const [showStepper, setShowStepper] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionPhase, setTransitionPhase] = useState<
    "form" | "card" | "conversation"
  >("form");

  const goToStep = useCallback(
    (step: 1 | 2 | 3, direction: "forward" | "back" = "forward") => {
      setNavDirection(direction);
      setCurrentStep(step);
    },
    []
  );

  const startTransition = useCallback(
    (phase: "form" | "card" | "conversation") => {
      setIsTransitioning(true);
      setTransitionPhase(phase);
    },
    []
  );

  const endTransition = useCallback(() => {
    setIsTransitioning(false);
  }, []);

  const resetToStep1 = useCallback(() => {
    setCurrentStep(1);
    setIsNewChat(true);
    setIntentRejected(false);
    setShowStepper(true);
    setIsTransitioning(false);
    setTransitionPhase("form");
  }, []);

  return {
    // State
    currentStep,
    setCurrentStep,
    isNewChat,
    setIsNewChat,
    intentRejected,
    setIntentRejected,
    navDirection,
    setNavDirection,
    showStepper,
    setShowStepper,
    isTransitioning,
    setIsTransitioning,
    transitionPhase,
    setTransitionPhase,

    // Actions
    goToStep,
    startTransition,
    endTransition,
    resetToStep1,
  };
};

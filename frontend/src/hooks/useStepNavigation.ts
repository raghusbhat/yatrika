import { useState, useCallback, useMemo } from "react";

export function useStepNavigation() {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isNewChat, setIsNewChat] = useState(true);
  const [intentRejected, setIntentRejected] = useState(false);
  const [navDirection, setNavDirection] = useState<"forward" | "back">(
    "forward"
  );

  // Transition states
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showStepper, setShowStepper] = useState(true);
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

  const goBack = useCallback(() => {
    if (currentStep > 1) {
      setNavDirection("back");
      setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3);
    }
  }, [currentStep]);

  const goForward = useCallback(() => {
    if (currentStep < 3) {
      setNavDirection("forward");
      setCurrentStep((prev) => (prev + 1) as 1 | 2 | 3);
    }
  }, [currentStep]);

  const startTransition = useCallback(() => {
    setIsTransitioning(true);
    setTransitionPhase("form");
    setShowStepper(false);
  }, []);

  const setTransitionToCard = useCallback(() => {
    setTransitionPhase("card");
  }, []);

  const setTransitionToConversation = useCallback(() => {
    setTransitionPhase("conversation");
  }, []);

  const completeTransition = useCallback(() => {
    setIsTransitioning(false);
    setIsNewChat(false);
    setTransitionPhase("form");
  }, []);

  const resetNavigation = useCallback(() => {
    setCurrentStep(1);
    setIsNewChat(true);
    setIntentRejected(false);
    setNavDirection("forward");
    setIsTransitioning(false);
    setShowStepper(true);
    setTransitionPhase("form");
  }, []);

  return useMemo(
    () => ({
      currentStep,
      isNewChat,
      intentRejected,
      navDirection,
      isTransitioning,
      showStepper,
      transitionPhase,
      setCurrentStep,
      setIsNewChat,
      setIntentRejected,
      setNavDirection,
      goToStep,
      goBack,
      goForward,
      startTransition,
      setTransitionToCard,
      setTransitionToConversation,
      completeTransition,
      resetNavigation,
    }),
    [
      currentStep,
      isNewChat,
      intentRejected,
      navDirection,
      isTransitioning,
      showStepper,
      transitionPhase,
      goToStep,
      goBack,
      goForward,
      startTransition,
      setTransitionToCard,
      setTransitionToConversation,
      completeTransition,
      resetNavigation,
    ]
  );
}

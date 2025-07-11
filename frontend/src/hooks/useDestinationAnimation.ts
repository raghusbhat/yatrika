import { useState, useEffect, useCallback } from "react";
import {
  DESTINATION_PLACEHOLDER_EXAMPLES,
  TYPING_SPEED,
  DELETING_SPEED,
  PAUSE_AFTER_TYPING,
  PAUSE_AFTER_DELETING,
} from "@/constants/chatInterface";

export function useDestinationAnimation(currentStep: number) {
  const [destinationPlaceholderIdx, setDestinationPlaceholderIdx] = useState(0);
  const [destinationDisplayed, setDestinationDisplayed] = useState("");
  const [destinationIsDeleting, setDestinationIsDeleting] = useState(false);

  useEffect(() => {
    if (currentStep !== 2) return; // Only animate when on step 2

    const current = DESTINATION_PLACEHOLDER_EXAMPLES[destinationPlaceholderIdx];
    let timeout: NodeJS.Timeout;

    if (
      !destinationIsDeleting &&
      destinationDisplayed.length < current.length
    ) {
      timeout = setTimeout(
        () =>
          setDestinationDisplayed(
            current.slice(0, destinationDisplayed.length + 1)
          ),
        TYPING_SPEED
      );
    } else if (
      !destinationIsDeleting &&
      destinationDisplayed.length === current.length
    ) {
      timeout = setTimeout(
        () => setDestinationIsDeleting(true),
        PAUSE_AFTER_TYPING
      );
    } else if (destinationIsDeleting && destinationDisplayed.length > 0) {
      timeout = setTimeout(
        () =>
          setDestinationDisplayed(
            current.slice(0, destinationDisplayed.length - 1)
          ),
        DELETING_SPEED
      );
    } else if (destinationIsDeleting && destinationDisplayed.length === 0) {
      timeout = setTimeout(() => {
        setDestinationIsDeleting(false);
        setDestinationPlaceholderIdx(
          (idx) => (idx + 1) % DESTINATION_PLACEHOLDER_EXAMPLES.length
        );
      }, PAUSE_AFTER_DELETING);
    }

    return () => clearTimeout(timeout);
  }, [
    destinationDisplayed,
    destinationIsDeleting,
    destinationPlaceholderIdx,
    currentStep,
  ]);

  const resetAnimation = useCallback(() => {
    setDestinationPlaceholderIdx(0);
    setDestinationDisplayed("");
    setDestinationIsDeleting(false);
  }, []);

  return {
    destinationPlaceholder: destinationDisplayed,
    resetAnimation,
  };
}

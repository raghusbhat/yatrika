import React from "react";
import { Clock, AlertTriangle } from "lucide-react";

interface RateLimitIndicatorProps {
  isRateLimited: boolean;
  remainingRequests?: number;
  nextAvailableTime?: number;
}

export const RateLimitIndicator: React.FC<RateLimitIndicatorProps> = ({
  isRateLimited,
  remainingRequests = 0,
  nextAvailableTime = 0,
}) => {
  if (!isRateLimited && remainingRequests > 5) {
    return null; // Don't show anything when plenty of requests available
  }

  const timeUntilNext = Math.max(0, nextAvailableTime - Date.now());
  const secondsUntilNext = Math.ceil(timeUntilNext / 1000);

  return (
    <div
      className={`
      flex items-center gap-2 px-3 py-2 rounded-lg text-sm border
      ${
        isRateLimited
          ? "bg-orange-50 border-orange-200 text-orange-800"
          : "bg-yellow-50 border-yellow-200 text-yellow-800"
      }
    `}
    >
      {isRateLimited ? (
        <>
          <AlertTriangle className="w-4 h-4" />
          <span>
            Rate limited. Please wait {secondsUntilNext}s before trying again.
          </span>
        </>
      ) : (
        <>
          <Clock className="w-4 h-4" />
          <span>{remainingRequests} requests remaining this minute</span>
        </>
      )}
    </div>
  );
};

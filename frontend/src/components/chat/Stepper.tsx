import React from "react";

interface StepperProps {
  step: 1 | 2 | 3;
}

// Stepper: ultra-compact mobile design with fixed width
export const Stepper: React.FC<StepperProps> = ({ step }) => {
  const steps = [
    { label: "Choose Trip\nType", shortLabel: "Trip" },
    { label: "Basic Details", shortLabel: "Details" },
    { label: "Preferences\n& Extras", shortLabel: "Prefs" },
  ];

  return (
    <div className="w-full flex justify-center px-2 py-4 sm:px-4 sm:py-6">
      <div className="relative w-80 sm:w-96">
        {/* Background line - positioned between circle centers */}
        <div
          className="absolute top-3 sm:top-4 h-0.5 bg-slate-700"
          style={{
            left: "calc(16.67% + 12px)",
            right: "calc(16.67% + 12px)",
          }}
        />
        {/* Progress line - positioned between circle centers */}
        <div
          className="absolute top-3 sm:top-4 h-0.5 bg-indigo-500 transition-all duration-500 ease-out"
          style={
            step === 1
              ? { display: "none" }
              : step === 2
              ? {
                  left: "calc(16.67% + 12px)",
                  width: "calc(33.33% - 24px)",
                }
              : {
                  left: "calc(16.67% + 12px)",
                  right: "calc(16.67% + 12px)",
                }
          }
        />
        {/* Steps - fixed positioning */}
        <div className="relative flex">
          {steps.map((stepItem, index) => {
            const stepNumber = index + 1;
            const isCompleted = step > stepNumber;
            const isActive = step === stepNumber;
            return (
              <div
                key={stepItem.label}
                className="flex flex-col items-center"
                style={{
                  width: "33.33%",
                  position: "relative",
                }}
              >
                <div
                  className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-semibold
                    transition-all duration-200 relative z-10 flex-shrink-0
                    ${
                      isCompleted
                        ? "bg-indigo-600 text-white border-2 border-indigo-500"
                        : isActive
                        ? "bg-indigo-600 text-white border-2 border-indigo-400"
                        : "bg-slate-900 text-slate-400 border-2 border-slate-600"
                    }`}
                  aria-current={isActive ? "step" : undefined}
                >
                  {isCompleted ? (
                    <svg
                      className="w-2.5 h-2.5 sm:w-3 sm:h-3"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    stepNumber
                  )}
                </div>
                <div
                  className={`mt-1 text-[8px] sm:text-[10px] font-medium text-center px-0.5 leading-tight ${
                    isActive
                      ? "text-indigo-300"
                      : isCompleted
                      ? "text-indigo-200"
                      : "text-slate-400"
                  }`}
                >
                  {/* Show short label on mobile, full label on larger screens */}
                  <span className="hidden sm:block whitespace-pre-line">
                    {stepItem.label}
                  </span>
                  <span className="block sm:hidden">{stepItem.shortLabel}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

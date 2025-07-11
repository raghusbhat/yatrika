import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Sun,
  Zap,
  MapPin,
  Building2,
  Users,
  Leaf,
  Mountain,
  Heart,
} from "lucide-react";
import { LuBackpack } from "react-icons/lu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { INITIAL_CHIPS, stepVariants } from "@/constants/chatInterface";

interface Step1TripTypeSelectorProps {
  selectedChip: string | null;
  onChipClick: (chipValue: string) => void;
  onContinue: () => void;
  onSkip: () => void;
  loading: boolean;
  error: string | null;
  navDirection: "forward" | "back";
}

const getChipIcon = (chipValue: string) => {
  const iconProps = "w-4 h-4 mr-2";
  switch (chipValue) {
    case "Beach Getaway":
      return <Sun className={iconProps} />;
    case "Adventure Trip":
      return <Zap className={iconProps} />;
    case "Cultural Trip":
      return <MapPin className={iconProps} />;
    case "City Break":
      return <Building2 className={iconProps} />;
    case "Backpacking":
      return <LuBackpack size={16} />;
    case "Family Vacation":
      return <Users className={iconProps} />;
    case "Spiritual Journey":
      return <Leaf className={iconProps} />;
    case "Mountain Escape":
      return <Mountain className={iconProps} />;
    case "Romantic Retreat":
      return <Heart className={iconProps} />;
    default:
      return null;
  }
};

export const Step1TripTypeSelector: React.FC<Step1TripTypeSelectorProps> = ({
  selectedChip,
  onChipClick,
  onContinue,
  onSkip,
  loading,
  error,
  navDirection,
}) => {
  return (
    <motion.div
      key="step-1"
      custom={navDirection}
      variants={stepVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{
        duration: 0.4,
        type: "tween",
        ease: "easeInOut",
      }}
      className="flex flex-col items-center justify-center w-full flex-1 pt-6 sm:pt-8 px-0 min-h-0"
    >
      <div className="mb-4 sm:mb-6 text-base sm:text-lg font-medium text-slate-100 text-center w-full px-2 sm:px-0">
        What kind of journey are you dreaming of?
      </div>
      <div className="w-full max-w-sm sm:max-w-3xl mx-auto flex flex-col gap-4 sm:gap-6 px-2 sm:px-4">
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2 w-full">
          {INITIAL_CHIPS.map((chip) => (
            <Button
              key={chip.value}
              size="sm"
              className={`w-full px-2 py-2 sm:px-3 sm:py-3 flex items-center justify-center gap-1 sm:gap-2 rounded-md border font-medium text-xs sm:text-sm shadow-sm transition-all duration-200 min-h-[2.5rem] sm:min-h-[3rem] text-center break-words hyphens-auto ${
                selectedChip === chip.value
                  ? "bg-indigo-600 text-white border-indigo-500 shadow-md"
                  : "bg-indigo-700/30 text-white border-indigo-400/40 hover:bg-indigo-700/50 hover:border-indigo-400/60"
              }`}
              style={{
                outline: "none",
                boxShadow:
                  selectedChip === chip.value
                    ? "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
                    : "0 2px 4px -1px rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.06)",
              }}
              onClick={() => onChipClick(chip.value)}
              disabled={loading}
              type="button"
            >
              <div className="flex flex-col sm:flex-col items-center gap-0.5 sm:gap-1">
                <span className="flex-shrink-0 [&>*]:w-3 [&>*]:h-3 sm:[&>*]:w-4 sm:[&>*]:h-4">
                  {getChipIcon(chip.value)}
                </span>
                <span className="leading-tight text-center whitespace-normal text-[10px] sm:text-xs">
                  {chip.label}
                </span>
              </div>
            </Button>
          ))}
        </div>

        {/* Navigation buttons */}
        <div className="grid grid-cols-3 gap-2 sm:grid sm:grid-cols-3 sm:gap-4 mt-4 sm:mt-6 w-full">
          <Button
            type="button"
            variant="outline"
            className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-700 font-medium text-xs sm:text-sm h-8 sm:h-9 flex items-center justify-center"
            disabled={true}
          >
            <ChevronLeft className="w-4 h-4 sm:hidden" />
            <span className="hidden sm:inline">Back</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-700 font-medium text-xs sm:text-sm h-8 sm:h-9"
            onClick={onSkip}
            disabled={loading}
          >
            Skip
          </Button>

          {!selectedChip ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="w-full block">
                  <Button
                    type="button"
                    className="w-full px-3 py-1.5 sm:px-4 sm:py-2 rounded-md bg-indigo-800 hover:bg-indigo-700 text-white font-medium shadow border border-indigo-700 flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm h-8 sm:h-9"
                    disabled={!selectedChip || loading}
                    onClick={onContinue}
                  >
                    <ChevronRight className="w-4 h-4 sm:hidden" />
                    <span className="hidden sm:inline">Continue</span>
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs text-center">
                Please select a trip type to continue.
              </TooltipContent>
            </Tooltip>
          ) : (
            <Button
              type="button"
              className="w-full px-3 py-1.5 sm:px-4 sm:py-2 rounded-md bg-indigo-800 hover:bg-indigo-700 text-white font-medium shadow border border-indigo-700 flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm h-8 sm:h-9 sm:min-w-[100px]"
              disabled={!selectedChip || loading}
              onClick={onContinue}
            >
              <ChevronRight className="w-4 h-4 sm:hidden" />
              <span className="hidden sm:inline">Continue</span>
            </Button>
          )}
        </div>

        {error && (
          <div className="mt-2 text-rose-400 text-sm text-center">{error}</div>
        )}
      </div>
    </motion.div>
  );
};

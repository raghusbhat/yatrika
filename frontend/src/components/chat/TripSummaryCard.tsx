import React from "react";
import { motion } from "framer-motion";
import {
  Check,
  Zap,
  MapPin,
  Calendar,
  UserIcon,
  DollarSign,
  Heart,
} from "lucide-react";
import { formatDateRange, formatInterests } from "@/utils/chatHelpers";
import type { ClarificationState } from "@/types/clarification";

interface TripSummaryCardProps {
  tripData: Partial<ClarificationState>;
  tripTheme?: string;
  formData?: any;
}

export const TripSummaryCard: React.FC<TripSummaryCardProps> = ({
  tripData,
  tripTheme,
  formData,
}) => {
  const dateInfo = formatDateRange(
    formData?.startDate,
    formData?.endDate,
    formData?.flexibleDates
  );
  const interestsDisplay = formatInterests(formData?.interests);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="w-full max-w-[98%] mx-0 bg-gradient-to-br from-indigo-900/40 to-slate-800/60 border border-indigo-500/30 rounded-xl p-4 sm:p-5 shadow-lg backdrop-blur-sm"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
          <Check className="w-4 h-4 text-white" />
        </div>
        <h3 className="text-base sm:text-lg font-semibold text-white">
          Trip Details Collected
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-3 text-sm">
        {tripTheme && (
          <div className="flex items-center gap-2 text-slate-300">
            <Zap className="w-4 h-4 text-indigo-400 flex-shrink-0" />
            <span className="text-slate-400">Type:</span>
            <span className="font-semibold text-white">{tripTheme}</span>
          </div>
        )}

        {(tripData.destination || formData?.destination) && (
          <div className="flex items-center gap-2 text-slate-300">
            <MapPin className="w-4 h-4 text-indigo-400 flex-shrink-0" />
            <span className="text-slate-400">Destination:</span>
            <span className="font-semibold text-white">
              {tripData.destination || formData?.destination}
            </span>
          </div>
        )}

        <div className="flex items-start gap-2 text-slate-300">
          <Calendar className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
          <span className="text-slate-400 flex-shrink-0">Dates:</span>
          <div className="flex flex-col">
            <span className="font-semibold text-white break-words">
              {dateInfo.dateRange}
            </span>
            {dateInfo.days && (
              <span className="text-xs text-slate-400 mt-0.5">
                {dateInfo.days}
              </span>
            )}
          </div>
        </div>

        {(tripData.groupType || formData?.groupType) && (
          <div className="flex items-center gap-2 text-slate-300">
            <UserIcon className="w-4 h-4 text-indigo-400 flex-shrink-0" />
            <span className="text-slate-400">Group:</span>
            <span className="font-semibold text-white capitalize">
              {tripData.groupType || formData?.groupType}
            </span>
          </div>
        )}

        {(tripData.budget || formData?.budget) && !formData?.flexibleBudget && (
          <div className="flex items-center gap-2 text-slate-300">
            <DollarSign className="w-4 h-4 text-indigo-400 flex-shrink-0" />
            <span className="text-slate-400">Budget:</span>
            <span className="font-semibold text-white">
              {tripData.budget || formData?.budget}
            </span>
          </div>
        )}

        {formData?.flexibleBudget && (
          <div className="flex items-center gap-2 text-slate-300">
            <DollarSign className="w-4 h-4 text-indigo-400 flex-shrink-0" />
            <span className="text-slate-400">Budget:</span>
            <span className="font-semibold text-white">Flexible</span>
          </div>
        )}
      </div>

      {interestsDisplay && (
        <div className="mt-3 pt-3 border-t border-slate-700/50">
          <div className="flex items-start gap-2 text-slate-300">
            <Heart className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-slate-400">Interests:</span>
              <div className="font-semibold text-white text-xs mt-1">
                {interestsDisplay}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-slate-700/50">
        <p className="text-xs text-slate-400 text-center">
          Ready to create your personalized itinerary!
        </p>
      </div>
    </motion.div>
  );
};

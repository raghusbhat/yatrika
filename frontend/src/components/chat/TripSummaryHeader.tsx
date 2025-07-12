import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, differenceInCalendarDays } from "date-fns";
import {
  MapPin,
  Calendar,
  DollarSign,
  UserIcon,
  Heart,
  Zap,
  Settings,
  ChevronDown,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ClarificationState } from "@/types/clarification";

interface TripSummaryHeaderProps {
  tripData: Partial<ClarificationState>;
  tripTheme?: string;
  formData?: any;
  onEdit?: () => void;
  isVisible?: boolean;
  maxWidth?: number;
  sidebarWidth?: number;
}

const TripSummaryHeader: React.FC<TripSummaryHeaderProps> = ({
  tripData,
  tripTheme,
  formData,
  onEdit,
  isVisible = false,
  maxWidth = 768,
  sidebarWidth = 0,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDateRange = () => {
    if (formData?.flexibleDates) {
      return { dateRange: "Flexible dates", days: null };
    }
    if (formData?.startDate && formData?.endDate) {
      const start = format(new Date(formData.startDate), "MMM dd");
      const end = format(new Date(formData.endDate), "MMM dd, yyyy");
      const days =
        differenceInCalendarDays(
          new Date(formData.endDate),
          new Date(formData.startDate)
        ) + 1;
      return {
        dateRange: `${start} - ${end}`,
        days: `${days} ${days === 1 ? "day" : "days"}`,
      };
    }
    return { dateRange: "Dates not specified", days: null };
  };

  const formatInterests = () => {
    if (!formData?.interests || formData.interests.length === 0) return null;
    return (
      formData.interests.slice(0, 3).join(", ") +
      (formData.interests.length > 3 ? "..." : "")
    );
  };

  const dateInfo = formatDateRange();
  const destination = tripData.destination || formData?.destination;
  const groupType = tripData.groupType || formData?.groupType;
  const budget = tripData.budget || formData?.budget;

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full bg-gradient-to-br from-slate-900/95 to-slate-950/95 border border-slate-700/50 rounded-xl shadow-lg backdrop-blur-sm mx-auto"
      style={{ maxWidth }}
    >
      <div className="w-full px-4 py-3">
        {/* Compact view */}
        <div
          className="flex items-center justify-between cursor-pointer select-none hover:bg-slate-800/30 rounded-lg px-2 py-1 transition-colors duration-200"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <div className="flex items-center gap-2 min-w-0 flex-1 text-sm">
              {destination && (
                <span className="text-white font-semibold truncate">
                  {destination}
                </span>
              )}
              {destination && dateInfo.dateRange !== "Dates not specified" && (
                <span className="text-slate-400">•</span>
              )}
              {dateInfo.dateRange !== "Dates not specified" && (
                <span className="text-slate-300 font-medium truncate">
                  {dateInfo.dateRange}
                  {dateInfo.days && (
                    <span className="text-slate-400 ml-1">
                      ({dateInfo.days})
                    </span>
                  )}
                </span>
              )}
              {groupType && (
                <>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-300 capitalize font-medium truncate">
                    {groupType}
                  </span>
                </>
              )}
              {budget && !formData?.flexibleBudget && (
                <>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-300 font-medium truncate">
                    {budget}
                  </span>
                </>
              )}
              {formData?.flexibleBudget && (
                <>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-300 font-medium">
                    Flexible budget
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-slate-400 hover:text-white hover:bg-slate-700/50"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
              >
                <Settings className="w-3 h-3" />
              </Button>
            )}
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="text-slate-400"
            >
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          </div>
        </div>

        {/* Expanded view */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <div className="pt-3 pb-2 space-y-3 bg-slate-800/20 rounded-lg mt-2 px-3">
                {tripTheme && (
                  <div className="flex items-center gap-2 text-sm">
                    <Zap className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                    <span className="text-slate-400">Type:</span>
                    <span className="text-white font-semibold">
                      {tripTheme}
                    </span>
                  </div>
                )}

                {destination && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                    <span className="text-slate-400">Destination:</span>
                    <span className="text-white font-semibold">
                      {destination}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                  <span className="text-slate-400 flex-shrink-0">Dates:</span>
                  <span className="text-white font-semibold">
                    {dateInfo.dateRange}
                    {dateInfo.days && (
                      <span className="text-slate-400 ml-2 text-xs">
                        ({dateInfo.days})
                      </span>
                    )}
                  </span>
                </div>

                {groupType && (
                  <div className="flex items-center gap-2 text-sm">
                    <UserIcon className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                    <span className="text-slate-400">Group:</span>
                    <span className="text-white font-semibold capitalize">
                      {groupType}
                    </span>
                  </div>
                )}

                {budget && !formData?.flexibleBudget && (
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                    <span className="text-slate-400">Budget:</span>
                    <span className="text-white font-semibold">{budget}</span>
                  </div>
                )}

                {formData?.flexibleBudget && (
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                    <span className="text-slate-400">Budget:</span>
                    <span className="text-white font-semibold">Flexible</span>
                  </div>
                )}

                {formatInterests() && (
                  <div className="flex items-start gap-2 text-sm">
                    <Heart className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-400">Interests:</span>
                      <div className="text-white font-semibold text-xs mt-1">
                        {formatInterests()}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default TripSummaryHeader;

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  MapPin,
  Clock,
  Heart,
  DollarSign,
  Route,
  Stars,
  Sparkles,
  CheckCircle,
  Globe,
  Camera,
  Coffee,
  Mountain,
  Compass,
} from "lucide-react";

interface ThinkingStep {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  duration: number; // milliseconds
  details?: string[];
}

interface ThinkingSimulatorProps {
  destination?: string;
  interests?: string[];
  groupType?: string;
  budget?: string;
  tripTheme?: string;
  onComplete?: () => void;
  className?: string;
}

export const ThinkingSimulator: React.FC<ThinkingSimulatorProps> = ({
  destination = "your destination",
  interests = [],
  groupType = "travelers",
  budget,
  tripTheme,
  onComplete,
  className = "",
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [isCompleted, setIsCompleted] = useState(false);

  // Generate personalized thinking steps based on user inputs
  const thinkingSteps: ThinkingStep[] = useMemo(() => {
    const baseSteps: ThinkingStep[] = [
      {
        id: "understanding",
        icon: <Brain className="w-5 h-5" />,
        title: "Understanding Your Requirements",
        description: `Analyzing your ${tripTheme?.toLowerCase() || "travel"} preferences for ${destination}...`,
        duration: 2500,
        details: [
          `Processing ${groupType} travel requirements`,
          "Identifying key preferences and constraints",
          budget ? "Analyzing budget parameters" : "Noting flexible budget approach",
        ],
      },
      {
        id: "research",
        icon: <Globe className="w-5 h-5" />,
        title: "Researching Destination",
        description: `Exploring the best of ${destination} for your interests...`,
        duration: 3200,
        details: [
          `Researching top attractions in ${destination}`,
          "Analyzing seasonal considerations and weather",
          "Identifying local culture and customs",
          "Finding hidden gems and local favorites",
        ],
      },
    ];

    // Add interest-specific research step if interests provided
    if (interests && interests.length > 0) {
      baseSteps.push({
        id: "interests",
        icon: <Heart className="w-5 h-5" />,
        title: "Matching Your Interests",
        description: `Finding perfect ${interests.slice(0, 2).join(" and ")} experiences...`,
        duration: 2800,
        details: [
          ...interests.slice(0, 3).map((interest) => `Sourcing best ${interest.toLowerCase()} activities`),
          "Cross-referencing with traveler reviews",
          "Ensuring authentic local experiences",
        ],
      });
    }

    baseSteps.push(
      {
        id: "planning",
        icon: <Route className="w-5 h-5" />,
        title: "Crafting Your Itinerary",
        description: "Creating the optimal day-by-day journey...",
        duration: 3500,
        details: [
          "Designing logical route and flow",
          "Optimizing travel time between locations",
          "Balancing activity intensity and rest",
          "Planning for spontaneous discoveries",
        ],
      },
      {
        id: "logistics",
        icon: <Clock className="w-5 h-5" />,
        title: "Timing & Logistics",
        description: "Perfecting schedules and practical details...",
        duration: 2400,
        details: [
          "Optimizing opening hours and peak times",
          "Planning transportation connections",
          "Building in buffer time for flexibility",
          "Considering local meal times and customs",
        ],
      }
    );

    // Add budget optimization step if budget specified
    if (budget) {
      baseSteps.push({
        id: "budget",
        icon: <DollarSign className="w-5 h-5" />,
        title: "Budget Optimization",
        description: "Maximizing value within your budget...",
        duration: 2600,
        details: [
          `Optimizing activities within ${budget} range`,
          "Finding free and low-cost alternatives",
          "Identifying best value experiences",
          "Planning strategic splurges and savings",
        ],
      });
    }

    baseSteps.push(
      {
        id: "personalization",
        icon: <Stars className="w-5 h-5" />,
        title: "Personal Touches",
        description: `Customizing everything for ${groupType} travel...`,
        duration: 2200,
        details: [
          `Tailoring pace for ${groupType} dynamics`,
          "Adding personalized recommendations",
          "Incorporating local insider tips",
          "Ensuring comfort and accessibility",
        ],
      },
      {
        id: "assembly",
        icon: <Sparkles className="w-5 h-5" />,
        title: "Final Assembly",
        description: "Bringing it all together into your perfect itinerary...",
        duration: 1800,
        details: [
          "Compiling comprehensive itinerary",
          "Adding practical information and tips",
          "Including backup options and alternatives",
          "Finalizing your personalized travel guide",
        ],
      }
    );

    return baseSteps;
  }, [destination, interests, groupType, budget, tripTheme]);

  // Auto-progress through steps
  useEffect(() => {
    if (currentStepIndex >= thinkingSteps.length) {
      setIsCompleted(true);
      return;
    }

    const currentStep = thinkingSteps[currentStepIndex];
    const timer = setTimeout(() => {
      setCompletedSteps((prev) => new Set([...prev, currentStep.id]));
      setCurrentStepIndex((prev) => prev + 1);
    }, currentStep.duration);

    return () => clearTimeout(timer);
  }, [currentStepIndex, thinkingSteps]);

  // Call onComplete when simulation finishes
  useEffect(() => {
    if (isCompleted && onComplete) {
      onComplete();
    }
  }, [isCompleted, onComplete]);

  const currentStep = thinkingSteps[currentStepIndex];
  const progress = ((currentStepIndex + 1) / thinkingSteps.length) * 100;

  return (
    <div className={`w-full ${className}`}>
      {/* Modern thinking process UI inspired by leading AI platforms */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="w-full max-w-none px-6 py-4"
      >
        {/* Minimal header with thinking indicator */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex items-center gap-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-4 h-4 text-indigo-400"
            >
              <Brain className="w-4 h-4" />
            </motion.div>
            <div className="text-slate-300 text-sm font-medium">
              Thinking...
            </div>
          </div>
        </div>

        {/* Subtle progress indicator */}
        <div className="mb-6">
          <div className="w-full h-0.5 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Current thinking step with modern layout */}
        <AnimatePresence mode="wait">
          {currentStep && !isCompleted && (
            <motion.div
              key={currentStep.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="space-y-3"
            >
              {/* Main thought */}
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 text-indigo-400">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    {currentStep.icon}
                  </motion.div>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-slate-200 mb-1">
                    {currentStep.title}
                  </div>
                  <div className="text-sm text-slate-400">
                    {currentStep.description}
                  </div>
                </div>
              </div>

              {/* Sub-thoughts with minimal design */}
              {currentStep.details && (
                <div className="ml-8 space-y-1.5">
                  {currentStep.details.map((detail, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.2, duration: 0.3 }}
                      className="flex items-center gap-2 text-xs text-slate-500"
                    >
                      <motion.div 
                        className="w-1 h-1 bg-indigo-500 rounded-full"
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: index * 0.1 }}
                      />
                      <span>{detail}</span>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Completed steps - minimal indicators */}
        {thinkingSteps.slice(0, currentStepIndex).length > 0 && (
          <div className="mt-6 ml-8 space-y-1">
            {thinkingSteps.slice(0, currentStepIndex).map((step) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: 4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2 text-xs text-slate-600"
              >
                <CheckCircle className="w-3 h-3 text-green-600 flex-shrink-0" />
                <span>{step.title}</span>
              </motion.div>
            ))}
          </div>
        )}

        {/* Completion state */}
        <AnimatePresence>
          {isCompleted && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="flex items-center gap-3 mt-6"
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
                className="flex-shrink-0"
              >
                <CheckCircle className="w-4 h-4 text-green-500" />
              </motion.div>
              <div>
                <div className="text-sm font-medium text-slate-200">
                  Perfect! Your itinerary is ready
                </div>
                <div className="text-xs text-slate-400">
                  Delivering your personalized travel plan...
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
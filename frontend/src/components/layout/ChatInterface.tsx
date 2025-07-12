import React, {
  useRef,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { clarify } from "@/api/enhancedClarify";
import type { ClarificationState } from "@/types/clarification";
import { StructuredItineraryDisplay } from "@/components/itinerary/StructuredItineraryDisplay";
import * as ItineraryTypes from "@/types/itinerary";
// import { SimpleItineraryTest } from "@/components/itinerary/SimpleItineraryTest";
import ChatInputBar from "./ChatInputBar.tsx";
import TripSummaryHeader from "@/components/chat/TripSummaryHeader";
import { Stepper } from "@/components/chat/Stepper";
import { GroupTypeChips } from "@/components/ui/GroupTypeChips";
import { HorizontalChipSelector } from "@/components/ui/HorizontalChipSelector";
import { ChatMessageList } from "@/components/chat/ChatMessageList";
import { ChatTransitionManager } from "@/components/chat/ChatTransitionManager";
import { useChatState } from "@/hooks/useChatState";
import { useFormStepNavigation } from "@/hooks/useFormStepNavigation";
import {
  Sun,
  Users,
  Mountain,
  Leaf,
  // ArrowRight,
  // ArrowLeft,
  Building2,
  Zap,
  MapPin,
  Heart,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { LuBackpack } from "react-icons/lu";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/DatePicker";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, differenceInCalendarDays } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const formSchema = z
  .object({
    destination: z.string().optional(),
    groupType: z.string().min(1, "Group type is required."),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
    budget: z.string().optional(),
    interests: z.array(z.string()).optional().nullable(),
    source: z.string().optional(),
    flexibleDates: z.boolean().optional(),
    flexibleBudget: z.boolean().optional(),
    specialNeeds: z.string().optional(),
  })
  .refine(
    (data) => {
      // Must either have both dates, or flexibleDates true
      const hasDates = !!data.startDate && !!data.endDate;
      return hasDates || data.flexibleDates === true;
    },
    {
      message: 'Please enter travel dates or select "My dates are flexible".',
      path: ["startDate"],
    }
  );

const DESTINATION_PLACEHOLDER_EXAMPLES = [
  "Goa, India",
  "Munnar, Kerala, India",
  "Kyoto, Japan",
  "Takayama, Japan",
  "Phuket, Thailand",
  "Hoi An, Vietnam",
  "Cappadocia, Turkey",
  "Santorini, Greece",
  "Meteora, Greece",
  "Paris, France",
  "Rome, Italy",
  "Alberobello, Italy",
  "Zurich, Switzerland",
  "Reykjavik, Iceland",
  "New York City, USA",
  "Sedona, Arizona, USA",
  "Banff National Park, Canada",
  "Queenstown, New Zealand",
  "Machu Picchu, Peru",
  "Petra, Jordan",
  "Cape Town, South Africa",
  "Drakensberg, South Africa",
  "Chefchaouen, Morocco",
];

const TYPING_SPEED = 60; // ms per character
const DELETING_SPEED = 30; // ms per character
const PAUSE_AFTER_TYPING = 1200; // ms to pause after typing
const PAUSE_AFTER_DELETING = 400; // ms to pause after deleting

interface ChatInterfaceProps {
  sidebarWidth: number;
  resetTrigger?: number;
}

// Add chip options for common slots
const GROUP_TYPE_CHIPS = [
  { label: "Solo", value: "solo" },
  { label: "Couple", value: "couple" },
  { label: "Family", value: "family" },
  { label: "Friends", value: "friends" },
];

// Helper to detect which chips to show based on prompt
function getChipsForPrompt(prompt: string) {
  if (/who is traveling|group type/i.test(prompt)) return GROUP_TYPE_CHIPS;
  return null;
}

// Initial journey type chips with icons
const INITIAL_CHIPS = [
  {
    label: "Beach Getaway",
    value: "Beach Getaway",
    icon: <Sun className="w-4 h-4 mr-2" />,
  },
  {
    label: "Adventure Trip",
    value: "Adventure Trip",
    icon: <Zap className="w-4 h-4 mr-2" />,
  },
  {
    label: "Cultural Trip",
    value: "Cultural Trip",
    icon: <MapPin className="w-4 h-4 mr-2" />,
  },
  {
    label: "City Break",
    value: "City Break",
    icon: <Building2 className="w-4 h-4 mr-2" />,
  },
  {
    label: "Backpacking",
    value: "Backpacking",
    icon: <LuBackpack size={16} />,
  },
  {
    label: "Family Vacation",
    value: "Family Vacation",
    icon: <Users className="w-4 h-4 mr-2" />,
  },
  {
    label: "Spiritual Journey",
    value: "Spiritual Journey",
    icon: <Leaf className="w-4 h-4 mr-2" />,
  },
  {
    label: "Mountain Escape",
    value: "Mountain Escape",
    icon: <Mountain className="w-4 h-4 mr-2" />,
  },
  {
    label: "Romantic Retreat",
    value: "Romantic Retreat",
    icon: <Heart className="w-4 h-4 mr-2" />,
  },
];

// Step 2: Basic Details
const STEP_2_FIELDS = [
  {
    key: "destination",
    label: "Destination",
    type: "input",
  },
  {
    key: "travelDates",
    label: "Travel Dates",
    type: "date-range",
  },
  {
    key: "groupType",
    label: "Group Type",
    type: "chips",
    options: ["Solo", "Couple", "Family", "Friends"],
  },
  {
    key: "source",
    label: "Departure City (optional)",
    type: "input",
    placeholder: "Departure city",
  },
];

// Step 3: Preferences & Extras
const STEP_3_FIELDS = [
  {
    key: "budget",
    label: "Budget",
    type: "input",
    placeholder: "Your budget range (e.g., ₹20,000, $500)",
  },
  {
    key: "interests",
    label: "Interests",
    type: "input",
    placeholder: "Museums, Adventure, Food & Dining, Nature, Culture...",
  },
  {
    key: "specialNeeds",
    label: "Special Needs",
    type: "input",
    placeholder: "Accessibility, dietary restrictions, etc.",
  },
];

// Add this above the ChatInterface component
const stepVariants = {
  enter: (direction: "forward" | "back") => ({
    x: direction === "forward" ? 80 : -80,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: "forward" | "back") => ({
    x: direction === "forward" ? -80 : 80,
    opacity: 0,
  }),
};

// Add at the top, after imports
const INTEREST_CHIPS = [
  "Adventure",
  "Nature",
  "Beaches",
  "Mountains",
  "Culture",
  "History",
  "Art",
  "Food & Dining",
  "Nightlife",
  "Shopping",
  "Wellness",
  "Wildlife",
  "Sports",
  "Festivals",
  "Family",
  "Photography",
  "Relaxation",
  "Local Experiences",
];

// Add new transition variants for form-to-conversation
// const conversationTransitionVariants = {
//   initial: {
//     opacity: 0,
//     y: 20,
//     scale: 0.95,
//   },
//   animate: {
//     opacity: 1,
//     y: 0,
//     scale: 1,
//   },
//   exit: {
//     opacity: 0,
//     y: -20,
//     scale: 0.95,
//   },
// };

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  sidebarWidth,
  resetTrigger,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use custom hooks for state management
  const {
    inputValue,
    setInputValue,
    clarificationState,
    setClarificationState,
    messages,
    setMessages,
    loading,
    setLoading,
    error,
    setError,
    loadingMessage,
    setLoadingMessage,
    lastUserMessage,
    setLastUserMessage,
    bottomRef,
    resetChat,
  } = useChatState();

  const {
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
    resetToStep1,
  } = useFormStepNavigation();

  // Step management
  const [extractedSlots, setExtractedSlots] = useState<
    Partial<ClarificationState>
  >({});

  const [initialChip, setInitialChip] = useState<string | null>(null);
  const [selectedChip, setSelectedChip] = useState<string | null>(null);

  // Add state for destination placeholder animation
  const [destinationPlaceholderIdx, setDestinationPlaceholderIdx] = useState(0);
  const [destinationDisplayed, setDestinationDisplayed] = useState("");
  const [destinationIsDeleting, setDestinationIsDeleting] = useState(false);

  // State for structured itinerary display
  const [, setStructuredItinerary] =
    useState<ItineraryTypes.StructuredItinerary | null>(null);

  // State for sticky header (unused but kept for future enhancements)
  // const [showStickyHeader, setShowStickyHeader] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      destination: "",
      groupType: "",
      startDate: undefined,
      endDate: undefined,
      budget: "",
      interests: [],
      source: localStorage.getItem("user_city") || "",
      flexibleDates: false,
      flexibleBudget: false,
      specialNeeds: "",
    },
  });

  const startDate = form.watch("startDate");
  const endDate = form.watch("endDate");
  const flexibleDates = form.watch("flexibleDates");

  const totalDays = useMemo(() => {
    if (startDate && endDate && endDate >= startDate) {
      // +1 to make the duration inclusive
      return differenceInCalendarDays(endDate, startDate) + 1;
    }
    return null;
  }, [startDate, endDate]);

  useEffect(() => {
    // When extractedSlots changes, update the form values
    const userCity = localStorage.getItem("user_city") || "";
    form.reset({
      destination: extractedSlots.destination || "",
      groupType: extractedSlots.groupType || "",
      startDate: extractedSlots.startDate
        ? new Date(extractedSlots.startDate)
        : undefined,
      endDate: extractedSlots.endDate
        ? new Date(extractedSlots.endDate)
        : undefined,
      budget: extractedSlots.budget || "",
      interests: extractedSlots.interests || [],
      source:
        typeof extractedSlots.source === "string"
          ? extractedSlots.source
          : typeof userCity === "string"
          ? userCity
          : "",
      flexibleBudget:
        extractedSlots.flexibleBudget !== undefined
          ? extractedSlots.flexibleBudget
          : false,
      flexibleDates:
        extractedSlots.flexibleDates !== undefined
          ? extractedSlots.flexibleDates
          : false,
      specialNeeds: extractedSlots.specialNeeds || "",
    });
  }, [extractedSlots, form]);

  // Determine when to show sticky header
  const shouldShowStickyHeader = useMemo(() => {
    // Show if we have trip data and we're in conversation mode
    const hasBasicTripData =
      extractedSlots.destination ||
      form.getValues().destination ||
      extractedSlots.groupType ||
      form.getValues().groupType ||
      selectedChip ||
      initialChip;

    return (
      hasBasicTripData &&
      !isNewChat &&
      !isTransitioning &&
      currentStep === 1 &&
      !intentRejected
    );
  }, [
    extractedSlots,
    form,
    selectedChip,
    initialChip,
    isNewChat,
    isTransitioning,
    currentStep,
    intentRejected,
  ]);

  // Handle edit action from sticky header
  const handleEditFromHeader = useCallback(() => {
    setCurrentStep(2);
    setIsNewChat(true);
    setShowStepper(true);
    setTransitionPhase("form");
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, error]);

  // Animate destination placeholder
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

  const handleSubmit = async (e: React.FormEvent, retryMessage?: string) => {
    e.preventDefault();
    if (loading) return;
    const messageToSend = retryMessage || inputValue.trim();
    if (!messageToSend) return;
    setError(null);
    setMessages((prev) => [...prev, { role: "user", content: messageToSend }]);
    setInputValue("");
    setLastUserMessage(messageToSend);
    setLoading(true);
    try {
      const res = await clarify(messageToSend, clarificationState);
      setClarificationState(res.updatedState);

      if (res.nextPrompt) {
        // Check if the response is a structured itinerary JSON
        try {
          const parsedItinerary = JSON.parse(res.nextPrompt);
          if (parsedItinerary.tripOverview && parsedItinerary.dailyItinerary) {
            // It's a structured itinerary
            setStructuredItinerary(parsedItinerary);
            setMessages((prev) => [
              ...prev,
              {
                role: "assistant",
                content: "Here's your personalized travel itinerary!",
                component: (
                  <StructuredItineraryDisplay itinerary={parsedItinerary} />
                ),
              },
            ]);
          } else {
            // Regular text response
            setMessages((prev) => [
              ...prev,
              { role: "assistant", content: res.nextPrompt },
            ]);
          }
        } catch (error) {
          // Not JSON or invalid structure, treat as regular text
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: res.nextPrompt },
          ]);
        }
      } else if (res.updatedState.isPlanReady) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Your plan is ready!" },
        ]);
      }
    } catch (err) {
      let msg = "Sorry, something went wrong.";
      if (err instanceof Error && err.message) msg = err.message;
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Initial chip selection handler (just selects, doesn't move to step 2)
  const handleInitialChipClick = (chipValue: string) => {
    setSelectedChip(chipValue);
    setInitialChip(chipValue);
    setExtractedSlots({ tripTheme: chipValue });
  };

  // Continue button handler for step 1
  const handleStep1Continue = () => {
    if (selectedChip) {
      setNavDirection("forward");
      setMessages((prev) => [...prev, { role: "user", content: selectedChip }]);
      setLastUserMessage(selectedChip);
      setIsNewChat(false);
      setCurrentStep(2);
      setIntentRejected(false);
    }
  };

  // Chips for slot questions after initial chat
  const handleChipClick = async (chipValue: string) => {
    if (loading) return;

    // Handle chips (like group type)
    setMessages((prev) => [...prev, { role: "user", content: chipValue }]);
    setInputValue("");
    setLastUserMessage(chipValue);
    setIsNewChat(false);
    setLoading(true);
    setError(null);
    setLoadingMessage("Processing your request...");

    // Add loading status updates
    const statusUpdateInterval = setInterval(() => {
      setLoadingMessage((prev) => {
        const messages = [
          "Processing your request...",
          "Analyzing your travel preferences...",
          "Generating personalized itinerary...",
          "Creating detailed recommendations...",
          "Finalizing your travel plan...",
        ];
        const currentIndex = messages.indexOf(prev);
        return messages[(currentIndex + 1) % messages.length];
      });
    }, 8000); // Update every 8 seconds
    try {
      const res = await clarify(chipValue, clarificationState);
      setClarificationState(res.updatedState);

      if (res.nextPrompt) {
        // Check if the response is a structured itinerary JSON
        try {
          const parsedItinerary = JSON.parse(res.nextPrompt);
          if (parsedItinerary.tripOverview && parsedItinerary.dailyItinerary) {
            // It's a structured itinerary
            setStructuredItinerary(parsedItinerary);
            setMessages((prev) => [
              ...prev,
              {
                role: "assistant",
                content: "Here's your personalized travel itinerary!",
                component: (
                  <StructuredItineraryDisplay itinerary={parsedItinerary} />
                ),
              },
            ]);
          } else {
            // Regular text response
            setMessages((prev) => [
              ...prev,
              { role: "assistant", content: res.nextPrompt },
            ]);
          }
        } catch (error) {
          // Not JSON or invalid structure, treat as regular text
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: res.nextPrompt },
          ]);
        }
      } else if (res.updatedState.isPlanReady) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Your plan is ready!" },
        ]);
      }
    } catch (err) {
      let msg = "Sorry, something went wrong.";
      if (err instanceof Error && err.message) msg = err.message;
      setError(msg);
    } finally {
      clearInterval(statusUpdateInterval);
      setLoading(false);
      setLoadingMessage("Processing your request...");
    }
  };

  // Find chips for the latest assistant message
  const lastAssistantMsg =
    messages.filter((m) => m.role === "assistant").slice(-1)[0]?.content || "";
  const chipsToShow = getChipsForPrompt(lastAssistantMsg);

  // Responsive max width for chat area and input bar
  const maxWidth = Math.min(900, window.innerWidth - sidebarWidth - 32);

  // Filter fields: if Surprise Me, omit destination
  const fieldsToShow = useMemo(() => {
    if (initialChip && initialChip.toLowerCase().includes("surprise")) {
      return STEP_2_FIELDS.filter((field) => field.key !== "destination");
    }
    return STEP_2_FIELDS;
  }, [initialChip]);

  // Enhanced reset function
  const handleReset = useCallback(() => {
    console.log("[ChatInterface] Resetting chat to initial state");

    // Use the hook's resetChat for chat state
    resetChat();

    // Reset additional state
    setExtractedSlots({});
    setInitialChip(null);
    setSelectedChip(null);
    resetToStep1();
    setStructuredItinerary(null);

    // Reset form
    const userCity = localStorage.getItem("user_city") || "";
    form.reset({
      destination: "",
      groupType: "",
      startDate: undefined,
      endDate: undefined,
      budget: "",
      interests: [],
      source: typeof userCity === "string" ? userCity : "",
      flexibleDates: false,
      flexibleBudget: false,
      specialNeeds: "",
    });

    // Reset typing animation states
    setDestinationPlaceholderIdx(0);
    setDestinationDisplayed("");
    setDestinationIsDeleting(false);
  }, [form, resetChat, resetToStep1]);

  // Effect to trigger reset when resetTrigger changes
  React.useEffect(() => {
    if (resetTrigger && resetTrigger > 0) {
      console.log("[ChatInterface] Reset triggered from sidebar");
      handleReset();
    }
  }, [resetTrigger, handleReset]);

  const canContinueStep2 = useMemo(() => {
    const groupType = form.watch("groupType");
    const startDate = form.watch("startDate");
    const endDate = form.watch("endDate");
    const flexibleDates = form.watch("flexibleDates");
    const hasDates = !!startDate && !!endDate;
    // groupType must be one of the allowed values
    const allowedGroupTypes = GROUP_TYPE_CHIPS.map((c) => c.value);
    return (
      allowedGroupTypes.includes(groupType) &&
      (hasDates || flexibleDates === true)
    );
  }, [
    form.watch("groupType"),
    form.watch("startDate"),
    form.watch("endDate"),
    form.watch("flexibleDates"),
  ]);

  return (
    <main className="h-full flex flex-col box-border overflow-hidden">
      <section className="flex-1 flex flex-col w-full h-full items-center box-border overflow-hidden">
        <div className="relative flex flex-col w-full max-w-full py-2 sm:py-0 items-center h-full box-border overflow-hidden">
          {/* Conditionally render Stepper with smooth transition */}
          <AnimatePresence>
            {showStepper && (
              <motion.div
                initial={{ opacity: 1, y: 0, height: "auto" }}
                exit={{
                  opacity: 0,
                  y: -20,
                  height: 0,
                  marginBottom: 0,
                  paddingTop: 0,
                  paddingBottom: 0,
                }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="w-full flex justify-center items-center flex-shrink-0"
              >
                <div className="w-full max-w-2xl px-3 sm:px-4">
                  <Stepper step={currentStep as 1 | 2 | 3} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative w-full h-full overflow-hidden">
            <AnimatePresence custom={navDirection} mode="wait" initial={false}>
              <ChatTransitionManager
                isTransitioning={isTransitioning}
                transitionPhase={transitionPhase}
                messages={messages}
              />

              {/* Step 1: Choose Trip Type */}
              {currentStep === 1 &&
                isNewChat &&
                !intentRejected &&
                !isTransitioning && (
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
                            onClick={() => handleInitialChipClick(chip.value)}
                            disabled={loading}
                            type="button"
                          >
                            <div className="flex flex-col sm:flex-col items-center gap-0.5 sm:gap-1">
                              <span className="flex-shrink-0 [&>*]:w-3 [&>*]:h-3 sm:[&>*]:w-4 sm:[&>*]:h-4">
                                {chip.icon}
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
                          onClick={() => {
                            setNavDirection("forward");
                            setCurrentStep(2);
                          }}
                          disabled={loading}
                        >
                          Skip
                        </Button>
                        {!selectedChip && currentStep === 1 ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="w-full block">
                                <Button
                                  type="button"
                                  className="w-full px-3 py-1.5 sm:px-4 sm:py-2 rounded-md bg-indigo-800 hover:bg-indigo-700 text-white font-medium shadow border border-indigo-700 flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm h-8 sm:h-9"
                                  disabled={!selectedChip || loading}
                                  onClick={handleStep1Continue}
                                >
                                  <ChevronRight className="w-4 h-4 sm:hidden" />
                                  <span className="hidden sm:inline">
                                    Continue
                                  </span>
                                </Button>
                              </span>
                            </TooltipTrigger>
                            <TooltipContent
                              side="top"
                              className="max-w-xs text-center"
                            >
                              Please select a trip type to continue.
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <Button
                            type="button"
                            className="w-full px-3 py-1.5 sm:px-4 sm:py-2 rounded-md bg-indigo-800 hover:bg-indigo-700 text-white font-medium shadow border border-indigo-700 flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm h-8 sm:h-9 sm:min-w-[100px]"
                            disabled={!selectedChip || loading}
                            onClick={handleStep1Continue}
                          >
                            <ChevronRight className="w-4 h-4 sm:hidden" />
                            <span className="hidden sm:inline">Continue</span>
                          </Button>
                        )}
                      </div>
                      {error && (
                        <div className="mt-2 text-rose-400 text-sm text-center">
                          {error}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

              {/* Step 2: Basic Details */}
              {currentStep === 2 && !intentRejected && !isTransitioning && (
                <motion.div
                  key="step-2"
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
                  <div className="mb-4 sm:mb-6 text-base sm:text-lg font-semibold text-slate-100 text-center w-full px-2 sm:px-0">
                    To craft your perfect itinerary, could you share a few more
                    trip details?
                  </div>
                  <Form {...form}>
                    <form
                      className="w-full max-w-sm sm:max-w-3xl mx-auto flex flex-col gap-4 sm:gap-6 px-2 sm:px-4"
                      onSubmit={form.handleSubmit(async (values) => {
                        // Just move to step 3, don't submit to backend yet
                        const processedValues: Partial<ClarificationState> = {
                          destination: values.destination,
                          source: values.source,
                          groupType:
                            values.groupType as ClarificationState["groupType"],
                          startDate: values.startDate
                            ? format(values.startDate, "yyyy-MM-dd")
                            : undefined,
                          endDate: values.endDate
                            ? format(values.endDate, "yyyy-MM-dd")
                            : undefined,
                          budget: values.budget,
                          interests: values.interests || [],
                          specialNeeds: values.specialNeeds,
                          flexibleDates: values.flexibleDates,
                        };

                        setExtractedSlots((prev) => ({
                          ...prev,
                          ...processedValues,
                        }));
                        setCurrentStep(3);
                      })}
                    >
                      {fieldsToShow.map((field) => (
                        <div key={field.key} className="w-full">
                          {field.key === "travelDates" ? (
                            <div>
                              <div className="flex gap-1.5 sm:gap-2">
                                <FormField
                                  control={form.control}
                                  name="startDate"
                                  render={({ field }) => (
                                    <FormItem className="flex flex-col flex-1">
                                      <FormLabel className="text-xs sm:text-sm">
                                        Start Date
                                      </FormLabel>
                                      <FormControl>
                                        <DatePicker
                                          field={field}
                                          placeholderText="Select start date"
                                          minDate={new Date()}
                                          disabled={flexibleDates}
                                        />
                                      </FormControl>
                                      <FormMessage className="text-rose-500 text-xs" />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name="endDate"
                                  render={({ field }) => (
                                    <FormItem className="flex flex-col flex-1">
                                      <FormLabel className="text-xs sm:text-sm">
                                        End Date
                                      </FormLabel>
                                      <FormControl>
                                        <DatePicker
                                          field={field}
                                          placeholderText="Select end date"
                                          minDate={
                                            form.watch("startDate") ||
                                            new Date()
                                          }
                                          disabled={
                                            !form.watch("startDate") ||
                                            flexibleDates
                                          }
                                        />
                                      </FormControl>
                                      <FormMessage className="text-rose-500 text-xs" />
                                    </FormItem>
                                  )}
                                />
                              </div>
                              <div className="flex items-center gap-2 mt-1.5 sm:mt-2">
                                <FormField
                                  control={form.control}
                                  name="flexibleDates"
                                  render={({ field }) => (
                                    <FormItem className="flex flex-row items-center">
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value}
                                          onCheckedChange={(checked) => {
                                            field.onChange(checked);
                                            if (checked) {
                                              form.setValue(
                                                "startDate",
                                                undefined,
                                                { shouldValidate: true }
                                              );
                                              form.setValue(
                                                "endDate",
                                                undefined,
                                                { shouldValidate: true }
                                              );
                                            }
                                          }}
                                          className="mr-1.5 sm:mr-2"
                                        />
                                      </FormControl>
                                      <FormLabel className="text-slate-300 text-xs sm:text-sm font-normal cursor-pointer select-none">
                                        My dates are flexible
                                      </FormLabel>
                                    </FormItem>
                                  )}
                                />
                                <div className="flex-1 text-right text-sm min-h-[1.25rem] pr-1 flex items-center justify-end gap-2">
                                  {!flexibleDates &&
                                  totalDays &&
                                  totalDays > 0 ? (
                                    <>
                                      <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                                      <span className="text-slate-200">
                                        {totalDays}{" "}
                                        {totalDays === 1 ? "Day" : "Days"}
                                      </span>
                                    </>
                                  ) : (
                                    <span>&nbsp;</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ) : field.key === "destination" ? (
                            <FormField
                              control={form.control}
                              name="destination"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-xs sm:text-sm">
                                    Destination
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      placeholder={destinationDisplayed || ""}
                                      className="w-full px-3 py-2 sm:px-4 sm:py-3 rounded-md bg-slate-800 text-slate-200 border border-slate-700 focus:outline-none focus:border-indigo-500 text-sm sm:text-base font-sans"
                                    />
                                  </FormControl>
                                  <FormMessage className="text-rose-500 text-xs" />
                                </FormItem>
                              )}
                            />
                          ) : field.key === "groupType" ? (
                            <FormField
                              control={form.control}
                              name="groupType"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-xs sm:text-sm">
                                    Group Type
                                  </FormLabel>
                                  <FormControl>
                                    <GroupTypeChips
                                      options={GROUP_TYPE_CHIPS.map(
                                        (c) => c.value
                                      )}
                                      value={field.value || ""}
                                      onChange={field.onChange}
                                    />
                                  </FormControl>
                                  <FormMessage className="text-rose-500 text-xs" />
                                </FormItem>
                              )}
                            />
                          ) : field.key === "source" ? (
                            <FormField
                              control={form.control}
                              name="source"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-xs sm:text-sm">
                                    Departure City (optional)
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      placeholder="Departure city"
                                      className="w-full px-3 py-2 sm:px-4 sm:py-3 rounded-md bg-slate-800 text-slate-200 border border-slate-700 focus:outline-none focus:border-indigo-500 text-sm sm:text-base font-sans"
                                    />
                                  </FormControl>
                                  <FormMessage className="text-rose-500 text-xs" />
                                </FormItem>
                              )}
                            />
                          ) : null}
                        </div>
                      ))}

                      {/* Navigation buttons */}
                      <div className="grid grid-cols-3 gap-2 sm:grid sm:grid-cols-3 sm:gap-4 mt-4 sm:mt-6 w-full">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          aria-label="Go back"
                          className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm h-8 sm:h-9 flex items-center justify-center"
                          onClick={() => {
                            setNavDirection("back");
                            setTimeout(() => {
                              setCurrentStep(1);
                              setIsNewChat(true);
                            }, 0);
                          }}
                        >
                          <ChevronLeft className="w-4 h-4 sm:hidden" />
                          <span className="hidden sm:inline">Back</span>
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-700 font-medium text-xs sm:text-sm h-8 sm:h-9"
                          onClick={() => {
                            setNavDirection("forward");
                            setCurrentStep(3);
                          }}
                          disabled={loading}
                        >
                          Skip
                        </Button>
                        {!canContinueStep2 && currentStep === 2 ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="w-full block">
                                <Button
                                  type="submit"
                                  className="w-full px-3 py-1.5 sm:px-4 sm:py-2 rounded-md bg-indigo-800 hover:bg-indigo-700 text-white font-medium shadow border border-indigo-700 flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm h-8 sm:h-9"
                                  disabled={loading || !canContinueStep2}
                                  onClick={() => setNavDirection("forward")}
                                >
                                  <ChevronRight className="w-4 h-4 sm:hidden" />
                                  <span className="hidden sm:inline">
                                    Continue
                                  </span>
                                </Button>
                              </span>
                            </TooltipTrigger>
                            <TooltipContent
                              side="top"
                              className="max-w-xs text-center"
                            >
                              {(() => {
                                const groupType = form.watch("groupType");
                                const startDate = form.watch("startDate");
                                const endDate = form.watch("endDate");
                                const flexibleDates =
                                  form.watch("flexibleDates");
                                const allowedGroupTypes = GROUP_TYPE_CHIPS.map(
                                  (c) => c.value
                                );
                                if (!allowedGroupTypes.includes(groupType)) {
                                  return "Please select who is traveling (Group Type).";
                                }
                                if (
                                  !(!!startDate && !!endDate) &&
                                  !flexibleDates
                                ) {
                                  return "Please enter travel dates or select 'My dates are flexible'.";
                                }
                                return "Please complete the required fields above.";
                              })()}
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <Button
                            type="submit"
                            className="w-full px-3 py-1.5 sm:px-4 sm:py-2 rounded-md bg-indigo-800 hover:bg-indigo-700 text-white font-medium shadow border border-indigo-700 flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm h-8 sm:h-9"
                            disabled={loading || !canContinueStep2}
                            onClick={() => setNavDirection("forward")}
                          >
                            <ChevronRight className="w-4 h-4 sm:hidden" />
                            <span className="hidden sm:inline">Continue</span>
                          </Button>
                        )}
                      </div>
                      {error && (
                        <div className="mt-2 text-rose-400 text-sm">
                          {error}
                        </div>
                      )}
                    </form>
                  </Form>
                </motion.div>
              )}

              {/* Step 3: Preferences & Extras */}
              {currentStep === 3 && !intentRejected && !isTransitioning && (
                <motion.div
                  key="step-3"
                  custom={navDirection}
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: 0.3,
                    ease: "easeOut",
                  }}
                  className="flex flex-col items-center justify-center w-full flex-1 pt-6 sm:pt-8 px-0 min-h-0"
                >
                  <div className="mb-4 sm:mb-6 text-base sm:text-lg font-semibold text-slate-100 text-center w-full px-2 sm:px-0">
                    Almost there! Add a few preferences to enhance your trip.
                  </div>
                  {/* Common parent for chip selector and form fields */}
                  <div className="w-full max-w-sm sm:max-w-3xl mx-auto px-2 sm:px-4">
                    <Form {...form}>
                      <form
                        className="w-full flex flex-col gap-4 sm:gap-6"
                        onSubmit={form.handleSubmit(async (values) => {
                          // Step 1: Start transition immediately to prevent conversation flash
                          setIsTransitioning(true);
                          setTransitionPhase("form");
                          setShowStepper(false);
                          setCurrentStep(1); // This triggers step 3 to fade out

                          // Step 2: Wait for form to completely disappear (300ms transition + buffer)
                          await new Promise((resolve) =>
                            setTimeout(resolve, 350)
                          );

                          // Step 3: Now prepare data and card AFTER form is completely gone
                          const allSlotValues = {
                            ...extractedSlots,
                            ...values,
                          };

                          // Process interests as string if array
                          const processedSlotValues = {
                            ...allSlotValues,
                            interests: Array.isArray(values.interests)
                              ? values.interests
                              : typeof values.interests === "string" &&
                                values.interests
                              ? (values.interests as string)
                                  .split(",")
                                  .map((item) => item.trim())
                                  .filter(Boolean)
                              : [],
                          };

                          // When calling clarify, just pass interests as is (array or null)
                          const clarifyPayload = {
                            ...clarificationState,
                            ...processedSlotValues,
                            tripTheme:
                              processedSlotValues.tripTheme ||
                              clarificationState.tripTheme ||
                              initialChip ||
                              "",
                            groupType:
                              processedSlotValues.groupType as ClarificationState["groupType"],
                            interests:
                              processedSlotValues.interests &&
                              processedSlotValues.interests.length > 0
                                ? processedSlotValues.interests
                                : null,
                          } as ClarificationState;

                          // Skip card phase and go directly to conversation
                          setTransitionPhase("conversation");

                          // Step 5: API call during card display
                          setLoading(true);
                          setError(null);

                          // Add progress message
                          setMessages((prev) => [
                            ...prev,
                            {
                              role: "assistant",
                              content:
                                "🤖 Generating your personalized itinerary...",
                            },
                          ]);

                          try {
                            const res = await clarify("", clarifyPayload);
                            setClarificationState(res.updatedState);

                            // Check if we got a structured itinerary response
                            if (res.nextPrompt) {
                              try {
                                const parsedItinerary = JSON.parse(
                                  res.nextPrompt
                                );
                                if (
                                  parsedItinerary.tripOverview &&
                                  parsedItinerary.dailyItinerary
                                ) {
                                  // It's a structured itinerary!
                                  setStructuredItinerary(parsedItinerary);

                                  // Replace loading message with success + component
                                  setMessages((prev) => [
                                    ...prev.slice(0, -1), // Remove loading message
                                    {
                                      role: "assistant",
                                      content:
                                        "🎉 Here's your personalized travel itinerary!",
                                      component: (
                                        <StructuredItineraryDisplay
                                          itinerary={parsedItinerary}
                                        />
                                      ),
                                    },
                                  ]);

                                  // Step 6: Transition to conversation to show the itinerary
                                  setTransitionPhase("conversation");
                                  await new Promise((resolve) =>
                                    setTimeout(resolve, 300)
                                  );

                                  // Complete transition
                                  setIsTransitioning(false);
                                  setIsNewChat(false);
                                  return; // Exit early - we have our itinerary
                                } else {
                                  // Regular text response
                                  setMessages((prev) => [
                                    ...prev.slice(0, -1), // Remove loading message
                                    {
                                      role: "assistant",
                                      content: res.nextPrompt,
                                    },
                                  ]);
                                }
                              } catch (parseError) {
                                // Not JSON, treat as regular text
                                setMessages((prev) => [
                                  ...prev.slice(0, -1), // Remove loading message
                                  {
                                    role: "assistant",
                                    content: res.nextPrompt,
                                  },
                                ]);
                              }
                            }

                            // Wait for card to be visible (only if no itinerary generated)
                            await new Promise((resolve) =>
                              setTimeout(resolve, 800)
                            );

                            // Step 6: Transition to conversation
                            setTransitionPhase("conversation");
                            await new Promise((resolve) =>
                              setTimeout(resolve, 300)
                            );

                            // Complete transition
                            setIsTransitioning(false);
                            setIsNewChat(false);
                          } catch (err) {
                            let msg = "Sorry, something went wrong.";
                            if (err instanceof Error && err.message)
                              msg = err.message;
                            setError(msg);
                            setIsTransitioning(false);
                            setShowStepper(true);
                            setCurrentStep(3);
                            setTransitionPhase("form");
                          } finally {
                            setLoading(false);
                          }
                        })}
                      >
                        {STEP_3_FIELDS.map((field) => (
                          <div key={field.key} className="w-full">
                            {field.key === "budget" ? (
                              <div>
                                <FormField
                                  control={form.control}
                                  name="budget"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-xs sm:text-sm">
                                        Budget
                                      </FormLabel>
                                      <FormControl>
                                        <Input
                                          {...field}
                                          placeholder="Your budget range (e.g., ₹20,000, $500)"
                                          className="w-full px-3 py-2 sm:px-4 sm:py-3 rounded-md bg-slate-800 text-slate-200 border border-slate-700 focus:outline-none focus:border-indigo-500 text-sm sm:text-base font-sans"
                                        />
                                      </FormControl>
                                      <FormMessage className="text-rose-500 text-xs" />
                                    </FormItem>
                                  )}
                                />
                                <div className="flex items-center gap-2 mt-1.5 sm:mt-2">
                                  <FormField
                                    control={form.control}
                                    name="flexibleBudget"
                                    render={({ field }) => (
                                      <FormItem className="flex flex-row items-center">
                                        <FormControl>
                                          <Checkbox
                                            checked={field.value}
                                            onCheckedChange={(checked) => {
                                              field.onChange(checked);
                                              if (checked) {
                                                form.setValue("budget", "", {
                                                  shouldValidate: true,
                                                });
                                              }
                                            }}
                                            className="mr-1.5 sm:mr-2"
                                          />
                                        </FormControl>
                                        <FormLabel className="text-slate-300 text-xs sm:text-sm font-normal cursor-pointer select-none">
                                          My budget is flexible
                                        </FormLabel>
                                      </FormItem>
                                    )}
                                  />
                                </div>
                              </div>
                            ) : field.key === "interests" ? (
                              <>
                                <label className="block font-medium mb-1 mt-2 sm:mt-3 text-xs sm:text-sm">
                                  Interests
                                </label>
                                <div className="flex items-center w-full h-10 sm:h-12">
                                  <HorizontalChipSelector
                                    options={INTEREST_CHIPS}
                                    value={
                                      (form.watch("interests") ??
                                        []) as string[]
                                    }
                                    onChange={(chips) =>
                                      form.setValue("interests", chips)
                                    }
                                    placeholder="Select one or more interests"
                                  />
                                </div>
                              </>
                            ) : field.key === "specialNeeds" ? (
                              <FormField
                                control={form.control}
                                name="specialNeeds"
                                render={({ field: formField }) => (
                                  <FormItem>
                                    <FormLabel className="text-xs sm:text-sm">
                                      Special Needs
                                    </FormLabel>
                                    <FormControl>
                                      <Input
                                        {...formField}
                                        placeholder="Accessibility, dietary restrictions, etc."
                                        className="w-full px-3 py-2 sm:px-4 sm:py-3 rounded-md bg-slate-800 text-slate-200 border border-slate-700 focus:outline-none focus:border-indigo-500 text-sm sm:text-base font-sans"
                                      />
                                    </FormControl>
                                    <FormMessage className="text-rose-500 text-xs" />
                                  </FormItem>
                                )}
                              />
                            ) : null}
                          </div>
                        ))}

                        {/* Navigation buttons */}
                        <div className="grid grid-cols-3 gap-2 sm:grid sm:grid-cols-3 sm:gap-4 mt-4 sm:mt-6 w-full">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            aria-label="Go back"
                            className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm h-8 sm:h-9 flex items-center justify-center"
                            onClick={() => {
                              setNavDirection("back");
                              setCurrentStep(2);
                            }}
                          >
                            <ChevronLeft className="w-4 h-4 sm:hidden" />
                            <span className="hidden sm:inline">Back</span>
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-700 font-medium text-xs sm:text-sm h-8 sm:h-9"
                            onClick={async () => {
                              setIsTransitioning(true);
                              setShowStepper(false);
                              setTransitionPhase("conversation");

                              await new Promise((resolve) =>
                                setTimeout(resolve, 300)
                              );

                              setNavDirection("forward");
                              setCurrentStep(1);
                              setIsNewChat(false);
                              setIsTransitioning(false);
                              setTransitionPhase("form");
                              // No messages set - start with empty conversation
                              setMessages([]);
                            }}
                            disabled={loading}
                          >
                            Skip
                          </Button>
                          <Button
                            type="submit"
                            className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-md bg-indigo-800 hover:bg-indigo-700 text-white font-medium shadow border border-indigo-700 flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm h-8 sm:h-9"
                            disabled={loading}
                          >
                            <ChevronRight className="w-4 h-4 sm:hidden" />
                            <span className="hidden sm:inline">Finish</span>
                          </Button>
                        </div>
                        {error && (
                          <div className="mt-2 text-rose-400 text-sm">
                            {error}
                          </div>
                        )}
                      </form>
                    </Form>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Normal chat UI after steps */}
          {currentStep === 1 &&
            !isNewChat &&
            !intentRejected &&
            !isTransitioning && (
              <motion.div
                key="conversation"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="w-full h-full flex flex-col items-center"
              >
                {/* Sticky Trip Summary Header */}
                {shouldShowStickyHeader && (
                  <div className="w-full flex justify-center px-4 py-3 flex-shrink-0">
                    <TripSummaryHeader
                      tripData={extractedSlots}
                      tripTheme={selectedChip || initialChip || undefined}
                      formData={form.getValues()}
                      onEdit={handleEditFromHeader}
                      isVisible={true}
                      maxWidth={maxWidth}
                      sidebarWidth={sidebarWidth}
                    />
                  </div>
                )}

                {/* Chat messages */}
                <ChatMessageList
                  messages={messages}
                  chipsToShow={chipsToShow}
                  onChipClick={handleChipClick}
                  loading={loading}
                  loadingMessage={loadingMessage}
                  error={error}
                  lastUserMessage={lastUserMessage}
                  onRetry={(message) =>
                    handleSubmit(
                      { preventDefault: () => {} } as React.FormEvent,
                      message
                    )
                  }
                  maxWidth={maxWidth}
                />
                {/* Input bar - floating at bottom, centered */}
                <div className="w-full flex justify-center px-4 pb-6 flex-shrink-0">
                  <div style={{ maxWidth, width: "100%" }}>
                    <ChatInputBar
                      inputValue={inputValue}
                      setInputValue={setInputValue}
                      loading={loading}
                      handleSubmit={handleSubmit}
                      fileInputRef={fileInputRef}
                      displayed=""
                      sidebarWidth={0}
                      maxWidth={maxWidth}
                    />
                  </div>
                </div>
              </motion.div>
            )}

          {/* Show chat history even when intent is rejected */}
          {intentRejected && !isTransitioning && (
            <div className="w-full h-full flex flex-col items-center">
              <div className="flex-1 flex flex-col items-center overflow-hidden pt-8 pb-8 space-y-4 w-full">
                <div
                  className="w-full flex flex-col gap-6 mx-auto"
                  style={{ maxWidth }}
                >
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`w-full flex ${
                        msg.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      {msg.component ? (
                        msg.component
                      ) : (
                        <div
                          className={`px-5 py-3 rounded-xl max-w-[80%] text-base font-sans whitespace-pre-line shadow-md transition-all duration-200 mx-0
                            ${
                              msg.role === "user"
                                ? "bg-indigo-800/50 text-white border border-indigo-500/60 rounded-br-xs"
                                : "bg-slate-800 text-slate-100 rounded-bl-xs border border-slate-700"
                            }
                          `}
                        >
                          {msg.content}
                        </div>
                      )}
                    </div>
                  ))}
                  <div ref={bottomRef} />
                </div>
              </div>
              <div className="w-full flex justify-center px-4 pb-6 flex-shrink-0">
                <div style={{ maxWidth, width: "100%" }}>
                  <ChatInputBar
                    inputValue={inputValue}
                    setInputValue={setInputValue}
                    loading={loading}
                    handleSubmit={handleSubmit}
                    fileInputRef={fileInputRef}
                    displayed=""
                    sidebarWidth={0}
                    maxWidth={maxWidth}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default ChatInterface;

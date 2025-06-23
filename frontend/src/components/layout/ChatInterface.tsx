import React, { useRef, useState, useEffect, useMemo } from "react";
import { clarify } from "@/api/clarify";
import ChatInputBar from "./ChatInputBar.tsx";
import {
  RotateCcw,
  Sun,
  Car,
  Users,
  Gift,
  Mountain,
  Leaf,
  Plane,
  ArrowRight,
  ArrowLeft,
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

const formSchema = z.object({
  destination: z.string().min(1, "Destination is required."),
  groupType: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  budget: z.string().optional(),
  source: z.string().optional(),
  flexibleDates: z.boolean().optional(),
  flexibleBudget: z.boolean().optional(),
});

const PLACEHOLDER_EXAMPLES = [
  "A budget road trip from Bangalore to Coorg under ₹5,000",
  "A weekend escape under $300 from New York",
  "A scenic drive through Bavaria with friends",
  "A quiet onsen retreat near Mt. Fuji",
  "A Eurostar weekend trip from London to Paris",
  "A family beach holiday in Phuket under ฿20,000",
  "A cultural city break in Paris for under €250",
  "A road trip from Seoul to Busan with local food stops",
  "A short escape to Niagara Falls from Toronto",
  "A Carnival season trip through Rio de Janeiro",
  "A temple and volcano tour in Bali",
  "A snowy weekend in St. Petersburg",
  "A historical tour from Cairo to Luxor",
];

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

// Define ClarificationState locally
interface ClarificationState {
  source?: string;
  destination?: string;
  travelDates?: string;
  duration?: string;
  groupType?: "solo" | "couple" | "family" | "friends";
  budget?: string;
  domesticOrInternational?: "domestic" | "international";
  modeOfTransport?:
    | "own car"
    | "rental car"
    | "taxi"
    | "train"
    | "bus"
    | "flight";
  carModel?: string;
  flightPreferences?: string;
  accommodation?: string;
  travelPace?: string;
  occasion?: string;
  foodPreference?: string;
  specialNeeds?: string;
  climatePreference?: string;
  interests?: string[];
  inputHistory: string[];
  isPlanReady: boolean;
  startDate?: string;
  endDate?: string;
  tripTheme?: string;
}

const initialClarificationState: ClarificationState = {
  source: "",
  destination: "",
  travelDates: "",
  duration: "",
  groupType: undefined,
  budget: "",
  domesticOrInternational: undefined,
  modeOfTransport: undefined,
  carModel: "",
  flightPreferences: "",
  accommodation: "",
  travelPace: "",
  occasion: "",
  foodPreference: "",
  specialNeeds: "",
  climatePreference: "",
  interests: [],
  inputHistory: [],
  isPlanReady: false,
  tripTheme: "",
};

interface ChatInterfaceProps {
  sidebarCollapsed: boolean;
  sidebarWidth: number;
}

// Add chip options for common slots
const GROUP_TYPE_CHIPS = [
  { label: "Solo", value: "solo" },
  { label: "Couple", value: "couple" },
  { label: "Family", value: "family" },
  { label: "Friends", value: "friends" },
];
const MODE_OF_TRANSPORT_CHIPS = [
  { label: "Own Car", value: "own car" },
  { label: "Rental Car", value: "rental car" },
  { label: "Taxi", value: "taxi" },
  { label: "Train", value: "train" },
  { label: "Bus", value: "bus" },
  { label: "Flight", value: "flight" },
];

// Helper to detect which chips to show based on prompt
function getChipsForPrompt(prompt: string) {
  if (/who is traveling|group type/i.test(prompt)) return GROUP_TYPE_CHIPS;
  if (/mode of transport|how do you want to travel|travel mode/i.test(prompt))
    return MODE_OF_TRANSPORT_CHIPS;
  return null;
}

// Initial journey type chips with icons
const INITIAL_CHIPS = [
  {
    label: "Beach Holiday",
    value: "Beach Holiday",
    icon: <Sun className="w-4 h-4 mr-2" />,
  },
  {
    label: "Road Trip",
    value: "Road Trip",
    icon: <Car className="w-4 h-4 mr-2" />,
  },
  {
    label: "Family Vacation",
    value: "Family Vacation",
    icon: <Users className="w-4 h-4 mr-2" />,
  },
  {
    label: "Surprise Me",
    value: "Surprise Me",
    icon: <Gift className="w-4 h-4 mr-2" />,
  },
  {
    label: "Mountain Retreat",
    value: "Mountain Retreat",
    icon: <Mountain className="w-4 h-4 mr-2" />,
  },
  {
    label: "Spiritual Escape",
    value: "Spiritual Escape",
    icon: <Leaf className="w-4 h-4 mr-2" />,
  },
  {
    label: "International Trip",
    value: "International Trip",
    icon: (
      <span className="mr-2">
        <Plane className="w-4 h-4" />
      </span>
    ),
  },
  {
    label: "Backpacking",
    value: "Backpacking",
    icon: (
      <span className="mr-2">
        <LuBackpack size={16} />
      </span>
    ),
  },
];

// Sort chips by label length (smallest to largest)
const INITIAL_CHIPS_SORTED = [...INITIAL_CHIPS].sort(
  (a, b) => a.label.length - b.label.length
);

const SLOT_ORDER = [
  {
    key: "destination",
    label: "Destination",
    type: "input",
    placeholder: "Do you have a specific destination in mind?",
  },
  {
    key: "groupType",
    label: "Group Type",
    type: "chips",
    options: ["Solo", "Couple", "Family", "Friends"],
  },
  {
    key: "travelDates",
    label: "Travel Dates",
    type: "input",
    placeholder:
      "When do you want to travel? (e.g., 7 days, weekend, 12-18 May)",
  },
  {
    key: "budget",
    label: "Budget (optional)",
    type: "input",
    placeholder: "Your budget (e.g., Rs ₹20000, $500, flexible)",
  },
  {
    key: "source",
    label: "Departure City (optional)",
    type: "input",
    placeholder: "Where are you starting from? (optional)",
  },
];

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  sidebarCollapsed,
  sidebarWidth,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState("");
  const [clarificationState, setClarificationState] =
    useState<ClarificationState>(initialClarificationState);
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([
    {
      role: "assistant",
      content:
        "What kind of journey are you dreaming of? You can type, or show me a photo for inspiration.",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUserMessage, setLastUserMessage] = useState<string | null>(null);

  // Typing animation state
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const [isNewChat, setIsNewChat] = useState(true);
  const [showInitialSlots, setShowInitialSlots] = useState(false);
  const [missingSlots, setMissingSlots] = useState<string[]>([]);
  const [intentRejected, setIntentRejected] = useState(false);
  const [extractedSlots, setExtractedSlots] = useState<
    Partial<ClarificationState>
  >({});

  const [inputFocused, setInputFocused] = useState(false);
  const [initialChip, setInitialChip] = useState<string | null>(null);

  // Add state for destination placeholder animation
  const [destinationPlaceholderIdx, setDestinationPlaceholderIdx] = useState(0);
  const [destinationDisplayed, setDestinationDisplayed] = useState("");
  const [destinationIsDeleting, setDestinationIsDeleting] = useState(false);
  const [destinationInputFocused, setDestinationInputFocused] = useState(false);
  const [destinationInputValue, setDestinationInputValue] = useState("");

  const [inputFocusStates, setInputFocusStates] = useState<{
    [key: string]: boolean;
  }>({});

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      destination: "",
      groupType: "",
      startDate: undefined,
      endDate: undefined,
      budget: "",
      source: "",
      flexibleDates: false,
      flexibleBudget: false,
    },
  });

  const startDate = form.watch("startDate");
  const endDate = form.watch("endDate");
  const flexibleDates = form.watch("flexibleDates");
  const flexibleBudget = form.watch("flexibleBudget");

  const totalDays = useMemo(() => {
    if (startDate && endDate && endDate >= startDate) {
      // +1 to make the duration inclusive
      return differenceInCalendarDays(endDate, startDate) + 1;
    }
    return null;
  }, [startDate, endDate]);

  useEffect(() => {
    // When extractedSlots changes, update the form values
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
      source: extractedSlots.source || "",
      flexibleBudget: false,
      flexibleDates: false,
    });
  }, [extractedSlots, form]);

  useEffect(() => {
    const current = PLACEHOLDER_EXAMPLES[placeholderIdx];
    let timeout: NodeJS.Timeout;
    if (!isDeleting && displayed.length < current.length) {
      timeout = setTimeout(
        () => setDisplayed(current.slice(0, displayed.length + 1)),
        TYPING_SPEED
      );
    } else if (!isDeleting && displayed.length === current.length) {
      timeout = setTimeout(() => setIsDeleting(true), PAUSE_AFTER_TYPING);
    } else if (isDeleting && displayed.length > 0) {
      timeout = setTimeout(
        () => setDisplayed(current.slice(0, displayed.length - 1)),
        DELETING_SPEED
      );
    } else if (isDeleting && displayed.length === 0) {
      timeout = setTimeout(() => {
        setIsDeleting(false);
        setPlaceholderIdx((idx) => (idx + 1) % PLACEHOLDER_EXAMPLES.length);
      }, PAUSE_AFTER_DELETING);
    }
    return () => clearTimeout(timeout);
  }, [displayed, isDeleting, placeholderIdx]);

  // Auto-scroll to bottom when messages change
  const bottomRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, error]);

  // Animate destination placeholder
  useEffect(() => {
    if (!showInitialSlots) return; // Only animate when slot questions are shown
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
    showInitialSlots,
  ]);

  const handleSubmit = async (e: React.FormEvent, retryMessage?: string) => {
    e.preventDefault();
    if ((!inputValue.trim() && !retryMessage) || loading) return;
    setError(null);
    const userMessage = retryMessage || inputValue.trim();
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setInputValue("");
    setLastUserMessage(userMessage); // Save last user message
    setIsNewChat(false); // Mark chat as not new after first user message
    setLoading(true);
    try {
      const res = await clarify(userMessage, clarificationState);
      setClarificationState(res.updatedState);
      if (res.nextPrompt) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: res.nextPrompt },
        ]);
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

  // Initial chip click handler (skips intent detection)
  const handleInitialChipClick = (chipValue: string) => {
    setMessages((prev) => [...prev, { role: "user", content: chipValue }]);
    setInputValue("");
    setLastUserMessage(chipValue);
    setIsNewChat(false);
    setShowInitialSlots(true);
    setMissingSlots(SLOT_ORDER.map((s) => s.key));
    setExtractedSlots({ tripTheme: chipValue });
    setIntentRejected(false);
    setInitialChip(chipValue); // Track which chip was selected
  };

  // On text submit: intent detection + slot extraction
  const handleInitialTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || loading) return;
    setError(null);
    setMessages((prev) => [
      ...prev,
      { role: "user", content: inputValue.trim() },
    ]);
    setInputValue("");
    setLastUserMessage(inputValue.trim());
    setIsNewChat(false);
    setLoading(true);
    setIntentRejected(false);
    try {
      const res = await clarify(inputValue.trim(), clarificationState);
      // If backend says not travel, show polite message
      if (
        res.nextPrompt &&
        /travel planning|specialize in planning travel|ask me about trips/i.test(
          res.nextPrompt
        )
      ) {
        setIntentRejected(true);
        setShowInitialSlots(false);
        setLoading(false);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: res.nextPrompt },
        ]);
        return;
      }
      // Otherwise, extract slots and show only missing ones
      const slotsFilled: Partial<ClarificationState> = res.updatedState || {};
      setExtractedSlots(slotsFilled);
      // Find missing slots
      const missing = SLOT_ORDER.filter((s) => {
        const val = slotsFilled[s.key as keyof ClarificationState];
        return !val || (Array.isArray(val) && val.length === 0);
      }).map((s) => s.key);
      setMissingSlots(missing);
      setShowInitialSlots(true);
      setIntentRejected(false);
      setClarificationState(res.updatedState);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Let's get a few more details to plan your trip!",
        },
      ]);
    } catch (err) {
      let msg = "Sorry, something went wrong.";
      if (err instanceof Error && err.message) msg = err.message;
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Chips for slot questions after initial chat
  const handleChipClick = async (chipValue: string) => {
    if (loading) return;
    setMessages((prev) => [...prev, { role: "user", content: chipValue }]);
    setInputValue("");
    setLastUserMessage(chipValue);
    setIsNewChat(false);
    setLoading(true);
    setError(null);
    try {
      const res = await clarify(chipValue, clarificationState);
      setClarificationState(res.updatedState);
      if (res.nextPrompt) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: res.nextPrompt },
        ]);
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

  // Find chips for the latest assistant message
  const lastAssistantMsg =
    messages.filter((m) => m.role === "assistant").slice(-1)[0]?.content || "";
  const chipsToShow = getChipsForPrompt(lastAssistantMsg);

  // Responsive max width for chat area and input bar
  const maxWidth = Math.min(900, window.innerWidth - sidebarWidth - 32);

  // Filter slots: if Surprise Me, omit destination
  const slotOrderToShow = useMemo(() => {
    if (initialChip && initialChip.toLowerCase().includes("surprise")) {
      return SLOT_ORDER.filter((slot) => slot.key !== "destination");
    }
    return SLOT_ORDER;
  }, [initialChip]);

  return (
    <main className="min-h-screen bg-slate-950 flex flex-col">
      <section className="flex-1 flex flex-col w-full h-full items-center justify-center">
        <div className="relative flex flex-col w-full h-full max-w-full py-0 items-center justify-center overflow-hidden">
          {/* Animate between initial chips + input and slot questions */}
          <AnimatePresence mode="wait">
            {isNewChat && !showInitialSlots && !intentRejected ? (
              <motion.div
                key="initial-chips"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                transition={{ duration: 0.5, type: "spring", bounce: 0.25 }}
                className="flex flex-col items-center justify-center w-full h-full pt-24"
              >
                <div className="mb-8 text-2xl font-semibold text-slate-100 text-center">
                  Let's plan your next trip together. Where do you want to go?
                </div>
                {/* Responsive chip grid: 1 column on mobile, 2 columns on sm+ */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xs sm:max-w-md md:max-w-lg mb-0">
                  {INITIAL_CHIPS_SORTED.map((chip) => (
                    <Button
                      key={chip.value}
                      size="sm"
                      className="w-full px-3 py-2 flex items-center justify-center gap-2 rounded-md bg-indigo-800/30 text-white border border-indigo-400/40 font-medium text-sm shadow-sm hover:bg-indigo-700/50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 transition-all duration-150 truncate cursor-pointer"
                      style={{ minWidth: 0, minHeight: 36, maxWidth: "100%" }}
                      onClick={() => handleInitialChipClick(chip.value)}
                      disabled={loading}
                      type="button"
                    >
                      {chip.icon}
                      {chip.label}
                    </Button>
                  ))}
                </div>
                {/* Input box and button as a vertical group with consistent spacing */}
                <form
                  onSubmit={handleInitialTextSubmit}
                  className="flex flex-col gap-5 w-full max-w-xs sm:max-w-md md:max-w-lg mt-5"
                >
                  <Input
                    type="text"
                    className="w-full px-4 py-3 rounded-md bg-slate-800 text-slate-200 border border-slate-700 focus:outline-none focus:border-indigo-500 text-base font-sans text-left"
                    placeholder={inputFocused ? "" : displayed}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    disabled={loading}
                    style={{ minHeight: 40 }}
                    onFocus={() => setInputFocused(true)}
                    onBlur={() => setInputFocused(false)}
                  />
                  <Button
                    type="submit"
                    className="px-6 py-2 rounded-md bg-indigo-800 hover:bg-indigo-700 text-white font-semibold shadow border border-indigo-700 w-full flex items-center justify-center gap-2 text-base"
                    disabled={loading || !inputValue.trim()}
                  >
                    Start Planning <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </form>
                {error && (
                  <div className="mt-4 text-rose-400 text-sm">{error}</div>
                )}
              </motion.div>
            ) : null}

            {/* Slot questions (after chip or travel intent) */}
            {showInitialSlots && !intentRejected && (
              <motion.div
                key="slot-questions"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                transition={{ duration: 0.5, type: "spring", bounce: 0.25 }}
                className="flex flex-col items-center justify-center w-full h-full pt-4"
              >
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  aria-label="Go back"
                  className="self-start mb-2 px-2 py-1 text-xs h-7 min-h-0"
                  onClick={() => {
                    setShowInitialSlots(false);
                    setIsNewChat(true);
                  }}
                >
                  <ArrowLeft className="w-4 h-4 mr-1" /> Back
                </Button>
                <div className="mb-4 text-lg font-semibold text-slate-100 text-center">
                  To help me craft the perfect itinerary for you, could you
                  share a few more details about your trip?
                </div>
                <Form {...form}>
                  <form
                    className="w-full max-w-md flex flex-col gap-5"
                    onSubmit={form.handleSubmit(async (values) => {
                      // Gather slot values from form
                      const slotValues = { ...extractedSlots, ...values };

                      // Send all slot values to backend
                      setLoading(true);
                      setError(null);
                      try {
                        const res = await clarify("", {
                          ...clarificationState,
                          ...slotValues,
                          tripTheme:
                            slotValues.tripTheme ||
                            clarificationState.tripTheme ||
                            initialChip ||
                            "",
                          startDate: values.startDate
                            ? format(values.startDate, "yyyy-MM-dd")
                            : "",
                          endDate: values.endDate
                            ? format(values.endDate, "yyyy-MM-dd")
                            : "",
                          groupType:
                            values.groupType as ClarificationState["groupType"],
                        } as ClarificationState);
                        setClarificationState(res.updatedState);
                        setMessages((prev) => [
                          ...prev,
                          {
                            role: "assistant",
                            content: res.nextPrompt || "Your plan is ready!",
                          },
                        ]);
                        setShowInitialSlots(false);
                        setIsNewChat(false);
                      } catch (err) {
                        let msg = "Sorry, something went wrong.";
                        if (err instanceof Error && err.message)
                          msg = err.message;
                        setError(msg);
                      } finally {
                        setLoading(false);
                      }
                    })}
                  >
                    {slotOrderToShow
                      .filter(
                        (slot) =>
                          showInitialSlots &&
                          (missingSlots.includes(slot.key) ||
                            extractedSlots[slot.key] !== undefined)
                      )
                      .map((slot) => (
                        <div key={slot.key} className="w-full">
                          {slot.key === "travelDates" ? (
                            <div>
                              <div className="flex gap-2">
                                <FormField
                                  control={form.control}
                                  name="startDate"
                                  render={({ field }) => (
                                    <FormItem className="flex flex-col flex-1">
                                      <FormLabel>Start Date</FormLabel>
                                      <FormControl>
                                        <DatePicker
                                          field={field}
                                          placeholderText="Select start date"
                                          minDate={new Date()}
                                          disabled={flexibleDates}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name="endDate"
                                  render={({ field }) => (
                                    <FormItem className="flex flex-col flex-1">
                                      <FormLabel>End Date</FormLabel>
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
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                              <div className="flex items-center gap-2 mt-2">
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
                                          className="mr-2"
                                        />
                                      </FormControl>
                                      <FormLabel className="text-slate-300 text-sm font-normal cursor-pointer select-none">
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
                          ) : slot.key === "destination" ? (
                            <FormField
                              control={form.control}
                              name="destination"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{slot.label}</FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      value={destinationInputValue}
                                      onChange={(e) => {
                                        setDestinationInputValue(
                                          e.target.value
                                        );
                                        field.onChange(e);
                                      }}
                                      placeholder={
                                        destinationInputFocused ||
                                        destinationInputValue
                                          ? ""
                                          : destinationDisplayed
                                      }
                                      className="w-full px-3 py-2 rounded-md bg-slate-800 text-slate-200 border border-slate-700 focus:outline-none focus:border-indigo-500 text-base font-sans text-left"
                                      autoComplete="off"
                                      onFocus={() =>
                                        setDestinationInputFocused(true)
                                      }
                                      onBlur={() =>
                                        setDestinationInputFocused(false)
                                      }
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          ) : slot.type === "input" ? (
                            <FormField
                              control={form.control}
                              name={slot.key as any}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{slot.label}</FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      placeholder={
                                        inputFocusStates[slot.key]
                                          ? ""
                                          : slot.placeholder
                                      }
                                      className="w-full px-3 py-2 rounded-md bg-slate-800 text-slate-200 border border-slate-700 focus:outline-none focus:border-indigo-500 text-base font-sans text-left"
                                      autoComplete="off"
                                      disabled={
                                        slot.key === "budget" && flexibleBudget
                                      }
                                      onFocus={() =>
                                        setInputFocusStates((prev) => ({
                                          ...prev,
                                          [slot.key]: true,
                                        }))
                                      }
                                      onBlur={() =>
                                        setInputFocusStates((prev) => ({
                                          ...prev,
                                          [slot.key]: false,
                                        }))
                                      }
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          ) : slot.type === "chips" ? (
                            <FormField
                              control={form.control}
                              name="groupType"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{slot.label}</FormLabel>
                                  <FormControl>
                                    <GroupTypeChips
                                      {...field}
                                      value={field.value || ""}
                                      options={
                                        Array.isArray(slot.options)
                                          ? slot.options
                                          : []
                                      }
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          ) : null}
                        </div>
                      ))}
                    <Button
                      type="submit"
                      className="mt-2 px-6 py-2 rounded-md bg-indigo-800 hover:bg-indigo-700 text-white font-semibold shadow border border-indigo-700 w-full flex items-center justify-center gap-2 text-base"
                      disabled={loading}
                    >
                      Continue <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                    {error && (
                      <div className="mt-2 text-rose-400 text-sm">{error}</div>
                    )}
                  </form>
                </Form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Normal chat UI after initial slot filling */}
          {!isNewChat && !showInitialSlots && !intentRejected && (
            <>
              {/* Chat messages */}
              <div className="flex-1 flex flex-col items-center overflow-y-auto pt-8 pb-32 mb-8 space-y-4 w-full">
                <div
                  className="w-full flex flex-col gap-6 mx-auto"
                  style={{ maxWidth, paddingBottom: 100 }}
                >
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`w-full flex ${
                        msg.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
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
                    </div>
                  ))}
                  {/* Chips for quick selection */}
                  {chipsToShow && (
                    <div className="flex flex-wrap gap-2 justify-start mt-2">
                      {chipsToShow.map((chip) => (
                        <Button
                          key={chip.value}
                          size="sm"
                          className="px-5 py-2 flex items-center justify-center gap-2 rounded-md bg-indigo-700/30 text-white border border-indigo-400/40 font-semibold text-base shadow hover:bg-indigo-700/50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 transition-all duration-150"
                          onClick={() => handleChipClick(chip.value)}
                          disabled={loading}
                          type="button"
                        >
                          {chip.label}
                        </Button>
                      ))}
                    </div>
                  )}
                  {loading && (
                    <div className="w-full flex justify-center">
                      <div className="rounded-2xl max-w-[80%] flex justify-center items-center shadow-md mx-0">
                        <div className="lds-roller text-indigo-400">
                          <div></div>
                          <div></div>
                          <div></div>
                          <div></div>
                          <div></div>
                          <div></div>
                          <div></div>
                          <div></div>
                        </div>
                      </div>
                    </div>
                  )}
                  {error && (
                    <div className="w-full flex justify-start">
                      <div className="px-5 py-3 rounded-2xl max-w-[80%] text-base font-sans bg-rose-900 text-rose-200 rounded-bl-xs border border-rose-500 shadow-md mx-0 flex items-center gap-2">
                        {error}
                        {lastUserMessage && (
                          <button
                            type="button"
                            aria-label="Retry"
                            className="ml-2 text-rose-200 hover:text-white focus:outline-none"
                            onClick={(e) =>
                              handleSubmit(e as any, lastUserMessage)
                            }
                            style={{
                              display: "flex",
                              alignItems: "center",
                              background: "none",
                              border: "none",
                              padding: 0,
                              cursor: "pointer",
                            }}
                          >
                            <RotateCcw className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                  <div ref={bottomRef} />
                </div>
              </div>
              {/* Input bar - floating, fixed at bottom, not overlapping sidebar */}
              <ChatInputBar
                inputValue={inputValue}
                setInputValue={setInputValue}
                loading={loading}
                handleSubmit={handleSubmit}
                fileInputRef={fileInputRef}
                displayed={displayed}
                sidebarWidth={sidebarWidth}
                maxWidth={maxWidth}
              />
            </>
          )}

          {/* Show chat history even when intent is rejected */}
          {intentRejected && (
            <>
              <div className="flex-1 flex flex-col items-center overflow-y-auto pt-8 pb-32 mb-8 space-y-4 w-full">
                <div
                  className="w-full flex flex-col gap-6 mx-auto"
                  style={{ maxWidth, paddingBottom: 100 }}
                >
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`w-full flex ${
                        msg.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
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
                    </div>
                  ))}
                  <div ref={bottomRef} />
                </div>
              </div>
              <ChatInputBar
                inputValue={inputValue}
                setInputValue={setInputValue}
                loading={loading}
                handleSubmit={handleSubmit}
                fileInputRef={fileInputRef}
                displayed={displayed}
                sidebarWidth={sidebarWidth}
                maxWidth={maxWidth}
              />
            </>
          )}
        </div>
      </section>
    </main>
  );
};

// Single-select chips for group type
const GroupTypeChips: React.FC<{
  name: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}> = ({ name, options, value, onChange }) => {
  return (
    <div className="flex gap-3 w-full">
      {options.map((opt) => (
        <Button
          key={opt}
          type="button"
          size="sm"
          className={`flex-1 px-0 py-2 rounded-md border text-sm font-medium transition-all duration-150 cursor-pointer select-none
            ${
              value === opt.toLowerCase()
                ? "bg-indigo-600 text-white border-indigo-500 shadow"
                : "bg-indigo-700/20 text-slate-200 border-indigo-400/30 hover:bg-indigo-700/40"
            }
          `}
          style={{
            minWidth: 0,
            minHeight: 36,
            boxShadow: "none",
            outline: "none",
          }}
          onClick={() => onChange(opt.toLowerCase())}
          tabIndex={0}
        >
          {opt}
        </Button>
      ))}
    </div>
  );
};

export default ChatInterface;

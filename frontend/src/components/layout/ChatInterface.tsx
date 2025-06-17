import React, { useRef, useState, useEffect } from "react";
import { clarify } from "@/api/clarify";
import ChatInputBar from "./ChatInputBar.tsx";

const PLACEHOLDER_EXAMPLES = [
  "a solo bike trip to Ladakh",
  "a cheap weekend getaway from Mumbai",
  'show me a photo of a beach and say "take me here"',
];

const TYPING_SPEED = 60; // ms per character
const DELETING_SPEED = 30; // ms per character
const PAUSE_AFTER_TYPING = 1200; // ms to pause after typing
const PAUSE_AFTER_DELETING = 400; // ms to pause after deleting

// Define ClarificationState locally
interface ClarificationState {
  destination?: string;
  travelerType?: string;
  budget?: string;
  interests?: string[];
  inputHistory: string[];
  isPlanReady: boolean;
}

const initialClarificationState: ClarificationState = {
  destination: "",
  travelerType: "",
  budget: "",
  interests: [],
  inputHistory: [],
  isPlanReady: false,
};

interface ChatInterfaceProps {
  sidebarCollapsed: boolean;
  sidebarWidth: number;
}

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

  // Typing animation state
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || loading) return;
    setError(null);
    const userMessage = inputValue.trim();
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setInputValue("");
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
      setMessages((prev) =>
        prev[prev.length - 1]?.role === "assistant" &&
        prev[prev.length - 1]?.content === msg
          ? prev
          : [...prev, { role: "assistant", content: msg }]
      );
    } finally {
      setLoading(false);
    }
  };

  // Responsive max width for chat area and input bar
  const maxWidth = Math.min(900, window.innerWidth - sidebarWidth - 32); // 900px or available space

  return (
    <main className="min-h-screen bg-slate-950 flex flex-col">
      <section className="flex-1 flex flex-col w-full h-full items-center justify-center">
        <div className="relative flex flex-col w-full h-full max-w-full py-0 items-center justify-center">
          {/* Chat messages */}
          <div className="flex-1 flex flex-col items-center overflow-y-auto pt-8 pb-32 mb-8 space-y-4 w-full">
            <div
              className="w-full flex flex-col gap-6 mx-auto"
              style={{ maxWidth }}
            >
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`w-full flex ${
                    msg.role === "user" ? "justify-end" : "justify-center"
                  }`}
                >
                  <div
                    className={`px-5 py-3 rounded-2xl max-w-[80%] text-base font-sans whitespace-pre-line shadow-md transition-all duration-200 mx-0
                      ${
                        msg.role === "user"
                          ? "bg-indigo-500 text-white rounded-br-md"
                          : "bg-slate-800 text-slate-100 rounded-bl-md border border-slate-700"
                      }
                    `}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="w-full flex justify-center">
                  <div className="px-5 py-3 rounded-2xl max-w-[80%] text-base font-sans bg-slate-800 text-slate-200 rounded-bl-md opacity-70 shadow-md mx-0">
                    ...
                  </div>
                </div>
              )}
              {error && (
                <div className="w-full flex justify-center">
                  <div className="px-5 py-3 rounded-2xl max-w-[80%] text-base font-sans bg-rose-900 text-rose-200 rounded-bl-md border border-rose-500 shadow-md mx-0">
                    {error}
                  </div>
                </div>
              )}
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
        </div>
      </section>
    </main>
  );
};

export default ChatInterface;

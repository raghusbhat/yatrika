import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Image as ImageIcon } from "lucide-react";
import { clarify } from "@/api/clarify";

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

const ChatInterface: React.FC = () => {
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

  return (
    <main className="pt-16 min-h-screen bg-background flex flex-col">
      <section className="flex-1 flex flex-col items-center justify-center w-full">
        <div className="relative flex flex-col w-full max-w-content h-[80vh] bg-slate-900 border border-slate-800 rounded-xl shadow-lg overflow-hidden">
          {/* Chat messages */}
          <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`w-full flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`px-4 py-3 rounded-xl max-w-[75%] text-base font-sans whitespace-pre-line ${
                    msg.role === "user"
                      ? "bg-accent text-white rounded-br-sm"
                      : msg.role === "assistant"
                      ? "bg-slate-800 text-slate-200 rounded-bl-sm"
                      : "bg-transparent text-slate-400 italic"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="w-full flex justify-start">
                <div className="px-4 py-3 rounded-xl max-w-[75%] text-base font-sans bg-slate-800 text-slate-200 rounded-bl-sm opacity-70">
                  ...
                </div>
              </div>
            )}
            {error && (
              <div className="w-full flex justify-start">
                <div className="px-4 py-3 rounded-xl max-w-[75%] text-base font-sans bg-rose-900 text-rose-200 rounded-bl-sm border border-rose-500">
                  {error}
                </div>
              </div>
            )}
          </div>
          {/* Input bar */}
          <form
            onSubmit={handleSubmit}
            className="absolute bottom-0 left-0 w-full bg-slate-900/95 border-t border-slate-800 px-4 py-3 flex items-center gap-2"
          >
            <Button
              type="button"
              className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 focus:outline-none"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Upload image"
            >
              <ImageIcon className="w-5 h-5" />
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              tabIndex={-1}
            />
            <Input
              type="text"
              placeholder={displayed || "Type your message..."}
              className="flex-1"
              autoComplete="off"
              aria-label="Chat message"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={loading}
            />
            <Button
              type="submit"
              variant="default"
              className="ml-2 px-3 h-10"
              disabled={loading}
            >
              <Send className="w-5 h-5 mr-1" />
              Send
            </Button>
          </form>
        </div>
      </section>
    </main>
  );
};

export default ChatInterface;

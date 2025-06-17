import React, { useState, useEffect } from "react";
import {
  Search,
  Mic,
  Image as ImageIcon,
  X as XIcon,
  Send,
} from "lucide-react";
import { Toaster, toast } from "sonner";
import { Button } from "@/components/ui/button";
import { clarify } from "@/api/clarify";

const PLACEHOLDER_EXAMPLES = [
  "A 10-day Europe trip covering Paris and Amsterdam under 1.5 Lakhs INR",
  "A cheap weekend getaway from Bengaluru...",
  "Upload a photo of a beach and say find me similar places...",
  "Places with less crowd in Himachal during summer...",
  "20,000 INR budget for a trip to Goa...",
];

const TYPING_SPEED = 60;
const DELETING_SPEED = 30;
const PAUSE_AFTER_TYPING = 1200;
const PAUSE_AFTER_DELETING = 400;

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

const Landing: React.FC = () => {
  // Typing animation state
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [images, setImages] = useState<{ file: File; url: string }[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [clarificationState, setClarificationState] =
    useState<ClarificationState>(initialClarificationState);
  const [loading, setLoading] = useState(false);

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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (images.length >= 4) {
      toast.error("You can only upload up to 4 images.");
      event.target.value = "";
      return;
    }
    const allowed = Math.max(0, 4 - images.length);
    const newImages = files.slice(0, allowed).map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...newImages].slice(0, 4));
    if (files.length > allowed) {
      toast.error("You can only upload up to 4 images.");
    }
    event.target.value = "";
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    const items = event.clipboardData.items;
    const pastedImages: { file: File; url: string }[] = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf("image") !== -1) {
        const file = item.getAsFile();
        if (file) pastedImages.push({ file, url: URL.createObjectURL(file) });
      }
    }
    if (images.length >= 4) {
      toast.error("You can only upload up to 4 images.");
      return;
    }
    const allowed = Math.max(0, 4 - images.length);
    if (pastedImages.length > 0) {
      setImages((prev) =>
        [...prev, ...pastedImages.slice(0, allowed)].slice(0, 4)
      );
      if (pastedImages.length > allowed) {
        toast.error("You can only upload up to 4 images.");
      }
    }
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSend = async () => {
    if (!searchValue.trim() || loading) return;
    setLoading(true);
    console.log("[Landing] Sending clarify request:", {
      input: searchValue.trim(),
      clarificationState,
    });
    try {
      const res = await clarify(searchValue.trim(), clarificationState);
      console.log("[Landing] Clarify response:", res);
      setClarificationState(res.updatedState);
      toast.success(res.nextPrompt || "Sent!");
      setSearchValue("");
    } catch (err) {
      let msg = "Sorry, something went wrong.";
      if (err instanceof Error && err.message) msg = err.message;
      console.error("[Landing] Clarify error:", err);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col min-h-screen justify-center items-center bg-slate-950 mx-4">
      {/* Heading and subtitle */}
      <h1 className="text-2xl md:text-3xl font-bold text-center mb-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
        Where is your next journey taking you?
      </h1>
      <p className="text-sm text-slate-400 text-center mb-10">
        Let AI craft your perfect travel experience
      </p>
      {/* Search bar */}
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-lg px-5 py-3 shadow-lg transition focus-within:ring-1 focus-within:ring-indigo-500/60 focus-within:rounded-lg flex flex-col gap-2">
        {/* Image chips inside search bar, above input */}
        {images.length > 0 && (
          <div className="flex gap-2 mb-2 w-full justify-start">
            {images.map((img, idx) => (
              <div
                key={idx}
                className="relative group flex items-center bg-slate-800 border border-slate-700 rounded px-1 py-0.5 h-8 shadow gap-1 min-w-0 flex-1 max-w-none w-1/4"
              >
                <img
                  src={img.url}
                  alt={img.file.name}
                  className="w-5 h-5 object-cover rounded mr-1 border border-slate-700 flex-shrink-0"
                />
                <div className="flex flex-col min-w-0 flex-1 overflow-hidden">
                  <span className="text-[9px] text-slate-200 truncate block w-full">
                    {img.file.name}
                  </span>
                  <span className="text-[9px] text-slate-400 truncate block w-full">
                    {(img.file.size / 1024).toFixed(1)} KB
                  </span>
                </div>
                <button
                  type="button"
                  className="ml-1 p-0.5 rounded-full hover:bg-slate-700 text-slate-400 hover:text-red-500 flex-shrink-0"
                  onClick={() => removeImage(idx)}
                  tabIndex={-1}
                  aria-label="Remove image"
                >
                  <XIcon className="w-2.5 h-2.5" />
                </button>
                {/* Full preview on hover - absolute above chip, visible */}
                <div className="hidden group-hover:flex absolute z-40 left-1/2 -translate-x-1/2 bottom-10 items-center justify-center">
                  <img
                    src={img.url}
                    alt={img.file.name}
                    className="w-40 aspect-square object-contain rounded-xl shadow-lg border border-slate-700 bg-slate-900"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
        {/* Input area: two-row structure */}
        <div className="w-full flex flex-col gap-1">
          {/* Row 1: Textarea */}
          <textarea
            className="w-full bg-transparent outline-none border-none text-slate-200 placeholder-slate-500 text-base font-sans max-h-32 min-h-[2.5rem] resize-none px-1 transition-all duration-200 overflow-auto"
            style={{ fontFamily: "Inter, sans-serif" }}
            placeholder={displayed || "Type your travel dream..."}
            aria-label="Travel search"
            rows={1}
            value={searchValue}
            onChange={(e) => {
              setSearchValue(e.target.value);
            }}
            onPaste={(e) => {
              const items = e.clipboardData.items;
              const pastedImages: { file: File; url: string }[] = [];
              for (let i = 0; i < items.length; i++) {
                const item = items[i];
                if (item.type.indexOf("image") !== -1) {
                  const file = item.getAsFile();
                  if (file)
                    pastedImages.push({ file, url: URL.createObjectURL(file) });
                }
              }
              if (images.length >= 4) {
                toast.error("You can only upload up to 4 images.");
                return;
              }
              const allowed = Math.max(0, 4 - images.length);
              if (pastedImages.length > 0) {
                setImages((prev) =>
                  [...prev, ...pastedImages.slice(0, allowed)].slice(0, 4)
                );
                if (pastedImages.length > allowed) {
                  toast.error("You can only upload up to 4 images.");
                }
              }
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = "auto";
              const minHeight = 40; // ~2.5rem
              if (target.scrollHeight > minHeight) {
                target.style.height = target.scrollHeight + "px";
              } else {
                target.style.height = minHeight + "px";
              }
            }}
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                !e.shiftKey &&
                !e.ctrlKey &&
                !e.metaKey
              ) {
                e.preventDefault();
                handleSend();
              }
              // Otherwise, allow default (including Shift+Enter for newline)
            }}
            disabled={loading}
          />
          {/* Divider between textarea and buttons */}
          <div className="w-full border-t border-slate-800 my-1" />
          {/* Row 2: Icons left, send right */}
          <div className="w-full flex flex-row items-center justify-between mt-1">
            <div className="flex flex-row items-center gap-2">
              <Button
                type="button"
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-950 text-indigo-400 hover:text-indigo-200 focus:outline-none"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Mic"
              >
                <Mic className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-950 text-indigo-400 hover:text-indigo-200 focus:outline-none"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Upload image"
              >
                <ImageIcon className="w-4 h-4" />
              </Button>
            </div>
            <Button
              type="button"
              className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white focus:outline-none"
              onClick={handleSend}
              disabled={loading}
              aria-label="Send"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
      {/* Footer */}
      <footer className="absolute bottom-4 left-0 w-full flex justify-center text-slate-500 text-sm">
        © 2023 Yatrika
      </footer>
      <Toaster position="top-center" richColors />
    </main>
  );
};

export default Landing;

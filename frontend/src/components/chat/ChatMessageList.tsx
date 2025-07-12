import React from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  component?: React.ReactNode;
}

interface ChatMessageListProps {
  messages: ChatMessage[];
  chipsToShow: any[] | null;
  onChipClick: (chipValue: string) => void;
  loading: boolean;
  loadingMessage: string;
  error: string | null;
  lastUserMessage: string | null;
  onRetry: (message: string) => void;
  maxWidth: number;
}

export const ChatMessageList: React.FC<ChatMessageListProps> = ({
  messages,
  chipsToShow,
  onChipClick,
  loading,
  loadingMessage,
  error,
  lastUserMessage,
  onRetry,
  maxWidth,
}) => {
  return (
    <div className="flex-1 flex flex-col items-center overflow-y-auto overflow-x-hidden pt-8 pb-40 space-y-4 w-full">
      <div
        className="w-full flex flex-col gap-6 mx-auto"
        style={{
          maxWidth,
          paddingBottom: 100,
          minHeight: "min-content",
        }}
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

        {/* Chips for quick selection */}
        {chipsToShow && (
          <div className="flex flex-col gap-3 mt-2">
            <div className="flex flex-wrap gap-2 justify-start">
              {chipsToShow.map((chip) => (
                <Button
                  key={chip.value}
                  size="sm"
                  className="px-5 py-2 flex items-center justify-center gap-2 rounded-md border font-semibold text-base shadow focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 transition-all duration-150 bg-indigo-700/30 text-white border-indigo-400/40 hover:bg-indigo-700/50"
                  onClick={() => onChipClick(chip.value)}
                  disabled={loading}
                  type="button"
                >
                  {chip.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div className="w-full flex justify-center">
            <div className="rounded-2xl max-w-[80%] flex flex-col justify-center items-center shadow-md mx-0 px-4 py-3">
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
              <div className="text-sm text-slate-300 mt-2 text-center">
                {loadingMessage}
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
                  onClick={() => onRetry(lastUserMessage)}
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
      </div>
    </div>
  );
};

import React, { useRef } from "react";
import { motion } from "framer-motion";
import { ChatMessages } from "./ChatMessages";
import ChatInputBar from "../layout/ChatInputBar";
import { getChipsForPrompt } from "@/utils/chatHelpers";

interface Message {
  role: "user" | "assistant";
  content: string;
  component?: React.ReactNode;
}

interface ConversationViewProps {
  messages: Message[];
  loading: boolean;
  error: string | null;
  lastUserMessage: string | null;
  inputValue: string;
  setInputValue: (value: string) => void;
  onSubmit: (e: React.FormEvent, retryMessage?: string) => void;
  onChipClick: (chipValue: string) => void;
  sidebarWidth: number;
  maxWidth: number;
  bottomRef: React.RefObject<HTMLDivElement>;
}

export const ConversationView: React.FC<ConversationViewProps> = ({
  messages,
  loading,
  error,
  lastUserMessage,
  inputValue,
  setInputValue,
  onSubmit,
  onChipClick,
  sidebarWidth,
  maxWidth,
  bottomRef,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Find chips for the latest assistant message
  const lastAssistantMsg =
    messages.filter((m) => m.role === "assistant").slice(-1)[0]?.content || "";
  const chipsToShow = getChipsForPrompt(lastAssistantMsg);

  return (
    <motion.div
      key="conversation"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full h-full flex flex-col"
    >
      <ChatMessages
        messages={messages}
        loading={loading}
        error={error}
        lastUserMessage={lastUserMessage}
        onRetry={onSubmit}
        onChipClick={onChipClick}
        chipsToShow={chipsToShow}
        maxWidth={maxWidth}
        bottomRef={bottomRef}
      />

      <ChatInputBar
        inputValue={inputValue}
        setInputValue={setInputValue}
        loading={loading}
        handleSubmit={onSubmit}
        fileInputRef={fileInputRef}
        displayed=""
        sidebarWidth={sidebarWidth}
        maxWidth={maxWidth}
      />
    </motion.div>
  );
};

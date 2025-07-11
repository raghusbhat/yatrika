import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface TransitionStatesProps {
  transitionPhase: "form" | "card" | "conversation";
  messages: Array<{
    role: "user" | "assistant";
    content: string;
    component?: React.ReactNode;
  }>;
}

export const TransitionStates: React.FC<TransitionStatesProps> = ({
  transitionPhase,
  messages,
}) => {
  if (transitionPhase === "form") {
    return (
      <motion.div
        key="form-fadeout"
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.1 }}
        className="absolute inset-0 w-full h-full bg-transparent"
      />
    );
  }

  if (transitionPhase === "card") {
    return (
      <motion.div
        key="card-transition"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="absolute inset-0 flex flex-col items-center justify-center w-full h-full px-1 overflow-hidden"
      >
        <div className="w-full flex justify-center">
          {messages.length > 0 && messages[0].component}
        </div>
      </motion.div>
    );
  }

  if (transitionPhase === "conversation") {
    return (
      <motion.div
        key="conversation-transition"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="absolute inset-0 flex flex-col items-center justify-center w-full h-full px-1 overflow-hidden"
      >
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-full mb-4">
            <Check className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">
            Perfect! Preparing Your Chat...
          </h2>
          <p className="text-slate-300 text-sm">
            Your trip details have been collected successfully
          </p>
          <div className="mt-6">
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
      </motion.div>
    );
  }

  return null;
};

import React from "react";
import { Button } from "@/components/ui/button";

interface GroupTypeChipsProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
}

export const GroupTypeChips: React.FC<GroupTypeChipsProps> = ({
  options,
  value,
  onChange,
}) => {
  return (
    <div className="flex gap-1.5 sm:gap-2 w-full">
      {options.map((opt) => (
        <Button
          key={opt}
          type="button"
          size="sm"
          className={`flex-1 px-2 py-1.5 sm:px-3 sm:py-2 rounded-md border text-xs sm:text-sm font-medium transition-all duration-150 cursor-pointer select-none
            ${
              value === opt.toLowerCase()
                ? "bg-indigo-600 text-white border-indigo-500 shadow"
                : "bg-indigo-700/20 text-slate-200 border-indigo-400/30 hover:bg-indigo-700/40"
            }
          `}
          style={{
            minWidth: 0,
            minHeight: 32,
            boxShadow: "none",
            outline: "none",
          }}
          onClick={() => onChange(opt)}
          tabIndex={0}
        >
          {opt}
        </Button>
      ))}
    </div>
  );
};

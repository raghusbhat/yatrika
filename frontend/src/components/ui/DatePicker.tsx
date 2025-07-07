"use client";

import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "@/styles/react-datepicker.css"; // Custom styles
import { Calendar as CalendarIcon } from "lucide-react";
import type { ControllerRenderProps } from "react-hook-form";
import { cn } from "@/lib/utils";

interface CustomDatePickerProps {
  field: ControllerRenderProps<any, any>;
  placeholderText?: string;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
}

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  field,
  placeholderText,
  minDate,
  maxDate,
  disabled,
}) => {
  return (
    <div className="relative w-full">
      <DatePicker
        selected={field.value ? new Date(field.value) : null}
        onChange={(date) => field.onChange(date)}
        minDate={minDate}
        maxDate={maxDate}
        placeholderText={placeholderText}
        dateFormat="dd/MM/yyyy"
        className={cn(
          "w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 rounded-md bg-slate-800 text-slate-200 border border-slate-700 focus:outline-none focus:border-indigo-500 text-sm sm:text-base font-sans",
          disabled && "bg-slate-900/80 cursor-not-allowed text-slate-400"
        )}
        showPopperArrow={false}
        disabled={disabled}
      />
      <CalendarIcon className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
    </div>
  );
};

export { CustomDatePicker as DatePicker };

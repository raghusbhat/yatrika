import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/DatePicker";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { GroupTypeChips } from "@/components/ui/GroupTypeChips";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  STEP_2_FIELDS,
  GROUP_TYPE_CHIPS,
  stepVariants,
} from "@/constants/chatInterface";
import { useDestinationAnimation } from "@/hooks/useDestinationAnimation";

interface Step2BasicDetailsProps {
  form: any;
  onSubmit: (values: any) => void;
  onBack: () => void;
  onSkip: () => void;
  loading: boolean;
  error: string | null;
  navDirection: "forward" | "back";
  currentStep: number;
  initialChip: string | null;
}

export const Step2BasicDetails: React.FC<Step2BasicDetailsProps> = ({
  form,
  onSubmit,
  onBack,
  onSkip,
  loading,
  error,
  navDirection,
  currentStep,
  initialChip,
}) => {
  const { destinationPlaceholder } = useDestinationAnimation(currentStep);

  const startDate = form.watch("startDate");
  const endDate = form.watch("endDate");
  const flexibleDates = form.watch("flexibleDates");
  const groupType = form.watch("groupType");

  const totalDays = useMemo(() => {
    if (startDate && endDate && endDate >= startDate) {
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays + 1;
    }
    return null;
  }, [startDate, endDate]);

  const canContinueStep2 = useMemo(() => {
    const hasDates = !!startDate && !!endDate;
    const allowedGroupTypes = GROUP_TYPE_CHIPS.map((c) => c.value);
    return (
      allowedGroupTypes.includes(groupType) &&
      (hasDates || flexibleDates === true)
    );
  }, [groupType, startDate, endDate, flexibleDates]);

  // Filter fields: if Surprise Me, omit destination
  const fieldsToShow = useMemo(() => {
    if (initialChip && initialChip.toLowerCase().includes("surprise")) {
      return STEP_2_FIELDS.filter((field) => field.key !== "destination");
    }
    return STEP_2_FIELDS;
  }, [initialChip]);

  return (
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
        To craft your perfect itinerary, could you share a few more trip
        details?
      </div>

      <Form {...form}>
        <form
          className="w-full max-w-sm sm:max-w-3xl mx-auto flex flex-col gap-4 sm:gap-6 px-2 sm:px-4"
          onSubmit={form.handleSubmit(onSubmit)}
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
                              minDate={form.watch("startDate") || new Date()}
                              disabled={
                                !form.watch("startDate") || flexibleDates
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
                                  form.setValue("startDate", undefined, {
                                    shouldValidate: true,
                                  });
                                  form.setValue("endDate", undefined, {
                                    shouldValidate: true,
                                  });
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
                      {!flexibleDates && totalDays && totalDays > 0 ? (
                        <>
                          <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                          <span className="text-slate-200">
                            {totalDays} {totalDays === 1 ? "Day" : "Days"}
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
                          placeholder={destinationPlaceholder || ""}
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
                          options={GROUP_TYPE_CHIPS.map((c) => c.value)}
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
              onClick={onBack}
            >
              <ChevronLeft className="w-4 h-4 sm:hidden" />
              <span className="hidden sm:inline">Back</span>
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-700 font-medium text-xs sm:text-sm h-8 sm:h-9"
              onClick={onSkip}
              disabled={loading}
            >
              Skip
            </Button>

            {!canContinueStep2 ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="w-full block">
                    <Button
                      type="submit"
                      className="w-full px-3 py-1.5 sm:px-4 sm:py-2 rounded-md bg-indigo-800 hover:bg-indigo-700 text-white font-medium shadow border border-indigo-700 flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm h-8 sm:h-9"
                      disabled={loading || !canContinueStep2}
                    >
                      <ChevronRight className="w-4 h-4 sm:hidden" />
                      <span className="hidden sm:inline">Continue</span>
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs text-center">
                  {(() => {
                    const allowedGroupTypes = GROUP_TYPE_CHIPS.map(
                      (c) => c.value
                    );
                    if (!allowedGroupTypes.includes(groupType)) {
                      return "Please select who is traveling (Group Type).";
                    }
                    if (!(!!startDate && !!endDate) && !flexibleDates) {
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
              >
                <ChevronRight className="w-4 h-4 sm:hidden" />
                <span className="hidden sm:inline">Continue</span>
              </Button>
            )}
          </div>

          {error && <div className="mt-2 text-rose-400 text-sm">{error}</div>}
        </form>
      </Form>
    </motion.div>
  );
};

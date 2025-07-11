import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { HorizontalChipSelector } from "@/components/ui/HorizontalChipSelector";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  STEP_3_FIELDS,
  INTEREST_CHIPS,
  stepVariants,
} from "@/constants/chatInterface";

interface Step3PreferencesProps {
  form: any;
  onSubmit: (values: any) => void;
  onBack: () => void;
  onSkip: () => void;
  loading: boolean;
  error: string | null;
  navDirection: "forward" | "back";
}

export const Step3Preferences: React.FC<Step3PreferencesProps> = ({
  form,
  onSubmit,
  onBack,
  onSkip,
  loading,
  error,
  navDirection,
}) => {
  return (
    <motion.div
      key="step-3"
      custom={navDirection}
      variants={stepVariants}
      initial="enter"
      animate="center"
      exit={{ opacity: 0 }}
      transition={{
        duration: 0.3,
        ease: "easeOut",
      }}
      className="flex flex-col items-center justify-center w-full flex-1 pt-6 sm:pt-8 px-0 min-h-0"
    >
      <div className="mb-4 sm:mb-6 text-base sm:text-lg font-semibold text-slate-100 text-center w-full px-2 sm:px-0">
        Almost there! Add a few preferences to enhance your trip.
      </div>

      <div className="w-full max-w-sm sm:max-w-3xl mx-auto px-2 sm:px-4">
        <Form {...form}>
          <form
            className="w-full flex flex-col gap-4 sm:gap-6"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            {STEP_3_FIELDS.map((field) => (
              <div key={field.key} className="w-full">
                {field.key === "budget" ? (
                  <div>
                    <FormField
                      control={form.control}
                      name="budget"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs sm:text-sm">
                            Budget
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Your budget range (e.g., ₹20,000, $500)"
                              className="w-full px-3 py-2 sm:px-4 sm:py-3 rounded-md bg-slate-800 text-slate-200 border border-slate-700 focus:outline-none focus:border-indigo-500 text-sm sm:text-base font-sans"
                            />
                          </FormControl>
                          <FormMessage className="text-rose-500 text-xs" />
                        </FormItem>
                      )}
                    />
                    <div className="flex items-center gap-2 mt-1.5 sm:mt-2">
                      <FormField
                        control={form.control}
                        name="flexibleBudget"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={(checked) => {
                                  field.onChange(checked);
                                  if (checked) {
                                    form.setValue("budget", "", {
                                      shouldValidate: true,
                                    });
                                  }
                                }}
                                className="mr-1.5 sm:mr-2"
                              />
                            </FormControl>
                            <FormLabel className="text-slate-300 text-xs sm:text-sm font-normal cursor-pointer select-none">
                              My budget is flexible
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                ) : field.key === "interests" ? (
                  <>
                    <label className="block font-medium mb-1 mt-2 sm:mt-3 text-xs sm:text-sm">
                      Interests
                    </label>
                    <div className="flex items-center w-full h-10 sm:h-12">
                      <HorizontalChipSelector
                        options={INTEREST_CHIPS}
                        value={(form.watch("interests") ?? []) as string[]}
                        onChange={(chips) => form.setValue("interests", chips)}
                        placeholder="Select one or more interests"
                      />
                    </div>
                  </>
                ) : field.key === "specialNeeds" ? (
                  <FormField
                    control={form.control}
                    name="specialNeeds"
                    render={({ field: formField }) => (
                      <FormItem>
                        <FormLabel className="text-xs sm:text-sm">
                          Special Needs
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...formField}
                            placeholder="Accessibility, dietary restrictions, etc."
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

              <Button
                type="submit"
                className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-md bg-indigo-800 hover:bg-indigo-700 text-white font-medium shadow border border-indigo-700 flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm h-8 sm:h-9"
                disabled={loading}
              >
                <ChevronRight className="w-4 h-4 sm:hidden" />
                <span className="hidden sm:inline">Finish</span>
              </Button>
            </div>

            {error && <div className="mt-2 text-rose-400 text-sm">{error}</div>}
          </form>
        </Form>
      </div>
    </motion.div>
  );
};

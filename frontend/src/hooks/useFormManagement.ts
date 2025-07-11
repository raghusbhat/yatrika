import { useState, useEffect, useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { formSchema, GROUP_TYPE_CHIPS } from "@/constants/chatInterface";
import { calculateTotalDays } from "@/utils/chatHelpers";
import type { ClarificationState } from "@/types/clarification";
import * as z from "zod";

export function useFormManagement() {
  const [extractedSlots, setExtractedSlots] = useState<
    Partial<ClarificationState>
  >({});

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      destination: "",
      groupType: "",
      startDate: undefined,
      endDate: undefined,
      budget: "",
      interests: [],
      source: localStorage.getItem("user_city") || "",
      flexibleDates: false,
      flexibleBudget: false,
      specialNeeds: "",
    },
  });

  const startDate = form.watch("startDate");
  const endDate = form.watch("endDate");
  const flexibleDates = form.watch("flexibleDates");
  const groupType = form.watch("groupType");

  const totalDays = useMemo(() => {
    return calculateTotalDays(startDate, endDate);
  }, [startDate, endDate]);

  const canContinueStep2 = useMemo(() => {
    const hasDates = !!startDate && !!endDate;
    const allowedGroupTypes = GROUP_TYPE_CHIPS.map((c) => c.value);
    return (
      allowedGroupTypes.includes(groupType) &&
      (hasDates || flexibleDates === true)
    );
  }, [groupType, startDate, endDate, flexibleDates]);

  // Update form when extractedSlots changes
  useEffect(() => {
    const userCity = localStorage.getItem("user_city") || "";
    form.reset({
      destination: extractedSlots.destination || "",
      groupType: extractedSlots.groupType || "",
      startDate: extractedSlots.startDate
        ? new Date(extractedSlots.startDate)
        : undefined,
      endDate: extractedSlots.endDate
        ? new Date(extractedSlots.endDate)
        : undefined,
      budget: extractedSlots.budget || "",
      interests: extractedSlots.interests || [],
      source:
        typeof extractedSlots.source === "string"
          ? extractedSlots.source
          : userCity,
      flexibleBudget:
        extractedSlots.flexibleBudget !== undefined
          ? extractedSlots.flexibleBudget
          : false,
      flexibleDates:
        extractedSlots.flexibleDates !== undefined
          ? extractedSlots.flexibleDates
          : false,
      specialNeeds: extractedSlots.specialNeeds || "",
    });
  }, [extractedSlots, form]);

  const resetForm = useCallback(() => {
    const userCity = localStorage.getItem("user_city") || "";
    form.reset({
      destination: "",
      groupType: "",
      startDate: undefined,
      endDate: undefined,
      budget: "",
      interests: [],
      source: userCity,
      flexibleDates: false,
      flexibleBudget: false,
      specialNeeds: "",
    });
    setExtractedSlots({});
  }, [form]);

  const processFormForStep3 = useCallback(
    (values: z.infer<typeof formSchema>) => {
      const processedValues: Partial<ClarificationState> = {
        destination: values.destination,
        source: values.source,
        groupType: values.groupType as ClarificationState["groupType"],
        startDate: values.startDate
          ? format(values.startDate, "yyyy-MM-dd")
          : undefined,
        endDate: values.endDate
          ? format(values.endDate, "yyyy-MM-dd")
          : undefined,
        budget: values.budget,
        interests: values.interests || [],
        specialNeeds: values.specialNeeds,
        flexibleDates: values.flexibleDates,
      };

      setExtractedSlots((prev) => ({ ...prev, ...processedValues }));
      return processedValues;
    },
    []
  );

  return useMemo(
    () => ({
      form,
      extractedSlots,
      setExtractedSlots,
      totalDays,
      canContinueStep2,
      resetForm,
      processFormForStep3,
      formValues: {
        startDate,
        endDate,
        flexibleDates,
        groupType,
      },
    }),
    [
      form,
      extractedSlots,
      totalDays,
      canContinueStep2,
      resetForm,
      processFormForStep3,
      startDate,
      endDate,
      flexibleDates,
      groupType,
    ]
  );
}

import { Router } from "express";
import asyncHandler from "express-async-handler";
import { enhancedClarification } from "../controllers/enhancedClarifyController";
import { validateRequest } from "../middleware/validateRequest";
import { z } from "zod";

const router = Router();

// Enhanced clarification schema with user profile support
const enhancedClarifySchema = z.object({
  input: z.string(),
  state: z.object({
    source: z.string().optional().nullable(),
    destination: z.string().optional().nullable(),
    travelDates: z.string().optional().nullable(),
    duration: z.string().optional().nullable(),
    groupType: z.enum(["solo", "couple", "family", "friends"]).optional().nullable(),
    budget: z.string().optional().nullable(),
    domesticOrInternational: z.enum(["domestic", "international"]).optional().nullable(),
    modeOfTransport: z
      .enum(["own car", "rental car", "taxi", "train", "bus", "flight"])
      .optional().nullable(),
    carModel: z.string().optional().nullable(),
    flightPreferences: z.string().optional().nullable(),
    accommodation: z.string().optional().nullable(),
    travelPace: z.string().optional().nullable(),
    occasion: z.string().optional().nullable(),
    foodPreference: z.string().optional().nullable(),
    specialNeeds: z.string().optional().nullable(),
    climatePreference: z.string().optional().nullable(),
    interests: z.array(z.string()).optional().nullable(),
    inputHistory: z.array(z.string()),
    isPlanReady: z.boolean(),
    startDate: z.string().optional().nullable(),
    endDate: z.string().optional().nullable(),
    tripTheme: z.string().optional().nullable(),
    flexibleBudget: z.boolean().optional().nullable(),
    flexibleDates: z.boolean().optional().nullable(),
  }),
  userProfile: z.record(z.any()).optional(), // localStorage data
});

// Enhanced personalized clarification endpoint
router.post(
  "/enhanced",
  validateRequest(enhancedClarifySchema),
  asyncHandler(enhancedClarification)
);

export default router;

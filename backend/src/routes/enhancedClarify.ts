import { Router } from "express";
import asyncHandler from "express-async-handler";
import {
  enhancedClarification,
  startClarification,
} from "../controllers/enhancedClarifyController";
import { validateRequest } from "../middleware/validateRequest";
import { z } from "zod";

const router = Router();

// Enhanced clarification schema with user profile support
const enhancedClarifySchema = z.object({
  input: z.string(),
  state: z.object({
    source: z.string().optional(),
    destination: z.string().optional(),
    travelDates: z.string().optional(),
    duration: z.string().optional(),
    groupType: z.enum(["solo", "couple", "family", "friends"]).optional(),
    budget: z.string().optional(),
    domesticOrInternational: z.enum(["domestic", "international"]).optional(),
    modeOfTransport: z
      .enum(["own car", "rental car", "taxi", "train", "bus", "flight"])
      .optional(),
    carModel: z.string().optional(),
    flightPreferences: z.string().optional(),
    accommodation: z.string().optional(),
    travelPace: z.string().optional(),
    occasion: z.string().optional(),
    foodPreference: z.string().optional(),
    specialNeeds: z.string().optional(),
    climatePreference: z.string().optional(),
    interests: z.array(z.string()).optional(),
    inputHistory: z.array(z.string()),
    isPlanReady: z.boolean(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    tripTheme: z.string().optional(),
  }),
  userProfile: z.record(z.any()).optional(), // localStorage data
});

// Basic clarification schema (backwards compatibility)
const basicClarifySchema = z.object({
  input: z.string(),
  state: z.object({
    source: z.string().optional(),
    destination: z.string().optional(),
    travelDates: z.string().optional(),
    duration: z.string().optional(),
    groupType: z.enum(["solo", "couple", "family", "friends"]).optional(),
    budget: z.string().optional(),
    domesticOrInternational: z.enum(["domestic", "international"]).optional(),
    modeOfTransport: z
      .enum(["own car", "rental car", "taxi", "train", "bus", "flight"])
      .optional(),
    carModel: z.string().optional(),
    flightPreferences: z.string().optional(),
    accommodation: z.string().optional(),
    travelPace: z.string().optional(),
    occasion: z.string().optional(),
    foodPreference: z.string().optional(),
    specialNeeds: z.string().optional(),
    climatePreference: z.string().optional(),
    interests: z.array(z.string()).optional(),
    inputHistory: z.array(z.string()),
    isPlanReady: z.boolean(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    tripTheme: z.string().optional(),
  }),
});

// Enhanced personalized clarification endpoint
router.post(
  "/enhanced",
  validateRequest(enhancedClarifySchema),
  asyncHandler(enhancedClarification)
);

// Original clarification endpoint (backwards compatibility)
router.post(
  "/",
  validateRequest(basicClarifySchema),
  asyncHandler(startClarification)
);

export default router;

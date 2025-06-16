import { Router } from "express";
import { startClarification } from "../controllers/clarifyController";
import { validateRequest } from "../middleware/validateRequest";
import { ClarifyInputSchema } from "../utils/validation";

const router = Router();

// POST /api/clarify - start clarification loop
router.post("/", validateRequest(ClarifyInputSchema), startClarification);

// GET /api/clarify/test - test endpoint
router.get("/test", (req, res) => {
  res.json({ message: "Clarify route is working." });
});

export default router;

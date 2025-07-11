import { Router } from "express";
import asyncHandler from "express-async-handler";
import { QuotaChecker } from "../utils/quotaChecker";

const router = Router();

router.get(
  "/status",
  asyncHandler(async (req, res) => {
    console.log("[Quota Route] Checking API quota status...");

    const quotaChecker = new QuotaChecker();
    const info = await quotaChecker.getQuotaInfo();

    res.json({
      timestamp: new Date().toISOString(),
      ...info,
    });
  })
);

router.get(
  "/test",
  asyncHandler(async (req, res) => {
    console.log("[Quota Route] Testing API connectivity...");

    const quotaChecker = new QuotaChecker();
    const status = await quotaChecker.checkQuotaStatus();

    res.json({
      timestamp: new Date().toISOString(),
      ...status,
    });
  })
);

export default router;

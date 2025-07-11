import express from "express";
import helmet from "helmet";
import cors from "cors";
import clarifyRoutes from "./routes/clarify";
import enhancedClarifyRoutes from "./routes/enhancedClarify";
import quotaRoutes from "./routes/quota";

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "10mb" })); // Increased limit for user profile data

// Routes
app.use("/api/clarify", enhancedClarifyRoutes); // Enhanced routes with personalization
app.use("/api/basic-clarify", clarifyRoutes); // Basic routes (renamed to avoid confusion)
app.use("/api/quota", quotaRoutes); // Quota management

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("[App] Error:", err);

    if (err.name === "ValidationError") {
      return res
        .status(400)
        .json({ error: "Invalid request data", details: err.message });
    }

    res.status(500).json({ error: "Internal server error" });
  }
);

export default app;

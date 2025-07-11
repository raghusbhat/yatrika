import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

export const validateRequest =
  (schema: ZodSchema<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (err) {
      console.error("[ValidationError] Request validation failed:", {
        timestamp: new Date().toISOString(),
        error: err,
        requestBody: JSON.stringify(req.body, null, 2),
      });
      
      if (err && typeof err === 'object' && 'issues' in err) {
        res.status(400).json({ 
          error: "Invalid request", 
          details: err.issues || err,
          message: "Validation failed - check request format"
        });
      } else {
        res.status(400).json({ 
          error: "Invalid request", 
          details: err,
          message: "Request validation error"
        });
      }
    }
  };

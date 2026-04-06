import { sendError } from "../utils/response.js";

export const errorHandler = (err, _req, res, _next) => {
  // mongoose validation error
  if (err.name === "ValidationError") {
    const details = Object.values(err.errors).map((e) => e.message);
    return sendError(res, "Validation failed", 400, details);
  }

  // mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return sendError(res, `Duplicate value for ${field}`, 409);
  }

  // mongoose cast error (bad ObjectId etc.)
  if (err.name === "CastError") {
    return sendError(res, `Invalid ${err.path}: ${err.value}`, 400);
  }

  // joi validation
  if (err.isJoi) {
    const details = err.details.map((d) => d.message);
    return sendError(res, "Validation failed", 400, details);
  }

  // our custom ApiError
  if (err.isOperational) {
    return sendError(res, err.message, err.statusCode, err.details);
  }

  // unknown errors
  console.error("Unexpected error:", err);
  return sendError(res, "Internal server error", 500);
};

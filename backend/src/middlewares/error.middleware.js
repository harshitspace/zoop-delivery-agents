import ApiError from "../utils/ApiError.js";

// 404 Not Found Error Handler
export const notFound = (req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

// Global Error Handler
export const errorHandler = (err, req, res, next) => {
  if (err && err.code === "ER_DUP_ENTRY") {
    const field = err.sqlMessage?.includes("email")
      ? "email"
      : err.sqlMessage?.includes("phone")
      ? "phone"
      : "field";
    err = new ApiError(409, `An agent with this ${field} already exists`);
  }

  const statusCode = err instanceof ApiError ? err.statusCode : 500;
  const message = err instanceof ApiError ? err.message : "Internal server error";
  const details = err instanceof ApiError ? err.details : [];

  if (statusCode === 500) {
    console.error("Unhandled error:", err);
  }

  res.status(statusCode).json({
    statusCode,
    success: false,
    message,
    details,
  });
}
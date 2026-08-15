// utils/errorHandler.js
import { errorResponse } from "./response.js";

export class AppError extends Error {
  constructor(message, statusCode = 500, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

export const handleError = (error) => {
  console.error("[ERROR]", error);

  if (error instanceof AppError) {
    return errorResponse(error.message, error.statusCode, error.errors);
  }

  return errorResponse("Internal Server Error", 500);
};
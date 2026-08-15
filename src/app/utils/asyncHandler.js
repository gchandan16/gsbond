// utils/asyncHandler.js
import { handleError } from "./errorHandler";

export const asyncHandler = (fn) => {
  return async (req, context) => {
    try {
      return await fn(req, context);
    } catch (err) {
      return handleError(err);
    }
  };
};
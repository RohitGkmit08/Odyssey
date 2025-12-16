import { sendResponse } from "./apiResponse.js";
import { HTTP_STATUS } from "./httpStatus.js";

export const errorHandler = (error, req, res, next) => {
  if (error.name === "CastError") {
    return sendResponse(
      res,
      HTTP_STATUS.BAD_REQUEST,
      false,
      "Invalid ID"
    );
  }

  if (error.code === 11000) {
    return sendResponse(
      res,
      HTTP_STATUS.CONFLICT,
      false,
      "Duplicate record"
    );
  }

  return sendResponse(
    res,
    HTTP_STATUS.INTERNAL_SERVER_ERROR,
    false,
    error.message || "Internal server error"
  );
};

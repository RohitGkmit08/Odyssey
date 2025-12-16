import express from "express";
import Destination from "../models/Destination.js";
import { sendResponse } from "../utils/apiResponse.js";
import { HTTP_STATUS } from "../utils/httpStatus.js";

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const get_destinations = await Destination.find();

    return sendResponse(
      res,
      HTTP_STATUS.OK,
      true,
      "Destinations fetched successfully",
      get_destinations
    );
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const create_destination = await Destination.create(req.body);

    return sendResponse(
      res,
      HTTP_STATUS.CREATED,
      true,
      "Destination created successfully",
      create_destination
    );
  } catch (error) {
    next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const update_destination = await Destination.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!update_destination) {
      return sendResponse(
        res,
        HTTP_STATUS.NOT_FOUND,
        false,
        "Destination not found"
      );
    }

    return sendResponse(
      res,
      HTTP_STATUS.OK,
      true,
      "Destination updated successfully",
      update_destination
    );
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const delete_destination = await Destination.findByIdAndDelete(
      req.params.id
    );

    if (!delete_destination) {
      return sendResponse(
        res,
        HTTP_STATUS.NOT_FOUND,
        false,
        "Destination not found"
      );
    }

    return sendResponse(
      res,
      HTTP_STATUS.OK,
      true,
      "Destination deleted successfully"
    );
  } catch (error) {
    next(error);
  }
});

export default router;

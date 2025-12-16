import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { sendResponse } from "./utils/apiResponse.js";
import { HTTP_STATUS } from "./utils/httpStatus.js";
import connectDB from "./config/db.js";
import destinationsRoutes from "./routes/destinations.routes.js";
import { errorHandler } from "./utils/errorHandler.js";

dotenv.config();

const app = express();

connectDB();

mongoose.connection.once("open", () => {
  console.log("Mongoose connected to MongoDB");
});

mongoose.connection.on("error", (err) => {
  console.error("Mongoose connection error:", err);
});

app.use(cors());
app.use(express.json());

app.use("/api/destinations", destinationsRoutes);

app.use((req, res) => {
  return sendResponse(
    res,
    HTTP_STATUS.NOT_FOUND,
    false,
    "Route not found"
  );
});

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

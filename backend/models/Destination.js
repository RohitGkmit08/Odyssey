import mongoose from "mongoose";

const destinationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,
    price: String,
    image: String,
  },
  { timestamps: true }
);

const Destination = mongoose.model("Destination", destinationSchema);

export default Destination;

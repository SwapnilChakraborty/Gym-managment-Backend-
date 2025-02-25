import mongoose from "mongoose";

const gymSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    location: { type: String, required: true },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    pricing: { type: Number, required: true },
    capacity: { type: Number, required: true },
  },
  { timestamps: true }
);

const Gym = mongoose.model("Gym", gymSchema);
export default Gym;
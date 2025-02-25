import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ["admin", "vendor", "customer"], default: "customer" },
});

export default mongoose.model("User", UserSchema);

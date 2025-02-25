import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  paymentId: { type: String, required: true },
  paymentMethod: { type: String, enum: ["stripe", "razorpay"], required: true },
  status: { type: String, enum: ["PENDING", "SUCCESS", "FAILED", "REFUNDED"], default: "PENDING" },
}, { timestamps: true });

export default mongoose.model("Payment", PaymentSchema);
 
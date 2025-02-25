import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to User model
      required: true,
    },
    type: {
      type: String,
      enum: ["booking_confirmation", "payment_reminder", "booking_reminder"],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false, // Default is unread
    },
    sentVia: {
      type: [String], // ["email", "sms", "whatsapp", "push"]
      enum: ["email", "sms", "whatsapp", "push"],
    },
  },
  { timestamps: true } // Adds createdAt and updatedAt timestamps
);

export default mongoose.model("Notification", notificationSchema);

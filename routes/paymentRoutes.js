import express from "express";
import { initiatePayment, getPaymentStatus, getUserPaymentHistory, getEarnings } from "../controllers/paymentController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Start Payment (Customer)
router.post("/initiate", authenticate, initiatePayment);

// Check Payment Status
router.get("/status/:id", authenticate, getPaymentStatus);

// Get User Payment History
router.get("/history", authenticate, getUserPaymentHistory);

// Get Gym Earnings (Vendor)
router.get("/earnings", authenticate, getEarnings);

export default router;

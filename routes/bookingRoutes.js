import express from "express";
import {
  createBooking,
  getBookings,
  approveBooking,
  rejectBooking,
  cancelBooking,
} from "../controllers/bookingController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";

const router = express.Router();

// Create a booking (Customer)
router.post("/", authenticate, roleMiddleware(["customer"]), createBooking);

// List all bookings (Vendor/Admin)
router.get("/", authenticate, roleMiddleware(["vendor", "admin"]), getBookings);

// Approve a booking (Vendor)
router.put("/:id/approve", authenticate, roleMiddleware(["vendor"]), approveBooking);

// Reject a booking (Vendor)
router.put("/:id/reject", authenticate, roleMiddleware(["vendor"]), rejectBooking);

// Cancel a booking (Customer)
router.delete("/:id", authenticate, roleMiddleware(["customer"]), cancelBooking);

export default router;

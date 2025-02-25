import express from "express";
import { getSalesReport, getLocationReport, getVendorReport, getTimeSlotReport } from "../controllers/reportController.js";

const router = express.Router();

// Report Routes
router.get("/sales", getSalesReport); // Sales report
router.get("/location-wise", getLocationReport); // Location-based report
router.get("/vendor-wise", getVendorReport); // Vendor-specific report
router.get("/timeslot", getTimeSlotReport); // Booking trends

export default router;

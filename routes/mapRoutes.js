import express from "express";
import { getGyms, getNearbyGyms } from "../controllers/mapController.js";

const router = express.Router();

// 📌 Route to fetch all gyms with locations
router.get("/gyms", getGyms);

// 📌 Route to find nearby gyms based on user location
router.get("/gyms/nearby", getNearbyGyms);

export default router;

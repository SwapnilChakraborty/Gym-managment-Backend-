import express from "express";
import { addGym, getGyms } from "../controllers/gymController.js";
import { authenticate } from "../middlewares/authMiddleware.js";  // Fixed import
import roleMiddleware  from "../middlewares/roleMiddleware.js";  // Fixed import

const router = express.Router();

// Only admin can add gym
router.post("/add", authenticate, roleMiddleware(["admin","vendor"]), addGym);

// Any logged-in user can get all gyms
router.get("/",  getGyms);

export default router;

import express from "express";
import { getAllUsers, getUserProfile, updateUserProfile, deleteUser } from "../controllers/userController.js";
import { authenticate, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Admin: Get all users
router.get("/", authenticate, authorize(["admin"]), getAllUsers);

// User: Get own profile
router.get("/profile", authenticate, getUserProfile);

// User: Update own profile
router.put("/profile", authenticate, updateUserProfile);

// Admin: Delete a user
router.delete("/:id", authenticate, authorize(["admin"]), deleteUser);

export default router;

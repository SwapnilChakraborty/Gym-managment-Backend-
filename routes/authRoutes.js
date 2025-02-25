import express from "express";
import { register, login, logout } from "../controllers/authController.js";
import { authenticate, authorize } from "../middlewares/authMiddleware.js";




const router = express.Router();

// Public Routes
router.post("/register", register);
router.post("/login", login);
router.post("/logout", authenticate, logout);

// Protected Routes
router.get("/admin", authenticate, authorize(["admin"]), (req, res) => {
  res.json({ message: "Welcome Admin" });
});

router.get("/vendor", authenticate, authorize(["vendor"]), (req, res) => {
  res.json({ message: "Welcome Vendor" });
});

router.get("/customer", authenticate, authorize(["customer"]), (req, res) => {
  res.json({ message: "Welcome Customer" });
});

export default router;

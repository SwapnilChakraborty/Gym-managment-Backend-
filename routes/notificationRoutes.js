import express from "express";
import { getNotifications } from "../controllers/notificationController.js";

const router = express.Router();

// Route to fetch notifications
router.get("/", getNotifications);

export default router;

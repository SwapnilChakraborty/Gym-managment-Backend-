import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import cookieParser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";
import morgan from "morgan";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

// Route Files
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import gymRoutes from "./routes/gymRoutes.js";
// import bookingRoutes from "./routes/bookingRoutes.js";
// import paymentRoutes from "./routes/paymentRoutes.js";
import mapRoutes from "./routes/mapRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

// Load environment variables
dotenv.config();

// Initialize Express app & HTTP Server
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "https://yourdomain.com"],
    credentials: true,
  },
});

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));
app.use(helmet());

// Rate Limiting Middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});
app.use(limiter);

// CORS Configuration
const allowedOrigins = ["http://localhost:3000", "https://yourdomain.com"];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`❌ Blocked CORS request from: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// WebSocket (Real-time Notifications)
io.on("connection", (socket) => {
  console.log(`🔗 Client Connected: ${socket.id}`);

  // Handle Booking Updates
  socket.on("booking-update", (data) => {
    console.log("📩 Booking Update:", data);
    io.emit("booking-update", data); // Broadcast to all clients
  });

  // Handle Payment Updates
  socket.on("payment-update", (data) => {
    console.log("💰 Payment Update:", data);
    io.emit("payment-update", data); // Notify all clients
  });

  // Handle Client Disconnect
  socket.on("disconnect", () => {
    console.log(`❌ Client Disconnected: ${socket.id}`);
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/gym", gymRoutes);
// app.use("/api/booking", bookingRoutes);
// app.use("/api/payment", paymentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/maps", mapRoutes);

// Handle Unhandled Routes
app.use((req, res) => {
  res.status(404).json({ message: "❌ Route not found" });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("🚨 Error:", err.message);
  res.status(500).json({ message: err.message || "Internal Server Error" });
});

// Connect to Database & Start Server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    console.log("✅ Database Connected");

    server.listen(PORT, () =>
      console.log(`🚀 Server running on port ${PORT}`)
    );
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }
};

// Graceful Shutdown Handling
const shutdown = () => {
  console.log("🔻 Server shutting down...");
  server.close(() => {
    console.log("🔴 HTTP server closed");
    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

startServer();

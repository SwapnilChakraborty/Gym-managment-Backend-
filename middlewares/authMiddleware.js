import jwt from "jsonwebtoken";
import BlacklistedToken from "../models/BlackListedToken.js";

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Access Denied. No token provided." });
    }

    const token = authHeader.split(" ")[1];

    // ⚡ Optimize: Consider using Redis for checking blacklisted tokens instead of DB
    const isBlacklisted = await BlacklistedToken.findOne({ token });
    if (isBlacklisted) {
      return res.status(401).json({ message: "Token is blacklisted. Please log in again." });
    }

    // Verify JWT
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (!decoded?.id || !decoded?.role) {
        return res.status(400).json({ message: "Invalid Token Structure" });
      }
    } catch (err) {
      const errorMessage =
        err.name === "TokenExpiredError"
          ? "Token has expired. Please log in again."
          : "Invalid Token";
      return res.status(401).json({ message: errorMessage });
    }

    req.user = decoded; // Attach user data to request
    next();
  } catch (err) {
    console.error("Authentication Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Role-based authorization middleware
export const authorize = (roles) => (req, res, next) => {
  if (!req.user?.role) {
    return res.status(403).json({ message: "Forbidden: No user role found" });
  }
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: "Forbidden: You do not have permission" });
  }
  next();
};

import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const verifyToken = (req, res, next) => {
  try {
    // 1. Get token from cookies (NOT headers)
    const token = req.cookies?.accessToken;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token" });
    }

    // 2. Verify token
    jwt.verify(token, process.env.ACCESS_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ message: "Forbidden: Invalid token" });
      }

      // 3. Attach user to request
      req.user = user;
      next();
    });

  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.model.js";
import { Creator } from "../models/Creator.model.js";
import { Sponsor } from "../models/Sponsor.model.js";
import { generateAccessToken, generateRefreshToken } from "../utils/token.utils.js";

// Signup
export const signupUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // 1. Validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!["creator", "sponsor"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // 2. Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    //role based sponsor or creator creation
    if (role === "creator") {
      await Creator.create({
        user: user._id,
        previousProjects: [],
        ratings: [],
      });
    } else if (role === "sponsor") {
      await Sponsor.create({
        user: user._id,
        previousProjects: [],
        ratings: [],
      });
    }

    // 5. Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // 6. Save refresh token in DB
    user.refreshToken = refreshToken;
    await user.save();

    // 7. Set cookies (AUTO LOGIN)
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false, // true in production (HTTPS)
      sameSite: "lax",
      maxAge: 15 * 60 * 1000, // 15 min
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // 8. Response (NO tokens sent in JSON anymore)
    res.status(201).json({
      message: "User created & logged in successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validation
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // 2. Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Your email or password is incorrect" });
    }

    // 3. Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Your email or password is incorrect" });
    }

    // 4. Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // 5. Save refresh token in DB
    user.refreshToken = refreshToken;
    await user.save();

    // 6. Set cookies
    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: false, // true in production
        sameSite: "lax",
        maxAge: 15 * 60 * 1000,
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

    // 7. Response
    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//logout
export const logoutUser = async (req, res) => {
  try {
    const userId = req.user?.id; //using auth middleware to get user info from token

    // 1. Remove refresh token from DB (important)
    if (userId) {
      await User.findByIdAndUpdate(userId, {
        $unset: { refreshToken: 1 },
      });
    }

    // 2. Clear cookies
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    // 3. Response
    res.status(200).json({
      message: "Logged out successfully",
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

//refresh token
export const refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    // 1. Check token exists
    if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token" });
    }

    // 2. Find user with this token (DB check)
    const user = await User.findOne({ refreshToken });
    if (!user) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    // 3. Verify refresh token
    jwt.verify(refreshToken, process.env.REFRESH_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "Token expired or invalid" });
      }

      // extra safety (match user id)
      if (user._id.toString() !== decoded.id) {
        return res.status(403).json({ message: "Token mismatch" });
      }

      // 4. Generate NEW tokens (ROTATION)
      const newAccessToken = generateAccessToken(user);
      const newRefreshToken = generateRefreshToken(user);

      // 5. Replace refresh token in DB
      user.refreshToken = newRefreshToken;
      await user.save();

      // 6. Set new cookies
      res.cookie("accessToken", newAccessToken, {
        httpOnly: true,
        secure: false, // true in production
        sameSite: "lax",
        maxAge: 15 * 60 * 1000,
      });

      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      // 7. Response
      return res.status(200).json({ message: "Token refreshed" });
    });

  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
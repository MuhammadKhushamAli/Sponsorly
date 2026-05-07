import { User } from "../models/User.model.js";
import { Creator } from "../models/Creator.model.js";
import { Sponsor } from "../models/Sponsor.model.js";
import { imageUpload } from "../utils/uploadHandlers.utils.js";
import fs from "fs/promises";
import mongoose from "mongoose";

export const getSponsorsByIndustries = async (req, res) => {
  try {
    let { industries } = req.params;

    // 1. Convert string → array
    // "tech,finance" → ["tech", "finance"]
    industries = industries.split(",").map(i => i.trim().toLowerCase());

    // 2. Find sponsors matching ANY of these industries
    const sponsors = await Sponsor.find({
      industries: { $in: industries },
    }).populate("user", "name email role bio profilePicture_url profilePicture_id"); // populate user data

    // 3. Response
    res.status(200).json({
      count: sponsors.length,
      sponsors,
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export const sponsorDashboard = async (req, res) => {
  try {
    // 1. Get user
    const user = await User.findById(req.user.id).select("name email role bio profilePicture_url profilePicture_id");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2. Get sponsor profile
    const sponsor = await Sponsor.findOne({ user: req.user.id });

    if (!sponsor) {
      return res.status(404).json({ message: "Sponsor profile not found" });
    }

    // 3. Merge into single object
    const mergedUser = {
      ...user.toObject(),
      sponsor: sponsor.toObject(),
    };

    res.json({
      message: "Welcome to sponsor dashboard",
      user: mergedUser,
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export const updateSponsorProfile = async (req, res) => {
  try {
    if(req.user.role !== "sponsor") {
      return res.status(403).json({ message: "Access denied: Only sponsors can update sponsor profile" });
    }

    const userId = req.user.id;

    const {  bio, industries } = req.body ? req.body : {};
    const file = req.file;

    const user = await User.findById(userId);

    if (!user) {
      if (file) {
        await fs.unlink(file.path);
      }
      return res.status(404).json({ message: "User not found" });
    }

    const sponsor = await Sponsor.findOne({ user: userId });

    if (!sponsor) {
      if (file) {
        await fs.unlink(file.path);
      }
      return res.status(404).json({ message: "Sponsor not found" });
    }

    let isChanged = false;

    // ---------------- IMAGE ----------------
    if (file) {
      let uploadRes;
      try {
        uploadRes = await imageUpload(file.path);
      } catch (err) {
        try { await fs.unlink(file.path); } catch {}
        return res.status(500).json({ message: "Image upload failed", error: err.message });
      }

      user.profilePicture_url = uploadRes.secure_url;
      user.profilePicture_id = uploadRes.public_id;

      isChanged = true;
    }

    // ---------------- BIO ----------------
    if (bio !== undefined) {
      if (typeof bio !== "string" || bio.trim() === "") {
        if (file) await fs.unlink(file.path);
        return res.status(400).json({ message: "Bio cannot be empty" });
      }

      user.bio = bio.trim();
      isChanged = true;
    }

    // ---------------- INDUSTRIES ----------------
    if (industries !== undefined) {
      let parsedIndustries;

      if (typeof industries === "string") {
        try {
          parsedIndustries = JSON.parse(industries);
        } catch {
          parsedIndustries = industries
            .split(',')
            .map(i => i.trim().toLowerCase())
            .filter(Boolean);
        }
      } else if (Array.isArray(industries)) {
        parsedIndustries = industries.map(i => String(i).trim().toLowerCase()).filter(Boolean);
      } else {
        if (file) await fs.unlink(file.path);
        return res.status(400).json({ message: "Invalid industries format" });
      }

      if (!Array.isArray(parsedIndustries) || parsedIndustries.length === 0) {
        if (file) await fs.unlink(file.path);
        return res.status(400).json({ message: "At least one industry is required" });
      }

      sponsor.industries = parsedIndustries;
      isChanged = true;
    }

    // ---------------- MUST CHANGE CHECK ----------------
    if (!isChanged) {
      if (file) {
        await fs.unlink(file.path);
      }
      return res.status(400).json({ message: "At least one field must be updated" });
    }

    // ---------------- PROFILE COMPLETION LOGIC (sponsor) ----------------
    user.profileCompleted = !!user.profilePicture_url && !!user.bio && Array.isArray(sponsor.industries) && sponsor.industries.length > 0 ;

    await user.save();
    await sponsor.save();

    if (file) {
      try { await fs.unlink(file.path); } catch {}
    }

    return res.status(200).json({ message: "Sponsor profile updated successfully", user, sponsor });
  } catch (error) {
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch {
        // ignore cleanup errors
      }
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
import { User } from "../models/User.model.js";
import { Creator } from "../models/Creator.model.js";
import { Sponsor } from "../models/Sponsor.model.js";
import { imageUpload } from "../utils/uploadHandlers.utils.js";
import fs from "fs/promises";

export const getCreatorsByNiche = async (req, res) => {
  try {
    let { niche } = req.params;

    // 1. Convert string → array
    // "gaming,vlogging" → ["gaming", "vlogging"]
    niche = niche.split(",").map(n => n.trim().toLowerCase());

    // 2. Find creators matching ANY of these niches
    const creators = await Creator.find({
      niche: { $in: niche },
    }).populate("user", "name email role");

    // 3. Response
    res.status(200).json({
      count: creators.length,
      creators,
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export const creatorDashboard = async (req, res) => {
  try {
    // 1. Get user
    const user = await User.findById(req.user.id).select("name email role");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2. Get creator profile
    const creator = await Creator.findOne({ user: req.user.id });

    if (!creator) {
      return res.status(404).json({ message: "Creator profile not found" });
    }

    // 3. Merge into single object
    const mergedUser = {
      ...user.toObject(),
      creator: creator.toObject(),
    };

    res.json({
      message: "Welcome to creator dashboard",
      user: mergedUser,
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export const updateCreatorProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const { bio, links, niche, followersCount } = req.body? req.body : {};
    const file = req.file;

    const creator = await Creator.findOne({ user: userId });

    if (!creator) {
        if(file) 
            await fs.unlink(file.path); // delete uploaded file if creator profile doesn't exist
      return res.status(404).json({ message: "Creator not found" });
    }

    let isChanged = false;

    // ---------------- IMAGE ----------------
    if (file) {
      const uploadRes = await imageUpload(file.path);

      creator.profilePicture_url = uploadRes.secure_url;
      creator.profilePicture_id = uploadRes.public_id;

      isChanged = true;
    }

    // ---------------- BIO ----------------
    if (bio !== undefined) {
      if (bio.trim() === "") {
        if(file) 
            await fs.unlink(file.path); // delete uploaded file if creator profile doesn't exist
        return res.status(400).json({ message: "Bio cannot be empty" });
      }

      creator.bio = bio;
      isChanged = true;
    }

    // ---------------- NICHES ----------------
    if (niche !== undefined) {
      if (!Array.isArray(niche) || niche.length === 0) {
        if(file) 
            await fs.unlink(file.path); // delete uploaded file if creator profile doesn't exist
        return res.status(400).json({ message: "Niche cannot be empty" });
      }

      creator.niche = niche;
      isChanged = true;
    }

    // ---------------- LINKS ----------------
    if (links !== undefined) {
      let parsedLinks;

      try {
        parsedLinks = JSON.parse(links);
      } catch {
        if(file) 
            await fs.unlink(file.path); // delete uploaded file if creator profile doesn't exist
        return res.status(400).json({
          message: "Links must be valid JSON array string",
        });
      }

      if (!Array.isArray(parsedLinks) || parsedLinks.length === 0) {
        if(file) 
            await fs.unlink(file.path); // delete uploaded file if creator profile doesn't exist
        return res.status(400).json({ message: "Links cannot be empty" });
      }

      creator.links = parsedLinks;
      isChanged = true;
    }

    // ---------------- FOLLOWERS ----------------
    if (followersCount !== undefined) {
      const parsed = Number(followersCount);

      if (isNaN(parsed) || parsed < 0) {
        if(file) 
            await fs.unlink(file.path); // delete uploaded file if creator profile doesn't exist
        return res.status(400).json({
          message: "Invalid followers count",
        });
      }

      creator.followersCount = parsed;
      isChanged = true;
    }

    // ---------------- MUST CHANGE CHECK ----------------
    if (!isChanged) {
        if(file) 
            await fs.unlink(file.path); // delete uploaded file if creator profile doesn't exist
      return res.status(400).json({
        message: "At least one field must be updated",
      });
    }

    // ---------------- PROFILE COMPLETION LOGIC ----------------
    creator.profileCompleted =
      !!creator.profilePicture_url &&
      !!creator.bio &&
      Array.isArray(creator.niche) &&
      creator.niche.length > 0 &&
      Array.isArray(creator.links) &&
      creator.links.length > 0;

    await creator.save();
    if(file) 
        await fs.unlink(file.path); // delete uploaded file if creator profile doesn't exist

    res.status(200).json({
      message: "Profile saved successfully",
      profileCompleted: creator.profileCompleted,
      creator,
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
import { User } from "../models/User.model.js";
import { Creator } from "../models/Creator.model.js";
import { Sponsor } from "../models/Sponsor.model.js";
import { CreatorCampaign } from "../models/CreatorCampaign.model.js";
import { imageUpload } from "../utils/uploadHandlers.utils.js";
import fs from "fs/promises";
import mongoose from "mongoose";

export const getCreators = async (req, res) => {
  try {
    let { niche, rating } = req.query;

    const completedUsers = await User.find({
      role: "creator",
      profileCompleted: true,
    }).select("_id");

    const completedUserIds = completedUsers.map((user) => user._id);

    if (completedUserIds.length === 0) {
      return res.status(200).json({
        count: 0,
        creators: [],
      });
    }

    const filter = {
      user: { $in: completedUserIds },
    };
    
    // 1. Niche filter
    if (niche) {
        const nicheArray = niche
        .split(",")
        .map(n => n.trim().toLowerCase());
        
        filter.niche = { $in: nicheArray };
    }
    
    // 2. Rating filter (Decimal128 handling)
    if (rating<0 || rating>5) {
      return res.status(400).json({
        message: "Rating must be between 0 and 5",
      });
    }
    if (rating) {
        const minRating = parseFloat(rating);

      if (isNaN(minRating)) {
        return res.status(400).json({
          message: "Invalid rating value",
        });
      }

      filter.rating = {
        $gte: mongoose.Types.Decimal128.fromString(minRating.toString()),
      };
    }

    // 3. Query
    const creators = await Creator.find(filter)
      .populate("user", "name email role profileCompleted bio profilePicture_url profilePicture_id")
      .sort({ rating: -1 });

    // 4. Convert Decimal128 → Number (VERY IMPORTANT)
    const formattedCreators = creators.map((creator) => {
      const obj = creator.toObject();
      obj.rating = obj.rating ? parseFloat(obj.rating.toString()) : 0;
      return obj;
    });

    // 5. Response
    res.status(200).json({
      count: formattedCreators.length,
      creators: formattedCreators,
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
    const user = await User.findById(req.user.id).select("name email role profileCompleted bio profilePicture_url profilePicture_id");

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

    const { bio, links, niche, followersCount } = req.body ? req.body : {};
    const file = req.file;

    const user = await User.findById(userId);
    const creator = await Creator.findOne({ user: userId });

    if (!user) {
      if (file) 
        await fs.unlink(file.path);
      return res.status(404).json({ message: "User not found" });
    }

    if (!creator) {
        if(file) 
            await fs.unlink(file.path); // delete uploaded file if creator profile doesn't exist
      return res.status(404).json({ message: "Creator not found" });
    }

    let isChanged = false;

    // ---------------- IMAGE ----------------
    if (file) {
      const uploadRes = await imageUpload(file.path);

      user.profilePicture_url = uploadRes.secure_url;
      user.profilePicture_id = uploadRes.public_id;

      isChanged = true;
    }

    // ---------------- BIO ----------------
    if (bio !== undefined) {
      user.bio = bio;
      isChanged = true;
    }

    // ---------------- NICHES ----------------
    if (niche !== undefined) {
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
    user.profileCompleted =
      !!user.profilePicture_url &&
      !!user.bio &&
      Array.isArray(creator.niche) &&
      creator.niche.length > 0 &&
      Array.isArray(creator.links) &&
      creator.links.length > 0;

    await user.save();
    await creator.save();
    if(file) 
        await fs.unlink(file.path); // delete uploaded file if creator profile doesn't exist

    res.status(200).json({
      message: "Profile saved successfully",
      profileCompleted: user.profileCompleted,
      user,
      creator,
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export const createCampaign = async (req, res) => {
  try {
    if (req.user.role !== "creator") {
      return res.status(403).json({
        message: "Access denied: Only creators can create campaigns",
      });
    }

    const { title, ratePerHour, tags, description } = req.body ? req.body : {};

    if (!title || typeof title !== "string" || title.trim() === "") {
      return res.status(400).json({ message: "Title is required" });
    }

    const parsedRatePerHour = Number(ratePerHour);
    if(!ratePerHour)
      return res.status(400).json({ message: "Rate per hour is required" });
    if ( Number.isNaN(parsedRatePerHour) || parsedRatePerHour <= 0) {
      return res.status(400).json({ message: "Rate per hour must be a positive number" });
    }

    let parsedTags = tags;
    if (typeof tags === "string") {
      try {
        parsedTags = JSON.parse(tags);
      } catch {
        parsedTags = tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean);
      }
    }

    if (!Array.isArray(parsedTags) || parsedTags.length === 0) {
      return res.status(400).json({ message: "At least one tag is required" });
    }

    if (typeof description !== "string" || description.trim() === "") {
      return res.status(400).json({ message: "Description is required" });
    }

    const creator = await Creator.findOne({ user: req.user.id });
    if (!creator) {
      return res.status(404).json({ message: "Creator profile not found" });
    }

    const createdCampaign = await CreatorCampaign.create({
      title: title.trim(),
      ratePerHour: parsedRatePerHour,
      creatorId: creator._id,
      tags: parsedTags.map((tag) => String(tag).trim()).filter(Boolean),
      description: description.trim(),
    });

    creator.campaigns.push(createdCampaign._id);
    await creator.save();

    return res.status(201).json({
      message: "Campaign created successfully",
      campaign: createdCampaign,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
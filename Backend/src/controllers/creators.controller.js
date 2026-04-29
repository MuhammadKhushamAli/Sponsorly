import { User } from "../models/User.model.js";
import { Creator } from "../models/Creator.model.js";
import { Sponsor } from "../models/Sponsor.model.js";

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
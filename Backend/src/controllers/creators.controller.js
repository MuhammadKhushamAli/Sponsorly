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
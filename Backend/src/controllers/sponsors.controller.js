import { User } from "../models/User.model.js";
import { Creator } from "../models/Creator.model.js";
import { Sponsor } from "../models/Sponsor.model.js";

export const getSponsorsByIndustries = async (req, res) => {
  try {
    let { industries } = req.params;

    // 1. Convert string → array
    // "tech,finance" → ["tech", "finance"]
    industries = industries.split(",").map(i => i.trim().toLowerCase());

    // 2. Find sponsors matching ANY of these industries
    const sponsors = await Sponsor.find({
      industries: { $in: industries },
    }).populate("user", "name email role"); // populate user data

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
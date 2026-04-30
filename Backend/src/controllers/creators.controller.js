import { User } from "../models/User.model.js";
import { Creator } from "../models/Creator.model.js";
import { Sponsor } from "../models/Sponsor.model.js";
import { imageUpload } from "../utils/uploadHandlers.utils.js";

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

export const completeCreatorProfile = async (req, res) => {
  try {
    
    if(req.user.profileCompleted) {
      return res.status(400).json({
        message: "Profile already completed. Use update API instead.",
      });
    }

    const userId = req.user.id;
    const { bio, followersCount } = req.body;
    const file = req.file;

    // 🔥 Parse links safely (from form-data string → array)
    let links;
    try {
      links = JSON.parse(req.body.links);
    } catch (err) {
      return res.status(400).json({
        message: "links must be a valid JSON array string",
        example: `[{"platform":"youtube","url":"https://youtube.com"}]`,
      });
    }

    // 1. Find creator
    const creator = await Creator.findOne({ user: userId });

    if (!creator) {
      return res.status(404).json({ message: "Creator not found" });
    }

    // 2. Prevent re-completion
    if (creator.profileCompleted) {
      return res.status(400).json({
        message: "Profile already completed. Use update API instead.",
      });
    }

    // 3. VALIDATION
    const missingFields = [];

    if (!file) missingFields.push("profilePicture");

    if (!bio || bio.trim() === "") {
      missingFields.push("bio");
    }

    if (!Array.isArray(links) || links.length === 0) {
      missingFields.push("links");
    }

    if (followersCount === undefined) {
      missingFields.push("followersCount");
    }

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: "All fields are required to complete profile",
        missingFields,
      });
    }

    // 4. Validate links structure
    for (const link of links) {
      if (!link.platform || !link.url) {
        return res.status(400).json({
          message: "Each link must have platform and url",
        });
      }
    }

    // 5. Validate followers count
    const parsedFollowers = Number(followersCount);
    if (isNaN(parsedFollowers) || parsedFollowers < 0) {
      return res.status(400).json({
        message: "followersCount must be a non-negative number",
      });
    }

    // 6. Upload image
    const uploadRes = await imageUpload(file.path);

    // 7. Save everything
    creator.profilePicture_url = uploadRes.secure_url;
    creator.profilePicture_id = uploadRes.public_id;
    creator.bio = bio;
    creator.links = links;
    creator.followersCount = parsedFollowers;

    creator.profileCompleted = true;

    await creator.save();

    // 8. Response
    res.status(200).json({
      message: "Profile completed successfully",
      creator,
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
import { Sponsor } from "../models/Sponsor.model.js";
import { SponsorCampaign } from "../models/SponsorCampaign.model.js";
import mongoose from "mongoose";
import { parseListInput } from "../utils/parseListInput.utils.js";

export const findSponsorCampaigns = async (req, res) => {
  try {
    const { tags, title, minBudget, maxBudget } = req.query ? req.query : {};
    const filter = {};

    if (title !== undefined) {
      if (typeof title !== "string" || title.trim() === "") {
        return res.status(400).json({ message: "Title filter cannot be empty" });
      }

      filter.title = { $regex: title.trim(), $options: "i" };
    }

    if (tags !== undefined) {
      const parsedTags = parseListInput(tags);

      if (!Array.isArray(parsedTags) || parsedTags.length === 0) {
        return res.status(400).json({ message: "At least one tag is required for filtering" });
      }

      filter.tags = { $in: parsedTags };
    }

    if (minBudget !== undefined || maxBudget !== undefined) {
      filter.budget = {};

      if (minBudget !== undefined) {
        const parsedMinBudget = Number(minBudget);
        if (Number.isNaN(parsedMinBudget) || parsedMinBudget < 0) {
          return res.status(400).json({ message: "minBudget must be a valid positive number" });
        }
        filter.budget.$gte = parsedMinBudget;
      }

      if (maxBudget !== undefined) {
        const parsedMaxBudget = Number(maxBudget);
        if (Number.isNaN(parsedMaxBudget) || parsedMaxBudget < 0) {
          return res.status(400).json({ message: "maxBudget must be a valid positive number" });
        }
        filter.budget.$lte = parsedMaxBudget;
      }

      if (filter.budget.$gte !== undefined && filter.budget.$lte !== undefined && filter.budget.$gte > filter.budget.$lte) {
        return res.status(400).json({ message: "minBudget cannot be greater than maxBudget" });
      }
    }

    const campaigns = await SponsorCampaign.find(filter)
      .populate({
        path: "sponsorId",
        populate: {
          path: "user",
          select: "name email role bio profilePicture_url profilePicture_id",
        },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: campaigns.length,
      campaigns,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const createSponsorCampaign = async (req, res) => {
  try {
    if (req.user.role !== "sponsor") {
      return res.status(403).json({ message: "Access denied: Only sponsors can create campaigns" });
    }

    const { title, budget, tags, description } = req.body ? req.body : {};

    if (!title || typeof title !== "string" || title.trim() === "") {
      return res.status(400).json({ message: "Title is required" });
    }

    const parsedBudget = Number(budget);
    if (budget === undefined) return res.status(400).json({ message: "Budget is required" });
    if (Number.isNaN(parsedBudget) || parsedBudget <= 0) {
      return res.status(400).json({ message: "Budget must be a positive number" });
    }

    let parsedTags = tags;
    if (typeof tags === "string") {
      try {
        parsedTags = JSON.parse(tags);
      } catch {
        parsedTags = tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);
      }
    }

    if (!Array.isArray(parsedTags) || parsedTags.length === 0) {
      return res.status(400).json({ message: "At least one tag is required" });
    }

    if (typeof description !== "string" || description.trim() === "") {
      return res.status(400).json({ message: "Description is required" });
    }

    const sponsor = await Sponsor.findOne({ user: req.user.id });
    if (!sponsor) {
      return res.status(404).json({ message: "Sponsor profile not found" });
    }

    const campaign = await SponsorCampaign.create({
      title: title.trim(),
      budget: parsedBudget,
      sponsorId: sponsor._id,
      tags: parsedTags.map((t) => String(t).trim()).filter(Boolean),
      description: description.trim(),
    });

    // if sponsor model has campaigns array, keep it in sync
    if (Array.isArray(sponsor.campaigns)) {
      sponsor.campaigns.push(campaign._id);
      await sponsor.save();
    }

    return res.status(201).json({ message: "Sponsor campaign created", campaign });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateSponsorCampaign = async (req, res) => {
  try {
    if (req.user.role !== "sponsor") {
      return res.status(403).json({ message: "Access denied: Only sponsors can update campaigns" });
    }

    const { campaignId } = req.params;
    const { title, budget, tags, description } = req.body ? req.body : {};

    if (!mongoose.Types.ObjectId.isValid(campaignId)) {
      return res.status(400).json({ message: "Invalid campaign ID" });
    }

    const sponsor = await Sponsor.findOne({ user: req.user.id });
    if (!sponsor) return res.status(404).json({ message: "Sponsor profile not found" });

    const campaign = await SponsorCampaign.findOne({ _id: campaignId, sponsorId: sponsor._id });
    if (!campaign) return res.status(404).json({ message: "Campaign not found" });

    let isChanged = false;

    if (title !== undefined) {
      if (typeof title !== "string" || title.trim() === "") return res.status(400).json({ message: "Title cannot be empty" });
      campaign.title = title.trim();
      isChanged = true;
    }

    if (budget !== undefined) {
      const parsedBudget = Number(budget);
      if (Number.isNaN(parsedBudget) || parsedBudget <= 0) return res.status(400).json({ message: "Budget must be a positive number" });
      campaign.budget = parsedBudget;
      isChanged = true;
    }

    if (tags !== undefined) {
      let parsedTags = tags;
      if (typeof tags === "string") {
        try {
          parsedTags = JSON.parse(tags);
        } catch {
          parsedTags = tags.split(",").map((t) => t.trim()).filter(Boolean);
        }
      }
      if (!Array.isArray(parsedTags) || parsedTags.length === 0) return res.status(400).json({ message: "At least one tag is required" });
      campaign.tags = parsedTags.map((t) => String(t).trim()).filter(Boolean);
      isChanged = true;
    }

    if (description !== undefined) {
      if (typeof description !== "string" || description.trim() === "") return res.status(400).json({ message: "Description cannot be empty" });
      campaign.description = description.trim();
      isChanged = true;
    }

    if (!isChanged) return res.status(400).json({ message: "At least one field must be updated" });

    await campaign.save();
    return res.status(200).json({ message: "Sponsor campaign updated", campaign });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteSponsorCampaign = async (req, res) => {
  try {
    if (req.user.role !== "sponsor") {
      return res.status(403).json({ message: "Access denied: Only sponsors can delete campaigns" });
    }

    const { campaignId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(campaignId)) return res.status(400).json({ message: "Invalid campaign ID" });

    const sponsor = await Sponsor.findOne({ user: req.user.id });
    if (!sponsor) return res.status(404).json({ message: "Sponsor profile not found" });

    const campaign = await SponsorCampaign.findOne({ _id: campaignId, sponsorId: sponsor._id });
    if (!campaign) return res.status(404).json({ message: "Campaign not found" });

    await SponsorCampaign.deleteOne({ _id: campaignId });

    if (Array.isArray(sponsor.campaigns)) {
      sponsor.campaigns = sponsor.campaigns.filter((cId) => cId.toString() !== campaignId.toString());
      await sponsor.save();
    }

    return res.status(200).json({ message: "Sponsor campaign deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

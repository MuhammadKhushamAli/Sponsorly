import { Creator } from "../models/Creator.model.js";
import { CreatorCampaign } from "../models/CreatorCampaign.model.js";
import mongoose from "mongoose";

export const createCreatorCampaign = async (req, res) => {
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
    if (!ratePerHour) return res.status(400).json({ message: "Rate per hour is required" });
    if (Number.isNaN(parsedRatePerHour) || parsedRatePerHour <= 0) {
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
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateCreatorCampaign = async (req, res) => {
  try {
    if (req.user.role !== "creator") {
      return res.status(403).json({ message: "Access denied: Only creators can update campaigns" });
    }

    const { campaignId } = req.params;
    const { title, ratePerHour, tags, description } = req.body ? req.body : {};

    if (!mongoose.Types.ObjectId.isValid(campaignId)) {
      return res.status(400).json({ message: "Invalid campaign ID" });
    }

    const creator = await Creator.findOne({ user: req.user.id });
    if (!creator) {
      return res.status(404).json({ message: "Creator profile not found" });
    }

    const campaign = await CreatorCampaign.findOne({ _id: campaignId, creatorId: creator._id });
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    let isChanged = false;

    if (title !== undefined) {
      if (typeof title !== "string" || title.trim() === "") {
        return res.status(400).json({ message: "Title cannot be empty" });
      }
      campaign.title = title.trim();
      isChanged = true;
    }

    //if not given keep its last version
    if (ratePerHour !== undefined) {
      const parsedRatePerHour = Number(ratePerHour);
      if (Number.isNaN(parsedRatePerHour) || parsedRatePerHour <= 0) {
        return res.status(400).json({ message: "Rate per hour must be a positive number" });
      }
      campaign.ratePerHour = parsedRatePerHour;
      isChanged = true;
    }

    //if not given, keep it as it is
    if (tags !== undefined) {
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
      campaign.tags = parsedTags.map((tag) => String(tag).trim()).filter(Boolean);
      isChanged = true;
    }

    if (description !== undefined) {
      if (typeof description !== "string" || description.trim() === "") {
        return res.status(400).json({ message: "Description cannot be empty" });
      }
      campaign.description = description.trim();
      isChanged = true;
    }

    if (!isChanged) {
      return res.status(400).json({ message: "At least one field must be updated" });
    }

    await campaign.save();

    return res.status(200).json({ message: "Campaign updated successfully", campaign });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteCreatorCampaign = async (req, res) => {
  try {
    if (req.user.role !== "creator") {
      return res.status(403).json({ message: "Access denied: Only creators can delete campaigns" });
    }

    const { campaignId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(campaignId)) {
      return res.status(400).json({ message: "Invalid campaign ID" });
    }

    const creator = await Creator.findOne({ user: req.user.id });
    if (!creator) {
      return res.status(404).json({ message: "Creator profile not found" });
    }

    const campaign = await CreatorCampaign.findOne({ _id: campaignId, creatorId: creator._id });
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    await CreatorCampaign.deleteOne({ _id: campaignId });

    creator.campaigns = creator.campaigns.filter((cId) => cId.toString() !== campaignId.toString());
    await creator.save();

    return res.status(200).json({ message: "Campaign deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

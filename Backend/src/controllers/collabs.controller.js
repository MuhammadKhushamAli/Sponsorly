import mongoose from "mongoose";
import { Creator } from "../models/Creator.model.js";
import { Sponsor } from "../models/Sponsor.model.js";
import { CreatorCampaign } from "../models/CreatorCampaign.model.js";
import { SponsorCampaign } from "../models/SponsorCampaign.model.js";
import { CreatorRequestCollab } from "../models/CreatorRequestCollab.model.js";
import { SponsorRequestCollab } from "../models/SponsorRequestCollab.model.js";

export const requestCollabAsCreator = async (req, res) => {
  try {
    if (req.user.role !== "creator") {
      return res.status(403).json({ message: "Access denied: Only creators can request collabs as creators" });
    }

    const { sponsorCampaignId } = req.params ? req.params : {};

    if (!sponsorCampaignId || !mongoose.Types.ObjectId.isValid(sponsorCampaignId)) {
      return res.status(400).json({ message: "Valid sponsorCampaignId is required" });
    }

    const creator = await Creator.findOne({ user: req.user.id });
    if (!creator) return res.status(404).json({ message: "Creator profile not found" });

    const campaign = await SponsorCampaign.findById(sponsorCampaignId);
    if (!campaign) return res.status(404).json({ message: "Sponsor campaign not found" });

    const existing = await CreatorRequestCollab.findOne({ sponsorCampaignId, creatorId: creator._id });
    if (existing) {
      return res.status(400).json({ message: "A collab request for this campaign already exists" });
    }

    const collab = await CreatorRequestCollab.create({ sponsorCampaignId, creatorId: creator._id });

    return res.status(201).json({ message: "Collab request created", collab });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const requestCollabAsSponsor = async (req, res) => {
  try {
    if (req.user.role !== "sponsor") {
      return res.status(403).json({ message: "Access denied: Only sponsors can request collabs as sponsors" });
    }

    const { creatorCampaignId } = req.params ? req.params : {};

    if (!creatorCampaignId || !mongoose.Types.ObjectId.isValid(creatorCampaignId)) {
      return res.status(400).json({ message: "Valid creatorCampaignId is required" });
    }

    const sponsor = await Sponsor.findOne({ user: req.user.id });
    if (!sponsor) return res.status(404).json({ message: "Sponsor profile not found" });

    const campaign = await CreatorCampaign.findById(creatorCampaignId);
    if (!campaign) return res.status(404).json({ message: "Creator campaign not found" });

    const existing = await SponsorRequestCollab.findOne({ creatorCampaignId, sponsorId: sponsor._id });
    if (existing) {
      return res.status(400).json({ message: "A collab request for this campaign already exists" });
    }

    const collab = await SponsorRequestCollab.create({ creatorCampaignId, sponsorId: sponsor._id });

    return res.status(201).json({ message: "Collab request created", collab });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

//getting requests for a creator campaign
export const getCreatorCampaignCollabRequests = async (req, res) => {
  try {
    if (req.user.role !== "creator") {
      return res.status(403).json({ message: "Access denied: Only creators can view creator campaign requests" });
    }

    const { creatorCampaignId } = req.params ? req.params : {};

    if (!creatorCampaignId || !mongoose.Types.ObjectId.isValid(creatorCampaignId)) {
      return res.status(400).json({ message: "Valid creatorCampaignId is required" });
    }

    const creator = await Creator.findOne({ user: req.user.id });
    if (!creator) return res.status(404).json({ message: "Creator profile not found" });

    const campaign = await CreatorCampaign.findOne({ _id: creatorCampaignId, creatorId: creator._id });
    if (!campaign) return res.status(404).json({ message: "Creator campaign not found" });

    const requests = await SponsorRequestCollab.find({ creatorCampaignId })
      .populate({
        path: "sponsorId",
        populate: {
          path: "user",
          select: "name email role bio profilePicture_url profilePicture_id",
        },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: requests.length,
      campaign,
      requests,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

//getting requests for a sponsor campaign
export const getSponsorCampaignCollabRequests = async (req, res) => {
  try {
    if (req.user.role !== "sponsor") {
      return res.status(403).json({ message: "Access denied: Only sponsors can view sponsor campaign requests" });
    }

    const { sponsorCampaignId } = req.params ? req.params : {};

    if (!sponsorCampaignId || !mongoose.Types.ObjectId.isValid(sponsorCampaignId)) {
      return res.status(400).json({ message: "Valid sponsorCampaignId is required" });
    }

    const sponsor = await Sponsor.findOne({ user: req.user.id });
    if (!sponsor) return res.status(404).json({ message: "Sponsor profile not found" });

    const campaign = await SponsorCampaign.findById(sponsorCampaignId);
    if (!campaign) return res.status(404).json({ message: "Sponsor campaign not found" });

    const creatorProfile = await Creator.findOne({ _id: campaign.creatorId });
    const sponsorCampaignRequests = await CreatorRequestCollab.find({ sponsorCampaignId })
      .populate({
        path: "creatorId",
        populate: {
          path: "user",
          select: "name email role bio profilePicture_url profilePicture_id",
        },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: sponsorCampaignRequests.length,
      campaign,
      creatorProfile,
      requests: sponsorCampaignRequests,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export default {
  requestCollabAsCreator,
  requestCollabAsSponsor,
  getCreatorCampaignCollabRequests,
  getSponsorCampaignCollabRequests,
};

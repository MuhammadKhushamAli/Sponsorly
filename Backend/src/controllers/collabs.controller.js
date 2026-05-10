import mongoose from "mongoose";
import { Creator } from "../models/Creator.model.js";
import { Sponsor } from "../models/Sponsor.model.js";
import { CreatorCampaign } from "../models/CreatorCampaign.model.js";
import { SponsorCampaign } from "../models/SponsorCampaign.model.js";
import { CreatorRequestCollab } from "../models/CreatorRequestCollab.model.js";
import { SponsorRequestCollab } from "../models/SponsorRequestCollab.model.js";
import { Project } from "../models/Project.model.js";
import { Chat } from "../models/Chat.model.js";

const createProjectForCollab = async ({ payment, creatorProfile, sponsorProfile }) => {
  const project = await Project.create({
    payment,
    status: "working",
  });

  // create a project-scoped chat and link it
  const chat = await Chat.create({
    messages: [],
    projectChat: project._id,
  });

  project.chat = chat._id;
  await project.save();

  if (creatorProfile && Array.isArray(creatorProfile.previousProjects)) {
    creatorProfile.previousProjects.push(project._id);
    // also link chat
    if (Array.isArray(creatorProfile.chats)) creatorProfile.chats.push(chat._id);
    await creatorProfile.save();
  }

  if (sponsorProfile && Array.isArray(sponsorProfile.previousProjects)) {
    sponsorProfile.previousProjects.push(project._id);
    // also link chat
    if (Array.isArray(sponsorProfile.chats)) sponsorProfile.chats.push(chat._id);
    await sponsorProfile.save();
  }

  return project;
};

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

export const acceptSponsorRequestAsCreator = async (req, res) => {
  try {
    if (req.user.role !== "creator") {
      return res.status(403).json({ message: "Access denied: Only creators can accept sponsor requests" });
    }

    const { requestId } = req.params ? req.params : {};

    if (!requestId || !mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({ message: "Valid requestId is required" });
    }

    const creatorProfile = await Creator.findOne({ user: req.user.id });
    if (!creatorProfile) {
      return res.status(404).json({ message: "Creator profile not found" });
    }

    const collabRequest = await SponsorRequestCollab.findById(requestId);
    if (!collabRequest) {
      return res.status(404).json({ message: "Collab request not found" });
    }

    const campaign = await CreatorCampaign.findOne({ _id: collabRequest.creatorCampaignId, creatorId: creatorProfile._id });
    if (!campaign) {
      return res.status(404).json({ message: "Creator campaign not found" });
    }

    if (collabRequest.status !== "pending") {
      return res.status(400).json({ message: "This request has already been processed" });
    }

    const sponsorProfile = await Sponsor.findById(collabRequest.sponsorId);
    if (!sponsorProfile) {
      return res.status(404).json({ message: "Sponsor profile not found" });
    }

    const project = await createProjectForCollab({
      payment: campaign.ratePerHour,
      creatorProfile,
      sponsorProfile,
    });

    collabRequest.status = "accepted";
    collabRequest.project = project._id;
    await collabRequest.save();

    return res.status(200).json({
      message: "Sponsor collab request accepted",
      request: collabRequest,
      project,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const rejectSponsorRequestAsCreator = async (req, res) => {
  try {
    if (req.user.role !== "creator") {
      return res.status(403).json({ message: "Access denied: Only creators can reject sponsor requests" });
    }

    const { requestId } = req.params ? req.params : {};

    if (!requestId || !mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({ message: "Valid requestId is required" });
    }

    const creatorProfile = await Creator.findOne({ user: req.user.id });
    if (!creatorProfile) {
      return res.status(404).json({ message: "Creator profile not found" });
    }

    const collabRequest = await SponsorRequestCollab.findById(requestId);
    if (!collabRequest) {
      return res.status(404).json({ message: "Collab request not found" });
    }

    const campaign = await CreatorCampaign.findOne({ _id: collabRequest.creatorCampaignId, creatorId: creatorProfile._id });
    if (!campaign) {
      return res.status(404).json({ message: "Creator campaign not found" });
    }

    if (collabRequest.status !== "pending") {
      return res.status(400).json({ message: "This request has already been processed" });
    }

    collabRequest.status = "rejected";
    await collabRequest.save();

    return res.status(200).json({ message: "Sponsor collab request rejected", request: collabRequest });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const acceptCreatorRequestAsSponsor = async (req, res) => {
  try {
    if (req.user.role !== "sponsor") {
      return res.status(403).json({ message: "Access denied: Only sponsors can accept creator requests" });
    }

    const { requestId } = req.params ? req.params : {};

    if (!requestId || !mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({ message: "Valid requestId is required" });
    }

    const sponsorProfile = await Sponsor.findOne({ user: req.user.id });
    if (!sponsorProfile) {
      return res.status(404).json({ message: "Sponsor profile not found" });
    }

    const collabRequest = await CreatorRequestCollab.findById(requestId);
    if (!collabRequest) {
      return res.status(404).json({ message: "Collab request not found" });
    }

    const campaign = await SponsorCampaign.findOne({ _id: collabRequest.sponsorCampaignId, sponsorId: sponsorProfile._id });
    if (!campaign) {
      return res.status(404).json({ message: "Sponsor campaign not found" });
    }

    if (collabRequest.status !== "pending") {
      return res.status(400).json({ message: "This request has already been processed" });
    }

    const creatorProfile = await Creator.findById(collabRequest.creatorId);
    if (!creatorProfile) {
      return res.status(404).json({ message: "Creator profile not found" });
    }

    const project = await createProjectForCollab({
      payment: campaign.budget,
      creatorProfile,
      sponsorProfile,
    });

    collabRequest.status = "accepted";
    collabRequest.project = project._id;
    await collabRequest.save();

    return res.status(200).json({
      message: "Creator collab request accepted",
      request: collabRequest,
      project,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const rejectCreatorRequestAsSponsor = async (req, res) => {
  try {
    if (req.user.role !== "sponsor") {
      return res.status(403).json({ message: "Access denied: Only sponsors can reject creator requests" });
    }

    const { requestId } = req.params ? req.params : {};

    if (!requestId || !mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({ message: "Valid requestId is required" });
    }

    const sponsorProfile = await Sponsor.findOne({ user: req.user.id });
    if (!sponsorProfile) {
      return res.status(404).json({ message: "Sponsor profile not found" });
    }

    const collabRequest = await CreatorRequestCollab.findById(requestId);
    if (!collabRequest) {
      return res.status(404).json({ message: "Collab request not found" });
    }

    const campaign = await SponsorCampaign.findOne({ _id: collabRequest.sponsorCampaignId, sponsorId: sponsorProfile._id });
    if (!campaign) {
      return res.status(404).json({ message: "Sponsor campaign not found" });
    }

    if (collabRequest.status !== "pending") {
      return res.status(400).json({ message: "This request has already been processed" });
    }

    collabRequest.status = "rejected";
    await collabRequest.save();

    return res.status(200).json({ message: "Creator collab request rejected", request: collabRequest });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export default {
  requestCollabAsCreator,
  requestCollabAsSponsor,
  getCreatorCampaignCollabRequests,
  getSponsorCampaignCollabRequests,
  acceptSponsorRequestAsCreator,
  rejectSponsorRequestAsCreator,
  acceptCreatorRequestAsSponsor,
  rejectCreatorRequestAsSponsor,
};

import mongoose from "mongoose";
import { Review } from "../models/Review.model.js";
import { User } from "../models/User.model.js";
import { Creator } from "../models/Creator.model.js";
import { Sponsor } from "../models/Sponsor.model.js";
import { Project } from "../models/Project.model.js";

const getUserProfile = async (userId, role) => {
  if (role === "creator") {
    return Creator.findOne({ user: userId });
  }

  if (role === "sponsor") {
    return Sponsor.findOne({ user: userId });
  }

  return null;
};

export const createReview = async (req, res) => {
  try {
    const { revieweeId } = req.params ? req.params : {};
    const { rating, comment } = req.body ? req.body : {};

    if (!revieweeId || !mongoose.Types.ObjectId.isValid(revieweeId)) {
      return res.status(400).json({ message: "Valid revieweeId is required" });
    }

    if (req.user.id === revieweeId) {
      return res.status(400).json({ message: "You cannot review yourself" });
    }

    if (rating === undefined || rating === null || Number.isNaN(Number(rating))) {
      return res.status(400).json({ message: "Valid rating is required" });
    }

    const reviewer = await User.findById(req.user.id);
    if (!reviewer) {
      return res.status(404).json({ message: "Reviewer not found" });
    }

    const reviewee = await User.findById(revieweeId);
    if (!reviewee) {
      return res.status(404).json({ message: "Reviewee not found" });
    }

    const reviewerProfile = await getUserProfile(reviewer._id, reviewer.role);
    const revieweeProfile = await getUserProfile(reviewee._id, reviewee.role);

    if (!reviewerProfile || !revieweeProfile) {
      return res.status(404).json({ message: "Profile not found for reviewer or reviewee" });
    }

    const reviewerProjectIds = (reviewerProfile.previousProjects || []).map((id) => id.toString());
    const revieweeProjectIds = (revieweeProfile.previousProjects || []).map((id) => id.toString());

    const reviewerProjectIdSet = new Set(reviewerProjectIds);
    const sharedProjectIds = revieweeProjectIds.filter((id) => reviewerProjectIdSet.has(id));

    if (sharedProjectIds.length === 0) {
      return res.status(403).json({
        message: "Reviewer must share at least one completed or cancelled project with reviewee",
      });
    }

    const eligibleSharedProject = await Project.exists({
      _id: { $in: sharedProjectIds },
      status: { $in: ["completed", "cancelled"] },
    });

    if (!eligibleSharedProject) {
      return res.status(403).json({
        message: "No shared completed/cancelled project found between reviewer and reviewee",
      });
    }

    const review = await Review.create({
      reviewerId: reviewer._id,
      revieweeId: reviewee._id,
      rating: Number(rating),
      comment: comment || "",
    });

    if (reviewee.role === "creator") {
      revieweeProfile.reviews = revieweeProfile.reviews || [];
      revieweeProfile.reviews.push(review._id);
      await revieweeProfile.save();
    } else if (reviewee.role === "sponsor") {
      revieweeProfile.ratings = revieweeProfile.ratings || [];
      revieweeProfile.ratings.push(review._id);
      await revieweeProfile.save();
    }

    return res.status(201).json({
      message: "Review created successfully",
      review,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export default {
  createReview,
};

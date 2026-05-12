import mongoose from "mongoose";
import { Review } from "../models/Review.model.js";
import { User } from "../models/User.model.js";
import { Creator } from "../models/Creator.model.js";
import { Sponsor } from "../models/Sponsor.model.js";
import { Project } from "../models/Project.model.js";

// ── Private helpers ──────────────────────────────────────────────────────────
const getUserProfile = async (userId, role) => {
  if (role === "creator") return Creator.findOne({ user: userId });
  if (role === "sponsor") return Sponsor.findOne({ user: userId });
  return null;
};

const updateProfileRating = async (profile, role) => {
  const reviewIds = role === "creator" ? profile.reviews || [] : profile.ratings || [];
  if (reviewIds.length === 0) {
    profile.rating = role === "creator" ? mongoose.Types.Decimal128.fromString("0") : 0;
    return profile;
  }
  const reviews = await Review.find({ _id: { $in: reviewIds } }).select("rating");
  const total = reviews.reduce((sum, item) => sum + Number(item.rating), 0);
  const average = total / reviews.length;
  profile.rating = role === "creator"
    ? mongoose.Types.Decimal128.fromString(average.toFixed(2))
    : average;
  return profile;
};

// ── GET /reviews/user/:userId  (public) ──────────────────────────────────────
export const getReviewsForUser = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Valid userId is required" });
    }
    const reviews = await Review.find({ revieweeId: userId })
      .populate("reviewerId", "name email role profilePicture_url")
      .sort({ createdAt: -1 });
    const total = reviews.length;
    const average = total > 0
      ? (reviews.reduce((sum, r) => sum + Number(r.rating), 0) / total).toFixed(1)
      : "0.0";
    return res.status(200).json({ reviews, total, average });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ── GET /reviews/my-reviews  (auth) ─────────────────────────────────────────
export const getMyReceivedReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ revieweeId: req.user.id })
      .populate("reviewerId", "name email role profilePicture_url")
      .sort({ createdAt: -1 });
    const total = reviews.length;
    const average = total > 0
      ? (reviews.reduce((sum, r) => sum + Number(r.rating), 0) / total).toFixed(1)
      : "0.0";
    return res.status(200).json({ reviews, total, average });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ── POST /reviews/:revieweeId ────────────────────────────────────────────────
export const createReview = async (req, res) => {
  try {
    const { revieweeId } = req.params ?? {};
    const { rating, comment } = req.body ?? {};

    if (!revieweeId || !mongoose.Types.ObjectId.isValid(revieweeId))
      return res.status(400).json({ message: "Valid revieweeId is required" });

    if (req.user.id === revieweeId)
      return res.status(400).json({ message: "You cannot review yourself" });

    if (rating === undefined || rating === null || Number.isNaN(Number(rating)))
      return res.status(400).json({ message: "Valid rating is required" });

    const reviewer = await User.findById(req.user.id);
    if (!reviewer) return res.status(404).json({ message: "Reviewer not found" });

    const reviewee = await User.findById(revieweeId);
    if (!reviewee) return res.status(404).json({ message: "Reviewee not found" });

    const reviewerProfile = await getUserProfile(reviewer._id, reviewer.role);
    const revieweeProfile = await getUserProfile(reviewee._id, reviewee.role);

    if (!reviewerProfile || !revieweeProfile)
      return res.status(404).json({ message: "Profile not found for reviewer or reviewee" });

    const reviewerProjectIds = (reviewerProfile.previousProjects || []).map((id) => id.toString());
    const revieweeProjectIds = (revieweeProfile.previousProjects || []).map((id) => id.toString());
    const sharedProjectIds = revieweeProjectIds.filter((id) => new Set(reviewerProjectIds).has(id));

    if (sharedProjectIds.length === 0)
      return res.status(403).json({
        message: "Reviewer must share at least one completed or cancelled project with reviewee",
      });

    const eligibleSharedProject = await Project.exists({
      _id: { $in: sharedProjectIds },
      status: { $in: ["completed", "cancelled"] },
    });

    if (!eligibleSharedProject)
      return res.status(403).json({
        message: "No shared completed/cancelled project found between reviewer and reviewee",
      });

    const review = await Review.create({
      reviewerId: reviewer._id,
      revieweeId: reviewee._id,
      rating: Number(rating),
      comment: comment || "",
    });

    if (reviewee.role === "creator") {
      revieweeProfile.reviews = revieweeProfile.reviews || [];
      revieweeProfile.reviews.push(review._id);
    } else if (reviewee.role === "sponsor") {
      revieweeProfile.ratings = revieweeProfile.ratings || [];
      revieweeProfile.ratings.push(review._id);
    }

    await updateProfileRating(revieweeProfile, reviewee.role);
    await revieweeProfile.save();

    return res.status(201).json({ message: "Review created successfully", review });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ── DELETE /reviews/:reviewId ────────────────────────────────────────────────
export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params ?? {};

    if (!reviewId || !mongoose.Types.ObjectId.isValid(reviewId))
      return res.status(400).json({ message: "Valid reviewId is required" });

    const review = await Review.findById(reviewId);
    if (!review) return res.status(404).json({ message: "Review not found" });

    if (review.reviewerId.toString() !== req.user.id)
      return res.status(403).json({ message: "You can only delete your own review" });

    const reviewee = await User.findById(review.revieweeId);
    if (reviewee) {
      const revieweeProfile = await getUserProfile(reviewee._id, reviewee.role);
      if (revieweeProfile) {
        if (reviewee.role === "creator" && Array.isArray(revieweeProfile.reviews)) {
          revieweeProfile.reviews = revieweeProfile.reviews.filter(
            (id) => id.toString() !== review._id.toString()
          );
        } else if (reviewee.role === "sponsor" && Array.isArray(revieweeProfile.ratings)) {
          revieweeProfile.ratings = revieweeProfile.ratings.filter(
            (id) => id.toString() !== review._id.toString()
          );
        }
        await updateProfileRating(revieweeProfile, reviewee.role);
        await revieweeProfile.save();
      }
    }

    await Review.findByIdAndDelete(reviewId);
    return res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export default { getReviewsForUser, getMyReceivedReviews, createReview, deleteReview };

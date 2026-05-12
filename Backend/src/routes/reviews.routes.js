import express from "express";
import { verifyToken } from "../middlewares/verifytoken.js";
import {
  getReviewsForUser,
  getMyReceivedReviews,
  createReview,
  deleteReview,
} from "../controllers/reviews.controller.js";

const router = express.Router();

// Public — fetch all reviews for any user
router.get("/user/:userId", getReviewsForUser);
// Auth — fetch reviews received by logged-in user (for dashboard)
router.get("/my-reviews", verifyToken, getMyReceivedReviews);
// Auth — create a review
router.post("/:revieweeId", verifyToken, createReview);
// Auth — delete own review
router.delete("/:reviewId", verifyToken, deleteReview);

export default router;

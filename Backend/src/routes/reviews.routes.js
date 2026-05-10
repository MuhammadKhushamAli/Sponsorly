import express from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import { createReview, deleteReview } from "../controllers/reviews.controller.js";

const router = express.Router();

router.post("/:revieweeId", verifyToken, createReview);
router.delete("/:reviewId", verifyToken, deleteReview);

export default router;

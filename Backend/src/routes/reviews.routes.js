import express from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import { createReview } from "../controllers/reviews.controller.js";

const router = express.Router();

router.post("/:revieweeId", verifyToken, createReview);

export default router;

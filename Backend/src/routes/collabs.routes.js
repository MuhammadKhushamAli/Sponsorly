import express from "express";
import { requestCollabAsCreator, requestCollabAsSponsor } from "../controllers/collabs.controller.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = express.Router();

// Creator requests to collaborate on a Sponsor campaign
router.post("/creator-requests/:sponsorCampaignId", verifyToken, requestCollabAsCreator);

// Sponsor requests to collaborate on a Creator campaign
router.post("/sponsor-requests/:creatorCampaignId", verifyToken, requestCollabAsSponsor);

export default router;

import express from "express";
import {requestCollabAsCreator, requestCollabAsSponsor, getCreatorCampaignCollabRequests, getSponsorCampaignCollabRequests,} from "../controllers/collabs.controller.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = express.Router();

// Creator requests to collaborate on a Sponsor campaign
router.post("/creator-requests/:sponsorCampaignId", verifyToken, requestCollabAsCreator);
router.get("/creator/get-requests/:creatorCampaignId", verifyToken, getCreatorCampaignCollabRequests);

// Sponsor requests to collaborate on a Creator campaign
router.post("/sponsor-requests/:creatorCampaignId", verifyToken, requestCollabAsSponsor);
router.get("/sponsor/get-requests/:sponsorCampaignId", verifyToken, getSponsorCampaignCollabRequests);

export default router;

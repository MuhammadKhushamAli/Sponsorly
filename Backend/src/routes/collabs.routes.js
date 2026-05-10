import express from "express";
import {
	requestCollabAsCreator,
	requestCollabAsSponsor,
	getCreatorCampaignCollabRequests,
	getSponsorCampaignCollabRequests,
	acceptSponsorRequestAsCreator,
	rejectSponsorRequestAsCreator,
	acceptCreatorRequestAsSponsor,
	rejectCreatorRequestAsSponsor,
} from "../controllers/collabs.controller.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = express.Router();

router.post("/creator-requests/:sponsorCampaignId", verifyToken, requestCollabAsCreator);
router.get("/creator/get-requests/:creatorCampaignId", verifyToken, getCreatorCampaignCollabRequests);
router.post("/creator-requests/:requestId/accept", verifyToken, acceptCreatorRequestAsSponsor);
router.post("/creator-requests/:requestId/reject", verifyToken, rejectCreatorRequestAsSponsor);
router.post("/sponsor-requests/:creatorCampaignId", verifyToken, requestCollabAsSponsor);
router.get("/sponsor/get-requests/:sponsorCampaignId", verifyToken, getSponsorCampaignCollabRequests);
router.post("/sponsor-requests/:requestId/accept", verifyToken, acceptSponsorRequestAsCreator);
router.post("/sponsor-requests/:requestId/reject", verifyToken, rejectSponsorRequestAsCreator);

export default router;

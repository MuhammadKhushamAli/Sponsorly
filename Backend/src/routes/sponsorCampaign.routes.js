import express from "express";
import { createSponsorCampaign, updateSponsorCampaign, deleteSponsorCampaign } from "../controllers/sponsorCampaign.controller.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = express.Router();

router.post("/create", verifyToken, createSponsorCampaign);
router.patch("/update/:campaignId", verifyToken, updateSponsorCampaign);
router.delete("/delete/:campaignId", verifyToken, deleteSponsorCampaign);

export default router;

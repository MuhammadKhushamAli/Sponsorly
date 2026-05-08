import express from "express";
import { createCampaign, updateCampaign, deleteCampaign } from "../controllers/creatorCampaign.controller.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = express.Router();

router.post("/create", verifyToken, createCampaign);
router.patch("/update/:campaignId", verifyToken, updateCampaign);
router.delete("/delete/:campaignId", verifyToken, deleteCampaign);

export default router;

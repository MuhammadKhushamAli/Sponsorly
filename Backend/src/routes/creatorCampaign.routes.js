import express from "express";
import { createCreatorCampaign, updateCreatorCampaign, deleteCreatorCampaign } from "../controllers/creatorCampaign.controller.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = express.Router();

router.post("/create", verifyToken, createCreatorCampaign);
router.patch("/update/:campaignId", verifyToken, updateCreatorCampaign);
router.delete("/delete/:campaignId", verifyToken, deleteCreatorCampaign);

export default router;

import express from "express";
import { findCreatorCampaigns, createCreatorCampaign, updateCreatorCampaign, deleteCreatorCampaign } from "../controllers/creatorCampaign.controller.js";
import { verifyToken } from "../middlewares/verifytoken.js";

const router = express.Router();

router.get("/find", findCreatorCampaigns);
router.post("/create", verifyToken, createCreatorCampaign);
router.patch("/update/:campaignId", verifyToken, updateCreatorCampaign);
router.delete("/delete/:campaignId", verifyToken, deleteCreatorCampaign);

export default router;

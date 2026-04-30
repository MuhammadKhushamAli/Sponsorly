import express from "express";
import {getCreatorsByNiche, creatorDashboard, updateCreatorProfile} from "../controllers/creators.controller.js";
import {verifyToken} from "../middlewares/verifyToken.js";
import upload from '../config/multerConfig.js'

const router = express.Router();

router.get("/niche/:niche", getCreatorsByNiche);
router.get("/dashboard", verifyToken, creatorDashboard);
router.post("/update-profile", verifyToken, upload.single("profileImage"), updateCreatorProfile);

export default router;
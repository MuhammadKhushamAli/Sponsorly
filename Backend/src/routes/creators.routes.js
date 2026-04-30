import express from "express";
import {getCreatorsByNiche, creatorDashboard, completeCreatorProfile} from "../controllers/creators.controller.js";
import {verifyToken} from "../middlewares/verifyToken.js";
import upload from '../config/multerConfig.js'

const router = express.Router();

router.get("/niche/:niche", getCreatorsByNiche);
router.get("/dashboard", verifyToken, creatorDashboard);
router.post("/complete-profile", verifyToken, upload.single("profileImage"), completeCreatorProfile);

export default router;
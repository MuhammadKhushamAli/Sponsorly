import express from "express";
import { getCreators, getCreatorActivity, creatorDashboard, updateCreatorProfile } from "../controllers/creators.controller.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import upload from '../config/multerConfig.js';

const router = express.Router();

router.get("/", getCreators);
router.get("/dashboard", verifyToken, creatorDashboard);
router.get("/activity", verifyToken, getCreatorActivity);
router.post("/update-profile", verifyToken, upload.single("profileImage"), updateCreatorProfile);

export default router;
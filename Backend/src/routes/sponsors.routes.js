import express from "express";
import {getSponsorsByIndustries, sponsorDashboard, updateSponsorProfile} from "../controllers/sponsors.controller.js";
import {verifyToken} from "../middlewares/verifyToken.js";
import upload from "../config/multerConfig.js";

const router = express.Router();

router.get("/industries/:industries", verifyToken, getSponsorsByIndustries);
router.get("/dashboard", verifyToken, sponsorDashboard);
router.post("/update-profile", verifyToken, upload.single("profileImage"), updateSponsorProfile);

export default router;
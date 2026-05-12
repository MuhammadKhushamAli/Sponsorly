import express from "express";
import { getSponsorsByIndustries, getSponsorActivity, sponsorDashboard, updateSponsorProfile } from "../controllers/sponsors.controller.js";
import { verifyToken } from "../middlewares/verifytoken.js";
import upload from "../config/multerConfig.js";

const router = express.Router();

router.get("/industries/:industries", verifyToken, getSponsorsByIndustries);
router.get("/dashboard", verifyToken, sponsorDashboard);
router.get("/activity", verifyToken, getSponsorActivity);
router.post("/update-profile", verifyToken, upload.single("profileImage"), updateSponsorProfile);

export default router;

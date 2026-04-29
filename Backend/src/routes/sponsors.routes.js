import express from "express";
import {getSponsorsByIndustries, sponsorDashboard} from "../controllers/sponsors.controller.js";
import {verifyToken} from "../middlewares/verifyToken.js";

const router = express.Router();

router.get("/industries/:industries", verifyToken, getSponsorsByIndustries);
router.get("/dashboard", verifyToken, sponsorDashboard);

export default router;
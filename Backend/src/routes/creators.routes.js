import express from "express";
import {getCreatorsByNiche, creatorDashboard} from "../controllers/creators.controller.js";
import {verifyToken} from "../middlewares/verifyToken.js";

const router = express.Router();

router.get("/niche/:niche", getCreatorsByNiche);
router.get("/dashboard", verifyToken, creatorDashboard);

export default router;
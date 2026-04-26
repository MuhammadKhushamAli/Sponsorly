import express from "express";
import {getSponsorsByIndustries} from "../controllers/sponsors.controller.js";
import {verifyToken} from "../middlewares/verifyToken.js";

const router = express.Router();

router.get("/industries/:industries", verifyToken, getSponsorsByIndustries);

export default router;
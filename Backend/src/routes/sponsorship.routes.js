import express from "express";
import {getSponsorsByIndustries} from "../controllers/sponsorship.controller.js";
import {verifyToken} from "../middlewares/verifyToken.js";

const router = express.Router();

router.get("/sponsors/industries/:industries", verifyToken, getSponsorsByIndustries);

export default router;
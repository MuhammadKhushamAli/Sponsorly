import express from "express";
import {getCreatorsByNiche} from "../controllers/creators.controller.js";

const router = express.Router();

router.get("/niche/:niche", getCreatorsByNiche);

export default router;
import express from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import { createDirectChat } from "../controllers/chat.controller.js";

const router = express.Router();

router.post("/create/:otherUserId", verifyToken, createDirectChat);

export default router;

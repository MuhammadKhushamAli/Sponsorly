import express from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import { interactWithAgent, clearChatHistory } from "../controllers/agent.controller.js";

const router = express.Router();

router.post("/chat", verifyToken, interactWithAgent);

router.delete("/history", verifyToken, clearChatHistory);

export default router;

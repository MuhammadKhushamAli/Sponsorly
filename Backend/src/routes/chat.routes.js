import express from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import {
  getMyChats,
  getChatById,
  createDirectChat,
  addMessageToDirectChat,
  addMessageToProjectChat,
} from "../controllers/chat.controller.js";

const router = express.Router();

router.get("/my-chats", verifyToken, getMyChats);
router.get("/:chatId", verifyToken, getChatById);
router.post("/create/:otherUserId", verifyToken, createDirectChat);
router.post("/:chatId/message", verifyToken, addMessageToDirectChat);
router.post("/project/:projectId/message", verifyToken, addMessageToProjectChat);

export default router;


import mongoose from "mongoose";
import { Chat } from "../models/Chat.model.js";
import { User } from "../models/User.model.js";

export const createDirectChat = async (req, res) => {
  try {
    const { otherUserId } = req.params ? req.params : {};

    if (!otherUserId || !mongoose.Types.ObjectId.isValid(otherUserId)) {
      return res.status(400).json({ message: "Valid otherUserId is required" });
    }

    if (req.user.id === otherUserId) {
      return res.status(400).json({ message: "You cannot start a chat with yourself" });
    }

    const currentUser = await User.findById(req.user.id);
    if (!currentUser) {
      return res.status(404).json({ message: "Current user not found" });
    }

    const otherUser = await User.findById(otherUserId);
    if (!otherUser) {
      return res.status(404).json({ message: "Other user not found" });
    }

    const existingChatId = currentUser.chats.find((chatId) =>
      otherUser.chats.some((otherChatId) => otherChatId.toString() === chatId.toString())
    );

    if (existingChatId) {
      const chat = await Chat.findById(existingChatId);
      if (chat) {
        return res.status(200).json({
          message: "Chat already exists",
          chat,
        });
      }
    }

    const chat = await Chat.create({
      messages: [],
      projectChat: null,
    });

    currentUser.chats.push(chat._id);
    otherUser.chats.push(chat._id);

    await currentUser.save();
    await otherUser.save();

    return res.status(201).json({
      message: "Chat created successfully",
      chat,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export default {
  createDirectChat,
};

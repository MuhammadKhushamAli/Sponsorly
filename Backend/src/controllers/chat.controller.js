import mongoose from "mongoose";
import { Chat } from "../models/Chat.model.js";
import { Project } from "../models/Project.model.js";
import { User } from "../models/User.model.js";
import { CreatorRequestCollab } from "../models/CreatorRequestCollab.model.js";
import { SponsorRequestCollab } from "../models/SponsorRequestCollab.model.js";
import { CreatorCampaign } from "../models/CreatorCampaign.model.js";
import { SponsorCampaign } from "../models/SponsorCampaign.model.js";
import { Creator } from "../models/Creator.model.js";
import { Sponsor } from "../models/Sponsor.model.js";

// ── NEW: list all chats the current user belongs to ──────────────────────────
export const getMyChats = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id).populate({
      path: "chats",
      populate: { path: "projectChat", select: "status payment" },
    });

    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // For each chat, find the other participant(s) by cross-referencing User.chats
    const chatsWithMeta = await Promise.all(
      (currentUser.chats || []).map(async (chat) => {
        // Find the other user who also has this chat id
        const otherUser = await User.findOne({
          _id: { $ne: req.user.id },
          chats: chat._id,
        }).select("name email role profilePicture_url");

        const lastMsg = chat.messages?.[chat.messages.length - 1] || null;

        return {
          _id: chat._id,
          isProjectChat: !!chat.projectChat,
          projectChat: chat.projectChat || null,
          otherUser: otherUser || null,
          lastMessage: lastMsg?.content || "",
          lastMessageAt: lastMsg?.sentAt || chat.createdAt,
          unread: 0, // real-time unread tracking requires sockets — placeholder
          messageCount: chat.messages?.length || 0,
        };
      })
    );

    // Sort by most recent message first
    chatsWithMeta.sort(
      (a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt)
    );

    return res.status(200).json({ chats: chatsWithMeta });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ── NEW: get a single chat with paginated messages ───────────────────────────
export const getChatById = async (req, res) => {
  try {
    const { chatId } = req.params;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 30);

    if (!chatId || !mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({ message: "Valid chatId is required" });
    }

    const currentUser = await User.findById(req.user.id);
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const belongsToChat = currentUser.chats.some(
      (id) => id.toString() === chatId
    );
    if (!belongsToChat) {
      return res.status(403).json({ message: "You are not part of this chat" });
    }

    const chat = await Chat.findById(chatId).populate({
      path: "projectChat",
      select: "status payment",
    });
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Paginate messages — newest pages returned in ascending order for display
    const totalMessages = chat.messages.length;
    const totalPages = Math.ceil(totalMessages / limit);
    const start = Math.max(0, totalMessages - page * limit);
    const end = totalMessages - (page - 1) * limit;
    const messages = chat.messages.slice(start, end);

    return res.status(200).json({
      chatId: chat._id,
      isProjectChat: !!chat.projectChat,
      projectChat: chat.projectChat || null,
      messages,
      pagination: {
        page,
        limit,
        totalMessages,
        totalPages,
        hasMore: page < totalPages,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

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

export const addMessageToDirectChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { content } = req.body;

    // Validate inputs
    if (!chatId || !mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({ message: "Valid chatId is required" });
    }

    if (!content || typeof content !== "string" || content.trim() === "") {
      return res.status(400).json({ message: "Message content is required" });
    }

    // Find the chat
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Get current user
    const currentUser = await User.findById(req.user.id);
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user has chat reference
    const belongsToChat = currentUser.chats.some(
      (id) => id.toString() === chatId
    );

    if (!belongsToChat) {
      return res.status(403).json({ message: "You are not part of this chat" });
    }

    // Add the message
    const message = {
      senderId: req.user.id,
      content: content.trim(),
      sentAt: new Date(),
    };

    chat.messages.push(message);
    await chat.save();

    return res.status(201).json({
      message: "Message sent successfully",
      chatType: "direct",
      chat,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const addMessageToProjectChat = async (req, res) => {
  try {
    const { projectId } = req.params ? req.params : {};
    const { content } = req.body ? req.body : {};

    // Validate inputs
    if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: "Valid projectId is required" });
    }

    if (!content || typeof content !== "string" || content.trim() === "") {
      return res.status(400).json({ message: "Message content is required" });
    }

    // Get current user
    const currentUser = await User.findById(req.user.id);
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the project and its chat
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (!project.chat) {
      return res.status(404).json({ message: "No chat associated with this project" });
    }

    const chat = await Chat.findById(project.chat);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    let isValidUser;

    if (req.user.role === "creator") {
      isValidUser = await Creator.findOne({
        user: req.user.id,
        previousProjects: { $in: [projectId] },
      });
    } else if (req.user.role === "sponsor") {
      isValidUser = await Sponsor.findOne({
        user: req.user.id,
        previousProjects: { $in: [projectId] },
      });
    }

    if (!isValidUser) {
      return res.status(403).json({ message: "You are not involved in this project" });
    }

    // Add the message
    const message = {
      senderId: req.user.id,
      content: content.trim(),
      sentAt: new Date(),
    };

    chat.messages.push(message);
    await chat.save();

    return res.status(201).json({
      message: "Message sent successfully",
      chatType: "project",
      chat,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export default {
  getMyChats,
  getChatById,
  createDirectChat,
  addMessageToDirectChat,
  addMessageToProjectChat,
};



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
  createDirectChat,
  addMessageToDirectChat,
  addMessageToProjectChat,
};

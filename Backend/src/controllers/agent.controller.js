import { Creator } from "../models/Creator.model.js";
import { Sponsor } from "../models/Sponsor.model.js";
import { User } from "../models/User.model.js";
import dotenv from "dotenv";
dotenv.config();

const AI_SERVER_URL = process.env.AI_SERVER_URL || "http://localhost:8000";

export const interactWithAgent = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || message.trim() === "") {
      return res.status(400).json({ message: "Message is required" });
    }

    const userId = req.user?.id;
    const user = await User.findById(userId).select(
      "name email role prevChatBotHistoryID"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    let tags = [];
    if (user.role === "creator") {
      const creator = await Creator.findOne({user: user?._id})
      .select(
        "niche"
      );
      tags = creator.niche;
    } else if (user.role === "sponsor") {
      const sponsor = await Sponsor.findOne({user: userId})
      .select(
        "industries"
      );
      tags = sponsor.industries;
    }
    const payload = {
      message: {
        message: message.trim()
      },
      context: {
        user_name: user.name,
        user_email: user.email,
        user_role: user.role,
        user_tags: tags,
      },
    };

    const queryParams = {
      prev_history_id: user.prevChatBotHistoryID,
    }

    const filteredParams = Object.fromEntries(
      Object.entries(queryParams).filter(([_, v]) => v != null)
    );

    const queryStr = new URLSearchParams(filteredParams).toString();

    const fastapiResponse = await fetch(`${AI_SERVER_URL}/chat_bot_interaction?${queryStr}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!fastapiResponse.ok) {
      const errorText = await fastapiResponse.text();
      return res.status(502).json({
        message: "AI server error",
        details: errorText,
      });
    }

    const aiData = await fastapiResponse.json();

    if (aiData.history_id) {
      await User.findByIdAndUpdate(userId, {
        prevChatBotHistoryID: aiData.history_id,
      });
    }

    return res.status(200).json({
      reply: aiData.response || "",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export const clearChatHistory = async (req, res) => {
  try {
    const userId = req.user?.id;

    await User.findByIdAndUpdate(userId, {
      prevChatBotHistoryID: null,
    });

    return res.status(200).json({
      message: "Chat history cleared successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

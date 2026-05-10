import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    messages: [
      {
        senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        content: { type: String, required: true },
        sentAt: { type: Date, default: Date.now },
      },
    ],
    projectChat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
    },
  },
  {
    timestamps: true,
  }
);

export const Chat = mongoose.model("Chat", chatSchema);

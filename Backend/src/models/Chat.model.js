import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    messages: [
      {
        type: String,
      },
    ],
    projectChat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export const Chat = mongoose.model("Chat", chatSchema);

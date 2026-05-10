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
    // Exactly one creator and one sponsor should participate in each chat.
    // The validator rejects empty, partial, or oversized participant lists.
    participants: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      required: [true, "Participants are required"],
      validate: {
        validator: function (value) {
          return Array.isArray(value) && value.length === 2;
        },
        message: "Chat must have exactly 2 participants",
      },
    },
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

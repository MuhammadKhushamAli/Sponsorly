import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    role: {
      type: String,
      enum: ["creator", "sponsor"],
      required: true,
    },
    prevChatBotHistoryID: {
      type: String,
      default: null
    },
    refreshToken: {
      type: String,
    },
    chats: [
      {
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Chat",
      },
    ],
    shortlistedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    location: {
      type: String,
      trim: true,
    },
    profileCompleted: {
      type: Boolean,
      default: false,
    },
    bio: {
      type: String,
      trim: true,
      default: "",
    },
    profilePicture_url: {
      type: String,
      trim: true,
      default: "",
    },
    profilePicture_id: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model("User", userSchema);

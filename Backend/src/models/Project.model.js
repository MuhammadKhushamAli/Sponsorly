import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    sponser: {
      type: String,
      required: [true, "Sponser is required"],
      trim: true,
    },
    payment: {
      type: Number,
      required: [true, "Payment is required"],
    },
    status: {
      type: String,
      required: [true, "Status is required"],
      trim: true,
    },
    creator: {
      type: String,
      required: [true, "Creator is required"],
      trim: true,
    },
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
    },
  },
  {
    timestamps: true,
  }
);

export const Project = mongoose.model("Project", projectSchema);

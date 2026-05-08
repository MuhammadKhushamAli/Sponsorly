import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    payment: {
      type: Number,
      required: [true, "Payment is required"],
    },
    status: {
      type: String,
      enum: ["working", "completed", "cancelled"],
      default: "working",
      required: [true, "Status is required"],
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

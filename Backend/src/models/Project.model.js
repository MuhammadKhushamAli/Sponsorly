import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    payment: {
      type: Number,
      required: [true, "Payment is required"],
    },
    status: {
      type: String,
      required: [true, "Status is required"],
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

import mongoose from "mongoose";

const creatorCampaignSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    ratePerHour: {
      type: Number,
      required: [true, "Rate per hour is required"],
    },
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Creator",
      required: [true, "Creator ID is required"],
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const CreatorCampaign = mongoose.model(
  "CreatorCampaign",
  creatorCampaignSchema
);

import mongoose from "mongoose";

const sponserCampaignSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    budget: {
      type: Number,
      required: [true, "Budget is required"],
    },
    sponserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sponser",
      required: [true, "Sponser ID is required"],
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

export const SponserCampaign = mongoose.model("SponserCampaign", sponserCampaignSchema);

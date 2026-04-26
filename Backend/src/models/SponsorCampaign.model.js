import mongoose from "mongoose";

const sponsorCampaignSchema = new mongoose.Schema(
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
    sponsorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sponsor",
      required: [true, "Sponsor ID is required"],
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

export const SponsorCampaign = mongoose.model("SponsorCampaign", sponsorCampaignSchema);

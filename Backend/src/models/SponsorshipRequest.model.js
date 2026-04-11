import mongoose from "mongoose";

const sponsorshipRequestSchema = new mongoose.Schema(
  {
    creatorCampaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CreatorCampaign",
      required: [true, "Creator Campaign ID is required"],
    },
    sponserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sponser",
      required: [true, "Sponser ID is required"],
    },
    status: {
      type: String,
      required: [true, "Status is required"],
      trim: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
    },
  },
  {
    timestamps: true,
  }
);

export const SponsorshipRequest = mongoose.model("SponsorshipRequest", sponsorshipRequestSchema);

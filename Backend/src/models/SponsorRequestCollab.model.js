import mongoose from "mongoose";

const sponsorRequestCollabSchema = new mongoose.Schema(
  {
    creatorCampaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CreatorCampaign",
      required: [true, "Creator Campaign ID is required"],
    },
    sponsorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sponsor",
      required: [true, "Sponsor ID is required"],
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
      required: [true, "Status is required"],
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

export const SponsorRequestCollab = mongoose.model("SponsorRequestCollab", sponsorRequestCollabSchema);

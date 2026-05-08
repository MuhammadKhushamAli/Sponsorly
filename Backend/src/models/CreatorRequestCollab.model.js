import mongoose from "mongoose";

const CreatorRequestCollabSchema = new mongoose.Schema(
  {
    sponsorCampaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SponsorCampaign",
      required: [true, "Sponsor Campaign ID is required"],
    },
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Creator",
      required: [true, "Creator ID is required"],
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

export const CreatorRequestCollab = mongoose.model("CreatorRequestCollab", CreatorRequestCollabSchema);

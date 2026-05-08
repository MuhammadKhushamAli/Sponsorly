import mongoose from "mongoose";

const creatorRequestCollabSchema = new mongoose.Schema(
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

export const CreatorCollabRequest = mongoose.model("CreatorCollabRequest", creatorRequestCollabSchema);

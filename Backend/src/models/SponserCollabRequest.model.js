import mongoose from "mongoose";

const sponserCollabRequestSchema = new mongoose.Schema(
  {
    sponserCampaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SponserCampaign",
      required: [true, "Sponser Campaign ID is required"],
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

export const SponserCollabRequest = mongoose.model("SponserCollabRequest", sponserCollabRequestSchema);

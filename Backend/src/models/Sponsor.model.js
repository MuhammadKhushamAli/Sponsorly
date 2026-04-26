import mongoose from "mongoose";

const sponsorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
    },
    previousProjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
      },
    ],
    ratings: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
    industries: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

export const Sponsor = mongoose.model("Sponsor", sponsorSchema);

import mongoose from "mongoose";

const creatorSchema = new mongoose.Schema(
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
    experienceInYears: [
      {
        type: Number,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Creator = mongoose.model("Creator", creatorSchema);

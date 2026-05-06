import mongoose from "mongoose";

const creatorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
    },
    campaigns: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CreatorCampaign",
      },
    ],
    previousProjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
      },
    ],
    rating: {
      type: mongoose.Types.Decimal128,
      default: 0,
      min: 0,
      max: 5,
    },
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
      }
    ],

    niche: [
      {
        type: String,
        trim: true,
      },
    ],

    links: {
      type: [
        {
          platform: {
            type: String,
            trim: true,
          },
          url: {
            type: String,
            trim: true,
          },
        },
      ],
      default: [],
    },

    followersCount: {
      type: Number,
      min: 0,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const Creator = mongoose.model("Creator", creatorSchema);
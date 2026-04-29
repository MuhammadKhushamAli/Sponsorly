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
        review: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Review",
        },
        rating: {
          type: Number,
          min: 1,
          max: 5,
        },
      },
    ],

    niche: [
      {
        type: String,
        trim: true,
      },
    ],

    bio: {
      type: String,
      trim: true,
      default: "",
    },

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
      default: 0,
      min: 0,
    },

    profileCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Creator = mongoose.model("Creator", creatorSchema);
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
          required: true,
        },
      },
    ],

    niche: [{ type: String }],

    bio: {
      type: String,
      trim: true,
    },

    links: {
      type: [
        {
          platform: {
            type: String,
            required: true,
            trim: true,
          },
          url: {
            type: String,
            required: true,
            trim: true,
          },
        },
      ],
      validate: {
        validator: function (value) {
          return value.length > 0;
        },
        message: "At least one social platform link is required",
      },
      required: true,
    },

    followersCount: {
      type: Number,
      required: [true, "Followers count is required"],
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const Creator = mongoose.model("Creator", creatorSchema);
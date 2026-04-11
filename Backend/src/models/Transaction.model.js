import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Creator",
      required: [true, "Creator ID is required"],
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
    },
    status: {
      type: String,
      required: [true, "Status is required"],
      trim: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "Project ID is required"],
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const Transaction = mongoose.model("Transaction", transactionSchema);

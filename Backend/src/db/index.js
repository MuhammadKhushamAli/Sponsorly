import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export async function connectDB() {
  try {
    return await mongoose.connect(`${process.env.DB_URI}/Sponsorly`);
  } catch (error) {
    console.log(error);
  }
}

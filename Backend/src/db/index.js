import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export async function connectDB() {
    return await mongoose.connect(`${process.env.DB_URI}/Sponsorly`)
}

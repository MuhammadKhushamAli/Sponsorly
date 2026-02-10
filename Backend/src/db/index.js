import mongoose from "mongoose";
import { dbName } from "../constants.js";

export const connectDB = async () => {
  try {
    await mongoose.connect(`${process.env.MONGO_DB_URI}/${dbName}`);
    console.log("Database Connected Successfully");
  } catch (error) {
    throw `Uanble to connect database: ${error}`;
  }
};

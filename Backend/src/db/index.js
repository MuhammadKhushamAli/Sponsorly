import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();


mongoose.connect(`${process.env.DB_URI}/Sponsorly`)
.then(()=>{
    console.log("dataBase connected Successfully");
})
.catch((err)=>{
    console.log("dataBase connection failed: ", err.message);
})

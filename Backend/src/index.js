import app from "./app.js";
import "./db/index.js";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 4000;

app.get("/", (req, res) => {
  res.send("Welcome to Sponsorly API");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
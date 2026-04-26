import app from "./app.js";
import "./db/index.js";

import dotenv from "dotenv";
dotenv.config();

//rout files
import authRoutes from "./routes/auth.routes.js";
import sponsorshipRoutes from "./routes/sponsorship.routes.js";

//routes
app.use("/auth", authRoutes);
app.use("/sponsorship", sponsorshipRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to Sponsorly API");
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
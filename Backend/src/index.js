import app from "./app.js";
import { connectDB } from "./db/index.js";

import dotenv from "dotenv";
dotenv.config();

//rout files
import authRoutes from "./routes/auth.routes.js";
import sponsorshipRoutes from "./routes/sponsors.routes.js";
import creatorRoutes from "./routes/creators.routes.js";
import creatorCampaignRoutes from "./routes/creatorCampaign.routes.js";
import sponsorCampaignRoutes from "./routes/sponsorCampaign.routes.js";

//routes
app.use("/auth", authRoutes);
app.use("/sponsors", sponsorshipRoutes);
app.use("/creators", creatorRoutes);
app.use("/creator-campaigns", creatorCampaignRoutes);
app.use("/sponsor-campaigns", sponsorCampaignRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to Sponsorly API");
});

const PORT = process.env.PORT || 4000;


connectDB()
.then(() => {
  console.log("Connected to MongoDB");
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  })
})
.catch((err) => {
  console.log(err);
});

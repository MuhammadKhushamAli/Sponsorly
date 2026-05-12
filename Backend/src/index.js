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
import collabsRoutes from "./routes/collabs.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import reviewRoutes from "./routes/reviews.routes.js";
import agentRoutes from "./routes/agent.routes.js";

//routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/sponsors", sponsorshipRoutes);
app.use("/api/v1/creators", creatorRoutes);
app.use("/api/v1/creator-campaigns", creatorCampaignRoutes);
app.use("/api/v1/sponsor-campaigns", sponsorCampaignRoutes);
app.use("/api/v1/collabs", collabsRoutes);
app.use("/api/v1/chats", chatRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/agent", agentRoutes);

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

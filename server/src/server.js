require("dotenv").config();

require("node:dns/promises").setServers(["1.1.1.1", "8.8.8.8"]);

const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

const express = require("express");
const cors = require("cors");
const path = require("path");

const connectDB = require("./config/db");

const authRoutes = require("./routes/auth.routes");
const usersRoutes = require("./routes/users.routes");
const profileRoutes = require("./routes/profile.routes");
const storyRoutes = require("./routes/story.routes");
const categoryRoutes = require("./routes/category.routes");
const lessonRoutes = require("./routes/lesson.routes");
const adminStoryRoutes = require("./routes/adminStory.routes");
const safetyAlertRoutes = require("./routes/safetyAlert.routes");
const gameRoutes = require("./routes/game.routes");
const adminGameRoutes = require("./routes/adminGame.routes");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.get("/", (req, res) => {
  res.send("API running");
});

app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/stories", storyRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/admin", adminStoryRoutes);
app.use("/api/safety", safetyAlertRoutes);
app.use("/api/games", gameRoutes);
app.use("/api/admin", adminGameRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
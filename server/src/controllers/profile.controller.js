const User = require("../models/User");
const Story = require("../models/Story");
const {
  awardAchievements,
  ACHIEVEMENT_DEFINITIONS,
} = require("../utils/awardAchievements");

const getProfileAchievements = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({
      username: String(username).trim().toLowerCase(),
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const unlockedAchievements = await awardAchievements(user);
    const unlockedMap = new Map(
      unlockedAchievements.map((achievement) => [achievement.key, achievement])
    );

    const allAchievements = ACHIEVEMENT_DEFINITIONS.map((definition) => {
      const unlockedAchievement = unlockedMap.get(definition.key);

      return {
        key: definition.key,
        title: definition.title,
        description: definition.description,
        icon: definition.icon,
        unlocked: Boolean(unlockedAchievement),
        unlockedAt: unlockedAchievement?.unlockedAt || null,
      };
    });

    res.json(allAchievements);
  } catch (error) {
    res.status(500).json({
      message: "Could not load achievements",
    });
  }
};

const getProfileStats = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({
      username: String(username).trim().toLowerCase(),
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const storiesCount = await Story.countDocuments({ author: user._id });
    const achievementsCount = (user.achievements || []).length;

    const now = new Date();
    const createdAt = user.createdAt ? new Date(user.createdAt) : now;
    const daysOnPlatform = Math.max(
      1,
      Math.ceil((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24))
    );

    let completionFields = 0;
    if (user.name?.trim()) completionFields += 1;
    if (user.username?.trim()) completionFields += 1;
    if (user.avatar?.trim()) completionFields += 1;
    if (user.coverImage?.trim()) completionFields += 1;
    if (user.quote?.trim()) completionFields += 1;

    const profileCompletion = Math.round((completionFields / 5) * 100);

    res.json({
      storiesCount,
      achievementsCount,
      daysOnPlatform,
      profileCompletion,
    });
  } catch (error) {
    res.status(500).json({
      message: "Could not load stats",
    });
  }
};

module.exports = {
  getProfileAchievements,
  getProfileStats,
};
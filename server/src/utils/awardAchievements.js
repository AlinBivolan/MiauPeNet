const Progress = require("../models/Progress");
const Story = require("../models/Story");
const UserCategoryProgress = require("../models/UserCategoryProgress");

const ACHIEVEMENT_DEFINITIONS = [
  {
    key: "first_lesson",
    title: "Primul pas",
    description: "Ai terminat prima lecție.",
    icon: "🌟",
    check: async ({ completedLessons }) => completedLessons >= 1,
  },
  {
    key: "three_lessons",
    title: "În formă",
    description: "Ai terminat 3 lecții.",
    icon: "📘",
    check: async ({ completedLessons }) => completedLessons >= 3,
  },
  {
    key: "seven_day_streak",
    title: "Consecvent",
    description: "Ai ajuns la un streak de 7 zile.",
    icon: "🔥",
    check: async ({ user }) => user.streak >= 7,
  },
  {
    key: "first_story",
    title: "Povestitor",
    description: "Ai publicat prima poveste.",
    icon: "📖",
    check: async ({ storiesCount }) => storiesCount >= 1,
  },
  {
    key: "five_stories",
    title: "Autor activ",
    description: "Ai publicat 5 povești.",
    icon: "✍️",
    check: async ({ storiesCount }) => storiesCount >= 5,
  },
  {
    key: "first_category",
    title: "Explorator",
    description: "Ai început prima categorie.",
    icon: "🧭",
    check: async ({ categoriesStarted }) => categoriesStarted >= 1,
  },
  {
    key: "hundred_xp",
    title: "100 XP",
    description: "Ai strâns 100 XP.",
    icon: "💯",
    check: async ({ user }) => user.xp >= 100,
  },
];

async function awardAchievements(user) {
  const [completedLessons, storiesCount, categoriesStarted] = await Promise.all([
    Progress.countDocuments({ userId: user._id, status: "completed" }),
    Story.countDocuments({ author: user._id }),
    UserCategoryProgress.countDocuments({ userId: user._id }),
  ]);

  const currentKeys = new Set((user.achievements || []).map((a) => a.key));
  const unlockedNow = [];

  for (const definition of ACHIEVEMENT_DEFINITIONS) {
    if (currentKeys.has(definition.key)) continue;

    const shouldUnlock = await definition.check({
      user,
      completedLessons,
      storiesCount,
      categoriesStarted,
    });

    if (shouldUnlock) {
      unlockedNow.push({
        key: definition.key,
        title: definition.title,
        description: definition.description,
        icon: definition.icon,
        unlockedAt: new Date(),
      });
    }
  }

  if (unlockedNow.length > 0) {
    user.achievements.push(...unlockedNow);
    await user.save();
  }

  return user.achievements || [];
}

module.exports = {
  awardAchievements,
  ACHIEVEMENT_DEFINITIONS,
};
const Game = require("../models/Game");
const GameProgress = require("../models/GameProgress");
const User = require("../models/User");

function normalizeAnswer(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[.,!?;:]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();
}

function toPublicGame(game, completedGames = []) {
  const raw = typeof game.toObject === "function" ? game.toObject() : game;

  return {
    id: raw.key,
    key: raw.key,
    title: raw.title,
    subtitle: raw.subtitle,
    difficulty: raw.difficulty,
    estimatedMinutes: raw.estimatedMinutes,
    icon: raw.icon,
    order: raw.order,
    story: raw.story,
    explanation: raw.explanation,
    encodedLabel: raw.encodedLabel,
    encodedMessage: raw.encodedMessage,
    hint: raw.hint,
    task: raw.task,
    helperTable: raw.helperTable || [],
    completed: completedGames.includes(raw.key),
  };
}

async function getOrCreateProgress(userId) {
  let progress = await GameProgress.findOne({ userId });

  if (!progress) {
    progress = await GameProgress.create({
      userId,
      completedGames: [],
    });
  }

  return progress;
}

exports.getGames = async (req, res) => {
  try {
    const userId = req.user.id;
    const progress = await getOrCreateProgress(userId);

    const games = await Game.find({ isActive: true })
      .sort({ order: 1 });

    res.json({
      games: games.map((game) => {
        const publicGame = toPublicGame(game, progress.completedGames);

        return {
          id: publicGame.id,
          key: publicGame.key,
          title: publicGame.title,
          subtitle: publicGame.subtitle,
          difficulty: publicGame.difficulty,
          estimatedMinutes: publicGame.estimatedMinutes,
          icon: publicGame.icon,
          order: publicGame.order,
          completed: publicGame.completed,
        };
      }),
      completedGames: progress.completedGames,
    });
  } catch (error) {
    console.error("getGames error:", error);
    res.status(500).json({ message: "Eroare la încărcarea jocurilor." });
  }
};

exports.getGameById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { gameId } = req.params;

    const game = await Game.findOne({
      key: gameId,
      isActive: true,
    });

    if (!game) {
      return res.status(404).json({ message: "Jocul nu a fost găsit." });
    }

    const progress = await getOrCreateProgress(userId);

    res.json({
      game: toPublicGame(game, progress.completedGames),
    });
  } catch (error) {
    console.error("getGameById error:", error);
    res.status(500).json({ message: "Eroare la încărcarea jocului." });
  }
};

exports.checkGameAnswer = async (req, res) => {
  try {
    const userId = req.user.id;
    const { gameId } = req.params;
    const { answer } = req.body;

    const game = await Game.findOne({
      key: gameId,
      isActive: true,
    }).select("+correctAnswer +acceptedAnswers");

    if (!game) {
      return res.status(404).json({ message: "Jocul nu a fost găsit." });
    }

    const normalizedUserAnswer = normalizeAnswer(answer);

    const acceptedAnswers = [
      game.correctAnswer,
      ...(game.acceptedAnswers || []),
    ]
      .map(normalizeAnswer)
      .filter(Boolean);

    const isCorrect = acceptedAnswers.includes(normalizedUserAnswer);

    const progress = await getOrCreateProgress(userId);

    if (isCorrect && !progress.completedGames.includes(game.key)) {
      progress.completedGames.push(game.key);
      await progress.save();

      await User.findByIdAndUpdate(userId, {
        $inc: { xp: 10 },
        $addToSet: {
          achievements: {
            key: `game_${game.key}`,
            title: `Misiune completată: ${game.title}`,
            description: "Ai rezolvat o misiune cyber.",
            icon: game.icon || "🏆",
            unlockedAt: new Date(),
          },
        },
      });
    }

    res.json({
      isCorrect,
      completed: isCorrect || progress.completedGames.includes(game.key),
      feedback: isCorrect ? game.successText : game.failText,
      completedGames: progress.completedGames,
    });
  } catch (error) {
    console.error("checkGameAnswer error:", error);
    res.status(500).json({ message: "Eroare la verificarea răspunsului." });
  }
};
const Game = require("../models/Game");

function normalizeArray(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

exports.getAllGamesAdmin = async (req, res) => {
  try {
    const games = await Game.find()
      .select("+correctAnswer +acceptedAnswers")
      .sort({ order: 1 });

    res.json(games);
  } catch (error) {
    console.error("getAllGamesAdmin error:", error);
    res.status(500).json({ message: "Eroare la încărcarea jocurilor." });
  }
};

exports.getGameByIdAdmin = async (req, res) => {
  try {
    const game = await Game.findById(req.params.id).select(
      "+correctAnswer +acceptedAnswers"
    );

    if (!game) {
      return res.status(404).json({ message: "Jocul nu a fost găsit." });
    }

    res.json(game);
  } catch (error) {
    console.error("getGameByIdAdmin error:", error);
    res.status(500).json({ message: "Eroare la încărcarea jocului." });
  }
};

exports.createGameAdmin = async (req, res) => {
  try {
    const {
      key,
      title,
      subtitle,
      type,
      difficulty,
      estimatedMinutes,
      icon,
      order,
      story,
      explanation,
      encodedLabel,
      encodedMessage,
      hint,
      task,
      helperTable,
      correctAnswer,
      acceptedAnswers,
      successText,
      failText,
      isActive,
    } = req.body;

    if (
      !key ||
      !title ||
      !type ||
      !order ||
      !story ||
      !explanation ||
      !encodedMessage ||
      !task ||
      !correctAnswer
    ) {
      return res.status(400).json({
        message:
          "key, title, type, order, story, explanation, encodedMessage, task și correctAnswer sunt obligatorii.",
      });
    }

    const game = await Game.create({
      key: String(key).trim(),
      title: String(title).trim(),
      subtitle: String(subtitle || "").trim(),
      type,
      difficulty: difficulty || "Ușor",
      estimatedMinutes: Number(estimatedMinutes) || 5,
      icon: icon || "🎮",
      order: Number(order),
      story,
      explanation,
      encodedLabel: encodedLabel || "Mesaj",
      encodedMessage,
      hint: hint || "",
      task,
      helperTable: Array.isArray(helperTable) ? helperTable : [],
      correctAnswer: String(correctAnswer).trim(),
      acceptedAnswers: normalizeArray(acceptedAnswers),
      successText: successText || "Corect!",
      failText: failText || "Răspuns greșit. Mai încearcă.",
      isActive: isActive !== false,
    });

    res.status(201).json(game);
  } catch (error) {
    console.error("createGameAdmin error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        message: "Există deja un joc cu acest key sau order.",
      });
    }

    res.status(500).json({ message: "Eroare la crearea jocului." });
  }
};

exports.updateGameAdmin = async (req, res) => {
  try {
    const game = await Game.findById(req.params.id).select(
      "+correctAnswer +acceptedAnswers"
    );

    if (!game) {
      return res.status(404).json({ message: "Jocul nu a fost găsit." });
    }

    const fields = [
      "key",
      "title",
      "subtitle",
      "type",
      "difficulty",
      "icon",
      "story",
      "explanation",
      "encodedLabel",
      "encodedMessage",
      "hint",
      "task",
      "successText",
      "failText",
    ];

    for (const field of fields) {
      if (req.body[field] !== undefined) {
        game[field] = req.body[field];
      }
    }

    if (req.body.order !== undefined) {
      game.order = Number(req.body.order);
    }

    if (req.body.estimatedMinutes !== undefined) {
      game.estimatedMinutes = Number(req.body.estimatedMinutes);
    }

    if (req.body.helperTable !== undefined) {
      game.helperTable = Array.isArray(req.body.helperTable)
        ? req.body.helperTable
        : [];
    }

    if (req.body.correctAnswer !== undefined) {
      game.correctAnswer = String(req.body.correctAnswer).trim();
    }

    if (req.body.acceptedAnswers !== undefined) {
      game.acceptedAnswers = normalizeArray(req.body.acceptedAnswers);
    }

    if (req.body.isActive !== undefined) {
      game.isActive = Boolean(req.body.isActive);
    }

    await game.save();

    res.json(game);
  } catch (error) {
    console.error("updateGameAdmin error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        message: "Există deja un joc cu acest key sau order.",
      });
    }

    res.status(500).json({ message: "Eroare la actualizarea jocului." });
  }
};

exports.deleteGameAdmin = async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);

    if (!game) {
      return res.status(404).json({ message: "Jocul nu a fost găsit." });
    }

    await Game.findByIdAndDelete(req.params.id);

    res.json({ message: "Jocul a fost șters." });
  } catch (error) {
    console.error("deleteGameAdmin error:", error);
    res.status(500).json({ message: "Eroare la ștergerea jocului." });
  }
};
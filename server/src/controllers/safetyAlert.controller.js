const SafetyAlert = require("../models/SafetyAlert");
const { analyzeStorySafety } = require("../utils/storySafety");

function extractText(title = "", blocks = []) {
  const textBlocks = Array.isArray(blocks)
    ? blocks
        .filter((block) => block.type === "text")
        .map((block) => block.content || "")
    : [];

  return [title, ...textBlocks].join(" ").trim();
}

function getHighestRisk(currentRisk, nextRisk) {
  const priority = {
    low: 1,
    medium: 2,
    high: 3,
  };

  return priority[nextRisk] > priority[currentRisk] ? nextRisk : currentRisk;
}

const checkDraftSafety = async (req, res) => {
  try {
    const { title = "", blocks = [] } = req.body;

    const safety = analyzeStorySafety({
      title,
      blocks,
    });

    const fullText = extractText(title, blocks);

    if (safety.riskLevel !== "medium" && safety.riskLevel !== "high") {
      return res.json(safety);
    }

    const existingAlert = await SafetyAlert.findOne({
      user: req.userId,
      source: "draft",
      status: "new",
    }).sort({ updatedAt: -1 });

    if (!existingAlert) {
      await SafetyAlert.create({
        user: req.userId,
        title,
        textPreview: fullText.slice(0, 3000),
        blocksSnapshot: blocks,
        riskLevel: safety.riskLevel,
        flags: safety.flags,
        source: "draft",
        status: "new",
      });

      return res.json(safety);
    }

    const oldTextLength = existingAlert.textPreview?.length || 0;
    const newTextLength = fullText.length;

    if (newTextLength >= oldTextLength) {
      existingAlert.title = title;
      existingAlert.textPreview = fullText.slice(0, 3000);
      existingAlert.blocksSnapshot = blocks;
    }

    existingAlert.riskLevel = getHighestRisk(
      existingAlert.riskLevel,
      safety.riskLevel
    );

    existingAlert.flags = Array.from(
      new Set([...(existingAlert.flags || []), ...(safety.flags || [])])
    );

    await existingAlert.save();

    res.json(safety);
  } catch (error) {
    res.status(500).json({
      message: "Could not check draft safety",
    });
  }
};

const getSafetyAlerts = async (req, res) => {
  try {
    const { status = "new" } = req.query;

    const allowedStatuses = ["new", "reviewed"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid alert status",
      });
    }

    const alerts = await SafetyAlert.find({ status })
      .populate("user", "username name email avatar")
      .populate("reviewedBy", "username name")
      .sort({ updatedAt: -1 });

    res.json(alerts);
  } catch (error) {
    res.status(500).json({
      message: "Could not load safety alerts",
    });
  }
};

const markSafetyAlertReviewed = async (req, res) => {
  try {
    const { id } = req.params;

    const alert = await SafetyAlert.findById(id);

    if (!alert) {
      return res.status(404).json({
        message: "Alert not found",
      });
    }

    alert.status = "reviewed";
    alert.reviewedBy = req.userId;
    alert.reviewedAt = new Date();

    await alert.save();

    const populatedAlert = await SafetyAlert.findById(alert._id)
      .populate("user", "username name email avatar")
      .populate("reviewedBy", "username name");

    res.json(populatedAlert);
  } catch (error) {
    res.status(500).json({
      message: "Could not update safety alert",
    });
  }
};

module.exports = {
  checkDraftSafety,
  getSafetyAlerts,
  markSafetyAlertReviewed,
};
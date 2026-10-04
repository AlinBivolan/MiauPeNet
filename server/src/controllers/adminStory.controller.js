const Story = require("../models/Story");

const getStoriesForReview = async (req, res) => {
  try {
    const { status = "pending" } = req.query;

    const allowedStatuses = ["pending", "flagged", "rejected", "approved"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status",
      });
    }

    const stories = await Story.find({ status })
      .populate("author", "username name avatar email")
      .populate("reviewedBy", "username name")
      .sort({ createdAt: -1 });

    res.json(stories);
  } catch (error) {
    res.status(500).json({
      message: "Could not load stories for review",
    });
  }
};

const approveStory = async (req, res) => {
  try {
    const { id } = req.params;

    const story = await Story.findById(id);

    if (!story) {
      return res.status(404).json({
        message: "Story not found",
      });
    }

    story.status = "approved";
    story.moderationReason = "";
    story.reviewedBy = req.userId;
    story.reviewedAt = new Date();

    await story.save();

    const populatedStory = await Story.findById(story._id)
      .populate("author", "username name avatar email")
      .populate("reviewedBy", "username name");

    res.json(populatedStory);
  } catch (error) {
    res.status(500).json({
      message: "Could not approve story",
    });
  }
};

const rejectStory = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const story = await Story.findById(id);

    if (!story) {
      return res.status(404).json({
        message: "Story not found",
      });
    }

    story.status = "rejected";
    story.moderationReason =
      reason || "Povestea nu respectă regulile comunității.";
    story.reviewedBy = req.userId;
    story.reviewedAt = new Date();

    await story.save();

    const populatedStory = await Story.findById(story._id)
      .populate("author", "username name avatar email")
      .populate("reviewedBy", "username name");

    res.json(populatedStory);
  } catch (error) {
    res.status(500).json({
      message: "Could not reject story",
    });
  }
};

module.exports = {
  getStoriesForReview,
  approveStory,
  rejectStory,
};
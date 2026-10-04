const Story = require("../models/Story");
const User = require("../models/User");
const { analyzeStorySafety } = require("../utils/storySafety");

const STORY_CATEGORIES = [
  "Lecții",
  "Jocuri",
  "Reușite",
  "Gânduri",
  "Creativitate",
  "Aventuri online",
];

function normalizeBlocks(blocks) {
  if (!Array.isArray(blocks)) return [];

  return blocks
    .map((block, index) => ({
      type: block.type,
      content: block.type === "text" ? String(block.content || "").trim() : "",
      imageUrl: block.type === "image" ? String(block.imageUrl || "").trim() : "",
      order: Number.isFinite(block.order) ? block.order : index,
    }))
    .filter((block) => {
      if (block.type === "text") return Boolean(block.content);
      if (block.type === "image") return Boolean(block.imageUrl);
      return false;
    })
    .sort((a, b) => a.order - b.order)
    .map((block, index) => ({
      ...block,
      order: index,
    }));
}

function validateStoryPayload({ title, category, blocks }) {
  if (!title || !String(title).trim()) {
    return "Titlul este obligatoriu.";
  }

  if (!category || !STORY_CATEGORIES.includes(String(category).trim())) {
    return "Categoria este invalidă.";
  }

  if (!Array.isArray(blocks) || blocks.length === 0) {
    return "Povestea trebuie să conțină cel puțin un bloc.";
  }

  const imageBlocks = blocks.filter((block) => block.type === "image");
  if (imageBlocks.length > 5) {
    return "Poți adăuga maximum 5 imagini.";
  }

  const hasInvalidBlock = blocks.some((block) => {
    if (!["text", "image"].includes(block.type)) return true;
    if (block.type === "text" && !String(block.content || "").trim()) return true;
    if (block.type === "image" && !String(block.imageUrl || "").trim()) return true;
    return false;
  });

  if (hasInvalidBlock) {
    return "Există blocuri invalide în poveste.";
  }

  return null;
}

const safetyCheckDraft = async (req, res) => {
  try {
    const { title, blocks } = req.body;

    const normalizedBlocks = normalizeBlocks(blocks);
    const safety = analyzeStorySafety({
      title,
      blocks: normalizedBlocks,
    });

    res.json(safety);
  } catch (error) {
    res.status(500).json({
      message: "Could not run safety check",
    });
  }
};

const uploadStoryImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No image uploaded",
      });
    }

    res.json({
      imageUrl: `/uploads/stories/${req.file.filename}`,
    });
  } catch (error) {
    res.status(500).json({
      message: "Could not upload image",
    });
  }
};

const createStory = async (req, res) => {
  try {
    const { title, category, blocks } = req.body;

    const normalizedBlocks = normalizeBlocks(blocks);
    const validationError = validateStoryPayload({
      title,
      category,
      blocks: normalizedBlocks,
    });

    if (validationError) {
      return res.status(400).json({
        message: validationError,
      });
    }

    const safety = analyzeStorySafety({
      title,
      blocks: normalizedBlocks,
    });

    const status = safety.shouldFlagForAdmin ? "flagged" : "pending";

    const story = await Story.create({
      author: req.userId,
      title: String(title).trim(),
      category: String(category).trim(),
      blocks: normalizedBlocks,
      status,
      moderationReason:
        status === "flagged"
          ? "Poveste flag-uită automat pentru verificare de siguranță."
          : "Poveste trimisă spre aprobare.",
      safetyCheck: {
        riskLevel: safety.riskLevel,
        flags: safety.flags,
        checkedAt: new Date(),
      },
    });

    const populatedStory = await Story.findById(story._id).populate(
      "author",
      "username name avatar"
    );

    res.status(201).json({
      story: populatedStory,
      safety,
      message:
        status === "flagged"
          ? "Povestea a fost trimisă spre verificare prioritară."
          : "Povestea a fost trimisă spre aprobare.",
    });
  } catch (error) {
    res.status(500).json({
      message: "Could not create story",
    });
  }
};

const updateStory = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category, blocks } = req.body;

    const story = await Story.findById(id);

    if (!story) {
      return res.status(404).json({
        message: "Story not found",
      });
    }

    if (String(story.author) !== String(req.userId)) {
      return res.status(403).json({
        message: "Nu poți edita această poveste.",
      });
    }

    const normalizedBlocks = normalizeBlocks(blocks);
    const validationError = validateStoryPayload({
      title,
      category,
      blocks: normalizedBlocks,
    });

    if (validationError) {
      return res.status(400).json({
        message: validationError,
      });
    }

    const safety = analyzeStorySafety({
      title,
      blocks: normalizedBlocks,
    });

    story.title = String(title).trim();
    story.category = String(category).trim();
    story.blocks = normalizedBlocks;
    story.status = safety.shouldFlagForAdmin ? "flagged" : "pending";
    story.moderationReason =
      story.status === "flagged"
        ? "Poveste editată și flag-uită automat pentru verificare de siguranță."
        : "Poveste editată și retrimisă spre aprobare.";
    story.safetyCheck = {
      riskLevel: safety.riskLevel,
      flags: safety.flags,
      checkedAt: new Date(),
    };
    story.reviewedBy = null;
    story.reviewedAt = null;

    await story.save();

    const populatedStory = await Story.findById(story._id).populate(
      "author",
      "username name avatar"
    );

    res.json({
      story: populatedStory,
      safety,
      message:
        story.status === "flagged"
          ? "Povestea a fost retrimisă spre verificare prioritară."
          : "Povestea a fost retrimisă spre aprobare.",
    });
  } catch (error) {
    res.status(500).json({
      message: "Could not update story",
    });
  }
};

const deleteStory = async (req, res) => {
  try {
    const { id } = req.params;

    const story = await Story.findById(id);

    if (!story) {
      return res.status(404).json({
        message: "Story not found",
      });
    }

    if (String(story.author) !== String(req.userId)) {
      return res.status(403).json({
        message: "Nu poți șterge această poveste.",
      });
    }

    await Story.findByIdAndDelete(id);

    res.json({
      message: "Story deleted",
    });
  } catch (error) {
    res.status(500).json({
      message: "Could not delete story",
    });
  }
};

const getFeedStories = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      category = "Toate",
      sort = "newest",
      onlyWithImages = "false",
    } = req.query;

    const pageNumber = Math.max(Number(page), 1);
    const limitNumber = Math.max(Number(limit), 1);
    const skip = (pageNumber - 1) * limitNumber;

    const query = {
      status: "approved",
    };

    if (category && category !== "Toate") {
      query.category = category;
    }

    if (onlyWithImages === "true") {
      query.blocks = {
        $elemMatch: {
          type: "image",
        },
      };
    }

    if (search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");

      query.$or = [
        { title: searchRegex },
        { category: searchRegex },
        { "blocks.content": searchRegex },
      ];
    }

    const sortOption =
      sort === "oldest" ? { createdAt: 1 } : { createdAt: -1 };

    const [stories, total] = await Promise.all([
      Story.find(query)
        .populate("author", "username name avatar")
        .sort(sortOption)
        .skip(skip)
        .limit(limitNumber),
      Story.countDocuments(query),
    ]);

    res.json({
      stories,
      page: pageNumber,
      limit: limitNumber,
      total,
      totalPages: Math.ceil(total / limitNumber),
      hasMore: pageNumber * limitNumber < total,
    });
  } catch (error) {
    res.status(500).json({
      message: "Could not load feed",
    });
  }
};

const getStoriesByUsername = async (req, res) => {
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

    const isOwner = String(user._id) === String(req.userId);

    const query = isOwner
      ? { author: user._id }
      : { author: user._id, status: "approved" };

    const stories = await Story.find(query)
      .populate("author", "username name avatar")
      .sort({ createdAt: -1 });

    res.json(stories);
  } catch (error) {
    res.status(500).json({
      message: "Could not load user stories",
    });
  }
};

module.exports = {
  safetyCheckDraft,
  uploadStoryImage,
  createStory,
  updateStory,
  deleteStory,
  getFeedStories,
  getStoriesByUsername,
  STORY_CATEGORIES,
};
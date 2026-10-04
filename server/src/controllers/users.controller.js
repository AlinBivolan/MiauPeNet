const User = require("../models/User");

const getUserProfileByUsername = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({
      username: String(username).trim().toLowerCase(),
    }).select("-password -email");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({
      id: user._id,
      username: user.username,
      name: user.name,
      avatar: user.avatar,
      coverImage: user.coverImage,
      quote: user.quote,
      xp: user.xp,
      streak: user.streak,
      levels: user.levels,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  getUserProfileByUsername,
};
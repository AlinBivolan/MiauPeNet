const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const validatePassword = require("../utils/validatePassword");

function slugifyUsername(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 20);
}

async function generateUniqueUsername(name) {
  const base = slugifyUsername(name) || "user";
  let candidate = base;
  let counter = 0;

  while (await User.findOne({ username: candidate })) {
    counter += 1;
    candidate = `${base}${counter}`;
  }

  return candidate;
}

function removeOldFileIfExists(relativePath) {
  if (!relativePath) return;

  const normalized = relativePath.startsWith("/")
    ? relativePath.slice(1)
    : relativePath;

  const absolutePath = path.join(process.cwd(), normalized);

  if (fs.existsSync(absolutePath)) {
    fs.unlinkSync(absolutePath);
  }
}

// REGISTER
const register = async (req, res) => {
  const { name, email, password, ageGroup } = req.body;

  try {
    if (!name || !email || !password || !ageGroup) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    if (!["under_12", "over_or_equal_12"].includes(ageGroup)) {
      return res.status(400).json({
        message: "Invalid age group",
      });
    }

    const passwordErrors = validatePassword(password);

    if (passwordErrors.length > 0) {
      return res.status(400).json({
        message: "Weak password",
        errors: passwordErrors,
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const userExists = await User.findOne({ email: normalizedEmail });

    if (userExists) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const username = await generateUniqueUsername(name);

    const user = await User.create({
      username,
      name: String(name).trim(),
      email: normalizedEmail,
      password: hashedPassword,
      ageGroup,
      role: "user",
    });

    res.status(201).json({
      message: "User created",
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        ageGroup: user.ageGroup,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// LOGIN
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const identifier = String(email).trim().toLowerCase();

    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        username: user.username,
        role: user.role,
        ageGroup: user.ageGroup,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        ageGroup: user.ageGroup,
        avatar: user.avatar,
        coverImage: user.coverImage,
        quote: user.quote,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ME
const me = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};

const profile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({
      id: user._id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
      ageGroup: user.ageGroup,
      avatar: user.avatar,
      coverImage: user.coverImage,
      quote: user.quote,
      xp: user.xp,
      streak: user.streak,
      levels: user.levels,
    });
  } catch (err) {
    res.status(500).json({
      message: "Server error",
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, quote, avatar } = req.body;

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (name !== undefined) user.name = String(name).trim();
    if (quote !== undefined) user.quote = quote;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    res.json({
      id: user._id,
      username: user.username,
      name: user.name,
      quote: user.quote,
      avatar: user.avatar,
      coverImage: user.coverImage,
    });
  } catch (err) {
    res.status(500).json({
      message: "Update failed",
    });
  }
};

const updateAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No avatar file uploaded",
      });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    removeOldFileIfExists(user.avatar);

    user.avatar = `/uploads/avatars/${req.file.filename}`;
    await user.save();

    res.json({
      message: "Avatar updated",
      avatar: user.avatar,
    });
  } catch (err) {
    res.status(500).json({
      message: "Avatar update failed",
    });
  }
};

const updateCoverImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No cover file uploaded",
      });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    removeOldFileIfExists(user.coverImage);

    user.coverImage = `/uploads/covers/${req.file.filename}`;
    await user.save();

    res.json({
      message: "Cover image updated",
      coverImage: user.coverImage,
    });
  } catch (err) {
    res.status(500).json({
      message: "Cover update failed",
    });
  }
};

module.exports = {
  register,
  login,
  me,
  profile,
  updateProfile,
  updateAvatar,
  updateCoverImage,
};
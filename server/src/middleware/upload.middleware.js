const multer = require("multer");
const path = require("path");
const fs = require("fs");

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

const avatarsDir = path.join(process.cwd(), "uploads", "avatars");
const coversDir = path.join(process.cwd(), "uploads", "covers");
const storiesDir = path.join(process.cwd(), "uploads", "stories");

ensureDir(avatarsDir);
ensureDir(coversDir);
ensureDir(storiesDir);

function fileFilter(req, file, cb) {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];

  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(new Error("Doar imagini jpg, jpeg, png, webp."));
  }

  cb(null, true);
}

function createStorage(type) {
  return multer.diskStorage({
    destination: function (req, file, cb) {
      if (type === "avatar") return cb(null, avatarsDir);
      if (type === "cover") return cb(null, coversDir);
      return cb(null, storiesDir);
    },
    filename: function (req, file, cb) {
      const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
      const fileName = `${req.userId}-${type}-${Date.now()}${ext}`;
      cb(null, fileName);
    },
  });
}

const avatarUpload = multer({
  storage: createStorage("avatar"),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const coverUpload = multer({
  storage: createStorage("cover"),
  fileFilter,
  limits: { fileSize: 8 * 1024 * 1024 },
});

const storyImageUpload = multer({
  storage: createStorage("story"),
  fileFilter,
  limits: { fileSize: 8 * 1024 * 1024 },
});

module.exports = {
  avatarUpload,
  coverUpload,
  storyImageUpload,
};
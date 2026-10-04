const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userId = decoded.userId || decoded.id || decoded._id;

    if (!userId) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    req.userId = userId;
    req.role = decoded.role;
    req.username = decoded.username;
    req.user = {
      id: userId,
      role: decoded.role,
      username: decoded.username,
    };

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
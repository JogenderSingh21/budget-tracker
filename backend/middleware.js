const { JWT_SECRET } = require("./config");
const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(411).json({
      message: "Something went wrong",
      success: false,
    });
  }
  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(411).json({
      message: "something went wrong",
      success: false,
    });
  }
};

module.exports = {
  authMiddleware,
};

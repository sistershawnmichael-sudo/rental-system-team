
const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  if (!token) {
    return res.status(401).json({
      message: "Please log in first."
    });
  }

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    return res.status(500).json({
      message: "Authentication is not configured."
    });
  }

  jwt.verify(token, secret, (err, user) => {
    if (err) {
      return res.status(403).json({
        message: "Invalid or expired login session."
      });
    }

    req.user = user;
    next();
  });
}

function allowRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "You do not have permission to perform this action."
      });
    }

    next();
  };
}

module.exports = { authenticateToken, allowRoles };

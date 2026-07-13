const jwt = require("jsonwebtoken");
const { generateToken } = require("../services/authService");

const authMiddleware = (req, res, next) => {
  const token = req.cookies.authToken;
  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  let decoded = "";
  try {
    decoded = jwt.verify(token, process.env.SECRET_KEY);
    const { iat, exp, ...cleanPayload } = decoded;
    req.userInfo = cleanPayload;
  } catch (error) {
    return res.status(403).json({ message: "Invalid token" });
  }

  try {
    const currentTime = Math.floor(Date.now() / 1000);
    const timeLeft = decoded.exp - currentTime;
    const REFRESH_THRESHOLD =
      Number(process.env.JWT_TOKEN_REFRESH_THRESHOLD) || 300;

    if (timeLeft > 0 && timeLeft < REFRESH_THRESHOLD) {
      generateToken(res, req.userInfo);
    }
  } catch (error) {
    console.error("Token refresh failed:", error.message);
  }

  next();
};

module.exports = authMiddleware;

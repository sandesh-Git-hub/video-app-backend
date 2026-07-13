const jwt = require("jsonwebtoken");

const token_expire_duration = 7 * 24 * 60 * 60;

const generateToken = (res, payload) => {
  const token = jwt.sign(payload, process.env.SECRET_KEY, {
    expiresIn: token_expire_duration,
  });
  res.cookie("authToken", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: token_expire_duration * 1000,
  });
};

module.exports = { generateToken };

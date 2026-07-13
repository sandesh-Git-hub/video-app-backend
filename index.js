const https = require("https");
const fs = require("fs");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();
const authMiddleware = require("./src/middleware/authMiddleware");
const {
  login,
  logout,
  getMovies,
  getTrendingMovies,
  getSimilarMovies,
  getSearchMovie,
} = require("./src/controllers/authController");
const app = express();
const port = process.env.PORT || 3030;
const allowedOrigin = "https://localhost:3000";

// app.use(helmet());
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  }),
);
app.use((req, res, next) => {
  if (req?.headers?.origin && req.headers.origin !== allowedOrigin) {
    return res.status(403).send("Forbidden");
  }
  next();
});
app.use(express.static(path.join(__dirname, "public")));

const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: { message: "Too many login attempts. Please try again later." },
});

app.post("/login", loginRateLimiter, login);
app.post("/logout", logout);

app.get("/", (req, res) => {
  res.send("Server is working perfectly!");
});

app.get("/test", (req, res) => {
  res.send("Test successful..!");
});

app.use(authMiddleware);
app.get("/authme", (req, res) =>
  res.status(200).json({ userInfo: req.userInfo }),
);
app.get("/getmovies", getMovies);
app.get("/gettrendingmovies", getTrendingMovies);
app.get("/getSearchMovie", getSearchMovie);
app.post("/getsimilarmovies", getSimilarMovies);

app.use((req, res) => res.status(404).json({ message: "Not found" }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});

const options = {
  key: fs.readFileSync("server.key"),
  cert: fs.readFileSync("server.cert"),
};

https.createServer(options, app).listen(port, () => {
  console.log(`HTTPS Server running on https://localhost:${port}`);
});

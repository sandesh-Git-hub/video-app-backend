const { users } = require("../models/users");
const bcrypt = require("bcryptjs");
const { generateToken } = require("../services/authService");
const movies = require("../data/moviesData.json");

const invalidInputResponse = (res) => {
  return res.status(400).json({ message: "Invalid username or password" });
};

const login = async (req, res) => {
  const { userName, password } = req.body;

  if (userName && password) {
    const user = users.find((u) => u.userName === userName);

    if (!user) return invalidInputResponse(res);

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) return invalidInputResponse(res);

    const userInfo = {
      userID: user.userID,
      userName: user.userName,
      userFullName: user.userFullName,
    };

    generateToken(res, userInfo);

    res.status(200).json({
      message: "Login successful!",
      userInfo,
    });
  } else {
    return invalidInputResponse(res);
  }
};

const logout = (req, res) => {
  res.clearCookie("authToken", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });

  return res.status(200).json({ isUserLogout: true });
};

const getMovies = (req, res) => {
  return res.status(200).json(movies.containers);
};

const getTrendingMovies = (req, res) => {
  const moviesData = movies.containers;
  return res
    .status(200)
    .json([moviesData[2], moviesData[11], moviesData[13], moviesData[18]]);
};

const getSimilarMovies = (req, res) => {
  try {
    const { contentId, genres } = req.body;
    if (!contentId || !genres) {
      throw new Error('Parameter "contentId" or "genres" cannot be empty.');
    }

    const moviesData = movies.containers;
    const similarMovies = moviesData.filter((movie) => {
      if (movie.metadata.genres && movie.metadata.contentId !== contentId) {
        return movie.metadata.genres.some((val) => genres.includes(val));
      }
    });
    res.status(200).json(similarMovies);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getSearchMovie = (req, res) => {
  try {
    const { searchString } = req.query;

    if (!searchString || searchString.trim() === "") {
      throw new Error('Parameter "searchString" cannot be empty.');
    }

    const moviesData = movies.containers;
    const searchResult = moviesData.filter((movie) => {
      const { title, genres } = movie.metadata;
      const words = searchString.split(" ");
      const pattern = new RegExp(
        `\\b(${words.map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\b`,
        "i",
      );

      return pattern.test(title) || pattern.test(genres.join(","));
    });

    res.status(200).json(searchResult);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  login,
  logout,
  getMovies,
  getTrendingMovies,
  getSimilarMovies,
  getSearchMovie,
};

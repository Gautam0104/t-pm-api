const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();

const app = express();

// Security Middleware
app.use(helmet()); // Adds security headers
app.use(express.json()); // Body parser
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS,
    credentials: true
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access denied" });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(403).json({ error: "Invalid token" });
  }
};

// Example protected route
app.get("/api/protected", authenticateToken, (req, res) => {
  res.json({ data: "Protected data" });
});

// User registration
app.post("/api/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Username and password are required" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Here you would typically save to your database
    // const user = await User.create({ username, password: hashedPassword });

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error creating user" });
  }
});

// User login
app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Username and password are required" });
    }

    // Here you would typically verify against your database
    // const user = await User.findOne({ username });
    // const validPassword = await bcrypt.compare(password, user.password);

    // Generate tokens
    const accessToken = jwt.sign(
      { userId: "user._id", username },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { userId: "user._id", username },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    // Store refresh token in database or Redis
    // await storeRefreshToken(refreshToken, user._id);

    res.json({
      accessToken,
      refreshToken
    });
  } catch (error) {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

// Refresh token endpoint
app.post("/api/refresh-token", async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ error: "Refresh token required" });
  }

  try {
    const verified = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    // Generate new access token
    const accessToken = jwt.sign(
      { userId: verified.userId, username: verified.username },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.json({ accessToken });
  } catch (error) {
    res.status(403).json({ error: "Invalid refresh token" });
  }
});

// Logout endpoint
app.post("/api/logout", authenticateToken, async (req, res) => {
  try {
    // Here you would typically invalidate the refresh token in your database
    // await removeRefreshToken(req.user.userId);
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error logging out" });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

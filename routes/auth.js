const express = require("express");
const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const User = require("../models/User"); // correct path check kar lena

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Just to avoid "Cannot GET /api/auth/google"
router.get("/google", (req, res) => {
  return res.status(200).json({
    success: false,
    message:
      "Use POST with { token: <Google_ID_Token> } to login. This GET route is only for testing."
  });
});

// ✅ Google Login
router.post("/google", async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res
        .status(400)
        .json({ success: false, message: "Missing token in request body" });
    }

    if (!process.env.GOOGLE_CLIENT_ID) {
      return res
        .status(500)
        .json({ success: false, message: "Server missing GOOGLE_CLIENT_ID" });
    }

    // Verify token with Google
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid Google ID token" });
    }

    const { sub: googleId, email, name, picture } = payload;

    // Find or create user
    let user = await User.findOne({ googleId });
    if (!user) {
      user = new User({
        googleId,
        email,
        name,
        avatar: picture,
        coins: 1000, // Welcome bonus
        diamonds: 0,
        level: 1,
        vipLevel: 0,
        gameStats: { gamesPlayed: 0, gamesWon: 0, totalWinnings: 0 }
      });
      await user.save();
    } else {
      user.isOnline = true;
      user.lastSeen = new Date();
      await user.save();
    }

    // Create JWT token
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET not set in env");
      return res
        .status(500)
        .json({ success: false, message: "Server misconfiguration" });
    }

    const jwtToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    return res.json({
      success: true,
      token: jwtToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        coins: user.coins,
        diamonds: user.diamonds,
        level: user.level,
        vipLevel: user.vipLevel
      }
    });
  } catch (error) {
    console.error("Auth error:", error);
    return res.status(400).json({
      success: false,
      message: "Authentication failed",
      error: error.message
    });
  }
});

module.exports = router;

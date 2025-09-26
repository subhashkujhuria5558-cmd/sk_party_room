const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Helpful GET route so visiting /api/auth/google in browser doesn't show "Cannot GET"
router.get('/google', (req, res) => {
  return res.status(200).json({
    success: false,
    message:
      "This endpoint expects a POST request with a Google ID token in JSON body as { token: '<ID_TOKEN>' }. Make a POST request from your frontend (client-side Google Sign-In)."
  });
});

// Google OAuth Login (verify ID token sent from client)
router.post('/google', async (req, res) => {
  try {
    // ensure body parser is used in server.js: app.use(express.json())
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, message: 'Missing token in request body' });
    }
    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(500).json({ success: false, message: 'Server missing GOOGLE_CLIENT_ID env' });
    }

    // Verify the ID token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(401).json({ success: false, message: 'Invalid ID token' });
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
        coins: 1000 // Welcome bonus
      });
      await user.save();
    } else {
      user.isOnline = true;
      user.lastSeen = new Date();
      await user.save();
    }

    // Create JWT
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET not set in env');
      return res.status(500).json({ success: false, message: 'Server misconfiguration' });
    }

    const jwtToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
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
        diamonds: user.diamonds || 0,
        level: user.level || 1,
        vipLevel: user.vipLevel || 0
      }
    });
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(400).json({ success: false, message: 'Authentication failed', error: error.message });
  }
});

module.exports = router;

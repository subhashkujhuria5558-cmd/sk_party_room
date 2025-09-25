const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Google OAuth Login
router.post('/google', async (req, res) => {
    try {
        const { token } = req.body;
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        const { sub: googleId, email, name, picture } = payload;

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

        const jwtToken = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.json({
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
        console.error('Auth error:', error);
        res.status(400).json({ success: false, message: 'Authentication failed' });
    }
});

module.exports = router;

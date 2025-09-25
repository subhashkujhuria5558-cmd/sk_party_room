const express = require('express');
const { Game, GameSession } = require('../models/Game');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all games
router.get('/', async (req, res) => {
    try {
        const games = await Game.find({ isActive: true });
        res.json({ success: true, games });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Join game
router.post('/join', auth, async (req, res) => {
    try {
        const { gameId } = req.body;
        const game = await Game.findById(gameId);
        const user = await User.findById(req.userId);

        if (!game) {
            return res.status(404).json({ success: false, message: 'Game not found' });
        }

        if (user.coins < game.entryFee) {
            return res.status(400).json({ 
                success: false, 
                message: 'Insufficient coins' 
            });
        }

        // Deduct entry fee
        user.coins -= game.entryFee;
        user.gameStats.gamesPlayed += 1;
        await user.save();

        // Create game session
        const gameSession = new GameSession({
            gameId: game._id,
            playerId: user._id,
            entryFee: game.entryFee
        });
        await gameSession.save();

        res.json({
            success: true,
            sessionId: gameSession._id,
            remainingCoins: user.coins
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Game join failed' });
    }
});

// Play game (simplified)
router.post('/play', auth, async (req, res) => {
    try {
        const { sessionId, gameData } = req.body;
        const session = await GameSession.findById(sessionId);
        const game = await Game.findById(session.gameId);
        const user = await User.findById(req.userId);

        // Simple win/loss logic (random based on win rate)
        const isWin = Math.random() < game.winRate;
        let winAmount = 0;

        if (isWin) {
            winAmount = Math.floor(Math.random() * (game.maxWin - game.minWin) + game.minWin);
            user.coins += winAmount;
            user.gameStats.gamesWon += 1;
            user.gameStats.totalWinnings += winAmount;
        }

        session.isWin = isWin;
        session.winAmount = winAmount;
        session.gameData = gameData;

        await session.save();
        await user.save();

        res.json({
            success: true,
            isWin,
            winAmount,
            newBalance: user.coins
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Game play failed' });
    }
});

module.exports = router;

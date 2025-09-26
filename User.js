const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    googleId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    avatar: { type: String, default: '' },
    coins: { type: Number, default: 1000 },
    diamonds: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    experience: { type: Number, default: 0 },
    vipLevel: { type: Number, default: 0 },

    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    badges: [{ 
        name: String,
        icon: String,
        earned: { type: Date, default: Date.now }
    }],

    gameStats: {
        gamesPlayed: { type: Number, default: 0 },
        gamesWon: { type: Number, default: 0 },
        totalWinnings: { type: Number, default: 0 }
    },

    dailyRewards: {
        lastClaim: { type: Date },
        streak: { type: Number, default: 0 }
    },

    isOnline: { type: Boolean, default: false },
    lastSeen: { type: Date, default: Date.now }
}, { timestamps: true }); // ✅ Auto createdAt & updatedAt manage karega

module.exports = mongoose.model('User', userSchema);

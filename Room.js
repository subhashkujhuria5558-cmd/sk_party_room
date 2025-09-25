const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, default: '' },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    maxSeats: { type: Number, default: 15 },
    currentUsers: [{ 
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        seat: { type: Number },
        isMuted: { type: Boolean, default: false },
        joinedAt: { type: Date, default: Date.now }
    }],
    lockedSeats: [{ type: Number }],
    isLocked: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    roomType: { type: String, enum: ['party', 'pk', 'game'], default: 'party' },
    banner: { type: String, default: '' },
    category: { type: String, default: 'general' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Room', roomSchema);

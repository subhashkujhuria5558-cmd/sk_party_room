const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { 
        type: String, 
        enum: ['recharge', 'game_win', 'game_loss', 'gift_sent', 'gift_received', 'daily_reward'],
        required: true 
    },
    amount: { type: Number, required: true },
    description: { type: String, required: true },
    orderId: { type: String },
    transactionId: { type: String },
    status: { 
        type: String, 
        enum: ['pending', 'completed', 'failed'],
        default: 'completed'
    },
    metadata: { type: Object, default: {} },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', transactionSchema);

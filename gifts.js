const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

const giftTypes = [
    { id: 1, name: 'Rose', icon: '🌹', cost: 10, animation: 'heart' },
    { id: 2, name: 'Lucky Box', icon: '🎁', cost: 50, type: 'lucky', returnChance: 0.4 },
    { id: 3, name: 'Red Packet', icon: '🧧', cost: 100, type: 'red_pack', distributions: [3, 9, 21, 51, 101] },
    { id: 4, name: 'Diamond Ring', icon: '💍', cost: 200, animation: 'sparkle' },
    { id: 5, name: 'Crown', icon: '👑', cost: 500, animation: 'royal' }
];

// Get available gifts
router.get('/', (req, res) => {
    res.json({ success: true, gifts: giftTypes });
});

// Send gift
router.post('/send', auth, async (req, res) => {
    try {
        const { giftId, recipientId, roomId, quantity = 1 } = req.body;

        const gift = giftTypes.find(g => g.id === giftId);
        if (!gift) {
            return res.status(404).json({ success: false, message: 'Gift not found' });
        }

        const sender = await User.findById(req.userId);
        const recipient = await User.findById(recipientId);

        const totalCost = gift.cost * quantity;

        if (sender.coins < totalCost) {
            return res.status(400).json({ success: false, message: 'Insufficient coins' });
        }

        // Deduct coins from sender
        sender.coins -= totalCost;
        await sender.save();

        let giftData = {
            gift: gift,
            sender: { id: sender._id, name: sender.name, avatar: sender.avatar },
            recipient: { id: recipient._id, name: recipient.name, avatar: recipient.avatar },
            quantity: quantity,
            timestamp: new Date()
        };

        // Handle special gift types
        if (gift.type === 'lucky') {
            const isLucky = Math.random() < gift.returnChance;
            if (isLucky) {
                const returnAmount = Math.floor(gift.cost * (0.5 + Math.random() * 1.5));
                sender.coins += returnAmount;
                await sender.save();
                giftData.luckyReturn = returnAmount;
            }
        }

        res.json({
            success: true,
            giftData: giftData,
            senderBalance: sender.coins,
            message: 'Gift sent successfully'
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Gift sending failed' });
    }
});

// Create red packet
router.post('/red-packet', auth, async (req, res) => {
    try {
        const { amount, participantCount, roomId } = req.body;

        const sender = await User.findById(req.userId);

        if (sender.coins < amount) {
            return res.status(400).json({ success: false, message: 'Insufficient coins' });
        }

        sender.coins -= amount;
        await sender.save();

        // Create red packet distribution
        const packets = [];
        let remainingAmount = amount;

        for (let i = 0; i < participantCount - 1; i++) {
            const minAmount = 1;
            const maxAmount = Math.floor(remainingAmount / (participantCount - i) * 1.5);
            const packetAmount = Math.floor(Math.random() * (maxAmount - minAmount) + minAmount);
            packets.push(packetAmount);
            remainingAmount -= packetAmount;
        }
        packets.push(remainingAmount); // Last packet gets remaining amount

        // Shuffle packets
        for (let i = packets.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [packets[i], packets[j]] = [packets[j], packets[i]];
        }

        const redPacketData = {
            id: `rp_${Date.now()}`,
            sender: { id: sender._id, name: sender.name, avatar: sender.avatar },
            totalAmount: amount,
            packets: packets,
            claimedBy: [],
            roomId: roomId,
            createdAt: new Date()
        };

        res.json({
            success: true,
            redPacket: redPacketData,
            senderBalance: sender.coins,
            message: 'Red packet created successfully'
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Red packet creation failed' });
    }
});

module.exports = router;

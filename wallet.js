const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Get wallet balance
router.get('/balance', auth, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        res.json({
            success: true,
            coins: user.coins,
            diamonds: user.diamonds
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Coin packages
router.get('/packages', (req, res) => {
    const packages = [
        { id: 1, price: 80, coins: 7400, vip: 7400, display: "₹80 = 7,400 Coins" },
        { id: 2, price: 400, coins: 37250, vip: 37250, display: "₹400 = 37,250 Coins" },
        { id: 3, price: 800, coins: 75000, vip: 75000, display: "₹800 = 75,000 Coins" },
        { id: 4, price: 2400, coins: 226500, vip: 226500, display: "₹2,400 = 226,500 Coins" },
        { id: 5, price: 4800, coins: 456000, vip: 456000, display: "₹4,800 = 456,000 Coins" },
        { id: 6, price: 8000, coins: 765000, vip: 765000, display: "₹8,000 = 765,000 Coins" },
        { id: 7, price: 16000, coins: 1540000, vip: 1540000, display: "₹16,000 = 1,540,000 Coins" },
        { id: 8, price: 32000, coins: 3100000, vip: 3100000, display: "₹32,000 = 3,100,000 Coins" },
        { id: 9, price: 48000, coins: 4680000, vip: 4680000, display: "₹48,000 = 4,680,000 Coins" }
    ];

    res.json({ success: true, packages });
});

// Create payment order
router.post('/recharge', auth, async (req, res) => {
    try {
        const { packageId, amount, coins } = req.body;

        // Generate UPI payment links
        const upiId = "subhashkujhuria5558@paytm";
        const merchantName = "SK Party Room";

        const paymentData = {
            orderId: `SKPR${Date.now()}`,
            amount: amount,
            coins: coins,
            upiLinks: {
                phonepe: `phonepe://pay?pa=${upiId}&pn=${merchantName}&am=${amount}&cu=INR`,
                googlepay: `tez://upi/pay?pa=${upiId}&pn=${merchantName}&am=${amount}&cu=INR`,
                paytm: `paytmmp://pay?pa=${upiId}&pn=${merchantName}&am=${amount}&cu=INR`,
                generic: `upi://pay?pa=${upiId}&pn=${merchantName}&am=${amount}&cu=INR`
            }
        };

        res.json({ success: true, paymentData });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Payment creation failed' });
    }
});

// Verify payment (manual)
router.post('/verify-payment', auth, async (req, res) => {
    try {
        const { orderId, transactionId, coins } = req.body;

        // In production, verify with payment gateway
        // For now, simulate successful payment
        const user = await User.findById(req.userId);
        user.coins += coins;
        await user.save();

        res.json({
            success: true,
            message: 'Payment verified successfully',
            newBalance: user.coins
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Payment verification failed' });
    }
});

module.exports = router;

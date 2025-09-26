const path = require("path");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// HTTP server for socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // In production, set to your frontend URL
    methods: ["GET", "POST"]
  }
});

// ✅ Serve static frontend
app.use(express.static(path.join(__dirname, "public")));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ✅ MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ Mount Routes
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

// ✅ Wallet Packages
app.get("/api/wallet/packages", (req, res) => {
  const packages = [
    { id: 1, price: 80, coins: 7400 },
    { id: 2, price: 400, coins: 37250 },
    { id: 3, price: 800, coins: 75000 },
    { id: 4, price: 2400, coins: 226500 },
    { id: 5, price: 4800, coins: 456000 },
    { id: 6, price: 8000, coins: 765000 }
  ];
  res.json({ success: true, packages });
});

// ✅ Middleware for Auth
const jwt = require("jsonwebtoken");
const auth = (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "No token provided" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.error("Auth error:", error);
    res.status(401).json({ success: false, message: "Invalid token" });
  }
};

// ✅ Recharge Wallet
app.post("/api/wallet/recharge", auth, async (req, res) => {
  try {
    const { amount, coins } = req.body;
    const upiId = "subhashkujhuria5558@paytm";
    const merchantName = "SK Party Room";

    const paymentData = {
      orderId: `SKPR${Date.now()}`,
      amount,
      coins,
      upiLinks: {
        phonepe: `phonepe://pay?pa=${upiId}&pn=${merchantName}&am=${amount}&cu=INR`,
        googlepay: `tez://upi/pay?pa=${upiId}&pn=${merchantName}&am=${amount}&cu=INR`,
        paytm: `paytmmp://pay?pa=${upiId}&pn=${merchantName}&am=${amount}&cu=INR`
      }
    };

    res.json({ success: true, paymentData });
  } catch (error) {
    console.error("Recharge error:", error);
    res.status(500).json({ success: false, message: "Payment creation failed" });
  }
});

// ✅ Verify Payment
const User = require("./models/User"); // User model ko alag rakha to import karo
app.post("/api/wallet/verify-payment", auth, async (req, res) => {
  try {
    const { coins } = req.body;
    const user = await User.findById(req.userId);
    user.coins += coins;
    await user.save();
    res.json({ success: true, newBalance: user.coins });
  } catch (error) {
    console.error("Verify payment error:", error);
    res
      .status(500)
      .json({ success: false, message: "Payment verification failed" });
  }
});

// ✅ Games
const defaultGames = [
  {
    _id: "game1",
    name: "Slot Frenzy",
    entryFee: 100,
    minWin: 50,
    maxWin: 1000,
    winRate: 0.45
  },
  {
    _id: "game2",
    name: "Fishing Game",
    entryFee: 50,
    minWin: 25,
    maxWin: 500,
    winRate: 0.55
  },
  {
    _id: "game3",
    name: "Fruit Crush",
    entryFee: 75,
    minWin: 30,
    maxWin: 750,
    winRate: 0.5
  },
  {
    _id: "game4",
    name: "Lucky Wheel",
    entryFee: 100,
    minWin: 50,
    maxWin: 2000,
    winRate: 0.4
  },
  {
    _id: "game5",
    name: "Card Master",
    entryFee: 150,
    minWin: 75,
    maxWin: 1500,
    winRate: 0.42
  },
  {
    _id: "game6",
    name: "Number Blast",
    entryFee: 80,
    minWin: 40,
    maxWin: 800,
    winRate: 0.48
  }
];

app.get("/api/games", (req, res) => {
  res.json({ success: true, games: defaultGames });
});

app.post("/api/games/join", auth, async (req, res) => {
  try {
    const { gameId } = req.body;
    const game = defaultGames.find((g) => g._id === gameId);
    const user = await User.findById(req.userId);

    if (!user || !game) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid game or user" });
    }

    if (user.coins < game.entryFee) {
      return res
        .status(400)
        .json({ success: false, message: "Insufficient coins" });
    }

    user.coins -= game.entryFee;
    user.gameStats.gamesPlayed += 1;
    await user.save();

    res.json({
      success: true,
      sessionId: `session_${Date.now()}`,
      remainingCoins: user.coins
    });
  } catch (error) {
    console.error("Game join error:", error);
    res.status(500).json({ success: false, message: "Game join failed" });
  }
});

app.post("/api/games/play", auth, async (req, res) => {
  try {
    const { gameId } = req.body;
    const game = defaultGames.find((g) => g._id === gameId);
    const user = await User.findById(req.userId);

    if (!user || !game) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid game or user" });
    }

    const isWin = Math.random() < game.winRate;
    let winAmount = 0;

    if (isWin) {
      winAmount =
        Math.floor(Math.random() * (game.maxWin - game.minWin + 1)) +
        game.minWin;
      user.coins += winAmount;
      user.gameStats.gamesWon += 1;
      user.gameStats.totalWinnings += winAmount;
    }

    await user.save();

    res.json({ success: true, isWin, winAmount, newBalance: user.coins });
  } catch (error) {
    console.error("Game play error:", error);
    res.status(500).json({ success: false, message: "Game play failed" });
  }
});

// ✅ Socket.io
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// ✅ Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`✅ SK Party Room running on port ${PORT}`);
});

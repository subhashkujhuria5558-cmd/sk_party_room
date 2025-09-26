// ===============================
// SK Party Room - Frontend Logic
// ===============================

// API Base URL (agar local pe run kar rahe ho to http://localhost:3001 likho)
const API_BASE = window.location.origin;

// Elements
const loadingScreen = document.getElementById("loading-screen");
const loginScreen = document.getElementById("login-screen");
const mainApp = document.getElementById("main-app");

// User Data
let currentUser = null;
let authToken = localStorage.getItem("token");

// Socket.io
let socket = null;

// ===============================
// Helper Functions
// ===============================
function showSection(section) {
  document.querySelectorAll(".section").forEach((el) => el.classList.add("hidden"));
  document.getElementById(`${section}-section`).classList.remove("hidden");

  document.querySelectorAll(".nav-btn").forEach((btn) => btn.classList.remove("text-blue-400"));
  event.target.classList.add("text-blue-400");
}

function logout() {
  localStorage.removeItem("token");
  location.reload();
}

function updateUI(user) {
  document.getElementById("user-avatar").src = user.avatar || "";
  document.getElementById("user-name").innerText = user.name;
  document.getElementById("user-coins").innerText = `🪙 ${user.coins}`;
  document.getElementById("user-diamonds").innerText = `💎 ${user.diamonds}`;

  document.getElementById("profile-avatar").src = user.avatar || "";
  document.getElementById("profile-name").innerText = user.name;
  document.getElementById("profile-email").innerText = user.email;
  document.getElementById("profile-level").innerText = user.level;
  document.getElementById("profile-games").innerText = user.gameStats?.gamesPlayed || 0;
  document.getElementById("profile-wins").innerText = user.gameStats?.gamesWon || 0;

  document.getElementById("wallet-coins").innerText = user.coins;
  document.getElementById("wallet-diamonds").innerText = user.diamonds;
}

// ===============================
// Google Login
// ===============================
async function handleGoogleLogin() {
  google.accounts.id.initialize({
    client_id: "YOUR_GOOGLE_CLIENT_ID", // 👈 .env me jo client id hai usse yaha paste karna
    callback: async (response) => {
      try {
        const res = await fetch(`${API_BASE}/api/auth/google`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: response.credential }),
        });

        const data = await res.json();
        if (data.success) {
          localStorage.setItem("token", data.token);
          currentUser = data.user;
          authToken = data.token;

          updateUI(currentUser);
          loginScreen.classList.add("hidden");
          mainApp.classList.remove("hidden");

          connectSocket();
        } else {
          alert("Google login failed");
        }
      } catch (err) {
        console.error("Login error:", err);
        alert("Something went wrong during login.");
      }
    },
  });

  google.accounts.id.renderButton(document.getElementById("google-signin"), {
    theme: "outline",
    size: "large",
  });
}

// ===============================
// API Calls
// ===============================
async function fetchCurrentUser() {
  try {
    const res = await fetch(`${API_BASE}/api/users/me`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const data = await res.json();
    if (data.success) {
      currentUser = data.user;
      updateUI(currentUser);
    }
  } catch (err) {
    console.error("Fetch user error:", err);
  }
}

async function fetchGames() {
  try {
    const res = await fetch(`${API_BASE}/api/games`);
    const data = await res.json();

    if (data.success) {
      const grid = document.getElementById("games-grid");
      grid.innerHTML = "";

      data.games.forEach((game) => {
        const card = document.createElement("div");
        card.className = "game-card bg-gray-800 p-4 rounded-lg";
        card.innerHTML = `
          <h3 class="text-lg font-bold mb-2">${game.name}</h3>
          <p class="text-sm text-gray-400 mb-2">Entry: 🪙 ${game.entryFee}</p>
          <button class="w-full bg-blue-600 py-2 rounded-lg font-semibold hover:bg-blue-500">
            Play
          </button>
        `;
        card.querySelector("button").addEventListener("click", () => playGame(game._id));
        grid.appendChild(card);
      });
    }
  } catch (err) {
    console.error("Games fetch error:", err);
  }
}

async function fetchPackages() {
  try {
    const res = await fetch(`${API_BASE}/api/wallet/packages`);
    const data = await res.json();

    if (data.success) {
      const container = document.getElementById("coin-packages");
      container.innerHTML = "";

      data.packages.forEach((pkg) => {
        const div = document.createElement("div");
        div.className = "bg-gray-800 p-4 rounded-lg flex justify-between items-center";
        div.innerHTML = `
          <div>
            <h4 class="font-semibold">🪙 ${pkg.coins} Coins</h4>
            <p class="text-sm text-gray-400">₹${pkg.price}</p>
          </div>
          <button class="bg-green-600 px-4 py-2 rounded-lg">Buy</button>
        `;
        div.querySelector("button").addEventListener("click", () => openPayment(pkg));
        container.appendChild(div);
      });
    }
  } catch (err) {
    console.error("Packages fetch error:", err);
  }
}

async function playGame(gameId) {
  try {
    const res = await fetch(`${API_BASE}/api/games/play`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ gameId }),
    });

    const data = await res.json();
    if (data.success) {
      alert(data.isWin ? `🎉 You won 🪙 ${data.winAmount}` : "😢 You lost");
      fetchCurrentUser();
    } else {
      alert(data.message || "Game error");
    }
  } catch (err) {
    console.error("Play game error:", err);
  }
}

// ===============================
// Wallet Payment
// ===============================
function openPayment(pkg) {
  document.getElementById("payment-modal").classList.remove("hidden");
  document.getElementById("payment-details").innerHTML = `
    <p class="mb-2">Package: 🪙 ${pkg.coins} Coins</p>
    <p class="mb-2">Price: ₹${pkg.price}</p>
  `;

  document.getElementById("phonepe-btn").onclick = () => {
    window.location.href = `phonepe://pay?pa=subhashkujhuria5558@paytm&pn=SKPartyRoom&am=${pkg.price}&cu=INR`;
  };

  document.getElementById("googlepay-btn").onclick = () => {
    window.location.href = `tez://upi/pay?pa=subhashkujhuria5558@paytm&pn=SKPartyRoom&am=${pkg.price}&cu=INR`;
  };

  document.getElementById("paytm-btn").onclick = () => {
    window.location.href = `paytmmp://pay?pa=subhashkujhuria5558@paytm&pn=SKPartyRoom&am=${pkg.price}&cu=INR`;
  };
}

function closePaymentModal() {
  document.getElementById("payment-modal").classList.add("hidden");
}

// ===============================
// Socket.io
// ===============================
function connectSocket() {
  socket = io(API_BASE, { transports: ["websocket"] });

  socket.on("connect", () => {
    console.log("✅ Connected to socket server:", socket.id);
  });

  socket.on("disconnect", () => {
    console.log("❌ Disconnected from socket");
  });
}

// ===============================
// Init App
// ===============================
window.addEventListener("load", async () => {
  setTimeout(() => {
    loadingScreen.classList.add("hidden");

    if (authToken) {
      mainApp.classList.remove("hidden");
      fetchCurrentUser();
      fetchGames();
      fetchPackages();
      connectSocket();
    } else {
      loginScreen.classList.remove("hidden");
      handleGoogleLogin();
    }
  }, 1500);
});

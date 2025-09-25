let currentUser = null;
let socket = null;
let authToken = null;

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    const savedToken = localStorage.getItem('sk_party_token');
    if (savedToken) {
        authToken = savedToken;
        verifyToken();
    } else {
        showLoginAfterLoading();
    }
}

function showLoginAfterLoading() {
    setTimeout(() => {
        document.getElementById('loading-screen').style.display = 'none';
        document.getElementById('login-screen').classList.remove('hidden');
        initializeGoogleSignIn();
    }, 2000);
}

function initializeGoogleSignIn() {
    if (window.google) {
        google.accounts.id.initialize({
            client_id: '111513181225548714566.apps.googleusercontent.com',
            callback: handleCredentialResponse,
            auto_select: false
        });

        google.accounts.id.renderButton(
            document.getElementById('google-signin'),
            {
                theme: 'filled_blue',
                size: 'large',
                width: '100%'
            }
        );
    }
}

function handleCredentialResponse(response) {
    authenticateWithBackend(response.credential);
}

function handleGoogleLogin() {
    if (window.google) {
        google.accounts.id.prompt();
    }
}

async function authenticateWithBackend(googleToken) {
    try {
        const response = await fetch('/api/auth/google', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: googleToken })
        });

        const data = await response.json();
        
        if (data.success) {
            authToken = data.token;
            currentUser = data.user;
            localStorage.setItem('sk_party_token', authToken);
            
            showMainApp();
            initializeSocket();
            loadUserData();
        } else {
            alert('Login failed: ' + data.message);
        }
    } catch (error) {
        alert('Login failed. Please try again.');
    }
}

async function verifyToken() {
    try {
        const response = await fetch('/api/users/me', {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (response.ok) {
            const data = await response.json();
            currentUser = data.user;
            showMainApp();
            initializeSocket();
            loadUserData();
        } else {
            localStorage.removeItem('sk_party_token');
            showLoginAfterLoading();
        }
    } catch (error) {
        localStorage.removeItem('sk_party_token');
        showLoginAfterLoading();
    }
}

function showMainApp() {
    document.getElementById('loading-screen').style.display = 'none';
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('main-app').classList.remove('hidden');
}

function initializeSocket() {
    socket = io();
    socket.on('connect', () => console.log('Connected to server'));
}

function loadUserData() {
    if (!currentUser) return;
    
    document.getElementById('user-name').textContent = currentUser.name;
    document.getElementById('user-avatar').src = currentUser.avatar;
    document.getElementById('user-coins').textContent = `🪙 ${currentUser.coins.toLocaleString()}`;
    document.getElementById('user-diamonds').textContent = `💎 ${currentUser.diamonds.toLocaleString()}`;
    
    document.getElementById('profile-name').textContent = currentUser.name;
    document.getElementById('profile-email').textContent = currentUser.email;
    document.getElementById('profile-avatar').src = currentUser.avatar;
    document.getElementById('profile-games').textContent = currentUser.gameStats?.gamesPlayed || 0;
    document.getElementById('profile-wins').textContent = currentUser.gameStats?.gamesWon || 0;
    document.getElementById('profile-winnings').textContent = (currentUser.gameStats?.totalWinnings || 0).toLocaleString();
    
    document.getElementById('wallet-coins').textContent = currentUser.coins.toLocaleString();
    document.getElementById('wallet-diamonds').textContent = currentUser.diamonds.toLocaleString();
    
    loadGames();
    loadCoinPackages();
}

async function loadGames() {
    try {
        const response = await fetch('/api/games');
        const data = await response.json();
        if (data.success) {
            displayGames(data.games);
        }
    } catch (error) {
        console.error('Failed to load games:', error);
    }
}

function displayGames(games) {
    const gamesGrid = document.getElementById('games-grid');
    gamesGrid.innerHTML = '';
    
    games.forEach(game => {
        const gameCard = document.createElement('div');
        gameCard.className = 'game-card p-6 rounded-xl cursor-pointer shadow-lg';
        gameCard.onclick = () => playGame(game);
        
        gameCard.innerHTML = `
            <div class="text-center">
                <div class="text-4xl mb-3">${game.icon}</div>
                <h4 class="font-bold text-lg mb-2">${game.name}</h4>
                <div class="text-sm bg-white/20 rounded-full px-3 py-1">
                    Entry: ${game.entryFee} coins
                </div>
            </div>
        `;
        
        gamesGrid.appendChild(gameCard);
    });
}

async function playGame(game) {
    if (currentUser.coins < game.entryFee) {
        alert(`Insufficient coins! You need ${game.entryFee} coins to play.`);
        showSection('wallet');
        return;
    }
    
    if (!confirm(`Play ${game.name} for ${game.entryFee} coins?`)) {
        return;
    }
    
    try {
        const response = await fetch('/api/games/join', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ gameId: game._id })
        });
        
        const data = await response.json();
        
        if (data.success) {
            currentUser.coins = data.remainingCoins;
            updateCoinDisplay();
            
            setTimeout(async () => {
                const playResponse = await fetch('/api/games/play', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`
                    },
                    body: JSON.stringify({ gameId: game._id })
                });
                
                const playData = await playResponse.json();
                
                if (playData.success) {
                    currentUser.coins = playData.newBalance;
                    updateCoinDisplay();
                    
                    if (playData.isWin) {
                        alert(`🎉 You won ${playData.winAmount} coins!`);
                    } else {
                        alert('😔 Better luck next time!');
                    }
                }
            }, 1500);
        } else {
            alert(data.message);
        }
    } catch (error) {
        alert('Failed to join game. Please try again.');
    }
}

function updateCoinDisplay() {
    document.getElementById('user-coins').textContent = `🪙 ${currentUser.coins.toLocaleString()}`;
    document.getElementById('wallet-coins').textContent = currentUser.coins.toLocaleString();
}

async function loadCoinPackages() {
    try {
        const response = await fetch('/api/wallet/packages');
        const data = await response.json();
        if (data.success) {
            displayCoinPackages(data.packages);
        }
    } catch (error) {
        console.error('Failed to load packages:', error);
    }
}

function displayCoinPackages(packages) {
    const packagesContainer = document.getElementById('coin-packages');
    packagesContainer.innerHTML = '';
    
    packages.forEach(pkg => {
        const packageCard = document.createElement('div');
        packageCard.className = 'bg-gray-700 p-4 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors';
        packageCard.onclick = () => initiatePayment(pkg);
        
        packageCard.innerHTML = `
            <div class="flex justify-between items-center">
                <div>
                    <div class="font-semibold text-yellow-400">🪙 ${pkg.coins.toLocaleString()}</div>
                </div>
                <div class="text-right">
                    <div class="font-bold text-lg">₹${pkg.price}</div>
                    <button class="text-blue-400 text-sm">Recharge</button>
                </div>
            </div>
        `;
        
        packagesContainer.appendChild(packageCard);
    });
}

async function initiatePayment(package) {
    try {
        const response = await fetch('/api/wallet/recharge', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                amount: package.price,
                coins: package.coins
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showPaymentModal(data.paymentData, package);
        }
    } catch (error) {
        alert('Payment failed. Please try again.');
    }
}

function showPaymentModal(paymentData, package) {
    const modal = document.getElementById('payment-modal');
    const details = document.getElementById('payment-details');
    
    details.innerHTML = `
        <div class="text-2xl font-bold">₹${paymentData.amount}</div>
        <div class="text-yellow-400">${package.coins.toLocaleString()} Coins</div>
        <div class="text-sm text-gray-400">UPI ID: subhashkujhuria5558@paytm</div>
    `;
    
    document.getElementById('phonepe-btn').onclick = () => {
        window.location.href = paymentData.upiLinks.phonepe;
        setTimeout(() => verifyPayment(paymentData.orderId, package.coins), 3000);
    };
    
    document.getElementById('googlepay-btn').onclick = () => {
        window.location.href = paymentData.upiLinks.googlepay;
        setTimeout(() => verifyPayment(paymentData.orderId, package.coins), 3000);
    };
    
    document.getElementById('paytm-btn').onclick = () => {
        window.location.href = paymentData.upiLinks.paytm;
        setTimeout(() => verifyPayment(paymentData.orderId, package.coins), 3000);
    };
    
    modal.classList.remove('hidden');
}

function closePaymentModal() {
    document.getElementById('payment-modal').classList.add('hidden');
}

async function verifyPayment(orderId, coins) {
    closePaymentModal();
    
    const confirmed = confirm(`Did you complete the payment? Click OK to add ${coins.toLocaleString()} coins to your account.`);
    
    if (confirmed) {
        try {
            const response = await fetch('/api/wallet/verify-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({ orderId, coins })
            });
            
            const data = await response.json();
            
            if (data.success) {
                currentUser.coins = data.newBalance;
                updateCoinDisplay();
                alert(`🎉 Payment successful! ${coins.toLocaleString()} coins added to your account.`);
            }
        } catch (error) {
            alert('Payment verification failed. Please contact support.');
        }
    }
}

function showSection(sectionName) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.add('hidden');
    });
    
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('bg-purple-600');
    });
    
    document.getElementById(`${sectionName}-section`).classList.remove('hidden');
    event.target.classList.add('bg-purple-600');
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('sk_party_token');
        currentUser = null;
        authToken = null;
        
        if (socket) {
            socket.disconnect();
        }
        
        location.reload();
    }
}

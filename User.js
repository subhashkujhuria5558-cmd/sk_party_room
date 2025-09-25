<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SK Party Room - Professional Voice Chat & Gaming</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://accounts.google.com/gsi/client" async defer></script>
    <script src="https://cdn.socket.io/4.7.2/socket.io.min.js"></script>
    <style>
        .gradient-bg { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .game-card { transition: all 0.3s ease; }
        .game-card:hover { transform: translateY(-5px); }
    </style>
</head>
<body class="bg-gray-900 text-white min-h-screen">
    <div id="app">
        <!-- Loading Screen -->
        <div id="loading-screen" class="fixed inset-0 gradient-bg flex items-center justify-center z-50">
            <div class="text-center">
                <div class="text-6xl mb-4">🎉</div>
                <h1 class="text-4xl font-bold mb-2">SK Party Room</h1>
                <p class="text-lg opacity-80">Loading amazing features...</p>
                <div class="mt-4">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
                </div>
            </div>
        </div>

        <!-- Login Screen -->
        <div id="login-screen" class="hidden fixed inset-0 gradient-bg flex items-center justify-center z-40">
            <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full mx-4">
                <div class="text-center mb-8">
                    <div class="text-5xl mb-4">🎉</div>
                    <h1 class="text-3xl font-bold mb-2">SK Party Room</h1>
                    <p class="text-gray-200">Join the ultimate party experience!</p>
                </div>

                <div id="google-signin" class="mb-4"></div>

                <button onclick="handleGoogleLogin()" 
                        class="w-full bg-white text-gray-900 py-3 px-6 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center space-x-2">
                    <svg class="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span>Login with Google</span>
                </button>
            </div>
        </div>

        <!-- Main App -->
        <div id="main-app" class="hidden">
            <!-- Header -->
            <header class="bg-gray-800 p-4 flex items-center justify-between">
                <div class="flex items-center space-x-3">
                    <img id="user-avatar" class="w-10 h-10 rounded-full" src="" alt="Avatar">
                    <div>
                        <h2 id="user-name" class="font-semibold"></h2>
                        <div class="flex items-center space-x-4 text-sm text-yellow-400">
                            <span id="user-coins">🪙 0</span>
                            <span id="user-diamonds">💎 0</span>
                        </div>
                    </div>
                </div>
                <button onclick="logout()" class="text-red-400 hover:text-red-300">Logout</button>
            </header>

            <!-- Navigation -->
            <nav class="bg-gray-800 border-t border-gray-700">
                <div class="flex justify-around py-2">
                    <button onclick="showSection('home')" class="nav-btn py-2 px-4 text-blue-400">🏠 Home</button>
                    <button onclick="showSection('rooms')" class="nav-btn py-2 px-4">🎤 Rooms</button>
                    <button onclick="showSection('games')" class="nav-btn py-2 px-4">🎮 Games</button>
                    <button onclick="showSection('wallet')" class="nav-btn py-2 px-4">💰 Wallet</button>
                    <button onclick="showSection('profile')" class="nav-btn py-2 px-4">👤 Profile</button>
                </div>
            </nav>

            <!-- Content Sections -->
            <main class="p-4 pb-20">
                <!-- Home Section -->
                <section id="home-section" class="section">
                    <div class="text-center mb-6">
                        <h2 class="text-2xl font-bold mb-2">Welcome to SK Party Room!</h2>
                        <p class="text-gray-400">Connect, Play, Win!</p>
                    </div>

                    <div class="grid grid-cols-2 gap-4 mb-6">
                        <div class="bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-lg">
                            <h3 class="font-semibold mb-2">🎤 Voice Rooms</h3>
                            <p class="text-sm opacity-90">Join live conversations</p>
                        </div>
                        <div class="bg-gradient-to-r from-green-500 to-blue-500 p-4 rounded-lg">
                            <h3 class="font-semibold mb-2">🎮 Games</h3>
                            <p class="text-sm opacity-90">Play and win coins</p>
                        </div>
                    </div>
                </section>

                <!-- Games Section -->
                <section id="games-section" class="section hidden">
                    <h2 class="text-2xl font-bold mb-4">🎮 Game Center</h2>
                    <div id="games-grid" class="grid grid-cols-2 gap-4">
                        <!-- Games will be loaded here -->
                    </div>
                </section>

                <!-- Wallet Section -->
                <section id="wallet-section" class="section hidden">
                    <h2 class="text-2xl font-bold mb-4">💰 My Wallet</h2>

                    <div class="bg-gray-800 p-4 rounded-lg mb-6">
                        <h3 class="text-lg font-semibold mb-2">Balance</h3>
                        <div class="flex space-x-4">
                            <div class="text-yellow-400">
                                <span class="text-2xl">🪙</span>
                                <span id="wallet-coins" class="text-xl font-bold">0</span>
                            </div>
                            <div class="text-blue-400">
                                <span class="text-2xl">💎</span>
                                <span id="wallet-diamonds" class="text-xl font-bold">0</span>
                            </div>
                        </div>
                    </div>

                    <h3 class="text-lg font-semibold mb-4">Recharge Coins</h3>
                    <div id="coin-packages" class="space-y-3">
                        <!-- Coin packages will be loaded here -->
                    </div>
                </section>

                <!-- Rooms Section -->
                <section id="rooms-section" class="section hidden">
                    <h2 class="text-2xl font-bold mb-4">🎤 Voice Rooms</h2>
                    <div class="text-center text-gray-400">
                        <p>Voice rooms coming soon!</p>
                    </div>
                </section>

                <!-- Profile Section -->
                <section id="profile-section" class="section hidden">
                    <h2 class="text-2xl font-bold mb-4">👤 Profile</h2>
                    <div class="bg-gray-800 p-4 rounded-lg">
                        <div class="flex items-center space-x-4 mb-4">
                            <img id="profile-avatar" class="w-16 h-16 rounded-full" src="" alt="Avatar">
                            <div>
                                <h3 id="profile-name" class="text-lg font-semibold"></h3>
                                <p id="profile-email" class="text-gray-400"></p>
                            </div>
                        </div>

                        <div class="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <div class="text-2xl font-bold" id="profile-level">1</div>
                                <div class="text-sm text-gray-400">Level</div>
                            </div>
                            <div>
                                <div class="text-2xl font-bold" id="profile-games">0</div>
                                <div class="text-sm text-gray-400">Games</div>
                            </div>
                            <div>
                                <div class="text-2xl font-bold" id="profile-wins">0</div>
                                <div class="text-sm text-gray-400">Wins</div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>

        <!-- Payment Modal -->
        <div id="payment-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
                <h3 class="text-xl font-bold mb-4">Complete Payment</h3>
                <div id="payment-details" class="mb-4">
                    <!-- Payment details will be shown here -->
                </div>
                <div class="space-y-3">
                    <button id="phonepe-btn" class="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold">
                        📱 Pay with PhonePe
                    </button>
                    <button id="googlepay-btn" class="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold">
                        💳 Pay with Google Pay
                    </button>
                    <button id="paytm-btn" class="w-full bg-blue-800 text-white py-3 rounded-lg font-semibold">
                        💰 Pay with Paytm
                    </button>
                    <button onclick="closePaymentModal()" class="w-full bg-gray-600 text-white py-3 rounded-lg">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    </div>

    <script src="app.js"></script>
</body>
</html>

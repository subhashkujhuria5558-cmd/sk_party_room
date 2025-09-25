# SK Party Room - Professional Voice Chat & Gaming Platform

A full-stack real-time party room application with voice chat, games, and virtual economy.

## Features

🎤 **Voice Chat Rooms**
- 15-seat party rooms
- Real-time voice communication
- Room owner controls (mute, kick, lock seats)
- Live chat messaging

🎮 **Game Center**  
- 10+ different games (Slots, Fishing, Puzzle, etc.)
- Real coin entry fees and payouts
- Live multiplayer gaming
- Game statistics and leaderboards

💰 **Wallet System**
- Multiple coin packages
- UPI payment integration (PhonePe, Google Pay, Paytm)
- Real-time balance updates
- Transaction history

👥 **Social Features**
- Google OAuth authentication
- User profiles and levels
- Friend system
- Gift sending and receiving
- Daily rewards

## Tech Stack

- **Backend**: Node.js, Express.js, Socket.io, MongoDB
- **Frontend**: HTML5, CSS3, JavaScript, TailwindCSS
- **Auth**: Google OAuth 2.0
- **Payments**: UPI Deep Links
- **Real-time**: WebSocket, Socket.io

## Railway Deployment

### 1. Environment Variables

Set these in your Railway dashboard:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/skpartyroom
JWT_SECRET=your_jwt_secret_here
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NODE_ENV=production
```

### 2. Database Setup

1. Create a MongoDB Atlas account
2. Create a new cluster
3. Get your connection string
4. Add it to Railway environment variables

### 3. Google OAuth Setup

1. Go to Google Cloud Console
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add your Railway domain to authorized origins
6. Add credentials to environment variables

### 4. Deploy

1. Push code to GitHub
2. Connect GitHub repo to Railway
3. Railway will automatically deploy
4. Your app will be live at your Railway URL

## Local Development

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your credentials

# Start development server
npm run dev

# Application runs on http://localhost:3001
```

## API Endpoints

### Authentication
- `POST /api/auth/google` - Google OAuth login

### Users  
- `GET /api/users/me` - Get current user
- `PUT /api/users/profile` - Update profile
- `POST /api/users/daily-checkin` - Daily rewards

### Wallet
- `GET /api/wallet/balance` - Get coin balance
- `GET /api/wallet/packages` - Get coin packages
- `POST /api/wallet/recharge` - Create payment order
- `POST /api/wallet/verify-payment` - Verify payment

### Games
- `GET /api/games` - Get all games
- `POST /api/games/join` - Join game
- `POST /api/games/play` - Play game

### Rooms
- `GET /api/rooms` - Get all rooms
- `POST /api/rooms/create` - Create room
- `POST /api/rooms/join/:id` - Join room
- `POST /api/rooms/leave/:id` - Leave room

### Gifts
- `GET /api/gifts` - Get gift types
- `POST /api/gifts/send` - Send gift
- `POST /api/gifts/red-packet` - Create red packet

## Socket Events

### Room Events
- `join-room` - Join a room
- `leave-room` - Leave a room
- `user-joined` - User joined notification
- `user-left` - User left notification

### Chat Events  
- `send-message` - Send chat message
- `receive-message` - Receive chat message

### Game Events
- `game-move` - Game move/action
- `game-update` - Game state update

### Gift Events
- `send-gift` - Send gift
- `receive-gift` - Receive gift notification

## Features Implementation

### Payment Integration
- UPI deep links for popular apps
- Manual payment verification
- Real-time coin updates
- Transaction logging

### Game Logic
- Entry fee validation
- Random win/loss calculation
- Coin balance management
- Session tracking

### Room Management  
- 15-seat layout
- Owner privilege system
- Real-time user updates
- Voice chat integration

## Security Features

- JWT authentication
- Input validation
- Rate limiting ready
- Secure payment handling
- User session management

## Scalability

- MongoDB for data persistence
- Socket.io for real-time features  
- Stateless API design
- Ready for horizontal scaling

## Support

For deployment issues or questions, check the Railway documentation or contact support.

## License

This project is proprietary software for SK Party Room.

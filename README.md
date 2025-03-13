# Chess Game with AI

A real-time chess game application with multiplayer support and computer opponent using Stockfish.

## Features

- Real-time multiplayer chess games
- Computer opponent with adjustable difficulty levels
- User authentication and profiles
- Game history and statistics
- Responsive design
- Sound effects and visual feedback

## Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account
- Stockfish chess engine (for computer games)

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/chess-game.git
cd chess-game
```

2. Install server dependencies:
```bash
npm install
```

3. Install client dependencies:
```bash
cd client
npm install
```

4. Install Stockfish:
- Windows: Download from [Stockfish website](https://stockfishchess.org/download/) and add to PATH
- Linux: `sudo apt-get install stockfish`
- macOS: `brew install stockfish`

## Running the Application

1. Start the server:
```bash
# From the root directory
npm start
```

2. Start the client:
```bash
# From the client directory
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Deployment

1. Create a MongoDB Atlas cluster and get your connection string
2. Set up environment variables in your hosting platform (e.g., Render.com)
3. Deploy the application:
   - Frontend: Deploy the `client` directory
   - Backend: Deploy the root directory

## Project Structure

```
chess-game/
├── client/                 # React frontend
│   ├── public/
│   └── src/
│       ├── components/     # React components
│       ├── context/        # React context
│       ├── pages/         # Page components
│       └── utils/         # Utility functions
├── models/                # MongoDB models
├── routes/               # API routes
├── server.js             # Express server
└── package.json
```

## API Endpoints

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/games` - Create a new game
- `GET /api/games/:id` - Get game details
- `PATCH /api/games/:id/status` - Update game status

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Stockfish](https://stockfishchess.org/) - Chess engine
- [Chessboard.js](https://chessboardjs.com/) - Chess board component
- [Socket.io](https://socket.io/) - Real-time communication 
# Multiplayer Wordle Game

A real-time multiplayer Wordle game where players can create rooms and take turns guessing five-letter words together.

## Features

- User authentication with JWT
- Create public or private game rooms
- Real-time multiplayer gameplay using Socket.io
- Turn-based word guessing
- Color-coded feedback (correct, present, absent)
- Random word generation for each game
- Player management and room status tracking

## Tech Stack

### Backend
- Node.js & Express
- MongoDB
- Socket.io
- bcrypt for password hashing
- JWT for authentication

### Frontend
- React.js
- React Router
- Socket.io-client
- Custom UI components

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or remote instance)
- npm or yarn

## Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd wordle
```

### 2. Setup Environment Variables

Create a `.env` file in the `server` directory:
```
MONGO_URI=mongodb://localhost:27017/wordle
PORT=6790
JWT_SECRET=your_jwt_secret_here
```

### 3. Install Dependencies

Backend:
```bash
cd server
npm install
```

Frontend:
```bash
cd client
npm install
```

## Running the Application

### 1. Start MongoDB
Make sure your MongoDB server is running.

### 2. Start the Backend Server
```bash
cd server
npm start
```
Server will run on `http://localhost:6790`

### 3. Start the Frontend Client
```bash
cd client
npm start
```
Client will run on `http://localhost:3000`

## Project Structure

```
wordle/
├── server/
│   ├── src/
│   │   ├── controllers/      
│   │   ├── db/               
│   │   ├── middleware/       
│   │   ├── models/           
│   │   ├── routes/           
│   │   ├── services/         
│   │   ├── socket/           
│   │   └── server.js         
│   ├── sampleData/           
│   └── package.json
│
└── client/
    ├── src/
    │   ├── components/       
    │   ├── api.js            
    │   ├── App.js            
    │   └── index.css         
    └── package.json
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user

### Users
- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `POST /users` - Create new user
- `PATCH /users/:id` - Update user (requires JWT)
- `DELETE /users/:id` - Delete user (requires JWT)

### Rooms
- `GET /rooms` - Get all rooms
- `GET /rooms/:id` - Get room by ID
- `POST /rooms` - Create new room (requires JWT)
- `PATCH /rooms/:id` - Update room (requires JWT, creator only)
- `DELETE /rooms/:id` - Delete room (requires JWT, creator only)
- `POST /rooms/:id/verify` - Verify room password

## Socket.io Events

### Client to Server
- `joinGame` - Join a game room
- `submitGuess` - Submit a word guess
- `disconnect` - Leave the game

### Server to Client
- `gameState` - Current game state update
- `playerJoined` - New player joined notification
- `playerLeft` - Player left notification
- `gameOver` - Game ended notification
- `error` - Error message

## Game Rules

1. Players take turns guessing a five-letter word
2. Each game allows up to 6 guesses
3. After each guess, letters are colored:
   - **Pink**: Letter is correct and in the right position
   - **White**: Letter is in the word but in the wrong position
   - **Gray**: Letter is not in the word
4. The game ends when:
   - A player guesses the word correctly (win)
   - All 6 guesses are used (loss)


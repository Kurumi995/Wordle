import { roomService } from '../services/roomService.js';
import { gameService } from '../services/gameService.js';

const rooms = {};

export const initGameSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // 1. Join Game
    socket.on('joinGame', async ({ roomId, userId, username }) => {
      console.log(`${username} is joining room ${roomId}`);

      socket.join(roomId);
      
      socket.data.userId = userId;
      socket.data.username = username;
      socket.data.roomId = roomId;
    
      // Check if the room exists
      if (!rooms[roomId]) {
        const roomData = await roomService.getById(roomId);
        if (!roomData) {
          socket.emit('error', 'Room not found.');
          return;
        }

        rooms[roomId] = {
          targetWord: roomData.targetWord,
          players: [],
          guesses: Array(6).fill(null).map(() => Array(5).fill({ letter: '', status: '' })),
          currentRow: 0,
          currentPlayerIndex: 0,
          gameOver: false,
          won: false,
        };
      }

      const room = rooms[roomId];

      // Add the player to the room
      if (!room.players.some(p => p.userId === userId)) {
        room.players.push({ userId, username, socketId: socket.id });
        console.log(`${username} added to room ${roomId}. Total players: ${room.players.length}`);
      } else {
        const player = room.players.find(p => p.userId === userId);
        player.socketId = socket.id;
        console.log(`${username} reconnected to room ${roomId}`);
      }

      // Emit the game state to all players in the room
      io.to(roomId).emit('gameState', {
        players: room.players.map(p => ({ userId: p.userId, username: p.username })),
        guesses: room.guesses,
        currentRow: room.currentRow,
        currentPlayer: room.players[room.currentPlayerIndex]?.username,
        gameOver: room.gameOver,
        won: room.won,
      });

      io.to(roomId).emit('playerJoined', { userId, username });
    });

    // 2. Submit Guess
    socket.on('submitGuess', async ({ roomId, guess }) => {
      const room = rooms[roomId];

      // Check if it is the current player's turn
      if (room.players[room.currentPlayerIndex]?.socketId !== socket.id) {
        socket.emit('error', 'It is not your turn.');
        return;
      }

      const { result, won } = gameService.checkGuess(guess.toUpperCase(), room.targetWord);

      room.guesses[room.currentRow] = result;
      room.won = won;

      if (won || room.currentRow === 5) {
        room.gameOver = true;
      } else {
        room.currentRow++;
        room.currentPlayerIndex = (room.currentPlayerIndex + 1) % room.players.length;
      }

      io.to(roomId).emit('gameState', {
        players: room.players.map(p => ({ userId: p.userId, username: p.username })),
        guesses: room.guesses,
        currentRow: room.currentRow,
        currentPlayer: room.players[room.currentPlayerIndex]?.username,
        gameOver: room.gameOver,
        won: room.won,
      });

      if (room.gameOver) {
        io.to(roomId).emit('gameOver', { won: room.won, targetWord: room.targetWord });
      }
    });

    // 3. Disconnect
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      
      const roomId = socket.data.roomId;
      const userId = socket.data.userId;
      const username = socket.data.username;
      
      if (!roomId || !rooms[roomId]) {
        return;
      }

      const room = rooms[roomId];
      const playerIndex = room.players.findIndex(p => p.socketId === socket.id);
      
      if (playerIndex !== -1) {
        room.players.splice(playerIndex, 1);
        console.log(`${username} left room ${roomId}. Remaining players: ${room.players.length}`);

        io.to(roomId).emit('playerLeft', { userId, username });

        if (room.players.length === 0) {
          delete rooms[roomId];
          console.log(`Room ${roomId} deleted (no players left)`);
        } else {
          if (room.currentPlayerIndex >= room.players.length) {
            room.currentPlayerIndex = 0;
          }

          io.to(roomId).emit('gameState', {
            players: room.players.map(p => ({ userId: p.userId, username: p.username })),
            guesses: room.guesses,
            currentRow: room.currentRow,
            currentPlayer: room.players[room.currentPlayerIndex]?.username,
            gameOver: room.gameOver,
            won: room.won,
          });
        }
      }
    });
  });
};


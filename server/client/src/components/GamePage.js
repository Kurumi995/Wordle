import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

const SOCKET_SERVER_URL = (process.env.REACT_APP_SOCKET_URL || window.location.origin).replace(/\/$/, '');

function GamePage({ currentUser }) {
  const location = useLocation();
  const navigate = useNavigate();
  const room = location.state?.room;

  const [socket, setSocket] = useState(null);
  const [players, setPlayers] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState('');
  const [guesses, setGuesses] = useState(Array(6).fill(null).map(() => Array(5).fill({ letter: '', status: '' })));
  const [currentGuess, setCurrentGuess] = useState('');
  const [currentRow, setCurrentRow] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [error, setError] = useState('');

  const isMyTurn = currentUser && currentPlayer === currentUser.username;

  useEffect(() => {
    if (!room || !currentUser) {
      navigate('/rooms');
      return;
    }

    const newSocket = io(SOCKET_SERVER_URL);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to server');
      newSocket.emit('joinGame', { roomId: room.id, userId: currentUser.id, username: currentUser.username });
    });

    newSocket.on('gameState', (state) => {
      setPlayers(state.players);
      setGuesses(state.guesses);
      setCurrentRow(state.currentRow);
      setCurrentPlayer(state.currentPlayer);
      setGameOver(state.gameOver);
      setWon(state.won);
      setCurrentGuess('');
    });

    newSocket.on('playerJoined', ({ username }) => {
      console.log(`${username} joined the game`);
    });

    newSocket.on('playerLeft', ({ username }) => {
      console.log(`${username} left the game`);
    });

    newSocket.on('error', (message) => {
      setError(message);
    });

    newSocket.on('gameOver', ({ won, targetWord }) => {
      setGameOver(true);
      setWon(won);
      if (!won) {
        setError(`Game Over! The word was: ${targetWord}`);
      }
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    return () => {
      newSocket.disconnect();
    };
  }, [room, currentUser, navigate]);

  const handleKeyPress = (key) => {
    if (gameOver || !isMyTurn) return;

    if (key === 'ENTER') {
      if (currentGuess.length === 5) {
        socket.emit('submitGuess', { roomId: room.id, guess: currentGuess.toUpperCase() });
        setError('');
      } else {
        setError('Guess must be 5 letters long.');
      }
    } else if (key === 'BACK') {
      setCurrentGuess(prev => prev.slice(0, -1));
      setError('');
    } else if (currentGuess.length < 5 && /^[A-Z]$/i.test(key)) {
      setCurrentGuess(prev => prev + key.toUpperCase());
      setError('');
    }
  };

  if (!room) {
    return null;
  }

  const keyboardRows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACK']
  ];

  return (
    <div className="game-container">
      <div className="game-header">
        <button className="btn btn-secondary" onClick={() => navigate('/rooms')}>
          Back to Rooms
        </button>
        <h2>Room {room.id.substring(0, 8)}</h2>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="player-list card">
        <h3>Players:</h3>
        <ul>
          {players.map(player => (
            <li key={player.userId} className={player.username === currentPlayer ? 'current-player' : ''}>
              {player.username} {player.username === currentUser.username && '(You)'}
            </li>
          ))}
        </ul>
        {isMyTurn ? (
          <p style={{ color: '#FF3399', fontWeight: 'bold' }}>Your Turn!</p>
        ) : (
          <p style={{ color: '#666' }}>{currentPlayer}'s Turn</p>
        )}
      </div>

      <div className="game-board">
        {guesses.map((guessRow, rowIndex) => (
          <div key={rowIndex} className="guess-row">
            {Array(5).fill(null).map((_, colIndex) => {
              const displayGuess = rowIndex === currentRow && !gameOver ? currentGuess : guessRow.map(g => g.letter).join('');
              const letter = displayGuess[colIndex] || '';

              const cellStatus = guessRow[colIndex]?.status;
              let bgColor = '';
              let textColor = '#000';

              if (rowIndex < currentRow || gameOver) {
                if (cellStatus === 'correct') {
                  bgColor = '#FF3399';
                  textColor = 'white';
                } else if (cellStatus === 'present') {
                  bgColor = 'white';
                  textColor = '#000';
                } else if (cellStatus === 'absent') {
                  bgColor = '#ccc';
                  textColor = 'white';
                }
              }

              return (
                <div
                  key={colIndex}
                  className="letter-cell"
                  style={{
                    backgroundColor: bgColor,
                    color: textColor,
                    border: bgColor ? 'none' : '2px solid #FF3399'
                  }}
                >
                  {letter}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {gameOver && (
        <div className="game-result">
          {won ? (
            <h2 style={{ color: '#FF3399' }}>You Won!</h2>
          ) : (
            <div>
              <h2 style={{ color: '#666' }}>Game Over</h2>
              {error && <p>{error}</p>}
            </div>
          )}
        </div>
      )}

      <div className="keyboard">
        {keyboardRows.map((row, rowIndex) => (
          <div key={rowIndex} className="keyboard-row">
            {row.map((key) => (
              <button
                key={key}
                className={`key-button ${key.length > 1 ? 'special-key' : ''}`}
                onClick={() => handleKeyPress(key)}
                disabled={gameOver || !isMyTurn}
              >
                {key === 'BACK' ? '←' : key}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default GamePage;

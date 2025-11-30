import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { roomAPI } from '../api';

function GamePage({ currentUser }) {
  const location = useLocation();
  const navigate = useNavigate();
  const room = location.state?.room;
  
  const [guesses, setGuesses] = useState([]);
  const [guessResults, setGuessResults] = useState([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!room) {
      navigate('/rooms');
    }
  }, [room, navigate]);

  const handleKeyPress = (key) => {
    if (gameOver || submitting) return;

    if (key === 'ENTER') {
      if (currentGuess.length === 5) {
        submitGuess();
      }
    } else if (key === 'BACK') {
      setCurrentGuess(prev => prev.slice(0, -1));
    } else if (currentGuess.length < 5) {
      setCurrentGuess(prev => prev + key);
    }
  };

  const submitGuess = async () => {
    if (guesses.length >= 6) return;
    
    setSubmitting(true);
    try {
      const result = await roomAPI.submitGuess(room.id, currentGuess);
      
      setGuesses([...guesses, currentGuess]);
      setGuessResults([...guessResults, result.result]);
      
      if (result.won) {
        setWon(true);
        setGameOver(true);
      } else if (guesses.length === 5) {
        setGameOver(true);
      }
      
      setCurrentGuess('');
    } catch (err) {
      console.error('Failed to submit guess:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const getCellColor = (status) => {
    switch (status) {
      case 'correct':
        return '#FF3399';
      case 'present':
        return 'white';
      case 'absent':
        return '#ccc';
      default:
        return '';
    }
  };

  const getCellTextColor = (status) => {
    switch (status) {
      case 'correct':
      case 'absent':
        return 'white';
      case 'present':
        return '#000';
      default:
        return '#000';
    }
  };

  if (!room) {
    return null;
  }

  return (
    <div className="game-container">
      <div className="game-header">
        <button className="btn btn-secondary" onClick={() => navigate('/rooms')}>
          Back to Rooms
        </button>
        <h2>Room {room.id.substring(0, 8)}</h2>
      </div>

      <div className="game-board">
        {[0, 1, 2, 3, 4, 5].map((rowIndex) => (
          <div key={rowIndex} className="guess-row">
            {[0, 1, 2, 3, 4].map((colIndex) => {
              const isCurrentRow = rowIndex === guesses.length && !gameOver;
              const letter = isCurrentRow
                ? currentGuess[colIndex] || '' 
                : (guesses[rowIndex] && guesses[rowIndex][colIndex]) || '';
              
              const cellResult = guessResults[rowIndex] && guessResults[rowIndex][colIndex];
              const bgColor = cellResult ? getCellColor(cellResult.status) : '';
              const textColor = cellResult ? getCellTextColor(cellResult.status) : '#000';

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
              <p>Better luck next time!</p>
            </div>
          )}
        </div>
      )}

      <div className="keyboard">
        {['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'].map((row, rowIndex) => (
          <div key={rowIndex} className="keyboard-row">
            {rowIndex === 2 && (
              <button 
                className="key-button special-key" 
                onClick={() => handleKeyPress('ENTER')}
                disabled={submitting}
              >
                ENTER
              </button>
            )}
            {row.split('').map((key) => (
              <button
                key={key}
                className="key-button"
                onClick={() => handleKeyPress(key)}
                disabled={submitting}
              >
                {key}
              </button>
            ))}
            {rowIndex === 2 && (
              <button 
                className="key-button special-key" 
                onClick={() => handleKeyPress('BACK')}
                disabled={submitting}
              >
                ←
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default GamePage;

export const gameService = {
  checkGuess: (guess, targetWord) => {
    const result = [];
    const guessUpper = guess.toUpperCase();
    const targetUpper = targetWord.toUpperCase();
    
    for (let i = 0; i < 5; i++) {
      const guessLetter = guessUpper[i];
      const targetLetter = targetUpper[i];
      
      if (guessLetter === targetLetter) {
        result.push({ letter: guessLetter, status: 'correct' });
      } else if (targetUpper.includes(guessLetter)) {
        result.push({ letter: guessLetter, status: 'present' });
      } else {
        result.push({ letter: guessLetter, status: 'absent' });
      }
    }
    
    return result;
  }
};


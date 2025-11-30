const checkGuess = (guess, targetWord) => {
  const result = [];
  const targetLetters = targetWord.split('');
  const guessLetters = guess.split('');

  const letterCounts = {};
  for (const letter of targetLetters) {
    letterCounts[letter] = (letterCounts[letter] || 0) + 1;
  }

  for (let i = 0; i < 5; i++) {
    if (guessLetters[i] === targetLetters[i]) {
      result[i] = { letter: guessLetters[i], status: 'correct' };
      letterCounts[guessLetters[i]]--;
    }
  }

  for (let i = 0; i < 5; i++) {
    if (!result[i]) {
      if (targetLetters.includes(guessLetters[i]) && letterCounts[guessLetters[i]] > 0) {
        result[i] = { letter: guessLetters[i], status: 'present' };
        letterCounts[guessLetters[i]]--;
      } else {
        result[i] = { letter: guessLetters[i], status: 'absent' };
      }
    }
  }

  const won = guess === targetWord;
  return { result, won };
};

export const gameService = {
  checkGuess,
};


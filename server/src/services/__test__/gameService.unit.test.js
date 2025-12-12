import { gameService } from '../gameService.js';

describe('Game Service', () => {
  describe('checkGuess', () => {
    it('should mark correct letters in correct positions', () => {
      const { result, won } = gameService.checkGuess('APPLE', 'APPLE');
      expect(won).toBe(true);
      expect(result).toHaveLength(5);
      expect(result.every(r => r.status === 'correct')).toBe(true);
      expect(result.map(r => r.letter).join('')).toBe('APPLE');
    });

    it('should mark absent letters when not in target word', () => {
      const { result, won } = gameService.checkGuess('ZZZZZ', 'APPLE');
      expect(won).toBe(false);
      expect(result.every(r => r.status === 'absent')).toBe(true);
    });

    it('should mark present letters when in target but wrong position', () => {
      const { result } = gameService.checkGuess('PXXXX', 'APPLE');
      expect(result[0].letter).toBe('P');
      expect(['present', 'correct']).toContain(result[0].status);
    });

    it('should respect letter counts for repeated letters', () => {
      const { result } = gameService.checkGuess('PUPPY', 'APPLE');
      const presentOrCorrectP = result.filter(r => r.letter === 'P' && (r.status === 'present' || r.status === 'correct')).length;
      expect(presentOrCorrectP).toBe(2);
    });
  });
});



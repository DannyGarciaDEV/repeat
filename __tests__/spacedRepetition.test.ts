import { calculateNextReview, getCardsDueToday, isDueForReview } from '@/lib/spacedRepetition';
import { Flashcard } from '@/types/flashcard';

describe('Spaced Repetition Algorithm', () => {
  const baseCard: Flashcard = {
    _id: '1',
    front: 'Test',
    back: 'Answer',
    userId: 'user1',
    createdAt: new Date(),
    updatedAt: new Date(),
    easeFactor: 2.5,
    interval: 0,
    repetitions: 0,
    hardCount: 0,
    goodCount: 0,
    nextReview: new Date(),
  };

  describe('calculateNextReview', () => {
    it('should reset card when quality is 0 (Again)', () => {
      const result = calculateNextReview(baseCard, 0);
      
      expect(result.repetitions).toBe(0);
      expect(result.interval).toBe(0);
      expect(result.hardCount).toBe(0);
      expect(result.goodCount).toBe(0);
      expect(result.easeFactor).toBeLessThan(2.5);
    });

    it('should increment hardCount when quality is 1 (Hard)', () => {
      const result = calculateNextReview(baseCard, 1);
      
      expect(result.hardCount).toBe(1);
      expect(result.goodCount).toBe(0);
      expect(result.interval).toBe(0); // Review today again
    });

    it('should reset hardCount after 3 hard reviews', () => {
      let card = { ...baseCard, hardCount: 2 };
      const result = calculateNextReview(card, 1);
      
      expect(result.hardCount).toBe(0);
      expect(result.interval).toBe(1); // Review tomorrow
      expect(result.repetitions).toBeGreaterThan(0);
    });

    it('should increment goodCount when quality is 2 (Good)', () => {
      const result = calculateNextReview(baseCard, 2);
      
      expect(result.goodCount).toBe(1);
      expect(result.hardCount).toBe(0);
      expect(result.interval).toBe(0); // Review today
    });

    it('should reset goodCount after 5 good reviews', () => {
      let card = { ...baseCard, goodCount: 4 };
      const result = calculateNextReview(card, 2);
      
      expect(result.goodCount).toBe(0);
      expect(result.repetitions).toBeGreaterThan(0);
    });

    it('should set long interval when quality is 3 (Easy)', () => {
      const result = calculateNextReview(baseCard, 3);
      
      expect(result.hardCount).toBe(0);
      expect(result.goodCount).toBe(0);
      expect(result.interval).toBeGreaterThan(0);
      expect(result.repetitions).toBeGreaterThan(0);
    });
  });

  describe('isDueForReview', () => {
    it('should return true if nextReview is in the past', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      const card = { ...baseCard, nextReview: pastDate };
      
      expect(isDueForReview(card)).toBe(true);
    });

    it('should return false if nextReview is in the future', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const card = { ...baseCard, nextReview: futureDate };
      
      expect(isDueForReview(card)).toBe(false);
    });
  });

  describe('getCardsDueToday', () => {
    it('should return cards due today', () => {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const cards: Flashcard[] = [
        { ...baseCard, _id: '1', nextReview: today },
        { ...baseCard, _id: '2', nextReview: tomorrow },
        { ...baseCard, _id: '3', nextReview: new Date(today.getTime() - 86400000) }, // Yesterday
      ];
      
      const dueCards = getCardsDueToday(cards);
      expect(dueCards.length).toBeGreaterThan(0);
    });
  });
});


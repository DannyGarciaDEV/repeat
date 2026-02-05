import { Flashcard, ReviewResult } from '@/types/flashcard';

/**
 * Custom Spaced Repetition Algorithm
 * - Hard: Repeat every 3 times
 * - Good: Repeat every 5 questions
 * - Easy: No repeat (long interval)
 */
export function calculateNextReview(
  card: Flashcard,
  quality: number
): { interval: number; easeFactor: number; repetitions: number; nextReview: Date; hardCount: number; goodCount: number } {
  let { easeFactor, interval, repetitions, hardCount, goodCount } = card;

  // Initialize if not set
  if (hardCount === undefined) hardCount = 0;
  if (goodCount === undefined) goodCount = 0;

  const now = new Date();

  if (quality === 0) {
    // Again - reset everything, review immediately
    repetitions = 0;
    interval = 0; // Review today
    hardCount = 0;
    goodCount = 0;
    easeFactor = Math.max(1.3, easeFactor - 0.2);
  } else if (quality === 1) {
    // Hard - increment hard count
    hardCount += 1;
    goodCount = 0; // Reset good count
    
    if (hardCount >= 3) {
      // After 3 hard reviews, reset and review again soon
      hardCount = 0;
      interval = 1; // Review tomorrow
      repetitions += 1;
    } else {
      // Still accumulating hard reviews
      interval = 0; // Review today again
    }
    easeFactor = Math.max(1.3, easeFactor - 0.15);
  } else if (quality === 2) {
    // Good - increment good count
    goodCount += 1;
    hardCount = 0; // Reset hard count
    
    if (goodCount >= 5) {
      // After 5 good reviews, increase interval significantly
      goodCount = 0;
      repetitions += 1;
      if (repetitions === 1) {
        interval = 1;
      } else if (repetitions === 2) {
        interval = 6;
      } else {
        interval = Math.round(interval * easeFactor);
      }
    } else {
      // Still accumulating good reviews, review soon
      interval = 0; // Review today
    }
    // Slight increase in ease factor
    easeFactor = Math.min(2.5, easeFactor + 0.05);
  } else if (quality === 3) {
    // Easy - no repeat, long interval
    hardCount = 0;
    goodCount = 0;
    repetitions += 1;
    
    if (repetitions === 1) {
      interval = 7; // One week
    } else if (repetitions === 2) {
      interval = 14; // Two weeks
    } else {
      interval = Math.round(interval * easeFactor * 1.5); // Much longer interval
    }
    easeFactor = Math.min(2.5, easeFactor + 0.1);
  }

  // Calculate next review date
  const nextReview = new Date(now);
  if (interval === 0) {
    // Review today (same day)
    nextReview.setHours(now.getHours() + 1); // At least 1 hour later
  } else {
    nextReview.setDate(nextReview.getDate() + interval);
  }

  return {
    interval,
    easeFactor,
    repetitions,
    nextReview,
    hardCount,
    goodCount,
  };
}

/**
 * Get cards that are due for review
 */
export function isDueForReview(card: Flashcard): boolean {
  const now = new Date();
  return card.nextReview <= now;
}

/**
 * Get cards due today
 */
export function getCardsDueToday(cards: Flashcard[]): Flashcard[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return cards.filter((card) => {
    const reviewDate = new Date(card.nextReview);
    reviewDate.setHours(0, 0, 0, 0);
    return reviewDate >= today && reviewDate < tomorrow;
  });
}

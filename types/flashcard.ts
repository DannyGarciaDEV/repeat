export interface Flashcard {
  _id?: string;
  front: string;
  back: string;
  userId: string; // Owner of the card
  setId?: string; // Optional set/category
  createdAt: Date;
  updatedAt: Date;
  // Spaced repetition fields (custom algorithm)
  easeFactor: number; // Default 2.5, ranges from 1.3 to 2.5
  interval: number; // Days until next review
  repetitions: number; // Number of successful reviews
  nextReview: Date; // Next review date
  lastReview?: Date; // Last review date
  quality?: number; // Last review quality (0-3)
  hardCount: number; // Track how many times marked as hard
  goodCount: number; // Track how many times marked as good
}

export interface ReviewResult {
  quality: number; // 0-5: 0=again, 1=hard, 2=good, 3=easy
}


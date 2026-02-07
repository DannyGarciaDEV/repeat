'use client';

import { useState, useEffect } from 'react';
import { Flashcard } from '@/types/flashcard';
import { format } from 'date-fns';

interface QuizModeProps {
  cards: Flashcard[];
  onReviewComplete: () => void;
}

export default function QuizMode({ cards, onReviewComplete }: QuizModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);

  const currentCard = cards[currentIndex];

  useEffect(() => {
    if (cards.length > 0 && currentIndex >= cards.length) {
      // All cards reviewed
      setCurrentIndex(0);
      setShowAnswer(false);
    }
  }, [currentIndex, cards.length]);

  const handleReview = async (quality: number) => {
    if (!currentCard?._id) return;

    try {
      const response = await fetch(`/api/flashcards/${currentCard._id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quality }),
      });

      if (response.ok) {
        setReviewedCount(reviewedCount + 1);
        setShowAnswer(false);
        
        if (currentIndex < cards.length - 1) {
          setCurrentIndex(currentIndex + 1);
        } else {
          // Finished all cards
          onReviewComplete();
          setCurrentIndex(0);
        }
      }
    } catch (error) {
      console.error('Error reviewing card:', error);
      alert('Failed to save review');
    }
  };

  if (cards.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          No cards available for review.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto min-w-0">
      <div className="mb-4 sm:mb-6 text-center">
        <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2">
          Card {currentIndex + 1} of {cards.length}
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-rose-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="bg-gradient-to-br from-rose-50 to-red-50 dark:from-gray-700 dark:to-gray-800 rounded-xl shadow-lg p-4 sm:p-8 mb-4 sm:mb-6 min-h-[320px] sm:min-h-[400px] flex flex-col justify-center min-w-0">
        <div className="mb-4 sm:mb-6 min-w-0">
          <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-2">Question</div>
          <div className="text-lg sm:text-2xl font-semibold text-gray-900 dark:text-white break-words">
            {currentCard?.front}
          </div>
        </div>

        {showAnswer && (
          <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-300 dark:border-gray-600 min-w-0">
            <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-2">Answer</div>
            <div className="text-base sm:text-xl text-gray-700 dark:text-gray-300 mb-4 break-words">
              {currentCard?.back}
            </div>
            <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-4">
              How well did you know this?
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
              <button
                onClick={() => handleReview(0)}
                className="px-3 py-3 sm:px-4 min-h-[48px] touch-manipulation bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-700 dark:text-red-300 rounded-lg text-sm sm:text-base font-medium transition-colors"
              >
                Again (0)
              </button>
              <button
                onClick={() => handleReview(1)}
                className="px-3 py-3 sm:px-4 min-h-[48px] touch-manipulation bg-orange-100 hover:bg-orange-200 dark:bg-orange-900 dark:hover:bg-orange-800 text-orange-700 dark:text-orange-300 rounded-lg text-sm sm:text-base font-medium transition-colors"
              >
                Hard (1)
              </button>
              <button
                onClick={() => handleReview(2)}
                className="px-3 py-3 sm:px-4 min-h-[48px] touch-manipulation bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-900 dark:hover:bg-yellow-800 text-yellow-700 dark:text-yellow-300 rounded-lg text-sm sm:text-base font-medium transition-colors"
              >
                Good (2)
              </button>
              <button
                onClick={() => handleReview(3)}
                className="px-3 py-3 sm:px-4 min-h-[48px] touch-manipulation bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800 text-green-700 dark:text-green-300 rounded-lg text-sm sm:text-base font-medium transition-colors"
              >
                Easy (3)
              </button>
            </div>
          </div>
        )}

        {!showAnswer && (
          <button
            onClick={() => setShowAnswer(true)}
            className="mt-4 sm:mt-6 w-full min-h-[48px] touch-manipulation bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Show Answer
          </button>
        )}
      </div>

      {reviewedCount > 0 && (
        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          Reviewed {reviewedCount} card{reviewedCount !== 1 ? 's' : ''} today
        </div>
      )}
    </div>
  );
}


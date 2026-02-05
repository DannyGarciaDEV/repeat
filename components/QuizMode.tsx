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
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 text-center">
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          Card {currentIndex + 1} of {cards.length}
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-700 dark:to-gray-800 rounded-xl shadow-lg p-8 mb-6 min-h-[400px] flex flex-col justify-center">
        <div className="mb-6">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Question</div>
          <div className="text-2xl font-semibold text-gray-900 dark:text-white">
            {currentCard?.front}
          </div>
        </div>

        {showAnswer && (
          <div className="mt-6 pt-6 border-t border-gray-300 dark:border-gray-600">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Answer</div>
            <div className="text-xl text-gray-700 dark:text-gray-300 mb-4">
              {currentCard?.back}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              How well did you know this?
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button
                onClick={() => handleReview(0)}
                className="px-4 py-3 bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-700 dark:text-red-300 rounded-lg font-medium transition-colors"
              >
                Again (0)
              </button>
              <button
                onClick={() => handleReview(1)}
                className="px-4 py-3 bg-orange-100 hover:bg-orange-200 dark:bg-orange-900 dark:hover:bg-orange-800 text-orange-700 dark:text-orange-300 rounded-lg font-medium transition-colors"
              >
                Hard (1)
              </button>
              <button
                onClick={() => handleReview(2)}
                className="px-4 py-3 bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-900 dark:hover:bg-yellow-800 text-yellow-700 dark:text-yellow-300 rounded-lg font-medium transition-colors"
              >
                Good (2)
              </button>
              <button
                onClick={() => handleReview(3)}
                className="px-4 py-3 bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800 text-green-700 dark:text-green-300 rounded-lg font-medium transition-colors"
              >
                Easy (3)
              </button>
            </div>
          </div>
        )}

        {!showAnswer && (
          <button
            onClick={() => setShowAnswer(true)}
            className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
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


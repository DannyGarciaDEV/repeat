'use client';

import { useState } from 'react';
import { Set as FlashcardSet } from '@/types/set';
import { Flashcard } from '@/types/flashcard';
import { getCardsDueToday } from '@/lib/spacedRepetition';

interface QuizModeSelectorProps {
  sets: FlashcardSet[];
  allCards: Flashcard[];
  onStartQuiz: (cards: Flashcard[]) => void;
}

export default function QuizModeSelector({ sets, allCards, onStartQuiz }: QuizModeSelectorProps) {
  const [selectedSets, setSelectedSets] = useState<Set<string>>(new Set<string>());
  const [quizMode, setQuizMode] = useState<'all' | 'due' | 'selected'>('due');
  const [useAllCards, setUseAllCards] = useState(false);

  const toggleSet = (setId: string) => {
    const newSelected = new Set(selectedSets);
    if (newSelected.has(setId)) {
      newSelected.delete(setId);
    } else {
      newSelected.add(setId);
    }
    setSelectedSets(newSelected);
  };

  const handleStartQuiz = () => {
    let cardsToQuiz: Flashcard[] = [];

    if (useAllCards) {
      // Quiz all cards regardless of set
      cardsToQuiz = allCards;
    } else if (selectedSets.size === 0 && quizMode !== 'all') {
      // If no sets selected and not "all", use due cards from all sets
      cardsToQuiz = getCardsDueToday(allCards);
    } else if (selectedSets.size > 0) {
      // Quiz cards from selected sets
      cardsToQuiz = allCards.filter(card => 
        card.setId && selectedSets.has(card.setId)
      );
    } else {
      // Quiz all cards
      cardsToQuiz = allCards;
    }

    // Filter by quiz mode
    if (quizMode === 'due') {
      cardsToQuiz = getCardsDueToday(cardsToQuiz);
    }
    // 'all' mode uses all cards (already set above)

    if (cardsToQuiz.length === 0) {
      alert('No cards available for quiz with the selected options.');
      return;
    }

    onStartQuiz(cardsToQuiz);
  };

  const dueCards = getCardsDueToday(allCards);
  const selectedSetCards = allCards.filter(card => 
    card.setId && selectedSets.has(card.setId)
  );
  const selectedDueCards = getCardsDueToday(selectedSetCards);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-gradient-to-br from-rose-50 to-red-50 dark:from-gray-700 dark:to-gray-800 rounded-xl shadow-lg p-8 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Configure Quiz Mode
        </h2>

        {/* Quiz Mode Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            What would you like to review?
          </label>
          <div className="space-y-2">
            <label className="flex items-center p-3 bg-white dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
              <input
                type="radio"
                name="quizMode"
                value="due"
                checked={quizMode === 'due'}
                onChange={(e) => setQuizMode(e.target.value as 'due')}
                className="mr-3"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900 dark:text-white">
                  Due Cards Only
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Review cards that are due for study ({dueCards.length} available)
                </div>
              </div>
            </label>
            <label className="flex items-center p-3 bg-white dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
              <input
                type="radio"
                name="quizMode"
                value="all"
                checked={quizMode === 'all'}
                onChange={(e) => setQuizMode(e.target.value as 'all')}
                className="mr-3"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900 dark:text-white">
                  All Cards
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Review all cards regardless of due date ({allCards.length} total)
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Use All Cards Option */}
        <div className="mb-6">
          <label className="flex items-center p-3 bg-white dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
            <input
              type="checkbox"
              checked={useAllCards}
              onChange={(e) => {
                setUseAllCards(e.target.checked);
                if (e.target.checked) {
                  setSelectedSets(new Set());
                }
              }}
              className="mr-3"
            />
            <div className="flex-1">
              <div className="font-medium text-gray-900 dark:text-white">
                Quiz All Cards Together
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Ignore sets and quiz all cards together
              </div>
            </div>
          </label>
        </div>

        {/* Set Selection (only if not using all cards) */}
        {!useAllCards && sets.length > 0 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Select Sets to Review (optional - leave empty for all sets)
            </label>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {sets.map((set) => {
                const setCards = allCards.filter(c => c.setId === set._id);
                const setDueCards = getCardsDueToday(setCards);
                const isSelected = selectedSets.has(set._id || '');
                
                return (
                  <label
                    key={set._id}
                    className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-rose-100 dark:bg-rose-900/30 border-2 border-rose-500'
                        : 'bg-white dark:bg-gray-700 border-2 border-transparent hover:bg-gray-50 dark:hover:bg-gray-600'
                    }`}
                    style={isSelected ? { borderColor: set.color || '#f43f5e' } : {}}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSet(set._id || '')}
                      className="mr-3"
                    />
                    <div
                      className="w-4 h-4 rounded mr-3"
                      style={{ backgroundColor: set.color || '#f43f5e' }}
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {set.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {setCards.length} cards
                        {quizMode === 'due' && ` (${setDueCards.length} due)`}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
            {selectedSets.size > 0 && (
              <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                {quizMode === 'due' 
                  ? `${selectedDueCards.length} due cards selected`
                  : `${selectedSetCards.length} cards selected`
                }
              </div>
            )}
          </div>
        )}

        {/* Start Quiz Button */}
        <button
          onClick={handleStartQuiz}
          className="w-full bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 text-white font-semibold py-4 rounded-lg transition-all shadow-lg hover:shadow-xl text-lg"
        >
          Start Quiz
        </button>
      </div>
    </div>
  );
}


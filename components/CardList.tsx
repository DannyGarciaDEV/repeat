'use client';

import { Flashcard } from '@/types/flashcard';
import { Set } from '@/types/set';
import { format } from 'date-fns';

interface CardListProps {
  cards: Flashcard[];
  sets?: Set[];
  onEdit: (card: Flashcard) => void;
  onDelete: () => void;
  onSetChange?: () => void;
}

export default function CardList({ cards, sets = [], onEdit, onDelete, onSetChange }: CardListProps) {
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this card?')) {
      return;
    }

    try {
      const response = await fetch(`/api/flashcards/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          onDelete();
        } else {
          alert(data.error || 'Failed to delete card');
        }
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete card');
      }
    } catch (error) {
      console.error('Error deleting card:', error);
      alert('Failed to delete card. Please try again.');
    }
  };

  if (cards.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          No flashcards yet. Create your first card!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((card) => (
        <div
          key={card._id}
          className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-shadow"
        >
          <div className="mb-3">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Front</div>
            <div className="text-gray-900 dark:text-white font-medium">
              {card.front}
            </div>
          </div>
          <div className="mb-3">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Back</div>
            <div className="text-gray-700 dark:text-gray-300">
              {card.back}
            </div>
          </div>
          {card.setId && sets.length > 0 && (
            <div className="mb-2">
              <span
                className="inline-block px-2 py-1 text-xs font-medium rounded text-white"
                style={{
                  backgroundColor: sets.find(s => s._id === card.setId)?.color || '#6366f1',
                }}
              >
                {sets.find(s => s._id === card.setId)?.name || 'Set'}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
            <span>Repetitions: {card.repetitions}</span>
            <span>Next: {format(new Date(card.nextReview), 'MMM d')}</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(card)}
              className="flex-1 bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900 dark:hover:bg-indigo-800 text-indigo-700 dark:text-indigo-300 px-3 py-2 rounded text-sm font-medium transition-colors"
            >
              Edit
            </button>
            <button
              onClick={() => card._id && handleDelete(card._id)}
              className="flex-1 bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-700 dark:text-red-300 px-3 py-2 rounded text-sm font-medium transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}


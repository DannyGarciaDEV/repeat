'use client';

import { useState, useEffect } from 'react';
import { Flashcard } from '@/types/flashcard';
import { Set } from '@/types/set';

interface CardFormProps {
  card?: Flashcard | null;
  userId: string;
  sets?: Set[];
  defaultSetId?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function CardForm({ card, userId, sets = [], defaultSetId, onSuccess, onCancel }: CardFormProps) {
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [setId, setSetId] = useState<string>(defaultSetId || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (card) {
      setFront(card.front);
      setBack(card.back);
      setSetId(card.setId || '');
    } else if (defaultSetId) {
      setSetId(defaultSetId);
    }
  }, [card, defaultSetId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = card?._id ? `/api/flashcards/${card._id}` : '/api/flashcards';
      const method = card?._id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          front,
          back,
          ...(card?._id ? { setId: setId || null } : { userId, setId: setId || null }),
        }),
      });

      if (response.ok) {
        onSuccess();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save card');
      }
    } catch (error) {
      console.error('Error saving card:', error);
      alert('Failed to save card');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        {card ? 'Edit Card' : 'Create New Card'}
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="front"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Front
          </label>
          <textarea
            id="front"
            value={front}
            onChange={(e) => setFront(e.target.value)}
            required
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Enter the question or prompt..."
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="back"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Back
          </label>
          <textarea
            id="back"
            value={back}
            onChange={(e) => setBack(e.target.value)}
            required
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Enter the answer..."
          />
        </div>
        {sets.length > 0 && (
          <div className="mb-6">
            <label
              htmlFor="set"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Set (Optional)
            </label>
            <select
              id="set"
              value={setId}
              onChange={(e) => setSetId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">No Set</option>
              {sets.map((set) => (
                <option key={set._id} value={set._id}>
                  {set.name}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : card ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
}


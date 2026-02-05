'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Flashcard } from '@/types/flashcard';
import { Set } from '@/types/set';
import CardList from '@/components/CardList';
import CardForm from '@/components/CardForm';
import QuizMode from '@/components/QuizMode';
import { getCardsDueToday } from '@/lib/spacedRepetition';
import Link from 'next/link';

export default function SetDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const setId = params.id as string;

  const [set, setSet] = useState<Set | null>(null);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'cards' | 'quiz'>('cards');
  const [showForm, setShowForm] = useState(false);
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (user && setId) {
      fetchSet();
      fetchCards();
    }
  }, [user, authLoading, setId, router]);

  const fetchSet = async () => {
    try {
      const response = await fetch(`/api/sets/${setId}`);
      if (response.ok) {
        const data = await response.json();
        setSet(data);
      } else {
        router.push('/');
      }
    } catch (error) {
      console.error('Error fetching set:', error);
      router.push('/');
    }
  };

  const fetchCards = async () => {
    if (!user) return;
    try {
      const response = await fetch(`/api/flashcards?userId=${user.id}&setId=${setId}`);
      const data = await response.json();
      setCards(data);
    } catch (error) {
      console.error('Error fetching cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCardCreated = () => {
    fetchCards();
    setShowForm(false);
  };

  const handleCardUpdated = () => {
    fetchCards();
    setEditingCard(null);
  };

  const handleCardDeleted = () => {
    fetchCards();
  };

  const handleReviewComplete = () => {
    fetchCards();
  };

  const dueCards = getCardsDueToday(cards);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!set) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:underline mb-4"
          >
            ← Back to Dashboard
          </Link>
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg"
              style={{ backgroundColor: set.color || '#6366f1' }}
            >
              {set.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                {set.name}
              </h1>
              {set.description && (
                <p className="text-gray-600 dark:text-gray-400">{set.description}</p>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4" style={{ borderColor: set.color || '#6366f1' }}>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Cards</div>
            <div className="text-3xl font-bold" style={{ color: set.color || '#6366f1' }}>
              {cards.length}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Due Today</div>
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              {dueCards.length}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Mastered</div>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {cards.filter(c => c.repetitions >= 5).length}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('cards')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'cards'
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
                style={activeTab === 'cards' ? { borderColor: set.color || '#6366f1', color: set.color || '#6366f1' } : {}}
              >
                Cards ({cards.length})
              </button>
              <button
                onClick={() => setActiveTab('quiz')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'quiz'
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
                style={activeTab === 'quiz' ? { borderColor: set.color || '#6366f1', color: set.color || '#6366f1' } : {}}
              >
                Quiz Mode {dueCards.length > 0 && (
                  <span className="ml-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                    {dueCards.length}
                  </span>
                )}
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          {activeTab === 'cards' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Flashcards in {set.name}
                </h2>
                <button
                  onClick={() => {
                    setEditingCard(null);
                    setShowForm(true);
                  }}
                  className="px-6 py-3 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl text-white"
                  style={{ backgroundColor: set.color || '#6366f1' }}
                >
                  + Add Card to Set
                </button>
              </div>
              <CardList
                cards={cards}
                onEdit={setEditingCard}
                onDelete={handleCardDeleted}
                sets={[set]}
                onSetChange={fetchCards}
              />
            </div>
          )}

          {activeTab === 'quiz' && (
            <QuizMode
              cards={dueCards.length > 0 ? dueCards : cards}
              onReviewComplete={handleReviewComplete}
            />
          )}
        </div>

        {/* Card Form Modal */}
        {(showForm || editingCard) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <CardForm
                card={editingCard}
                userId={user!.id}
                sets={[set]}
                defaultSetId={setId}
                onSuccess={editingCard ? handleCardUpdated : handleCardCreated}
                onCancel={() => {
                  setShowForm(false);
                  setEditingCard(null);
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


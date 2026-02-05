'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Flashcard } from '@/types/flashcard';
import { Set } from '@/types/set';
import CardList from '@/components/CardList';
import CardForm from '@/components/CardForm';
import QuizMode from '@/components/QuizMode';
import QuizModeSelector from '@/components/QuizModeSelector';
import CalendarView from '@/components/CalendarView';
import SetManager from '@/components/SetManager';
import PublicSetsBrowser from '@/components/PublicSetsBrowser';
import Landing from '@/components/Landing';
import { getCardsDueToday } from '@/lib/spacedRepetition';

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [sets, setSets] = useState<Set[]>([]);
  const [selectedSetId, setSelectedSetId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'cards' | 'quiz' | 'calendar' | 'sets' | 'public'>('cards');
  const [showForm, setShowForm] = useState(false);
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null);
  const [showSetForm, setShowSetForm] = useState(false);
  const [quizCards, setQuizCards] = useState<Flashcard[] | null>(null);

  const fetchCards = async () => {
    if (!user) return;
    try {
      const url = selectedSetId
        ? `/api/flashcards?userId=${user.id}&setId=${selectedSetId}`
        : `/api/flashcards?userId=${user.id}`;
      const response = await fetch(url);
      const data = await response.json();
      setCards(data);
    } catch (error) {
      console.error('Error fetching cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSets = async () => {
    if (!user) return;
    try {
      const response = await fetch(`/api/sets?userId=${user.id}`);
      const data = await response.json();
      setSets(data);
    } catch (error) {
      console.error('Error fetching sets:', error);
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
    setQuizCards(null); // Return to selector
  };

  const handleStartQuiz = (selectedCards: Flashcard[]) => {
    setQuizCards(selectedCards);
  };

  const handleBackToSelector = () => {
    setQuizCards(null);
  };

  const handleSetCreated = () => {
    fetchSets();
    setShowSetForm(false);
  };

  const handleSetImported = () => {
    fetchSets();
    fetchCards();
  };

  const handleSetDeleted = () => {
    fetchSets();
    if (selectedSetId) {
      setSelectedSetId(null);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCards();
      fetchSets();
    }
  }, [user, selectedSetId]);

  const dueCards = getCardsDueToday(cards);
  const totalCards = cards.length;
  const filteredCards = selectedSetId
    ? cards.filter((c) => c.setId === selectedSetId)
    : cards;

  // Show landing page when not logged in (after all hooks)
  if (!authLoading && !user) {
    return <Landing />;
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 dark:from-gray-900 dark:via-rose-950/20 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 dark:from-gray-900 dark:via-rose-950/20 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-red-500 mb-2">
              Repeat
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Master anything with spaced repetition
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-gray-600 dark:text-gray-400">Welcome back,</div>
              <div className="font-semibold text-gray-900 dark:text-white">{user!.name}</div>
            </div>
            <Link
              href="/profile"
              className="w-12 h-12 rounded-full bg-gradient-to-r from-rose-500 to-red-500 flex items-center justify-center text-white font-bold text-lg shadow-lg hover:shadow-xl transition-shadow"
            >
              {user!.name.charAt(0).toUpperCase()}
            </Link>
          </div>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-rose-500">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Cards</div>
            <div className="text-3xl font-bold text-rose-600 dark:text-rose-400">
              {totalCards}
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
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-red-500">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Sets</div>
            <div className="text-3xl font-bold text-red-600 dark:text-red-400">
              {sets.length}
            </div>
          </div>
        </div>

        {/* Set Filter */}
        {sets.length > 0 && (
          <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by Set:</span>
              <button
                onClick={() => setSelectedSetId(null)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedSetId === null
                    ? 'bg-rose-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                All Cards
              </button>
              {sets.map((set) => (
                <button
                  key={set._id}
                  onClick={() => setSelectedSetId(set._id || null)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedSetId === set._id
                      ? 'bg-rose-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  style={selectedSetId === set._id ? { backgroundColor: set.color || '#e11d48' } : {}}
                >
                  {set.name} ({set.cardCount || 0})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('cards')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'cards'
                    ? 'border-rose-500 text-rose-600 dark:text-rose-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                My Cards
              </button>
              <button
                onClick={() => setActiveTab('quiz')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'quiz'
                    ? 'border-rose-500 text-rose-600 dark:text-rose-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Quiz Mode {dueCards.length > 0 && (
                  <span className="ml-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                    {dueCards.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('sets')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'sets'
                    ? 'border-rose-500 text-rose-600 dark:text-rose-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Sets
              </button>
              <button
                onClick={() => setActiveTab('calendar')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'calendar'
                    ? 'border-rose-500 text-rose-600 dark:text-rose-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Calendar
              </button>
              <button
                onClick={() => setActiveTab('public')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'public'
                    ? 'border-rose-500 text-rose-600 dark:text-rose-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Public Sets
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
                  {selectedSetId ? sets.find(s => s._id === selectedSetId)?.name : 'My Flashcard Collection'}
                </h2>
                <button
                  onClick={() => {
                    setEditingCard(null);
                    setShowForm(true);
                  }}
                  className="bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-700 hover:to-red-600 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl"
                >
                  + New Card
                </button>
              </div>
              <CardList
                cards={filteredCards}
                onEdit={setEditingCard}
                onDelete={handleCardDeleted}
                sets={sets}
                onSetChange={fetchCards}
              />
            </div>
          )}

          {activeTab === 'quiz' && (
            <>
              {quizCards === null ? (
                <QuizModeSelector
                  sets={sets}
                  allCards={cards}
                  onStartQuiz={handleStartQuiz}
                />
              ) : (
                <div>
                  <button
                    onClick={handleBackToSelector}
                    className="mb-4 text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-2"
                  >
                    ← Back to Quiz Selection
                  </button>
                  <QuizMode
                    cards={quizCards}
                    onReviewComplete={handleReviewComplete}
                  />
                </div>
              )}
            </>
          )}

          {activeTab === 'sets' && (
            <SetManager
              sets={sets}
              onSetCreated={handleSetCreated}
              onSetDeleted={handleSetDeleted}
              onSetUpdated={fetchSets}
            />
          )}

          {activeTab === 'calendar' && (
            <CalendarView cards={cards} />
          )}

          {activeTab === 'public' && (
            <PublicSetsBrowser onSetImported={handleSetImported} />
          )}
        </div>

        {/* Card Form Modal */}
        {(showForm || editingCard) && user && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <CardForm
                card={editingCard}
                userId={user.id}
                sets={sets}
                onSuccess={editingCard ? handleCardUpdated : handleCardCreated}
                onCancel={() => {
                  setShowForm(false);
                  setEditingCard(null);
                }}
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-rose-200 dark:border-rose-900/50 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} Repeat. By{' '}
            <a
              href="https://github.com/dannygarciadev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-rose-600 dark:text-rose-400 hover:underline font-medium"
            >
              dannygarciadev
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

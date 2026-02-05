'use client';

import { useState, useEffect } from 'react';
import { Set as FlashcardSet } from '@/types/set';
import { useAuth } from '@/contexts/AuthContext';

interface PublicSetsBrowserProps {
  onSetImported: () => void;
}

export default function PublicSetsBrowser({ onSetImported }: PublicSetsBrowserProps) {
  const { user } = useAuth();
  const [publicSets, setPublicSets] = useState<FlashcardSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [importing, setImporting] = useState<string | null>(null);

  useEffect(() => {
    fetchPublicSets();
  }, [search]);

  const fetchPublicSets = async () => {
    try {
      setLoading(true);
      const url = search
        ? `/api/sets/public?search=${encodeURIComponent(search)}`
        : '/api/sets/public';
      const response = await fetch(url);
      const data = await response.json();
      setPublicSets(data);
    } catch (error) {
      console.error('Error fetching public sets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (setId: string) => {
    if (!user) return;

    setImporting(setId);
    try {
      const response = await fetch(`/api/sets/${setId}/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });

      if (response.ok) {
        alert('Set imported successfully!');
        onSetImported();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to import set');
      }
    } catch (error) {
      console.error('Error importing set:', error);
      alert('Failed to import set');
    } finally {
      setImporting(null);
    }
  };

  const handleExport = async (setId: string, setName: string) => {
    try {
      const response = await fetch(`/api/sets/${setId}/export`);
      if (response.ok) {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], {
          type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${setName.replace(/[^a-z0-9]/gi, '_')}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting set:', error);
      alert('Failed to export set');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !event.target.files?.[0]) return;

    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const setData = JSON.parse(e.target?.result as string);
        const response = await fetch('/api/sets/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, setData }),
        });

        if (response.ok) {
          alert('Set uploaded successfully!');
          onSetImported();
        } else {
          const error = await response.json();
          alert(error.error || 'Failed to upload set');
        }
      } catch (error) {
        alert('Invalid file format');
      }
    };

    reader.readAsText(file);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Browse Public Sets
        </h2>
        <div className="flex gap-3">
          <label className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium cursor-pointer transition-colors">
            Upload Set
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      <div className="mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search public sets..."
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      ) : publicSets.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            {search ? 'No sets found matching your search.' : 'No public sets available yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {publicSets.map((set) => (
            <div
              key={set._id}
              className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-600 hover:shadow-lg transition-all"
              style={{ borderColor: set.color || '#6366f1' }}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md"
                  style={{ backgroundColor: set.color || '#6366f1' }}
                >
                  {set.name.charAt(0).toUpperCase()}
                </div>
                {set.isPublic && (
                  <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded">
                    Public
                  </span>
                )}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {set.name}
              </h3>
              {set.description && (
                <p className="text-gray-600 dark:text-gray-400 mb-3 text-sm">
                  {set.description}
                </p>
              )}
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                <div>By: {set.ownerName || 'Unknown'}</div>
                <div>{set.cardCount || 0} card{set.cardCount !== 1 ? 's' : ''}</div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => set._id && handleImport(set._id)}
                  disabled={importing === set._id}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {importing === set._id ? 'Importing...' : 'Import'}
                </button>
                <button
                  onClick={() => set._id && handleExport(set._id, set.name)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
                >
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


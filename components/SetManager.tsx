'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Set } from '@/types/set';

interface SetManagerProps {
  sets: Set[];
  onSetCreated: () => void;
  onSetDeleted: () => void;
  onSetUpdated: () => void;
}

export default function SetManager({ sets, onSetCreated, onSetDeleted, onSetUpdated }: SetManagerProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editingSet, setEditingSet] = useState<Set | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', color: '#6366f1', isPublic: false });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingSet?._id ? `/api/sets/${editingSet._id}` : '/api/sets';
    const method = editingSet?._id ? 'PUT' : 'POST';

    try {
      const userId = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!).id : null;
      if (!userId) return;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingSet?._id ? formData : { ...formData, userId, isPublic: formData.isPublic || false }),
      });

      if (response.ok) {
        setShowForm(false);
        setEditingSet(null);
        setFormData({ name: '', description: '', color: '#6366f1', isPublic: false });
        editingSet ? onSetUpdated() : onSetCreated();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save set');
      }
    } catch (error) {
      console.error('Error saving set:', error);
      alert('Failed to save set');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this set? Cards will be moved to "All Cards".')) {
      return;
    }

    try {
      const response = await fetch(`/api/sets/${id}`, { method: 'DELETE' });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          onSetDeleted();
        } else {
          alert(data.error || 'Failed to delete set');
        }
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete set');
      }
    } catch (error) {
      console.error('Error deleting set:', error);
      alert('Failed to delete set. Please try again.');
    }
  };

  const startEdit = (set: Set) => {
    setEditingSet(set);
    setFormData({
      name: set.name,
      description: set.description || '',
      color: set.color || '#6366f1',
      isPublic: set.isPublic || false,
    });
    setShowForm(true);
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

  const presetColors = [
    '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b',
    '#10b981', '#3b82f6', '#ef4444', '#14b8a6'
  ];

  return (
    <div className="min-w-0">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white min-w-0">
          Flashcard Sets
        </h2>
          <button
            onClick={() => {
              setEditingSet(null);
              setFormData({ name: '', description: '', color: '#6366f1', isPublic: false });
              setShowForm(true);
            }}
          className="w-full sm:w-auto bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl min-h-[44px] touch-manipulation shrink-0"
        >
          + New Set
        </button>
      </div>

      {sets.length === 0 && !showForm ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            No sets yet. Create your first set to organize your flashcards!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 min-w-0">
          {sets.map((set) => (
            <div
              key={set._id}
              className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-4 sm:p-6 border-2 border-gray-200 dark:border-gray-600 hover:shadow-lg transition-all min-w-0 break-words"
              style={{ borderColor: set.color || '#6366f1' }}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md"
                  style={{ backgroundColor: set.color || '#6366f1' }}
                >
                  {set.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(set)}
                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => set._id && handleDelete(set._id)}
                    className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {set.name}
              </h3>
              {set.description && (
                <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                  {set.description}
                </p>
              )}
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {set.cardCount || 0} card{set.cardCount !== 1 ? 's' : ''}
                </div>
                {set.isPublic && (
                  <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded">
                    Public
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => set._id && router.push(`/sets/${set._id}`)}
                  className="flex-1 px-4 py-2 rounded-lg font-medium transition-colors text-white text-sm"
                  style={{ backgroundColor: set.color || '#6366f1' }}
                >
                  View Set
                </button>
                <button
                  onClick={() => set._id && handleExport(set._id, set.name)}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                  title="Download as JSON"
                >
                  ⬇
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full max-h-[90dvh] overflow-y-auto p-4 sm:p-6 my-auto">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
              {editingSet ? 'Edit Set' : 'Create New Set'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Color
                </label>
                <div className="flex gap-2 flex-wrap">
                  {presetColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-10 h-10 rounded-lg border-2 transition-all ${
                        formData.color === color ? 'border-gray-900 dark:border-white scale-110' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <div>
                <label className="flex items-center p-3 bg-white dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.isPublic}
                    onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-white">
                      Make Public
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Allow others to discover and import this set
                    </div>
                  </div>
                </label>
              </div>
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingSet(null);
                  }}
                  className="w-full sm:w-auto px-4 py-3 sm:py-2 min-h-[44px] touch-manipulation border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-4 py-3 sm:py-2 min-h-[44px] touch-manipulation bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 text-white rounded-lg font-medium"
                >
                  {editingSet ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


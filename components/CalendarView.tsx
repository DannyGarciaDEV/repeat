'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Flashcard } from '@/types/flashcard';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, getDaysInMonth } from 'date-fns';

interface CalendarViewProps {
  cards: Flashcard[];
}

interface CalendarDay {
  date: string;
  count: number;
}

export default function CalendarView({ cards }: CalendarViewProps) {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState<CalendarDay[]>([]);

  useEffect(() => {
    if (user) {
      fetchCalendarData();
    }
  }, [currentDate, cards, user]);

  const fetchCalendarData = async () => {
    if (!user) return;
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const response = await fetch(`/api/calendar?year=${year}&month=${month}&userId=${user.id}`);
      const data = await response.json();
      setCalendarData(data.data || []);
    } catch (error) {
      console.error('Error fetching calendar data:', error);
      // Fallback: calculate from cards prop
      const cardsByDate: Record<string, number> = {};
      cards.forEach((card) => {
        const date = new Date(card.createdAt);
        const dateKey = format(date, 'yyyy-MM-dd');
        cardsByDate[dateKey] = (cardsByDate[dateKey] || 0) + 1;
      });

      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

      setCalendarData(
        daysInMonth.map((day) => {
          const dateKey = format(day, 'yyyy-MM-dd');
          return {
            date: dateKey,
            count: cardsByDate[dateKey] || 0,
          };
        })
      );
    }
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = getDaysInMonth(currentDate);
  const startDay = monthStart.getDay();

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getDayData = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dateKey = format(date, 'yyyy-MM-dd');
    return calendarData.find((d) => d.date === dateKey) || { date: dateKey, count: 0 };
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigateMonth('prev')}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
        >
          ← Previous
        </button>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        <button
          onClick={() => navigateMonth('next')}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
        >
          Next →
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="grid grid-cols-7 gap-2 mb-2">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center text-sm font-medium text-gray-600 dark:text-gray-400 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {/* Empty cells for days before month starts */}
          {Array.from({ length: startDay }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}

          {/* Days of the month */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dayData = getDayData(day);
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            const today = isToday(date);

            return (
              <div
                key={day}
                className={`aspect-square rounded-lg border-2 flex flex-col items-center justify-center transition-all ${
                  today
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                    : 'border-gray-200 dark:border-gray-700'
                } ${
                  dayData.count > 0
                    ? 'bg-green-100 dark:bg-green-900/30 border-green-400 dark:border-green-600'
                    : ''
                }`}
              >
                <div
                  className={`text-sm font-medium ${
                    today
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {day}
                </div>
                {dayData.count > 0 && (
                  <div className="text-xs font-bold text-green-600 dark:text-green-400 mt-1">
                    {dayData.count}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border-2 border-gray-200 dark:border-gray-700"></div>
            <span className="text-gray-600 dark:text-gray-400">No cards</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-100 dark:bg-green-900/30 border-2 border-green-400 dark:border-green-600"></div>
            <span className="text-gray-600 dark:text-gray-400">Cards created</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border-2 border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30"></div>
            <span className="text-gray-600 dark:text-gray-400">Today</span>
          </div>
        </div>
      </div>
    </div>
  );
}


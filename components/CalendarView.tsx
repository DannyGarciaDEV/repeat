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
    <div className="max-w-4xl mx-auto min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 sm:mb-6">
        <button
          onClick={() => navigateMonth('prev')}
          className="px-3 py-2 sm:px-4 min-h-[44px] touch-manipulation bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors text-sm sm:text-base"
        >
          ← Prev
        </button>
        <h2 className="text-lg sm:text-2xl font-semibold text-gray-900 dark:text-white order-first w-full sm:order-none sm:w-auto text-center sm:text-left">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        <button
          onClick={() => navigateMonth('next')}
          className="px-3 py-2 sm:px-4 min-h-[44px] touch-manipulation bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors text-sm sm:text-base"
        >
          Next →
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 sm:p-6 min-w-0 overflow-x-auto">
        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 min-w-[280px]">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 py-1 sm:py-2"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 sm:gap-2 min-w-[280px]">
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
                    ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/30'
                    : 'border-gray-200 dark:border-gray-700'
                } ${
                  dayData.count > 0
                    ? 'bg-green-100 dark:bg-green-900/30 border-green-400 dark:border-green-600'
                    : ''
                }`}
              >
                <div
                  className={`text-xs sm:text-sm font-medium ${
                    today
                      ? 'text-rose-600 dark:text-rose-400'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {day}
                </div>
                {dayData.count > 0 && (
                  <div className="text-[10px] sm:text-xs font-bold text-green-600 dark:text-green-400 mt-0.5 sm:mt-1">
                    {dayData.count}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-4 sm:mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded border-2 border-gray-200 dark:border-gray-700 shrink-0"></div>
            <span className="text-gray-600 dark:text-gray-400">No cards</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-green-100 dark:bg-green-900/30 border-2 border-green-400 dark:border-green-600 shrink-0"></div>
            <span className="text-gray-600 dark:text-gray-400">Cards created</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded border-2 border-rose-500 bg-rose-50 dark:bg-rose-900/30 shrink-0"></div>
            <span className="text-gray-600 dark:text-gray-400">Today</span>
          </div>
        </div>
      </div>
    </div>
  );
}


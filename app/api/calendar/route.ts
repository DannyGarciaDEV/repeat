import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { Flashcard } from '@/types/flashcard';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

const DATABASE_NAME = process.env.DATABASE_NAME || 'flashcards';
const COLLECTION_NAME = 'cards';

// GET calendar data (cards created per day)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const month = searchParams.get('month'); // YYYY-MM format
    const year = searchParams.get('year');
    const userId = searchParams.get('userId');

    // Require userId to prevent showing other users' calendar data
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(DATABASE_NAME);
    const collection = db.collection<Flashcard>(COLLECTION_NAME);

    // Get only user's cards
    const cards = await collection.find({ userId }).toArray();

    // Group cards by creation date
    const cardsByDate: Record<string, number> = {};

    cards.forEach((card) => {
      const date = new Date(card.createdAt);
      const dateKey = format(date, 'yyyy-MM-dd');
      cardsByDate[dateKey] = (cardsByDate[dateKey] || 0) + 1;
    });

    // If month/year specified, filter to that month
    let targetDate = new Date();
    if (month && year) {
      targetDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    }

    const monthStart = startOfMonth(targetDate);
    const monthEnd = endOfMonth(targetDate);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const calendarData = daysInMonth.map((day) => {
      const dateKey = format(day, 'yyyy-MM-dd');
      return {
        date: dateKey,
        count: cardsByDate[dateKey] || 0,
      };
    });

    return NextResponse.json({
      month: format(targetDate, 'yyyy-MM'),
      data: calendarData,
    });
  } catch (error) {
    console.error('Error fetching calendar data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calendar data' },
      { status: 500 }
    );
  }
}


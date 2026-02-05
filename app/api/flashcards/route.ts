import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { Flashcard } from '@/types/flashcard';

const DATABASE_NAME = process.env.DATABASE_NAME || 'flashcards';
const COLLECTION_NAME = 'cards';

// GET all flashcards
export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db(DATABASE_NAME);
    const collection = db.collection<Flashcard>(COLLECTION_NAME);

    const searchParams = request.nextUrl.searchParams;
    const dueOnly = searchParams.get('dueOnly') === 'true';
    const userId = searchParams.get('userId');
    const setId = searchParams.get('setId');

    // Require userId to prevent showing other users' cards
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const query: any = { userId }; // Always filter by userId
    if (setId) query.setId = setId;

    let cards = await collection.find(query).sort({ createdAt: -1 }).toArray();

    // Convert MongoDB dates to proper Date objects
    cards = cards.map((card) => ({
      ...card,
      createdAt: new Date(card.createdAt),
      updatedAt: new Date(card.updatedAt),
      nextReview: new Date(card.nextReview),
      lastReview: card.lastReview ? new Date(card.lastReview) : undefined,
    }));

    if (dueOnly) {
      const now = new Date();
      cards = cards.filter((card) => new Date(card.nextReview) <= now);
    }

    return NextResponse.json(cards);
  } catch (error) {
    console.error('Error fetching flashcards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch flashcards' },
      { status: 500 }
    );
  }
}

// POST create new flashcard
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { front, back, userId, setId } = body;

    if (!front || !back || !userId) {
      return NextResponse.json(
        { error: 'Front, back, and userId are required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(DATABASE_NAME);
    const collection = db.collection<Flashcard>(COLLECTION_NAME);

    const now = new Date();
    const newCard: Omit<Flashcard, '_id'> = {
      front,
      back,
      userId,
      setId: setId || undefined,
      createdAt: now,
      updatedAt: now,
      easeFactor: 2.5,
      interval: 0,
      repetitions: 0,
      hardCount: 0,
      goodCount: 0,
      nextReview: now, // Available for review immediately
    };

    const result = await collection.insertOne(newCard);

    return NextResponse.json({
      ...newCard,
      _id: result.insertedId.toString(),
    });
  } catch (error) {
    console.error('Error creating flashcard:', error);
    return NextResponse.json(
      { error: 'Failed to create flashcard' },
      { status: 500 }
    );
  }
}


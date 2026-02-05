import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { Set } from '@/types/set';
import { Flashcard } from '@/types/flashcard';

const DATABASE_NAME = process.env.DATABASE_NAME || 'flashcards';
const SETS_COLLECTION = 'sets';
const CARDS_COLLECTION = 'cards';

// POST import a set from JSON file
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, setData } = body;

    if (!userId || !setData) {
      return NextResponse.json(
        { error: 'User ID and set data are required' },
        { status: 400 }
      );
    }

    if (!setData.name || !setData.cards || !Array.isArray(setData.cards)) {
      return NextResponse.json(
        { error: 'Invalid set data format' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(DATABASE_NAME);
    const setsCollection = db.collection<Set>(SETS_COLLECTION);
    const cardsCollection = db.collection<Flashcard>(CARDS_COLLECTION);

    // Create new set
    const now = new Date();
    const newSet: Omit<Set, '_id'> = {
      name: setData.name,
      description: setData.description || '',
      userId,
      color: setData.color || '#6366f1',
      isPublic: false,
      createdAt: now,
      updatedAt: now,
    };

    const setResult = await setsCollection.insertOne(newSet);
    const newSetId = setResult.insertedId.toString();

    // Create cards
    if (setData.cards.length > 0) {
      const newCards = setData.cards.map((card: any) => ({
        front: card.front,
        back: card.back,
        userId,
        setId: newSetId,
        createdAt: now,
        updatedAt: now,
        easeFactor: 2.5,
        interval: 0,
        repetitions: 0,
        hardCount: 0,
        goodCount: 0,
        nextReview: now,
      }));

      await cardsCollection.insertMany(newCards);
    }

    return NextResponse.json({
      success: true,
      setId: newSetId,
      cardCount: setData.cards.length,
    });
  } catch (error: any) {
    console.error('Error importing set:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to import set' },
      { status: 500 }
    );
  }
}


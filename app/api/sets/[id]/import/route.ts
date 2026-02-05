import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';
import { Set } from '@/types/set';
import { Flashcard } from '@/types/flashcard';

const DATABASE_NAME = process.env.DATABASE_NAME || 'flashcards';
const SETS_COLLECTION = 'sets';
const CARDS_COLLECTION = 'cards';

// POST import a public set (copy it to user's collection)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid set ID format' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(DATABASE_NAME);
    const setsCollection = db.collection<Set>(SETS_COLLECTION);
    const cardsCollection = db.collection<Flashcard>(CARDS_COLLECTION);

    // Get the public set
    const publicSet = await setsCollection.findOne({
      _id: new ObjectId(id),
      isPublic: true,
    } as any);

    if (!publicSet) {
      return NextResponse.json(
        { error: 'Public set not found' },
        { status: 404 }
      );
    }

    // Get all cards from the public set
    const originalCards = await cardsCollection
      .find({
        setId: id,
        userId: publicSet.userId,
      })
      .toArray();

    // Create new set for the user
    const now = new Date();
    const newSet: Omit<Set, '_id'> = {
      name: `${publicSet.name} (Imported)`,
      description: publicSet.description || '',
      userId,
      color: publicSet.color || '#6366f1',
      isPublic: false, // Imported sets are private by default
      createdAt: now,
      updatedAt: now,
    };

    const setResult = await setsCollection.insertOne(newSet);
    const newSetId = setResult.insertedId.toString();

    // Copy all cards to the new set
    if (originalCards.length > 0) {
      const newCards = originalCards.map((card) => ({
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
      cardCount: originalCards.length,
    });
  } catch (error: any) {
    console.error('Error importing set:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to import set' },
      { status: 500 }
    );
  }
}


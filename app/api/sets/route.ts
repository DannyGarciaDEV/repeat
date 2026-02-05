import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { Set } from '@/types/set';
import { Flashcard } from '@/types/flashcard';

const DATABASE_NAME = process.env.DATABASE_NAME || 'flashcards';
const SETS_COLLECTION = 'sets';
const CARDS_COLLECTION = 'cards';

// GET all sets for a user
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    // Require userId to prevent showing other users' sets
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Ensure userId is a string for proper querying
    const query: any = { userId: String(userId) };

    const client = await clientPromise;
    const db = client.db(DATABASE_NAME);
    const setsCollection = db.collection<Set>(SETS_COLLECTION);
    const cardsCollection = db.collection<Flashcard>(CARDS_COLLECTION);

    // Query with exact userId match
    const sets = await setsCollection
      .find({ userId: String(userId) })
      .sort({ createdAt: -1 })
      .toArray();

    // Get card counts for each set
    const setsWithCounts = await Promise.all(
      sets.map(async (set) => {
        const count = await cardsCollection.countDocuments({
          setId: set._id?.toString(),
          userId,
        });
        return {
          ...set,
          _id: set._id?.toString(),
          cardCount: count,
          createdAt: new Date(set.createdAt),
          updatedAt: new Date(set.updatedAt),
        };
      })
    );

    return NextResponse.json(setsWithCounts);
  } catch (error) {
    console.error('Error fetching sets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sets' },
      { status: 500 }
    );
  }
}

// POST create new set
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, userId, color } = body;

    if (!name || !userId) {
      return NextResponse.json(
        { error: 'Name and userId are required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(DATABASE_NAME);
    const collection = db.collection<Set>(SETS_COLLECTION);

    const now = new Date();
    const newSet: Omit<Set, '_id'> = {
      name,
      description: description || '',
      userId,
      color: color || '#6366f1', // Default indigo
      isPublic: false, // New sets are private by default
      createdAt: now,
      updatedAt: now,
    };

    const result = await collection.insertOne(newSet);

    return NextResponse.json({
      ...newSet,
      _id: result.insertedId.toString(),
    });
  } catch (error) {
    console.error('Error creating set:', error);
    return NextResponse.json(
      { error: 'Failed to create set' },
      { status: 500 }
    );
  }
}


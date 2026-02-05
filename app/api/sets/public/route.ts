import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';
import { Set } from '@/types/set';
import { Flashcard } from '@/types/flashcard';
import { User } from '@/types/user';

const DATABASE_NAME = process.env.DATABASE_NAME || 'flashcards';
const SETS_COLLECTION = 'sets';
const CARDS_COLLECTION = 'cards';
const USERS_COLLECTION = 'users';

// GET all public sets
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';

    const client = await clientPromise;
    const db = client.db(DATABASE_NAME);
    const setsCollection = db.collection<Set>(SETS_COLLECTION);
    const cardsCollection = db.collection<Flashcard>(CARDS_COLLECTION);
    const usersCollection = db.collection<User>(USERS_COLLECTION);

    // Build query - ensure isPublic is explicitly true
    const query: any = { isPublic: true };
    if (search) {
      query.$and = [
        { isPublic: true },
        {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
          ],
        },
      ];
    }

    const sets = await setsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    // Get owner names and card counts
    const setsWithDetails = await Promise.all(
      sets.map(async (set) => {
        let owner = null;
        if (ObjectId.isValid(set.userId)) {
          owner = await usersCollection.findOne(
            { _id: new ObjectId(set.userId) } as any,
            { projection: { name: 1 } }
          );
        }
        const count = await cardsCollection.countDocuments({
          setId: set._id?.toString(),
          userId: set.userId,
        });
        return {
          ...set,
          _id: set._id?.toString(),
          cardCount: count,
          ownerName: owner?.name || 'Unknown',
          createdAt: new Date(set.createdAt),
          updatedAt: new Date(set.updatedAt),
        };
      })
    );

    return NextResponse.json(setsWithDetails);
  } catch (error) {
    console.error('Error fetching public sets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch public sets' },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';
import { User } from '@/types/user';

const DATABASE_NAME = process.env.DATABASE_NAME || 'flashcards';
const COLLECTION_NAME = 'users';

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ user: null });
    }

    // Validate ObjectId format
    if (!ObjectId.isValid(userId)) {
      return NextResponse.json({ user: null });
    }

    const client = await clientPromise;
    const db = client.db(DATABASE_NAME);
    const collection = db.collection<User>(COLLECTION_NAME);

    const user = await collection.findOne({ _id: new ObjectId(userId) } as any);

    if (!user) {
      return NextResponse.json({ user: null });
    }

    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      user: {
        ...userWithoutPassword,
        _id: userWithoutPassword._id?.toString(),
      },
    });
  } catch (error) {
    console.error('Error getting session:', error);
    // Return null user on error - let client handle it
    return NextResponse.json({ user: null });
  }
}


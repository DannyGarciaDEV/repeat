import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';
import { Flashcard } from '@/types/flashcard';
import { calculateNextReview } from '@/lib/spacedRepetition';

const DATABASE_NAME = process.env.DATABASE_NAME || 'flashcards';
const COLLECTION_NAME = 'cards';

// POST review flashcard (update spaced repetition data)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { quality } = body; // 0-5: 0=again, 1=hard, 2=good, 3=easy

    if (quality === undefined || quality < 0 || quality > 3) {
      return NextResponse.json(
        { error: 'Quality must be between 0 and 3' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(DATABASE_NAME);
    const collection = db.collection<Flashcard>(COLLECTION_NAME);

    // Get current card
    const card = await collection.findOne({
      _id: new ObjectId(id),
    } as any);

    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    // Calculate next review using spaced repetition
    const { interval, easeFactor, repetitions, nextReview, hardCount, goodCount } = calculateNextReview(
      card as Flashcard,
      quality
    );

    // Update card
    const now = new Date();
    await collection.updateOne(
      { _id: new ObjectId(id) } as any,
      {
        $set: {
          interval,
          easeFactor,
          repetitions,
          nextReview,
          lastReview: now,
          quality,
          hardCount,
          goodCount,
          updatedAt: now,
        },
      }
    );

    return NextResponse.json({
      success: true,
      nextReview,
      interval,
      easeFactor,
      repetitions,
    });
  } catch (error) {
    console.error('Error reviewing flashcard:', error);
    return NextResponse.json(
      { error: 'Failed to review flashcard' },
      { status: 500 }
    );
  }
}


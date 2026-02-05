import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';
import { Flashcard } from '@/types/flashcard';
import { calculateNextReview } from '@/lib/spacedRepetition';

const DATABASE_NAME = process.env.DATABASE_NAME || 'flashcards';
const COLLECTION_NAME = 'cards';

// GET single flashcard
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const client = await clientPromise;
    const db = client.db(DATABASE_NAME);
    const collection = db.collection<Flashcard>(COLLECTION_NAME);

    const card = await collection.findOne({
      _id: new ObjectId(id),
    } as any);

    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    return NextResponse.json({
      ...card,
      createdAt: new Date(card.createdAt),
      updatedAt: new Date(card.updatedAt),
      nextReview: new Date(card.nextReview),
      lastReview: card.lastReview ? new Date(card.lastReview) : undefined,
    });
  } catch (error) {
    console.error('Error fetching flashcard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch flashcard' },
      { status: 500 }
    );
  }
}

// PUT update flashcard
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { front, back, setId } = body;

    if (!front || !back) {
      return NextResponse.json(
        { error: 'Front and back are required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(DATABASE_NAME);
    const collection = db.collection<Flashcard>(COLLECTION_NAME);

    const updateData: any = {
      front,
      back,
      updatedAt: new Date(),
    };

    if (setId !== undefined) {
      updateData.setId = setId || null;
    }

    const result = await collection.updateOne(
      { _id: new ObjectId(id) } as any,
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating flashcard:', error);
    return NextResponse.json(
      { error: 'Failed to update flashcard' },
      { status: 500 }
    );
  }
}

// DELETE flashcard
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Validate ObjectId format
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid card ID format' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(DATABASE_NAME);
    const collection = db.collection<Flashcard>(COLLECTION_NAME);

    const result = await collection.deleteOne({
      _id: new ObjectId(id),
    } as any);

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting flashcard:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete flashcard' },
      { status: 500 }
    );
  }
}


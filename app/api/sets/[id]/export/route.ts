import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';
import { Set } from '@/types/set';
import { Flashcard } from '@/types/flashcard';

const DATABASE_NAME = process.env.DATABASE_NAME || 'flashcards';
const SETS_COLLECTION = 'sets';
const CARDS_COLLECTION = 'cards';

// GET export a set as JSON
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    // Get the set
    const set = await setsCollection.findOne({
      _id: new ObjectId(id),
    } as any);

    if (!set) {
      return NextResponse.json({ error: 'Set not found' }, { status: 404 });
    }

    // Get all cards from the set
    const cards = await cardsCollection
      .find({
        setId: id,
        userId: set.userId,
      })
      .toArray();

    // Prepare export data
    const exportData = {
      name: set.name,
      description: set.description || '',
      color: set.color || '#6366f1',
      cards: cards.map((card) => ({
        front: card.front,
        back: card.back,
      })),
      exportedAt: new Date().toISOString(),
      version: '1.0',
    };

    // Return as downloadable JSON
    const jsonString = JSON.stringify(exportData, null, 2);
    return new NextResponse(jsonString, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${set.name.replace(/[^a-z0-9]/gi, '_')}.json"`,
      },
    });
  } catch (error: any) {
    console.error('Error exporting set:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to export set' },
      { status: 500 }
    );
  }
}


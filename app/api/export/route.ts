import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';
import { Set } from '@/types/set';
import { Flashcard } from '@/types/flashcard';

const DATABASE_NAME = process.env.DATABASE_NAME || 'flashcards';
const SETS_COLLECTION = 'sets';
const CARDS_COLLECTION = 'cards';

/**
 * GET export flashcards as JSON (same format as import).
 * Query: userId (required), setId (optional).
 * - With setId: export that set's name, description, color, and cards.
 * - Without setId: export all user's cards as one set "Exported Flashcards".
 * The returned JSON can be re-imported via Upload Set to turn back into flashcards.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const setId = searchParams.get('setId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(DATABASE_NAME);
    const setsCollection = db.collection<Set>(SETS_COLLECTION);
    const cardsCollection = db.collection<Flashcard>(CARDS_COLLECTION);

    let name: string;
    let description: string;
    let color: string;
    let cards: { front: string; back: string }[];

    if (setId && ObjectId.isValid(setId)) {
      const set = await setsCollection.findOne({
        _id: new ObjectId(setId),
        userId,
      } as any);
      if (!set) {
        return NextResponse.json({ error: 'Set not found' }, { status: 404 });
      }
      const setCards = await cardsCollection
        .find({ userId, setId })
        .toArray();
      name = set.name;
      description = set.description || '';
      color = set.color || '#f43f5e';
      cards = setCards.map((c) => ({ front: c.front, back: c.back }));
    } else {
      const allCards = await cardsCollection
        .find({ userId })
        .toArray();
      name = 'Exported Flashcards';
      description = `Exported ${allCards.length} cards on ${new Date().toISOString().slice(0, 10)}`;
      color = '#f43f5e';
      cards = allCards.map((c) => ({ front: c.front, back: c.back }));
    }

    const exportData = {
      name,
      description,
      color,
      cards,
      exportedAt: new Date().toISOString(),
      version: '1.0',
    };

    const filename = (setId ? name : 'repeat_export').replace(/[^a-z0-9]/gi, '_') + '.json';
    const jsonString = JSON.stringify(exportData, null, 2);
    return new NextResponse(jsonString, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error('Error exporting flashcards:', error);
    return NextResponse.json(
      { error: error.message || 'Export failed' },
      { status: 500 }
    );
  }
}

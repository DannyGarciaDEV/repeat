import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { Set } from '@/types/set';
import { Flashcard } from '@/types/flashcard';

const DATABASE_NAME = process.env.DATABASE_NAME || 'flashcards';
const SETS_COLLECTION = 'sets';
const CARDS_COLLECTION = 'cards';

// Validate and normalize: one set object or array of set objects
function normalizeSets(setData: unknown): { name: string; description?: string; color?: string; cards: { front: string; back: string }[] }[] {
  if (Array.isArray(setData)) {
    return setData.filter(
      (s): s is { name: string; cards: unknown[] } =>
        s && typeof s === 'object' && typeof s.name === 'string' && Array.isArray(s.cards)
    ).map((s) => ({
      name: s.name,
      description: typeof s.description === 'string' ? s.description : '',
      color: typeof s.color === 'string' ? s.color : '#6366f1',
      cards: s.cards
        .filter((c): c is { front: string; back: string } => c && typeof c.front === 'string' && typeof c.back === 'string')
        .map((c) => ({ front: c.front, back: c.back })),
    }));
  }
  if (setData && typeof setData === 'object' && 'name' in setData && 'cards' in setData) {
    const s = setData as { name: string; description?: string; color?: string; cards: unknown[] };
    if (typeof s.name !== 'string' || !Array.isArray(s.cards)) return [];
    return [{
      name: s.name,
      description: typeof s.description === 'string' ? s.description : '',
      color: typeof s.color === 'string' ? s.color : '#6366f1',
      cards: s.cards
        .filter((c): c is { front: string; back: string } => c && typeof c.front === 'string' && typeof c.back === 'string')
        .map((c) => ({ front: c.front, back: c.back })),
    }];
  }
  return [];
}

// POST import set(s) from JSON file. Accepts single set object or array of sets.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, setData } = body;

    if (!userId || setData === undefined) {
      return NextResponse.json(
        { error: 'User ID and set data are required' },
        { status: 400 }
      );
    }

    const setsToImport = normalizeSets(setData);
    if (setsToImport.length === 0) {
      return NextResponse.json(
        { error: 'Invalid format. Use a single set { "name": "...", "cards": [...] } or an array of sets.' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(DATABASE_NAME);
    const setsCollection = db.collection<Set>(SETS_COLLECTION);
    const cardsCollection = db.collection<Flashcard>(CARDS_COLLECTION);
    const now = new Date();
    const results: { setId: string; name: string; cardCount: number }[] = [];

    for (const set of setsToImport) {
      const newSet: Omit<Set, '_id'> = {
        name: set.name,
        description: set.description || '',
        userId,
        color: set.color || '#6366f1',
        isPublic: false,
        createdAt: now,
        updatedAt: now,
      };

      const setResult = await setsCollection.insertOne(newSet);
      const newSetId = setResult.insertedId.toString();

      if (set.cards.length > 0) {
        const newCards = set.cards.map((card) => ({
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

      results.push({ setId: newSetId, name: set.name, cardCount: set.cards.length });
    }

    return NextResponse.json({
      success: true,
      imported: results.length,
      sets: results,
      setId: results[0]?.setId,
      cardCount: results.reduce((sum, r) => sum + r.cardCount, 0),
    });
  } catch (error: any) {
    console.error('Error importing set:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to import set' },
      { status: 500 }
    );
  }
}


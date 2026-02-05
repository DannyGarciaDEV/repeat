import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';
import { Set } from '@/types/set';

const DATABASE_NAME = process.env.DATABASE_NAME || 'flashcards';
const COLLECTION_NAME = 'sets';

// GET single set
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const client = await clientPromise;
    const db = client.db(DATABASE_NAME);
    const collection = db.collection<Set>(COLLECTION_NAME);

    const set = await collection.findOne({
      _id: new ObjectId(id),
    } as any);

    if (!set) {
      return NextResponse.json({ error: 'Set not found' }, { status: 404 });
    }

    return NextResponse.json({
      ...set,
      _id: set._id?.toString(),
      createdAt: new Date(set.createdAt),
      updatedAt: new Date(set.updatedAt),
    });
  } catch (error) {
    console.error('Error fetching set:', error);
    return NextResponse.json(
      { error: 'Failed to fetch set' },
      { status: 500 }
    );
  }
}

// PUT update set
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, color, isPublic } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(DATABASE_NAME);
    const collection = db.collection<Set>(COLLECTION_NAME);

    const updateData: any = {
      name,
      updatedAt: new Date(),
    };

    if (description !== undefined) updateData.description = description;
    if (color !== undefined) updateData.color = color;
    if (isPublic !== undefined) updateData.isPublic = isPublic;

    const result = await collection.updateOne(
      { _id: new ObjectId(id) } as any,
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Set not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating set:', error);
    return NextResponse.json(
      { error: 'Failed to update set' },
      { status: 500 }
    );
  }
}

// DELETE set
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Validate ObjectId format
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid set ID format' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(DATABASE_NAME);
    const setsCollection = db.collection<Set>(COLLECTION_NAME);
    const cardsCollection = db.collection('cards');

    // Remove setId from all cards in this set
    await cardsCollection.updateMany(
      { setId: id },
      { $unset: { setId: '' } }
    );

    // Delete the set
    const result = await setsCollection.deleteOne({
      _id: new ObjectId(id),
    } as any);

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Set not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting set:', error);
    
    // Validate ObjectId format error
    if (error.message && error.message.includes('ObjectId')) {
      return NextResponse.json(
        { error: 'Invalid set ID format' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to delete set' },
      { status: 500 }
    );
  }
}


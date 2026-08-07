import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { auth } from '@/auth';
import { connectToDatabase } from '@/lib/db';
import { Card } from '@/models/Card';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { cards } = await req.json();

    if (!Array.isArray(cards) || cards.length === 0) {
      return NextResponse.json({ error: 'Array of cards is required for reordering.' }, { status: 400 });
    }

    await connectToDatabase();

    // Perform bulk write operation for batch card order updates
    const bulkOps = cards.map((item: { id: string; columnId: string; order: number }) => ({
      updateOne: {
        filter: { _id: item.id },
        update: {
          $set: {
            columnId: mongoose.Types.ObjectId.isValid(item.columnId)
              ? new mongoose.Types.ObjectId(item.columnId)
              : (item.columnId as unknown as mongoose.Types.ObjectId),
            order: item.order,
          },
        },
      },
    }));

    await Card.bulkWrite(bulkOps);

    return NextResponse.json({ message: 'Cards reordered successfully.' });
  } catch (error: any) {
    console.error('Error reordering cards:', error);
    return NextResponse.json({ error: error.message || 'Error reordering cards.' }, { status: 500 });
  }
}

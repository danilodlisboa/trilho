import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { auth } from '@/auth';
import { connectToDatabase } from '@/lib/db';
import { Card } from '@/models/Card';
import { Board } from '@/models/Board';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { cards } = await req.json();

    if (!Array.isArray(cards) || cards.length === 0) {
      return NextResponse.json({ error: 'Array of cards is required for reordering.' }, { status: 400 });
    }

    await connectToDatabase();

    const userId = session.user?.id;

    // Verify board membership for ALL cards in the batch reordering request to prevent IDOR
    const cardIds = cards.map((c: { id: string }) => c.id).filter(Boolean);
    const existingCards = await Card.find({ _id: { $in: cardIds } });

    if (existingCards.length !== cardIds.length) {
      return NextResponse.json({ error: 'One or more cards were not found.' }, { status: 404 });
    }

    const uniqueBoardIds = Array.from(new Set(existingCards.map((c) => c.boardId.toString())));
    const authorizedBoards = await Board.find({
      _id: { $in: uniqueBoardIds },
      $or: [{ ownerId: userId }, { members: userId }],
    });

    if (authorizedBoards.length !== uniqueBoardIds.length) {
      return NextResponse.json({ error: 'Forbidden. One or more cards do not belong to your boards.' }, { status: 403 });
    }

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
    return NextResponse.json({ error: 'Error reordering cards.' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectToDatabase } from '@/lib/db';
import { Column } from '@/models/Column';
import { Board } from '@/models/Board';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { columns } = await req.json();

    if (!Array.isArray(columns) || columns.length === 0) {
      return NextResponse.json({ error: 'columns array is required.' }, { status: 400 });
    }

    await connectToDatabase();

    const userId = session.user?.id;

    // Verify board membership for ALL columns in the batch reordering request to prevent IDOR
    const colIds = columns.map((c: { id: string }) => c.id).filter(Boolean);
    const existingCols = await Column.find({ _id: { $in: colIds } });

    if (existingCols.length !== colIds.length) {
      return NextResponse.json({ error: 'One or more columns were not found.' }, { status: 404 });
    }

    const uniqueBoardIds = Array.from(new Set(existingCols.map((c) => c.boardId.toString())));
    const authorizedBoards = await Board.find({
      _id: { $in: uniqueBoardIds },
      $or: [{ ownerId: userId }, { members: userId }],
    });

    if (authorizedBoards.length !== uniqueBoardIds.length) {
      return NextResponse.json({ error: 'Forbidden. One or more columns do not belong to your boards.' }, { status: 403 });
    }

    const bulkOps = columns.map((col: { id: string; order: number }) => ({
      updateOne: {
        filter: { _id: col.id },
        update: { $set: { order: col.order } },
      },
    }));

    await Column.bulkWrite(bulkOps);

    return NextResponse.json({ message: 'Columns reordered successfully.' });
  } catch (error: any) {
    console.error('Error reordering columns:', error);
    return NextResponse.json({ error: 'Error reordering columns.' }, { status: 500 });
  }
}

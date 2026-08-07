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

    // Verify first column board membership to authorize reorder batch
    const firstCol = await Column.findById(columns[0].id);
    if (!firstCol) {
      return NextResponse.json({ error: 'Column not found.' }, { status: 404 });
    }

    const board = await Board.findById(firstCol.boardId);
    if (!board) {
      return NextResponse.json({ error: 'Board not found.' }, { status: 404 });
    }

    const isOwner = board.ownerId.toString() === userId;
    const isMember = board.members.some((m) => m.toString() === userId);
    if (!isOwner && !isMember) {
      return NextResponse.json({ error: 'Forbidden. You are not a member of this board.' }, { status: 403 });
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

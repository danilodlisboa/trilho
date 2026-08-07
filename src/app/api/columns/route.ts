import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectToDatabase } from '@/lib/db';
import { Column } from '@/models/Column';
import { Card } from '@/models/Card';
import { Board } from '@/models/Board';

async function checkBoardMember(boardId: string, userId: string): Promise<boolean> {
  const board = await Board.findById(boardId);
  if (!board) return false;
  const isOwner = board.ownerId.toString() === userId;
  const isMember = board.members.some((m) => m.toString() === userId);
  return isOwner || isMember;
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { boardId, title } = await req.json();

    if (!boardId || !title?.trim()) {
      return NextResponse.json({ error: 'boardId and title are required.' }, { status: 400 });
    }

    await connectToDatabase();

    const isAuthorized = await checkBoardMember(boardId, session.user.id);
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Forbidden. You are not a member of this board.' }, { status: 403 });
    }

    const colCount = await Column.countDocuments({ boardId });

    const newColumn = await Column.create({
      boardId,
      title: title.trim(),
      order: colCount,
    });

    return NextResponse.json(newColumn, { status: 201 });
  } catch (error: any) {
    console.error('Error creating column:', error);
    return NextResponse.json({ error: 'Error creating column.' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { columnId, title, order } = await req.json();

    if (!columnId) {
      return NextResponse.json({ error: 'columnId is required.' }, { status: 400 });
    }

    await connectToDatabase();

    const existingCol = await Column.findById(columnId);
    if (!existingCol) {
      return NextResponse.json({ error: 'Column not found.' }, { status: 404 });
    }

    const isAuthorized = await checkBoardMember(existingCol.boardId.toString(), session.user.id);
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Forbidden. You are not a member of this board.' }, { status: 403 });
    }

    const updateData: any = {};
    if (title) updateData.title = title.trim();
    if (order !== undefined) updateData.order = order;

    const column = await Column.findByIdAndUpdate(columnId, updateData, { new: true });

    return NextResponse.json(column);
  } catch (error: any) {
    console.error('Error updating column:', error);
    return NextResponse.json({ error: 'Error updating column.' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const columnId = searchParams.get('columnId');

    if (!columnId) {
      return NextResponse.json({ error: 'columnId is required.' }, { status: 400 });
    }

    await connectToDatabase();

    const existingCol = await Column.findById(columnId);
    if (!existingCol) {
      return NextResponse.json({ error: 'Column not found.' }, { status: 404 });
    }

    const isAuthorized = await checkBoardMember(existingCol.boardId.toString(), session.user.id);
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Forbidden. You are not a member of this board.' }, { status: 403 });
    }

    await Card.deleteMany({ columnId });
    await Column.findByIdAndDelete(columnId);

    return NextResponse.json({ message: 'Column deleted successfully.' });
  } catch (error: any) {
    console.error('Error deleting column:', error);
    return NextResponse.json({ error: 'Error deleting column.' }, { status: 500 });
  }
}

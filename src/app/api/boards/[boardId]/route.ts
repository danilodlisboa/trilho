import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectToDatabase } from '@/lib/db';
import { Board } from '@/models/Board';
import { Column } from '@/models/Column';
import { Card } from '@/models/Card';

export async function GET(req: Request, { params }: { params: Promise<{ boardId: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { boardId } = await params;

    await connectToDatabase();

    const board = await Board.findById(boardId).populate('members', 'name email avatarUrl');
    if (!board) {
      return NextResponse.json({ error: 'Board not found.' }, { status: 404 });
    }

    const columns = await Column.find({ boardId }).sort({ order: 1 });
    const cards = await Card.find({ boardId })
      .populate('assigneeId', 'name email avatarUrl')
      .sort({ order: 1 });

    return NextResponse.json({
      board,
      columns,
      cards,
    });
  } catch (error: any) {
    console.error('Error fetching board details:', error);
    return NextResponse.json({ error: error.message || 'Error loading board details.' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ boardId: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { boardId } = await params;
    const { title, description } = await req.json();

    await connectToDatabase();

    const updateData: any = {};
    if (title) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description;

    const board = await Board.findByIdAndUpdate(boardId, updateData, { new: true }).populate(
      'members',
      'name email avatarUrl'
    );

    return NextResponse.json(board);
  } catch (error: any) {
    console.error('Error updating board:', error);
    return NextResponse.json({ error: error.message || 'Error updating board.' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ boardId: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { boardId } = await params;

    await connectToDatabase();

    await Card.deleteMany({ boardId });
    await Column.deleteMany({ boardId });
    await Board.findByIdAndDelete(boardId);

    return NextResponse.json({ message: 'Board deleted successfully.' });
  } catch (error: any) {
    console.error('Error deleting board:', error);
    return NextResponse.json({ error: error.message || 'Error deleting board.' }, { status: 500 });
  }
}

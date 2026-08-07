import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectToDatabase } from '@/lib/db';
import { Board } from '@/models/Board';
import { Column } from '@/models/Column';
import { Card } from '@/models/Card';
import { User } from '@/models/User';

async function getAuthenticatedUser(session: any) {
  if (!session?.user?.id && !session?.user?.email) return null;
  const dbUser = await User.findOne({
    $or: [{ _id: session.user.id }, { email: session.user.email?.toLowerCase() }],
  });
  return dbUser;
}

export async function GET(req: Request, { params }: { params: Promise<{ boardId: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { boardId } = await params;

    await connectToDatabase();

    const dbUser = await getAuthenticatedUser(session);
    if (!dbUser) {
      return NextResponse.json({ error: 'Unauthorized. User not found in database.' }, { status: 401 });
    }
    const userId = dbUser._id.toString();

    const board = await Board.findById(boardId).populate('members', 'name email avatarUrl');
    if (!board) {
      return NextResponse.json({ error: 'Board not found.' }, { status: 404 });
    }

    const isOwner = board.ownerId.toString() === userId;
    const isMember = board.members.some((m: any) => (m._id ? m._id.toString() : m.toString()) === userId);

    if (!isOwner && !isMember) {
      return NextResponse.json({ error: 'Access denied. You are not a member of this board.' }, { status: 403 });
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
    return NextResponse.json({ error: 'Error loading board details.' }, { status: 500 });
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

    const dbUser = await getAuthenticatedUser(session);
    if (!dbUser) {
      return NextResponse.json({ error: 'Unauthorized. User not found in database.' }, { status: 401 });
    }
    const userId = dbUser._id.toString();

    const board = await Board.findById(boardId);
    if (!board) {
      return NextResponse.json({ error: 'Board not found.' }, { status: 404 });
    }

    if (board.ownerId.toString() !== userId) {
      return NextResponse.json({ error: 'Only board owner can edit this board.' }, { status: 403 });
    }

    const updateData: any = {};
    if (title) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description;

    const updatedBoard = await Board.findByIdAndUpdate(boardId, updateData, { new: true }).populate(
      'members',
      'name email avatarUrl'
    );

    return NextResponse.json(updatedBoard);
  } catch (error: any) {
    console.error('Error updating board:', error);
    return NextResponse.json({ error: 'Error updating board.' }, { status: 500 });
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

    const dbUser = await getAuthenticatedUser(session);
    if (!dbUser) {
      return NextResponse.json({ error: 'Unauthorized. User not found in database.' }, { status: 401 });
    }
    const userId = dbUser._id.toString();

    const board = await Board.findById(boardId);
    if (!board) {
      return NextResponse.json({ error: 'Board not found.' }, { status: 404 });
    }

    if (board.ownerId.toString() !== userId) {
      return NextResponse.json({ error: 'Only board owner can delete this board.' }, { status: 403 });
    }

    await Card.deleteMany({ boardId });
    await Column.deleteMany({ boardId });
    await Board.findByIdAndDelete(boardId);

    return NextResponse.json({ message: 'Board deleted successfully.' });
  } catch (error: any) {
    console.error('Error deleting board:', error);
    return NextResponse.json({ error: 'Error deleting board.' }, { status: 500 });
  }
}

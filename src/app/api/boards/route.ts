import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectToDatabase } from '@/lib/db';
import { Board } from '@/models/Board';
import { Column } from '@/models/Column';
import { User } from '@/models/User';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id && !session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    await connectToDatabase();

    let userId = session.user.id;
    if (!userId) {
      const dbUser = await User.findOne({ email: session.user.email });
      if (dbUser) userId = dbUser._id.toString();
    }

    if (!userId) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    const boards = await Board.find({
      $or: [{ ownerId: userId }, { members: userId }],
    })
      .populate('members', 'name email avatarUrl')
      .sort({ createdAt: -1 });

    return NextResponse.json(boards);
  } catch (error: any) {
    console.error('Error fetching boards:', error);
    return NextResponse.json({ error: error.message || 'Error loading boards.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id && !session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { title, description } = await req.json();

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Board title is required.' }, { status: 400 });
    }

    await connectToDatabase();

    let userId = session.user.id;
    if (!userId) {
      const dbUser = await User.findOne({ email: session.user.email });
      if (dbUser) userId = dbUser._id.toString();
    }

    const board = await Board.create({
      title: title.trim(),
      description: description || '',
      ownerId: userId,
      members: [userId],
    });

    // Create 4 standard default columns in English for every new board
    const defaultColumns = ['To Do', 'In Progress', 'In Review', 'Done'];
    const createdColumns = await Promise.all(
      defaultColumns.map((colTitle, index) =>
        Column.create({
          boardId: board._id,
          title: colTitle,
          order: index,
        })
      )
    );

    const populatedBoard = await Board.findById(board._id).populate('members', 'name email avatarUrl');

    return NextResponse.json(
      {
        board: populatedBoard,
        columns: createdColumns,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating board:', error);
    return NextResponse.json({ error: error.message || 'Error creating board.' }, { status: 500 });
  }
}

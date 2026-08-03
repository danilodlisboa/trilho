import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectToDatabase } from '@/lib/db';
import { Board } from '@/models/Board';
import { User } from '@/models/User';

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ boardId: string; identifier: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id && !session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { boardId, identifier } = await params;

    await connectToDatabase();

    const dbUser = await User.findOne({
      $or: [{ _id: session.user.id }, { email: session.user.email?.toLowerCase() }],
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'Unauthorized. User not found in database.' }, { status: 401 });
    }

    const userId = dbUser._id.toString();
    const board = await Board.findById(boardId).populate('members', 'name email avatarUrl');

    if (!board) {
      return NextResponse.json({ error: 'Board not found.' }, { status: 404 });
    }

    if (board.ownerId.toString() !== userId) {
      return NextResponse.json({ error: 'Only board owner can remove members.' }, { status: 403 });
    }

    if (identifier === board.ownerId.toString()) {
      return NextResponse.json({ error: 'Cannot remove board owner.' }, { status: 400 });
    }

    const lowerId = identifier.toLowerCase();

    // Filter members (by _id string or email)
    board.members = board.members.filter((m: any) => {
      const mId = m._id ? m._id.toString() : m.toString();
      const mEmail = m.email ? m.email.toLowerCase() : '';
      return mId !== identifier && mEmail !== lowerId;
    });

    // Filter invitations (by invitation id or email)
    board.invitations = (board.invitations || []).filter((inv) => {
      return inv.id !== identifier && inv.email.toLowerCase() !== lowerId;
    });

    await board.save();

    const updatedBoard = await Board.findById(boardId).populate('members', 'name email avatarUrl');

    return NextResponse.json(updatedBoard);
  } catch (error: any) {
    console.error('Error removing member:', error);
    return NextResponse.json({ error: error.message || 'Error removing member.' }, { status: 500 });
  }
}

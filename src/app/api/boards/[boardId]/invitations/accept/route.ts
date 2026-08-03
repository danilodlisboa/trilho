import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectToDatabase } from '@/lib/db';
import { Board } from '@/models/Board';
import { User } from '@/models/User';

export async function POST(req: Request, { params }: { params: Promise<{ boardId: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id && !session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { boardId } = await params;

    await connectToDatabase();

    const dbUser = await User.findOne({
      $or: [{ _id: session.user.id }, { email: session.user.email?.toLowerCase() }],
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'Unauthorized. User not found in database.' }, { status: 401 });
    }

    const userId = dbUser._id;
    const userEmail = dbUser.email.toLowerCase();

    const board = await Board.findById(boardId);
    if (!board) {
      return NextResponse.json({ error: 'Board not found.' }, { status: 404 });
    }

    const targetInv = board.invitations?.find(
      (inv) => inv.email.toLowerCase() === userEmail && inv.status === 'pending'
    );

    if (!targetInv) {
      return NextResponse.json({ error: 'No pending invitation found for this board.' }, { status: 404 });
    }

    targetInv.status = 'accepted';

    // Append to members if not already there
    const alreadyMember = board.members.some((m) => m.toString() === userId.toString());
    if (!alreadyMember) {
      board.members.push(userId);
    }

    await board.save();

    const updatedBoard = await Board.findById(boardId).populate('members', 'name email avatarUrl');

    return NextResponse.json(updatedBoard);
  } catch (error: any) {
    console.error('Error accepting invitation:', error);
    return NextResponse.json({ error: error.message || 'Error accepting invitation.' }, { status: 500 });
  }
}

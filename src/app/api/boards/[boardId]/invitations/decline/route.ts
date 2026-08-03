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

    const userEmail = dbUser.email.toLowerCase();

    const board = await Board.findById(boardId);
    if (!board) {
      return NextResponse.json({ error: 'Board not found.' }, { status: 404 });
    }

    board.invitations = (board.invitations || []).filter(
      (inv) => !(inv.email.toLowerCase() === userEmail && inv.status === 'pending')
    );

    await board.save();

    return NextResponse.json({ message: 'Invitation declined successfully.' });
  } catch (error: any) {
    console.error('Error declining invitation:', error);
    return NextResponse.json({ error: error.message || 'Error declining invitation.' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectToDatabase } from '@/lib/db';
import { Board } from '@/models/Board';
import { User } from '@/models/User';
import crypto from 'crypto';

export async function POST(req: Request, { params }: { params: Promise<{ boardId: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id && !session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { boardId } = await params;
    const { email } = await req.json();

    if (!email || !email.trim()) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

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
      return NextResponse.json({ error: 'Only board owner can send invitations.' }, { status: 403 });
    }

    const targetEmail = email.trim().toLowerCase();

    // Check if target is the owner
    const ownerUser = await User.findById(board.ownerId);
    if (ownerUser && ownerUser.email.toLowerCase() === targetEmail) {
      return NextResponse.json({ error: 'Owner is already a board member.' }, { status: 400 });
    }

    // Check if target is already an accepted member
    const isMember = board.members.some((m: any) => m.email?.toLowerCase() === targetEmail);
    if (isMember) {
      return NextResponse.json({ error: 'User is already a board member.' }, { status: 400 });
    }

    // Check if invitation already sent
    const pendingInv = board.invitations?.find(
      (inv) => inv.email.toLowerCase() === targetEmail && inv.status === 'pending'
    );
    if (pendingInv) {
      return NextResponse.json({ error: 'Invitation already sent to this email.' }, { status: 400 });
    }

    const newInvitation = {
      id: crypto.randomUUID(),
      email: targetEmail,
      status: 'pending' as const,
      invitedBy: userId,
      createdAt: new Date(),
    };

    board.invitations = board.invitations || [];
    board.invitations.push(newInvitation);
    await board.save();

    const updatedBoard = await Board.findById(boardId).populate('members', 'name email avatarUrl');

    return NextResponse.json(updatedBoard);
  } catch (error: any) {
    console.error('Error inviting member:', error);
    return NextResponse.json({ error: error.message || 'Error inviting member.' }, { status: 500 });
  }
}

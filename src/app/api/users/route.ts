import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/User';
import { Board } from '@/models/Board';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    await connectToDatabase();

    const dbUser = await User.findOne({
      $or: [{ _id: session.user.id }, { email: session.user.email?.toLowerCase() }],
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'Unauthorized. User not found in database.' }, { status: 401 });
    }

    const userId = dbUser._id.toString();

    // Find all boards where current user is owner or member
    const userBoards = await Board.find({
      $or: [{ ownerId: userId }, { members: userId }],
    });

    // Extract all unique member IDs across those boards
    const sharedUserIds = new Set<string>();
    sharedUserIds.add(userId);

    userBoards.forEach((board) => {
      if (board.ownerId) sharedUserIds.add(board.ownerId.toString());
      (board.members || []).forEach((m: any) => {
        sharedUserIds.add(m.toString());
      });
    });

    const users = await User.find(
      { _id: { $in: Array.from(sharedUserIds) } },
      'name email avatarUrl'
    ).sort({ name: 1 });

    return NextResponse.json(users);
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Error loading users.' }, { status: 500 });
  }
}

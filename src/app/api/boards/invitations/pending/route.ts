import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectToDatabase } from '@/lib/db';
import { Board } from '@/models/Board';
import { User } from '@/models/User';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id && !session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    await connectToDatabase();

    const dbUser = await User.findOne({
      $or: [{ _id: session.user.id }, { email: session.user.email?.toLowerCase() }],
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'Unauthorized. User not found in database.' }, { status: 401 });
    }

    const userEmail = dbUser.email.toLowerCase();

    const boards = await Board.find({
      'invitations.email': userEmail,
      'invitations.status': 'pending',
    }).populate('members', 'name email avatarUrl');

    return NextResponse.json(boards);
  } catch (error: any) {
    console.error('Error fetching pending invitations:', error);
    return NextResponse.json({ error: error.message || 'Error loading pending invitations.' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/User';
import { Board } from '@/models/Board';
import { Card } from '@/models/Card';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id && !session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    await connectToDatabase();
    const query = session.user.id ? { _id: session.user.id } : { email: session.user.email?.toLowerCase() };
    const user = await User.findOne(query);

    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    const userId = user._id.toString();

    // Query boards where user is owner or member
    const userBoards = await Board.find({
      $or: [{ ownerId: userId }, { members: userId }],
    });

    const boardIds = userBoards.map((b) => b._id.toString());

    // Query cards assigned to user or created in user's boards
    const userCards = await Card.find({
      $or: [{ assigneeId: userId }, { boardId: { $in: boardIds } }],
    });

    const exportData = {
      exportTimestamp: new Date().toISOString(),
      dataSubject: {
        id: userId,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
      },
      boards: userBoards.map((b) => ({
        id: b._id.toString(),
        title: b.title,
        description: b.description,
        role: b.ownerId.toString() === userId ? 'owner' : 'member',
        createdAt: b.createdAt,
      })),
      assignedCards: userCards.map((c) => ({
        id: c._id.toString(),
        boardId: c.boardId.toString(),
        title: c.title,
        description: c.description,
        priority: c.priority,
        dueDate: c.dueDate,
        customFields: c.customFields,
      })),
    };

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename="trilho-personal-data.json"',
      },
    });
  } catch (error: any) {
    console.error('Error exporting personal data:', error);
    return NextResponse.json({ error: 'Error exporting personal data.' }, { status: 500 });
  }
}

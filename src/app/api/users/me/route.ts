import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/User';
import { Board } from '@/models/Board';
import { Column } from '@/models/Column';
import { Card } from '@/models/Card';
import { CustomFieldDefinition } from '@/models/CustomFieldDefinition';

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id && !session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { name, avatarUrl } = await req.json();
    if (!name?.trim()) {
      return NextResponse.json({ error: 'Name is required.' }, { status: 400 });
    }

    const trimmedName = name.trim().slice(0, 100);
    const safeName = trimmedName.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    await connectToDatabase();
    const query = session.user.id ? { _id: session.user.id } : { email: session.user.email?.toLowerCase() };

    const user = await User.findOneAndUpdate(
      query,
      {
        name: safeName,
        ...(avatarUrl ? { avatarUrl: avatarUrl.trim() } : {}),
      },
      { new: true, select: 'name email avatarUrl isVerified' }
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Profile updated successfully.',
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        isVerified: user.isVerified,
      },
    });
  } catch (error: any) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Error updating profile.' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id && !session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { confirmEmail } = await req.json();
    const userEmail = session.user.email?.toLowerCase();

    if (!confirmEmail || confirmEmail.trim().toLowerCase() !== userEmail) {
      return NextResponse.json(
        { error: 'Email confirmation does not match account email.' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const query = session.user.id ? { _id: session.user.id } : { email: userEmail };
    const user = await User.findOne(query);

    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    const userId = user._id.toString();

    // 1. Process boards owned by user
    const ownedBoards = await Board.find({ ownerId: userId });

    for (const board of ownedBoards) {
      const remainingMembers = (board.members || []).filter((m: any) => m.toString() !== userId);

      if (remainingMembers.length === 0) {
        // Sole owner: Cascade delete board, columns, cards, custom field definitions
        const boardIdStr = board._id.toString();
        await Column.deleteMany({ boardId: boardIdStr });
        await Card.deleteMany({ boardId: boardIdStr });
        await CustomFieldDefinition.deleteMany({ boardId: boardIdStr });
        await Board.deleteOne({ _id: board._id });
      } else {
        // Multi-member: Transfer ownership to first member and remove user from members array
        const newOwnerId = remainingMembers[0];
        board.ownerId = newOwnerId;
        board.members = remainingMembers;
        await board.save();
      }
    }

    // 2. Remove user from members list in all other boards
    await Board.updateMany(
      { members: userId },
      { $pull: { members: userId } }
    );

    // 3. Remove pending invitations for user's email across all boards
    await Board.updateMany(
      { 'invitations.email': userEmail },
      { $pull: { invitations: { email: userEmail } } }
    );

    // 4. Unassign user from cards
    await Card.updateMany(
      { assigneeId: userId },
      { $set: { assigneeId: null } }
    );

    // 5. Delete User document
    await User.deleteOne({ _id: user._id });

    return NextResponse.json({
      message: 'Account and associated personal data erased successfully.',
    });
  } catch (error: any) {
    console.error('Error deleting account:', error);
    return NextResponse.json({ error: 'Error deleting account.' }, { status: 500 });
  }
}

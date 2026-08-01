import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectToDatabase } from '@/lib/db';
import { Card } from '@/models/Card';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { boardId, columnId, title, description, priority, dueDate, assigneeId } = await req.json();

    if (!boardId || !columnId || !title?.trim()) {
      return NextResponse.json({ error: 'boardId, columnId and title are required.' }, { status: 400 });
    }

    await connectToDatabase();

    const cardCount = await Card.countDocuments({ columnId });

    const newCard = await Card.create({
      boardId,
      columnId,
      title: title.trim(),
      description: description || '',
      priority: priority || 'medium',
      dueDate: dueDate ? new Date(dueDate) : null,
      assigneeId: assigneeId || null,
      checklist: [],
      order: cardCount,
    });

    const populatedCard = await Card.findById(newCard._id).populate('assigneeId', 'name email avatarUrl');

    return NextResponse.json(populatedCard, { status: 201 });
  } catch (error: any) {
    console.error('Error creating card:', error);
    return NextResponse.json({ error: error.message || 'Error creating card.' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { cardId, title, description, priority, dueDate, assigneeId, checklist, columnId, order } = await req.json();

    if (!cardId) {
      return NextResponse.json({ error: 'cardId is required.' }, { status: 400 });
    }

    await connectToDatabase();

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (priority !== undefined) updateData.priority = priority;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
    if (assigneeId !== undefined) updateData.assigneeId = assigneeId || null;
    if (checklist !== undefined) updateData.checklist = checklist;
    if (columnId !== undefined) updateData.columnId = columnId;
    if (order !== undefined) updateData.order = order;

    const updatedCard = await Card.findByIdAndUpdate(cardId, updateData, { new: true }).populate(
      'assigneeId',
      'name email avatarUrl'
    );

    return NextResponse.json(updatedCard);
  } catch (error: any) {
    console.error('Error updating card:', error);
    return NextResponse.json({ error: error.message || 'Error updating card.' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const cardId = searchParams.get('cardId');

    if (!cardId) {
      return NextResponse.json({ error: 'cardId is required.' }, { status: 400 });
    }

    await connectToDatabase();

    await Card.findByIdAndDelete(cardId);

    return NextResponse.json({ message: 'Card deleted successfully.' });
  } catch (error: any) {
    console.error('Error deleting card:', error);
    return NextResponse.json({ error: error.message || 'Error deleting card.' }, { status: 500 });
  }
}

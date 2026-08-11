import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectToDatabase } from '@/lib/db';
import { Card } from '@/models/Card';
import { Board } from '@/models/Board';
import { CustomFieldDefinition } from '@/models/CustomFieldDefinition';

async function isValidAssignee(boardId: string, assigneeId: string): Promise<boolean> {
  const board = await Board.findById(boardId);
  if (!board) return false;
  const isOwner = board.ownerId.toString() === assigneeId;
  const isMember = board.members.some((m) => m.toString() === assigneeId);
  return isOwner || isMember;
}

async function validateCustomFields(boardId: string, customFields: Array<{ fieldId: string; value: string }>): Promise<boolean> {
  if (!customFields || customFields.length === 0) return true;
  const fieldIds = customFields.map((f) => f.fieldId);
  const validFields = await CustomFieldDefinition.find({
    _id: { $in: fieldIds },
    boardId,
  });
  return validFields.length === fieldIds.length;
}

async function checkBoardAccess(boardId: string, userId: string): Promise<boolean> {
  const board = await Board.findById(boardId);
  if (!board) return false;
  const isOwner = board.ownerId.toString() === userId;
  const isMember = board.members.some((m) => m.toString() === userId);
  return isOwner || isMember;
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { boardId, columnId, title, description, priority, dueDate, assigneeId, customFields } = await req.json();

    if (!boardId || !columnId || !title?.trim()) {
      return NextResponse.json({ error: 'boardId, columnId and title are required.' }, { status: 400 });
    }

    await connectToDatabase();

    const isAuthorized = await checkBoardAccess(boardId, session.user.id);
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Forbidden. You are not a member of this board.' }, { status: 403 });
    }

    if (assigneeId && assigneeId !== 'none') {
      const valid = await isValidAssignee(boardId, assigneeId);
      if (!valid) {
        return NextResponse.json({ error: 'Assignee must be an accepted board member.' }, { status: 400 });
      }
    }

    const validPriorities = ['high', 'medium', 'low'];
    if (priority && !validPriorities.includes(priority)) {
      return NextResponse.json({ error: 'Invalid priority. Must be high, medium, or low.' }, { status: 400 });
    }

    if (customFields && customFields.length > 0) {
      const isValidFields = await validateCustomFields(boardId, customFields);
      if (!isValidFields) {
        return NextResponse.json({ error: 'Custom field does not belong to this board.' }, { status: 400 });
      }
    }

    // Auto-attach board default custom fields if no customFields provided or merge default fields
    let initialCustomFields = customFields || [];
    if (!customFields) {
      const defaultDefs = await CustomFieldDefinition.find({ boardId, isDefault: true });
      initialCustomFields = defaultDefs.map((def) => ({
        fieldId: def._id.toString(),
        value: def.defaultValue || '',
      }));
    }

    const cardCount = await Card.countDocuments({ columnId });

    const newCard = await Card.create({
      boardId,
      columnId,
      title: title.trim(),
      description: description || '',
      priority: priority || 'medium',
      dueDate: dueDate ? new Date(dueDate) : null,
      assigneeId: assigneeId && assigneeId !== 'none' ? assigneeId : null,
      checklist: [],
      customFields: initialCustomFields,
      order: cardCount,
    });

    const populatedCard = await Card.findById(newCard._id).populate('assigneeId', 'name email avatarUrl');

    return NextResponse.json(populatedCard, { status: 201 });
  } catch (error: any) {
    console.error('Error creating card:', error);
    return NextResponse.json({ error: 'Error creating card.' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { cardId, title, description, priority, dueDate, assigneeId, checklist, customFields, columnId, order } = await req.json();

    if (!cardId) {
      return NextResponse.json({ error: 'cardId is required.' }, { status: 400 });
    }

    await connectToDatabase();

    const existingCard = await Card.findById(cardId);
    if (!existingCard) {
      return NextResponse.json({ error: 'Card not found.' }, { status: 404 });
    }

    const targetBoardId = existingCard.boardId.toString();

    const isAuthorized = await checkBoardAccess(targetBoardId, session.user.id);
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Forbidden. You are not a member of this board.' }, { status: 403 });
    }

    if (assigneeId !== undefined && assigneeId !== null && assigneeId !== '' && assigneeId !== 'none') {
      const valid = await isValidAssignee(targetBoardId, assigneeId);
      if (!valid) {
        return NextResponse.json({ error: 'Assignee must be an accepted board member.' }, { status: 400 });
      }
    }

    if (customFields !== undefined && customFields.length > 0) {
      const isValidFields = await validateCustomFields(targetBoardId, customFields);
      if (!isValidFields) {
        return NextResponse.json({ error: 'Custom field does not belong to this board.' }, { status: 400 });
      }
    }

    const validPriorities = ['high', 'medium', 'low'];
    if (priority !== undefined && !validPriorities.includes(priority)) {
      return NextResponse.json({ error: 'Invalid priority. Must be high, medium, or low.' }, { status: 400 });
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = String(title).trim().slice(0, 250);
    if (description !== undefined) updateData.description = String(description).slice(0, 2000);
    if (priority !== undefined) updateData.priority = priority;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
    if (assigneeId !== undefined) {
      updateData.assigneeId = assigneeId && assigneeId !== 'none' ? assigneeId : null;
    }
    if (checklist !== undefined) updateData.checklist = checklist;
    if (customFields !== undefined) updateData.customFields = customFields;
    if (columnId !== undefined) updateData.columnId = columnId;
    if (order !== undefined) updateData.order = order;

    const updatedCard = await Card.findByIdAndUpdate(cardId, updateData, { new: true }).populate(
      'assigneeId',
      'name email avatarUrl'
    );

    return NextResponse.json(updatedCard);
  } catch (error: any) {
    console.error('Error updating card:', error);
    return NextResponse.json({ error: 'Error updating card.' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const cardId = searchParams.get('cardId');

    if (!cardId) {
      return NextResponse.json({ error: 'cardId is required.' }, { status: 400 });
    }

    await connectToDatabase();

    const existingCard = await Card.findById(cardId);
    if (!existingCard) {
      return NextResponse.json({ error: 'Card not found.' }, { status: 404 });
    }

    const isAuthorized = await checkBoardAccess(existingCard.boardId.toString(), session.user.id);
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Forbidden. You are not a member of this board.' }, { status: 403 });
    }

    await Card.findByIdAndDelete(cardId);

    return NextResponse.json({ message: 'Card deleted successfully.' });
  } catch (error: any) {
    console.error('Error deleting card:', error);
    return NextResponse.json({ error: 'Error deleting card.' }, { status: 500 });
  }
}

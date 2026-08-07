import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectToDatabase } from '@/lib/db';
import { Board } from '@/models/Board';
import { Card } from '@/models/Card';
import { CustomFieldDefinition } from '@/models/CustomFieldDefinition';

async function checkBoardAccess(boardId: string, userId: string) {
  const board = await Board.findById(boardId);
  if (!board) return { board: null, authorized: false, error: 'Board not found.', status: 404 };

  const isOwner = board.ownerId.toString() === userId;
  const isMember = board.members.some((m: any) => m.toString() === userId);

  if (!isOwner && !isMember) {
    return { board, authorized: false, error: 'Forbidden. You are not a member of this board.', status: 403 };
  }

  return { board, authorized: true };
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ boardId: string; fieldId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { boardId, fieldId } = await params;
    const { name, fieldType, options, isDefault, defaultValue } = await req.json();

    await connectToDatabase();

    const access = await checkBoardAccess(boardId, session.user.id);
    if (!access.authorized) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }

    const field = await CustomFieldDefinition.findOne({ _id: fieldId, boardId });
    if (!field) {
      return NextResponse.json({ error: 'Custom field not found.' }, { status: 404 });
    }

    if (name) field.name = name.trim();
    if (fieldType) field.fieldType = fieldType;
    if (options !== undefined) field.options = Array.isArray(options) ? options.map((o: string) => o.trim()).filter(Boolean) : [];
    if (isDefault !== undefined) field.isDefault = Boolean(isDefault);
    if (defaultValue !== undefined) field.defaultValue = String(defaultValue).trim();

    await field.save();
    return NextResponse.json(field);
  } catch (error: any) {
    console.error('Error updating custom field:', error);
    return NextResponse.json({ error: error.message || 'Error updating custom field.' }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ boardId: string; fieldId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { boardId, fieldId } = await params;
    const { isDefault, defaultValue } = await req.json();

    await connectToDatabase();

    const access = await checkBoardAccess(boardId, session.user.id);
    if (!access.authorized) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }

    const field = await CustomFieldDefinition.findOne({ _id: fieldId, boardId });
    if (!field) {
      return NextResponse.json({ error: 'Custom field not found.' }, { status: 404 });
    }

    if (isDefault !== undefined) field.isDefault = Boolean(isDefault);
    if (defaultValue !== undefined) field.defaultValue = String(defaultValue).trim();

    await field.save();
    return NextResponse.json(field);
  } catch (error: any) {
    console.error('Error toggling default custom field:', error);
    return NextResponse.json({ error: error.message || 'Error updating default field.' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ boardId: string; fieldId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { boardId, fieldId } = await params;
    await connectToDatabase();

    const access = await checkBoardAccess(boardId, session.user.id);
    if (!access.authorized) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }

    const field = await CustomFieldDefinition.findOneAndDelete({ _id: fieldId, boardId });
    if (!field) {
      return NextResponse.json({ error: 'Custom field not found.' }, { status: 404 });
    }

    // Pull deleted custom field value from all cards on this board
    await Card.updateMany(
      { boardId },
      { $pull: { customFields: { fieldId } } }
    );

    return NextResponse.json({ message: 'Custom field deleted successfully.' });
  } catch (error: any) {
    console.error('Error deleting custom field:', error);
    return NextResponse.json({ error: error.message || 'Error deleting custom field.' }, { status: 500 });
  }
}

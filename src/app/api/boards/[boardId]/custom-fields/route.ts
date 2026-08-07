import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectToDatabase } from '@/lib/db';
import { Board } from '@/models/Board';
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

export async function GET(req: Request, { params }: { params: Promise<{ boardId: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { boardId } = await params;
    await connectToDatabase();

    const access = await checkBoardAccess(boardId, session.user.id);
    if (!access.authorized) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }

    const customFields = await CustomFieldDefinition.find({ boardId }).sort({ createdAt: 1 });
    return NextResponse.json(customFields);
  } catch (error: any) {
    console.error('Error fetching custom fields:', error);
    return NextResponse.json({ error: 'Error fetching custom fields.' }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ boardId: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { boardId } = await params;
    const { name, fieldType, options, isDefault, defaultValue } = await req.json();

    if (!name?.trim() || !fieldType) {
      return NextResponse.json({ error: 'Field name and type are required.' }, { status: 400 });
    }

    const validTypes = ['text', 'number', 'select', 'date'];
    if (!validTypes.includes(fieldType)) {
      return NextResponse.json({ error: 'Invalid field type.' }, { status: 400 });
    }

    await connectToDatabase();

    const access = await checkBoardAccess(boardId, session.user.id);
    if (!access.authorized) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }

    const newField = await CustomFieldDefinition.create({
      boardId,
      name: name.trim(),
      fieldType,
      options: Array.isArray(options) ? options.map((o: string) => o.trim()).filter(Boolean) : [],
      isDefault: Boolean(isDefault),
      defaultValue: defaultValue ? String(defaultValue).trim() : '',
    });

    return NextResponse.json(newField, { status: 201 });
  } catch (error: any) {
    console.error('Error creating custom field:', error);
    return NextResponse.json({ error: 'Error creating custom field.' }, { status: 500 });
  }
}

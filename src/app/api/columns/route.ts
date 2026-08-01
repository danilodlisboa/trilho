import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectToDatabase } from '@/lib/db';
import { Column } from '@/models/Column';
import { Card } from '@/models/Card';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { boardId, title } = await req.json();

    if (!boardId || !title?.trim()) {
      return NextResponse.json({ error: 'boardId and title are required.' }, { status: 400 });
    }

    await connectToDatabase();

    const colCount = await Column.countDocuments({ boardId });

    const newColumn = await Column.create({
      boardId,
      title: title.trim(),
      order: colCount,
    });

    return NextResponse.json(newColumn, { status: 201 });
  } catch (error: any) {
    console.error('Error creating column:', error);
    return NextResponse.json({ error: error.message || 'Error creating column.' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { columnId, title, order } = await req.json();

    if (!columnId) {
      return NextResponse.json({ error: 'columnId is required.' }, { status: 400 });
    }

    await connectToDatabase();

    const updateData: any = {};
    if (title) updateData.title = title.trim();
    if (order !== undefined) updateData.order = order;

    const column = await Column.findByIdAndUpdate(columnId, updateData, { new: true });

    return NextResponse.json(column);
  } catch (error: any) {
    console.error('Error updating column:', error);
    return NextResponse.json({ error: error.message || 'Error updating column.' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const columnId = searchParams.get('columnId');

    if (!columnId) {
      return NextResponse.json({ error: 'columnId is required.' }, { status: 400 });
    }

    await connectToDatabase();

    await Card.deleteMany({ columnId });
    await Column.findByIdAndDelete(columnId);

    return NextResponse.json({ message: 'Column deleted successfully.' });
  } catch (error: any) {
    console.error('Error deleting column:', error);
    return NextResponse.json({ error: error.message || 'Error deleting column.' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectToDatabase } from '@/lib/db';
import { Column } from '@/models/Column';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { columns } = await req.json();

    if (!Array.isArray(columns) || columns.length === 0) {
      return NextResponse.json({ error: 'columns array is required.' }, { status: 400 });
    }

    await connectToDatabase();

    const bulkOps = columns.map((col: { id: string; order: number }) => ({
      updateOne: {
        filter: { _id: col.id },
        update: { $set: { order: col.order } },
      },
    }));

    await Column.bulkWrite(bulkOps);

    return NextResponse.json({ message: 'Columns reordered successfully.' });
  } catch (error: any) {
    console.error('Error reordering columns:', error);
    return NextResponse.json({ error: error.message || 'Error reordering columns.' }, { status: 500 });
  }
}

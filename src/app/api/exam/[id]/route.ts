import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// جلب جلسة امتحان محددة
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const session = await db.examSession.findUnique({
      where: { id },
      include: {
        answers: {
          orderBy: {
            globalIndex: 'asc'
          }
        }
      }
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json({ session });
  } catch (error) {
    console.error('Error fetching exam session:', error);
    return NextResponse.json({ error: 'Failed to fetch exam session' }, { status: 500 });
  }
}

// حذف جلسة امتحان
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await db.examSession.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting exam session:', error);
    return NextResponse.json({ error: 'Failed to delete exam session' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// جلب جميع جلسات الامتحان
export async function GET() {
  try {
    const sessions = await db.examSession.findMany({
      include: {
        answers: {
          orderBy: {
            globalIndex: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Error fetching exam sessions:', error);
    return NextResponse.json({ error: 'Failed to fetch exam sessions' }, { status: 500 });
  }
}

// إنشاء جلسة امتحان جديدة
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      studentName,
      totalQuestions,
      correctAnswers,
      percentage,
      totalTimeSeconds,
      status,
      answers 
    } = body;

    // إنشاء جلسة الامتحان
    const session = await db.examSession.create({
      data: {
        studentName,
        totalQuestions: totalQuestions || 40,
        correctAnswers: correctAnswers || 0,
        percentage: percentage || 0,
        totalTimeSeconds: totalTimeSeconds || 0,
        status: status || 'completed',
        finishedAt: new Date(),
        answers: {
          create: answers || []
        }
      },
      include: {
        answers: true
      }
    });

    return NextResponse.json({ session });
  } catch (error) {
    console.error('Error creating exam session:', error);
    return NextResponse.json({ error: 'Failed to create exam session' }, { status: 500 });
  }
}

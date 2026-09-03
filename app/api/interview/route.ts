import { NextResponse } from 'next/server';
import { evaluateInterviewTurn } from '@/lib/gemini';
import { InterviewRequest, ApiError, InterviewResponse } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const body: InterviewRequest = await request.json();
    if (!body.question || !body.user_answer) {
      return NextResponse.json({ error: true, message: "Invalid interview request" } as ApiError, { status: 400 });
    }

    try {
      const evaluation: InterviewResponse = await evaluateInterviewTurn(body);
      return NextResponse.json(evaluation);
    } catch (error: any) {
      console.error("Gemini interview error:", error);
      return NextResponse.json({ error: true, message: "Failed to evaluate answer" } as ApiError, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: true, message: "Internal server error" } as ApiError, { status: 500 });
  }
}

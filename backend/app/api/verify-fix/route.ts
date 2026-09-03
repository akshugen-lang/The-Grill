import { NextResponse } from 'next/server';

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}
import { FixVerificationRequest, FixVerificationResponse, ApiError } from '@/lib/types';
import { verifyFix } from '@/lib/gemini';

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body: FixVerificationRequest = await request.json();
    if (!body.issue_id || !body.improvement || !body.updated_code_context) {
      return NextResponse.json({ error: true, message: "Missing required fields (issue_id, improvement, updated_code_context)" } as ApiError, { status: 400 });
    }

    const verification: FixVerificationResponse = await verifyFix(body);
    return NextResponse.json(verification);
  } catch (error: any) {
    console.error("Gemini fix verification error:", error);
    return NextResponse.json({ error: true, message: "Failed to verify fix" } as ApiError, { status: 500 });
  }
}

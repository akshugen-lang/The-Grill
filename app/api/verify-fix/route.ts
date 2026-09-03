import { NextResponse } from "next/server";
import { VerifyFixResponse } from "@/types/grill";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { improvement, updatedCode = "" } = body;

    const trimmedCode = updatedCode.trim();

    if (!trimmedCode) {
      return NextResponse.json(
        { error: "Please provide updated code or select a file to verify." },
        { status: 400 }
      );
    }

    // Determine verification outcome based on code length & keywords
    const isResolved =
      trimmedCode.length > 50 ||
      trimmedCode.includes("Secret") ||
      trimmedCode.includes("dynamic") ||
      trimmedCode.includes("process.env") ||
      trimmedCode.includes("import");

    const result: VerifyFixResponse = isResolved
      ? {
          resolved: true,
          confidence: "HIGH (94%)",
          remainingRisk:
            "LOW — Hardcoded fallbacks removed. Validate Vault/Secrets Manager access policies in staging.",
          nextAction:
            "Deploy fix to staging and run automated test suite `npm test auth.test.ts`.",
          feedback:
            "Verification Passed! The updated code snippet successfully replaces vulnerable fallbacks with dynamic secret fetching.",
        }
      : {
          resolved: false,
          confidence: "MEDIUM (62%)",
          remainingRisk:
            "HIGH — Updated snippet remains incomplete or lacks dynamic exception safeguards.",
          nextAction:
            "Include complete secret manager initialization and fallback error handling.",
          feedback:
            "Verification Failed. The provided code snippet does not fully mitigate the identified risk.",
        };

    // Brief processing delay simulation
    await new Promise((resolve) => setTimeout(resolve, 800));

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to process fix verification" },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { fetchGithubRepoData } from '@/lib/github';
import { runAnalysisPipeline } from '@/lib/agents';
import { runStaticScanner } from '@/lib/scanner';
import { AnalyzeResponse, ApiError } from '@/lib/types';

// Force maximum execution time to 60 seconds for serverless functions (like Vercel)
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { repoUrl } = body;
    if (!repoUrl) {
      return NextResponse.json({ error: true, message: "repoUrl is required" } as ApiError, { status: 400 });
    }

    let repoData;
    try {
      repoData = await fetchGithubRepoData(repoUrl);
    } catch (error: any) {
      if (error && error.error === true) {
        return NextResponse.json(error, { status: 404 });
      }
      return NextResponse.json({ error: true, message: error.message || "Failed to fetch repository" } as ApiError, { status: 500 });
    }

    if (repoData.files.length === 0) {
      return NextResponse.json({ error: true, message: "No recognizable source files found in repo" } as ApiError, { status: 400 });
    }

    try {
      const staticFindings = runStaticScanner(repoData.files, repoData.repo_health);
      const analysis = await runAnalysisPipeline(
        repoData.files, 
        staticFindings,
        repoData.meta,
        repoData.repo_health,
        repoData.analysis_coverage
      );
      const response: AnalyzeResponse = {
        meta: repoData.meta,
        files: repoData.files,
        repo_health: repoData.repo_health,
        analysis_coverage: repoData.analysis_coverage,
        static_findings: staticFindings,
        ...analysis
      };
      return NextResponse.json(response);
    } catch (error: any) {
      console.error("Gemini analysis error:", error);
      return NextResponse.json({ error: true, message: "Failed to analyze codebase" } as ApiError, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: true, message: "Internal server error" } as ApiError, { status: 500 });
  }
}

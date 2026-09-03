import { config } from "dotenv";
config({ path: ".env.local" });

import { fetchGithubRepoData } from "./lib/github";
import { runStaticScanner } from "./lib/scanner";
import { runAnalysisPipeline } from "./lib/agents";

async function main() {
  try {
    console.log("Fetching repo data...");
    const repoData = await fetchGithubRepoData("https://github.com/reactjs/react-redux");
    
    console.log("Running static scanner...");
    const staticFindings = runStaticScanner(repoData.files, repoData.repo_health);
    
    console.log("Running analysis pipeline (this may take a minute)...");
    const analysis = await runAnalysisPipeline(
      repoData.files,
      staticFindings,
      repoData.meta,
      repoData.repo_health,
      repoData.analysis_coverage
    );
    
    console.log("== E2E RESULTS ==");
    console.log(`Verdict: ${analysis.verdict}`);
    console.log(`Overall Score: ${analysis.overall_score}`);
    console.log(`Hard Questions: ${analysis.hard_questions.length}`);
    console.log(`Improvements: ${analysis.improvements.length}`);
    console.log(`Sample Question: ${analysis.hard_questions[0]?.question}`);
    console.log(`Sample Improvement: ${analysis.improvements[0]?.area}`);
  } catch (err) {
    console.error("E2E Test Failed:", err);
  }
}

main();

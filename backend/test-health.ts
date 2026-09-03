import { fetchGithubRepoData } from "./lib/github";
import { config } from "dotenv";

config({ path: ".env.local" });

async function main() {
  try {
    const res = await fetchGithubRepoData("https://github.com/reactjs/react-redux");
    console.log("== REPO HEALTH ==");
    console.log(JSON.stringify(res.repo_health, null, 2));
    
    console.log("\n== ANALYSIS COVERAGE ==");
    console.log(JSON.stringify(res.analysis_coverage, null, 2));
  } catch (err) {
    console.error(err);
  }
}

main();

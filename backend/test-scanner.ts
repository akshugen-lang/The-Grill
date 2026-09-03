import { runStaticScanner } from "./lib/scanner";
import { FileContent, RepoHealth } from "./lib/types";

const mockFiles: FileContent[] = [
  {
    path: "src/config.ts",
    size: 100,
    content: `
export const config = {
  apiKey: "FAKE_API_KEY_FOR_TESTING_1234567", // hardcoded secret
  port: 3000
};
    `
  },
  {
    path: "src/utils.ts",
    size: 100,
    content: `
function run(code: string) {
  eval(code); // dynamic execution
}
    `
  },
  {
    path: "src/db.ts",
    size: 100,
    content: `
function getUser(id: string) {
  return db.query("SELECT * FROM users WHERE id = " + id); // sql injection
}
    `
  }
];

const mockHealth: RepoHealth = {
  has_readme: true,
  has_gitignore: true,
  has_tests: true,
  has_ci: true,
  has_env_template: false,
  has_lockfile: false,
  todo_count: 0,
  source_file_count: 3,
  language_distribution: { ".ts": 3 },
  unusually_large_files: [],
  health_score: 5
};

const findings = runStaticScanner(mockFiles, mockHealth);
console.log(JSON.stringify(findings, null, 2));

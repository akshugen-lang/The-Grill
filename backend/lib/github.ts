import { RepoMeta, FileContent, RepoHealth, AnalysisCoverage } from "./types";
import { computeRepoHealth, computeAnalysisCoverage } from "./health";

const ALLOWED_EXTENSIONS = [
  ".js", ".jsx", ".ts", ".tsx", ".py", ".java", ".go",
  ".rs", ".cpp", ".c", ".rb", ".php", ".cs", ".swift", ".kt"
];

const EXCLUDED_DIRS = [
  "node_modules", "dist", "build", ".next", "vendor", "__pycache__"
];

function parseGithubUrl(url: string) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== "github.com") return null;
    const parts = parsed.pathname.split("/").filter(Boolean);
    if (parts.length < 2) return null;
    let repo = parts[1];
    if (repo.endsWith(".git")) {
      repo = repo.slice(0, -4);
    }
    return { owner: parts[0], repo };
  } catch {
    return null;
  }
}

function isAllowedFile(path: string) {
  if (EXCLUDED_DIRS.some(dir => path.includes(`/${dir}/`) || path.startsWith(`${dir}/`))) {
    return false;
  }
  if (path.endsWith(".lock") || path.endsWith(".min.js")) {
    return false;
  }
  if (path.toLowerCase() === "readme.md") {
    return true;
  }
  return ALLOWED_EXTENSIONS.some(ext => path.endsWith(ext));
}

function isEntryPoint(path: string) {
  const name = path.split('/').pop()?.toLowerCase() || "";
  return name.startsWith("main.") || name.startsWith("index.") || name.startsWith("app.") || name.startsWith("server.");
}

export async function fetchGithubRepoData(repoUrl: string): Promise<{
  meta: RepoMeta;
  files: FileContent[];
  repo_health: RepoHealth;
  analysis_coverage: AnalysisCoverage;
}> {
  const parsed = parseGithubUrl(repoUrl);
  if (!parsed) {
    throw new Error("Invalid GitHub URL");
  }
  const { owner, repo } = parsed;

  const headers: Record<string, string> = {};
  if (process.env.GITHUB_TOKEN && process.env.GITHUB_TOKEN !== "<token>") {
    headers["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  // 1. Fetch metadata
  const metaRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
  if (!metaRes.ok) {
    if (metaRes.status === 404) {
      throw { error: true, message: "Repo not found or private" };
    }
    throw new Error(`GitHub API error: ${metaRes.status}`);
  }
  const metaJson = await metaRes.json();
  const defaultBranch = metaJson.default_branch;

  const meta: RepoMeta = {
    owner: metaJson.owner.login,
    repo: metaJson.name,
    description: metaJson.description,
    primaryLanguage: metaJson.language,
    stars: metaJson.stargazers_count,
    default_branch: metaJson.default_branch,
    html_url: metaJson.html_url,
  };

  // 2. Fetch full file tree
  const treeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`, { headers });
  if (!treeRes.ok) {
    throw new Error(`Failed to fetch repo tree: ${treeRes.status}`);
  }
  const treeJson = await treeRes.json();
  
  if (treeJson.truncated) {
    console.warn("GitHub tree response was truncated.");
  }

  const allFiles = (treeJson.tree || []).filter((item: any) => item.type === "blob");
  const allowedFiles = allFiles.filter((f: any) => isAllowedFile(f.path));

  // 3. Select files based on rules
  const readme = allowedFiles.find((f: any) => f.path.toLowerCase() === "readme.md");
  const entryPoints = allowedFiles.filter((f: any) => isEntryPoint(f.path) && f !== readme);
  
  // Sort entry points by depth (closer to root first), then by size descending
  entryPoints.sort((a: any, b: any) => {
    const aDepth = (a.path.match(/\//g) || []).length;
    const bDepth = (b.path.match(/\//g) || []).length;
    if (aDepth !== bDepth) return aDepth - bDepth;
    return (b.size || 0) - (a.size || 0);
  });

  const others = allowedFiles.filter((f: any) => !isEntryPoint(f.path) && f.path.toLowerCase() !== "readme.md");

  // Sort others by size descending
  others.sort((a: any, b: any) => (b.size || 0) - (a.size || 0));

  const selectedFiles: any[] = [];
  let totalChars = 0;

  const tryAdd = (f: any) => {
    if (selectedFiles.length >= 12 || totalChars >= 50000) return false;
    selectedFiles.push(f);
    totalChars += f.size || 0; // bytes is a good enough proxy for chars
    return true;
  };

  if (readme) tryAdd(readme);
  for (const ep of entryPoints) {
    if (!tryAdd(ep)) break;
  }
  for (const other of others) {
    if (!tryAdd(other)) break;
  }

  // 4. Fetch raw content for selected files
  const fileContents: FileContent[] = await Promise.all(
    selectedFiles.map(async (f) => {
      const rawRes = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/${defaultBranch}/${f.path}`, { headers });
      if (!rawRes.ok) {
        return { path: f.path, content: `// Failed to fetch content: ${rawRes.status}` };
      }
      const text = await rawRes.text();
      return { path: f.path, content: text };
    })
  );

  const repo_health = computeRepoHealth(allFiles, allowedFiles, selectedFiles, fileContents);
  const analysis_coverage = computeAnalysisCoverage(allowedFiles, selectedFiles, entryPoints, others, treeJson.truncated || false);

  return { meta, files: fileContents, repo_health, analysis_coverage };
}

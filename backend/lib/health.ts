import { RepoHealth, AnalysisCoverage, FileContent } from "./types";

export function computeRepoHealth(allFiles: any[], allowedFiles: any[], selectedFiles: any[], fileContents: FileContent[]): RepoHealth {
  const has_readme = allFiles.some((f: any) => f.path.toLowerCase() === 'readme.md');
  const has_gitignore = allFiles.some((f: any) => f.path.toLowerCase() === '.gitignore');
  const has_tests = allFiles.some((f: any) => {
    const p = f.path.toLowerCase();
    return p.includes('test') || p.includes('spec') || p.includes('__tests__');
  });
  const has_ci = allFiles.some((f: any) => f.path.toLowerCase().startsWith('.github/workflows/'));
  const has_env_template = allFiles.some((f: any) => {
    const p = f.path.toLowerCase();
    return p.includes('.env.example') || p.includes('.env.template') || p.includes('.env.local.example');
  });
  const has_lockfile = allFiles.some((f: any) => {
    const p = f.path.toLowerCase();
    return p.endsWith('package-lock.json') || p.endsWith('yarn.lock') || p.endsWith('pnpm-lock.yaml') || p.endsWith('gemfile.lock') || p.endsWith('cargo.lock');
  });

  const language_distribution: Record<string, number> = {};
  for (const f of allowedFiles) {
    const extMatch = f.path.match(/\.[0-9a-z]+$/i);
    if (extMatch) {
      const ext = extMatch[0].toLowerCase();
      language_distribution[ext] = (language_distribution[ext] || 0) + 1;
    }
  }

  let todo_count = 0;
  for (const f of fileContents) {
    const matches = f.content.match(/\b(TODO|FIXME)\b/gi);
    if (matches) {
      todo_count += matches.length;
    }
  }

  const unusually_large_files = selectedFiles
    .filter(f => (f.size || 0) > 20000)
    .map(f => f.path);

  let score = 0;
  if (has_readme) score += 2;
  if (has_gitignore) score += 1;
  if (has_tests) score += 2;
  if (has_ci) score += 2;
  if (has_env_template) score += 1;
  if (has_lockfile) score += 2;
  
  // Deduct points for excessive TODOs (1 point per 5 TODOs, max deduction 2)
  const todoDeduction = Math.min(2, Math.floor(todo_count / 5));
  score -= todoDeduction;

  score = Math.max(0, Math.min(10, score));

  return {
    has_readme,
    has_gitignore,
    has_tests,
    has_ci,
    has_env_template,
    has_lockfile,
    todo_count,
    source_file_count: allowedFiles.length,
    language_distribution,
    unusually_large_files,
    health_score: score
  };
}

export function computeAnalysisCoverage(allowedFiles: any[], selectedFiles: any[], entryPoints: any[], others: any[], treeTruncated: boolean): AnalysisCoverage {
  const selectedPaths = new Set(selectedFiles.map(f => f.path));
  
  const skippedFiles = others.filter(f => !selectedPaths.has(f.path)).map(f => f.path);
  // Cap skipped files to first 20 for payload size reasons
  const cappedSkipped = skippedFiles.slice(0, 20);

  const warnings: string[] = [];
  
  if (skippedFiles.some(p => p.toLowerCase().includes('test'))) {
    warnings.push("Test files were skipped due to size limits.");
  }
  if (skippedFiles.some(p => p.toLowerCase().includes('config'))) {
    warnings.push("Configuration files were skipped due to size limits.");
  }
  
  const missedEntryPoints = entryPoints.filter(ep => !selectedPaths.has(ep.path));
  if (missedEntryPoints.length > 0) {
    warnings.push(`Missed entry points: ${missedEntryPoints.map(ep => ep.path).join(', ')}`);
  }

  const truncated_files = treeTruncated ? ["GitHub repository tree was truncated (repo is too large)."] : [];

  return {
    total_files_analyzed: selectedFiles.length,
    total_candidates: allowedFiles.length,
    skipped_files: cappedSkipped,
    truncated_files,
    warnings
  };
}

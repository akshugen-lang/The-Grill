import { FileContent, RepoHealth, StaticFinding } from "./types";
import crypto from "crypto";

function generateId(): string {
  return crypto.randomBytes(4).toString("hex");
}

export function runStaticScanner(files: FileContent[], repoHealth: RepoHealth): StaticFinding[] {
  const findings: StaticFinding[] = [];

  const addFinding = (file_path: string, type: string, severity: "critical" | "high" | "medium" | "low", message: string, suggested_fix: string, line_number?: number) => {
    findings.push({
      id: generateId(),
      type,
      severity,
      file_path,
      line_number,
      message,
      suggested_fix
    });
  };

  // 1. Repo Health Checks
  if (!repoHealth.has_env_template) {
    addFinding("repo", "missing_env_template", "low", "Repository lacks an environment template (.env.example).", "Add a .env.example file to document required environment variables safely.");
  }
  if (!repoHealth.has_lockfile) {
    addFinding("repo", "missing_lockfile", "medium", "Repository lacks a dependency lockfile.", "Commit the package-lock.json, yarn.lock, or equivalent to ensure deterministic builds.");
  }

  // Regex Patterns
  const patterns = [
    {
      type: "hardcoded_secret",
      severity: "critical" as const,
      regex: /(?:sk_live_[a-zA-Z0-9]+|AIzaSy[a-zA-Z0-9_-]{33}|[a-zA-Z0-9_-]*secret[a-zA-Z0-9_-]*\s*[:=]\s*["'][a-zA-Z0-9]{16,}["'])/i,
      message: "Potential hardcoded secret or API key detected.",
      suggested_fix: "Extract the secret to an environment variable and inject it via process.env."
    },
    {
      type: "private_key",
      severity: "critical" as const,
      regex: /-----BEGIN (?:RSA )?PRIVATE KEY-----/,
      message: "Hardcoded private key detected.",
      suggested_fix: "Remove the private key from source code immediately and revoke it. Use a secrets manager."
    },
    {
      type: "dynamic_execution",
      severity: "high" as const,
      regex: /\beval\s*\(|\bsetTimeout\s*\(\s*["'][^"']+["']\s*,/,
      message: "Use of eval() or string-based setTimeout detected.",
      suggested_fix: "Avoid dynamic code execution. Refactor to use safe alternatives or function callbacks."
    },
    {
      type: "shell_execution",
      severity: "high" as const,
      regex: /\b(?:exec|spawn|execSync|spawnSync)\s*\(|\bos\.system\s*\(/,
      message: "Shell execution API detected.",
      suggested_fix: "Ensure no user input is passed directly to the shell command to prevent command injection."
    },
    {
      type: "cors_wildcard",
      severity: "medium" as const,
      regex: /Access-Control-Allow-Origin['"]?\s*:\s*['"]?\*['"]?/,
      message: "Broad/Wildcard CORS configuration detected.",
      suggested_fix: "Restrict CORS origin to specifically trusted domains rather than using a wildcard '*'."
    },
    {
      type: "sql_interpolation",
      severity: "high" as const,
      regex: /(?:SELECT|INSERT|UPDATE|DELETE).+(?:FROM|INTO|SET|WHERE).+(?:\$\{|%s|\+)/i,
      message: "Potential SQL injection via string concatenation.",
      suggested_fix: "Use parameterized queries or an ORM/Query Builder to safely handle user input."
    }
  ];

  for (const file of files) {
    const lines = file.content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.trim().startsWith('//') || line.trim().startsWith('#')) continue; // Skip basic comments

      for (const pattern of patterns) {
        if (pattern.regex.test(line)) {
          addFinding(file.path, pattern.type, pattern.severity, pattern.message, pattern.suggested_fix, i + 1);
        }
      }
    }
  }

  return findings;
}

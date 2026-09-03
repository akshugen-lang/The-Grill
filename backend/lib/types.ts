export interface FileContent {
  path: string;
  content: string;
  size?: number;
}

export interface RepoMeta {
  owner: string;
  repo: string;
  description: string | null;
  primaryLanguage: string | null;
  stars: number;
  default_branch?: string;
  html_url?: string;
}

export interface CategoryScores {
  architecture: number;   // 0-10, Architecture Agent
  security: number;       // 0-10, Security Agent
  innovation: number;     // 0-10, Innovation Agent
}

export type AgentName = "architecture" | "security" | "innovation";

export interface HardQuestion {
  id: string;
  agent: AgentName;
  question: string;
  difficulty: "medium" | "hard" | "extreme";
  file_evidence: {
    path: string;
    symbol?: string;
    line_range?: string;
    excerpt?: string;
  };
  why_this_matters: string;
  strong_answer_points: string[];
}

export interface RepoHealth {
  has_readme: boolean;
  has_gitignore: boolean;
  has_tests: boolean;
  has_ci: boolean;
  has_env_template: boolean;
  has_lockfile: boolean;
  todo_count: number;
  source_file_count: number;
  language_distribution: Record<string, number>;
  unusually_large_files: string[];
  health_score: number; // 0-10
}

export interface AnalysisCoverage {
  total_files_analyzed: number;
  total_candidates: number;
  skipped_files: string[];
  truncated_files: string[];
  warnings: string[];
}

export interface Improvement {
  id: string;
  agent: AgentName;
  area: string;
  severity: "critical" | "high" | "medium" | "low";
  confidence: "confirmed" | "likely" | "possible" | "insufficient evidence";
  code_evidence: string;
  impact: string;
  suggestion: string;
  fix_code?: string;
  verification_steps?: string[];
}

export interface AnalyzeRequest {
  repoUrl: string;
}

export interface AnalyzeResponse {
  meta: RepoMeta;
  files: FileContent[];
  overall_score: number;
  verdict: string;
  category_scores: CategoryScores;
  hard_questions: HardQuestion[];
  improvements: Improvement[];
  repo_health: RepoHealth;
  analysis_coverage: AnalysisCoverage;
}

export interface Message {
  role: "user" | "judge";
  content: string;
}

export interface InterviewRequest {
  agent: AgentName;
  file_reference: string;
  why_this_matters: string;
  code_context: FileContent[];
  history: Message[];
}

export interface InterviewResponse {
  is_complete: boolean;
  feedback: string;
  verdict?: "strong" | "partial" | "weak";
  score?: number;
  missing_points?: string[];
  follow_up_question?: string;
}

export interface FixVerificationRequest {
  issue_id: string;
  improvement: Improvement;
  updated_code_context: string;
}

export interface FixVerificationResponse {
  resolved: boolean;
  verified?: boolean;
  confidence: number | string;
  remaining_risk?: string;
  next_action: string;
  feedback?: string;
}

export interface ApiError {
  error: true;
  message: string;
}

export interface StaticFinding {
  id: string;
  type: string;
  severity: "critical" | "high" | "medium" | "low";
  file_path: string;
  line_number?: number;
  message: string;
  suggested_fix: string;
}

export interface FileContent {
  path: string;
  content: string;
}

export interface RepoMeta {
  owner: string;
  repo: string;
  description: string | null;
  primaryLanguage: string | null;
  stars: number;
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
  file_reference: string;
  why_this_matters: string;
}

export interface Improvement {
  id: string;
  agent: AgentName;
  area: string;
  file_reference: string;
  suggestion: string;
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
}

export interface InterviewRequest {
  question: string;
  agent: AgentName;
  file_reference: string;
  why_this_matters: string;
  code_context: FileContent[];
  user_answer: string;
}

export interface InterviewResponse {
  verdict: "strong" | "partial" | "weak";
  feedback: string;
  follow_up_question?: string;
}

export interface ApiError {
  error: true;
  message: string;
}

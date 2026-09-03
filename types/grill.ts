export type AgentId = "architecture" | "security" | "innovation";

export type VerdictType = "strong" | "partial" | "weak";

export type Screen = "landing" | "scanning" | "verdict" | "interview" | "score";

export type ScanFlagType = "success" | "warning" | "danger";

export type SeverityLevel = "HIGH" | "MEDIUM" | "LOW";

export interface ScanFlag {
  type: ScanFlagType;
  title: string;
  detail: string;
  file_reference?: string;
}

export interface RepoHealth {
  score: number; // 0 - 10
  hasReadme: boolean;
  hasTests: boolean;
  hasCi: boolean;
  hasEnvExample: boolean;
  hasLockfile: boolean;
  todoCount: number;
  sourceFileCount: number;
  languages: string[];
  largeFilesWarning?: string;
}

export interface AnalysisCoverage {
  analyzedFilesCount: number;
  totalCandidateFilesCount: number;
  skippedFilesCount: number;
  skippedFilesList?: string[];
  truncatedFilesCount: number;
  coverageWarning?: string;
}

export interface ScanVerdict {
  overallVerdict: string;
  riskLevel: string;
  repoMeta: {
    commits: string;
    contributors: string;
    language: string;
    activeSpan: string;
  };
  firstPassFlags: ScanFlag[];
  health?: RepoHealth;
  coverage?: AnalysisCoverage;
}

export interface AgentProfile {
  id: AgentId;
  name: string;
  icon: string;
  title: string;
  accentColor: string;
  dimColor: string;
}

export interface Evidence {
  filePath: string;
  symbol?: string;
  lineRange?: string;
  excerpt?: string;
}

export interface Question {
  id: string;
  agent: AgentId;
  title: string;
  question: string;
  file_reference: string;
  evidence?: Evidence[];
  followUpQuestion?: string;
  expected_points?: string[];
}

export interface AnswerRecord {
  questionId: string;
  mainAnswer: string;
  mainVerdict: VerdictType;
  mainFeedback: string;
  followUpAnswer?: string;
  followUpVerdict?: VerdictType;
  followUpFeedback?: string;
}

export interface FileContent {
  path: string;
  content: string;
}

export interface VerifyFixResponse {
  resolved: boolean;
  confidence: string;
  remainingRisk: string;
  nextAction: string;
  feedback: string;
}

export interface Improvement {
  id?: string;
  area: string;
  suggestion: string;
  agent: AgentId;
  file_reference: string;
  severity?: SeverityLevel;
  confidence?: SeverityLevel | string;
  impact?: string;
  exactFix?: string;
  verificationSteps?: string[];
  evidence?: Evidence[];
}

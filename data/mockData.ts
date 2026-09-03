import {
  AgentProfile,
  Question,
  Improvement,
  AgentId,
  VerdictType,
  ScanVerdict,
  RepoHealth,
  AnalysisCoverage,
  AnswerRecord,
} from "@/types/grill";

export const AGENTS_DATA: Record<AgentId, AgentProfile> = {
  architecture: {
    id: "architecture",
    name: "Architecture Agent",
    icon: "🏗️",
    title: "Systems & Modularity Specialist",
    accentColor: "#7C9B7E",
    dimColor: "#4A5C4C",
  },
  security: {
    id: "security",
    name: "Security Agent",
    icon: "🛡️",
    title: "Auth & Threat Surface Specialist",
    accentColor: "#C68A46",
    dimColor: "#8A6234",
  },
  innovation: {
    id: "innovation",
    name: "Innovation Agent",
    icon: "💡",
    title: "DX & Modern Tooling Specialist",
    accentColor: "#5C8EA6",
    dimColor: "#3B5F70",
  },
};

export const MOCK_REPO_HEALTH: RepoHealth = {
  score: 8.4,
  hasReadme: true,
  hasTests: true,
  hasCi: true,
  hasEnvExample: true,
  hasLockfile: true,
  todoCount: 3,
  sourceFileCount: 86,
  languages: ["TypeScript", "CSS", "JSON", "Shell"],
  largeFilesWarning:
    "Notice: 2 files exceed 100KB (dist/bundle.js, vendor/parser.wasm) and were excluded from depth parsing.",
};

export const MOCK_ANALYSIS_COVERAGE: AnalysisCoverage = {
  analyzedFilesCount: 82,
  totalCandidateFilesCount: 86,
  skippedFilesCount: 4,
  skippedFilesList: [
    "dist/bundle.js",
    "vendor/parser.wasm",
    "node_modules/.cache/ast.json",
    "public/large-asset.png",
  ],
  truncatedFilesCount: 2,
  coverageWarning:
    "4 binary/generated files were excluded from AST parsing to optimize scan performance.",
};

export const MOCK_SCAN_VERDICT: ScanVerdict = {
  overallVerdict: "VERIFIED",
  riskLevel: "LOW RISK",
  repoMeta: {
    commits: "482",
    contributors: "14",
    language: "TypeScript",
    activeSpan: "2024–Present",
  },
  firstPassFlags: [
    {
      type: "success",
      title: "Strong Module Boundaries",
      detail: "Clean Separation of Concerns across router and core domain controllers.",
      file_reference: "src/core/router.ts",
    },
    {
      type: "warning",
      title: "Token Expiry Risk",
      detail: "JWT signing configuration lacks explicit key rotation policies.",
      file_reference: "src/auth/jwt.ts",
    },
    {
      type: "danger",
      title: "Fallback Credential Threat",
      detail: "Hardcoded secret string detected in development environment fallback.",
      file_reference: "src/auth/jwt.ts",
    },
  ],
  health: MOCK_REPO_HEALTH,
  coverage: MOCK_ANALYSIS_COVERAGE,
};

export const MOCK_PROS: string[] = [
  "Clean modular separation of concerns between business domain logic and HTTP router primitives.",
  "Comprehensive TypeScript coverage with strict type safety across internal API contracts.",
  "Automated linting and build validation pipelines preventing syntax degradation.",
];

export const MOCK_CONS: string[] = [
  "Hardcoded fallback secret strings detected in development authentication middleware.",
  "Synchronous imports of heavy parsing dependencies causing bloated initial chunk sizes.",
  "Lack of explicit automated key rotation strategy for long-lived refresh tokens.",
];

export const DYNAMIC_QUESTIONS_POOL: Question[] = [
  {
    id: "q1",
    agent: "architecture",
    title: "State Management & Module Decoupling",
    question:
      "I noticed your route handlers directly instantiate database connections and cross-domain state. How do you isolate business logic from server framework primitives to maintain high testability?",
    file_reference: "src/core/router.ts",
    evidence: [
      {
        filePath: "src/core/router.ts",
        symbol: "handleRoute()",
        lineRange: "L34-L52",
        excerpt:
          "export async function handleRoute(req: Request) {\n  const db = new DatabaseClient(process.env.DB_URI);\n  const state = GlobalState.getInstance();\n  // Direct connection without abstraction layer\n  return await db.query(req.url);\n}",
      },
      {
        filePath: "src/core/state.ts",
        symbol: "GlobalState",
        lineRange: "L12-L28",
        excerpt:
          "export class GlobalState {\n  private static instance: GlobalState;\n  public cache: Map<string, any> = new Map();\n  public static getInstance() { return this.instance || (this.instance = new GlobalState()); }\n}",
      },
    ],
    expected_points: [
      "Explicit Separation of Concerns (SoC) between HTTP router handlers and business domain services.",
      "Dependency Injection or Repository Pattern abstractions to eliminate direct database client instantiations.",
      "Isolated mock repository interfaces enabling unit testing without live database connections.",
      "Transaction boundary management across domain state mutations.",
    ],
  },
  {
    id: "q2",
    agent: "security",
    title: "Token Expiry & Key Rotation",
    question:
      "Your authentication middleware parses JWT tokens with hardcoded secret fallbacks and lacks explicit key rotation handlers. How are you preventing credential replay attacks if a signing key is compromised?",
    file_reference: "src/auth/jwt.ts",
    evidence: [
      {
        filePath: "src/auth/jwt.ts",
        symbol: "verifyAuthToken()",
        lineRange: "L18-L35",
        excerpt:
          "const JWT_SECRET = process.env.JWT_SECRET || 'dev_insecure_fallback_key_123';\n\nexport function verifyAuthToken(token: string) {\n  try {\n    return jwt.verify(token, JWT_SECRET);\n  } catch (err) {\n    return null;\n  }\n}",
      },
      {
        filePath: "src/auth/middleware.ts",
        symbol: "authHeaderHandler()",
        lineRange: "L45-L60",
        excerpt:
          "const authHeader = req.headers['authorization'];\nif (authHeader && authHeader.startsWith('Bearer ')) {\n  const decoded = verifyAuthToken(authHeader.substring(7));\n  req.user = decoded;\n}",
      },
    ],
    followUpQuestion:
      "Follow-up: If an attacker steals a valid refresh token before key revocation propagates, what mitigation strategy prevents them from minting new short-lived access tokens?",
    expected_points: [
      "Removal of hardcoded fallback secret strings (`dev_insecure_fallback_key_123`).",
      "Dynamic secret retrieval from environment or KMS/Vault key management providers.",
      "Short access token TTLs combined with automated 15-minute key rotation caches.",
      "Asynchronous token revocation lists and refresh token family rotation.",
    ],
  },
  {
    id: "q3",
    agent: "innovation",
    title: "Bundle Splitting & Build Performance",
    question:
      "Looking at your package dependencies and static imports, heavy libraries are pulled into the initial execution chunk. What optimizations have you evaluated for lazy-loading or dynamic imports?",
    file_reference: "package.json",
    evidence: [
      {
        filePath: "package.json",
        symbol: "dependencies",
        lineRange: "L15-L29",
        excerpt:
          "\"dependencies\": {\n  \"lodash\": \"^4.17.21\",\n  \"moment\": \"^2.29.4\",\n  \"chart.js\": \"^4.4.1\",\n  \"pdfkit\": \"^0.14.0\"\n}",
      },
    ],
    expected_points: [
      "Code-splitting heavy libraries (`chart.js`, `pdfkit`) using React `next/dynamic` or dynamic `import()` statements.",
      "Tree-shaking utility packages (e.g. `lodash-es` instead of full `lodash`).",
      "Optimizing initial JavaScript bundle size to improve First Contentful Paint (FCP).",
    ],
  },
  {
    id: "q4",
    agent: "architecture",
    title: "Asynchronous Task Queuing & Error Resilience",
    question:
      "If an unhandled exception occurs in your background workers, how do you ensure state idempotency and prevent message loss without deadlocking worker threads?",
    file_reference: "src/workers/taskQueue.ts",
    evidence: [
      {
        filePath: "src/workers/taskQueue.ts",
        symbol: "processTask()",
        lineRange: "L10-L24",
        excerpt:
          "export async function processTask(job: Job) {\n  // Missing retry backoff & dead-letter queue routing\n  await job.execute();\n}",
      },
    ],
    expected_points: [
      "Dead-letter queue (DLQ) routing for non-retryable message failures.",
      "Exponential backoff with randomized jitter to prevent thundering herd problems.",
      "Idempotent task execution handlers using transaction tokens.",
    ],
  },
  {
    id: "q5",
    agent: "security",
    title: "Input Sanitization & Injection Defense",
    question:
      "How are user inputs sanitized before reaching raw database queries or system subprocess executions in your secondary controller endpoints?",
    file_reference: "src/api/search.ts",
    evidence: [
      {
        filePath: "src/api/search.ts",
        symbol: "searchQuery()",
        lineRange: "L15-L30",
        excerpt:
          "export function searchQuery(q: string) {\n  return db.raw(`SELECT * FROM items WHERE name LIKE '%${q}%'`);\n}",
      },
    ],
    expected_points: [
      "Parameterized SQL queries eliminating string interpolation vulnerabilities.",
      "Schema-based validation with Zod or TypeBox prior to execution.",
      "Least privilege database user permissions.",
    ],
  },
];

export const QUESTIONS = DYNAMIC_QUESTIONS_POOL;

export const MOCK_IMPROVEMENTS: Improvement[] = [
  {
    id: "imp-1",
    area: "JWT Secret Storage & Dynamic Key Rotation",
    suggestion:
      "Extract JWT secret keys out of fallback strings into AWS Secrets Manager or HashiCorp Vault, and implement an asynchronous key rotation cache with 15-minute TTL.",
    agent: "security",
    file_reference: "src/auth/jwt.ts",
    severity: "HIGH",
    confidence: "HIGH",
    impact:
      "Critical security vulnerability: Hardcoded secret fallback allows attackers to forge administrative authentication tokens if source code is exposed.",
    exactFix:
      "// Replace hardcoded fallback secret in src/auth/jwt.ts\n- const JWT_SECRET = process.env.JWT_SECRET || 'dev_insecure_fallback_key_123';\n+ const secretProvider = new SecretManagerProvider();\n+ const JWT_SECRET = await secretProvider.getSecret('prod/jwt-signing-key');",
    verificationSteps: [
      "Run `npm test auth.test.ts` to verify JWT signing succeeds with mock Vault credentials.",
      "Audit environment variables to confirm `dev_insecure_fallback_key_123` is completely removed.",
      "Simulate key rotation event and verify active session invalidation within 15 minutes.",
    ],
    evidence: [
      {
        filePath: "src/auth/jwt.ts",
        symbol: "verifyAuthToken()",
        lineRange: "L18-L35",
        excerpt:
          "const JWT_SECRET = process.env.JWT_SECRET || 'dev_insecure_fallback_key_123';",
      },
    ],
  },
  {
    id: "imp-2",
    area: "Repository & Service Layer Decoupling",
    suggestion:
      "Introduce Dependency Injection or an explicit Interface abstraction between business logic controllers and the database persistence layer.",
    agent: "architecture",
    file_reference: "src/core/router.ts",
    severity: "MEDIUM",
    confidence: "HIGH",
    impact:
      "Tight coupling prevents unit testing and makes switching database backends or mocking queries difficult.",
    exactFix:
      "// Introduce IUserRepository interface in src/core/router.ts\n- const db = new DatabaseClient(process.env.DB_URI);\n+ const userRepo = Container.get<IUserRepository>(TYPES.UserRepository);\n",
    verificationSteps: [
      "Create mock repository implementation in `tests/mocks/MockUserRepo.ts`.",
      "Refactor router handler to accept injected interface instead of instantiating `DatabaseClient`.",
      "Execute unit test suite in offline mode.",
    ],
    evidence: [
      {
        filePath: "src/core/router.ts",
        symbol: "handleRoute()",
        lineRange: "L34-L52",
        excerpt: "const db = new DatabaseClient(process.env.DB_URI);",
      },
    ],
  },
  {
    id: "imp-3",
    area: "Bundle Optimization & Code-Splitting",
    suggestion:
      "Replace synchronous imports of heavy plotting and parsing modules with dynamic React `next/dynamic` or `import()` statements to optimize initial load time.",
    agent: "innovation",
    file_reference: "package.json",
    severity: "LOW",
    confidence: "MEDIUM",
    impact:
      "Initial JS bundle size is ~340KB larger than necessary, delaying First Contentful Paint on low-bandwidth mobile devices.",
    exactFix:
      "// Replace static import in app/dashboard/page.tsx\n- import Chart from 'chart.js';\n+ const Chart = dynamic(() => import('chart.js'), { ssr: false });",
    verificationSteps: [
      "Run `npx next build` and check bundle analyzer output for main bundle chunk size.",
      "Verify `chart.js` and `pdfkit` are split into separate lazy-loaded chunks.",
    ],
    evidence: [
      {
        filePath: "package.json",
        symbol: "dependencies",
        lineRange: "L15-L29",
        excerpt: "\"chart.js\": \"^4.4.1\",\n\"pdfkit\": \"^0.14.0\"",
      },
    ],
  },
];

export const SCAN_MESSAGES = [
  "Scanning repository structure...",
  "Parsing AST & entrypoint modules...",
  "Evaluating dependency graph...",
  "Extracting architecture patterns...",
  "Detecting security vulnerabilities & key exposure...",
  "Identifying innovation opportunities...",
  "Assembling specialist agent panel...",
];

export const REVIEW_MESSAGES = [
  "Agent digesting your response...",
  "Cross-referencing codebase AST...",
  "Evaluating answer depth & technical rigor...",
  "Synthesizing specialist verdict...",
];

export function getMockVerdict(answerLength: number): {
  verdict: VerdictType;
  feedback: string;
} {
  if (answerLength > 120) {
    return {
      verdict: "strong",
      feedback:
        "Excellent depth. You demonstrated clear architectural awareness, explicit mitigation steps, and edge-case resilience.",
    };
  } else if (answerLength > 45) {
    return {
      verdict: "partial",
      feedback:
        "Solid attempt, but missing critical details regarding operational key rotation and automated failover safety.",
    };
  } else {
    return {
      verdict: "weak",
      feedback:
        "Insufficient response. The proposed approach leaves unhandled failure modes and lacks concrete code abstractions.",
    };
  }
}

/**
 * AI Decision Engine for Non-Finite Interview Loop
 * Evaluates accumulated answer depth and decides whether to continue or conclude the interview.
 */
export function evaluateInterviewDecision(
  records: AnswerRecord[],
  currentQuestionIndex: number
): {
  shouldStop: boolean;
  reason: string;
  depthCoveragePercent: number;
} {
  const answeredCount = records.length;
  
  // Calculate total length of all answers given
  const totalChars = records.reduce(
    (acc, r) => acc + (r.mainAnswer?.length || 0) + (r.followUpAnswer?.length || 0),
    0
  );

  const averageDepth = answeredCount > 0 ? totalChars / answeredCount : 0;
  
  // Dynamic coverage gauge calculation (capped at 100%)
  const depthCoveragePercent = Math.min(
    100,
    Math.round((answeredCount / 3) * 60 + (averageDepth / 120) * 40)
  );

  // AI Stopping criteria:
  // 1. If 3 or more questions answered AND user provided high-depth responses (average length > 100 chars)
  // 2. If 5 questions answered (max pool reached)
  if (answeredCount >= 5) {
    return {
      shouldStop: true,
      reason: "Maximum specialist audit topics covered across Architecture, Security, and Innovation.",
      depthCoveragePercent: 100,
    };
  }

  if (answeredCount >= 3 && averageDepth >= 90) {
    return {
      shouldStop: true,
      reason: "AI Agent Panel has gathered sufficient architectural depth and security evidence.",
      depthCoveragePercent: Math.max(88, depthCoveragePercent),
    };
  }

  if (answeredCount >= 2 && averageDepth > 140) {
    return {
      shouldStop: true,
      reason: "Comprehensive defense provided. The AI panel is satisfied with system safeguards.",
      depthCoveragePercent: 95,
    };
  }

  // Otherwise, AI requests another question from the pool
  return {
    shouldStop: false,
    reason: `AI Panel requesting further defense on domain topic #${currentQuestionIndex + 2}...`,
    depthCoveragePercent,
  };
}

import { FileContent, StaticFinding, RepoMeta, RepoHealth, AnalysisCoverage } from "../types";
import { runArchitectureAgent } from "./architecture-agent";
import { runSecurityAgent } from "./security-agent";
import { runInnovationAgent } from "./innovation-agent";
import { runLeadJudge } from "./lead-judge";

export async function runAllAgents(files: FileContent[], staticFindings: StaticFinding[]) {
  const [architecture, security, innovation] = await Promise.all([
    runArchitectureAgent(files),
    runSecurityAgent(files, staticFindings),
    runInnovationAgent(files)
  ]);
  
  return { architecture, security, innovation };
}

export async function runAnalysisPipeline(
  files: FileContent[], 
  staticFindings: StaticFinding[],
  repoMeta: RepoMeta,
  repoHealth: RepoHealth,
  analysisCoverage: AnalysisCoverage
) {
  const specialists = await runAllAgents(files, staticFindings);
  const lead = await runLeadJudge(specialists, repoMeta, repoHealth, analysisCoverage, staticFindings);

  const allQuestions = [
    ...specialists.architecture.hard_questions,
    ...specialists.security.hard_questions,
    ...specialists.innovation.hard_questions
  ];
  
  const allImprovements = [
    ...specialists.architecture.improvements,
    ...specialists.security.improvements,
    ...specialists.innovation.improvements
  ];

  // Validation: deduplicate and strictly verify existence
  const uniqueQuestionIds = Array.from(new Set(lead.selected_question_ids || []));
  const uniqueImprovementIds = Array.from(new Set(lead.selected_improvement_ids || []));

  // Limit to 9 questions and 8 improvements, prioritizing the ones the AI selected first
  const validQuestionIds = uniqueQuestionIds.filter(id => allQuestions.some(q => q.id === id)).slice(0, 9);
  const validImprovementIds = uniqueImprovementIds.filter(id => allImprovements.some(i => i.id === id)).slice(0, 8);

  const selectedQuestions = allQuestions.filter(q => validQuestionIds.includes(q.id));
  const selectedImprovements = allImprovements.filter(i => validImprovementIds.includes(i.id));

  return {
    overall_score: lead.overall_score,
    verdict: lead.verdict,
    category_scores: {
      architecture: specialists.architecture.score,
      security: specialists.security.score,
      innovation: specialists.innovation.score
    },
    hard_questions: selectedQuestions,
    improvements: selectedImprovements
  };
}

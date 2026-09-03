import { FileContent } from "../types";
import { runArchitectureAgent } from "./architecture-agent";
import { runSecurityAgent } from "./security-agent";
import { runInnovationAgent } from "./innovation-agent";
import { runLeadJudge } from "./lead-judge";

export async function runAllAgents(files: FileContent[]) {
  const [architecture, security, innovation] = await Promise.all([
    runArchitectureAgent(files),
    runSecurityAgent(files),
    runInnovationAgent(files)
  ]);
  
  return { architecture, security, innovation };
}

export async function runAnalysisPipeline(files: FileContent[]) {
  const specialists = await runAllAgents(files);
  const lead = await runLeadJudge(specialists);

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

  const selectedQuestions = allQuestions.filter(q => (lead.selected_question_ids || []).includes(q.id));
  const selectedImprovements = allImprovements.filter(i => (lead.selected_improvement_ids || []).includes(i.id));

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

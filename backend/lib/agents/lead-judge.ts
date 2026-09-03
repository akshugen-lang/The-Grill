import { getGenAI } from "./base";
import { AgentProcessedResponse } from "./base";
import { Schema, SchemaType } from "@google/generative-ai";
import { RepoMeta, RepoHealth, AnalysisCoverage, StaticFinding } from "../types";

const LeadJudgeSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    overall_score: { type: SchemaType.NUMBER },
    verdict: { type: SchemaType.STRING },
    selected_question_ids: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING }
    },
    selected_improvement_ids: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING }
    }
  },
  required: ["overall_score", "verdict", "selected_question_ids", "selected_improvement_ids"]
};

export async function runLeadJudge(
  specialistResults: {
    architecture: AgentProcessedResponse;
    security: AgentProcessedResponse;
    innovation: AgentProcessedResponse;
  },
  repoMeta: RepoMeta,
  repoHealth: RepoHealth,
  analysisCoverage: AnalysisCoverage,
  staticFindings: StaticFinding[]
) {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "<key>") {
    throw new Error("API_KEY_INVALID");
  }

  const model = getGenAI().getGenerativeModel({
    model: "gemini-3.1-flash-lite",
    systemInstruction: "You are the Lead Judge of a panel evaluating a codebase. You will receive the reports from three specialist judges (Architecture, Security, and Innovation), alongside repository metadata, health metrics, and static scan findings. Your job is to select the absolute best, sharpest questions and improvements from their candidate pools to form the final report.\n\nRules:\n- Pick exactly 8-9 questions and 6-8 improvements by returning their exact string IDs. If there are fewer valid candidates, return fewer IDs. Do not invent IDs.\n- Provide an overall verdict and an overall score out of 10.\n- Do not rewrite the questions or improvements; just output their IDs.\n- Output valid JSON matching the schema.",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: LeadJudgeSchema,
    }
  });

  const promptObj = {
    repoMeta,
    repoHealth,
    analysisCoverage,
    staticFindings,
    specialistResults
  };

  const prompt = JSON.stringify(promptObj, null, 2);
  const result = await model.generateContent(prompt);
  const raw = JSON.parse(result.response.text());
  
  return raw as {
    overall_score: number;
    verdict: string;
    selected_question_ids: string[];
    selected_improvement_ids: string[];
  };
}

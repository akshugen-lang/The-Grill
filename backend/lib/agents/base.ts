import { GoogleGenerativeAI, Schema, SchemaType } from "@google/generative-ai";
import { HardQuestion, Improvement, AgentName } from "../types";
import crypto from "crypto";

export function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY || "";
  return new GoogleGenerativeAI(apiKey);
}

export const AgentResponseSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    score: { type: SchemaType.NUMBER, description: "Score out of 10" },
    hard_questions: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          id: { type: SchemaType.STRING },
          question: { type: SchemaType.STRING },
          difficulty: { type: SchemaType.STRING, description: "medium, hard, or extreme" },
          file_evidence: {
            type: SchemaType.OBJECT,
            properties: {
              path: { type: SchemaType.STRING },
              symbol: { type: SchemaType.STRING },
              line_range: { type: SchemaType.STRING },
              excerpt: { type: SchemaType.STRING }
            },
            required: ["path"]
          },
          why_this_matters: { type: SchemaType.STRING },
          strong_answer_points: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
        },
        required: ["id", "question", "difficulty", "file_evidence", "why_this_matters", "strong_answer_points"]
      }
    },
    improvements: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          id: { type: SchemaType.STRING },
          area: { type: SchemaType.STRING },
          severity: { type: SchemaType.STRING, description: "critical, high, medium, or low" },
          confidence: { type: SchemaType.STRING, description: "confirmed, likely, possible, or insufficient evidence" },
          code_evidence: { type: SchemaType.STRING },
          impact: { type: SchemaType.STRING },
          suggestion: { type: SchemaType.STRING },
          fix_code: { type: SchemaType.STRING },
          verification_steps: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
        },
        required: ["id", "area", "severity", "confidence", "code_evidence", "impact", "suggestion"]
      }
    }
  },
  required: ["score", "hard_questions", "improvements"]
};

export interface AgentRawResponse {
  score: number;
  hard_questions: Omit<HardQuestion, "id" | "agent">[];
  improvements: Omit<Improvement, "id" | "agent">[];
}

export interface AgentProcessedResponse {
  score: number;
  hard_questions: HardQuestion[];
  improvements: Improvement[];
}

export function processAgentResponse(raw: AgentRawResponse, agentName: AgentName): AgentProcessedResponse {
  return {
    score: raw.score,
    hard_questions: (raw.hard_questions || []).map(q => ({
      ...q,
      id: crypto.randomUUID(),
      agent: agentName
    })),
    improvements: (raw.improvements || []).map(i => ({
      ...i,
      id: crypto.randomUUID(),
      agent: agentName
    }))
  };
}

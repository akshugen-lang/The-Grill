import { GoogleGenerativeAI, Schema, SchemaType } from "@google/generative-ai";
import { HardQuestion, Improvement, AgentName } from "../types";
import crypto from "crypto";

const apiKey = process.env.GEMINI_API_KEY || "";
export const genAI = new GoogleGenerativeAI(apiKey);

export const AgentResponseSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    score: { type: SchemaType.NUMBER },
    hard_questions: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          question: { type: SchemaType.STRING },
          file_reference: { type: SchemaType.STRING },
          why_this_matters: { type: SchemaType.STRING },
        },
        required: ["question", "file_reference", "why_this_matters"]
      }
    },
    improvements: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          area: { type: SchemaType.STRING },
          file_reference: { type: SchemaType.STRING },
          suggestion: { type: SchemaType.STRING },
        },
        required: ["area", "file_reference", "suggestion"]
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

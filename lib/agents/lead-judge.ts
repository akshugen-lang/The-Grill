import { genAI } from "./base";
import { AgentProcessedResponse } from "./base";
import { Schema, SchemaType } from "@google/generative-ai";

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

export async function runLeadJudge(specialistResults: {
  architecture: AgentProcessedResponse;
  security: AgentProcessedResponse;
  innovation: AgentProcessedResponse;
}) {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "<key>") {
    throw new Error("API_KEY_INVALID");
  }

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-pro",
    systemInstruction: "You are the Lead Judge of a panel evaluating a codebase. You will receive the reports from three specialist judges (Architecture, Security, and Innovation). Your job is to select the absolute best, sharpest questions and improvements from their candidate pools to form the final report.\n\nRules:\n- Pick exactly 8-9 questions and 6-8 improvements by returning their exact string IDs.\n- Provide an overall verdict and an overall score out of 10.\n- Do not rewrite the questions or improvements; just output their IDs.\n- Output valid JSON matching the schema.",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: LeadJudgeSchema,
    }
  });

  const prompt = JSON.stringify(specialistResults, null, 2);
  const result = await model.generateContent(prompt);
  const raw = JSON.parse(result.response.text());
  
  return raw as {
    overall_score: number;
    verdict: string;
    selected_question_ids: string[];
    selected_improvement_ids: string[];
  };
}

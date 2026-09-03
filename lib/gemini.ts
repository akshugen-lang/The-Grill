import { GoogleGenerativeAI, Schema, SchemaType } from "@google/generative-ai";
import { RepoMeta, FileContent, InterviewRequest, AnalyzeResponse, InterviewResponse } from "./types";
import crypto from "crypto";

const apiKey = process.env.GEMINI_API_KEY || "";
export const genAI = new GoogleGenerativeAI(apiKey);

// Removed unused AnalyzeResponseSchema and analyzeCodebase from Phase 3

const InterviewResponseSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    verdict: { type: SchemaType.STRING, description: "Must be strong, partial, or weak", format: "enum", enum: ["strong", "partial", "weak"] } as any,
    feedback: { type: SchemaType.STRING },
    follow_up_question: { type: SchemaType.STRING },
  },
  required: ["verdict", "feedback"]
};

const agentPersonas = {
  architecture: "You are the Architecture Agent. Your focus is strictly on design, structure, coupling, and scalability. Identify tight coupling, poor separation of concerns, scalability bottlenecks, or overly complex designs.",
  security: "You are the Security Agent. Your focus is strictly on identifying injection risks, secrets handling, input validation, and error handling gaps. Find vulnerabilities and dangerous patterns.",
  innovation: "You are the Innovation Agent. Your focus is on problem relevance, creativity, uniqueness of approach, and whether they used the right tools for the job. Call out over-engineered solutions or reinvented wheels."
};

export async function evaluateInterviewTurn(req: InterviewRequest): Promise<InterviewResponse> {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "<key>") throw new Error("API_KEY_INVALID");
  const persona = agentPersonas[req.agent] || "";
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-pro",
    systemInstruction: `${persona}\n\nYou already asked this candidate a specific technical question about their own code. Now evaluate their answer.\n\nRules:\n- Judge only whether they actually addressed the specific technical concern in the question — not whether they sound confident.\n- If the answer is vague, deflects, or doesn't touch the actual tradeoff, mark it "weak" and write ONE sharp follow-up question that narrows in further on the same file/concern.\n- If the answer is correct but incomplete, mark it "partial" and give one line on what's missing. Only include a follow_up_question if there's a genuinely sharper angle left to press.\n- If the answer is genuinely correct and specific, mark it "strong" and say why briefly — do not manufacture a follow-up just to have one.\n- Output ONLY valid JSON matching the schema. No prose outside the JSON.`,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: InterviewResponseSchema,
    }
  });

  const prompt = `Code Context:\n${req.code_context.map(f => `--- FILE: ${f.path} ---\n${f.content}\n`).join("\n")}\n\nAgent (${req.agent}) Question: ${req.question}\nFile Reference: ${req.file_reference}\nWhy this matters: ${req.why_this_matters}\n\nUser Answer: ${req.user_answer}`;
  
  const result = await model.generateContent(prompt);
  const jsonText = result.response.text();
  return JSON.parse(jsonText) as InterviewResponse;
}

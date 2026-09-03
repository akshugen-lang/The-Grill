import { GoogleGenerativeAI, Schema, SchemaType } from "@google/generative-ai";
import { RepoMeta, FileContent, InterviewRequest, AnalyzeResponse, InterviewResponse, FixVerificationRequest, FixVerificationResponse } from "./types";
import crypto from "crypto";

import { getGenAI } from "./agents/base";

const InterviewResponseSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    is_complete: { type: SchemaType.BOOLEAN, description: "True if you are satisfied with the candidate's answers or if they have failed to answer." },
    feedback: { type: SchemaType.STRING, description: "Your next probing question OR your final thoughts." },
    verdict: { type: SchemaType.STRING, description: "Required if is_complete is true. Must be strong, partial, or weak", format: "enum", enum: ["strong", "partial", "weak"] } as any,
    score: { type: SchemaType.NUMBER, description: "Required if is_complete is true. Score for this answer out of 10" },
    missing_points: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: "Required if is_complete is true." },
  },
  required: ["is_complete", "feedback"]
};

const agentPersonas = {
  architecture: "You are the Architecture Agent. Your focus is strictly on design, structure, coupling, and scalability. Identify tight coupling, poor separation of concerns, scalability bottlenecks, or overly complex designs.",
  security: "You are the Security Agent. Your focus is strictly on identifying injection risks, secrets handling, input validation, and error handling gaps. Find vulnerabilities and dangerous patterns.",
  innovation: "You are the Innovation Agent. Your focus is on problem relevance, creativity, uniqueness of approach, and whether they used the right tools for the job. Call out over-engineered solutions or reinvented wheels."
};

export async function evaluateInterviewTurn(req: InterviewRequest): Promise<InterviewResponse> {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "<key>") throw new Error("API_KEY_INVALID");
  const persona = agentPersonas[req.agent as keyof typeof agentPersonas] || "";
  const model = getGenAI().getGenerativeModel({
    model: "gemini-3.1-flash-lite",
    systemInstruction: `${persona}\n\nAct as a tough judge in an ongoing conversation evaluating a specific technical concern. Evaluate the candidate's latest answer in the chat history.\n\nRules:\n- Judge only whether they actually addressed the specific technical concern — not whether they sound confident.\n- If there is only one user message in the chat history, you MUST set is_complete: false and ask exactly ONE sharp, probing question in 'feedback' to push back on their answer, no matter how good or bad it is. Never terminate the interview on the very first turn.\n- On subsequent turns, if their answer is still vague, incomplete, or fundamentally flawed, you MUST push back again by setting is_complete: false and asking another question.\n- If the candidate has fully answered the core concern, OR if they have repeatedly failed and you are out of patience, set is_complete: true, provide your final thoughts in 'feedback', and provide a final 'score', 'verdict', and 'missing_points'.\n- Output ONLY valid JSON matching the schema. No prose outside the JSON.`,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: InterviewResponseSchema,
    }
  });

  const prompt = `Code Context:\n${req.code_context.map(f => `--- FILE: ${f.path} ---\n${f.content}\n`).join("\n")}\n\nFile Reference: ${req.file_reference}\nWhy this matters: ${req.why_this_matters}\n\n--- CHAT HISTORY ---\n${req.history.map(m => `${m.role.toUpperCase()}: ${m.content}`).join("\n")}`;
  
  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text()) as InterviewResponse;
}

const FixVerificationSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    resolved: { type: SchemaType.BOOLEAN },
    confidence: { type: SchemaType.NUMBER, description: "Confidence score out of 10" },
    remaining_risk: { type: SchemaType.STRING, description: "Describe remaining risk if unresolved" },
    next_action: { type: SchemaType.STRING, description: "The next practical action" }
  },
  required: ["resolved", "confidence", "next_action"]
};

export async function verifyFix(req: FixVerificationRequest): Promise<FixVerificationResponse> {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "<key>") throw new Error("API_KEY_INVALID");
  const model = getGenAI().getGenerativeModel({
    model: "gemini-3.1-flash-lite",
    systemInstruction: "You are evaluating whether a developer's proposed code fix actually solves the issue in the original code.\n\nRules:\n- Never mark an issue fixed if the updated code context does not contain enough evidence to prove it.\n- If verification is incomplete or context is missing, set resolved: false and say unable to fully verify.\n- Output ONLY valid JSON matching the schema.",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: FixVerificationSchema,
    }
  });

  const prompt = `--- ORIGINAL IMPROVEMENT ISSUE ---\n${JSON.stringify(req.improvement, null, 2)}\n\n--- UPDATED CODE CONTEXT PROVIDED BY USER ---\n${req.updated_code_context}`;
  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text()) as FixVerificationResponse;
}

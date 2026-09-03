import { GoogleGenerativeAI, Schema, SchemaType } from "@google/generative-ai";
import { RepoMeta, FileContent, InterviewRequest, AnalyzeResponse, InterviewResponse } from "./types";
import crypto from "crypto";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

const AnalyzeResponseSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    overall_score: { type: SchemaType.NUMBER },
    verdict: { type: SchemaType.STRING },
    category_scores: {
      type: SchemaType.OBJECT,
      properties: {
        architecture: { type: SchemaType.NUMBER },
        security: { type: SchemaType.NUMBER },
        innovation: { type: SchemaType.NUMBER },
      },
      required: ["architecture", "security", "innovation"]
    },
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
  required: ["overall_score", "verdict", "category_scores", "hard_questions", "improvements"]
};

export async function analyzeCodebase(meta: RepoMeta, files: FileContent[]) {
  if (!apiKey) throw new Error("GEMINI_API_KEY is missing");
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-pro",
    systemInstruction: "You are a ruthless but fair senior staff engineer serving as a hackathon judge. You have been handed a real codebase. Your job is NOT to be encouraging — find the real weak points a top-tier judge would find, the way a tough technical interviewer would.\n\nRules:\n- Every question must reference a specific file, function, or line from the code provided. Never ask a generic question — ground it in something you actually see.\n- Every improvement must be specific and actionable, not generic advice — say WHICH function needs attention and WHY it's risky.\n- Score honestly. No error handling, no tests, or copy-pasted boilerplate should score low. Reserve 9-10 for genuinely well-architected work.\n- Do not praise unless it's earned and specific.\n- Output ONLY valid JSON matching the schema. No prose outside the JSON.",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: AnalyzeResponseSchema,
    }
  });

  const prompt = `Repo Meta: ${JSON.stringify(meta)}\n\nFiles:\n` + files.map(f => `--- FILE: ${f.path} ---\n${f.content}\n`).join("\n");
  
  const result = await model.generateContent(prompt);
  const jsonText = result.response.text();
  const parsed = JSON.parse(jsonText);

  const agents = ["architecture", "security", "innovation"] as const;
  
  parsed.hard_questions.forEach((q: any, i: number) => {
    q.id = crypto.randomUUID();
    q.agent = agents[i % agents.length];
  });
  
  parsed.improvements.forEach((imp: any, i: number) => {
    imp.id = crypto.randomUUID();
    imp.agent = agents[i % agents.length];
  });

  return parsed as Omit<AnalyzeResponse, "meta" | "files">;
}

const InterviewResponseSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    verdict: { type: SchemaType.STRING, enum: ["strong", "partial", "weak"] },
    feedback: { type: SchemaType.STRING },
    follow_up_question: { type: SchemaType.STRING },
  },
  required: ["verdict", "feedback"]
};

export async function evaluateInterviewTurn(req: InterviewRequest): Promise<InterviewResponse> {
  if (!apiKey) throw new Error("GEMINI_API_KEY is missing");
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-pro",
    systemInstruction: "You already asked this candidate a specific technical question about their own code. Now evaluate their answer.\n\nRules:\n- Judge only whether they actually addressed the specific technical concern in the question — not whether they sound confident.\n- If the answer is vague, deflects, or doesn't touch the actual tradeoff, mark it \"weak\" and write ONE sharp follow-up question that narrows in further on the same file/concern.\n- If the answer is correct but incomplete, mark it \"partial\" and give one line on what's missing. Only include a follow_up_question if there's a genuinely sharper angle left to press.\n- If the answer is genuinely correct and specific, mark it \"strong\" and say why briefly — do not manufacture a follow-up just to have one.\n- Output ONLY valid JSON matching the schema. No prose outside the JSON.",
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

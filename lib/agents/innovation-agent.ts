import { FileContent } from "../types";
import { genAI, AgentResponseSchema, processAgentResponse, AgentProcessedResponse } from "./base";

export async function runInnovationAgent(files: FileContent[]): Promise<AgentProcessedResponse> {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "<key>") {
    throw new Error("API_KEY_INVALID");
  }
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-pro",
    systemInstruction: "You are the Innovation Agent. Your focus is on problem relevance, creativity, uniqueness of approach, and whether they used the right tools for the job. Call out over-engineered solutions or reinvented wheels. Give an honest score (0-10), generate hard questions, and suggest improvements. Output valid JSON matching the schema.",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: AgentResponseSchema,
    }
  });

  const prompt = `Files:\n` + files.map(f => `--- FILE: ${f.path} ---\n${f.content}\n`).join("\n");
  const result = await model.generateContent(prompt);
  const raw = JSON.parse(result.response.text());
  return processAgentResponse(raw, "innovation");
}

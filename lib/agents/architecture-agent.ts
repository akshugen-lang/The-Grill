import { FileContent } from "../types";
import { genAI, AgentResponseSchema, processAgentResponse, AgentProcessedResponse } from "./base";

export async function runArchitectureAgent(files: FileContent[]): Promise<AgentProcessedResponse> {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "<key>") {
    throw new Error("API_KEY_INVALID");
  }
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-pro",
    systemInstruction: "You are the Architecture Agent. Your focus is strictly on design, structure, coupling, and scalability. Identify tight coupling, poor separation of concerns, scalability bottlenecks, or overly complex designs. Give an honest score (0-10), generate hard questions, and suggest improvements. Output valid JSON matching the schema.",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: AgentResponseSchema,
    }
  });

  const prompt = `Files:\n` + files.map(f => `--- FILE: ${f.path} ---\n${f.content}\n`).join("\n");
  const result = await model.generateContent(prompt);
  const raw = JSON.parse(result.response.text());
  return processAgentResponse(raw, "architecture");
}

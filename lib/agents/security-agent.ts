import { FileContent, StaticFinding } from "../types";
import { getGenAI, AgentResponseSchema, processAgentResponse, AgentProcessedResponse } from "./base";

export async function runSecurityAgent(files: FileContent[], staticFindings: StaticFinding[]): Promise<AgentProcessedResponse> {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "<key>") {
    throw new Error("API_KEY_INVALID");
  }
  const model = getGenAI().getGenerativeModel({
    model: "gemini-3.1-flash-lite",
    systemInstruction: "You are the Security Agent. Your focus is strictly on identifying injection risks, secrets handling, input validation, and error handling gaps. Find vulnerabilities and dangerous patterns. You have been provided with heuristic static scan results. These are unconfirmed pattern matches. Verify them in the code before claiming them as vulnerabilities. Give an honest score (0-10), generate hard questions, and suggest improvements. Output valid JSON matching the schema.",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: AgentResponseSchema,
    }
  });

  const prompt = `<STATIC_SCAN_RESULTS>\n${JSON.stringify(staticFindings, null, 2)}\n</STATIC_SCAN_RESULTS>\n\nFiles:\n` + files.map(f => `--- FILE: ${f.path} ---\n${f.content}\n`).join("\n");
  const result = await model.generateContent(prompt);
  const raw = JSON.parse(result.response.text());
  return processAgentResponse(raw, "security");
}

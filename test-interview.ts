import { config } from "dotenv";
config({ path: ".env.local" });

import { evaluateInterviewTurn } from "./lib/gemini";
import { InterviewRequest, Message } from "./lib/types";

async function runTest(label: string) {
  console.log(`\n\n--- TESTING MULTI-TURN: ${label} ---`);
  
  const history: Message[] = [
    {
      role: "judge",
      content: "You are using `eval()` to execute this dynamically passed string. This is a severe code injection vulnerability. How would you refactor this to maintain the dynamic behavior without using eval?"
    }
  ];

  let req: InterviewRequest = {
    agent: "security",
    file_reference: "src/utils.ts",
    why_this_matters: "Dynamic code execution allows attackers to run arbitrary code on the server if the input is untrusted.",
    code_context: [{ path: "src/utils.ts", content: "function runCode(code) { eval(code); }" }],
    history: history
  };

  // TURN 1: User gives a weak answer
  console.log(`\nJUDGE: ${history[0].content}`);
  
  const userAns1 = "I would just sanitize the input before passing it to eval so it's safe.";
  console.log(`USER: ${userAns1}`);
  history.push({ role: "user", content: userAns1 });
  
  console.log(`[Evaluating Turn 1...]`);
  let res = await evaluateInterviewTurn(req);
  console.log(`IS COMPLETE: ${res.is_complete}`);
  console.log(`JUDGE: ${res.feedback}`);

  if (res.is_complete) {
    console.log(`\nTEST FAILED: Judge stopped early!`);
    return;
  }

  // TURN 2: User gives a strong answer to the follow-up
  history.push({ role: "judge", content: res.feedback });
  const userAns2 = "Oh, I see. Sanitization isn't enough. I would use the Node 'vm' module to run the code in a sandboxed context, or better yet, build a specific AST parser for the dynamic logic so I don't need to execute strings at all.";
  console.log(`USER: ${userAns2}`);
  history.push({ role: "user", content: userAns2 });

  console.log(`[Evaluating Turn 2...]`);
  res = await evaluateInterviewTurn(req);
  console.log(`IS COMPLETE: ${res.is_complete}`);
  console.log(`JUDGE: ${res.feedback}`);

  if (res.is_complete) {
    console.log(`\nFINAL VERDICT: ${res.verdict?.toUpperCase()} (Score: ${res.score}/10)`);
    console.log(`MISSING POINTS: \n - ${(res.missing_points || []).join("\n - ")}`);
  }
}

async function main() {
  await runTest("Security - Eval Sandboxing");
}

main();

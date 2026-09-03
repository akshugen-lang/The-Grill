import { config } from "dotenv";
config({ path: ".env.local" });

import { verifyFix } from "./lib/gemini";
import { FixVerificationRequest, Improvement } from "./lib/types";

const mockImprovement: Improvement = {
  id: "test-improvement-1",
  agent: "security",
  area: "SQL Injection",
  severity: "critical",
  confidence: "confirmed",
  code_evidence: 'function getUser(id) { return db.query("SELECT * FROM users WHERE id = " + id); }',
  impact: "An attacker could inject arbitrary SQL commands and dump the database.",
  suggestion: "Refactor the query to use parameterized queries instead of string concatenation.",
  fix_code: "function getUser(id) { return db.query('SELECT * FROM users WHERE id = $1', [id]); }",
  verification_steps: ["Ensure the + operator is no longer used to concatenate the query string.", "Verify parameterized arguments are passed as an array."]
};

async function runTest(label: string, updatedCode: string) {
  console.log(`\n\n--- TESTING: ${label} ---`);
  console.log(`Updated Code:\n${updatedCode}`);
  console.log(`Verifying...`);
  try {
    const req: FixVerificationRequest = {
      issue_id: mockImprovement.id,
      improvement: mockImprovement,
      updated_code_context: updatedCode
    };
    const res = await verifyFix(req);
    console.log(`\nVERDICT: ${res.resolved ? "RESOLVED" : "UNRESOLVED"} (Confidence: ${res.confidence}/10)`);
    console.log(`NEXT ACTION: ${res.next_action}`);
    if (res.remaining_risk) {
      console.log(`REMAINING RISK: ${res.remaining_risk}`);
    }
  } catch (e) {
    console.error("Test failed:", e);
  }
}

async function main() {
  const correctedCode = `
import db from './db';

function getUser(id) {
  // Using parameterized queries for safety
  return db.query("SELECT * FROM users WHERE id = $1", [id]);
}
  `;

  const unchangedCode = `
import db from './db';

function getUser(id) {
  return db.query("SELECT * FROM users WHERE id = " + id);
}
  `;

  const missingContext = `
import React from 'react';

function UserProfile({ user }) {
  return <div>{user.name}</div>;
}
  `;

  await runTest("CORRECTED CODE", correctedCode);
  await runTest("UNCHANGED CODE", unchangedCode);
  await runTest("MISSING CONTEXT", missingContext);
}

main();

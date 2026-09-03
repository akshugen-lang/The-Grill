# 🥩 The Grill

**The Grill** is an AI-powered Technical Defense System and interactive interview platform designed to rigorously evaluate developer codebases. Paste a public GitHub URL, and our panel of specialist AI Judges will analyze the code, identify vulnerabilities and architectural flaws, and grill you on them in real-time.

## 🚀 Features

- **GitHub Ingestion**: Automatically pulls code files while intelligently filtering out boilerplate (`node_modules`, `dist`, images, etc.).
- **Static Security Scanner**: A fast, deterministic heuristic scanner that flags hardcoded secrets, dangerous dynamic execution (`eval`), SQL injection patterns, and open CORS policies.
- **Concurrent Specialist Agents**:
  - 🏛️ **Architecture Agent**: Focuses on module boundaries, coupling, and scalability.
  - 🔒 **Security Agent**: Focuses on vulnerabilities, input validation, and secrets.
  - 💡 **Innovation Agent**: Focuses on problem relevance, originality, and technical differentiation.
- **Lead Judge**: Synthesizes the specialist reports into a final cohesive review and overall score.
- **Dynamic Interactive Interview**: The AI will ask you tough questions about your code. If you give a weak answer, it will push back dynamically, demanding specific architectural solutions before passing you.
- **Fix & Verify**: Submit a code fix to an identified improvement, and the AI will rigorously verify if the vulnerability has actually been remediated.

## 📁 Repository Structure

This project is a Monorepo containing two separate Next.js applications:

- `/backend`: Contains the core AI orchestration (Gemini API integrations), the GitHub ingestion utilities, the deterministic static scanner, and the API routes for analyzing and interviewing.
- `/frontend`: Contains the React UI, including the dynamic Chat panels, the repo health scorecards, and the final verdict presentation.

## 💻 Running Locally

You will need a [Google Gemini API Key](https://aistudio.google.com/) to run the backend.

### 1. Start the Backend
\`\`\`bash
cd backend
npm install
# Create a .env.local file with GEMINI_API_KEY=your_key
npm run dev
\`\`\`

### 2. Start the Frontend
In a new terminal window:
\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`

## 🧪 Testing

The backend comes with a comprehensive suite of tests to verify the AI agents and deterministic scanners:
\`\`\`bash
cd backend
npx tsx test-scanner.ts
npx tsx test-e2e.ts
npx tsx test-interview.ts
npx tsx test-verify.ts
\`\`\`

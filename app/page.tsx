"use client";

import React, { useState } from "react";
import AuthGate from "@/components/AuthGate";
import AuthStatus from "@/components/AuthStatus";
import RepoInput from "@/components/RepoInput";
import LoadingGrill from "@/components/LoadingGrill";
import VerdictPanel from "@/components/VerdictPanel";
import InterviewSession from "@/components/InterviewSession";
import ScoreCard from "@/components/ScoreCard";
import { Screen, AnswerRecord } from "@/types/grill";

export default function Home() {
  const [screen, setScreen] = useState<Screen>("landing");
  const [repoUrl, setRepoUrl] = useState("");
  const [sessionResults, setSessionResults] = useState<AnswerRecord[]>([]);

  // 1. Submit Repo -> Scanning -> Verdict Panel
  const handleRepoSubmit = (url: string) => {
    setRepoUrl(url);
    setScreen("scanning");

    // Simulate scanning AST before displaying initial verdict panel
    setTimeout(() => {
      setScreen("verdict");
    }, 2500);
  };

  // 2. Verdict Panel -> Interview Session
  const handleBeginInterview = () => {
    setScreen("interview");
  };

  // 3. Interview Completed -> ScoreCard (Full Review)
  const handleInterviewComplete = (records: AnswerRecord[]) => {
    setSessionResults(records);
    setScreen("score");
  };

  // 4. Reset State -> Landing
  const handleReset = () => {
    setRepoUrl("");
    setSessionResults([]);
    setScreen("landing");
  };

  return (
    <AuthGate>
      <div className="min-h-screen flex flex-col justify-between p-4 sm:p-8">
        {/* Top Branding & Auth Header Bar */}
        <header className="w-full max-w-5xl mx-auto flex items-center justify-between py-4 border-b border-[#212B25] mb-8">
          <div
            onClick={handleReset}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <span className="text-2xl group-hover:scale-110 transition-transform">🔥</span>
            <div>
              <span className="font-serif font-bold text-xl text-[#EAE6DC] tracking-wide">
                THE GRILL
              </span>
              <span className="mono text-[10px] text-[#7C9B7E] block uppercase tracking-widest">
                Specialist Repo Audit
              </span>
            </div>
          </div>

          <AuthStatus />
        </header>

        {/* Main Screen Router */}
        <main className="flex-1 flex items-center justify-center w-full max-w-5xl mx-auto py-4">
          {screen === "landing" && <RepoInput onSubmit={handleRepoSubmit} />}

          {screen === "scanning" && (
            <LoadingGrill
              mode="analyze"
              subtitle={`Scanning AST structure of ${repoUrl}`}
            />
          )}

          {screen === "verdict" && (
            <VerdictPanel
              repoUrl={repoUrl}
              onBeginInterview={handleBeginInterview}
            />
          )}

          {screen === "interview" && (
            <InterviewSession onComplete={handleInterviewComplete} />
          )}

          {screen === "score" && (
            <ScoreCard
              repoUrl={repoUrl}
              records={sessionResults}
              onReset={handleReset}
            />
          )}
        </main>

        {/* Footer */}
        <footer className="w-full max-w-5xl mx-auto py-6 border-t border-[#212B25] mt-12 text-center text-xs mono text-[#647169]">
          The Grill Audit Engine · 🏗️ Architecture · 🛡️ Security · 💡 Innovation
        </footer>
      </div>
    </AuthGate>
  );
}

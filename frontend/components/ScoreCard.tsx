"use client";

import React from "react";
import { AnswerRecord } from "@/types/grill";
import { AGENTS_DATA } from "@/data/mockData";
import ImprovementsList from "./ImprovementsList";

interface ScoreCardProps {
  repoUrl: string;
  records: AnswerRecord[];
  analysisData: any;
  onReset: () => void;
}

export default function ScoreCard({
  repoUrl,
  records,
  analysisData,
  onReset,
}: ScoreCardProps) {
  // Compute Interview Performance Score out of 10
  // Verdict points: strong = 2, partial = 1, weak = 0
  let earnedPoints = 0;
  let maxPoints = 0;

  records.forEach((rec) => {
    // Main verdict points
    maxPoints += 2;
    if (rec.mainVerdict === "strong") earnedPoints += 2;
    else if (rec.mainVerdict === "partial") earnedPoints += 1;

    // Follow-up verdict points if present
    if (rec.followUpVerdict) {
      maxPoints += 2;
      if (rec.followUpVerdict === "strong") earnedPoints += 2;
      else if (rec.followUpVerdict === "partial") earnedPoints += 1;
    }
  });

  const interviewScore =
    maxPoints > 0 ? ((earnedPoints / maxPoints) * 10).toFixed(1) : "7.5";
  const codeScore = (analysisData?.overall_score || 0).toFixed(1);

  // Category scores (derived from backend response)
  const backendScores = analysisData?.category_scores || { architecture: 0, security: 0, innovation: 0 };
  const categoryScores = [
    { name: "Architecture", score: backendScores.architecture, agent: AGENTS_DATA.architecture },
    { name: "Security", score: backendScores.security, agent: AGENTS_DATA.security },
    { name: "Innovation", score: backendScores.innovation, agent: AGENTS_DATA.innovation },
  ];

  const executiveVerdict = analysisData?.verdict || "No final verdict provided.";
  const improvements = analysisData?.improvements || [];
  
  // Synthesize pros and cons from health and coverage
  const pros = [
    analysisData?.repo_health?.has_tests ? "Test suite detected." : "",
    analysisData?.repo_health?.has_readme ? "README documentation available." : "",
    analysisData?.repo_health?.has_ci ? "Continuous Integration pipeline configured." : ""
  ].filter(Boolean);
  if (pros.length === 0) pros.push("Basic repository structure initialized.");

  const cons = [
    !analysisData?.repo_health?.has_tests ? "No tests found in repository." : "",
    !analysisData?.repo_health?.has_ci ? "Missing CI/CD workflows." : "",
    (analysisData?.improvements || []).length > 0 ? `Identified ${analysisData.improvements.length} major improvement areas.` : ""
  ].filter(Boolean);
  if (cons.length === 0) cons.push("No major red flags detected.");

  const getBarColorClass = (score: number) => {
    if (score < 5.0) return "bg-[#B05A48]"; // Red / Danger
    if (score < 7.0) return "bg-[#C68A46]"; // Amber / Warning
    return "bg-[#7C9B7E]"; // Green / Success
  };

  const getBarTextClass = (score: number) => {
    if (score < 5.0) return "text-[#B05A48]";
    if (score < 7.0) return "text-[#C68A46]";
    return "text-[#7C9B7E]";
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header Banner */}
      <div className="bg-[#151B18] border border-[#2A332D] rounded-xl p-6 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1B221E] border border-[#2A332D] mono text-xs text-[#7C9B7E] mb-2">
            <span>✓</span>
            <span>AUDIT COMPLETE</span>
          </div>
          <h1 className="text-3xl font-serif text-[#EAE6DC]">Full review</h1>
          <p className="text-xs mono text-[#9BA69D] mt-1">
            Repository: <span className="text-[#EAE6DC] font-mono">{repoUrl}</span>
          </p>
        </div>
        <button
          onClick={onReset}
          className="px-5 py-2.5 rounded-lg bg-[#EAE6DC] hover:bg-[#ffffff] text-[#0D110F] font-semibold text-xs mono tracking-wide transition-all cursor-pointer shadow-md"
        >
          🔥 Grill Another Repo
        </button>
      </div>

      {/* Two Top Score Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Box 1: Code Score */}
        <div className="bg-[#151B18] border border-[#2A332D] rounded-xl p-6 space-y-2 relative overflow-hidden">
          <div className="mono text-xs text-[#647169] uppercase tracking-wider">
            Static AST Code Score
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-serif text-[#EAE6DC] font-bold">{codeScore}</span>
            <span className="mono text-lg text-[#647169]">/ 10</span>
          </div>
          <p className="text-xs text-[#9BA69D] font-serif">
            Evaluated based on code structure, AST patterns, dependency tree, and modularity.
          </p>
        </div>

        {/* Box 2: Interview Performance */}
        <div className="bg-[#151B18] border border-[#2A332D] rounded-xl p-6 space-y-2 relative overflow-hidden">
          <div className="mono text-xs text-[#647169] uppercase tracking-wider">
            Interview Performance
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-serif text-[#7C9B7E] font-bold">
              {interviewScore}
            </span>
            <span className="mono text-lg text-[#647169]">/ 10</span>
          </div>
          <p className="text-xs text-[#9BA69D] font-serif">
            Normalized score computed from your specialist agent defense answers & follow-up verdicts.
          </p>
        </div>
      </div>

      {/* Category Progress Bars */}
      <div className="bg-[#151B18] border border-[#2A332D] rounded-xl p-6 space-y-6">
        <h2 className="text-lg font-serif text-[#EAE6DC] flex items-center justify-between">
          <span>Specialist Category Breakdown</span>
          <span className="mono text-xs text-[#647169]">SCORE SCALE 0-10</span>
        </h2>

        <div className="space-y-5">
          {categoryScores.map((cat) => (
            <div key={cat.name} className="space-y-2">
              <div className="flex items-center justify-between text-xs mono">
                <div className="flex items-center gap-2">
                  <span>{cat.agent.icon}</span>
                  <span className="text-[#EAE6DC] font-medium">{cat.name}</span>
                </div>
                <span className={`font-bold ${getBarTextClass(cat.score)}`}>
                  {cat.score.toFixed(1)} / 10
                </span>
              </div>
              <div className="w-full h-3 bg-[#0D110F] rounded-full overflow-hidden border border-[#212B25]">
                <div
                  className={`h-full ${getBarColorClass(
                    cat.score
                  )} transition-all duration-500 rounded-full`}
                  style={{ width: `${(cat.score / 10) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pull-Quote Final Verdict Summary */}
      <div className="bg-[#151B18] border-l-4 border-l-[#7C9B7E] border-y border-r border-[#2A332D] rounded-r-xl p-6 space-y-3">
        <div className="mono text-xs text-[#7C9B7E] font-medium uppercase tracking-widest flex items-center gap-2">
          <span>📜 EXECUTIVE VERDICT SUMMARY</span>
        </div>
        <blockquote className="text-lg font-serif text-[#EAE6DC] italic leading-relaxed">
          &ldquo;{executiveVerdict}&rdquo;
        </blockquote>
        <div className="mono text-xs text-[#647169] text-right">
          — Panel Verdict Consensus (Architecture, Security, Innovation)
        </div>
      </div>

      {/* Two-Column Pros & Cons Grid (WHAT'S WORKING / WHAT'S NOT) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* WHAT'S WORKING Column */}
        <div className="bg-[#151B18] border border-[#7C9B7E]/40 rounded-xl p-6 space-y-4">
          <div className="mono text-xs text-[#7C9B7E] font-medium uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-[#212B25]">
            <span>✓</span>
            <span>WHAT&apos;S WORKING</span>
          </div>
          <ul className="space-y-3">
            {pros.map((pro, i) => (
              <li key={i} className="flex items-start gap-2.5 text-xs text-[#EAE6DC] font-serif leading-relaxed">
                <span className="text-[#7C9B7E] mt-0.5 font-bold">✓</span>
                <span>{pro}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* WHAT'S NOT Column */}
        <div className="bg-[#151B18] border border-[#B05A48]/40 rounded-xl p-6 space-y-4">
          <div className="mono text-xs text-[#B05A48] font-medium uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-[#212B25]">
            <span>⚠️</span>
            <span>WHAT&apos;S NOT</span>
          </div>
          <ul className="space-y-3">
            {cons.map((con, i) => (
              <li key={i} className="flex items-start gap-2.5 text-xs text-[#EAE6DC] font-serif leading-relaxed">
                <span className="text-[#B05A48] mt-0.5 font-bold">⚠️</span>
                <span>{con}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Improvements List (HOW TO MAKE THIS THE BEST VERSION OF ITSELF) */}
      <div className="bg-[#151B18] border border-[#2A332D] rounded-xl p-6 space-y-4">
        <h2 className="text-sm mono uppercase font-medium tracking-wider text-[#EAE6DC]">
          HOW TO MAKE THIS THE BEST VERSION OF ITSELF
        </h2>
        <ImprovementsList improvements={improvements} />
      </div>
    </div>
  );
}

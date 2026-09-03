"use client";

import React from "react";
import { RepoHealth } from "@/types/grill";

interface RepoHealthCardProps {
  health?: RepoHealth;
}

export default function RepoHealthCard({ health }: RepoHealthCardProps) {
  // Robust error handling: fallbacks if health data is missing or incomplete
  if (!health) {
    return (
      <div className="bg-[#151B18] border border-[#2A332D] rounded-xl p-5 font-mono text-xs text-[#647169] flex items-center gap-2">
        <span>⚠️</span>
        <span>Repository health metrics data unavailable for this scan.</span>
      </div>
    );
  }

  const {
    score = 7.5,
    hasReadme = false,
    hasTests = false,
    hasCi = false,
    hasEnvExample = false,
    hasLockfile = false,
    todoCount = 0,
    sourceFileCount = 0,
    languages = ["TypeScript"],
    largeFilesWarning,
  } = health;

  const getScoreColorClass = (val: number) => {
    if (val < 5.0) return "text-[#B05A48]";
    if (val < 7.0) return "text-[#C68A46]";
    return "text-[#7C9B7E]";
  };

  const getBarColorClass = (val: number) => {
    if (val < 5.0) return "bg-[#B05A48]";
    if (val < 7.0) return "bg-[#C68A46]";
    return "bg-[#7C9B7E]";
  };

  const checkItems = [
    { label: "README Documentation", present: hasReadme },
    { label: "Automated Tests", present: hasTests },
    { label: "CI Pipeline Config", present: hasCi },
    { label: "Env Example File", present: hasEnvExample },
    { label: "Package Lockfile", present: hasLockfile },
  ];

  return (
    <div
      className="bg-[#151B18] border border-[#2A332D] rounded-xl p-6 shadow-xl space-y-5"
      style={{ backgroundColor: "#151B18", borderColor: "#2A332D" }}
    >
      {/* Header & Score Display */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#212B25]">
        <div>
          <div className="font-mono text-xs text-[#7C9B7E] uppercase tracking-wider flex items-center gap-1.5">
            <span>💚</span>
            <span>REPOSITORY HEALTH METRICS</span>
          </div>
          <h3 className="text-xl font-serif font-semibold text-[#EAE6DC] mt-0.5">
            Codebase Hygiene Score
          </h3>
        </div>

        <div className="flex items-baseline gap-1.5 bg-[#0D110F] border border-[#212B25] px-4 py-2 rounded-lg">
          <span className={`text-3xl font-serif font-bold ${getScoreColorClass(score)}`}>
            {score.toFixed(1)}
          </span>
          <span className="font-mono text-xs text-[#647169]">/ 10</span>
        </div>
      </div>

      {/* Health Score Bar */}
      <div className="space-y-1.5">
        <div className="w-full h-2.5 bg-[#0D110F] rounded-full overflow-hidden border border-[#212B25]">
          <div
            className={`h-full ${getBarColorClass(score)} transition-all duration-500 rounded-full`}
            style={{ width: `${(score / 10) * 100}%` }}
          />
        </div>
      </div>

      {/* Detected Hygiene Checklist & Meta Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
        {/* Checklist */}
        <div className="space-y-2">
          <div className="font-mono text-[11px] text-[#647169] uppercase tracking-wider">
            Detected Health Primitives
          </div>
          <div className="space-y-1.5">
            {checkItems.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs font-serif">
                {item.present ? (
                  <span className="text-[#7C9B7E] font-bold">✓</span>
                ) : (
                  <span className="text-[#B05A48] font-bold">✗</span>
                )}
                <span className={item.present ? "text-[#EAE6DC]" : "text-[#647169]"}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Source Meta & Stats */}
        <div className="space-y-3">
          <div className="font-mono text-[11px] text-[#647169] uppercase tracking-wider">
            Repository Inventory
          </div>
          <div className="grid grid-cols-2 gap-2 font-mono text-xs">
            <div className="bg-[#1B221E] border border-[#212B25] p-2.5 rounded-lg">
              <div className="text-[#647169] text-[10px]">SOURCE FILES</div>
              <div className="text-[#EAE6DC] font-medium text-sm mt-0.5">
                {sourceFileCount}
              </div>
            </div>
            <div className="bg-[#1B221E] border border-[#212B25] p-2.5 rounded-lg">
              <div className="text-[#647169] text-[10px]">TODO / FIXMEs</div>
              <div className="text-[#C68A46] font-medium text-sm mt-0.5">
                {todoCount}
              </div>
            </div>
          </div>

          {/* Languages */}
          <div className="space-y-1">
            <div className="font-mono text-[11px] text-[#647169] uppercase tracking-wider">
              Primary Languages
            </div>
            <div className="flex flex-wrap gap-1.5">
              {languages.map((lang) => (
                <span
                  key={lang}
                  className="px-2 py-0.5 rounded bg-[#1B221E] border border-[#212B25] font-mono text-[11px] text-[#9BA69D]"
                >
                  {lang}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Large Files Warning Alert */}
      {largeFilesWarning && (
        <div className="p-3 bg-[#8A6234]/15 border border-[#C68A46]/40 rounded-lg font-mono text-xs text-[#C68A46] flex items-start gap-2">
          <span className="mt-0.5">⚠️</span>
          <span>{largeFilesWarning}</span>
        </div>
      )}
    </div>
  );
}

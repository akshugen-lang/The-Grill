"use client";

import React, { useState } from "react";
import { AnalysisCoverage } from "@/types/grill";

interface AnalysisCoverageCardProps {
  coverage?: AnalysisCoverage;
}

export default function AnalysisCoverageCard({
  coverage,
}: AnalysisCoverageCardProps) {
  const [showSkippedList, setShowSkippedList] = useState(false);

  // Robust error handling: fallbacks if coverage data is missing
  if (!coverage) {
    return (
      <div className="bg-[#151B18] border border-[#2A332D] rounded-xl p-5 font-mono text-xs text-[#647169] flex items-center gap-2">
        <span>⚠️</span>
        <span>AST scan coverage metrics unavailable for this scan.</span>
      </div>
    );
  }

  const {
    analyzedFilesCount = 0,
    totalCandidateFilesCount = 0,
    skippedFilesCount = 0,
    skippedFilesList = [],
    truncatedFilesCount = 0,
    coverageWarning,
  } = coverage;

  const coveragePercent = Math.round(
    (analyzedFilesCount / Math.max(totalCandidateFilesCount, 1)) * 100
  );

  return (
    <div
      className="bg-[#151B18] border border-[#2A332D] rounded-xl p-6 shadow-xl space-y-5"
      style={{ backgroundColor: "#151B18", borderColor: "#2A332D" }}
    >
      {/* Header & Coverage Percent */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#212B25]">
        <div>
          <div className="font-mono text-xs text-[#7C9B7E] uppercase tracking-wider flex items-center gap-1.5">
            <span>📊</span>
            <span>ANALYSIS COVERAGE TRANSPARENCY</span>
          </div>
          <h3 className="text-xl font-serif font-semibold text-[#EAE6DC] mt-0.5">
            AST File Scan Coverage
          </h3>
        </div>

        <div className="flex items-baseline gap-1.5 bg-[#0D110F] border border-[#212B25] px-4 py-2 rounded-lg">
          <span className="text-3xl font-serif font-bold text-[#7C9B7E]">
            {coveragePercent}%
          </span>
          <span className="font-mono text-xs text-[#647169]">COVERED</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2.5 bg-[#0D110F] rounded-full overflow-hidden border border-[#212B25]">
        <div
          className="h-full bg-[#7C9B7E] transition-all duration-500 rounded-full"
          style={{ width: `${coveragePercent}%` }}
        />
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
        <div className="bg-[#1B221E] border border-[#212B25] p-3 rounded-lg">
          <div className="text-[#647169] text-[10px]">ANALYZED FILES</div>
          <div className="text-[#EAE6DC] font-medium text-base mt-0.5">
            {analyzedFilesCount}
          </div>
        </div>

        <div className="bg-[#1B221E] border border-[#212B25] p-3 rounded-lg">
          <div className="text-[#647169] text-[10px]">TOTAL CANDIDATES</div>
          <div className="text-[#EAE6DC] font-medium text-base mt-0.5">
            {totalCandidateFilesCount}
          </div>
        </div>

        <div className="bg-[#1B221E] border border-[#212B25] p-3 rounded-lg">
          <div className="text-[#647169] text-[10px]">SKIPPED FILES</div>
          <div className="text-[#C68A46] font-medium text-base mt-0.5">
            {skippedFilesCount}
          </div>
        </div>

        <div className="bg-[#1B221E] border border-[#212B25] p-3 rounded-lg">
          <div className="text-[#647169] text-[10px]">TRUNCATED FILES</div>
          <div className="text-[#9BA69D] font-medium text-base mt-0.5">
            {truncatedFilesCount}
          </div>
        </div>
      </div>

      {/* Skipped Files List Toggle */}
      {skippedFilesList.length > 0 && (
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowSkippedList(!showSkippedList)}
            className="font-mono text-xs text-[#7C9B7E] hover:underline cursor-pointer flex items-center gap-1.5"
          >
            <span>📁</span>
            <span>
              {showSkippedList
                ? "Hide skipped files list ▲"
                : `View ${skippedFilesList.length} skipped files list ▼`}
            </span>
          </button>

          {showSkippedList && (
            <div className="mt-2.5 p-3 bg-[#0D110F] border border-[#212B25] rounded-lg space-y-1.5 font-mono text-xs">
              <div className="text-[11px] text-[#647169] uppercase tracking-wider mb-1">
                Skipped / Excluded File Paths:
              </div>
              {skippedFilesList.map((file, idx) => (
                <div key={idx} className="text-[#9BA69D] flex items-center gap-2">
                  <span className="text-[#647169]">•</span>
                  <span>{file}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Coverage Warning Alert */}
      {coverageWarning && (
        <div className="p-3 bg-[#4A5C4C]/20 border border-[#7C9B7E]/40 rounded-lg font-mono text-xs text-[#7C9B7E] flex items-start gap-2">
          <span className="mt-0.5">ℹ️</span>
          <span>{coverageWarning}</span>
        </div>
      )}
    </div>
  );
}

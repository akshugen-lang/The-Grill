"use client";

import React from "react";

import RepoHealthCard from "./RepoHealthCard";
import AnalysisCoverageCard from "./AnalysisCoverageCard";
import AgentLegend from "./AgentLegend";

interface VerdictPanelProps {
  repoUrl: string;
  analysisData: any;
  onBeginInterview: () => void;
}

export default function VerdictPanel({
  repoUrl,
  analysisData,
  onBeginInterview,
}: VerdictPanelProps) {
  // Map backend AnalyzeResponse to frontend UI structures
  const overallVerdict = analysisData?.verdict || "UNKNOWN";
  
  // Calculate risk level from score
  const score = analysisData?.overall_score || 0;
  let riskLevel = "LOW RISK";
  if (score < 5) riskLevel = "CRITICAL RISK";
  else if (score < 7) riskLevel = "MEDIUM RISK";

  const repoMeta = {
    commits: analysisData?.meta?.commits?.toLocaleString() || "N/A",
    contributors: analysisData?.meta?.contributors?.toLocaleString() || "N/A",
    language: analysisData?.meta?.primaryLanguage || "Unknown",
    activeSpan: analysisData?.meta?.activeSpan || "N/A",
  };

  const health = {
    score: analysisData?.repo_health?.health_score || 0,
    hasReadme: analysisData?.repo_health?.has_readme || false,
    hasTests: analysisData?.repo_health?.has_tests || false,
    hasCi: analysisData?.repo_health?.has_ci || false,
    hasEnvExample: analysisData?.repo_health?.has_env_template || false,
    hasLockfile: analysisData?.repo_health?.has_lockfile || false,
    todoCount: analysisData?.repo_health?.todo_count || 0,
    sourceFileCount: analysisData?.repo_health?.source_file_count || 0,
    languages: Object.keys(analysisData?.repo_health?.language_distribution || {}),
    largeFilesWarning: analysisData?.repo_health?.unusually_large_files?.length > 0 
      ? `Found ${analysisData.repo_health.unusually_large_files.length} large files.`
      : undefined
  };

  const coverage = {
    analyzedFilesCount: analysisData?.analysis_coverage?.total_files_analyzed || 0,
    totalCandidateFilesCount: analysisData?.analysis_coverage?.total_candidates || 0,
    skippedFilesCount: analysisData?.analysis_coverage?.skipped_files?.length || 0,
    skippedFilesList: analysisData?.analysis_coverage?.skipped_files || [],
    truncatedFilesCount: analysisData?.analysis_coverage?.truncated_files?.length || 0,
    coverageWarning: analysisData?.analysis_coverage?.warnings?.[0]
  };

  const firstPassFlags = (analysisData?.static_findings || []).map((finding: any) => {
    let type = "warning";
    if (finding.severity === "critical" || finding.severity === "high") type = "danger";
    else if (finding.severity === "low") type = "success";
    
    return {
      type,
      title: finding.type || "Security Flag",
      detail: finding.message,
      file_reference: finding.file_path + (finding.line_number ? `:${finding.line_number}` : "")
    };
  });

  const getFlagBadgeClass = (type: "success" | "warning" | "danger") => {
    if (type === "success") {
      return "bg-[#4A5C4C]/30 border-[#7C9B7E] text-[#7C9B7E]";
    }
    if (type === "warning") {
      return "bg-[#8A6234]/30 border-[#C68A46] text-[#C68A46]";
    }
    return "bg-[#7A3F33]/30 border-[#B05A48] text-[#B05A48]";
  };

  const getFlagBorderClass = (type: "success" | "warning" | "danger") => {
    if (type === "success") return "border-[#7C9B7E]/50";
    if (type === "warning") return "border-[#C68A46]/50";
    return "border-[#B05A48]/50";
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top Header Card: Verdict Word & Risk Badge */}
      <div className="bg-[#151B18] border border-[#2A332D] rounded-xl p-6 shadow-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#212B25]">
          <div className="flex items-center gap-3">
            <span className="text-3xl font-serif text-[#EAE6DC] font-bold tracking-wider">
              {overallVerdict}
            </span>
            <span className="px-3 py-1 rounded bg-[#4A5C4C]/30 border border-[#7C9B7E] text-[#7C9B7E] mono text-xs uppercase font-medium">
              {riskLevel}
            </span>
          </div>
          <div className="mono text-xs text-[#647169]">
            INITIAL AST SCAN COMPLETE
          </div>
        </div>

        {/* Repo Meta Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-2 mono text-xs">
          <div className="bg-[#1B221E] border border-[#212B25] p-3 rounded-lg">
            <div className="text-[#647169] text-[11px]">COMMITS</div>
            <div className="text-[#EAE6DC] font-medium text-sm mt-0.5">
              {repoMeta.commits}
            </div>
          </div>
          <div className="bg-[#1B221E] border border-[#212B25] p-3 rounded-lg">
            <div className="text-[#647169] text-[11px]">CONTRIBUTORS</div>
            <div className="text-[#EAE6DC] font-medium text-sm mt-0.5">
              {repoMeta.contributors}
            </div>
          </div>
          <div className="bg-[#1B221E] border border-[#212B25] p-3 rounded-lg">
            <div className="text-[#647169] text-[11px]">LANGUAGE</div>
            <div className="text-[#7C9B7E] font-medium text-sm mt-0.5">
              {repoMeta.language}
            </div>
          </div>
          <div className="bg-[#1B221E] border border-[#212B25] p-3 rounded-lg">
            <div className="text-[#647169] text-[11px]">ACTIVE SPAN</div>
            <div className="text-[#EAE6DC] font-medium text-sm mt-0.5">
              {repoMeta.activeSpan}
            </div>
          </div>
        </div>

        <div className="text-xs text-[#9BA69D] mono">
          Scanned Target: <span className="text-[#EAE6DC]">{repoUrl}</span>
        </div>
      </div>

      {/* Specialist Agent Panel Legend */}
      <AgentLegend />

      {/* Repo Health & Analysis Coverage Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RepoHealthCard health={health} />
        <AnalysisCoverageCard coverage={coverage} />
      </div>

      {/* First-Pass Flags List */}
      <div className="bg-[#151B18] border border-[#2A332D] rounded-xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between pb-2 border-b border-[#212B25]">
          <h2 className="text-base font-serif text-[#EAE6DC]">First-Pass Scan Flags</h2>
          <span className="mono text-xs text-[#647169]">
            {firstPassFlags.length} ISSUES IDENTIFIED
          </span>
        </div>

        <div className="space-y-3">
          {firstPassFlags.map((flag: any, idx: number) => (
            <div
              key={idx}
              className={`bg-[#1B221E] border ${getFlagBorderClass(
                flag.type
              )} rounded-lg p-4 space-y-2`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded border mono text-[11px] uppercase ${getFlagBadgeClass(
                      flag.type
                    )}`}
                  >
                    {flag.type}
                  </span>
                  <span className="mono text-xs text-[#EAE6DC] font-medium">
                    {flag.title}
                  </span>
                </div>
                {flag.file_reference && (
                  <span className="px-2 py-0.5 rounded bg-[#0D110F] border border-[#212B25] mono text-[11px] text-[#7C9B7E]">
                    {flag.file_reference}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#9BA69D] font-serif leading-relaxed">
                {flag.detail}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Primary Action Button */}
      <div className="pt-2 flex justify-end">
        <button
          onClick={onBeginInterview}
          className="px-8 py-3.5 rounded-lg bg-[#EAE6DC] hover:bg-[#ffffff] text-[#0D110F] font-semibold text-sm mono tracking-wide shadow-2xl transition-all cursor-pointer flex items-center gap-2"
        >
          <span>🎙️ Begin The Interview</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { Improvement, SeverityLevel } from "@/types/grill";
import EvidencePanel from "./EvidencePanel";
import FixVerificationPanel from "./FixVerificationPanel";
import AgentBadge from "./AgentBadge";

interface ImprovementsListProps {
  improvements?: Improvement[];
}

function ImprovementCard({
  item,
  defaultExpanded = false,
}: {
  item: Improvement;
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({});

  if (!item) return null;

  const areaTitle = item.area || "General Improvement Recommendation";
  const fileRef = item.file_reference || "src/core";

  const toggleStep = (idx: number) => {
    setCheckedSteps((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const getSeverityBadgeClass = (severity?: SeverityLevel) => {
    if (severity === "HIGH") {
      return "bg-[#7A3F33]/30 border-[#B05A48] text-[#B05A48]";
    }
    if (severity === "MEDIUM") {
      return "bg-[#8A6234]/30 border-[#C68A46] text-[#C68A46]";
    }
    return "bg-[#4A5C4C]/30 border-[#7C9B7E] text-[#7C9B7E]";
  };

  return (
    <div
      className="bg-[#1B221E] border border-[#2A332D] rounded-xl overflow-hidden shadow-lg transition-all"
      style={{ backgroundColor: "#1B221E", borderColor: "#2A332D" }}
    >
      {/* Card Collapsible Header */}
      <div
        onClick={() => setExpanded(!expanded)}
        className="p-5 flex items-center justify-between gap-3 cursor-pointer select-none hover:bg-[#212B25]/50 transition-colors"
      >
        <div className="flex items-center gap-3 flex-wrap">
          {/* Agent Badge & Area Title */}
          <AgentBadge agentId={item.agent || "architecture"} size="sm" />
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-serif font-semibold text-[#EAE6DC]">
              {areaTitle}
            </span>
            <span className="px-2 py-0.5 rounded bg-[#0D110F] border border-[#212B25] font-mono text-[11px] text-[#7C9B7E]">
              {fileRef}
            </span>
          </div>
        </div>

        {/* Badges & Collapse Toggle */}
        <div className="flex items-center gap-2">
          {item.severity && (
            <span
              className={`px-2.5 py-1 rounded border font-mono text-[11px] font-medium uppercase ${getSeverityBadgeClass(
                item.severity
              )}`}
            >
              {item.severity} SEVERITY
            </span>
          )}

          {item.confidence && (
            <span className="px-2.5 py-1 rounded bg-[#151B18] border border-[#212B25] font-mono text-[11px] text-[#9BA69D] hidden sm:inline-block">
              {item.confidence} CONFIDENCE
            </span>
          )}

          <button
            type="button"
            className="p-1 rounded bg-[#151B18] border border-[#2A332D] text-[#9BA69D] font-mono text-xs cursor-pointer ml-2"
          >
            {expanded ? "Collapse ▲" : "Expand ▼"}
          </button>
        </div>
      </div>

      {/* Expanded Content Body */}
      {expanded && (
        <div className="px-5 pb-5 pt-2 border-t border-[#212B25] space-y-4">
          {/* Suggestion Text */}
          <div className="space-y-1">
            <div className="font-mono text-xs text-[#647169] uppercase tracking-wider">
              Recommendation
            </div>
            <p className="text-sm text-[#EAE6DC] font-serif leading-relaxed">
              {item.suggestion || "No specific suggestion provided."}
            </p>
          </div>

          {/* Impact Description */}
          {item.impact && (
            <div className="p-3 bg-[#151B18] border border-[#212B25] rounded-lg space-y-1">
              <div className="font-mono text-[11px] text-[#C68A46] font-medium uppercase tracking-wider flex items-center gap-1.5">
                <span>⚡</span>
                <span>Expected Impact</span>
              </div>
              <p className="text-xs text-[#9BA69D] font-serif leading-relaxed">
                {item.impact}
              </p>
            </div>
          )}

          {/* Code Evidence Panel */}
          {item.evidence && item.evidence.length > 0 && (
            <div className="space-y-1">
              <EvidencePanel evidence={item.evidence} collapsible={true} maxExcerpts={1} />
            </div>
          )}

          {/* Exact Code Fix Block */}
          {item.exactFix && (
            <div className="space-y-1.5">
              <div className="font-mono text-xs text-[#7C9B7E] font-medium uppercase tracking-wider flex items-center gap-1.5">
                <span>🛠️</span>
                <span>Exact Code Fix</span>
              </div>
              <pre
                className="p-3.5 rounded-lg bg-[#0D110F] border border-[#212B25] font-mono text-[12px] text-[#EAE6DC] overflow-x-auto whitespace-pre-wrap leading-relaxed"
                style={{ backgroundColor: "#0D110F", borderColor: "#212B25" }}
              >
                {item.exactFix}
              </pre>
            </div>
          )}

          {/* Verification Steps Checklist */}
          {item.verificationSteps && item.verificationSteps.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-[#212B25]">
              <div className="font-mono text-xs text-[#9BA69D] font-medium uppercase tracking-wider flex items-center gap-1.5">
                <span>✅</span>
                <span>Verification Checklist</span>
              </div>
              <div className="space-y-2">
                {item.verificationSteps.map((step, idx) => {
                  const isChecked = Boolean(checkedSteps[idx]);
                  return (
                    <label
                      key={idx}
                      onClick={() => toggleStep(idx)}
                      className="flex items-start gap-3 p-2.5 rounded bg-[#151B18] border border-[#212B25] cursor-pointer select-none hover:bg-[#212B25]/50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}} // handled by parent onClick
                        className="mt-0.5 rounded border-[#2A332D] text-[#7C9B7E] focus:ring-0 cursor-pointer"
                      />
                      <span
                        className={`text-xs font-mono leading-relaxed transition-colors ${
                          isChecked
                            ? "line-through text-[#647169]"
                            : "text-[#EAE6DC]"
                        }`}
                      >
                        {step}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Fix Verification Panel Integration */}
          <div className="pt-2 border-t border-[#212B25]">
            <FixVerificationPanel improvement={item} />
          </div>
        </div>
      )}
    </div>
  );
}

export default function ImprovementsList({
  improvements,
}: ImprovementsListProps) {
  // Robust error handling for missing or empty improvements array
  if (!improvements || !Array.isArray(improvements) || improvements.length === 0) {
    return (
      <div className="p-5 bg-[#1B221E] border border-[#2A332D] rounded-xl font-mono text-xs text-[#9BA69D] space-y-2 text-center">
        <div className="text-base">🎉</div>
        <div className="text-[#EAE6DC] font-semibold">No Critical Improvements Flagged</div>
        <p className="text-[#647169] text-[11px]">
          Your codebase passed all primary agent quality rules without high-priority recommendations.
        </p>
      </div>
    );
  }

  const validItems = improvements.filter((item) => item && typeof item === "object");

  return (
    <div className="space-y-4">
      {validItems.map((item, idx) => (
        <ImprovementCard
          key={item.id || idx}
          item={item}
          defaultExpanded={idx === 0 || item.severity === "HIGH"}
        />
      ))}
    </div>
  );
}

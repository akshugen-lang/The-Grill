"use client";

import React, { useState } from "react";
import { Evidence } from "@/types/grill";

interface EvidencePanelProps {
  evidence?: Evidence[];
  collapsible?: boolean;
  maxExcerpts?: number;
}

function ExcerptItem({ item }: { item: Evidence }) {
  const [expanded, setExpanded] = useState(false);

  if (!item) return null;

  const filePath = item.filePath || "unspecified_file";
  const excerpt = item.excerpt || "// No code snippet excerpt provided.";
  const isLongExcerpt = excerpt.length > 140;

  return (
    <div
      className="bg-[#0D110F] border border-[#212B25] rounded-lg p-3 space-y-2 text-xs"
      style={{ borderColor: "#212B25" }}
    >
      {/* Evidence Meta Header: File Path, Symbol, Line Range */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="px-2 py-0.5 rounded bg-[#1B221E] border border-[#2A332D] font-mono text-[11px]"
            style={{ color: "#7C9B7E", borderColor: "#2A332D" }}
          >
            📄 {filePath}
          </span>

          {item.symbol && (
            <span
              className="px-2 py-0.5 rounded bg-[#151B18] border border-[#212B25] font-mono text-[11px]"
              style={{ color: "#9BA69D", borderColor: "#212B25" }}
            >
              ƒ {item.symbol}
            </span>
          )}
        </div>

        {item.lineRange && (
          <span
            className="font-mono text-[11px]"
            style={{ color: "#647169" }}
          >
            {item.lineRange}
          </span>
        )}
      </div>

      {/* Code Excerpt */}
      <div className="relative">
        <pre
          className="p-2.5 rounded bg-[#151B18] border border-[#212B25] font-mono text-[12px] overflow-x-auto leading-relaxed whitespace-pre-wrap"
          style={{ color: "#EAE6DC", borderColor: "#212B25" }}
        >
          {expanded || !isLongExcerpt ? excerpt : `${excerpt.slice(0, 140)}...`}
        </pre>

        {isLongExcerpt && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="mt-1 font-mono text-[11px] hover:underline cursor-pointer flex items-center gap-1"
            style={{ color: "#7C9B7E" }}
          >
            <span>{expanded ? "Show less ▲" : "Show more ▼"}</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default function EvidencePanel({
  evidence,
  collapsible = true,
  maxExcerpts = 2,
}: EvidencePanelProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [showAllItems, setShowAllItems] = useState(false);

  // Robust error handling: handle missing or empty evidence gracefully
  if (!evidence || !Array.isArray(evidence) || evidence.length === 0) {
    return (
      <div className="bg-[#151B18] border border-[#2A332D] rounded-xl p-4 font-mono text-xs text-[#647169] flex items-center gap-2">
        <span>ℹ️</span>
        <span>No code evidence attached for this item.</span>
      </div>
    );
  }

  // Filter out any malformed objects safely
  const validItems = evidence.filter((item) => item && typeof item === "object");

  if (validItems.length === 0) {
    return (
      <div className="bg-[#151B18] border border-[#2A332D] rounded-xl p-4 font-mono text-xs text-[#647169] flex items-center gap-2">
        <span>⚠️</span>
        <span>Evidence data format invalid or empty.</span>
      </div>
    );
  }

  const visibleEvidence = showAllItems
    ? validItems
    : validItems.slice(0, maxExcerpts);
  const hiddenCount = validItems.length - maxExcerpts;

  return (
    <div
      className="bg-[#151B18] border border-[#2A332D] rounded-xl p-4 space-y-3 shadow-md"
      style={{ backgroundColor: "#151B18", borderColor: "#2A332D" }}
    >
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#212B25]">
        <div className="flex items-center gap-2">
          <span className="text-sm">📁</span>
          <span
            className="font-mono text-xs font-semibold uppercase tracking-wider"
            style={{ color: "#EAE6DC" }}
          >
            Code Evidence ({validItems.length})
          </span>
        </div>

        {collapsible && (
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="font-mono text-xs cursor-pointer px-2 py-0.5 rounded bg-[#1B221E] border border-[#2A332D] hover:text-[#EAE6DC] transition-colors"
            style={{ color: "#9BA69D", borderColor: "#2A332D" }}
          >
            {isOpen ? "Collapse ▲" : "Expand ▼"}
          </button>
        )}
      </div>

      {/* Excerpts List */}
      {isOpen && (
        <div className="space-y-3 pt-1">
          {visibleEvidence.map((item, idx) => (
            <ExcerptItem key={idx} item={item} />
          ))}

          {hiddenCount > 0 && !showAllItems && (
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => setShowAllItems(true)}
                className="font-mono text-xs px-3 py-1.5 rounded bg-[#1B221E] border border-[#2A332D] hover:bg-[#212B25] cursor-pointer transition-colors"
                style={{ color: "#7C9B7E", borderColor: "#2A332D" }}
              >
                + Show {hiddenCount} more code evidence {hiddenCount === 1 ? "item" : "items"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

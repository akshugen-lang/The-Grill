"use client";

import React, { useState } from "react";
import { AgentId } from "@/types/grill";
import { AGENTS_DATA } from "@/data/mockData";

interface AgentBadgeProps {
  agentId: AgentId;
  showFocusInfo?: boolean;
  size?: "sm" | "md" | "lg";
}

const FOCUS_INFO: Record<AgentId, { focus: string; description: string }> = {
  architecture: {
    focus: "Design, structure, modularity, scalability",
    description: "Evaluates coupling, state flow, patterns, and component boundaries.",
  },
  security: {
    focus: "Risks, validation, secrets, injection",
    description: "Audits auth mechanisms, token handling, threat surface, and sanitization.",
  },
  innovation: {
    focus: "Problem relevance, creativity, DX, tooling",
    description: "Assesses modern package optimization, dynamic imports, and developer experience.",
  },
};

export default function AgentBadge({
  agentId,
  showFocusInfo = true,
  size = "md",
}: AgentBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const agent = AGENTS_DATA[agentId] || AGENTS_DATA.architecture;
  const focusData = FOCUS_INFO[agentId];

  const getBadgeColors = (id: AgentId) => {
    if (id === "architecture") {
      return "bg-[#4A5C4C]/30 border-[#7C9B7E] text-[#7C9B7E]";
    }
    if (id === "security") {
      return "bg-[#8A6234]/30 border-[#C68A46] text-[#C68A46]";
    }
    return "bg-[#3B5F70]/30 border-[#5C8EA6] text-[#5C8EA6]";
  };

  const getSizeClasses = () => {
    if (size === "sm") return "px-2 py-0.5 text-[11px]";
    if (size === "lg") return "px-3.5 py-1.5 text-sm";
    return "px-2.5 py-1 text-xs";
  };

  return (
    <div className="relative inline-flex items-center">
      <div
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => setShowTooltip(!showTooltip)}
        className={`inline-flex items-center gap-1.5 rounded border font-mono font-medium tracking-wide cursor-pointer transition-all ${getBadgeColors(
          agentId
        )} ${getSizeClasses()}`}
      >
        <span>{agent.icon}</span>
        <span>{agent.name}</span>
        {showFocusInfo && (
          <span className="text-[10px] opacity-70 ml-0.5">ⓘ</span>
        )}
      </div>

      {/* Interactive Tooltip Popover */}
      {showFocusInfo && showTooltip && (
        <div className="absolute bottom-full left-0 mb-2 w-64 p-3 bg-[#0D110F] border border-[#2A332D] rounded-lg shadow-2xl z-50 text-xs font-mono space-y-1">
          <div className="flex items-center gap-1.5 text-[#EAE6DC] font-semibold">
            <span>{agent.icon}</span>
            <span>{agent.name} Focus</span>
          </div>
          <p className="text-[#7C9B7E] text-[11px] font-medium">
            {focusData.focus}
          </p>
          <p className="text-[#9BA69D] text-[11px] font-serif leading-relaxed pt-1 border-t border-[#212B25]">
            {focusData.description}
          </p>
        </div>
      )}
    </div>
  );
}

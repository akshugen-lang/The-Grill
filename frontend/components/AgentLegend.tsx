"use client";

import React from "react";
import { AGENTS_DATA } from "@/data/mockData";
import AgentBadge from "./AgentBadge";

export default function AgentLegend() {
  const agentKeys = Object.keys(AGENTS_DATA) as Array<keyof typeof AGENTS_DATA>;

  const legendDetails = {
    architecture: "Design, structure, modularity, state flow, scalability",
    security: "Risks, validation, credentials, threat surface, key rotation",
    innovation: "Problem relevance, creativity, DX, bundle optimization",
  };

  return (
    <div
      className="bg-[#151B18] border border-[#2A332D] rounded-xl p-5 shadow-lg space-y-3"
      style={{ backgroundColor: "#151B18", borderColor: "#2A332D" }}
    >
      <div className="flex items-center justify-between pb-2 border-b border-[#212B25]">
        <div className="font-mono text-xs text-[#7C9B7E] uppercase tracking-wider flex items-center gap-2">
          <span>🤖</span>
          <span>Specialist Agent Panel Legend</span>
        </div>
        <span className="font-mono text-[11px] text-[#647169]">
          3 AUDIT PANELS
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {agentKeys.map((key) => {
          const agent = AGENTS_DATA[key];
          return (
            <div
              key={key}
              className="bg-[#1B221E] border border-[#212B25] p-3 rounded-lg space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <AgentBadge agentId={key} showFocusInfo={false} size="sm" />
              </div>
              <p className="text-xs font-serif text-[#9BA69D] leading-relaxed">
                {legendDetails[key]}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

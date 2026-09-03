"use client";

import React, { useEffect, useState } from "react";
import { SCAN_MESSAGES, REVIEW_MESSAGES } from "@/data/mockData";

interface LoadingGrillProps {
  mode?: "analyze" | "reviewing-answer";
  customMessages?: string[];
  subtitle?: string;
}

export default function LoadingGrill({
  mode = "analyze",
  customMessages,
  subtitle,
}: LoadingGrillProps) {
  const messages =
    customMessages || (mode === "analyze" ? SCAN_MESSAGES : REVIEW_MESSAGES);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 750);

    return () => clearInterval(timer);
  }, [messages]);

  return (
    <div className="w-full max-w-xl mx-auto py-12 flex flex-col items-center justify-center space-y-6">
      {/* Radar Pulse Graphic */}
      <div className="relative w-24 h-24 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border border-[#7C9B7E]/30 animate-ping" />
        <div className="absolute inset-2 rounded-full border border-[#7C9B7E]/50 animate-pulse" />
        <div className="w-16 h-16 rounded-full bg-[#151B18] border border-[#2A332D] flex items-center justify-center shadow-lg text-2xl">
          {mode === "analyze" ? "🔥" : "🤖"}
        </div>
      </div>

      {/* Cycling Message Display */}
      <div className="text-center space-y-2 max-w-md">
        <div className="mono text-xs text-[#7C9B7E] uppercase tracking-widest flex items-center justify-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#7C9B7E] animate-pulse"></span>
          <span>{mode === "analyze" ? "SCANNING REPOSITORY" : "REVIEWING RESPONSE"}</span>
        </div>

        <div className="h-10 flex items-center justify-center">
          <p className="mono text-sm text-[#EAE6DC] transition-all duration-200">
            {messages[index]}
          </p>
        </div>

        {subtitle && (
          <p className="text-xs text-[#647169] mono italic">{subtitle}</p>
        )}
      </div>

      {/* Progress Line */}
      <div className="w-48 h-1 bg-[#1B221E] rounded-full overflow-hidden border border-[#212B25]">
        <div className="h-full bg-[#7C9B7E] animate-pulse rounded-full w-2/3" />
      </div>
    </div>
  );
}

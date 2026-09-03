"use client";

import React, { useState } from "react";
import { AGENTS_DATA } from "@/data/mockData";

interface RepoInputProps {
  onSubmit: (repoUrl: string) => void;
}

const GITHUB_REGEX = /github\.com\/[^\/]+\/[^\/]+/;

export default function RepoInput({ onSubmit }: RepoInputProps) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = url.trim();

    if (!trimmed) {
      setError("Please enter a GitHub repository URL.");
      return;
    }

    if (!GITHUB_REGEX.test(trimmed)) {
      setError("Invalid URL format. Expected: github.com/owner/repository");
      return;
    }

    setError(null);
    onSubmit(trimmed);
  };

  const handlePreset = (presetUrl: string) => {
    setUrl(presetUrl);
    setError(null);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      {/* Header Badge & Title */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#151B18] border border-[#2A332D] mono text-xs text-[#9BA69D]">
          <span className="w-2 h-2 rounded-full bg-[#7C9B7E] animate-pulse"></span>
          <span>SYSTEM READY FOR AUDIT</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-serif text-[#EAE6DC] tracking-tight">
          Put Your Codebase To The Test
        </h1>
        <p className="text-sm md:text-base text-[#9BA69D] max-w-lg mx-auto leading-relaxed">
          Paste a public GitHub repository. Three specialized agents will scan your AST,
          challenge your architectural decisions, and grill your security posture.
        </p>
      </div>

      {/* Input Form Card */}
      <div className="bg-[#151B18] border border-[#2A332D] rounded-xl p-6 shadow-2xl space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#647169] mono text-sm">
                github.com/
              </div>
              <input
                type="text"
                placeholder="owner/repository"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  if (error) setError(null);
                }}
                className="w-full bg-[#0D110F] border border-[#2A332D] rounded-lg pl-28 pr-4 py-3 text-[#EAE6DC] text-sm focus:outline-none focus:border-[#7C9B7E] transition-colors mono"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 rounded-lg bg-[#EAE6DC] hover:bg-[#ffffff] text-[#0D110F] font-semibold text-sm mono tracking-wide transition-all duration-150 cursor-pointer shadow-md flex items-center justify-center gap-2"
            >
              <span>🔥</span>
              <span>Get Grilled</span>
            </button>
          </div>

          {/* Validation Error Message */}
          {error && (
            <div className="p-3 bg-[#7A3F33]/20 border border-[#B05A48] rounded-lg text-xs mono text-[#B05A48] flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}
        </form>

        {/* Quick Sample Presets */}
        <div className="pt-3 border-t border-[#212B25] flex items-center gap-2 text-xs mono">
          <span className="text-[#647169]">Try sample:</span>
          <div className="flex flex-wrap gap-2">
            {[
              "https://github.com/facebook/react",
              "https://github.com/vercel/next.js",
              "https://github.com/tailwindlabs/tailwindcss",
            ].map((sample) => (
              <button
                key={sample}
                type="button"
                onClick={() => handlePreset(sample)}
                className="px-2.5 py-1 rounded bg-[#1B221E] hover:bg-[#212B25] border border-[#2A332D] text-[#9BA69D] hover:text-[#EAE6DC] transition-colors cursor-pointer"
              >
                {sample.replace("https://github.com/", "")}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Static Agents Strip */}
      <div className="bg-[#151B18] border border-[#212B25] rounded-xl p-4 flex flex-col sm:flex-row items-center justify-around gap-4 text-xs mono">
        {Object.values(AGENTS_DATA).map((agent) => (
          <div key={agent.id} className="flex items-center gap-2.5">
            <span className="text-xl">{agent.icon}</span>
            <div>
              <div className="text-[#EAE6DC] font-medium">{agent.name}</div>
              <div className="text-[#647169] text-[11px]">{agent.title}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

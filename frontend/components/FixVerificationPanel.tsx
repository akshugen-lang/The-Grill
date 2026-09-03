"use client";

import React, { useState } from "react";
import { Improvement, FileContent, VerifyFixResponse } from "@/types/grill";
import { fetchApi } from "@/lib/api";

interface FixVerificationPanelProps {
  improvement: Improvement;
  files?: FileContent[];
}

export default function FixVerificationPanel({
  improvement,
  files = [
    {
      path: "src/auth/jwt.ts",
      content:
        "const secretProvider = new SecretManagerProvider();\nexport async function verifyAuthToken(token: string) {\n  const secret = await secretProvider.getSecret('prod/jwt-signing-key');\n  return jwt.verify(token, secret);\n}",
    },
    {
      path: "src/core/router.ts",
      content:
        "export function handleRoute(req: Request, userRepo: IUserRepository) {\n  return userRepo.findUser(req.url);\n}",
    },
  ],
}: FixVerificationPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFilePath, setSelectedFilePath] = useState<string>(
    improvement.file_reference || files[0]?.path || ""
  );
  const [codeContent, setCodeContent] = useState<string>(
    improvement.exactFix || files[0]?.content || ""
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VerifyFixResponse | null>(null);

  const handleFileSelect = (path: string) => {
    setSelectedFilePath(path);
    const found = files.find((f) => f.path === path);
    if (found) {
      setCodeContent(found.content);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codeContent.trim()) {
      setError("Please paste or enter updated code to verify.");
      return;
    }

    setError(null);
    setLoading(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout safeguard

    try {
      const data: any = await fetchApi<any>("/api/verify-fix", {
        method: "POST",
        body: JSON.stringify({
          issue_id: improvement.id || "unknown",
          improvement,
          updated_code_context: codeContent,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (typeof data !== "object" || typeof data.resolved !== "boolean") {
        throw new Error("Invalid response format received from verification endpoint");
      }

      setResult({
        ...data,
        confidence: data.confidence?.toString() || "Unknown",
        remainingRisk: data.remaining_risk || "None",
        nextAction: data.next_action || "Deploy",
      } as any);
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.error("Fix Verification Error:", err);

      let userMsg = "Verification request failed. Please check your network connection and try again.";
      if (err.name === "AbortError") {
        userMsg = "Verification request timed out. Server took too long to evaluate the fix.";
      } else if (err?.message) {
        userMsg = err.message;
      }

      setError(userMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-2">
      {/* Trigger Button */}
      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="px-4 py-2 rounded-lg bg-[#1B221E] hover:bg-[#212B25] border border-[#7C9B7E]/50 text-[#7C9B7E] font-mono text-xs font-semibold cursor-pointer transition-colors flex items-center gap-2"
        >
          <span>🔍</span>
          <span>Verify My Fix</span>
        </button>
      ) : (
        <div className="bg-[#0D110F] border border-[#7C9B7E]/40 rounded-xl p-5 space-y-4 shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#212B25]">
            <div className="flex items-center gap-2">
              <span className="text-base">🛠️</span>
              <span className="font-mono text-xs text-[#EAE6DC] font-semibold uppercase tracking-wider">
                Fix Verification Panel
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="font-mono text-xs text-[#647169] hover:text-[#EAE6DC] cursor-pointer"
            >
              Close ✕
            </button>
          </div>

          {/* Form Controls */}
          <form onSubmit={handleVerify} className="space-y-4">
            {/* File Selector Dropdown */}
            {files.length > 0 && (
              <div className="space-y-1.5">
                <label className="block font-mono text-[11px] text-[#647169] uppercase tracking-wider">
                  Target File Context
                </label>
                <select
                  value={selectedFilePath}
                  onChange={(e) => handleFileSelect(e.target.value)}
                  className="w-full bg-[#151B18] border border-[#2A332D] rounded-lg px-3 py-2 text-xs font-mono text-[#EAE6DC] focus:outline-none focus:border-[#7C9B7E]"
                >
                  {files.map((f) => (
                    <option key={f.path} value={f.path}>
                      {f.path}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Code Input Textarea */}
            <div className="space-y-1.5">
              <label className="block font-mono text-[11px] text-[#647169] uppercase tracking-wider">
                Paste Updated Code Snippet
              </label>
              <textarea
                rows={5}
                value={codeContent}
                onChange={(e) => setCodeContent(e.target.value)}
                placeholder="Paste your refactored implementation here..."
                className="w-full bg-[#151B18] border border-[#2A332D] rounded-lg p-3 text-xs font-mono text-[#EAE6DC] focus:outline-none focus:border-[#7C9B7E] transition-colors resize-none leading-relaxed"
              />
            </div>

            {/* Error Display */}
            {error && (
              <div className="p-3 bg-[#7A3F33]/20 border border-[#B05A48] rounded-lg font-mono text-xs text-[#B05A48] flex items-center gap-2">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end gap-2">
              <button
                type="submit"
                disabled={loading || !codeContent.trim()}
                className="px-5 py-2.5 rounded-lg bg-[#EAE6DC] hover:bg-[#ffffff] disabled:opacity-40 text-[#0D110F] font-mono text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center gap-2"
              >
                <span>{loading ? "Verifying Fix..." : "Run Fix Verification →"}</span>
              </button>
            </div>
          </form>

          {/* Verification Result Display */}
          {result && (
            <div className="pt-3 border-t border-[#212B25] space-y-3">
              {/* Status & Confidence Badge */}
              <div className="flex items-center justify-between">
                <span
                  className={`px-3 py-1 rounded border font-mono text-xs font-semibold uppercase ${
                    result.resolved
                      ? "bg-[#4A5C4C]/30 border-[#7C9B7E] text-[#7C9B7E]"
                      : "bg-[#8A6234]/30 border-[#C68A46] text-[#C68A46]"
                  }`}
                >
                  {result.resolved ? "✓ FIX RESOLVED" : "⚠️ UNRESOLVED ISSUE"}
                </span>

                <span className="font-mono text-xs text-[#9BA69D]">
                  Confidence: <span className="text-[#EAE6DC]">{result.confidence}</span>
                </span>
              </div>

              {/* Feedback Text */}
              <p className="text-xs text-[#EAE6DC] font-serif leading-relaxed">
                {result.feedback}
              </p>

              {/* Remaining Risk & Next Action Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 font-mono text-xs">
                <div className="bg-[#151B18] border border-[#212B25] p-3 rounded-lg space-y-1">
                  <div className="text-[#C68A46] text-[10px] uppercase tracking-wider font-semibold">
                    REMAINING RISK
                  </div>
                  <div className="text-[#9BA69D] text-[11px] leading-relaxed">
                    {result.remainingRisk}
                  </div>
                </div>

                <div className="bg-[#151B18] border border-[#212B25] p-3 rounded-lg space-y-1">
                  <div className="text-[#7C9B7E] text-[10px] uppercase tracking-wider font-semibold">
                    RECOMMENDED NEXT ACTION
                  </div>
                  <div className="text-[#9BA69D] text-[11px] leading-relaxed">
                    {result.nextAction}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

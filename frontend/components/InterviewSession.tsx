"use client";

import React, { useState } from "react";
import {
  DYNAMIC_QUESTIONS_POOL,
  AGENTS_DATA,
  getMockVerdict,
  evaluateInterviewDecision,
} from "@/data/mockData";
import { AnswerRecord, VerdictType } from "@/types/grill";
import LoadingGrill from "./LoadingGrill";
import EvidencePanel from "./EvidencePanel";
import AgentBadge from "./AgentBadge";

interface InterviewSessionProps {
  onComplete: (records: AnswerRecord[]) => void;
}

function ExpectedPointsPanel({ points }: { points?: string[] }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!points || points.length === 0) return null;

  return (
    <div className="bg-[#151B18] border border-[#7C9B7E]/40 rounded-xl p-4 space-y-3 shadow-md">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between cursor-pointer select-none"
      >
        <div className="flex items-center gap-2">
          <span className="text-base">💡</span>
          <span className="font-mono text-xs text-[#7C9B7E] font-medium uppercase tracking-wider">
            What a strong answer should cover
          </span>
        </div>
        <button
          type="button"
          className="font-mono text-[11px] text-[#9BA69D] hover:text-[#EAE6DC] px-2 py-0.5 rounded bg-[#1B221E] border border-[#2A332D]"
        >
          {isOpen ? "Hide ▲" : "Reveal Points ▼"}
        </button>
      </div>

      {isOpen && (
        <ul className="space-y-2 pt-2 border-t border-[#212B25] text-xs font-serif text-[#EAE6DC] leading-relaxed">
          {points.map((pt, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-[#7C9B7E] font-mono font-bold mt-0.5">•</span>
              <span>{pt}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function InterviewSession({ onComplete }: InterviewSessionProps) {
  const [questionIndex, setQuestionIndex] = useState(0);

  // Wrap around pool if index exceeds dynamic pool length
  const poolLength = DYNAMIC_QUESTIONS_POOL.length;
  const currentQuestion = DYNAMIC_QUESTIONS_POOL[questionIndex % poolLength];
  const agentProfile = AGENTS_DATA[currentQuestion.agent];

  // Conversation step state for current question:
  // 'main_input' | 'main_loading' | 'main_verdict' | 'followup_input' | 'followup_loading' | 'followup_verdict'
  const [step, setStep] = useState<
    | "main_input"
    | "main_loading"
    | "main_verdict"
    | "followup_input"
    | "followup_loading"
    | "followup_verdict"
  >("main_input");

  const [mainAnswerText, setMainAnswerText] = useState("");
  const [mainVerdict, setMainVerdict] = useState<VerdictType | null>(null);
  const [mainFeedback, setMainFeedback] = useState("");

  const [followUpAnswerText, setFollowUpAnswerText] = useState("");
  const [followUpVerdict, setFollowUpVerdict] = useState<VerdictType | null>(null);
  const [followUpFeedback, setFollowUpFeedback] = useState("");

  const [records, setRecords] = useState<AnswerRecord[]>([]);

  // Calculate current record array including ongoing question
  const currentAnswerRecord: AnswerRecord = {
    questionId: `${currentQuestion.id}-${questionIndex}`,
    mainAnswer: mainAnswerText,
    mainVerdict: mainVerdict || "partial",
    mainFeedback: mainFeedback,
    followUpAnswer: currentQuestion.followUpQuestion ? followUpAnswerText : undefined,
    followUpVerdict: currentQuestion.followUpQuestion ? followUpVerdict || "partial" : undefined,
    followUpFeedback: currentQuestion.followUpQuestion ? followUpFeedback : undefined,
  };

  const accumulatedRecords = [...records, currentAnswerRecord];

  // AI Decision Engine output for current step
  const aiDecision = evaluateInterviewDecision(accumulatedRecords, questionIndex);

  // Submit Main Answer
  const handleMainSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mainAnswerText.trim()) return;

    setStep("main_loading");

    setTimeout(() => {
      const result = getMockVerdict(mainAnswerText.length);
      setMainVerdict(result.verdict);
      setMainFeedback(result.feedback);

      if (currentQuestion.followUpQuestion) {
        setStep("followup_input");
      } else {
        setStep("main_verdict");
      }
    }, 1200);
  };

  // Submit Follow-Up Answer
  const handleFollowUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpAnswerText.trim()) return;

    setStep("followup_loading");

    setTimeout(() => {
      const result = getMockVerdict(followUpAnswerText.length);
      setFollowUpVerdict(result.verdict);
      setFollowUpFeedback(result.feedback);
      setStep("followup_verdict");
    }, 1200);
  };

  // Advance to Next Question
  const handleContinueNextQuestion = () => {
    setRecords(accumulatedRecords);
    setQuestionIndex((prev) => prev + 1);
    setStep("main_input");
    setMainAnswerText("");
    setMainVerdict(null);
    setMainFeedback("");
    setFollowUpAnswerText("");
    setFollowUpVerdict(null);
    setFollowUpFeedback("");
  };

  // Conclude Interview & View Scorecard
  const handleConcludeInterview = () => {
    onComplete(accumulatedRecords);
  };

  const getVerdictBadge = (verdict: VerdictType) => {
    if (verdict === "strong") {
      return (
        <span className="px-2.5 py-1 rounded bg-[#4A5C4C]/30 border border-[#7C9B7E] text-[#7C9B7E] mono text-xs uppercase font-medium">
          ✓ STRONG VERDICT
        </span>
      );
    }
    if (verdict === "partial") {
      return (
        <span className="px-2.5 py-1 rounded bg-[#8A6234]/30 border border-[#C68A46] text-[#C68A46] mono text-xs uppercase font-medium">
          ⚡ PARTIAL VERDICT
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded bg-[#7A3F33]/30 border border-[#B05A48] text-[#B05A48] mono text-xs uppercase font-medium">
        ⚠️ WEAK VERDICT
      </span>
    );
  };

  const getVerdictBorderClass = (verdict: VerdictType | null) => {
    if (verdict === "strong") return "border-[#7C9B7E]";
    if (verdict === "partial") return "border-[#C68A46]";
    if (verdict === "weak") return "border-[#B05A48]";
    return "border-[#2A332D]";
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 pb-12">
      {/* Dynamic Progress Header */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between mono text-xs text-[#9BA69D] gap-2">
          <span className="flex items-center gap-1.5">
            <span className="animate-pulse text-[#7C9B7E]">●</span>
            <span>DYNAMIC AI AGENT PANEL INTERVIEW</span>
          </span>
          <span className="text-[#EAE6DC] font-medium">
            Question #{questionIndex + 1} · Depth Coverage: {aiDecision.depthCoveragePercent}%
          </span>
        </div>
        <div className="w-full h-1.5 bg-[#151B18] rounded-full overflow-hidden border border-[#212B25]">
          <div
            className="h-full bg-[#7C9B7E] transition-all duration-500 rounded-full"
            style={{ width: `${aiDecision.depthCoveragePercent}%` }}
          />
        </div>
      </div>

      {/* Main Question Card (Left-Aligned Bubble) */}
      <div className="bg-[#151B18] border border-[#2A332D] rounded-xl p-6 shadow-xl space-y-4">
        {/* Agent Badge & File Reference Chip */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#212B25]">
          <div className="flex items-center gap-2.5 flex-wrap">
            <AgentBadge agentId={currentQuestion.agent} size="md" />
            <span className="text-xs text-[#647169] mono hidden sm:inline-block">
              {agentProfile.title}
            </span>
          </div>
          <div className="px-2.5 py-1 rounded bg-[#1B221E] border border-[#2A332D] mono text-xs text-[#9BA69D] flex items-center gap-1.5">
            <span className="text-[#647169]">file:</span>
            <span className="text-[#7C9B7E] font-mono">{currentQuestion.file_reference}</span>
          </div>
        </div>

        {/* Question Text */}
        <div className="space-y-2">
          <div className="mono text-xs text-[#9BA69D] uppercase tracking-wider">
            {currentQuestion.title}
          </div>
          <p className="text-base text-[#EAE6DC] font-serif leading-relaxed">
            &ldquo;{currentQuestion.question}&rdquo;
          </p>
        </div>
      </div>

      {/* Code Evidence Panel (Displayed under question before answer input) */}
      {currentQuestion.evidence && currentQuestion.evidence.length > 0 && (
        <EvidencePanel evidence={currentQuestion.evidence} collapsible={true} maxExcerpts={2} />
      )}

      {/* Main Answer Area (Right-Aligned Bubble) */}
      {step === "main_input" && (
        <form onSubmit={handleMainSubmit} className="space-y-3 pl-8 sm:pl-16">
          <div className="bg-[#151B18] border border-[#2A332D] rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between mono text-xs text-[#647169]">
              <span>YOUR ARCHITECTURAL DEFENSE</span>
              <span>MARKDOWN SUPPORTED</span>
            </div>
            <textarea
              rows={4}
              placeholder="Explain your design rationale, trade-offs, and security safeguards..."
              value={mainAnswerText}
              onChange={(e) => setMainAnswerText(e.target.value)}
              className="w-full bg-[#0D110F] border border-[#2A332D] rounded-lg p-3 text-[#EAE6DC] text-sm focus:outline-none focus:border-[#7C9B7E] transition-colors font-sans resize-none"
            />
            <div className="flex justify-between items-center pt-1">
              <button
                type="button"
                onClick={handleConcludeInterview}
                className="text-xs font-mono text-[#647169] hover:text-[#9BA69D] cursor-pointer"
              >
                End Session & View Scorecard
              </button>
              <button
                type="submit"
                disabled={!mainAnswerText.trim()}
                className="px-5 py-2.5 rounded-lg bg-[#EAE6DC] hover:bg-[#ffffff] disabled:opacity-40 text-[#0D110F] font-semibold text-xs mono tracking-wide transition-all cursor-pointer"
              >
                Submit Answer →
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Main Answer Displayed */}
      {step !== "main_input" && (
        <div className="pl-8 sm:pl-16 space-y-2">
          <div className="bg-[#1B221E] border border-[#2A332D] rounded-xl p-4 text-right space-y-1">
            <div className="mono text-xs text-[#647169]">YOUR RESPONSE</div>
            <p className="text-sm text-[#EAE6DC] text-left leading-relaxed">
              {mainAnswerText}
            </p>
          </div>
        </div>
      )}

      {/* Main Loading State */}
      {step === "main_loading" && (
        <LoadingGrill mode="reviewing-answer" subtitle="Analyzing your response against AST..." />
      )}

      {/* Main Verdict Display & Expected Points */}
      {step === "main_verdict" && mainVerdict && (
        <div className="space-y-4">
          <div
            className={`bg-[#151B18] border-2 ${getVerdictBorderClass(
              mainVerdict
            )} rounded-xl p-5 space-y-3 shadow-lg transition-all`}
          >
            <div className="flex items-center justify-between flex-wrap gap-2">
              <AgentBadge agentId={currentQuestion.agent} size="sm" />
              {getVerdictBadge(mainVerdict)}
            </div>
            <p className="text-sm text-[#9BA69D] font-serif leading-relaxed">
              {mainFeedback}
            </p>
          </div>

          {/* Reveal Expected Points Section after feedback */}
          <ExpectedPointsPanel points={currentQuestion.expected_points} />
        </div>
      )}

      {/* Scripted Follow-up Section (for questions with follow-ups) */}
      {(step === "followup_input" ||
        step === "followup_loading" ||
        step === "followup_verdict") && (
        <div className="space-y-4 pt-4 border-t border-[#212B25]">
          {/* Agent Follow-up Bubble */}
          <div className="bg-[#151B18] border border-[#C68A46]/40 rounded-xl p-5 space-y-2 shadow-md">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <AgentBadge agentId={currentQuestion.agent} size="sm" />
                <span className="mono text-xs text-[#C68A46] font-medium uppercase tracking-wider">
                  SCRIPTED FOLLOW-UP
                </span>
              </div>
              {mainVerdict && getVerdictBadge(mainVerdict)}
            </div>
            <p className="text-[#9BA69D] text-xs font-serif italic mb-2">
              Initial feedback: {mainFeedback}
            </p>
            <p className="text-base text-[#EAE6DC] font-serif leading-relaxed">
              &ldquo;{currentQuestion.followUpQuestion}&rdquo;
            </p>
          </div>

          {/* Follow-up Answer Form */}
          {step === "followup_input" && (
            <form onSubmit={handleFollowUpSubmit} className="space-y-3 pl-8 sm:pl-16">
              <div className="bg-[#151B18] border border-[#2A332D] rounded-xl p-4 space-y-3">
                <div className="mono text-xs text-[#647169]">YOUR FOLLOW-UP RESPONSE</div>
                <textarea
                  rows={3}
                  placeholder="Address the follow-up scenario with specific mitigations..."
                  value={followUpAnswerText}
                  onChange={(e) => setFollowUpAnswerText(e.target.value)}
                  className="w-full bg-[#0D110F] border border-[#2A332D] rounded-lg p-3 text-[#EAE6DC] text-sm focus:outline-none focus:border-[#7C9B7E] transition-colors font-sans resize-none"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!followUpAnswerText.trim()}
                    className="px-5 py-2.5 rounded-lg bg-[#EAE6DC] hover:bg-[#ffffff] disabled:opacity-40 text-[#0D110F] font-semibold text-xs mono tracking-wide transition-all cursor-pointer"
                  >
                    Submit Follow-Up →
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Follow-up Response Displayed */}
          {step !== "followup_input" && (
            <div className="pl-8 sm:pl-16">
              <div className="bg-[#1B221E] border border-[#2A332D] rounded-xl p-4 text-right space-y-1">
                <div className="mono text-xs text-[#647169]">YOUR FOLLOW-UP RESPONSE</div>
                <p className="text-sm text-[#EAE6DC] text-left leading-relaxed">
                  {followUpAnswerText}
                </p>
              </div>
            </div>
          )}

          {/* Follow-up Loading State */}
          {step === "followup_loading" && (
            <LoadingGrill
              mode="reviewing-answer"
              subtitle="Evaluating follow-up mitigation depth..."
            />
          )}

          {/* Follow-up Verdict & Expected Points */}
          {step === "followup_verdict" && followUpVerdict && (
            <div className="space-y-4">
              <div
                className={`bg-[#151B18] border-2 ${getVerdictBorderClass(
                  followUpVerdict
                )} rounded-xl p-5 space-y-3 shadow-lg`}
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <AgentBadge agentId={currentQuestion.agent} size="sm" />
                  {getVerdictBadge(followUpVerdict)}
                </div>
                <p className="text-sm text-[#9BA69D] font-serif leading-relaxed">
                  {followUpFeedback}
                </p>
              </div>

              {/* Reveal Expected Points Section after follow-up verdict */}
              <ExpectedPointsPanel points={currentQuestion.expected_points} />
            </div>
          )}
        </div>
      )}

      {/* AI Decision Panel & Action Controls (Revealed after verdict) */}
      {(step === "main_verdict" || step === "followup_verdict") && (
        <div className="pt-4 space-y-4 border-t border-[#212B25]">
          {/* AI Stopping Decision Banner */}
          <div className="p-4 bg-[#151B18] border border-[#7C9B7E]/50 rounded-xl space-y-1 shadow-md">
            <div className="font-mono text-xs text-[#7C9B7E] font-semibold uppercase tracking-wider flex items-center gap-2">
              <span>🤖 AI AGENT PANEL DECISION</span>
              {aiDecision.shouldStop && (
                <span className="px-2 py-0.5 rounded bg-[#4A5C4C]/40 text-[#7C9B7E] text-[10px]">
                  AUDIT CONCLUDED
                </span>
              )}
            </div>
            <p className="text-xs text-[#EAE6DC] font-serif leading-relaxed">
              {aiDecision.reason}
            </p>
          </div>

          {/* Navigation Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            {!aiDecision.shouldStop ? (
              <>
                <button
                  type="button"
                  onClick={handleConcludeInterview}
                  className="px-4 py-2.5 rounded-lg bg-[#1B221E] hover:bg-[#212B25] border border-[#2A332D] text-[#9BA69D] font-mono text-xs font-semibold cursor-pointer transition-colors"
                >
                  Conclude Interview & View Scorecard
                </button>
                <button
                  type="button"
                  onClick={handleContinueNextQuestion}
                  className="px-6 py-3 rounded-lg bg-[#EAE6DC] hover:bg-[#ffffff] text-[#0D110F] font-semibold text-sm mono tracking-wide shadow-xl transition-all cursor-pointer flex items-center gap-2"
                >
                  <span>Continue to Next Question</span>
                  <span>→</span>
                </button>
              </>
            ) : (
              <div className="w-full flex justify-end">
                <button
                  type="button"
                  onClick={handleConcludeInterview}
                  className="px-8 py-3.5 rounded-lg bg-[#EAE6DC] hover:bg-[#ffffff] text-[#0D110F] font-semibold text-sm mono tracking-wide shadow-2xl transition-all cursor-pointer flex items-center gap-2"
                >
                  <span>View Full Scorecard & Executive Review</span>
                  <span>→</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

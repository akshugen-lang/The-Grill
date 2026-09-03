'use client';
import { useState } from 'react';
import { AnalyzeResponse, Improvement, FixVerificationResponse } from '@/lib/types';
import { Shield, Activity, Lightbulb, Code2, CheckCircle2, XCircle, AlertTriangle, ChevronDown, ChevronUp, Loader2, Zap } from 'lucide-react';

export default function FinalReport({ data }: { data: AnalyzeResponse }) {
  const [verifyingMap, setVerifyingMap] = useState<Record<string, boolean>>({});
  const [verificationResult, setVerificationResult] = useState<Record<string, FixVerificationResponse>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getAgentStyles = (agent: string) => {
    switch(agent) {
      case 'architecture': return { icon: Activity, color: 'text-purple-400', bg: 'bg-purple-500/10' };
      case 'security': return { icon: Shield, color: 'text-blue-400', bg: 'bg-blue-500/10' };
      case 'innovation': return { icon: Lightbulb, color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
      default: return { icon: Activity, color: 'text-gray-400', bg: 'bg-gray-800' };
    }
  };

  const getSeverityStyles = (severity: string) => {
    switch(severity) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-gray-800 text-gray-400 border-gray-700';
    }
  }

  const handleVerify = async (imp: Improvement) => {
    if (!imp.fix_code) return;
    setVerifyingMap(prev => ({ ...prev, [imp.id]: true }));
    
    try {
      const originalCode = data.files.find(f => f.content.includes(imp.code_evidence))?.content || imp.code_evidence;
      
      const res = await fetch('/api/verify-fix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          improvement_id: imp.id,
          original_code: originalCode,
          proposed_fix: imp.fix_code
        })
      });
      const result: FixVerificationResponse = await res.json();
      setVerificationResult(prev => ({ ...prev, [imp.id]: result }));
    } catch (e) {
      console.error(e);
    } finally {
      setVerifyingMap(prev => ({ ...prev, [imp.id]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6 md:p-12 animate-in fade-in duration-700 font-sans">
      <div className="max-w-5xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            Final Verdict
          </h1>
          <p className="text-xl text-gray-400">The panel has concluded its review.</p>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold border-b border-gray-800 pb-2">Proposed Fixes & Improvements</h2>
          {data.improvements.map((imp) => {
            const agentStyle = getAgentStyles(imp.agent);
            const AgentIcon = agentStyle.icon;
            const isExpanded = expandedId === imp.id;
            const vResult = verificationResult[imp.id];
            
            return (
              <div key={imp.id} className="bg-[#15151e] border border-gray-800 rounded-2xl overflow-hidden transition-all shadow-lg hover:shadow-xl">
                <div 
                  className="p-6 cursor-pointer hover:bg-[#1a1a24] flex flex-col md:flex-row md:items-center justify-between gap-4"
                  onClick={() => setExpandedId(isExpanded ? null : imp.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${agentStyle.bg} ${agentStyle.color}`}>
                      <AgentIcon size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-bold text-lg">{imp.area}</h3>
                        <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-md border ${getSeverityStyles(imp.severity)}`}>
                          {imp.severity}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Code2 size={14} /> <span>Evidence found</span>
                        <span className="text-gray-600">•</span>
                        <span className="italic">Confidence: {imp.confidence}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 self-end md:self-center">
                    {vResult && (
                      (vResult.verified ?? vResult.resolved)
                        ? <span className="flex items-center gap-1 text-emerald-400 text-sm font-bold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20"><CheckCircle2 size={16}/> Verified</span>
                        : <span className="flex items-center gap-1 text-red-400 text-sm font-bold bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20"><XCircle size={16}/> Failed Verify</span>
                    )}
                    {isExpanded ? <ChevronUp size={24} className="text-gray-500" /> : <ChevronDown size={24} className="text-gray-500" />}
                  </div>
                </div>
                
                {isExpanded && (
                  <div className="p-6 border-t border-gray-800 bg-[#0d0d12] space-y-8">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                          <Zap size={14} className="text-yellow-400" /> Impact
                        </h4>
                        <p className="text-gray-300 text-sm leading-relaxed">{imp.impact}</p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                          <Lightbulb size={14} className="text-emerald-400" /> Suggestion
                        </h4>
                        <p className="text-gray-300 text-sm leading-relaxed">{imp.suggestion}</p>
                      </div>
                    </div>

                    {imp.code_evidence && (
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Code Evidence</h4>
                        <pre className="bg-[#15151e] p-4 rounded-xl overflow-x-auto text-xs font-mono text-gray-400 border border-gray-800">
                          {imp.code_evidence}
                        </pre>
                      </div>
                    )}

                    {imp.fix_code && (
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Proposed Fix</h4>
                        <pre className="bg-[#15151e] p-4 rounded-xl overflow-x-auto text-xs font-mono text-blue-300 border border-blue-900/30">
                          {imp.fix_code}
                        </pre>
                      </div>
                    )}

                    {imp.verification_steps && imp.verification_steps.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Verification Steps</h4>
                        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-400">
                          {imp.verification_steps.map((step, i) => <li key={i}>{step}</li>)}
                        </ul>
                      </div>
                    )}

                    {imp.fix_code && !vResult && (
                      <div className="pt-4 border-t border-gray-800">
                        <button 
                          onClick={() => handleVerify(imp)}
                          disabled={verifyingMap[imp.id]}
                          className="bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-[0_0_20px_rgba(147,51,234,0.3)] disabled:shadow-none"
                        >
                          {verifyingMap[imp.id] ? <><Loader2 size={18} className="animate-spin" /> Verifying Fix Integrity...</> : <><Shield size={18} /> Verify Fix Integrity</>}
                        </button>
                      </div>
                    )}

                    {vResult && (
                      <div className={`p-5 rounded-xl border ${(vResult.verified ?? vResult.resolved) ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200' : 'bg-red-500/10 border-red-500/30 text-red-200'}`}>
                        <div className="flex gap-3">
                          {(vResult.verified ?? vResult.resolved) ? <CheckCircle2 className="shrink-0 text-emerald-400 mt-0.5" /> : <AlertTriangle className="shrink-0 text-red-400 mt-0.5" />}
                          <p className="text-sm">{vResult.feedback || vResult.remaining_risk}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

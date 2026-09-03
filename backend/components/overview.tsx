'use client';
import { AnalyzeResponse } from '@/lib/types';
import { Star, Shield, Activity, Lightbulb, HeartPulse, FileSearch, ArrowRight, Check, X, AlertTriangle } from 'lucide-react';

export default function Overview({ data, onStartInterview }: { data: AnalyzeResponse; onStartInterview: () => void }) {
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-emerald-400';
    if (score >= 5) return 'text-amber-400';
    return 'text-red-400';
  };

  const healthScore = data.repo_health.health_score;
  const healthColor = healthScore >= 8 
    ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
    : healthScore >= 5 
      ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
      : 'text-red-400 bg-red-500/10 border-red-500/20';

  const BooleanCheck = ({ label, value }: { label: string, value: boolean }) => (
    <div className="flex justify-between items-center text-sm">
      <span className="text-gray-400">{label}</span>
      {value ? <Check size={16} className="text-emerald-400" /> : <X size={16} className="text-red-400" />}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6 md:p-12 font-sans animate-in fade-in duration-700">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-gray-800 pb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2">
              {data.meta.owner} / <span className="text-blue-400">{data.meta.repo}</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl">{data.meta.description || 'No description provided.'}</p>
          </div>
          <div className="flex gap-4 items-center flex-wrap">
            <div className="flex items-center gap-2 bg-[#15151e] border border-gray-800 px-4 py-2 rounded-xl">
              <Star className="text-yellow-500" size={18} />
              <span className="font-bold">{data.meta.stars}</span>
            </div>
            <div className="flex items-center gap-2 bg-[#15151e] border border-gray-800 px-4 py-2 rounded-xl">
              <span className="font-bold">{data.repo_health.source_file_count} Files</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column: Overall Score & Health */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-[#15151e] border border-gray-800 rounded-3xl p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10 pointer-events-none" />
              <h3 className="text-gray-400 font-semibold mb-4 uppercase tracking-wider text-sm z-10">Overall Score</h3>
              <div className={`text-8xl font-black ${getScoreColor(data.overall_score)} z-10`}>
                {data.overall_score}<span className="text-4xl text-gray-600">/10</span>
              </div>
              <p className="mt-6 text-xl font-medium z-10">{data.verdict}</p>
            </div>

            <div className={`border rounded-2xl p-6 ${healthColor}`}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <HeartPulse size={24} />
                  <h3 className="text-xl font-bold">Repo Health</h3>
                </div>
                <span className="font-black text-xl">{healthScore}/10</span>
              </div>
              
              <div className="space-y-3 bg-[#0a0a0f]/50 p-4 rounded-xl border border-white/5">
                <BooleanCheck label="README" value={data.repo_health.has_readme} />
                <BooleanCheck label="Tests" value={data.repo_health.has_tests} />
                <BooleanCheck label="CI Workflow" value={data.repo_health.has_ci} />
                <BooleanCheck label="Lockfile" value={data.repo_health.has_lockfile} />
                <div className="flex justify-between items-center text-sm pt-2 border-t border-white/10">
                  <span className="text-gray-400">TODOs Found</span>
                  <span className="font-bold">{data.repo_health.todo_count}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Category Scores & Coverage */}
          <div className="md:col-span-2 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#15151e] border border-gray-800 rounded-2xl p-6 flex flex-col items-center text-center">
                <Activity className="text-purple-400 mb-4" size={32} />
                <h4 className="text-gray-400 font-medium mb-2">Architecture</h4>
                <div className={`text-4xl font-bold ${getScoreColor(data.category_scores.architecture)}`}>
                  {data.category_scores.architecture}
                </div>
              </div>
              <div className="bg-[#15151e] border border-gray-800 rounded-2xl p-6 flex flex-col items-center text-center">
                <Shield className="text-blue-400 mb-4" size={32} />
                <h4 className="text-gray-400 font-medium mb-2">Security</h4>
                <div className={`text-4xl font-bold ${getScoreColor(data.category_scores.security)}`}>
                  {data.category_scores.security}
                </div>
              </div>
              <div className="bg-[#15151e] border border-gray-800 rounded-2xl p-6 flex flex-col items-center text-center">
                <Lightbulb className="text-emerald-400 mb-4" size={32} />
                <h4 className="text-gray-400 font-medium mb-2">Innovation</h4>
                <div className={`text-4xl font-bold ${getScoreColor(data.category_scores.innovation)}`}>
                  {data.category_scores.innovation}
                </div>
              </div>
            </div>

            <div className="bg-[#15151e] border border-gray-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <FileSearch className="text-blue-400" size={24} />
                  <h3 className="text-xl font-bold">Analysis Coverage</h3>
                </div>
                <div className="text-sm text-gray-400">
                  <span className="text-white font-bold">{data.analysis_coverage.total_files_analyzed}</span> / {data.analysis_coverage.total_candidates} files
                </div>
              </div>

              {data.analysis_coverage.warnings.length > 0 && (
                <div className="mb-6 space-y-2">
                  {data.analysis_coverage.warnings.map((w, i) => (
                    <div key={i} className="flex gap-2 items-start text-amber-400 bg-amber-500/10 p-3 rounded-xl border border-amber-500/20 text-sm">
                      <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                      <p>{w}</p>
                    </div>
                  ))}
                </div>
              )}

              {data.analysis_coverage.skipped_files.length > 0 && (
                <div>
                  <h4 className="text-sm text-gray-500 uppercase tracking-wider mb-3">Skipped Files (Subset)</h4>
                  <div className="flex flex-wrap gap-2">
                    {data.analysis_coverage.skipped_files.map((file, i) => (
                      <span key={i} className="bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded-md border border-gray-700">
                        {file}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-end pt-4">
              <button 
                onClick={onStartInterview}
                className="bg-white text-black px-8 py-4 rounded-xl font-bold flex items-center gap-3 hover:bg-gray-200 transition-colors shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_60px_rgba(255,255,255,0.2)]"
              >
                Face the Panel <ArrowRight size={20} />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

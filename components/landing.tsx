'use client';
import { useState } from 'react';
import { Github, ArrowRight, Activity, Shield, Lightbulb } from 'lucide-react';

export default function Landing({ onAnalyze }: { onAnalyze: (url: string) => void }) {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) onAnalyze(url.trim());
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0f] text-white p-6 relative overflow-hidden">
      {/* Dynamic Background Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[128px] pointer-events-none" />
      
      <div className="z-10 text-center max-w-3xl space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div className="flex justify-center gap-4 mb-6">
          <div className="p-4 bg-purple-500/10 rounded-2xl border border-purple-500/20 text-purple-400">
            <Activity size={32} />
          </div>
          <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20 text-blue-400">
            <Shield size={32} />
          </div>
          <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-400">
            <Lightbulb size={32} />
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-500">
          The Grill
        </h1>
        <p className="text-xl text-gray-400 font-medium">
          An AI Technical Defense System. Paste a public GitHub repository, and face the panel of specialist judges.
        </p>

        <form onSubmit={handleSubmit} className="mt-12 max-w-xl mx-auto w-full relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
          <div className="relative flex items-center bg-[#15151e] rounded-2xl border border-gray-800 p-2 overflow-hidden shadow-2xl">
            <Github className="text-gray-500 ml-4" size={24} />
            <input
              type="url"
              placeholder="https://github.com/owner/repo"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              className="flex-1 bg-transparent border-none outline-none text-white px-4 py-4 placeholder:text-gray-600 text-lg"
            />
            <button 
              type="submit"
              className="bg-white text-black px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-200 transition-colors"
            >
              Analyze <ArrowRight size={20} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

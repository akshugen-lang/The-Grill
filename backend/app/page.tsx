'use client';

import { useState } from 'react';
import Landing from '@/components/landing';
import LoadingPanel from '@/components/loading-panel';
import Overview from '@/components/overview';
import InterviewPanel from '@/components/interview-panel';
import FinalReport from '@/components/final-report';
import { AnalyzeResponse } from '@/lib/types';

export default function Home() {
  const [stage, setStage] = useState<'landing' | 'loading' | 'overview' | 'interview' | 'report'>('landing');
  const [analysisData, setAnalysisData] = useState<AnalyzeResponse | null>(null);

  const handleAnalyze = async (url: string) => {
    setStage('loading');
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl: url }),
      });
      
      const data = await res.json();
      if (data.error) {
        alert("Analysis failed: " + data.message);
        setStage('landing');
        return;
      }
      
      setAnalysisData(data);
      setStage('overview');
    } catch (e) {
      alert("Network error occurred.");
      setStage('landing');
    }
  };

  return (
    <main className="bg-[#0a0a0f] min-h-screen text-white font-sans selection:bg-purple-500/30">
      {stage === 'landing' && <Landing onAnalyze={handleAnalyze} />}
      {stage === 'loading' && <LoadingPanel />}
      {stage === 'overview' && analysisData && (
        <Overview 
          data={analysisData} 
          onStartInterview={() => setStage('interview')} 
        />
      )}
      {stage === 'interview' && analysisData && (
        <InterviewPanel 
          data={analysisData} 
          onFinish={() => setStage('report')} 
        />
      )}
      {stage === 'report' && analysisData && <FinalReport data={analysisData} />}
    </main>
  );
}

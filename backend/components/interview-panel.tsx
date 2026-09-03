'use client';
import { useState, useRef, useEffect } from 'react';
import { AnalyzeResponse, HardQuestion, InterviewResponse } from '@/lib/types';
import { Send, Activity, Shield, Lightbulb, Loader2, Code2, AlertTriangle, CheckCircle2, Target, Crosshair } from 'lucide-react';

export default function InterviewPanel({ data, onFinish }: { data: AnalyzeResponse; onFinish: () => void }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [chatHistory, setChatHistory] = useState<{ role: 'agent' | 'user' | 'system', content: string, agent?: string, missing?: string[], score?: number }[]>([]);
  
  const question = data.hard_questions[currentQuestionIndex];
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (question && chatHistory.length === 0) {
      setChatHistory([{ role: 'agent', content: question.question, agent: question.agent }]);
    }
  }, [question, chatHistory.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  if (!question) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] text-white">
        <button onClick={onFinish} className="bg-white text-black px-8 py-4 rounded-xl font-bold hover:bg-gray-200 transition-colors">
          View Final Report
        </button>
      </div>
    );
  }

  const agentDetails = {
    architecture: { icon: Activity, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/50', name: 'Architecture' },
    security: { icon: Shield, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/50', name: 'Security' },
    innovation: { icon: Lightbulb, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/50', name: 'Innovation' }
  }[question.agent];

  const AgentIcon = agentDetails?.icon || Activity;
  const diffColor = question.difficulty === 'extreme' ? 'text-red-500 bg-red-500/10' : question.difficulty === 'hard' ? 'text-orange-500 bg-orange-500/10' : 'text-yellow-500 bg-yellow-500/10';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim() || isSubmitting) return;

    const userAns = answer.trim();
    setAnswer('');
    setChatHistory(prev => [...prev, { role: 'user', content: userAns }]);
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent: question.agent,
          question: question.question,
          file_reference: question.file_evidence.path,
          why_this_matters: question.why_this_matters,
          code_context: data.files.filter(f => f.path === question.file_evidence.path),
          user_answer: userAns
        })
      });

      const responseData: InterviewResponse = await res.json();
      
      let verdictColor = '';
      if (responseData.verdict === 'weak') verdictColor = 'text-red-400';
      if (responseData.verdict === 'partial') verdictColor = 'text-amber-400';
      if (responseData.verdict === 'strong') verdictColor = 'text-emerald-400';

      setChatHistory(prev => [...prev, { 
        role: 'system', 
        content: `Verdict: ${(responseData.verdict || 'PENDING').toUpperCase()} - ${responseData.feedback}`,
        missing: responseData.missing_points,
        score: responseData.score
      }]);

      if (responseData.follow_up_question) {
        setChatHistory(prev => [...prev, { role: 'agent', content: responseData.follow_up_question!, agent: question.agent }]);
      } else {
        setTimeout(() => {
          if (currentQuestionIndex < data.hard_questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setChatHistory([]); // Reset chat for next question
          } else {
            onFinish();
          }
        }, 4000);
      }
    } catch (error) {
      setChatHistory(prev => [...prev, { role: 'system', content: 'Failed to evaluate answer. Try again.' }]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col md:flex-row h-screen overflow-hidden font-sans">
      
      {/* Left Sidebar: Context */}
      <div className="w-full md:w-1/3 bg-[#111118] border-r border-gray-800 flex flex-col h-1/3 md:h-full z-10 shadow-2xl">
        <div className="p-6 border-b border-gray-800 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-gray-400 uppercase tracking-wider text-xs">Question {currentQuestionIndex + 1} of {data.hard_questions.length}</h3>
            <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase ${diffColor}`}>
              {question.difficulty}
            </span>
          </div>
          
          <div className="flex items-center gap-3">
             <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${agentDetails?.bg} ${agentDetails?.color}`}>
                <AgentIcon size={16} />
              </div>
              <h2 className="font-bold text-lg">{agentDetails?.name} Agent</h2>
          </div>

          <div className="bg-[#1a1a24] p-4 rounded-xl border border-gray-800 space-y-3">
            <div className="flex items-start gap-2 text-gray-300">
              <Code2 size={16} className="shrink-0 mt-1 text-gray-500" />
              <div className="font-mono text-sm break-all">
                {question.file_evidence.path}
                {question.file_evidence.line_range && <span className="text-gray-500">:{question.file_evidence.line_range}</span>}
              </div>
            </div>
            {question.file_evidence.symbol && (
              <div className="flex items-center gap-2 text-gray-400 text-xs font-mono bg-black/20 p-2 rounded-md">
                <Crosshair size={14} className="text-purple-400" /> Symbol: {question.file_evidence.symbol}
              </div>
            )}
          </div>
          
          <div className="space-y-1">
            <h4 className="text-xs uppercase text-gray-500 font-bold tracking-wider flex items-center gap-2">
              <Target size={14} /> Why This Matters
            </h4>
            <p className="text-gray-300 text-sm leading-relaxed">{question.why_this_matters}</p>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto p-6 bg-[#0d0d12]">
           {question.file_evidence.excerpt ? (
              <div className="space-y-2">
                <h4 className="text-xs uppercase text-gray-500 font-bold tracking-wider">Excerpt</h4>
                <pre className="text-xs font-mono text-gray-400 bg-[#15151e] p-4 rounded-xl border border-gray-800 overflow-x-auto">
                  {question.file_evidence.excerpt}
                </pre>
              </div>
           ) : (
             <div className="text-xs font-mono text-gray-500 whitespace-pre-wrap">
               {data.files.find(f => f.path === question.file_evidence.path)?.content || "// No file content found"}
             </div>
           )}
        </div>
      </div>

      {/* Right Area: Chat */}
      <div className="flex-1 flex flex-col h-2/3 md:h-full relative bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-opacity-5">
        
        {/* Chat Messages */}
        <div className="flex-1 overflow-auto p-6 space-y-6">
          {chatHistory.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              
              {msg.role === 'agent' && (
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 shrink-0 ${agentDetails?.bg} ${agentDetails?.color} border ${agentDetails?.border}`}>
                  <AgentIcon size={20} />
                </div>
              )}
              
              <div className={`max-w-xl rounded-2xl p-5 ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-br-none' 
                  : msg.role === 'system'
                    ? 'bg-gray-900 text-gray-300 border border-gray-800 w-full'
                    : 'bg-[#1a1a24] text-gray-100 border border-gray-800 rounded-bl-none shadow-xl'
              }`}>
                {msg.role === 'system' ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-gray-800 pb-3">
                      <div className="font-bold flex items-center gap-2">
                        {msg.content.includes('STRONG') ? <CheckCircle2 className="text-emerald-400" /> : <AlertTriangle className="text-amber-400" />}
                        {msg.content}
                      </div>
                      {msg.score !== undefined && (
                        <div className="bg-black/40 px-3 py-1 rounded-full text-sm font-mono border border-gray-700">
                          Score: <span className={msg.score >= 8 ? 'text-emerald-400' : 'text-amber-400'}>{msg.score}/10</span>
                        </div>
                      )}
                    </div>
                    {msg.missing && msg.missing.length > 0 && (
                      <div className="text-sm">
                        <span className="text-red-400 font-bold block mb-1">Missing Points:</span>
                        <ul className="list-disc pl-5 text-gray-400 space-y-1">
                          {msg.missing.map((m, i) => <li key={i}>{m}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  msg.content
                )}
              </div>
            </div>
          ))}
          {isSubmitting && (
            <div className="flex justify-start">
               <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 shrink-0 ${agentDetails?.bg} ${agentDetails?.color} border ${agentDetails?.border}`}>
                  <Loader2 size={20} className="animate-spin" />
                </div>
                <div className="bg-[#1a1a24] text-gray-400 border border-gray-800 rounded-2xl rounded-bl-none p-5 flex items-center gap-2">
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}} />
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.4s'}} />
                </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-6 bg-[#0a0a0f]/90 backdrop-blur border-t border-gray-800 z-10">
          <form onSubmit={handleSubmit} className="flex gap-4 max-w-4xl mx-auto relative">
            <input
              type="text"
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              placeholder="Defend your code..."
              disabled={isSubmitting}
              className="flex-1 bg-[#15151e] border border-gray-700 rounded-xl px-6 py-4 text-white outline-none focus:border-blue-500 transition-colors disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!answer.trim() || isSubmitting}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 text-white p-4 rounded-xl transition-colors flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(37,99,235,0.3)] disabled:shadow-none"
            >
              <Send size={24} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

'use client';
import { useEffect, useState } from 'react';
import { Activity, Shield, Lightbulb, Loader2 } from 'lucide-react';

export default function LoadingPanel() {
  const [activeAgent, setActiveAgent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveAgent((prev) => (prev + 1) % 4);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const agents = [
    { name: 'Architecture Agent', icon: Activity, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', desc: 'Analyzing code structure & coupling...' },
    { name: 'Security Agent', icon: Shield, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', desc: 'Hunting for vulnerabilities & secrets...' },
    { name: 'Innovation Agent', icon: Lightbulb, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', desc: 'Evaluating creativity & patterns...' },
    { name: 'Lead Judge', icon: Loader2, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', desc: 'Aggregating specialist reports...', spin: true },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0f] text-white p-6 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-800/20 via-[#0a0a0f] to-[#0a0a0f] pointer-events-none" />
      
      <div className="z-10 w-full max-w-2xl space-y-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-4 animate-pulse">
            The Panel is Reviewing...
          </h2>
          <p className="text-gray-400">Fetching repository and generating the final report.</p>
        </div>

        <div className="grid gap-4">
          {agents.map((agent, i) => {
            const isActive = activeAgent === i;
            const Icon = agent.icon;
            return (
              <div 
                key={agent.name}
                className={`flex items-center gap-6 p-6 rounded-2xl border transition-all duration-500 ${
                  isActive 
                    ? `${agent.bg} ${agent.border} shadow-[0_0_30px_rgba(0,0,0,0.3)] scale-[1.02]` 
                    : 'bg-[#15151e] border-gray-800 opacity-50 scale-100'
                }`}
              >
                <div className={`p-4 rounded-xl ${isActive ? `${agent.bg} ${agent.color}` : 'bg-gray-800 text-gray-500'}`}>
                  <Icon size={28} className={agent.spin && isActive ? 'animate-spin' : ''} />
                </div>
                <div>
                  <h3 className={`text-xl font-bold ${isActive ? 'text-white' : 'text-gray-500'}`}>
                    {agent.name}
                  </h3>
                  <p className={isActive ? 'text-gray-300' : 'text-gray-600'}>
                    {agent.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

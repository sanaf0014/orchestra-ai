import React, { useState } from 'react';
import { CashflowPoint } from '../types';
import { generateForecastAI } from '../services/geminiService';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Sparkles, Play, RotateCcw, TrendingUp, Plus, Zap, Download } from 'lucide-react';

interface ForecastingProps {
  history: CashflowPoint[];
}

const QUICK_SCENARIOS = [
  "Hire a Sales Manager ($8k/mo)",
  "Revenue drops by 20%",
  "Add 3 new clients ($5k MRR)",
  "Cut software costs by 15%"
];

export const Forecasting: React.FC<ForecastingProps> = ({ history }) => {
  const [scenario, setScenario] = useState('');
  const [forecastData, setForecastData] = useState<CashflowPoint[]>(history);
  const [explanation, setExplanation] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleSimulate = async () => {
    if (!scenario.trim()) return;
    setLoading(true);
    
    const result = await generateForecastAI(history, scenario);
    const combined = [...history, ...result.data.filter(d => d.projected)];
    
    setForecastData(combined);
    setExplanation(result.explanation);
    setLoading(false);
  };

  const handleReset = () => {
    setForecastData(history);
    setExplanation('');
    setScenario('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-140px)] animate-fade-in-up">
      {/* Controls */}
      <div className="bg-surface p-6 rounded-2xl border border-white/5 shadow-lg flex flex-col overflow-y-auto">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2 font-display">
            <Sparkles className="text-accent" size={24} />
            Scenario Lab
          </h2>
          <p className="text-sm text-slate-400 mt-2 font-body">
            Use AI to simulate future business events and visualize impact on runway.
          </p>
        </div>

        <div className="flex-1 space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-3 font-accent">Simulation Parameters</label>
            <textarea
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
              className="w-full p-4 bg-[#181A20] border border-white/10 text-white rounded-xl focus:ring-2 focus:ring-accent/20 focus:border-accent text-sm min-h-[120px] resize-none shadow-inner transition-all font-body placeholder-slate-600"
              placeholder="e.g. Hiring 3 engineers in November..."
            ></textarea>
            
            {/* Quick Start Chips */}
            <div className="mt-4">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-3 font-accent">Presets</p>
                <div className="flex flex-wrap gap-2">
                    {QUICK_SCENARIOS.map((s) => (
                        <button 
                            key={s}
                            onClick={() => setScenario(s)}
                            className="flex items-center gap-2 text-xs bg-white/5 hover:bg-accent hover:text-white border border-white/5 hover:border-accent text-slate-400 px-4 py-2 rounded-full transition-all shadow-sm hover:shadow-[0_0_15px_rgba(127,97,231,0.4)] font-accent"
                        >
                            <Plus size={12} />
                            {s}
                        </button>
                    ))}
                </div>
            </div>
          </div>
          
          <div className="flex gap-3 pt-4 border-t border-white/5">
            <button 
              onClick={handleSimulate}
              disabled={loading || !scenario}
              className="flex-1 bg-accent hover:bg-accentLight text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(127,97,231,0.3)] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-accent"
            >
              {loading ? (
                <>Simulating...</>
              ) : (
                <>
                  <Play size={16} fill="currentColor" /> Run Model
                </>
              )}
            </button>
            <button 
              onClick={handleReset}
              className="px-4 py-3 border border-white/10 hover:bg-white/5 text-slate-400 hover:text-white rounded-xl transition-colors"
              title="Reset to Baseline"
            >
              <RotateCcw size={18} />
            </button>
          </div>

          {explanation && (
            <div className="mt-6 p-5 bg-accent/10 rounded-xl border border-accent/20 animate-fade-in-up relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Zap size={48} className="text-accent" />
              </div>
              <h4 className="text-accentLight font-bold text-sm mb-2 flex items-center gap-2 font-display">
                <TrendingUp size={16} />
                Projected Outcome
              </h4>
              <p className="text-sm text-slate-200 leading-relaxed relative z-10 font-body">
                {explanation}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Visualization */}
      <div className="lg:col-span-2 bg-surface p-8 rounded-2xl border border-white/5 shadow-lg flex flex-col relative overflow-hidden">
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
             <div>
                <h3 className="text-xl font-bold text-white font-display">Forecast Visualization</h3>
                <p className="text-sm text-slate-400 font-body">Baseline vs Simulated Scenario</p>
             </div>
             <div className="flex items-center gap-3">
                {forecastData.some(d => d.projected) && (
                    <button className="flex items-center gap-2 text-xs font-bold text-slate-300 border border-white/10 bg-white/5 px-3 py-2 rounded-lg hover:text-white hover:bg-white/10 transition-colors font-accent">
                        <Download size={14} /> Export Scenario
                    </button>
                )}
                <div className="flex items-center gap-4 text-sm bg-white/5 px-4 py-2 rounded-lg border border-white/5">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-accent rounded-full shadow-[0_0_8px_rgba(127,97,231,0.5)]"></div>
                        <span className="font-medium text-slate-300 font-accent">Net Balance</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500/50 rounded-full"></div>
                        <span className="font-medium text-slate-300 font-accent">Expenses</span>
                    </div>
                </div>
             </div>
        </div>
        
        <div className="flex-1 min-h-[300px] relative z-10">
           <ResponsiveContainer width="100%" height="100%">
             <AreaChart data={forecastData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                    <linearGradient id="colorBalanceFore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7F61E7" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#7F61E7" stopOpacity={0}/>
                    </linearGradient>
                </defs>
               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2F333C" />
               <XAxis dataKey="month" axisLine={false} tickLine={false} stroke="#9CA3AF" fontSize={12} fontWeight={500} dy={10} />
               <YAxis axisLine={false} tickLine={false} stroke="#9CA3AF" fontSize={12} fontWeight={500} tickFormatter={(val) => `$${val/1000}k`} />
               <Tooltip 
                 contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: '#181A20', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)' }}
                 itemStyle={{ color: '#fff' }}
                 formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
               />
               <Area 
                 type="monotone" 
                 dataKey="balance" 
                 name="Net Balance" 
                 stroke="#7F61E7" 
                 strokeWidth={4} 
                 fill="url(#colorBalanceFore)" 
                 animationDuration={1500}
               />
               <Area 
                 type="monotone" 
                 dataKey="expenses" 
                 name="Expenses"
                 stroke="#ef4444" 
                 strokeWidth={2} 
                 fillOpacity={0}
                 strokeDasharray="5 5"
                 animationDuration={1500}
               />
             </AreaChart>
           </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
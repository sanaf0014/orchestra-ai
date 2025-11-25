import React, { useState } from 'react';
import { Transaction, TransactionStatus, TransactionType } from '../types';
import { analyzeTransactionsAI } from '../services/geminiService';
import { Check, X, BrainCircuit, AlertOctagon, Search, Filter, Loader2 } from 'lucide-react';

interface TransactionsProps {
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
}

export const Transactions: React.FC<TransactionsProps> = ({ transactions, setTransactions }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [filter, setFilter] = useState('');

  const handleAICategorize = async () => {
    setIsAnalyzing(true);
    const toAnalyze = transactions.slice(0, 10);
    
    const analyzed = await analyzeTransactionsAI(toAnalyze);
    
    const updatedTransactions = transactions.map(t => {
      const analysis = analyzed.find((a: any) => a.id === t.id);
      return analysis ? { ...t, ...analysis, status: TransactionStatus.COMPLETED } : t;
    });

    setTransactions(updatedTransactions);
    setIsAnalyzing(false);
  };

  const filteredTransactions = transactions.filter(t => 
    t.description.toLowerCase().includes(filter.toLowerCase()) || 
    t.category.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="bg-surface rounded-xl border border-white/5 shadow-sm flex flex-col h-[calc(100vh-140px)]">
      <div className="p-6 border-b border-white/5 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-white font-display">Transaction Ledger</h2>
          <p className="text-sm text-slate-400 font-body">Manage and categorize incoming bank feeds</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={16} />
            <input 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              type="text" 
              placeholder="Filter..." 
              className="pl-10 pr-4 py-2 bg-[#181A20] border border-white/10 rounded-lg text-sm text-white focus:ring-2 focus:ring-accent focus:border-transparent outline-none placeholder-slate-600 font-body"
            />
          </div>
          <button 
            onClick={handleAICategorize}
            disabled={isAnalyzing}
            className="flex items-center gap-2 bg-accent hover:bg-accentLight text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-[0_0_15px_rgba(127,97,231,0.3)] font-accent"
          >
            {isAnalyzing ? <Loader2 className="animate-spin" size={16} /> : <BrainCircuit size={16} />}
            AI Audit & Categorize
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#181A20] sticky top-0 z-10">
            <tr>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider font-accent">Date</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider font-accent">Description</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider font-accent">Amount</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider font-accent">Category</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider font-accent">Risk</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider font-accent">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 bg-surface">
            {filteredTransactions.map((t) => (
              <tr key={t.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 text-sm text-slate-400 whitespace-nowrap font-body">{t.date}</td>
                <td className="px-6 py-4 text-sm font-medium text-white font-body">{t.description}</td>
                <td className={`px-6 py-4 text-sm font-bold font-body ${t.type === TransactionType.INCOME ? 'text-emerald-400' : 'text-slate-200'}`}>
                  {t.type === TransactionType.INCOME ? '+' : '-'}${Math.abs(t.amount).toLocaleString()}
                </td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium border font-accent ${
                    t.category === 'Uncategorized' 
                      ? 'bg-white/5 text-slate-400 border-white/10' 
                      : 'bg-accent/10 text-accentLight border-accent/20'
                  }`}>
                    {t.category}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {t.riskScore && t.riskScore > 50 ? (
                     <div className="group relative flex items-center">
                       <span className="flex items-center gap-1 text-red-400 bg-red-500/10 px-2 py-1 rounded text-xs font-bold border border-red-500/20 cursor-help font-accent">
                         <AlertOctagon size={12} />
                         {t.riskScore}/100
                       </span>
                       <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 bg-black border border-white/10 text-white text-xs p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 shadow-xl">
                         {t.riskReason || "High risk transaction detected"}
                       </div>
                     </div>
                  ) : (
                    <span className="text-emerald-400 text-xs font-bold bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20 font-accent">Low</span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm">
                   {t.status === TransactionStatus.COMPLETED ? (
                     <Check size={16} className="text-emerald-500" />
                   ) : (
                     <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" title="Pending" />
                   )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
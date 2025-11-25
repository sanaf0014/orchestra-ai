import React, { useState } from 'react';
import { IntegrationStatus } from '../types';
import { RefreshCw, CheckCircle, AlertCircle, Database, Plus, UploadCloud, FileSpreadsheet, Landmark, DollarSign } from 'lucide-react';

interface IntegrationsProps {
  status: IntegrationStatus[];
  onImportData: () => void;
}

export const Integrations: React.FC<IntegrationsProps> = ({ status, onImportData }) => {
  const [integrations, setIntegrations] = useState(status);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'success'>('idle');

  const handleSync = (name: string) => {
    setSyncing(name);
    setTimeout(() => {
      setIntegrations(prev => prev.map(i => 
        i.name === name ? { ...i, lastSynced: 'Just now', status: 'connected' } : i
      ));
      onImportData();
      setSyncing(null);
    }, 2000);
  };

  const handleFileUpload = () => {
    setUploadState('uploading');
    setTimeout(() => {
        setUploadState('success');
        onImportData();
        setTimeout(() => setUploadState('idle'), 3000);
    }, 1500);
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* Quick Connect Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white font-display">Data Connections</h2>
        <p className="text-slate-400 mt-2 font-body">Orchestra AI unifies your financial stack. Connect once, sync forever.</p>
      </div>

      {/* Main Integration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Manual Upload / Google Sheets */}
        <div className="bg-surface p-8 rounded-xl border border-white/5 shadow-lg flex flex-col items-center text-center hover:border-accent transition-colors cursor-pointer group" onClick={handleFileUpload}>
           <div className={`w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${uploadState === 'uploading' ? 'animate-bounce' : ''}`}>
              {uploadState === 'success' ? <CheckCircle className="text-emerald-500" size={32} /> : <UploadCloud className="text-accent" size={32} />}
           </div>
           <h3 className="text-lg font-bold text-white font-display">Upload Transactions</h3>
           <p className="text-sm text-slate-400 mt-2 mb-6 font-body">Drag & drop CSV, Excel, or connect Google Sheets</p>
           <button className="w-full py-2 border border-white/10 rounded-lg text-sm font-medium text-slate-300 hover:bg-white/5 transition-colors font-accent">
             {uploadState === 'success' ? 'Data Processed!' : 'Select File'}
           </button>
        </div>

         {/* Bank Connect */}
         <div className="bg-surface p-8 rounded-xl border border-white/5 shadow-lg flex flex-col items-center text-center hover:border-emerald-500/50 transition-colors cursor-pointer group">
           <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Landmark className="text-emerald-500" size={32} />
           </div>
           <h3 className="text-lg font-bold text-white font-display">Live Bank Feed</h3>
           <p className="text-sm text-slate-400 mt-2 mb-6 font-body">Securely connect via Plaid or Teller</p>
           <button className="w-full py-2 bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 rounded-lg text-sm font-medium hover:bg-emerald-600/30 transition-colors font-accent">
             Connect Bank Account
           </button>
        </div>
      </div>

      {/* Existing Connections List */}
      <div className="bg-surface rounded-xl border border-white/5 shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
            <h3 className="font-bold text-slate-200 font-display">Active Pipelines</h3>
            <span className="text-xs text-slate-500 bg-white/5 px-2 py-1 rounded border border-white/5 font-accent">Auto-sync: ON</span>
        </div>
        <div className="divide-y divide-white/5">
          {integrations.map((int) => (
            <div key={int.name} className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#181A20] border border-white/5 flex items-center justify-center shadow-sm">
                  {int.type === 'BANK' ? <Landmark size={18} className="text-slate-400"/> : int.type === 'STRIPE' ? <DollarSign size={18} className="text-accent"/> : <FileSpreadsheet size={18} className="text-emerald-500"/>}
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm font-body">{int.name}</h3>
                  <p className="text-xs text-slate-500 font-accent">Last Synced: {int.lastSynced}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full font-accent ${
                  int.status === 'connected' ? 'bg-emerald-500/10 text-emerald-400' : 
                  int.status === 'error' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'
                }`}>
                  {int.status === 'connected' ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                  {int.status.toUpperCase()}
                </div>
                
                <button 
                  onClick={() => handleSync(int.name)}
                  disabled={syncing === int.name}
                  className="p-2 text-slate-500 hover:text-accent hover:bg-white/5 rounded-full transition-all disabled:animate-spin"
                  title="Force Sync"
                >
                  <RefreshCw size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
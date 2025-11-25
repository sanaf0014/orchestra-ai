import React, { useEffect, useState } from 'react';
import { ArrowUpRight, ArrowDownRight, DollarSign, AlertTriangle, TrendingUp, Share2, Sparkles, Eye, EyeOff, FileText, Rocket, X, CheckCircle2, Circle, HelpCircle, Lightbulb, Copy, Send, ShieldCheck, Search, Zap, Info, Check, Mail, MessageSquare, FileDown, FileSpreadsheet, PlayCircle, Clock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, Brush } from 'recharts';
import { CashflowPoint, Alert, Transaction, TransactionType } from '../types';
import { generateExecutiveSummary, generateInvestorReport, generateStrategicActions } from '../services/geminiService';

interface DashboardProps {
  cashflowData: CashflowPoint[];
  alerts: Alert[];
  metrics: {
    balance: number;
    monthlyBurn: number;
    runway: number;
  };
  isDemoMode?: boolean;
  onResolveAlert?: (id: string) => void;
}

// Simplified Explanations for New Business Owners
const METRIC_DEFINITIONS = {
    discover: {
        title: "Total Cash",
        subtitle: "Money in Bank",
        description: "This is the total amount of actual money you have available in your accounts right now to spend.",
        action: "View Transactions"
    },
    predict: {
        title: "Time Left",
        subtitle: "Survival Time",
        description: "Based on your current spending, this is how long your business can survive before running out of money.",
        action: "See Forecast"
    },
    fix: {
        title: "Action Items",
        subtitle: "Risks & Fixes",
        description: "These are urgent issues like late payments or unusual spending that you need to look at immediately.",
        action: "Resolve Issues"
    },
    guard: {
        title: "Health Score",
        subtitle: "Overall Status",
        description: "A simple score out of 100 showing how safe your business is. Higher is better.",
        action: "View Details"
    }
};

const MetricTooltip = ({ definition }: { definition: any }) => (
  <div className="group relative inline-block ml-2 z-10">
    <HelpCircle size={16} className="text-slate-500 cursor-help hover:text-accent transition-colors" />
    <div className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 bg-[#25262B] border border-white/10 text-slate-200 text-sm p-4 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-50 pointer-events-none shadow-xl font-normal leading-relaxed">
       <h5 className="font-bold text-white mb-1">{definition.title}</h5>
       <p className="text-slate-400 text-xs">{definition.description}</p>
    </div>
  </div>
);

const TourGuide = ({ step, onDismiss }: { step: 'welcome' | 'action' | 'resolve' | 'done', onDismiss: () => void }) => {
    if (step === 'done') return null;
    
    return (
        <div className={`fixed z-[100] p-6 bg-accent text-white rounded-2xl shadow-[0_0_40px_rgba(127,97,231,0.6)] max-w-sm animate-fade-in-up border border-white/20
            ${step === 'welcome' ? 'top-24 right-8' : 
              step === 'action' ? 'top-48 left-1/2 -translate-x-1/2' : 
              'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'}`}>
            <div className="flex items-start gap-4">
                <div className="bg-white/20 p-2 rounded-full shrink-0">
                    <PlayCircle size={24} className="fill-white text-accent" />
                </div>
                <div>
                    <h4 className="font-bold text-lg font-display mb-1">
                        {step === 'welcome' ? "Founder Crisis Mode" : 
                         step === 'action' ? "Spotting the Risk" : "The Fix"}
                    </h4>
                    <p className="text-sm text-white/90 leading-relaxed font-body mb-4">
                        {step === 'welcome' ? "Imagine you're Lisa. Your cash is dropping fast. Let's find out why." :
                         step === 'action' ? "See that red alert? Click 'Action Items' to see what the AI found." :
                         "Here is the problem: An unknown vendor charge. Click 'Resolve' to fix it instantly."}
                    </p>
                    {step === 'welcome' && (
                        <button onClick={onDismiss} className="text-xs font-bold bg-white text-accent px-4 py-2 rounded-lg hover:bg-white/90 transition-colors">
                            Okay, show me
                        </button>
                    )}
                </div>
            </div>
            {/* Arrow pointer */}
            <div className={`absolute w-4 h-4 bg-accent transform rotate-45 border-r border-b border-white/20
                ${step === 'welcome' ? '-top-2 right-10 border-none bg-accent' : 
                  step === 'action' ? 'top-full left-1/2 -translate-x-1/2' : 'hidden'}`} 
            />
        </div>
    )
}

const PillarCard = ({ title, subtitle, icon: Icon, colorClass, active, onClick, children, showTooltip }: any) => (
    <button 
        onClick={onClick}
        className={`relative flex flex-col p-5 rounded-2xl border transition-all duration-500 ease-out text-left group w-full overflow-hidden
        ${active 
            ? 'bg-surface border-accent/50 shadow-[0_0_30px_rgba(127,97,231,0.15)] scale-100' 
            : 'bg-surface border-white/5 hover:border-white/10 hover:shadow-lg hover:-translate-y-1 opacity-90 hover:opacity-100'
        }`}
    >
        {active && <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent pointer-events-none"></div>}

        <div className="flex justify-between items-start w-full mb-3 relative z-10">
            <div className={`p-2.5 rounded-xl transition-colors duration-300 ${active ? `bg-accent/20 text-accent` : 'bg-white/5 text-slate-400 group-hover:text-slate-200'}`}>
                <Icon size={20} />
            </div>
            <div className="flex items-center gap-2">
                 {/* Jargon Buster Icon */}
                 {showTooltip && (
                    <div onClick={(e) => { e.stopPropagation(); }} title="What does this mean?">
                        <MetricTooltip definition={showTooltip} />
                    </div>
                 )}
                {active && <span className="flex h-2.5 w-2.5 relative">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75`}></span>
                    <span className={`relative inline-flex rounded-full h-2.5 w-2.5 bg-accent`}></span>
                </span>}
            </div>
        </div>
        <div className="space-y-1 relative z-10">
            <h3 className={`font-bold text-xl font-display transition-colors ${active ? 'text-white' : 'text-slate-200'}`}>{title}</h3>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider font-accent">{subtitle}</p>
        </div>
        <div className="mt-4 w-full relative z-10">
            {children}
        </div>
    </button>
);

// Mock Data for Recent Transactions Preview (Since App.tsx holds state, we'll simulate for the dashboard view or accept props)
// For now, let's use a static mock preview that matches the vibe, as we want to populate the 'empty' dashboard
const RECENT_ACTIVITY_MOCK = [
    { id: 1, name: "Stripe Settlement", amount: 12500, type: "in", date: "Today, 9:41 AM" },
    { id: 2, name: "AWS Services", amount: 2400, type: "out", date: "Yesterday" },
    { id: 3, name: "Gusto Payroll", amount: 68000, type: "out", date: "Oct 22" },
];

export const Dashboard: React.FC<DashboardProps> = ({ cashflowData, alerts, metrics, isDemoMode, onResolveAlert }) => {
  const [aiInsight, setAiInsight] = useState<string>("Analyzing financial data...");
  const [strategicActions, setStrategicActions] = useState<any[]>([]);
  const [privacyMode, setPrivacyMode] = useState(false);
  const [activePillar, setActivePillar] = useState<'discover' | 'predict' | 'fix' | 'guard'>('discover');
  
  const [resolvedAlertIds, setResolvedAlertIds] = useState<string[]>([]);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportContent, setReportContent] = useState("");
  const [showOnboarding, setShowOnboarding] = useState(true);
  
  // Demo State
  const [demoStep, setDemoStep] = useState<'welcome' | 'action' | 'resolve' | 'done'>('welcome');

  useEffect(() => {
    const fetchInsight = async () => {
      const summary = await generateExecutiveSummary(metrics.balance, metrics.monthlyBurn, metrics.runway, alerts);
      setAiInsight(summary);
      const actions = await generateStrategicActions([]); 
      setStrategicActions(actions);
    };
    fetchInsight();
  }, [alerts, metrics]);

  // Demo Logic Flow
  useEffect(() => {
      if (!isDemoMode) {
          setDemoStep('done');
          return;
      }
      
      // If we are in demo mode and user clicks 'fix' tab, advance step
      if (activePillar === 'fix' && demoStep === 'action') {
          setDemoStep('resolve');
      }
  }, [activePillar, isDemoMode]);

  const formatCurrency = (val: number) => {
    if (privacyMode) return '•••••••';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  };

  const handleGenerateReport = async () => {
    setShowReportModal(true);
    setIsGeneratingReport(true);
    setReportContent("");
    const report = await generateInvestorReport(metrics, cashflowData);
    setReportContent(report);
    setIsGeneratingReport(false);
  };

  const handleResolveAlertClick = (id: string) => {
    setResolvedAlertIds(prev => [...prev, id]);
    if (onResolveAlert) onResolveAlert(id);
    if (isDemoMode) setDemoStep('done');
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#181A20] border border-white/10 p-4 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-50 min-w-[180px]">
          <p className="text-slate-400 text-xs mb-1.5 font-accent uppercase tracking-wider">{label}</p>
          <p className="text-white text-2xl font-bold font-display leading-none mb-1">
            {privacyMode ? '****' : `$${payload[0].value.toLocaleString()}`}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-2 h-2 rounded-full bg-accent"></div>
            <p className="text-xs text-accent font-medium">Net Balance</p>
          </div>
          {payload[0].payload.projected && (
             <span className="mt-2 inline-block px-2 py-0.5 bg-white/5 rounded text-[10px] text-slate-400 border border-white/5 font-accent uppercase tracking-wide">Forecast</span>
          )}
        </div>
      );
    }
    return null;
  };

  const activeDef = METRIC_DEFINITIONS[activePillar];
  const activeAlertsCount = alerts.filter(a => !a.resolved && !resolvedAlertIds.includes(a.id)).length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-24 relative">
      
      {/* Demo Overlay */}
      {isDemoMode && <TourGuide step={demoStep} onDismiss={() => setDemoStep('action')} />}

      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 animate-slide-down">
        <div>
           <h1 className="text-4xl font-bold text-white tracking-tight font-display">Command Center</h1>
           <p className="text-slate-400 mt-1 text-base font-body">Good afternoon, Alex. Financial pulse is stable.</p>
        </div>
        <div className="flex gap-3">
            <button 
              onClick={() => setPrivacyMode(!privacyMode)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-300 bg-surface border border-white/10 rounded-xl hover:bg-white/5 transition-all shadow-sm"
            >
              {privacyMode ? <EyeOff size={16} /> : <Eye size={16} />}
              {privacyMode ? 'Hidden' : 'Visible'}
            </button>
            <button 
              onClick={handleGenerateReport}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-accent to-accentLight rounded-xl hover:opacity-90 transition-all shadow-[0_0_20px_rgba(127,97,231,0.3)] hover:-translate-y-0.5"
            >
              <Share2 size={16} />
              Export Report
            </button>
        </div>
      </div>

      {/* Onboarding Banner */}
      {showOnboarding && !isDemoMode && (
        <div className="bg-gradient-to-r from-accent/20 to-accentLight/5 border border-accent/20 rounded-2xl p-1 relative overflow-hidden shadow-sm animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="bg-surface/60 backdrop-blur-sm p-5 rounded-xl flex flex-col md:flex-row gap-6 items-center relative z-10">
                <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center text-accent shrink-0 animate-pulse-soft">
                    <Rocket size={24} />
                </div>
                <div className="flex-1">
                    <h3 className="text-base font-bold text-white font-display">Welcome to Orchestra AI</h3>
                    <p className="text-slate-400 text-sm font-body">Your AI CFO is ready. We've connected your demo data.</p>
                </div>
                 <button onClick={() => setShowOnboarding(false)} className="absolute top-2 right-2 p-2 text-slate-500 hover:text-white rounded-full hover:bg-white/5 transition-colors"><X size={18}/></button>
            </div>
        </div>
      )}

      {/* The 4 Pillars Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <PillarCard 
            title={formatCurrency(metrics.balance)} 
            subtitle="Total Cash" 
            icon={DollarSign} 
            active={activePillar === 'discover'}
            onClick={() => setActivePillar('discover')}
            showTooltip={METRIC_DEFINITIONS.discover}
        >
            <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden mt-2">
                <div className="h-full bg-emerald-500 w-3/4 rounded-full"></div>
            </div>
            <p className="text-xs text-emerald-400 mt-2 font-medium flex items-center gap-1"><ArrowUpRight size={12}/> +12% vs last month</p>
        </PillarCard>

        <PillarCard 
            title={`${metrics.runway.toFixed(1)} Months`}
            subtitle="Time Left" 
            icon={TrendingUp} 
            active={activePillar === 'predict'}
            onClick={() => setActivePillar('predict')}
            showTooltip={METRIC_DEFINITIONS.predict}
        >
             <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden mt-2">
                <div className={`h-full rounded-full transition-all duration-1000 ${metrics.runway < 6 ? 'bg-red-500 w-1/4' : 'bg-accent w-2/3'}`}></div>
            </div>
            <p className="text-xs text-slate-400 mt-2 font-medium">Before cash runs out</p>
        </PillarCard>

        <PillarCard 
            title={`${activeAlertsCount} Issues`}
            subtitle="Action Items" 
            icon={Zap} 
            active={activePillar === 'fix'}
            onClick={() => setActivePillar('fix')}
            showTooltip={METRIC_DEFINITIONS.fix}
        >
            <div className="flex -space-x-2 mt-2">
                {[1,2,3].slice(0, activeAlertsCount).map(i => <div key={i} className="w-6 h-6 rounded-full bg-slate-600 border-2 border-[#25262B]"></div>)}
            </div>
            <p className="text-xs text-highlight mt-2 font-medium">Needs attention</p>
        </PillarCard>

        <PillarCard 
            title="94/100"
            subtitle="Health Score" 
            icon={ShieldCheck} 
            active={activePillar === 'guard'}
            onClick={() => setActivePillar('guard')}
            showTooltip={METRIC_DEFINITIONS.guard}
        >
             <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden mt-2">
                <div className="h-full bg-blue-500 w-[94%] rounded-full"></div>
            </div>
            <p className="text-xs text-blue-400 mt-2 font-medium">Business is healthy</p>
        </PillarCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
        
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
            
            {activePillar === 'fix' ? (
                // --- ACTION CENTER VIEW ---
                <div className="bg-surface rounded-2xl border border-white/5 shadow-lg overflow-hidden min-h-[400px]">
                     <div className="p-6 border-b border-white/5 flex justify-between items-center">
                         <div>
                            <h3 className="text-xl font-bold text-white font-display flex items-center gap-2">
                                <Zap className="text-highlight" /> Resolution Center
                            </h3>
                            <p className="text-slate-400 text-sm font-body mt-1">
                                {activeAlertsCount > 0 
                                    ? "We found critical items that need your approval." 
                                    : "Great job! No urgent issues found."}
                            </p>
                         </div>
                         <div className="text-xs font-bold bg-white/5 px-3 py-1 rounded-full border border-white/5 font-accent">
                             {activeAlertsCount} Active
                         </div>
                     </div>

                     <div className="p-6 space-y-4">
                         {alerts.filter(a => !a.resolved && !resolvedAlertIds.includes(a.id)).map((alert) => (
                             <div key={alert.id} className="bg-[#181A20] border border-red-500/20 rounded-xl p-5 flex flex-col md:flex-row gap-5 items-start md:items-center animate-fade-in-up hover:border-red-500/40 transition-colors">
                                 <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center shrink-0">
                                     <AlertTriangle size={24} />
                                 </div>
                                 <div className="flex-1">
                                     <h4 className="text-white font-bold text-base mb-1 font-display">{alert.message}</h4>
                                     <p className="text-slate-400 text-sm leading-relaxed font-body mb-2">
                                         <span className="text-highlight font-bold">Why it matters:</span> This amount is significantly higher than your average vendor payment of $2,400.
                                     </p>
                                     <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-3">
                                        <div className="flex items-center gap-3 text-xs text-slate-500 font-accent">
                                            <span>Detected: {alert.date}</span>
                                            <span>•</span>
                                            <span className="text-red-400">Impact: High</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-accent uppercase tracking-wider bg-white/5 px-2 py-1 rounded-full border border-white/5">
                                            <span>Notifying:</span>
                                            <span className="flex items-center gap-1 text-slate-300"><Mail size={10}/> Admin</span>
                                            <span className="flex items-center gap-1 text-slate-300"><MessageSquare size={10}/> WhatsApp</span>
                                        </div>
                                     </div>
                                 </div>
                                 <div className="flex gap-3 w-full md:w-auto">
                                     <button className="flex-1 md:flex-none py-2.5 px-4 border border-white/10 rounded-lg text-slate-300 text-sm font-medium hover:bg-white/5 hover:text-white transition-colors font-accent">
                                         View Details
                                     </button>
                                     <button 
                                        onClick={() => handleResolveAlertClick(alert.id)}
                                        className="flex-1 md:flex-none py-2.5 px-4 bg-highlight text-white rounded-lg text-sm font-bold hover:bg-highlightPink transition-colors shadow-lg shadow-highlight/20 font-accent flex items-center justify-center gap-2 relative overflow-hidden"
                                     >
                                         <span className="relative z-10 flex items-center gap-2">
                                             <CheckCircle2 size={16} /> Resolve
                                         </span>
                                         {/* Shimmer effect */}
                                         <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] animate-[shimmer_2s_infinite]"></div>
                                     </button>
                                 </div>
                             </div>
                         ))}

                         {activeAlertsCount === 0 && (
                             <div className="flex flex-col items-center justify-center py-12 text-center">
                                 <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 mb-4">
                                     <CheckCircle2 size={40} />
                                 </div>
                                 <h3 className="text-white font-bold text-xl mb-2 font-display">All Clear!</h3>
                                 <p className="text-slate-400 max-w-md font-body">You've resolved all urgent action items. Your financial health score is optimized.</p>
                             </div>
                         )}
                     </div>
                </div>
            ) : (
                // --- DEFAULT CHART VIEW ---
                <>
                <div className="bg-surface p-8 rounded-2xl border border-white/5 shadow-lg relative overflow-hidden group">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-xl font-bold text-white font-display flex items-center gap-3">
                                {activePillar === 'discover' && 'Cashflow Trends'}
                                {activePillar === 'predict' && 'Spending Forecast'}
                                {activePillar === 'guard' && 'Security Monitor'}
                                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-[10px] font-bold text-red-500 uppercase tracking-wider font-accent">
                                    <span className="relative flex h-1.5 w-1.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
                                    </span>
                                    Live
                                </span>
                            </h3>
                            <p className="text-slate-400 text-sm font-accent">Real-time visualization</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="bg-white/5 rounded-lg px-3 py-1.5 text-xs text-slate-400 border border-white/5 font-accent">
                                Drag slider to Zoom
                            </div>
                        </div>
                    </div>

                    <div className="h-80 w-full relative z-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={cashflowData} margin={{ bottom: 20 }}>
                            <defs>
                                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#7F61E7" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#7F61E7" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2F333C" />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12, fontFamily: 'Manrope'}} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12, fontFamily: 'Manrope'}} tickFormatter={(val) => `$${val/1000}k`} />
                            
                            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#7F61E7', strokeWidth: 1, strokeDasharray: '4 4' }} />
                            
                            <Area 
                                type="monotone" 
                                dataKey="balance" 
                                stroke="#7F61E7" 
                                strokeWidth={3} 
                                fillOpacity={1} 
                                fill="url(#colorIncome)" 
                                animationDuration={1500}
                            />
                            <Brush 
                                dataKey="month" 
                                height={30} 
                                stroke="#7F61E7" 
                                fill="#1f2024" 
                                tickFormatter={() => ''}
                                travellerWidth={10}
                                className="opacity-80 hover:opacity-100 transition-opacity"
                            />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Activity Module - Added to fill space */}
                {activePillar === 'discover' && (
                    <div className="bg-surface rounded-2xl border border-white/5 shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                            <h3 className="font-bold text-white flex items-center gap-2 font-display text-sm">
                                <Clock className="text-slate-400" size={18} /> Recent Activity
                            </h3>
                            <button className="text-xs text-accent hover:text-white transition-colors">View All</button>
                        </div>
                        <div className="divide-y divide-white/5">
                            {RECENT_ACTIVITY_MOCK.map((item) => (
                                <div key={item.id} className="p-4 hover:bg-white/[0.02] transition-colors flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${item.type === 'in' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-700/30 text-slate-400'}`}>
                                            {item.type === 'in' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-white font-body">{item.name}</p>
                                            <p className="text-xs text-slate-500">{item.date}</p>
                                        </div>
                                    </div>
                                    <span className={`text-sm font-bold font-mono ${item.type === 'in' ? 'text-emerald-400' : 'text-slate-300'}`}>
                                        {item.type === 'in' ? '+' : '-'}${item.amount.toLocaleString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                </>
            )}

            {(activePillar !== 'fix' && activePillar !== 'discover' || (activePillar === 'discover' && false)) && (
               /* Logic adjustment: we show Suggested Actions if NOT fix AND NOT discover (because discover has Recent Activity now) 
                  Wait, let's just keep Suggested Actions for all non-fix tabs below the chart, or maybe replace it for Discover?
                  Let's keep Suggested Actions for Predict/Guard */
               <div className="bg-surface rounded-2xl border border-white/5 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                        <h3 className="font-bold text-white flex items-center gap-2 font-display">
                            <Lightbulb className="text-highlight" size={20} />
                            Suggested Actions
                        </h3>
                        <span className="text-xs font-bold text-accent bg-accent/10 px-3 py-1 rounded-full border border-accent/20">3 New</span>
                    </div>
                    <div className="divide-y divide-white/5">
                        {strategicActions.map((item, idx) => (
                            <div key={idx} className="p-5 hover:bg-white/[0.02] transition-colors flex items-center gap-5 group cursor-pointer">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${
                                    item.type === 'saving' ? 'bg-emerald-500/10 text-emerald-400' : item.type === 'risk' ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'
                                }`}>
                                    {item.type === 'saving' ? <DollarSign size={18} /> : item.type === 'risk' ? <AlertTriangle size={18} /> : <TrendingUp size={18} />}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-white font-body">{item.action}</p>
                                    <p className="text-xs text-slate-400 mt-1 group-hover:text-slate-300 transition-colors">Impact: <span className="font-bold text-slate-200">{item.impact}</span></p>
                                </div>
                                <button className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold text-white bg-accent px-4 py-2 rounded-lg shadow-lg transform translate-x-2 group-hover:translate-x-0 transition-transform">
                                    Apply
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            {/* Show Suggested Actions for Predict/Guard/Discover anyway, actually users might want to see actions in discover too. 
                Let's simplify: Recent Activity shows on Discover. Suggested Actions shows on Predict/Guard. 
                OR show both on Discover? Space is tight.
                Let's stick to: Discover gets Recent Activity. Others get Suggested Actions. 
            */}
             {activePillar !== 'fix' && activePillar !== 'discover' && (
                 <div className="bg-surface rounded-2xl border border-white/5 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                        <h3 className="font-bold text-white flex items-center gap-2 font-display">
                            <Lightbulb className="text-highlight" size={20} />
                            Suggested Actions
                        </h3>
                        <span className="text-xs font-bold text-accent bg-accent/10 px-3 py-1 rounded-full border border-accent/20">3 New</span>
                    </div>
                    <div className="divide-y divide-white/5">
                        {strategicActions.map((item, idx) => (
                            <div key={idx} className="p-5 hover:bg-white/[0.02] transition-colors flex items-center gap-5 group cursor-pointer">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${
                                    item.type === 'saving' ? 'bg-emerald-500/10 text-emerald-400' : item.type === 'risk' ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'
                                }`}>
                                    {item.type === 'saving' ? <DollarSign size={18} /> : item.type === 'risk' ? <AlertTriangle size={18} /> : <TrendingUp size={18} />}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-white font-body">{item.action}</p>
                                    <p className="text-xs text-slate-400 mt-1 group-hover:text-slate-300 transition-colors">Impact: <span className="font-bold text-slate-200">{item.impact}</span></p>
                                </div>
                                <button className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold text-white bg-accent px-4 py-2 rounded-lg shadow-lg transform translate-x-2 group-hover:translate-x-0 transition-transform">
                                    Apply
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
             )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
            <div className="bg-gradient-to-br from-accent to-[#63E1E7] rounded-2xl p-0.5 shadow-[0_0_25px_rgba(127,97,231,0.25)] text-white relative overflow-hidden">
                <div className="bg-[#181A20] rounded-[14px] p-6 relative h-full">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-accent/20 rounded-xl shrink-0 animate-float">
                            <Sparkles size={24} className="text-accentLight" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg mb-2 font-display bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">AI CFO Insight</h3>
                            <p className="text-slate-300 text-sm leading-relaxed font-light font-body">{aiInsight}</p>
                            <button className="mt-4 text-xs font-bold bg-white/10 text-white border border-white/10 px-4 py-2 rounded-lg hover:bg-white/20 transition-colors">
                                Ask follow-up
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {activePillar !== 'fix' && (
                <div className="bg-surface p-6 rounded-2xl border border-white/5 shadow-sm">
                    <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider flex items-center justify-between font-accent">
                        Active Signals
                        <span className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-1 rounded animate-pulse">Live</span>
                    </h3>
                    <div className="space-y-3">
                        {alerts.filter(a => !a.resolved && !resolvedAlertIds.includes(a.id)).slice(0, 4).map((alert, i) => (
                            <div key={alert.id} className="flex gap-3 items-start p-3 rounded-xl hover:bg-white/5 transition-all border border-transparent hover:border-white/5 group cursor-pointer">
                                <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${alert.severity === 'high' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]' : 'bg-highlight'}`} />
                                <div>
                                    <p className="text-sm text-slate-200 font-medium leading-tight group-hover:text-white font-body">{alert.message}</p>
                                    <p className="text-xs text-slate-500 mt-1 font-accent">{alert.date}</p>
                                </div>
                            </div>
                        ))}
                        {activeAlertsCount === 0 && (
                             <p className="text-sm text-slate-500 text-center py-4">No active signals.</p>
                        )}
                    </div>
                </div>
            )}

             <div className="bg-[#111318] p-6 rounded-2xl text-white shadow-xl relative overflow-hidden group cursor-pointer border border-white/5">
                 <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/20 to-transparent transition-opacity opacity-50 group-hover:opacity-80"></div>
                 <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="font-bold font-display">Growth Capital</h3>
                        <div className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-1 rounded font-bold border border-emerald-500/30 font-accent">Pre-approved</div>
                    </div>
                    <p className="text-slate-400 text-xs mb-1 font-accent">Available Credit Line</p>
                    <div className="text-3xl font-bold text-white mb-4 font-body">$500,000</div>
                    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden mb-4">
                        <div className="w-3/4 h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                    </div>
                    <div className="flex justify-between text-xs text-slate-400 font-accent">
                        <span>3.4% APR</span>
                        <span className="text-white font-medium group-hover:translate-x-1 transition-transform flex items-center gap-1">View Terms <ArrowUpRight size={10}/></span>
                    </div>
                 </div>
             </div>
        </div>
      </div>

      {/* Report Generation Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-[#000]/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
           <div className="bg-surface rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] animate-fade-in-up border border-white/10">
              <div className="p-6 border-b border-white/5 flex justify-between items-center">
                 <h3 className="font-bold text-xl text-white flex items-center gap-2 font-display">
                    <FileText className="text-accent" /> Investor Update
                 </h3>
                 <button onClick={() => setShowReportModal(false)} className="text-slate-400 hover:text-white transition-colors"><X size={24}/></button>
              </div>
              
              <div className="p-6 flex-1 overflow-y-auto bg-[#181A20]">
                 {isGeneratingReport ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-4">
                        <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-slate-400 animate-pulse font-medium font-accent">AI is crafting your narrative...</p>
                    </div>
                 ) : (
                    <textarea 
                        value={reportContent}
                        readOnly
                        className="w-full h-96 p-6 bg-[#181A20] border border-white/10 rounded-xl text-slate-300 font-mono text-sm focus:ring-2 focus:ring-accent focus:outline-none resize-none leading-relaxed shadow-inner"
                    ></textarea>
                 )}
              </div>

              <div className="p-6 border-t border-white/5 bg-surface rounded-b-2xl flex flex-col sm:flex-row justify-between items-center gap-4">
                 <div className="flex gap-2 w-full sm:w-auto">
                    <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-[#181A20] border border-white/10 text-slate-300 hover:text-white hover:border-white/20 rounded-xl transition-all text-xs font-bold font-accent">
                        <FileDown size={16} /> PDF
                    </button>
                    <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-[#181A20] border border-white/10 text-slate-300 hover:text-white hover:border-white/20 rounded-xl transition-all text-xs font-bold font-accent">
                        <FileSpreadsheet size={16} /> Excel
                    </button>
                 </div>

                 <div className="flex gap-3 w-full sm:w-auto justify-end">
                     <button onClick={() => setShowReportModal(false)} className="px-5 py-2.5 text-slate-400 font-medium hover:text-white hover:bg-white/5 rounded-xl transition-colors">Cancel</button>
                     <button className="flex items-center gap-2 px-6 py-2.5 bg-accent text-white font-medium hover:bg-accentLight rounded-xl transition-all shadow-[0_0_15px_rgba(127,97,231,0.4)] hover:-translate-y-0.5">
                        <Send size={16} /> Send Update
                     </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
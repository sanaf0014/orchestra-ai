import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Transactions } from './components/Transactions';
import { Forecasting } from './components/Forecasting';
import { Integrations } from './components/Integrations';
import { AIChatAssistant } from './components/AIChatAssistant';
import { Intro } from './components/Intro';
import { Transaction, CashflowPoint, Alert, IntegrationStatus, TransactionStatus, TransactionType } from './types';
import { Bell, Mail, MessageSquare, Shield, Users } from 'lucide-react';

// --- Mock Data Setup ---

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 't1', date: '2023-10-24', description: 'Stripe Payout #8842', amount: 12500, type: TransactionType.INCOME, category: 'Revenue', status: TransactionStatus.COMPLETED, riskScore: 5 },
  { id: 't2', date: '2023-10-24', description: 'AWS EMEA SERVICE', amount: -2400, type: TransactionType.EXPENSE, category: 'Infrastructure', status: TransactionStatus.COMPLETED, riskScore: 2 },
  { id: 't3', date: '2023-10-23', description: 'Uber * Trip 2991', amount: -45.20, type: TransactionType.EXPENSE, category: 'Travel', status: TransactionStatus.COMPLETED },
  { id: 't4', date: '2023-10-23', description: 'Unknown Vendor 994X', amount: -12000, type: TransactionType.EXPENSE, category: 'Uncategorized', status: TransactionStatus.PENDING, riskScore: 85, riskReason: 'High amount for new vendor', isAnomaly: true },
  { id: 't5', date: '2023-10-22', description: 'Gusto Payroll', amount: -68000, type: TransactionType.EXPENSE, category: 'Payroll', status: TransactionStatus.COMPLETED },
  { id: 't6', date: '2023-10-22', description: 'WeWork Rent Oct', amount: -5500, type: TransactionType.EXPENSE, category: 'Office', status: TransactionStatus.COMPLETED },
  { id: 't7', date: '2023-10-21', description: 'Client Invoice #4002', amount: 45000, type: TransactionType.INCOME, category: 'Revenue', status: TransactionStatus.COMPLETED },
  { id: 't8', date: '2023-10-20', description: 'Github Ent', amount: -220, type: TransactionType.EXPENSE, category: 'Software', status: TransactionStatus.COMPLETED },
];

// Generate robust daily data for zoom capability
const generateMockCashflow = (crisisMode: boolean = true): CashflowPoint[] => {
    const data: CashflowPoint[] = [];
    const today = new Date();
    let balance = 1240000;
    
    // 90 days of history
    for (let i = 90; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const month = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      // Simulate noise
      const volatility = (Math.random() - 0.4) * 15000; 
      // Major events every 30 days
      if (i % 30 === 0) balance -= 40000; // Payroll
      if (i % 15 === 0) balance += 25000; // Sales
      
      balance += volatility;

      data.push({
        month,
        income: volatility > 0 ? volatility : 0,
        expenses: volatility < 0 ? Math.abs(volatility) : 0,
        balance: Math.floor(balance),
        projected: false
      });
    }

    // 14 days of projection
    for (let i = 1; i <= 14; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);
        const month = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        // In Crisis mode, burn is higher
        const dailyBurn = crisisMode ? 4500 : 2000; 
        balance -= dailyBurn;
        
        data.push({
            month,
            income: 0,
            expenses: dailyBurn,
            balance: Math.floor(balance),
            projected: true
        });
    }

    return data;
};

const MOCK_ALERTS: Alert[] = [
  { id: 'a1', severity: 'high', message: 'Unusual outflow detected: $12,000 to Unknown Vendor', date: '10 mins ago', resolved: false },
  { id: 'a2', severity: 'medium', message: 'Runway dropped below 15 months', date: '2 hours ago', resolved: false },
  { id: 'a3', severity: 'low', message: 'New bank account connected', date: '1 day ago', resolved: true },
];

const MOCK_INTEGRATIONS: IntegrationStatus[] = [
  { name: 'Silicon Valley Bank', type: 'BANK', lastSynced: '5 mins ago', status: 'connected' },
  { name: 'NetSuite ERP', type: 'ERP', lastSynced: '10 mins ago', status: 'connected' },
  { name: 'Stripe Payments', type: 'STRIPE', lastSynced: '1 hour ago', status: 'connected' },
  { name: 'Brex Cards', type: 'BANK', lastSynced: 'Failed', status: 'error' },
];

// Settings Component
const SettingsPanel = () => {
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [whatsappAlerts, setWhatsappAlerts] = useState(true);

  const Toggle = ({ label, checked, setChecked, icon: Icon }: any) => (
    <div className="flex items-center justify-between p-5 bg-white rounded-xl border border-slate-100 hover:border-accent/30 transition-colors shadow-sm hover:shadow-md">
       <div className="flex items-center gap-4">
          <div className={`p-2.5 rounded-xl ${checked ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'bg-slate-50 text-slate-400'}`}>
             <Icon size={20} />
          </div>
          <div>
            <p className="font-bold text-slate-900 text-sm">{label}</p>
            <p className="text-xs text-slate-500 mt-0.5">{checked ? 'Active' : 'Disabled'}</p>
          </div>
       </div>
       <button 
         onClick={() => setChecked(!checked)}
         className={`w-12 h-7 rounded-full transition-colors relative ${checked ? 'bg-emerald-500' : 'bg-slate-200'}`}
       >
         <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${checked ? 'translate-x-5' : ''}`} />
       </button>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in-up">
       <div className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Settings</h2>
          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
             <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
               <Bell size={20} className="text-slate-400" />
               Alert Preferences
             </h3>
             <div className="space-y-4">
                <Toggle label="Email Reports & Alerts" checked={emailAlerts} setChecked={setEmailAlerts} icon={Mail} />
                <Toggle label="WhatsApp Critical Alerts" checked={whatsappAlerts} setChecked={setWhatsappAlerts} icon={MessageSquare} />
                <Toggle label="SMS Notifications" checked={smsAlerts} setChecked={setSmsAlerts} icon={Bell} />
             </div>
          </div>
       </div>

       <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Shield size={20} className="text-slate-400" />
            Access & Security
          </h3>
          <div className="space-y-4">
              <div className="flex justify-between items-center p-4 border-b border-slate-50 hover:bg-slate-50 rounded-lg transition-colors">
                 <div className="flex items-center gap-3">
                    <Users className="text-slate-400" size={20} />
                    <div>
                      <p className="text-sm font-bold">Team Access</p>
                      <p className="text-xs text-slate-500">3 Admins, 2 Viewers</p>
                    </div>
                 </div>
                 <button className="text-accent text-sm font-bold hover:underline">Manage</button>
              </div>
               <div className="flex justify-between items-center p-4 hover:bg-slate-50 rounded-lg transition-colors">
                 <div>
                      <p className="text-sm font-bold">Data Retention</p>
                      <p className="text-xs text-slate-500">7 Years (Compliance Mode)</p>
                 </div>
                 <button className="text-slate-400 text-sm font-medium hover:text-slate-600">Configure</button>
              </div>
          </div>
       </div>
    </div>
  )
}

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [cashflowData, setCashflowData] = useState<CashflowPoint[]>(generateMockCashflow(true));
  const [alerts, setAlerts] = useState<Alert[]>(MOCK_ALERTS);
  const [integrations, setIntegrations] = useState<IntegrationStatus[]>(MOCK_INTEGRATIONS);

  const [metrics, setMetrics] = useState({
    balance: 1240500,
    monthlyBurn: 128400,
    runway: 14.2
  });

  const handleLogin = (mode: 'guest' | 'login' | 'demo') => {
    setIsAuthenticated(true);
    if (mode === 'demo') {
      setDemoMode(true);
      // Ensure we start with the crisis state
      setCashflowData(generateMockCashflow(true)); 
    }
  };

  useEffect(() => {
    const currentBalance = cashflowData[cashflowData.length - 1].balance; 
    
    // Calculate simple burn for demo
    const expenses = transactions.filter(t => t.type === TransactionType.EXPENSE);
    let estimatedMonthlyBurn = 85000;
    
    // If in demo mode and alert is active, simulate high burn
    const hasCriticalAlert = alerts.some(a => !a.resolved && a.severity === 'high');
    if (demoMode && hasCriticalAlert) {
      estimatedMonthlyBurn = 125000;
    } else if (demoMode && !hasCriticalAlert) {
       estimatedMonthlyBurn = 78000; // Optimized
    }

    const estimatedRunway = estimatedMonthlyBurn > 0 ? currentBalance / estimatedMonthlyBurn : 99;

    setMetrics({
      balance: currentBalance,
      monthlyBurn: estimatedMonthlyBurn,
      runway: estimatedRunway
    });
  }, [transactions, cashflowData, alerts, demoMode]);

  const handleResolveAlert = (id: string) => {
    // 1. Mark as resolved
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, resolved: true } : a));
    
    // 2. If it's the specific demo alert, fix the data graph
    if (demoMode && id === 'a1') {
       // Regenerate data with "Good" params (false = no crisis)
       const betterData = generateMockCashflow(false);
       setCashflowData(betterData);
       
       // Update transactions to show it was handled
       setTransactions(prev => prev.map(t => 
          t.id === 't4' ? { ...t, status: TransactionStatus.COMPLETED, description: 'Corrected: Vendor Refund', amount: 0, isAnomaly: false } : t
       ));
    }
  };

  const handleImportData = () => {
    const newTransactions: Transaction[] = [
      { 
        id: `new_${Date.now()}_1`, 
        date: new Date().toISOString().split('T')[0], 
        description: 'New Client Retainer', 
        amount: 8500, 
        type: TransactionType.INCOME, 
        category: 'Revenue', 
        status: TransactionStatus.COMPLETED 
      },
      { 
        id: `new_${Date.now()}_2`, 
        date: new Date().toISOString().split('T')[0], 
        description: 'Server Costs Spike', 
        amount: -3200, 
        type: TransactionType.EXPENSE, 
        category: 'Infrastructure', 
        status: TransactionStatus.COMPLETED,
        riskScore: 65,
        isAnomaly: true
      }
    ];

    setTransactions(prev => [...newTransactions, ...prev]);
    
    const anomaly = newTransactions.find(t => t.isAnomaly);
    if (anomaly) {
      const newAlert: Alert = {
        id: `alert_${Date.now()}`,
        severity: 'medium',
        message: `New anomaly detected: ${anomaly.description} ($${Math.abs(anomaly.amount)})`,
        date: 'Just now',
        resolved: false
      };
      setAlerts(prev => [newAlert, ...prev]);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            cashflowData={cashflowData} 
            alerts={alerts} 
            metrics={metrics} 
            isDemoMode={demoMode}
            onResolveAlert={handleResolveAlert}
          />
        );
      case 'transactions':
        return <Transactions transactions={transactions} setTransactions={setTransactions} />;
      case 'forecasting':
        return <Forecasting history={cashflowData} />;
      case 'integrations':
        return <Integrations status={integrations} onImportData={handleImportData} />;
      case 'settings':
        return <SettingsPanel />;
      default:
        return <Dashboard cashflowData={cashflowData} alerts={alerts} metrics={metrics} />;
    }
  };

  if (!isAuthenticated) {
    return <Intro onComplete={handleLogin} />;
  }

  return (
    <>
      <Layout activeTab={activeTab} setActiveTab={setActiveTab} onLogout={() => setIsAuthenticated(false)}>
        {renderContent()}
      </Layout>
      
      <AIChatAssistant 
        context={{
          balance: metrics.balance,
          monthlyBurn: metrics.monthlyBurn,
          runway: metrics.runway,
          recentTransactions: transactions
        }} 
      />
    </>
  );
};

export default App;
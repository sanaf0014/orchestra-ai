import React, { useState } from 'react';
import { LayoutDashboard, LineChart, List, Settings, Activity, Menu, Bell, Search, HelpCircle, LogOut, User, ChevronDown } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

const SidebarItem = ({ icon: Icon, label, id, active, onClick, expanded }: any) => (
  <button
    onClick={() => onClick(id)}
    className={`relative w-full flex items-center gap-3 px-4 py-3.5 text-sm font-accent transition-all duration-300 rounded-xl mb-2 group overflow-hidden
      ${active === id 
        ? 'bg-accent/10 text-accent' 
        : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
  >
    {active === id && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-accent rounded-r-full shadow-[0_0_10px_#7F61E7]"></div>}
    <Icon size={20} className={`transition-transform duration-300 group-hover:scale-110 ${active === id ? 'text-accent' : 'text-slate-400 group-hover:text-white'}`} />
    <span className={`transition-opacity duration-300 ${expanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'} whitespace-nowrap`}>
      {label}
    </span>
  </button>
);

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-primary overflow-hidden font-sans text-white">
      {/* Sidebar */}
      <aside className={`bg-surface border-r border-white/5 transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] flex flex-col z-30 ${sidebarOpen ? 'w-72' : 'w-20'}`}>
        <div className="h-20 flex items-center px-6 border-b border-white/5">
          <div className="flex items-baseline gap-2 overflow-hidden whitespace-nowrap cursor-pointer" onClick={() => setSidebarOpen(!sidebarOpen)}>
             {sidebarOpen ? (
                <div className="flex items-baseline tracking-tight">
                    <span className="font-bold text-xl font-sans bg-clip-text text-transparent bg-gradient-to-r from-[#7F61E7] to-[#63E1E7]">
                    Orchestra
                    </span>
                    <span className="font-light text-white text-xl font-sans ml-1">AI</span>
                </div>
             ) : (
                <span className="font-bold text-xl tracking-tight font-sans text-accent">O</span>
             )}
          </div>
        </div>

        <nav className="flex-1 py-8 px-3 space-y-1 overflow-y-auto custom-scrollbar">
          <p className={`px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 transition-opacity duration-300 font-accent ${sidebarOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>Main Menu</p>
          <SidebarItem icon={LayoutDashboard} label="Dashboard" id="dashboard" active={activeTab} onClick={setActiveTab} expanded={sidebarOpen} />
          <SidebarItem icon={LineChart} label="Forecasting" id="forecasting" active={activeTab} onClick={setActiveTab} expanded={sidebarOpen} />
          <SidebarItem icon={List} label="Transactions" id="transactions" active={activeTab} onClick={setActiveTab} expanded={sidebarOpen} />
          <SidebarItem icon={Activity} label="Integrations" id="integrations" active={activeTab} onClick={setActiveTab} expanded={sidebarOpen} />
          
          <div className="my-6 border-t border-white/5 mx-4"></div>
          
          <p className={`px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 transition-opacity duration-300 font-accent ${sidebarOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>System</p>
          <SidebarItem icon={Settings} label="Settings" id="settings" active={activeTab} onClick={setActiveTab} expanded={sidebarOpen} />
        </nav>

        <div className="p-4 border-t border-white/5">
           <button className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-400 hover:text-white transition-colors rounded-xl hover:bg-white/5 mb-2 ${!sidebarOpen && 'justify-center'}`}>
             <HelpCircle size={20} />
             {sidebarOpen && <span className="font-accent">Help & Resources</span>}
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 relative bg-primary">
        {/* Glass Header */}
        <header className="h-20 glass border-b border-white/5 flex items-center justify-between px-8 sticky top-0 z-20 transition-all">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors">
              <Menu size={22} />
            </button>
            <div className="hidden md:flex items-center gap-2 text-slate-500 text-sm font-accent">
               <span className="hover:text-slate-300 cursor-pointer transition-colors">Home</span>
               <span>/</span>
               <span className="text-white font-medium capitalize">{activeTab}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-5">
            <div className="relative hidden md:block group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 group-focus-within:text-accent transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search transactions..." 
                className="pl-10 pr-4 py-2.5 bg-surface border border-white/5 hover:border-white/10 focus:bg-surfaceHighlight focus:border-accent/30 rounded-full text-sm focus:ring-2 focus:ring-accent/10 w-64 transition-all duration-300 text-white placeholder-slate-500"
              />
            </div>
            
            <button className="relative p-2.5 text-slate-400 hover:bg-white/5 hover:text-white rounded-full transition-all hover:scale-105">
              <Bell size={22} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-highlightPink rounded-full ring-2 ring-[#181A20] animate-pulse"></span>
            </button>

            <div className="relative">
                <button 
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-3 pl-1 pr-2 py-1 rounded-full hover:bg-white/5 border border-transparent hover:border-white/5 transition-all"
                >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-accent to-accentLight flex items-center justify-center text-xs font-bold text-white shadow-md ring-2 ring-[#181A20]">
                    AF
                    </div>
                    <ChevronDown size={16} className={`text-slate-400 transition-transform duration-300 ${profileOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Profile Dropdown */}
                {profileOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-surface rounded-xl shadow-2xl border border-white/10 overflow-hidden animate-fade-in-up origin-top-right z-50">
                        <div className="p-4 border-b border-white/5">
                            <p className="font-bold text-white font-display">Alex Finance</p>
                            <p className="text-xs text-slate-500">alex@orchestra.ai</p>
                        </div>
                        <div className="p-1">
                            <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white rounded-lg transition-colors">
                                <User size={16} /> Profile Settings
                            </button>
                            <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white rounded-lg transition-colors">
                                <Activity size={16} /> Billing
                            </button>
                            <div className="h-px bg-white/5 my-1"></div>
                             <button 
                                onClick={onLogout}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-danger hover:bg-danger/10 rounded-lg transition-colors"
                            >
                                <LogOut size={16} /> Sign Out
                            </button>
                        </div>
                    </div>
                )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6 md:p-8 relative scroll-smooth bg-primary">
            {children}
        </main>
      </div>
    </div>
  );
};
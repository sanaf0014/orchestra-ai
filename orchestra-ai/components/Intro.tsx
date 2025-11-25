import React, { useState, useEffect } from 'react';
import { ArrowRight, ShieldCheck, Zap, Loader2, PlayCircle } from 'lucide-react';

interface IntroProps {
  onComplete: (mode: 'guest' | 'login' | 'demo') => void;
}

export const Intro: React.FC<IntroProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0); // 0: Splash, 1: Onboarding
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    // Simulate loading sequence for splash screen
    const timer = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => setStep(1), 500);
          return 100;
        }
        return prev + 2;
      });
    }, 20); // Faster load < 2s
    return () => clearInterval(timer);
  }, []);

  const handleLogin = (mode: 'guest' | 'login' | 'demo') => {
    setIsLoggingIn(true);
    setTimeout(() => {
      onComplete(mode);
    }, 800);
  };

  if (step === 0) {
    return (
      <div className="fixed inset-0 bg-[#181A20] z-50 flex flex-col items-center justify-center text-white overflow-hidden font-sans">
        {/* Ambient Background */}
        <div className="absolute w-96 h-96 bg-accent/20 rounded-full blur-[120px] animate-pulse-soft top-1/4 left-1/4"></div>
        <div className="absolute w-80 h-80 bg-highlight/10 rounded-full blur-[100px] bottom-1/4 right-1/4 animate-float"></div>
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="mb-8 animate-fade-in-up flex items-center justify-center">
             {/* Text Logo for Splash */}
             <h1 className="text-5xl md:text-6xl font-bold font-sans tracking-tight">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#7F61E7] to-[#63E1E7]">Orchestra</span>
                <span className="font-light text-white ml-3">AI</span>
             </h1>
          </div>
          
          <p className="text-slate-400 text-lg mb-12 font-body animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Financial clarity in a chaotic world.
          </p>
          
          {/* Premium Progress Bar */}
          <div className="w-64 h-1 bg-surfaceHighlight rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-accent to-highlight transition-all duration-100 ease-out rounded-full"
              style={{ width: `${loadingProgress}%` }}
            ></div>
          </div>
          <p className="text-xs text-slate-500 mt-4 font-accent tracking-wider uppercase">Initializing Core...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#181A20] z-50 flex flex-col lg:flex-row overflow-hidden animate-fade-in font-sans">
      {/* Left: Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=2832&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-[#181A20] via-[#181A20]/90 to-accent/10"></div>
        
        <div className="relative z-10 max-w-lg">
          <div className="flex gap-4 mb-8">
            <div className="w-14 h-14 glass rounded-2xl flex items-center justify-center text-accent border-white/10 border">
               <Zap size={28} />
            </div>
             <div className="w-14 h-14 glass rounded-2xl flex items-center justify-center text-emerald-400 border-white/10 border">
               <ShieldCheck size={28} />
            </div>
          </div>
          <h2 className="text-5xl font-bold text-white mb-6 leading-tight tracking-tight">
            Turn financial chaos into <span className="text-transparent bg-clip-text bg-gradient-to-r from-accentLight to-accent">clarity</span>.
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed font-body">
            Orchestra uses advanced AI to monitor your bank feeds, predict runway, and guard against risk. No spreadsheets required.
          </p>
        </div>
      </div>

      {/* Right: Login/Entry */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#181A20] relative">
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-b from-accent/5 to-transparent pointer-events-none"></div>
        
        <div className="max-w-md w-full space-y-8 animate-slide-down relative z-10">
          <div className="text-center lg:text-left flex flex-col items-center lg:items-start">
             {/* Text Logo for Login - Clean, No Box */}
             <div className="mb-6">
                <h1 className="text-4xl font-bold font-sans tracking-tight">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#7F61E7] to-[#63E1E7]">Orchestra</span>
                    <span className="font-light text-white ml-2">AI</span>
                </h1>
             </div>
             <h2 className="text-3xl font-bold text-white font-display">Access Dashboard</h2>
             <p className="text-slate-400 mt-2 font-body">Sign in to manage your financial health.</p>
          </div>

          <div className="space-y-5">
             <button 
              type="button"
              onClick={() => handleLogin('demo')}
              disabled={isLoggingIn}
              className="w-full py-4 px-6 bg-gradient-to-r from-accent to-[#63E1E7] text-white rounded-xl font-bold hover:shadow-[0_0_25px_rgba(127,97,231,0.4)] hover:scale-[1.02] transition-all flex items-center justify-between group shadow-lg disabled:opacity-70 border border-white/10"
            >
              <span className="flex items-center gap-3">
                 <PlayCircle size={24} className="fill-white text-accent" />
                 Start Interactive Demo
              </span>
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
              <div className="relative flex justify-center"><span className="bg-[#181A20] px-4 text-sm text-slate-500 font-accent">or sign in</span></div>
            </div>

            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleLogin('login'); }}>
              <div>
                <input 
                    type="email" 
                    placeholder="work@email.com" 
                    className="w-full px-5 py-4 bg-[#25262B] border border-white/10 rounded-xl focus:ring-2 focus:ring-accent/50 focus:border-accent text-white placeholder-slate-500 outline-none transition-all font-body" 
                />
              </div>
              <div>
                <input 
                    type="password" 
                    placeholder="Password" 
                    className="w-full px-5 py-4 bg-[#25262B] border border-white/10 rounded-xl focus:ring-2 focus:ring-accent/50 focus:border-accent text-white placeholder-slate-500 outline-none transition-all font-body" 
                />
              </div>
              <button 
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-4 bg-surface border border-white/10 text-white rounded-xl font-semibold hover:bg-surfaceHighlight transition-all flex items-center justify-center gap-2 group disabled:opacity-80"
              >
                {isLoggingIn ? <Loader2 size={20} className="animate-spin" /> : (
                  <>
                    Login
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
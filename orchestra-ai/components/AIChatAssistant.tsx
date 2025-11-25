import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Loader2, Minimize2 } from 'lucide-react';
import { chatWithFinanceAgent } from '../services/geminiService';
import { Transaction } from '../types';

interface AIChatAssistantProps {
  context: {
    balance: number;
    monthlyBurn: number;
    runway: number;
    recentTransactions: Transaction[];
  };
}

interface Message {
  role: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

export const AIChatAssistant: React.FC<AIChatAssistantProps> = ({ context }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: "Hello! I'm your Orchestra CFO Agent. Ask me about your runway, burn rate, or recent expenses.", timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg, timestamp: new Date() }]);
    setIsLoading(true);

    try {
      const response = await chatWithFinanceAgent(userMsg, {
        balance: context.balance,
        burn: context.monthlyBurn,
        runway: context.runway,
        recentTransactions: context.recentTransactions
      });
      setMessages(prev => [...prev, { role: 'ai', text: response, timestamp: new Date() }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: "I apologize, but I'm having trouble connecting to the financial engine right now.", timestamp: new Date() }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-surface border border-white/10 hover:bg-accent text-white rounded-full shadow-[0_0_20px_rgba(127,97,231,0.3)] flex items-center justify-center transition-all hover:scale-110 z-[9999] group"
        aria-label="Open AI Assistant"
      >
        <MessageSquare size={24} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-[calc(100vw-2rem)] sm:w-96 h-[500px] bg-surface rounded-2xl shadow-2xl flex flex-col border border-white/10 z-[9999] animate-in slide-in-from-bottom-10 fade-in duration-300 font-sans">
      {/* Header */}
      <div className="bg-[#181A20] text-white p-4 rounded-t-2xl flex justify-between items-center shadow-sm shrink-0 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div>
             <div className="flex items-baseline tracking-tight">
                <span className="font-bold font-sans bg-clip-text text-transparent bg-gradient-to-r from-[#7F61E7] to-[#63E1E7] text-sm">Orchestra</span>
                <span className="font-light text-white text-sm ml-1 font-sans">AI</span>
             </div>
            <p className="text-[10px] text-slate-400 flex items-center gap-1 font-accent">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              Online & Connected
            </p>
          </div>
        </div>
        <button 
            onClick={() => setIsOpen(false)} 
            className="text-slate-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded"
            aria-label="Close AI Assistant"
        >
          <Minimize2 size={18} />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#181A20] custom-scrollbar">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div 
              className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm font-body ${
                msg.role === 'user' 
                  ? 'bg-accent text-white rounded-br-none' 
                  : 'bg-surface border border-white/5 text-slate-200 rounded-bl-none'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-surface border border-white/5 p-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-2">
              <Loader2 size={14} className="animate-spin text-accent" />
              <span className="text-xs text-slate-400 font-medium font-accent">Analyzing financials...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-surface border-t border-white/5 rounded-b-2xl shrink-0">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask about your cashflow..."
            autoFocus
            className="w-full pl-4 pr-12 py-3 bg-[#181A20] border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all shadow-inner font-body"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/5 text-accent hover:bg-accent hover:text-white rounded-lg transition-colors disabled:opacity-50 disabled:hover:bg-white/5 disabled:hover:text-accent shadow-sm"
            aria-label="Send Message"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
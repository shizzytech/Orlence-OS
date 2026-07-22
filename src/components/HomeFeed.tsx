import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bot, Sparkles, ArrowRight, CheckCircle2, TrendingUp, 
  Package, Users, ShoppingBag, Zap, Clock, ShieldCheck,
  Check, AlertTriangle, ArrowUpRight, BarChart3, Mail, RefreshCw, ChevronDown, ChevronUp, Search
} from 'lucide-react';
import { BusinessData, Integration, ChatMessage } from '../types';
import RootCauseEngine from './RootCauseEngine';
import OperationalHealth from './OperationalHealth';

interface HomeFeedProps {
  businessData: BusinessData;
  integrations: Integration[];
  chatHistory: ChatMessage[];
  setChatHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  onNavigate: (tab: 'dashboard' | 'chat' | 'data' | 'integrations') => void;
  pendingPrompt: string | null;
  setPendingPrompt: React.Dispatch<React.SetStateAction<string | null>>;
}

interface ApprovalItem {
  id: string;
  category: string;
  urgency: 'critical' | 'high' | 'opportunity';
  title: string;
  impact: string;
  details: string;
  estimatedMinutes: number;
  approved: boolean;
  revenueAtRisk?: number;
  confidence: number;
}

export default function HomeFeed({ 
  businessData, 
  onNavigate,
  setPendingPrompt
}: HomeFeedProps) {
  const { orders, products, customers, currency, businessName } = businessData;

  // Track approved decisions in state
  const [approvals, setApprovals] = useState<ApprovalItem[]>([
    {
      id: 'app-supplier',
      category: 'Inventory',
      urgency: 'critical',
      title: 'Restock supplier — ABC Textiles',
      impact: 'Avoid lost sales',
      details: '4 items are completely out of stock. Supplier is ready to ship with a 50% upfront payment term.',
      estimatedMinutes: 2,
      approved: false,
      revenueAtRisk: 350000,
      confidence: 98
    },
    {
      id: 'app-vip',
      category: 'Retention',
      urgency: 'high',
      title: 'Recover VIP customer — Babajide Soyinka',
      impact: 'Recovery probability: 81%',
      details: 'Customer has been inactive for 30 days. Drafted a personalized WhatsApp offer with a 10% returning loyalty discount.',
      estimatedMinutes: 3,
      approved: false,
      revenueAtRisk: 170000,
      confidence: 81
    },
    {
      id: 'app-marketing',
      category: 'Growth',
      urgency: 'opportunity',
      title: 'Publish Weekend Clearing Campaign',
      impact: 'Projected new sales',
      details: 'Automated broadcast to 74 warm leads across Instagram & Email. Creative assets & discount code pre-configured.',
      estimatedMinutes: 2,
      approved: false,
      revenueAtRisk: 520000,
      confidence: 74
    }
  ]);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showLayer2, setShowLayer2] = useState(false);

  const handleApprove = (id: string) => {
    setApprovals(prev => prev.map(item => item.id === id ? { ...item, approved: true } : item));
    const approvedItem = approvals.find(a => a.id === id);
    if (approvedItem) {
      setToastMessage(`✓ Approved: ${approvedItem.title}`);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const handleApproveAll = () => {
    setApprovals(prev => prev.map(item => ({ ...item, approved: true })));
    setToastMessage('🚀 All executive decisions approved & dispatched!');
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleInvestigate = (title: string) => {
    setPendingPrompt(`Investigate decision: ${title}`);
    onNavigate('chat');
  };

  // Calculations for Today and Yesterday
  const stats = React.useMemo(() => {
    const todayStr = "2026-07-15";
    const yesterdayStr = "2026-07-14";

    const todayOrders = orders.filter(o => o.date === todayStr);
    const todayRevenue = todayOrders.filter(o => o.status === 'Paid').reduce((sum, o) => sum + o.amount, 0);

    const yesterdayOrders = orders.filter(o => o.date === yesterdayStr);
    const yesterdayRevenue = yesterdayOrders.filter(o => o.status === 'Paid').reduce((sum, o) => sum + o.amount, 0);

    const totalRevenue = orders.filter(o => o.status === 'Paid').reduce((sum, o) => sum + o.amount, 0);
    const lowStockCount = products.filter(p => p.stock <= 5).length;
    const inactiveCount = customers.filter(c => c.totalSpent > 50000 && new Date(c.lastActive) < new Date("2026-06-15")).length;

    let revenueTrend = 12;
    if (yesterdayRevenue > 0) {
      revenueTrend = Math.round(((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100);
    }

    return {
      todayRevenue,
      todayOrdersCount: todayOrders.length,
      yesterdayRevenue,
      totalRevenue,
      lowStockCount,
      inactiveCount,
      revenueTrend
    };
  }, [orders, products, customers]);

  const ownerName = businessName === "Sartorial Africa" ? "Sarah" : businessName === "Kigali Coffee Co." ? "Marie Claire" : "Farah";
  const approvedCount = approvals.filter(a => a.approved).length;

  return (
    <div className="space-[#141414] font-sans antialiased text-[#141414]" id="executive-decision-center">
      
      {/* Toast Notification */}
      {toastMessage && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="fixed top-20 right-8 bg-[#141414] text-[#E4E3E0] px-5 py-3 border border-emerald-500 shadow-2xl z-50 flex items-center gap-3 text-xs font-mono font-bold uppercase tracking-wider"
        >
          <Zap className="w-4 h-4 text-emerald-400 animate-bounce" />
          <span>{toastMessage}</span>
        </motion.div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* LAYER 1: EXECUTIVE BRIEF (Visible by default)                 */}
      {/* ───────────────────────────────────────────────────────────── */}
      
      {/* 1. HERO — EXECUTIVE BRIEFING HEADER */}
      <div className="bg-[#141414] text-[#E4E3E0] border border-[#141414] p-8" id="hero-header">
        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
          
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#E4E3E0]/50">Orlence OS / {businessName}</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight uppercase">Executive Morning Brief</h1>
            <p className="text-[#E4E3E0]/60 text-xs font-mono mt-2">
              Prepared while you were offline · {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
            </p>
          </div>

          <div className="flex flex-col gap-2 items-end">
             <div className="text-right">
                <p className="text-[9px] font-mono uppercase tracking-widest text-[#E4E3E0]/40">Business Health</p>
                <p className="text-3xl font-black font-mono text-emerald-400 leading-none mt-0.5">89</p>
             </div>
             {/* 4 Pillars of Health */}
             <div className="flex items-center gap-3 mt-1 text-[9px] font-mono uppercase tracking-wider">
               <span className="text-[#E4E3E0]/70"><strong className="text-emerald-400">92</strong> Ops</span>
               <span className="text-[#E4E3E0]/70"><strong className="text-emerald-400">87</strong> Fin</span>
               <span className="text-[#E4E3E0]/70"><strong className="text-amber-400">79</strong> Cust</span>
               <span className="text-[#E4E3E0]/70"><strong className="text-emerald-400">90</strong> Grw</span>
             </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between text-xs font-mono text-[#E4E3E0]/60">
           <p><strong className="text-white text-sm">{approvals.length - approvedCount} decisions</strong> waiting in your COO Inbox.</p>
           <p className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> Estimated review time: <strong className="text-white">6 minutes</strong></p>
        </div>
      </div>

      {/* 2. THE COO INBOX (AI-Prepared Decisions) */}
      <div className="bg-white border-x border-b border-[#141414] mt-6 shadow-sm" id="coo-inbox">
        
        {/* Section Header */}
        <div className="px-8 py-5 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#141414] text-[#E4E3E0] flex items-center justify-center font-bold">
              <Bot className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="font-black text-lg tracking-tight text-[#141414]">COO Inbox</h2>
              <p className="text-xs text-slate-500 font-mono mt-0.5">AI has already prepared these decisions.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-slate-500">
              {approvedCount} of {approvals.length} approved
            </span>
            {approvedCount < approvals.length && (
              <button
                onClick={handleApproveAll}
                className="bg-[#141414] text-[#E4E3E0] hover:bg-black px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Approve All
              </button>
            )}
          </div>
        </div>

        {/* Inbox Items */}
        <div className="divide-y divide-slate-100">
          {approvals.map(item => {
            const isCritical = item.urgency === 'critical';
            const isHigh = item.urgency === 'high';
            
            return (
              <div 
                key={item.id} 
                className={`p-6 transition-colors flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 ${
                  item.approved ? 'bg-emerald-50/40' : 'hover:bg-slate-50/60'
                }`}
              >
                <div className="flex flex-col md:flex-row items-start gap-5 min-w-0 flex-1 w-full">
                  
                  {/* Priority Indicator */}
                  <div className={`shrink-0 flex items-center justify-center mt-1 w-24 px-2 py-1.5 rounded-sm border ${
                    item.approved ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                    isCritical ? 'bg-rose-100 text-rose-700 border-rose-200' :
                    isHigh ? 'bg-amber-100 text-amber-700 border-amber-200' :
                    'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                      {item.approved ? <Check className="w-3 h-3" /> : null}
                      {item.approved ? 'Done' : item.urgency}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="font-black text-lg text-[#141414] leading-tight flex items-center gap-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-slate-600 mt-1.5 leading-relaxed max-w-2xl">{item.details}</p>
                    
                    {/* Impact Metrics Row */}
                    {!item.approved && (
                      <div className="flex flex-wrap items-center gap-4 mt-4">
                        <div className="flex items-center gap-1.5 text-xs font-mono bg-slate-100 px-2 py-1 rounded-sm border border-slate-200">
                           <span className="text-slate-500">Confidence:</span>
                           <span className={`font-bold ${item.confidence >= 90 ? 'text-emerald-600' : 'text-amber-600'}`}>{item.confidence}%</span>
                        </div>
                        {item.revenueAtRisk && (
                          <div className="flex items-center gap-1.5 text-xs font-mono bg-slate-100 px-2 py-1 rounded-sm border border-slate-200">
                             <span className="text-slate-500">Expected Impact:</span>
                             <span className="font-bold text-[#141414]">{currency}{item.revenueAtRisk.toLocaleString()}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 text-xs font-mono bg-slate-100 px-2 py-1 rounded-sm border border-slate-200">
                           <span className="text-slate-500">Time Req:</span>
                           <span className="font-bold text-[#141414]">{item.estimatedMinutes} sec</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="shrink-0 flex items-center gap-3 w-full xl:w-auto justify-end mt-4 xl:mt-0">
                  {item.approved ? (
                    <span className="bg-emerald-600 text-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 rounded-sm">
                      <CheckCircle2 className="w-4 h-4" /> Dispatched
                    </span>
                  ) : (
                    <>
                      <button
                        onClick={() => handleInvestigate(item.title)}
                        className="text-slate-500 hover:text-[#141414] px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Search className="w-4 h-4" /> Investigate
                      </button>
                      <button
                        onClick={() => handleApprove(item.id)}
                        className="bg-[#141414] text-[#E4E3E0] hover:bg-black px-6 py-2.5 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-sm rounded-sm"
                      >
                        <Check className="w-4 h-4 text-emerald-400" /> Approve
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* LAYER 2 TOGGLE                                                */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="mt-8 flex justify-center">
         <button 
           onClick={() => setShowLayer2(!showLayer2)}
           className="flex items-center gap-2 px-6 py-2 bg-white border border-slate-200 text-slate-500 hover:text-[#141414] hover:border-[#141414] text-xs font-bold font-mono uppercase tracking-widest transition-all rounded-full"
         >
           {showLayer2 ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
           {showLayer2 ? 'Hide Operations & Analytics' : 'View Operations & Analytics'}
         </button>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* LAYER 2 & 3: MANAGER & ANALYST (Expandable)                   */}
      {/* ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showLayer2 && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-8 pb-12">
              
              {/* KEY METRICS CARDS */}
              <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-slate-400 mb-4 px-2">Business Metrics</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="executive-metrics">
                <div className="bg-white p-5 border border-[#141414]">
                  <p className="text-[9px] font-mono uppercase tracking-widest text-slate-500">Revenue Today</p>
                  <p className="text-2xl font-black font-mono text-[#141414] mt-1">{currency}{stats.todayRevenue.toLocaleString()}</p>
                  <p className="text-[10px] font-mono text-emerald-600 mt-1 font-bold">+{stats.revenueTrend}% vs prior day</p>
                </div>
                <div className="bg-white p-5 border border-[#141414]">
                  <p className="text-[9px] font-mono uppercase tracking-widest text-slate-500">Orders Today</p>
                  <p className="text-2xl font-black font-mono text-[#141414] mt-1">{stats.todayOrdersCount}</p>
                  <p className="text-[10px] font-mono text-slate-500 mt-1">100% fulfilled via store</p>
                </div>
                <div className="bg-white p-5 border border-[#141414]">
                  <p className="text-[9px] font-mono uppercase tracking-widest text-slate-500">Total Lifetime Spend</p>
                  <p className="text-2xl font-black font-mono text-[#141414] mt-1">{currency}{stats.totalRevenue.toLocaleString()}</p>
                  <p className="text-[10px] font-mono text-slate-500 mt-1">Active Memory DB verified</p>
                </div>
                <div className="bg-white p-5 border border-[#141414]">
                  <p className="text-[9px] font-mono uppercase tracking-widest text-slate-500">Stock & Lead Alerts</p>
                  <p className={`text-2xl font-black font-mono mt-1 ${stats.lowStockCount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {stats.lowStockCount} Items Low
                  </p>
                  <p className="text-[10px] font-mono text-slate-500 mt-1">{stats.inactiveCount} inactive VIP leads</p>
                </div>
              </div>

              {/* DIAGNOSTIC ENGINES (Root Cause & Operational Health) */}
              <div className="mt-10 space-y-8" id="diagnostic-engines">
                <div>
                  <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-slate-400 mb-4 px-2">AI Reasoning Engine</h3>
                  <RootCauseEngine 
                    businessData={businessData} 
                    currency={currency}
                    onAskAI={(prompt) => { setPendingPrompt(prompt); onNavigate('chat'); }} 
                  />
                </div>
                <div>
                  <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-slate-400 mb-4 px-2">Operational Health Drilldown</h3>
                  <OperationalHealth 
                    businessData={businessData} 
                    currency={currency}
                    onAskAI={(prompt) => { setPendingPrompt(prompt); onNavigate('chat'); }} 
                  />
                </div>
              </div>

              {/* DEEP ANALYSIS CTA BANNER */}
              <div className="bg-[#141414] text-[#E4E3E0] p-6 border border-[#141414] mt-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4" id="deep-analysis-banner">
                <div>
                  <h3 className="font-black text-base uppercase tracking-tight">Need Deep Exploration & Strategy?</h3>
                  <p className="text-xs text-[#E4E3E0]/60 font-mono mt-1">Jump into the Investigation Room to run custom queries, generate charts, and inspect segments.</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onNavigate('chat')}
                    className="bg-[#E4E3E0] text-[#141414] hover:bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Bot className="w-4 h-4" /> Open Investigation Room →
                  </button>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

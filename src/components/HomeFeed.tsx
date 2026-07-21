import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Bot, Sparkles, ArrowRight, CheckCircle2, TrendingUp, 
  Package, Users, ShoppingBag, Zap, Clock, ShieldCheck,
  Check, AlertTriangle, ArrowUpRight, BarChart3, Mail, RefreshCw
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
  category: 'Inventory' | 'Retention' | 'Marketing' | 'Reporting';
  urgency: 'critical' | 'high' | 'medium';
  title: string;
  impact: string;
  details: string;
  estimatedMinutes: number;
  approved: boolean;
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
      title: 'Supplier Purchase Order — ABC Textiles',
      impact: 'Avoid ₦350,000 lost sales',
      details: 'Restock 4 out-of-stock items (Adire Silk Kaftan, Senator Suit). Supplier ready, 50% upfront payment term.',
      estimatedMinutes: 2,
      approved: false
    },
    {
      id: 'app-vip',
      category: 'Retention',
      urgency: 'high',
      title: 'VIP Churn Recovery — Babajide Soyinka',
      impact: '₦170,000 recovery est.',
      details: 'Personalized WhatsApp offer drafted with 10% returning loyalty discount. Inactive for 30 days.',
      estimatedMinutes: 3,
      approved: false
    },
    {
      id: 'app-marketing',
      category: 'Marketing',
      urgency: 'medium',
      title: 'Adire Silk Weekend Clearing Campaign',
      impact: '₦520,000 projected sales',
      details: 'Automated broadcast to 74 warm leads across Instagram & Email. Creative assets & discount code pre-configured.',
      estimatedMinutes: 2,
      approved: false
    },
    {
      id: 'app-[#141414]',
      category: 'Reporting',
      urgency: 'medium',
      title: 'Weekly Executive Briefing Email',
      impact: 'Automated stakeholder sync',
      details: 'Drafted summary report covering revenue growth (+12%), margin analysis, and customer LTV metrics for founders.',
      estimatedMinutes: 1,
      approved: false
    }
  ]);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

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
    setToastMessage('🚀 All 4 executive decisions approved & dispatched!');
    setTimeout(() => setToastMessage(null), 4000);
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
      {/* 1. HERO — EXECUTIVE BRIEFING HEADER                           */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="bg-[#141414] text-[#E4E3E0] border border-[#141414] p-8" id="hero-header">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#E4E3E0]/50">Executive Decision Center</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight">Good morning, {ownerName}.</h1>
            <p className="text-[#E4E3E0]/60 text-xs font-mono mt-1">
              {businessName} · AI Chief Operating Officer Ready · {approvals.length - approvedCount} decisions awaiting review
            </p>
          </div>

          {/* Health Score */}
          <div className="flex items-center gap-4 bg-white/5 border border-white/10 px-5 py-3 rounded-lg">
            <div className="text-right">
              <p className="text-[9px] font-mono uppercase tracking-widest text-[#E4E3E0]/40">Business Health</p>
              <p className="text-2xl font-black font-mono text-emerald-400 leading-none mt-0.5">89/100</p>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="flex flex-col gap-1 text-[10px] font-mono">
              <span className="text-emerald-400 font-bold">🟢 Revenue Excellent</span>
              <span className="text-amber-400 font-bold">⚠ Inventory Attention</span>
            </div>
          </div>

        </div>

        {/* 4 Status Pills */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10 text-xs font-mono">
          <div className="bg-white/5 p-3 border border-white/10">
            <span className="text-[9px] text-[#E4E3E0]/40 uppercase">Revenue</span>
            <p className="font-bold text-emerald-400 text-sm mt-0.5">{currency}{stats.todayRevenue.toLocaleString()} (+{stats.revenueTrend}%)</p>
          </div>
          <div className="bg-white/5 p-3 border border-white/10">
            <span className="text-[9px] text-[#E4E3E0]/40 uppercase">Inventory</span>
            <p className="font-bold text-amber-400 text-sm mt-0.5">{stats.lowStockCount} Items Low Stock</p>
          </div>
          <div className="bg-white/5 p-3 border border-white/10">
            <span className="text-[9px] text-[#E4E3E0]/40 uppercase">Customers</span>
            <p className="font-bold text-emerald-400 text-sm mt-0.5">Healthy (92% active)</p>
          </div>
          <div className="bg-white/5 p-3 border border-white/10">
            <span className="text-[9px] text-[#E4E3E0]/40 uppercase">Finance</span>
            <p className="font-bold text-emerald-400 text-sm mt-0.5">Strong Cash Flow</p>
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. THE APPROVAL QUEUE (AI-Prepared Decision Center)            */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="bg-white border-x border-b border-[#141414] mt-6" id="approval-queue">
        
        {/* Section Header */}
        <div className="px-8 py-5 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#141414] text-[#E4E3E0] flex items-center justify-center font-bold">
              <Zap className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="font-bold text-sm uppercase tracking-wider text-[#141414]">Decision Approval Queue</h2>
              <p className="text-xs text-slate-500">AI prepared everything. You review and approve.</p>
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
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Approve All Actions
              </button>
            )}
          </div>
        </div>

        {/* Approval Queue Items */}
        <div className="divide-y divide-slate-100">
          {approvals.map(item => (
            <div 
              key={item.id} 
              className={`p-6 transition-colors flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
                item.approved ? 'bg-emerald-50/40' : 'hover:bg-slate-50/60'
              }`}
            >
              <div className="flex items-start gap-4 min-w-0 flex-1">
                {/* Category Badge */}
                <div className={`w-9 h-9 rounded-sm flex items-center justify-center shrink-0 mt-0.5 font-bold ${
                  item.approved 
                    ? 'bg-emerald-600 text-white' 
                    : item.urgency === 'critical'
                    ? 'bg-rose-100 text-rose-700 border border-rose-200'
                    : item.urgency === 'high'
                    ? 'bg-amber-100 text-amber-700 border border-amber-200'
                    : 'bg-slate-100 text-slate-700 border border-slate-200'
                }`}>
                  {item.approved ? <Check className="w-5 h-5" /> : item.category[0]}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 bg-slate-100 text-slate-600 font-bold border border-slate-200">
                      {item.category}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-emerald-700">
                      ⚡ {item.impact}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-[#141414] leading-tight">{item.title}</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.details}</p>
                </div>
              </div>

              {/* Action Button */}
              <div className="shrink-0 flex items-center gap-3 w-full md:w-auto justify-end">
                <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {item.estimatedMinutes} min
                </span>

                {item.approved ? (
                  <span className="bg-emerald-600 text-white px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Approved & Dispatched
                  </span>
                ) : (
                  <button
                    onClick={() => handleApprove(item.id)}
                    className="bg-[#141414] text-[#E4E3E0] hover:bg-black px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Check className="w-4 h-4 text-emerald-400" /> Approve Action
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 3. KEY METRICS CARDS                                          */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6" id="executive-metrics">
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

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 4. DIAGNOSTIC ENGINES (Root Cause & Operational Health)       */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="mt-6 space-y-6" id="diagnostic-engines">
        <RootCauseEngine 
          businessData={businessData} 
          currency={currency}
          onAskAI={(prompt) => { setPendingPrompt(prompt); onNavigate('chat'); }} 
        />
        <OperationalHealth 
          businessData={businessData} 
          currency={currency}
          onAskAI={(prompt) => { setPendingPrompt(prompt); onNavigate('chat'); }} 
        />
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 5. DEEP ANALYSIS CTA BANNER                                   */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="bg-[#141414] text-[#E4E3E0] p-6 border border-[#141414] mt-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4" id="deep-analysis-banner">
        <div>
          <h3 className="font-black text-base uppercase tracking-tight">Need Deep Exploration & Strategy?</h3>
          <p className="text-xs text-[#E4E3E0]/60 font-mono mt-1">Jump into Full Copilot to run custom queries, generate charts, and inspect customer segments.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('chat')}
            className="bg-[#E4E3E0] text-[#141414] hover:bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Bot className="w-4 h-4" /> Open Copilot Workspace →
          </button>
        </div>
      </div>

    </div>
  );
}

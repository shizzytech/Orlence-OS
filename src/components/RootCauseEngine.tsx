import React, { useMemo, useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, PackageX, Truck, Clock, UserX, Zap, ArrowRight, Search, Bot, TrendingUp } from 'lucide-react';
import { BusinessData } from '../types';

interface RootCauseEngineProps {
  businessData: BusinessData;
  currency: string;
  onAskAI: (prompt: string) => void;
}

interface Problem {
  id: string;
  title: string;
  severity: 'critical' | 'warning' | 'info';
  investigation: string[];
  impact: string;
  recommendation: string;
  preparedAction: string;
  aiPrompt: string;
}

export default function RootCauseEngine({ businessData, currency, onAskAI }: RootCauseEngineProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const problems = useMemo<Problem[]>(() => {
    const { orders, products, customers } = businessData;

    const detectedProblems: Problem[] = [];

    // --- Problem 1: Low stock causing potential lost orders ---
    const outOfStock = products.filter(p => p.stock === 0);
    const criticalStock = products.filter(p => p.stock > 0 && p.stock <= 5);

    if (outOfStock.length > 0) {
      const topItem = outOfStock[0];
      const relatedOrders = orders.filter(o => o.products && o.products.some(p => p.toLowerCase().includes(topItem.name.toLowerCase())));
      const pendingLost = relatedOrders.filter(o => o.status === 'Pending').length;

      detectedProblems.push({
        id: 'stock-out',
        title: `Inventory Stockout: ${topItem.name}`,
        severity: 'critical',
        investigation: [
          "Supplier delay of 4 days due to logistics bottleneck.",
          "Unexpected demand spike from weekend campaign (+200% traffic)."
        ],
        impact: `${currency}350,000 at risk in unfulfilled orders.`,
        recommendation: "Restock immediately and increase base reorder point to 10 units.",
        preparedAction: "Approve Supplier Purchase Order",
        aiPrompt: `Investigate decision: Restock supplier — ABC Textiles`,
      });
    }

    // --- Problem 2: Inactive high-value customers ---
    const referenceDate = new Date('2026-07-15');
    const inactiveVIPs = customers
      .filter(c => {
        const diffDays = Math.round((referenceDate.getTime() - new Date(c.lastActive).getTime()) / 86400000);
        return diffDays >= 30 && c.totalSpent > 50000;
      })
      .sort((a, b) => b.totalSpent - a.totalSpent);

    if (inactiveVIPs.length > 0) {
      const atRiskRevenue = inactiveVIPs.reduce((s, c) => s + c.totalSpent * 0.3, 0);
      detectedProblems.push({
        id: 'churn-risk',
        title: `VIP Churn Risk: ${inactiveVIPs[0].name}`,
        severity: 'warning',
        investigation: [
          `Customer has been inactive for ${Math.round((referenceDate.getTime() - new Date(inactiveVIPs[0].lastActive).getTime()) / 86400000)} days.`,
          "No follow-up outreach was performed after their last high-value purchase."
        ],
        impact: `${currency}${Math.round(atRiskRevenue).toLocaleString()} LTV at risk.`,
        recommendation: "Send personalized re-engagement offer with 10% loyalty discount.",
        preparedAction: "Approve WhatsApp Recovery Offer",
        aiPrompt: `Investigate decision: Recover VIP customer — ${inactiveVIPs[0].name}`,
      });
    }

    // --- Problem 3: Pending/unpaid orders piling up ---
    const pendingOrders = orders.filter(o => o.status === 'Pending');
    const pendingValue = pendingOrders.reduce((s, o) => s + o.amount, 0);

    if (pendingOrders.length >= 3) {
      detectedProblems.push({
        id: 'pending-orders',
        title: `${pendingOrders.length} Pending Orders Uncollected`,
        severity: 'warning',
        investigation: [
          "Checkout abandonment on payment step.",
          "No automated payment reminders configured for 48h window."
        ],
        impact: `${currency}${pendingValue.toLocaleString()} uncollected revenue.`,
        recommendation: "Enable automated Paystack payment reminders.",
        preparedAction: "Activate Payment Reminders",
        aiPrompt: `Investigate decision: Pending Orders Recovery`,
      });
    }

    return detectedProblems;
  }, [businessData, currency]);

  if (problems.length === 0) return null;

  const severityConfig = {
    critical: { dot: 'bg-rose-500', badge: 'bg-rose-100 text-rose-700 border-rose-200', border: 'border-l-rose-500' },
    warning: { dot: 'bg-amber-500', badge: 'bg-amber-100 text-amber-700 border-amber-200', border: 'border-l-amber-500' },
    info: { dot: 'bg-blue-500', badge: 'bg-blue-100 text-blue-700 border-blue-200', border: 'border-l-blue-500' },
  };

  return (
    <div className="bg-white border border-[#141414] rounded-none" id="root-cause-engine">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#141414]/15">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-indigo-600 flex items-center justify-center rounded-sm shrink-0">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400 leading-none mb-0.5">AI REASONING ENGINE</p>
            <p className="text-sm font-bold text-[#141414]">Investigating {problems.length} Problem{problems.length > 1 ? 's' : ''}</p>
          </div>
        </div>
        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider hidden sm:block">
          Click to see reasoning →
        </span>
      </div>

      {/* Problems list */}
      <div className="divide-y divide-[#141414]/10">
        {problems.map(problem => {
          const isOpen = expandedId === problem.id;
          const cfg = severityConfig[problem.severity];

          return (
            <div key={problem.id} className={`border-l-4 ${cfg.border}`}>
              {/* Problem header row */}
              <button
                className="w-full text-left px-5 py-4 flex items-start justify-between gap-4 hover:bg-slate-50/60 transition-colors"
                onClick={() => setExpandedId(isOpen ? null : problem.id)}
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${cfg.dot}`} />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[#141414] leading-snug">{problem.title}</p>
                    <p className="text-[11px] font-mono text-slate-500 mt-1">Impact: <strong className="text-rose-600">{problem.impact}</strong></p>
                  </div>
                </div>
                <div className="shrink-0 mt-0.5 text-slate-400">
                  {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {/* Expanded reasoning flow */}
              {isOpen && (
                <div className="px-5 pb-6 pt-2 bg-slate-50/40 border-t border-[#141414]/8">
                  <div className="relative pl-6 space-y-6 mt-4 before:absolute before:inset-y-0 before:left-2.5 before:w-px before:bg-slate-200">
                    
                    {/* 1. Problem Statement */}
                    <div className="relative">
                      <div className="absolute -left-[27px] w-5 h-5 bg-white border border-slate-300 rounded-full flex items-center justify-center">
                        <AlertTriangle className="w-2.5 h-2.5 text-rose-500" />
                      </div>
                      <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold mb-1">Problem</p>
                      <p className="text-sm font-bold text-[#141414]">{problem.title}</p>
                    </div>

                    {/* 2. AI Investigation */}
                    <div className="relative">
                      <div className="absolute -left-[27px] w-5 h-5 bg-white border border-slate-300 rounded-full flex items-center justify-center">
                        <Search className="w-2.5 h-2.5 text-indigo-500" />
                      </div>
                      <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold mb-2">AI Investigation</p>
                      <ul className="space-y-2">
                        {problem.investigation.map((inv, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-indigo-500 mt-1"><ArrowRight className="w-3 h-3" /></span>
                            <span className="text-sm text-slate-600">{inv}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* 3. Impact */}
                    <div className="relative">
                      <div className="absolute -left-[27px] w-5 h-5 bg-white border border-slate-300 rounded-full flex items-center justify-center">
                        <TrendingUp className="w-2.5 h-2.5 text-rose-500" />
                      </div>
                      <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold mb-1">Impact</p>
                      <p className="text-sm font-bold text-rose-600">{problem.impact}</p>
                    </div>

                    {/* 4. Recommendation & Action */}
                    <div className="relative">
                      <div className="absolute -left-[27px] w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center ring-4 ring-slate-50/40">
                        <Bot className="w-2.5 h-2.5 text-white" />
                      </div>
                      <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold mb-1">Recommendation</p>
                      <p className="text-sm text-slate-700 mb-3">{problem.recommendation}</p>
                      
                      <button
                        onClick={() => onAskAI(problem.aiPrompt)}
                        className="bg-[#141414] text-[#E4E3E0] hover:bg-black px-4 py-2 text-xs font-bold font-mono uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-sm rounded-sm"
                      >
                        <Zap className="w-3.5 h-3.5 text-emerald-400" />
                        {problem.preparedAction}
                      </button>
                    </div>

                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

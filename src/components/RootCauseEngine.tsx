import React, { useMemo, useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, PackageX, Truck, Clock, UserX, Zap, ArrowRight } from 'lucide-react';
import { BusinessData } from '../types';

interface RootCauseEngineProps {
  businessData: BusinessData;
  currency: string;
  onAskAI: (prompt: string) => void;
}

interface Problem {
  id: string;
  title: string;
  delta: string;
  deltaPositive: boolean;
  severity: 'critical' | 'warning' | 'info';
  causes: { label: string; pct: number; icon: React.ReactNode; color: string }[];
  recommendations: string[];
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
      const relatedOrders = orders.filter(o => o.product === topItem.name);
      const pendingLost = relatedOrders.filter(o => o.status === 'Pending' || o.status === 'Cancelled').length;

      detectedProblems.push({
        id: 'stock-out',
        title: `${outOfStock.length} product${outOfStock.length > 1 ? 's' : ''} out of stock - deliveries at risk`,
        delta: `${pendingLost} orders affected`,
        deltaPositive: false,
        severity: 'critical',
        causes: [
          { label: 'Inventory shortage', pct: 58, icon: <PackageX className="w-3.5 h-3.5" />, color: 'bg-rose-500' },
          { label: 'Reorder delay', pct: 24, icon: <Clock className="w-3.5 h-3.5" />, color: 'bg-amber-400' },
          { label: 'Supplier lead time', pct: 12, icon: <Truck className="w-3.5 h-3.5" />, color: 'bg-orange-400' },
          { label: 'Forecast miss', pct: 6, icon: <AlertTriangle className="w-3.5 h-3.5" />, color: 'bg-slate-400' },
        ],
        recommendations: [
          `Increase reorder point for ${topItem.name} - currently 0 units with ${relatedOrders.length} past orders.`,
          `Set a low-stock alert trigger at 10 units for high-velocity items.`,
          `Ask Orlence to draft an urgent supplier restock order today.`,
        ],
        aiPrompt: `Analyze the stock-out situation for ${topItem.name} at ${businessData.businessName}. Which orders are at risk, what is the potential lost revenue, and draft an urgent supplier restock email.`,
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
        title: `${inactiveVIPs.length} high-value customer${inactiveVIPs.length > 1 ? 's' : ''} showing churn signals`,
        delta: `${currency}${Math.round(atRiskRevenue).toLocaleString()} at risk`,
        deltaPositive: false,
        severity: 'warning',
        causes: [
          { label: 'No follow-up outreach', pct: 45, icon: <UserX className="w-3.5 h-3.5" />, color: 'bg-rose-500' },
          { label: 'No loyalty offer', pct: 30, icon: <AlertTriangle className="w-3.5 h-3.5" />, color: 'bg-amber-400' },
          { label: 'Product unavailability', pct: 15, icon: <PackageX className="w-3.5 h-3.5" />, color: 'bg-orange-400' },
          { label: 'Price sensitivity', pct: 10, icon: <Clock className="w-3.5 h-3.5" />, color: 'bg-slate-400' },
        ],
        recommendations: [
          `Send a personal WhatsApp re-engagement to ${inactiveVIPs[0].name} - inactive ${Math.round((referenceDate.getTime() - new Date(inactiveVIPs[0].lastActive).getTime()) / 86400000)} days.`,
          `Offer a 10% returning customer discount to the top ${Math.min(3, inactiveVIPs.length)} lapsed VIPs.`,
          `Schedule a monthly VIP check-in to catch churn earlier.`,
        ],
        aiPrompt: `My top customer ${inactiveVIPs[0].name} has not purchased in over 30 days at ${businessData.businessName}. Draft a warm, personalised WhatsApp re-engagement message with a 10% loyalty discount to win them back.`,
      });
    }

    // --- Problem 3: Pending/unpaid orders piling up ---
    const pendingOrders = orders.filter(o => o.status === 'Pending');
    const pendingValue = pendingOrders.reduce((s, o) => s + o.amount, 0);

    if (pendingOrders.length >= 3) {
      detectedProblems.push({
        id: 'pending-orders',
        title: `${pendingOrders.length} orders pending - ${currency}${pendingValue.toLocaleString()} uncollected`,
        delta: `Avg. ${Math.round(pendingOrders.length / 7)} per day this week`,
        deltaPositive: false,
        severity: 'warning',
        causes: [
          { label: 'Payment not completed', pct: 52, icon: <AlertTriangle className="w-3.5 h-3.5" />, color: 'bg-rose-500' },
          { label: 'Order not confirmed', pct: 28, icon: <Clock className="w-3.5 h-3.5" />, color: 'bg-amber-400' },
          { label: 'Stock not yet available', pct: 14, icon: <PackageX className="w-3.5 h-3.5" />, color: 'bg-orange-400' },
          { label: 'Customer unreachable', pct: 6, icon: <UserX className="w-3.5 h-3.5" />, color: 'bg-slate-400' },
        ],
        recommendations: [
          `Send automated Paystack payment reminders for the ${pendingOrders.length} open orders.`,
          `Identify which pending orders are held due to stock - resolve those first.`,
          `Set a 48-hour auto-cancel rule to keep the pipeline clean.`,
        ],
        aiPrompt: `I have ${pendingOrders.length} pending orders worth ${currency}${pendingValue.toLocaleString()} at ${businessData.businessName}. Analyze why they might be stuck and recommend the fastest path to converting or resolving them.`,
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
          <div className="w-7 h-7 bg-rose-600 flex items-center justify-center rounded-sm shrink-0">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400 leading-none mb-0.5">AI ROOT CAUSE ENGINE</p>
            <p className="text-sm font-bold text-[#141414]">{problems.length} Problem{problems.length > 1 ? 's' : ''} Detected</p>
          </div>
        </div>
        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider hidden sm:block">
          Click a problem to see the breakdown →
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
                    <p className="text-[11px] font-mono text-rose-600 mt-1 font-semibold">{problem.delta}</p>
                  </div>
                </div>
                <div className="shrink-0 mt-0.5 text-slate-400">
                  {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {/* Expanded breakdown */}
              {isOpen && (
                <div className="px-5 pb-6 bg-slate-50/40 border-t border-[#141414]/8">
                  <div className="pt-5 grid md:grid-cols-2 gap-8">
                    {/* Cause bars */}
                    <div>
                      <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-3 font-bold">Likely Causes</p>
                      <div className="space-y-3">
                        {problem.causes.map((cause, i) => (
                          <div key={i}>
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-1.5 text-slate-600">
                                {cause.icon}
                                <span className="text-xs font-medium">{cause.label}</span>
                              </div>
                              <span className="text-xs font-bold font-mono text-slate-700">{cause.pct}%</span>
                            </div>
                            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${cause.color} transition-all duration-700`}
                                style={{ width: `${cause.pct}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recommendations */}
                    <div>
                      <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-3 font-bold">Recommendations</p>
                      <ul className="space-y-3 mb-5">
                        {problem.recommendations.map((rec, i) => (
                          <li key={i} className="flex items-start gap-2.5">
                            <span className="text-emerald-600 font-bold font-mono text-xs mt-0.5 shrink-0">{i + 1}.</span>
                            <span className="text-xs text-slate-700 leading-relaxed">{rec}</span>
                          </li>
                        ))}
                      </ul>
                      <button
                        onClick={() => onAskAI(problem.aiPrompt)}
                        className="flex items-center gap-2 text-xs font-bold font-mono uppercase tracking-wider bg-[#141414] text-white px-4 py-2.5 hover:bg-rose-600 transition-colors"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        Analyse with Orlence
                        <ArrowRight className="w-3.5 h-3.5" />
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

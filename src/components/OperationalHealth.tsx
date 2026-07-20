import React, { useMemo, useState } from 'react';
import { Shield, TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp, Package, ShoppingBag, Users, Truck, Activity } from 'lucide-react';
import { BusinessData } from '../types';

interface OperationalHealthProps {
  businessData: BusinessData;
  currency: string;
  onAskAI: (prompt: string) => void;
}

interface ScoreDimension {
  id: string;
  label: string;
  score: number;
  previousScore: number;
  icon: React.ReactNode;
  color: string;
  trackColor: string;
  reasons: string[];
  aiPrompt: string;
}

function getScoreColor(score: number) {
  if (score >= 85) return { text: 'text-emerald-600', bar: 'bg-emerald-500', track: 'bg-emerald-100' };
  if (score >= 70) return { text: 'text-amber-600', bar: 'bg-amber-400', track: 'bg-amber-100' };
  return { text: 'text-rose-600', bar: 'bg-rose-500', track: 'bg-rose-100' };
}

function ScoreRing({ score }: { score: number }) {
  const { text } = getScoreColor(score);
  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (score / 100) * circumference;
  const strokeColor = score >= 85 ? '#10b981' : score >= 70 ? '#f59e0b' : '#f43f5e';

  return (
    <div className="relative w-28 h-28 flex items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 96 96" width="112" height="112">
        <circle cx="48" cy="48" r="40" fill="none" stroke="#e2e8f0" strokeWidth="8" />
        <circle
          cx="48" cy="48" r="40" fill="none"
          stroke={strokeColor} strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div className="text-center">
        <p className={`text-2xl font-black font-mono leading-none ${text}`}>{score}</p>
        <p className="text-[9px] font-mono text-slate-400 uppercase tracking-wider mt-0.5">/ 100</p>
      </div>
    </div>
  );
}

export default function OperationalHealth({ businessData, currency, onAskAI }: OperationalHealthProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const dimensions = useMemo<ScoreDimension[]>(() => {
    const { orders, products, customers } = businessData;
    const referenceDate = new Date('2026-07-15');

    // --- 1. INVENTORY HEALTH ---
    const totalProducts = products.length;
    const outOfStock = products.filter(p => p.stock === 0).length;
    const criticalStock = products.filter(p => p.stock > 0 && p.stock <= 5).length;
    const healthyStock = products.filter(p => p.stock > 5).length;
    const inventoryScore = Math.max(0, Math.round(
      100 - (outOfStock / totalProducts) * 50 - (criticalStock / totalProducts) * 20
    ));
    const inventoryPrev = Math.min(100, inventoryScore + (outOfStock > 0 ? 5 : -2));

    const inventoryReasons: string[] = [];
    if (outOfStock > 0) inventoryReasons.push(`${outOfStock} product${outOfStock > 1 ? 's' : ''} completely out of stock - creating fulfillment risk.`);
    if (criticalStock > 0) inventoryReasons.push(`${criticalStock} product${criticalStock > 1 ? 's' : ''} at critical low stock (≤5 units).`);
    if (healthyStock === totalProducts) inventoryReasons.push('All products well-stocked. No shortages detected.');
    if (inventoryReasons.length === 0) inventoryReasons.push('Inventory levels are within acceptable range.');

    // --- 2. FULFILLMENT RATE ---
    const paidOrders = orders.filter(o => o.status === 'Paid').length;
    const pendingOrders = orders.filter(o => o.status === 'Pending').length;
    const refundedOrders = orders.filter(o => o.status === 'Refunded').length;
    const totalOrders = orders.length;
    const fulfillmentScore = totalOrders > 0 ? Math.round((paidOrders / totalOrders) * 100) : 80;
    const fulfillmentPrev = Math.min(100, fulfillmentScore + (pendingOrders > 5 ? 4 : -2));

    const fulfillmentReasons: string[] = [];
    if (pendingOrders > 0) fulfillmentReasons.push(`${pendingOrders} orders still pending payment or confirmation.`);
    if (refundedOrders > 0) fulfillmentReasons.push(`${refundedOrders} refunds processed - may indicate product or delivery issues.`);
    fulfillmentReasons.push(`${paidOrders} of ${totalOrders} orders successfully paid and fulfilled (${fulfillmentScore}%).`);

    // --- 3. CUSTOMER SATISFACTION (proxy: retention + recency) ---
    const activeCustomers = customers.filter(c => {
      const days = Math.round((referenceDate.getTime() - new Date(c.lastActive).getTime()) / 86400000);
      return days <= 30;
    }).length;
    const repeatCustomers = customers.filter(c => c.totalOrders >= 2).length;
    const satisfactionScore = Math.round(
      ((activeCustomers / customers.length) * 50) + ((repeatCustomers / customers.length) * 50)
    );
    const satisfactionPrev = Math.min(100, satisfactionScore + 3);

    const satisfactionReasons: string[] = [];
    satisfactionReasons.push(`${activeCustomers} of ${customers.length} customers active in the last 30 days.`);
    satisfactionReasons.push(`${repeatCustomers} repeat customers - a strong retention signal.`);
    const lapsedVIPs = customers.filter(c => {
      const days = Math.round((referenceDate.getTime() - new Date(c.lastActive).getTime()) / 86400000);
      return days > 30 && c.totalSpent > 50000;
    }).length;
    if (lapsedVIPs > 0) satisfactionReasons.push(`${lapsedVIPs} high-value customer${lapsedVIPs > 1 ? 's' : ''} lapsed - proactive outreach recommended.`);

    // --- 4. DELIVERY RELIABILITY (proxy: pending rate + refund signals) ---
    const pendingRate = pendingOrders / Math.max(totalOrders, 1);
    const refundRate = refundedOrders / Math.max(totalOrders, 1);
    const deliveryScore = Math.max(40, Math.round(100 - pendingRate * 40 - refundRate * 60));
    const deliveryPrev = Math.min(100, deliveryScore + 6);

    const deliveryReasons: string[] = [];
    if (pendingRate > 0.15) deliveryReasons.push(`High pending rate (${Math.round(pendingRate * 100)}%) suggests delivery or payment completion delays.`);
    if (refundRate > 0) deliveryReasons.push(`${refundedOrders} refund${refundedOrders > 1 ? 's' : ''} detected - investigate root cause (product quality or courier).`);
    if (pendingRate <= 0.1 && refundRate === 0) deliveryReasons.push('Delivery pipeline is clean - no significant delays or refunds.');
    if (outOfStock > 0) deliveryReasons.push(`${outOfStock} out-of-stock item${outOfStock > 1 ? 's' : ''} will delay active deliveries if not restocked.`);

    return [
      {
        id: 'inventory',
        label: 'Inventory Health',
        score: inventoryScore,
        previousScore: inventoryPrev,
        icon: <Package className="w-4 h-4" />,
        color: '',
        trackColor: '',
        reasons: inventoryReasons,
        aiPrompt: `Give me a detailed inventory health analysis for ${businessData.businessName}. Which products are at risk, what's the projected revenue impact of stock-outs, and what's the optimal reorder schedule?`,
      },
      {
        id: 'fulfillment',
        label: 'Fulfillment Rate',
        score: fulfillmentScore,
        previousScore: fulfillmentPrev,
        icon: <ShoppingBag className="w-4 h-4" />,
        color: '',
        trackColor: '',
        reasons: fulfillmentReasons,
        aiPrompt: `Analyze the fulfillment rate for ${businessData.businessName}. Why are ${pendingOrders} orders still pending? What's the fastest path to closing them?`,
      },
      {
        id: 'satisfaction',
        label: 'Customer Satisfaction',
        score: satisfactionScore,
        previousScore: satisfactionPrev,
        icon: <Users className="w-4 h-4" />,
        color: '',
        trackColor: '',
        reasons: satisfactionReasons,
        aiPrompt: `Analyze customer satisfaction and retention signals for ${businessData.businessName}. Who are the highest-risk customers for churn and what outreach should we send this week?`,
      },
      {
        id: 'delivery',
        label: 'Delivery Reliability',
        score: deliveryScore,
        previousScore: deliveryPrev,
        icon: <Truck className="w-4 h-4" />,
        color: '',
        trackColor: '',
        reasons: deliveryReasons,
        aiPrompt: `Investigate delivery reliability for ${businessData.businessName}. What is causing delays or refunds, and what operational changes would improve on-time delivery rates?`,
      },
    ];
  }, [businessData]);

  const overallScore = Math.round(dimensions.reduce((sum, d) => sum + d.score, 0) / dimensions.length);
  const overallPrev = Math.round(dimensions.reduce((sum, d) => sum + d.previousScore, 0) / dimensions.length);
  const overallDelta = overallScore - overallPrev;
  const overallColors = getScoreColor(overallScore);

  const overallLabel =
    overallScore >= 85 ? 'Excellent' :
    overallScore >= 70 ? 'Good' :
    overallScore >= 55 ? 'Needs Attention' : 'At Risk';

  return (
    <div className="bg-white border border-[#141414] rounded-none" id="operational-health">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 py-4 border-b border-[#141414]/15">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-[#141414] flex items-center justify-center rounded-sm shrink-0">
            <Shield className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400 leading-none mb-0.5">OPERATIONAL HEALTH</p>
            <p className="text-sm font-bold text-[#141414]">Business Trust Score</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className={`text-xs font-mono font-bold uppercase tracking-wider ${overallColors.text}`}>{overallLabel}</span>
          <div className={`flex items-center gap-1 text-xs font-mono font-semibold ${overallDelta >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
            {overallDelta > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : overallDelta < 0 ? <TrendingDown className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
            {overallDelta > 0 ? '+' : ''}{overallDelta} pts vs last week
          </div>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Overall Score Ring + breakdown */}
        <div className="flex flex-col sm:flex-row items-center gap-6 p-5 bg-slate-50 border border-slate-200 rounded-none">
          <div className="shrink-0 flex flex-col items-center gap-1.5">
            <ScoreRing score={overallScore} />
            <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Business Health</p>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-3 w-full">
            {dimensions.map(d => {
              const colors = getScoreColor(d.score);
              const delta = d.score - d.previousScore;
              return (
                <div key={d.id} className="flex items-center gap-2.5">
                  <div className={`w-6 h-6 rounded-sm flex items-center justify-center shrink-0 ${colors.track}`}>
                    <span className={colors.text}>{d.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[10px] font-mono text-slate-500 truncate">{d.label}</p>
                      <div className="flex items-center gap-1 shrink-0 ml-1">
                        <span className={`text-xs font-black font-mono ${colors.text}`}>{d.score}</span>
                        <span className={`text-[9px] font-mono ${delta >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {delta > 0 ? '▲' : delta < 0 ? '▼' : '-'}{Math.abs(delta)}
                        </span>
                      </div>
                    </div>
                    <div className={`h-1.5 rounded-full ${colors.track} overflow-hidden`}>
                      <div className={`h-full rounded-full ${colors.bar} transition-all duration-700`} style={{ width: `${d.score}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Expandable dimension details */}
        <div className="border border-[#141414]/15 divide-y divide-[#141414]/10">
          {dimensions.map(d => {
            const isOpen = expandedId === d.id;
            const colors = getScoreColor(d.score);
            const delta = d.score - d.previousScore;

            return (
              <div key={d.id}>
                <button
                  className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-slate-50/60 transition-colors text-left"
                  onClick={() => setExpandedId(isOpen ? null : d.id)}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`w-8 h-8 rounded-sm flex items-center justify-center shrink-0 ${colors.track}`}>
                      <span className={colors.text}>{d.icon}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-[#141414]">{d.label}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className={`h-1.5 w-24 rounded-full ${colors.track} overflow-hidden`}>
                          <div className={`h-full rounded-full ${colors.bar}`} style={{ width: `${d.score}%` }} />
                        </div>
                        <span className={`text-xs font-black font-mono ${colors.text}`}>{d.score}%</span>
                        <span className={`text-[10px] font-mono ${delta >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {delta > 0 ? `▲ +${delta}` : delta < 0 ? `▼ ${delta}` : '-'} pts
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-slate-400 ml-2 shrink-0">
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 bg-slate-50/40 border-t border-[#141414]/8">
                    <div className="pt-4">
                      <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-3 font-bold">Why this score</p>
                      <ul className="space-y-2.5 mb-4">
                        {d.reasons.map((r, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <Activity className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                            <span className="text-xs text-slate-700 leading-relaxed">{r}</span>
                          </li>
                        ))}
                      </ul>
                      <button
                        onClick={() => onAskAI(d.aiPrompt)}
                        className="text-[10px] font-mono uppercase tracking-wider font-bold text-emerald-700 border border-emerald-300 bg-emerald-50 px-3 py-2 hover:bg-emerald-100 transition-colors flex items-center gap-1.5"
                      >
                        <Shield className="w-3 h-3" />
                        Deep-dive with Orlence
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

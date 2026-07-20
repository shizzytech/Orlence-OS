import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle, 
  TrendingUp, 
  CornerDownLeft, 
  RefreshCw, 
  Copy, 
  Check, 
  AlertTriangle, 
  ShoppingBag, 
  Users, 
  DollarSign, 
  ArrowUpRight,
  MessageSquare,
  HelpCircle,
  Clock,
  Briefcase,
  Zap,
  CheckCircle2
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
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

export default function HomeFeed({ 
  businessData, 
  integrations, 
  chatHistory, 
  setChatHistory, 
  onNavigate,
  pendingPrompt,
  setPendingPrompt
}: HomeFeedProps) {
  const { orders, products, customers, currency, businessName } = businessData;
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat panel
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isLoading]);

  // Trigger pending prompt from parent navigation (e.g. ✨ Explain from Dashboard)
  useEffect(() => {
    if (pendingPrompt) {
      handleSendMessage(pendingPrompt);
      setPendingPrompt(null);
    }
  }, [pendingPrompt]);

  // Determine owner name & greeting based on active business
  const { ownerName, greetingPrefix } = React.useMemo(() => {
    if (businessName === "Sartorial Africa") {
      return { ownerName: "Sarah", greetingPrefix: "Good morning" };
    } else if (businessName === "Kigali Coffee Co.") {
      return { ownerName: "Marie Claire", greetingPrefix: "Mwiriwe" };
    } else if (businessName === "AfroBeats Tech") {
      return { ownerName: "Farah", greetingPrefix: "Good morning" };
    }
    return { ownerName: "Partner", greetingPrefix: "Hello" };
  }, [businessName]);

  // Calculations for Today (2026-07-15) and Yesterday (2026-07-14)
  const stats = React.useMemo(() => {
    const todayStr = "2026-07-15";
    const yesterdayStr = "2026-07-14";

    const todayOrders = orders.filter(o => o.date === todayStr);
    const todayRevenue = todayOrders.filter(o => o.status === 'Paid').reduce((sum, o) => sum + o.amount, 0);

    const yesterdayOrders = orders.filter(o => o.date === yesterdayStr);
    const yesterdayRevenue = yesterdayOrders.filter(o => o.status === 'Paid').reduce((sum, o) => sum + o.amount, 0);

    const totalRevenue = orders.filter(o => o.status === 'Paid').reduce((sum, o) => sum + o.amount, 0);
    const lowStockCount = products.filter(p => p.stock <= 5).length;
    const outOfStockCount = products.filter(p => p.stock === 0).length;

    // Inactive customers for over 30 days (lastActive before 2026-06-15)
    const inactiveCustomersCount = customers.filter(c => {
      const activeDate = new Date(c.lastActive);
      const limitDate = new Date("2026-06-15");
      return activeDate < limitDate;
    }).length;

    // Calculate percentage increase
    let revenueTrend = 0;
    if (yesterdayRevenue > 0) {
      revenueTrend = Math.round(((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100);
    } else if (todayRevenue > 0) {
      revenueTrend = 100; // default indicator
    }

    return {
      todayRevenue,
      todayOrdersCount: todayOrders.length,
      yesterdayRevenue,
      totalRevenue,
      lowStockCount,
      outOfStockCount,
      inactiveCustomersCount,
      revenueTrend
    };
  }, [orders, products, customers]);

  // Dynamic AI COO Briefing calculations
  const cooBriefing = React.useMemo(() => {
    const yesterdayRevStr = `${currency}${stats.yesterdayRevenue.toLocaleString()}`;

    // Get the name of products needing restocking
    const lowStockItems = products.filter(p => p.stock <= 5);
    const lowStockCountWord = lowStockItems.length === 1 
      ? "One product needs restocking" 
      : `${lowStockItems.length} products need restocking`;
    
    const lowStockNames = lowStockItems.map(p => `${p.name} (${p.stock} left)`).join(', ');

    // Find the most valuable customer who has been inactive the longest (>= 7 days inactive)
    const potentialVips = [...customers]
      .filter(c => {
        const lastActiveDate = new Date(c.lastActive);
        const referenceDate = new Date("2026-07-15");
        const diffDays = Math.round((referenceDate.getTime() - lastActiveDate.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays >= 7;
      })
      .sort((a, b) => b.totalSpent - a.totalSpent);

    let inactiveCustomerName = "Your best customer";
    let inactiveDays = 18;
    if (potentialVips.length > 0) {
      const bestInactive = potentialVips[0];
      inactiveCustomerName = bestInactive.name;
      const lastActiveDate = new Date(bestInactive.lastActive);
      const referenceDate = new Date("2026-07-15");
      inactiveDays = Math.round((referenceDate.getTime() - lastActiveDate.getTime()) / (1000 * 60 * 60 * 24));
    }

    let actionPrompt = "";
    let actionLabel = "";
    let actionText = "";
    if (businessName === "Sartorial Africa") {
      actionPrompt = "Would you like me to prepare a WhatsApp campaign?";
      actionLabel = "Prepare WhatsApp Campaign";
      actionText = `Draft a warm, polite WhatsApp message with a 10% returning loyalty discount to send to inactive VIP customer ${inactiveCustomerName}, who has been inactive for ${inactiveDays} days.`;
    } else if (businessName === "Kigali Coffee Co.") {
      actionPrompt = "Would you like me to prepare a wholesale partner email?";
      actionLabel = "Prepare Wholesale Email";
      actionText = `Draft a professional wholesale partner email for ${inactiveCustomerName}, who hasn't ordered in ${inactiveDays} days, proposing a loyalty price of 16,000 RWF per kg on Arabica Medium Roast.`;
    } else {
      actionPrompt = "Would you like me to prepare a re-activation offer?";
      actionLabel = "Prepare Re-activation Offer";
      actionText = `Draft an engaging re-engagement outreach email for inactive client ${inactiveCustomerName}, recommending our Mechanical Bluetooth Keyboard with a special $15 off voucher.`;
    }

    return {
      yesterdayRevStr,
      lowStockCountWord,
      lowStockNames,
      inactiveCustomerName,
      inactiveDays,
      actionPrompt,
      actionLabel,
      actionText
    };
  }, [currency, stats, products, customers, businessName]);

  // Dynamic recommendations with integrated quick actions
  const recommendations = React.useMemo(() => {
    if (businessName === "Sartorial Africa") {
      return [
        {
          id: 'rec-1',
          type: 'inventory',
          title: 'Critical Inventory Alert: Adire Silk Kaftan',
          desc: 'This item is completely OUT OF STOCK but has high sales volume (19 units). Potential lost revenue is ₦1,805,000 this week if unfulfilled.',
          metric: '0 in stock',
          actionLabel: 'Draft Supplier Order',
          actionText: 'Draft a professional email to our silk textile supplier requesting an urgent restock order of 30 yards of Adire Silk Kaftan fabric. Specify premium quality.'
        },
        {
          id: 'rec-2',
          type: 'finance',
          title: 'Recover Unpaid Capital: Follow Up Customers',
          desc: 'Nneka Okafor has been inactive for over 60 days. Babajide Soyinka is also nearing 30 days since last purchase.',
          metric: '2 Inactive Leads',
          actionLabel: 'Create WhatsApp Follow-Up',
          actionText: 'Draft a friendly, polite WhatsApp re-engagement message with a 10% returning loyalty discount to send to inactive customer Nneka Okafor.'
        },
        {
          id: 'rec-3',
          type: 'marketing',
          title: 'Accessories Bundle Opportunity',
          desc: 'Aso Oke Cap handwoven is our fastest-moving accessory (65 sales). Bundling it with Senator Suit Classic could boost average order value by 15%.',
          metric: '+15% AOV Potential',
          actionLabel: 'Generate Promo Campaign',
          actionText: 'Create an engaging social media post and promotion caption for a new "Imperial Senate Bundle" containing the Senator Suit Classic paired with a matching handwoven Aso Oke Cap.'
        }
      ];
    } else if (businessName === "Kigali Coffee Co.") {
      return [
        {
          id: 'rec-1',
          type: 'inventory',
          title: 'Equipment Shortage Alert',
          desc: 'Commercial Burr Grinder is down to the last unit (1 left) and French Press Classic is critical (3 left). Wholesalers have increased inquiries.',
          metric: 'Critical Low Stock',
          actionLabel: 'Draft Procurement Order',
          actionText: 'Draft a restocking request for 10 units of Commercial Burr Grinders and 25 French Presses to our distribution partner in Nairobi.'
        },
        {
          id: 'rec-2',
          type: 'finance',
          title: 'Wholesale Retention Alert',
          desc: 'David Peterson (david@expateats.rw) spent 45,000 RWF but hasn\'t placed a wholesale order in 35 days.',
          metric: '1 Inactive Wholesaler',
          actionLabel: 'Draft Wholesaler Email',
          actionText: 'Draft a professional wholesale partner email for David Peterson offering a loyalty wholesale price of 16,000 RWF per kg on Arabica Medium Roast for orders over 10kg.'
        },
        {
          id: 'rec-3',
          type: 'marketing',
          title: 'Peaberry Batch Promotion',
          desc: 'Peaberry Single Origin has sold 95 bags. High margin batch remains highly requested but requires wholesale traction.',
          metric: 'High Margin Item',
          actionLabel: 'Generate Newsletter Draft',
          actionText: 'Write a beautiful B2B marketing newsletter pitch highlighting the unique floral cupping notes of our fresh Peaberry Single Origin and invite coffee shops to order.'
        }
      ];
    } else {
      return [
        {
          id: 'rec-1',
          type: 'inventory',
          title: 'Stock Outage: MagSafe Desk Stands',
          desc: 'MagSafe Wooden Desk Stand is currently at 0 inventory. We have lost an estimated $2,430 in potential revenue over the last month.',
          metric: '0 in stock',
          actionLabel: 'Draft Restock Request',
          actionText: 'Draft a supplier replenishment email for 50 units of the MagSafe Wooden Desk Stand, asking for wholesale pricing and shipment ETA.'
        },
        {
          id: 'rec-2',
          type: 'finance',
          title: 'Invoicing & Unpaid Leads',
          desc: 'Kwame Appiah (kwame.appiah@accrahub.com) has been inactive for 34 days. Previously purchased Fast Charge GaN Chargers.',
          metric: '1 Inactive Customer',
          actionLabel: 'Draft Re-activation Offer',
          actionText: 'Draft a highly compelling re-engagement promotion to Kwame Appiah, proposing our Mechanical Bluetooth Keyboard with a $15 off discount voucher.'
        },
        {
          id: 'rec-3',
          type: 'marketing',
          title: 'Audio Accessories Cross-Sell',
          desc: 'Premium Noise-Cancelling Earbuds sold 142 units. Customer cohort analysis indicates a 68% overlap with tech desk mats.',
          metric: 'Bundle Opportunity',
          actionLabel: 'Generate Social Post',
          actionText: 'Write an Instagram post copy promoting a "Sleek Workspace Bundle" pairing the Premium Earbuds with our Ultra-Wide RGB Desk Mat for active desk setups.'
        }
      ];
    }
  }, [businessName]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatHistory(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...chatHistory, userMessage],
          businessData,
          integrations
        })
      });

      const data = await response.json();
      
      if (response.ok && data.text) {
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: data.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setChatHistory(prev => [...prev, aiMessage]);
      } else {
        throw new Error(data.error || 'The co-pilot was unable to synthesize a response.');
      }
    } catch (err: any) {
      console.error(err);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: `⚠️ **Error:** ${err.message || "Failed to communicate with Orlence's server. Please verify your GEMINI_API_KEY in the Secrets panel."}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    let channelLabel = "WhatsApp campaign";
    if (businessName === "Sartorial Africa") {
      channelLabel = "WhatsApp campaign";
    } else if (businessName === "Kigali Coffee Co.") {
      channelLabel = "wholesale re-engagement email";
    } else if (businessName === "AfroBeats Tech") {
      channelLabel = "re-activation sequence";
    }

    setChatHistory([
      {
        id: 'welcome',
        sender: 'assistant',
        text: `💼 **Meet your AI COO.**

*"${greetingPrefix}, ${ownerName}."*

* **Revenue yesterday:** \`${cooBriefing.yesterdayRevStr}\`
* **Inventory status:** \`${cooBriefing.lowStockCountWord}.\`
* **Customer alert:** Your best customer, **${cooBriefing.inactiveCustomerName}**, hasn't ordered in \`${cooBriefing.inactiveDays} days\`.

Would you like me to prepare a ${channelLabel}?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in" id="home-feed-view">
      {/* LEFT COLUMN: Daily Briefing & Recommended Action Items (2/3 Width) */}
      <div className="lg:col-span-7 xl:col-span-8 space-y-6" id="feed-left-col">
        
        {/* CEO Personal Greeting & Overview - Styled as AI Chief Operating Officer */}
        <div className="bg-[#141414] text-[#E4E3E0] p-6 border-2 border-[#141414] rounded-none shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] relative overflow-hidden" id="ceo-header-panel">
          {/* Subtle background pattern of digital lines */}
          <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#E4E3E0_1px,transparent_1px)] [background-size:16px_16px]"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E4E3E0]/20 pb-4 mb-5 gap-3">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-slate-400">
                  MEET YOUR AI CHIEF OPERATING OFFICER (COO)
                </span>
              </div>
              
              <div className="text-left sm:text-right font-mono text-[9px] uppercase text-slate-400 bg-white/5 border border-white/10 px-2.5 py-1 rounded-none">
                <span>Wednesday · July 15, 2026</span>
              </div>
            </div>

            {/* AI COO Dialogue Delivery */}
            <div className="space-y-4 font-sans text-sm md:text-base text-slate-100" id="coo-dialogue-box">
              <p className="text-xl font-bold font-sans tracking-tight text-white">
                "{greetingPrefix}, {ownerName}."
              </p>
              
              <div className="space-y-2 border-l-2 border-amber-500 pl-4 py-1 text-slate-300 font-mono text-xs md:text-sm">
                <div>
                  <span className="text-slate-400">Revenue yesterday:</span>{" "}
                  <strong className="text-white text-base font-bold font-mono">{cooBriefing.yesterdayRevStr}</strong>
                </div>
                <div>
                  <span className="text-slate-400">Inventory Status:</span>{" "}
                  <strong className="text-white">{cooBriefing.lowStockCountWord}.</strong>
                  {stats.lowStockCount > 0 && (
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      ↳ Critical list: <span className="text-amber-400 italic font-sans">{cooBriefing.lowStockNames}</span>
                    </span>
                  )}
                </div>
                <div>
                  <span className="text-slate-400">Customer Alert:</span>{" "}
                  Your best customer, <strong className="text-white">{cooBriefing.inactiveCustomerName}</strong>, hasn't ordered in <strong className="text-amber-400 font-bold">{cooBriefing.inactiveDays} days</strong>.
                </div>
              </div>

              <p className="text-sm italic font-sans font-medium text-amber-200 mt-2">
                "{cooBriefing.actionPrompt}"
              </p>
            </div>

            {/* Operational Decision Triggers (Call to Action) */}
            <div className="mt-6 pt-4 border-t border-[#E4E3E0]/15 flex flex-wrap gap-2" id="coo-quick-action-triggers">
              <button 
                onClick={() => handleSendMessage(cooBriefing.actionText)}
                className="bg-[#E4E3E0] text-[#141414] hover:bg-white font-mono font-bold text-[10px] uppercase py-2.5 px-4 border border-[#E4E3E0] rounded-none tracking-wider cursor-pointer flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {cooBriefing.actionLabel}
              </button>

              <button 
                onClick={() => handleSendMessage(`Analyze the inventory health for ${businessName}. Which items need restocking and how much should we purchase?`)}
                className="bg-transparent hover:bg-white/10 text-white font-mono text-[10px] uppercase py-2.5 px-4 border border-white/20 rounded-none tracking-wider cursor-pointer transition-colors"
              >
                Restocking Quantities
              </button>

              <button 
                onClick={() => handleSendMessage(`Draft a full financial and operations performance summary for ${businessName}.`)}
                className="bg-transparent hover:bg-white/10 text-slate-300 font-mono text-[10px] uppercase py-2.5 px-4 border border-white/10 rounded-none tracking-wider cursor-pointer transition-colors"
              >
                Full Executive Audit
              </button>
            </div>

          </div>
        </div>

        {/* Dynamic Vital Stats Row (Simplified Metrics Panel) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4" id="vital-stats-grid">
          {/* Stat 1: Revenue Today */}
          <div className="bg-white p-4 border border-[#141414] rounded-none shadow-none flex flex-col justify-between">
            <div>
              <p className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">Revenue Today</p>
              <h3 className="text-lg font-bold text-[#141414] font-mono mt-1">{currency}{stats.todayRevenue.toLocaleString()}</h3>
            </div>
            <div className="flex items-center gap-1 mt-2 text-[9px] font-mono uppercase text-green-700">
              <TrendingUp className="w-3 h-3" />
              <span>+{stats.revenueTrend}% vs yesterday</span>
            </div>
          </div>

          {/* Stat 2: Orders Today */}
          <div className="bg-white p-4 border border-[#141414] rounded-none shadow-none flex flex-col justify-between">
            <div>
              <p className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">Orders Today</p>
              <h3 className="text-lg font-bold text-[#141414] font-mono mt-1">{stats.todayOrdersCount}</h3>
            </div>
            <p className="text-[9px] font-mono uppercase text-slate-400 mt-2">100% Fulfilled via webhooks</p>
          </div>

          {/* Stat 3: Total Sales */}
          <div className="bg-white p-4 border border-[#141414] rounded-none shadow-none flex flex-col justify-between">
            <div>
              <p className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">Cash in Memory</p>
              <h3 className="text-lg font-bold text-[#141414] font-mono mt-1">{currency}{stats.totalRevenue.toLocaleString()}</h3>
            </div>
            <p className="text-[9px] font-mono uppercase text-slate-400 mt-2">All-time active records</p>
          </div>

          {/* Stat 4: Critical Stock/Alerts */}
          <div className="bg-white p-4 border border-[#141414] rounded-none shadow-none flex flex-col justify-between">
            <div>
              <p className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">Stock & Leads Alerts</p>
              <h3 className={`text-lg font-bold font-mono mt-1 ${stats.lowStockCount > 0 ? 'text-red-600' : 'text-green-700'}`}>
                {stats.lowStockCount} Low Items
              </h3>
            </div>
            <div className="flex items-center gap-1 mt-2 text-[9px] font-mono uppercase text-red-600">
              <AlertTriangle className="w-3 h-3" />
              <span>{stats.inactiveCustomersCount} Inactive Leads</span>
            </div>
          </div>
        </div>

        {/* Root Cause Engine */}
        <RootCauseEngine
          businessData={businessData}
          currency={currency}
          onAskAI={handleSendMessage}
        />

        {/* Operational Health / Trust Score */}
        <OperationalHealth
          businessData={businessData}
          currency={currency}
          onAskAI={handleSendMessage}
        />

        {/* Suggestion Prompts Section (Reducing Cognitive Load) */}
        <div className="bg-white p-5 border border-[#141414] rounded-none shadow-none" id="suggested-ceo-actions">
          <h4 className="text-xs font-mono uppercase tracking-wider text-[#141414] flex items-center gap-1.5 font-bold mb-3">
            <Zap className="w-4 h-4 text-amber-500 shrink-0" /> Suggested Prompts for Orlence Copilot
          </h4>
          <p className="text-[10px] text-slate-500 uppercase font-mono mb-4">
            Click one of the suggested operations below. The AI Copilot Console on the right will instantly process the query.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3" id="prompt-pills-container">
            <button 
              onClick={() => handleSendMessage("Calculate our exact product margin contribution and identify our highest value customer cohorts.")}
              className="text-left text-[11px] font-mono uppercase font-semibold border border-[#141414] p-3 rounded-none bg-white hover:bg-[#F0EFED] transition-all flex justify-between items-center group cursor-pointer"
            >
              <span>📊 Calculate product margin contribution</span>
              <ArrowUpRight className="w-4 h-4 text-[#141414] opacity-50 group-hover:opacity-100 transition-opacity" />
            </button>
            <button 
              onClick={() => handleSendMessage("Run a complete financial and inventory health audit. Highlight low-stock warning indicators.")}
              className="text-left text-[11px] font-mono uppercase font-semibold border border-[#141414] p-3 rounded-none bg-white hover:bg-[#F0EFED] transition-all flex justify-between items-center group cursor-pointer"
            >
              <span>🔍 Run financial & inventory health audit</span>
              <ArrowUpRight className="w-4 h-4 text-[#141414] opacity-50 group-hover:opacity-100 transition-opacity" />
            </button>
            <button 
              onClick={() => handleSendMessage("Which customers have spent the most with us but have been completely inactive for over 30 days?")}
              className="text-left text-[11px] font-mono uppercase font-semibold border border-[#141414] p-3 rounded-none bg-white hover:bg-[#F0EFED] transition-all flex justify-between items-center group cursor-pointer"
            >
              <span>👥 List high-value inactive customers</span>
              <ArrowUpRight className="w-4 h-4 text-[#141414] opacity-50 group-hover:opacity-100 transition-opacity" />
            </button>
            <button 
              onClick={() => handleSendMessage(`Draft a promotional strategy for ${businessName} detailing the exact steps to clear low-velocity products.`)}
              className="text-left text-[11px] font-mono uppercase font-semibold border border-[#141414] p-3 rounded-none bg-white hover:bg-[#F0EFED] transition-all flex justify-between items-center group cursor-pointer"
            >
              <span>🚀 Draft promotional clearing strategy</span>
              <ArrowUpRight className="w-4 h-4 text-[#141414] opacity-50 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>
        </div>

        {/* TODAY'S AI INSIGHTS & ACTIVE RECOMMENDATIONS */}
        <div className="space-y-4" id="ai-recommendations-list">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-mono uppercase tracking-widest text-[#141414] font-bold">
              ⚡ TODAY'S ACTIONABLE RECOMMENDATIONS
            </h4>
            <span className="text-[9px] font-mono uppercase font-bold text-slate-500 bg-white border border-[#141414] px-2.5 py-0.5">
              3 INSIGHTS RUNNING
            </span>
          </div>

          <div className="space-y-3">
            {recommendations.map((rec) => (
              <div 
                key={rec.id}
                className="bg-white border-2 border-[#141414] p-5 rounded-none shadow-none flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all hover:bg-slate-50/50"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 bg-[#F0EFED] border border-[#141414]/30">
                      {rec.type}
                    </span>
                    <span className="text-[10px] font-mono uppercase font-bold text-red-600 flex items-center gap-1">
                      ● {rec.metric}
                    </span>
                  </div>
                  <h5 className="font-bold text-[#141414] text-sm font-sans">{rec.title}</h5>
                  <p className="text-[11px] text-slate-600 leading-relaxed max-w-xl font-sans">{rec.desc}</p>
                </div>

                <button 
                  onClick={() => handleSendMessage(rec.actionText)}
                  className="w-full md:w-auto bg-[#141414] text-[#E4E3E0] hover:bg-black font-mono font-bold text-[10px] uppercase py-2 px-4 border border-[#141414] rounded-none tracking-wider shrink-0 cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {rec.actionLabel}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* PROGRESSIVE DISCLOSURE: QUICK SUB-MODULES NAV */}
        <div className="bg-[#D6D5D1] border border-[#141414] p-5 rounded-none" id="sub-modules-navigation">
          <h4 className="text-xs font-mono uppercase tracking-widest text-[#141414] font-bold mb-3">
            🔍 PROGRESSIVE EXPLORATION & DIRECTORY
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white p-4 border border-[#141414] flex flex-col justify-between min-h-28">
              <div>
                <h5 className="text-[10px] font-mono uppercase text-[#141414] font-bold">Deep Charts & Tables</h5>
                <p className="text-[9px] uppercase text-slate-500 mt-1">Review sales velocity, product bars, and category slices.</p>
              </div>
              <button 
                onClick={() => onNavigate('dashboard')}
                className="text-[10px] font-mono uppercase font-bold text-[#141414] hover:underline text-left mt-3 flex items-center gap-1.5 cursor-pointer"
              >
                Deep-dive Analytics <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="bg-white p-4 border border-[#141414] flex flex-col justify-between min-h-28">
              <div>
                <h5 className="text-[10px] font-mono uppercase text-[#141414] font-bold">Data Ingress Preset</h5>
                <p className="text-[9px] uppercase text-slate-500 mt-1">Load custom spreadsheets, upload CSV records, and inspect databases.</p>
              </div>
              <button 
                onClick={() => onNavigate('data')}
                className="text-[10px] font-mono uppercase font-bold text-[#141414] hover:underline text-left mt-3 flex items-center gap-1.5 cursor-pointer"
              >
                In Memory DB <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="bg-white p-4 border border-[#141414] flex flex-col justify-between min-h-28">
              <div>
                <h5 className="text-[10px] font-mono uppercase text-[#141414] font-bold">Relay Integrations</h5>
                <p className="text-[9px] uppercase text-slate-500 mt-1">Configure live Shopify storefront keys and Paystack gateways.</p>
              </div>
              <button 
                onClick={() => onNavigate('integrations')}
                className="text-[10px] font-mono uppercase font-bold text-[#141414] hover:underline text-left mt-3 flex items-center gap-1.5 cursor-pointer"
              >
                Integration Hub <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN: Live Copilot Workspace Panel (1/3 Width) */}
      <div className="lg:col-span-5 xl:col-span-4" id="feed-right-col">
        <div className="bg-white border-2 border-[#141414] flex flex-col h-[650px] overflow-hidden sticky top-[140px]" id="integrated-copilot-panel">
          
          {/* Panel Header */}
          <div className="bg-[#D6D5D1] border-b border-[#141414] px-4 py-3 flex justify-between items-center" id="copilot-panel-header">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-[#141414] text-[#E4E3E0] border border-[#141414] flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-[10px] font-mono uppercase tracking-wider text-[#141414] font-bold">CO-PILOT CONSOLE</h4>
                <span className="text-[8px] uppercase font-mono text-green-700 font-bold flex items-center gap-1">
                  <span className="w-1 h-1 bg-green-600 rounded-full animate-pulse"></span>
                  Active Agent
                </span>
              </div>
            </div>
            
            <button 
              onClick={handleClearHistory}
              className="text-[8px] font-mono uppercase border border-[#141414]/40 bg-white hover:bg-rose-50 px-2 py-1 font-bold rounded-none flex items-center gap-1 cursor-pointer transition-all"
              title="Reset conversation"
            >
              <RefreshCw className="w-2.5 h-2.5" /> Clear
            </button>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F0EFED] scrollbar-none" id="copilot-messages-stream">
            {chatHistory.map((message) => (
              <div 
                key={message.id} 
                className={`flex gap-2.5 max-w-[90%] ${message.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                <div className={`w-6.5 h-6.5 border border-[#141414] flex items-center justify-center shrink-0 text-[10px] font-bold ${
                  message.sender === 'user' ? 'bg-[#141414] text-[#E4E3E0]' : 'bg-white text-[#141414]'
                }`}>
                  {message.sender === 'user' ? 'U' : 'AI'}
                </div>

                <div className={`rounded-none p-3 border border-[#141414] text-xs relative group ${
                  message.sender === 'user' 
                    ? 'bg-[#141414] text-[#E4E3E0]' 
                    : 'bg-white text-[#141414]'
                }`}>
                  <div className="prose max-w-none text-inherit markdown-body font-sans leading-relaxed">
                    <ReactMarkdown>{message.text}</ReactMarkdown>
                  </div>
                  
                  <div className="flex justify-between items-center mt-2 pt-1.5 border-t border-[#141414]/10 text-[8px] font-mono text-slate-400">
                    <span>{message.timestamp}</span>
                    {message.sender === 'assistant' && (
                      <button 
                        onClick={() => copyToClipboard(message.text, message.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-[#141414] px-1 py-0.5 rounded-none text-[#141414] hover:bg-[#141414] hover:text-[#E4E3E0] cursor-pointer"
                      >
                        {copiedId === message.id ? <Check className="w-2.5 h-2.5 text-green-600" /> : <Copy className="w-2.5 h-2.5" />}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2.5 max-w-[85%] mr-auto">
                <div className="w-6.5 h-6.5 border border-[#141414] bg-white text-[#141414] flex items-center justify-center shrink-0 text-[10px] font-bold">
                  AI
                </div>
                <div className="bg-white border border-[#141414] text-[#141414] rounded-none p-3 shadow-none flex items-center gap-1.5 font-mono text-[9px] uppercase font-bold">
                  <Sparkles className="w-3 h-3 text-[#141414] animate-spin" />
                  <span>Synthesizing decision logs...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Form Input */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(input);
            }}
            className="p-3 border-t border-[#141414] bg-white flex gap-2 items-center"
            id="copilot-input-form"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about your data..."
              disabled={isLoading}
              className="flex-1 bg-white focus:bg-[#F0EFED] text-xs px-3 py-2 border border-[#141414] outline-none disabled:opacity-50 font-mono uppercase text-[10px] shrink-0"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="bg-[#141414] text-[#E4E3E0] hover:bg-black border border-[#141414] p-2 rounded-none transition-all disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
          
        </div>
      </div>
    </div>
  );
}

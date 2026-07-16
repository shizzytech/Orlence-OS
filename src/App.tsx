import { useState, useEffect } from 'react';
import { 
  Bot, 
  BarChart3, 
  Database, 
  Layers, 
  Building2, 
  Globe2, 
  Activity,
  ArrowUpRight,
  Sparkles,
  Home
} from 'lucide-react';
import { BusinessData, Integration, ChatMessage } from './types';
import { SAMPLES } from './data/samples';
import Dashboard from './components/Dashboard';
import AiChat from './components/AiChat';
import DataManager from './components/DataManager';
import Integrations from './components/Integrations';
import HomeFeed from './components/HomeFeed';

const INITIAL_INTEGRATIONS: Integration[] = [
  { id: 'paystack', name: 'Paystack', description: 'Real-time card, transfer, and mobile money transaction sync for Nigeria & Ghana.', status: 'connected', type: 'payment', webhookUrl: 'https://api.foundergpt.co/api/paystack/webhook' },
  { id: 'shopify', name: 'Shopify Storefront', description: 'Import product collections, inventory variations, customer tags, and retail orders.', status: 'connected', type: 'commerce', webhookUrl: 'sartorial-africa.myshopify.com' },
  { id: 'flutterwave', name: 'Flutterwave', description: 'Unified payout settlements, currency conversion, and cards diagnostics across Africa.', status: 'disconnected', type: 'payment' },
  { id: 'sheets', name: 'Google Sheets', description: 'Load, append, and keep inventory/costs synchronized dynamically with spreadsheets.', status: 'disconnected', type: 'storage' },
  { id: 'whatsapp', name: 'WhatsApp Business Cloud', description: 'Automate customer support chats, invoice delivery, and recovery of abandoned carts with AI.', status: 'disconnected', type: 'messaging' },
  { id: 'instagram', name: 'Instagram Creator API', description: 'Monitor social posts, comments, and story mentions to measure lead conversion ROI.', status: 'disconnected', type: 'other' },
  { id: 'email', name: 'Email API (Resend)', description: 'Dispatch daily invoice receipts, newsletter alerts, and weekly health updates automatically.', status: 'disconnected', type: 'messaging' },
  { id: 'crm', name: 'HubSpot CRM', description: 'Push active customer contact logs, pipelines, and activity reports to CRM dashboards.', status: 'disconnected', type: 'other' }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'overview' | 'dashboard' | 'chat' | 'data' | 'integrations'>('overview');
  const [businessData, setBusinessData] = useState<BusinessData>(SAMPLES.sartorial_africa);
  const [integrations, setIntegrations] = useState<Integration[]>(INITIAL_INTEGRATIONS);
  
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);

  // Trigger conversational greeting refresh whenever active business dataset changes
  useEffect(() => {
    const currency = businessData.currency;
    const businessName = businessData.businessName;

    // Calculations
    const yesterdayStr = "2026-07-14";
    const yesterdayOrders = businessData.orders.filter(o => o.date === yesterdayStr);
    const yesterdayRevenue = yesterdayOrders.filter(o => o.status === 'Paid').reduce((sum, o) => sum + o.amount, 0);

    const lowStockCount = businessData.products.filter(p => p.stock <= 5).length;

    // Determine inactive VIP customer (>= 7 days inactive)
    const potentialVips = [...businessData.customers]
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

    let ownerName = "Sarah";
    let greetingPrefix = "Good morning";
    let channelLabel = "WhatsApp campaign";
    if (businessName === "Sartorial Africa") {
      ownerName = "Sarah";
      greetingPrefix = "Good morning";
      channelLabel = "WhatsApp campaign";
    } else if (businessName === "Kigali Coffee Co.") {
      ownerName = "Marie Claire";
      greetingPrefix = "Mwiriwe";
      channelLabel = "wholesale re-engagement email";
    } else if (businessName === "AfroBeats Tech") {
      ownerName = "Farah";
      greetingPrefix = "Good morning";
      channelLabel = "re-activation sequence";
    }

    setChatHistory([
      {
        id: 'welcome',
        sender: 'assistant',
        text: `💼 **Meet your AI COO.**

*"${greetingPrefix}, ${ownerName}."*

* **Revenue yesterday:** \`${currency}${yesterdayRevenue.toLocaleString()}\`
* **Inventory status:** \`${lowStockCount}\` ${lowStockCount === 1 ? 'product needs' : 'products need'} restocking.
* **Customer alert:** Your best customer, **${inactiveCustomerName}**, hasn't ordered in \`${inactiveDays} days\`.

Would you like me to prepare a ${channelLabel}?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }, [businessData]);

  const totalRevenue = businessData.orders
    .filter(o => o.status === 'Paid')
    .reduce((sum, o) => sum + o.amount, 0);

  const lowStockCount = businessData.products.filter(p => p.stock <= 5).length;

  return (
    <div className="min-h-screen bg-[#E4E3E0] flex flex-col antialiased text-[#141414] font-sans" id="foundergpt-root">
      {/* Upper Brand Utility Ribbon */}
      <div className="bg-[#141414] text-[#E4E3E0]/70 py-2.5 px-6 flex justify-between items-center text-[10px] font-mono uppercase tracking-widest border-b border-[#141414]" id="brand-ribbon">
        <div className="flex items-center gap-4.5" id="ribbon-left">
          <span className="flex items-center gap-1.5 font-bold text-green-500">
            <span className="w-1.5 h-1.5 bg-green-500 animate-pulse"></span>
            SYS: STABLE
          </span>
          <span className="hidden md:inline">·</span>
          <span className="hidden md:inline font-medium">FounderGPT v1.0.4 [PROD]</span>
        </div>
        
        <div className="flex items-center gap-4" id="ribbon-right">
          <span>UTC: 2026-07-15</span>
          <span className="bg-[#E4E3E0] text-[#141414] font-bold px-2 py-0.5 text-[9px] border border-[#141414]">
            Sandbox Environment
          </span>
        </div>
      </div>

      {/* Main App Bar / Navigation Header */}
      <header className="bg-[#E4E3E0] border-b border-[#141414] sticky top-0 z-40" id="main-header">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between md:items-center gap-4">
          
          {/* Logo & Workspace Context Selector */}
          <div className="flex items-center gap-4" id="logo-block">
            <div className="p-2.5 bg-[#141414] text-[#E4E3E0] border border-[#141414]">
              <Bot className="w-6 h-6" />
            </div>
            
            <div className="h-8 w-px bg-[#141414] opacity-20"></div>
            
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">
                  {businessData.businessName === "Sartorial Africa" ? '🇳🇬' : businessData.businessName === "Kigali Coffee Co." ? '🇷🇼' : '🇰🇪'}
                </span>
                <h1 className="text-xl font-bold uppercase tracking-tighter text-[#141414]">
                  FounderGPT <span className="font-normal opacity-55 italic">/ {businessData.businessName}</span>
                </h1>
              </div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-slate-600 mt-1.5 flex items-center gap-1">
                <Globe2 className="w-3.5 h-3.5" /> Africa Regional Hub · Active Memory DB
              </p>
            </div>
          </div>

          {/* Quick Header Mini Metrics */}
          <div className="flex gap-4 md:gap-6 text-xs" id="quick-metrics">
            <div className="bg-white border border-[#141414] px-4 py-2 flex items-center gap-2.5">
              <div className="w-2 h-2 bg-green-500 border border-[#141414]"></div>
              <div>
                <p className="text-[9px] text-slate-500 font-mono uppercase tracking-wider">Net Sales</p>
                <p className="font-bold text-[#141414] text-sm font-mono">{businessData.currency}{totalRevenue.toLocaleString()}</p>
              </div>
            </div>

            <div className="bg-white border border-[#141414] px-4 py-2 flex items-center gap-2.5">
              <div className={`w-2 h-2 border border-[#141414] ${lowStockCount > 0 ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`}></div>
              <div>
                <p className="text-[9px] text-slate-500 font-mono uppercase tracking-wider">Alerts</p>
                <p className="font-bold text-[#141414] text-sm uppercase">
                  {lowStockCount > 0 ? `${lowStockCount} Low Stock` : 'Stock Healthy'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Primary Navigation Bar (Tabs) */}
      <div className="bg-[#D6D5D1] border-b border-[#141414] sticky top-[71px] z-30" id="navigation-bar">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex border-l border-[#141414] py-0 overflow-x-auto scrollbar-none" aria-label="Tabs" id="nav-tabs">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-5 py-3.5 text-xs font-bold uppercase tracking-wider transition-all border-r border-[#141414] shrink-0 ${
                activeTab === 'overview'
                  ? 'bg-[#141414] text-[#E4E3E0]'
                  : 'text-[#141414]/75 hover:text-[#141414] hover:bg-white/30'
              }`}
            >
              <Home className="w-4 h-4" /> Overview & Briefing
            </button>

            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-5 py-3.5 text-xs font-bold uppercase tracking-wider transition-all border-r border-[#141414] shrink-0 ${
                activeTab === 'dashboard'
                  ? 'bg-[#141414] text-[#E4E3E0]'
                  : 'text-[#141414]/75 hover:text-[#141414] hover:bg-white/30'
              }`}
            >
              <BarChart3 className="w-4 h-4" /> Analytics Dashboard
            </button>

            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-2 px-5 py-3.5 text-xs font-bold uppercase tracking-wider transition-all border-r border-[#141414] shrink-0 relative ${
                activeTab === 'chat'
                  ? 'bg-[#141414] text-[#E4E3E0]'
                  : 'text-[#141414]/75 hover:text-[#141414] hover:bg-white/30'
              }`}
            >
              <Bot className="w-4 h-4" /> Full Copilot Chat
              <span className="absolute top-1.5 right-2 w-1.5 h-1.5 bg-rose-500 rounded-none border border-[#141414]"></span>
            </button>

            <button
              onClick={() => setActiveTab('data')}
              className={`flex items-center gap-2 px-5 py-3.5 text-xs font-bold uppercase tracking-wider transition-all border-r border-[#141414] shrink-0 ${
                activeTab === 'data'
                  ? 'bg-[#141414] text-[#E4E3E0]'
                  : 'text-[#141414]/75 hover:text-[#141414] hover:bg-white/30'
              }`}
            >
              <Database className="w-4 h-4" /> Memory Tables
            </button>

            <button
              onClick={() => setActiveTab('integrations')}
              className={`flex items-center gap-2 px-5 py-3.5 text-xs font-bold uppercase tracking-wider transition-all border-r border-[#141414] shrink-0 ${
                activeTab === 'integrations'
                  ? 'bg-[#141414] text-[#E4E3E0]'
                  : 'text-[#141414]/75 hover:text-[#141414] hover:bg-white/30'
              }`}
            >
              <Layers className="w-4 h-4" /> Integrations Control
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content Workspace Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8" id="workspace-canvas">
        {activeTab === 'overview' && (
          <HomeFeed 
            businessData={businessData} 
            integrations={integrations} 
            chatHistory={chatHistory}
            setChatHistory={setChatHistory}
            onNavigate={(tab) => setActiveTab(tab)}
            pendingPrompt={pendingPrompt}
            setPendingPrompt={setPendingPrompt}
          />
        )}

        {activeTab === 'dashboard' && (
          <Dashboard 
            businessData={businessData} 
            integrations={integrations} 
            onAskAi={(prompt) => {
              setPendingPrompt(prompt);
              setActiveTab('overview');
            }}
          />
        )}

        {activeTab === 'chat' && (
          <AiChat 
            businessData={businessData} 
            integrations={integrations} 
            chatHistory={chatHistory}
            setChatHistory={setChatHistory}
            pendingPrompt={pendingPrompt}
            setPendingPrompt={setPendingPrompt}
          />
        )}

        {activeTab === 'data' && (
          <DataManager 
            businessData={businessData} 
            setBusinessData={setBusinessData} 
            onPresetChanged={() => setActiveTab('overview')}
          />
        )}

        {activeTab === 'integrations' && (
          <Integrations 
            businessData={businessData} 
            setBusinessData={setBusinessData}
            integrations={integrations}
            setIntegrations={setIntegrations}
          />
        )}
      </main>

      {/* Global Application Footer */}
      <footer className="border-t border-[#141414] bg-[#141414] text-[#E4E3E0]/80 py-4.5 px-6 flex flex-col md:flex-row items-center justify-between text-[10px] font-mono uppercase tracking-[0.2em] mt-12" id="global-footer">
        <div className="max-w-7xl w-full mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© 2026 FounderGPT. Build robust multi-source commerce pipelines.</p>
          <div className="flex gap-4 items-center">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 border border-green-300"></span> Shopify Linked
            </span>
            <span>·</span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 border border-green-300"></span> Paystack Synced
            </span>
            <span>·</span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-orange-400 border border-orange-200 animate-pulse"></span> AI Copilot Live
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

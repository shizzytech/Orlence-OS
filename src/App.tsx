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
import LandingPage from './components/LandingPage';
import AdminDashboard from './components/AdminDashboard';
import LoginPage from './components/auth/LoginPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AuthCallback from './components/auth/AuthCallback';
import SetPassword from './components/auth/SetPassword';
import FoundingProgram from './components/FoundingProgram';
import Onboarding from './components/Onboarding';

const INITIAL_INTEGRATIONS: Integration[] = [
  // Commerce
  { id: 'bumpa', name: 'Bumpa', description: 'Manage products, inventory, orders and customer records from your Bumpa store.', status: 'disconnected', type: 'Commerce', unlocks: ['AI sales forecasting', 'Product performance analysis', 'Inventory recommendations', 'Customer lifetime value', 'Daily business briefings'] },
  { id: 'shopify', name: 'Shopify', description: 'Import product collections, inventory variations, customer tags, and retail orders.', status: 'connected', type: 'Commerce', unlocks: ['Sync Orders', 'Customer Analytics', 'Revenue Tracking'], webhookUrl: 'sartorial-africa.myshopify.com', lastSync: '2 minutes ago', stats: { products: 243, orders: 138, customers: 89, revenue: '₦1.2M' }, memory: '2 Years 8 Months', health: { status: 'Healthy', webhook: 'Listening', api: 'Connected', rateLimit: '85%' } },
  { id: 'woocommerce', name: 'WooCommerce', description: 'Open-source e-commerce plugin for WordPress.', status: 'disconnected', type: 'Commerce', unlocks: ['Sync Orders', 'Inventory tracking', 'Customer sync'] },
  { id: 'wix', name: 'Wix', description: 'Website builder and e-commerce platform.', status: 'disconnected', type: 'Commerce', unlocks: ['Sync Orders', 'Product sync'] },
  { id: 'squarespace', name: 'Squarespace', description: 'Website builder and e-commerce platform.', status: 'disconnected', type: 'Commerce', unlocks: ['Sync Orders', 'Product sync'] },
  
  // Payments
  { id: 'paystack', name: 'Paystack', description: 'Real-time card, transfer, and mobile money transaction sync for Nigeria & Ghana.', status: 'connected', type: 'Payments', unlocks: ['Revenue Tracking', 'Failed payment recovery', 'Fraud detection'], webhookUrl: 'https://api.orlence.com/api/paystack/webhook', lastSync: '12 sec ago', health: { status: 'Healthy', webhook: 'Listening', api: 'Connected', rateLimit: '92%' } },
  { id: 'flutterwave', name: 'Flutterwave', description: 'Unified payout settlements, currency conversion, and cards diagnostics across Africa.', status: 'disconnected', type: 'Payments', unlocks: ['Revenue Tracking', 'Settlement reporting'] },
  { id: 'stripe', name: 'Stripe', description: 'Global payment processing platform.', status: 'disconnected', type: 'Payments', unlocks: ['Revenue Tracking', 'Subscription analytics'] },

  // Communication
  { id: 'whatsapp', name: 'WhatsApp', description: 'Automate customer support chats, invoice delivery, and recovery of abandoned carts with AI.', status: 'disconnected', type: 'Communication', unlocks: ['AI Marketing Recommendations', 'Abandoned cart recovery', 'Customer support'] },
  { id: 'instagram', name: 'Instagram', description: 'Monitor social posts, comments, and story mentions to measure lead conversion ROI.', status: 'disconnected', type: 'Communication', unlocks: ['Social listening', 'Lead generation tracking'] },
  { id: 'email', name: 'Email', description: 'Dispatch daily invoice receipts, newsletter alerts, and weekly health updates automatically.', status: 'disconnected', type: 'Communication', unlocks: ['Automated reporting', 'Newsletter tracking'] },

  // Accounting
  { id: 'kippa', name: 'Kippa', description: 'Simple accounting for small businesses in Africa.', status: 'disconnected', type: 'Accounting', unlocks: ['Expense tracking', 'Cash flow prediction'] },
  { id: 'quickbooks', name: 'QuickBooks', description: 'Accounting software for small businesses.', status: 'disconnected', type: 'Accounting', unlocks: ['Automated reconciliation', 'Tax reporting'] },
  { id: 'zohobooks', name: 'Zoho Books', description: 'Online accounting software.', status: 'disconnected', type: 'Accounting', unlocks: ['Automated reconciliation', 'Expense tracking'] },

  // CRM
  { id: 'hubspot', name: 'HubSpot', description: 'Push active customer contact logs, pipelines, and activity reports to CRM dashboards.', status: 'disconnected', type: 'CRM', unlocks: ['Pipeline forecasting', 'Lead scoring'] },
  { id: 'salesforce', name: 'Salesforce', description: 'Customer relationship management platform.', status: 'disconnected', type: 'CRM', unlocks: ['Enterprise reporting', 'Opportunity tracking'] },

  // Documents
  { id: 'sheets', name: 'Google Sheets', description: 'Load, append, and keep inventory/costs synchronized dynamically with spreadsheets.', status: 'disconnected', type: 'Documents', unlocks: ['Custom reporting', 'Automated data exports'] },
  { id: 'excel', name: 'Excel', description: 'Microsoft Excel integration.', status: 'disconnected', type: 'Documents', unlocks: ['Custom reporting', 'Automated data exports'] }
];

export default function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'app' | 'admin' | 'login' | 'founding' | 'onboarding' | 'auth-callback' | 'set-password'>('landing');
  const [activeTab, setActiveTab] = useState<'overview' | 'dashboard' | 'chat' | 'data' | 'integrations'>('overview');
  const [businessData, setBusinessData] = useState<BusinessData>(SAMPLES.sartorial_africa);
  const [integrations, setIntegrations] = useState<Integration[]>(INITIAL_INTEGRATIONS);
  
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);

  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/admin') {
      setCurrentView('admin');
    } else if (path === '/login') {
      setCurrentView('login');
    } else if (path === '/founding') {
      setCurrentView('founding');
    } else if (path === '/onboarding') {
      setCurrentView('onboarding');
    } else if (path === '/auth/callback') {
      setCurrentView('auth-callback');
    } else if (path === '/set-password') {
      setCurrentView('set-password');
    } else if (path === '/app') {
      setCurrentView('app');
    }
  }, []);

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
        text: `💼 **Meet your Orlence Intelligence.**

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

  if (currentView === 'login') {
    return <LoginPage />;
  }

  if (currentView === 'auth-callback') {
    return <AuthCallback />;
  }

  if (currentView === 'set-password') {
    return <SetPassword />;
  }

  if (currentView === 'admin') {
    return (
      <ProtectedRoute requireSuperAdmin>
        <AdminDashboard />
      </ProtectedRoute>
    );
  }

  if (currentView === 'landing') {
    return <LandingPage onEnterApp={() => setCurrentView('app')} />;
  }

  if (currentView === 'founding') {
    return <FoundingProgram />;
  }

  if (currentView === 'onboarding') {
    return (
      <ProtectedRoute>
        <Onboarding onComplete={() => {
          window.location.href = '/app';
        }} />
      </ProtectedRoute>
    );
  }

  return (
    <div className="min-h-screen bg-[#E4E3E0] flex flex-col antialiased text-[#141414] font-sans" id="orlence-root">
      {/* Upper Brand Utility Ribbon */}
      <div className="bg-[#141414] text-[#E4E3E0]/70 py-2.5 px-6 flex justify-between items-center text-[10px] font-mono uppercase tracking-widest border-b border-[#141414]" id="brand-ribbon">
        <div className="flex items-center gap-4.5" id="ribbon-left">
          <span className="flex items-center gap-1.5 font-bold text-green-500">
            <span className="w-1.5 h-1.5 bg-green-500 animate-pulse"></span>
            SYS: STABLE
          </span>
          <span className="hidden md:inline">·</span>
          <span className="hidden md:inline font-medium">Orlence OS v1.0.4 [PROD]</span>
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
                  Orlence OS <span className="font-normal opacity-55 italic">/ {businessData.businessName}</span>
                </h1>
              </div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-slate-600 mt-1.5 flex items-center gap-1">
                <Globe2 className="w-3.5 h-3.5" /> Africa Regional Hub · Active Memory DB
              </p>
            </div>
          </div>

          {/* Quick Header Mini Metrics */}
          <div className="flex flex-wrap gap-2 sm:gap-4 md:gap-6 text-xs" id="quick-metrics">
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
          <p className="text-center md:text-left w-full md:w-auto">© 2026 Orlence. Understand. Decide. Grow.</p>
          <div className="flex flex-wrap justify-center gap-4 items-center w-full md:w-auto">
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

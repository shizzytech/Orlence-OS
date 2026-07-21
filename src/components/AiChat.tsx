import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, Bot, Sparkles, ChevronDown, ChevronUp, 
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, 
  Package, ArrowRight, Clock, Crown, Target, RefreshCw, 
  Users, BarChart3, Copy, Check, User, Zap, Mail, MessageSquare, Filter
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage, BusinessData, Integration, Customer, Product } from '../types';

// ═══════════════════════════════════════════════════════════════════════
//  DYNAMIC UI WIDGET 1: CUSTOMER INTELLIGENCE APP WIDGET
// ═══════════════════════════════════════════════════════════════════════
interface CustomerWidgetProps {
  customers: Customer[];
  currency: string;
  onAction: (prompt: string) => void;
}

function CustomerAppWidget({ customers, currency, onAction }: CustomerWidgetProps) {
  const [filter, setFilter] = useState<'all' | 'vip' | 'churn'>('all');

  const filtered = useMemo(() => {
    if (filter === 'vip') return customers.filter(c => c.totalSpent > 80000);
    if (filter === 'churn') return customers.filter(c => new Date(c.lastActive) < new Date('2026-06-25'));
    return customers;
  }, [customers, filter]);

  return (
    <div className="bg-white border border-[#141414] p-5 space-y-4 font-sans text-[#141414]">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-emerald-600" />
          <h4 className="font-bold text-xs uppercase tracking-wider">Customer Intelligence App</h4>
          <span className="text-[9px] font-mono bg-slate-100 px-2 py-0.5 border text-slate-600 font-bold">{customers.length} Profiles</span>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-1 text-[9px] font-mono">
          <button 
            onClick={() => setFilter('all')} 
            className={`px-2 py-1 uppercase font-bold border transition-colors ${filter === 'all' ? 'bg-[#141414] text-white' : 'bg-slate-50 hover:bg-slate-100'}`}
          >
            All
          </button>
          <button 
            onClick={() => setFilter('vip')} 
            className={`px-2 py-1 uppercase font-bold border transition-colors ${filter === 'vip' ? 'bg-[#141414] text-white' : 'bg-slate-50 hover:bg-slate-100'}`}
          >
            VIPs (₦80k+)
          </button>
          <button 
            onClick={() => setFilter('churn')} 
            className={`px-2 py-1 uppercase font-bold border transition-colors ${filter === 'churn' ? 'bg-[#141414] text-white' : 'bg-slate-50 hover:bg-slate-100'}`}
          >
            Churn Risk
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="space-y-2 max-h-72 overflow-y-auto">
        {filtered.map((c, i) => {
          const isChurn = new Date(c.lastActive) < new Date('2026-06-25');
          const isVip = c.totalSpent > 80000;

          return (
            <div key={c.id} className="p-3 bg-slate-50 border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-[#141414]">{c.name}</span>
                  {isVip && <span className="text-[8px] font-mono bg-amber-100 text-amber-800 px-1.5 py-0.5 border border-amber-200 font-bold uppercase">👑 VIP</span>}
                  {isChurn && <span className="text-[8px] font-mono bg-rose-100 text-rose-700 px-1.5 py-0.5 border border-rose-200 font-bold uppercase">⚠ Churn Risk</span>}
                </div>
                <p className="text-[10px] font-mono text-slate-500 mt-0.5">{c.email} · Last active {c.lastActive}</p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                <div className="text-right">
                  <p className="font-black font-mono text-xs">{currency}{c.totalSpent.toLocaleString()}</p>
                  <p className="text-[9px] font-mono text-slate-400">{c.totalOrders} orders</p>
                </div>

                <button
                  onClick={() => onAction(isChurn 
                    ? `Draft an urgent WhatsApp recovery message to re-engage ${c.name} (${c.email}).` 
                    : `Create a VIP loyalty experience & bonus offer for ${c.name} (${c.email}).`
                  )}
                  className="bg-[#141414] text-[#E4E3E0] hover:bg-black px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-wider transition-all"
                >
                  {isChurn ? 'Recover' : 'Engage'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
//  DYNAMIC UI WIDGET 2: INVENTORY MANAGEMENT APP WIDGET
// ═══════════════════════════════════════════════════════════════════════
interface InventoryWidgetProps {
  products: Product[];
  currency: string;
  onAction: (prompt: string) => void;
}

function InventoryAppWidget({ products, currency, onAction }: InventoryWidgetProps) {
  return (
    <div className="bg-white border border-[#141414] p-5 space-y-4 font-sans text-[#141414]">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-amber-600" />
          <h4 className="font-bold text-xs uppercase tracking-wider">Inventory Management Canvas</h4>
          <span className="text-[9px] font-mono bg-amber-50 text-amber-700 px-2 py-0.5 border border-amber-200 font-bold">
            {products.filter(p => p.stock <= 5).length} Items Need Attention
          </span>
        </div>
      </div>

      <div className="space-y-2 max-h-72 overflow-y-auto">
        {products.map(p => {
          const isCritical = p.stock === 0;
          const isLow = p.stock > 0 && p.stock <= 5;

          return (
            <div key={p.id} className={`p-3 border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 ${
              isCritical ? 'bg-rose-50 border-rose-200' : isLow ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'
            }`}>
              <div>
                <p className="font-bold text-xs text-[#141414]">{p.name}</p>
                <p className="text-[10px] font-mono text-slate-500 mt-0.5">SKU: {p.sku} · Price: {currency}{p.price.toLocaleString()} · Category: {p.category}</p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                <div className="text-right font-mono">
                  <p className={`font-black text-xs ${isCritical ? 'text-rose-700' : isLow ? 'text-amber-700' : 'text-slate-700'}`}>
                    {p.stock} units left
                  </p>
                  <p className="text-[9px] text-slate-400">{p.salesCount} sales/mo</p>
                </div>

                <button
                  onClick={() => onAction(`Write a formal supplier reorder purchase order for ${p.name} (SKU: ${p.sku}). Current stock: ${p.stock} units.`)}
                  className="bg-[#141414] text-[#E4E3E0] hover:bg-black px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-wider transition-all"
                >
                  Reorder
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
//  DYNAMIC UI WIDGET 3: CAMPAIGN BUILDER & DISPATCH CANVAS
// ═══════════════════════════════════════════════════════════════════════
interface CampaignWidgetProps {
  businessName: string;
  currency: string;
  onAction: (prompt: string) => void;
}

function CampaignAppWidget({ businessName, currency, onAction }: CampaignWidgetProps) {
  const [dispatched, setDispatched] = useState(false);

  return (
    <div className="bg-white border border-[#141414] p-5 space-y-4 font-sans text-[#141414]">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-blue-600" />
          <h4 className="font-bold text-xs uppercase tracking-wider">AI Campaign Builder Canvas</h4>
          <span className="text-[9px] font-mono bg-blue-50 text-blue-700 px-2 py-0.5 border border-blue-200 font-bold">WhatsApp & Email</span>
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-200 p-4 space-y-3 font-mono text-xs">
        <div className="flex justify-between text-[10px] text-slate-500 border-b border-slate-200 pb-2">
          <span>Target Audience: <strong className="text-[#141414]">VIP & Inactive Customers (74 recipients)</strong></span>
          <span>Projected Impact: <strong className="text-emerald-700">{currency}520,000</strong></span>
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase text-slate-400">Campaign Preview:</p>
          <p className="text-slate-800 italic mt-1 bg-white p-3 border border-slate-200 leading-relaxed text-xs">
            "Hello from {businessName}! 🌟 We missed you! As one of our most valued customers, enjoy an exclusive 10% returning credit on your next order this weekend. Code: <strong className="text-emerald-700">RETURNING10</strong>."
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        {dispatched ? (
          <span className="bg-emerald-600 text-white px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> Campaign Dispatched
          </span>
        ) : (
          <button
            onClick={() => {
              setDispatched(true);
              onAction(`Campaign launched for ${businessName}! Provide a 24-hour performance tracking checklist.`);
            }}
            className="bg-[#141414] text-[#E4E3E0] hover:bg-black px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5 text-emerald-400" /> Dispatch Campaign Now
          </button>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
//  MAIN COPILOT BI WORKSPACE COMPONENT
// ═══════════════════════════════════════════════════════════════════════
interface AiChatProps {
  businessData: BusinessData;
  integrations: Integration[];
  chatHistory: ChatMessage[];
  setChatHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  pendingPrompt?: string | null;
  setPendingPrompt?: React.Dispatch<React.SetStateAction<string | null>>;
}

export default function AiChat({
  businessData,
  integrations,
  chatHistory,
  setChatHistory,
  pendingPrompt,
  setPendingPrompt
}: AiChatProps) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeCanvas, setActiveCanvas] = useState<'none' | 'customers' | 'inventory' | 'campaign'>('customers');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isLoading]);

  useEffect(() => {
    if (pendingPrompt && setPendingPrompt) {
      handleSendMessage(pendingPrompt);
      setPendingPrompt(null);
    }
  }, [pendingPrompt]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    // Detect keywords to trigger interactive canvases
    const lower = textToSend.toLowerCase();
    if (lower.includes('customer') || lower.includes('vip') || lower.includes('churn') || lower.includes('shopper')) {
      setActiveCanvas('customers');
    } else if (lower.includes('inventory') || lower.includes('stock') || lower.includes('reorder') || lower.includes('supplier')) {
      setActiveCanvas('inventory');
    } else if (lower.includes('campaign') || lower.includes('whatsapp') || lower.includes('email') || lower.includes('marketing')) {
      setActiveCanvas('campaign');
    }

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
        setChatHistory(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: data.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      } else {
        throw new Error(data.error || 'The co-pilot was unable to synthesize a response.');
      }
    } catch (err: any) {
      setChatHistory(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: `⚠️ **Error:** ${err.message}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const executivePrompts = [
    "Why are our sales falling in specific categories?",
    "Show customer intelligence table & churn risks.",
    "Inspect low inventory items & generate reorder PO.",
    "Build a WhatsApp win-back campaign for inactive VIPs."
  ];

  return (
    <div className="space-y-6 font-sans text-[#141414]" id="copilot-bi-workspace">
      
      {/* Workspace Header */}
      <div className="bg-[#141414] text-[#E4E3E0] border border-[#141414] p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Bot className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold uppercase tracking-tight">Business Intelligence Workspace</h2>
          </div>
          <p className="text-xs text-[#E4E3E0]/60 font-mono">
            {businessData.businessName} · Multi-turn Analysis Engine & Interactive Canvas
          </p>
        </div>

        {/* Canvas Switcher Tabs */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <button
            onClick={() => setActiveCanvas('customers')}
            className={`px-3 py-1.5 font-bold uppercase border transition-colors ${
              activeCanvas === 'customers' ? 'bg-[#E4E3E0] text-[#141414]' : 'bg-white/5 text-[#E4E3E0] hover:bg-white/10'
            }`}
          >
            👥 Customers Canvas
          </button>
          <button
            onClick={() => setActiveCanvas('inventory')}
            className={`px-3 py-1.5 font-bold uppercase border transition-colors ${
              activeCanvas === 'inventory' ? 'bg-[#E4E3E0] text-[#141414]' : 'bg-white/5 text-[#E4E3E0] hover:bg-white/10'
            }`}
          >
            📦 Inventory Canvas
          </button>
          <button
            onClick={() => setActiveCanvas('campaign')}
            className={`px-3 py-1.5 font-bold uppercase border transition-colors ${
              activeCanvas === 'campaign' ? 'bg-[#E4E3E0] text-[#141414]' : 'bg-white/5 text-[#E4E3E0] hover:bg-white/10'
            }`}
          >
            ⚡ Campaign Canvas
          </button>
        </div>
      </div>

      {/* Interactive UI Canvas Component (Renders based on selected tab or query) */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        {activeCanvas === 'customers' && (
          <CustomerAppWidget 
            customers={businessData.customers} 
            currency={businessData.currency} 
            onAction={handleSendMessage} 
          />
        )}
        {activeCanvas === 'inventory' && (
          <InventoryAppWidget 
            products={businessData.products} 
            currency={businessData.currency} 
            onAction={handleSendMessage} 
          />
        )}
        {activeCanvas === 'campaign' && (
          <CampaignAppWidget 
            businessName={businessData.businessName} 
            currency={businessData.currency} 
            onAction={handleSendMessage} 
          />
        )}
      </motion.div>

      {/* Co-Pilot Q&A Conversation Console */}
      <div className="bg-white border border-[#141414] overflow-hidden" id="copilot-console">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs font-mono uppercase font-bold">
          <span className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            AI Analytical Thread
          </span>
          <span className="text-[10px] text-slate-400">Gemini 3.6 Pro Analytical Model</span>
        </div>

        {/* Chat Thread */}
        <div className="p-6 max-h-[400px] overflow-y-auto space-y-4 bg-[#F0EFED]">
          {chatHistory.map(msg => (
            <div key={msg.id} className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.sender === 'assistant' && (
                <div className="w-7 h-7 bg-[#141414] text-[#E4E3E0] border border-[#141414] flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}

              <div className={`max-w-[80%] p-4 border border-[#141414] ${
                msg.sender === 'user' ? 'bg-[#141414] text-[#E4E3E0]' : 'bg-white text-[#141414]'
              }`}>
                <div className="text-xs leading-relaxed prose max-w-none text-inherit markdown-body font-sans">
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
                <p className="text-[9px] font-mono text-slate-400 mt-2 text-right">{msg.timestamp}</p>
              </div>

              {msg.sender === 'user' && (
                <div className="w-7 h-7 bg-[#141414] text-[#E4E3E0] border border-[#141414] flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3">
              <div className="w-7 h-7 bg-[#141414] text-emerald-400 border border-[#141414] flex items-center justify-center shrink-0">
                <Bot className="w-3.5 h-3.5 animate-bounce" />
              </div>
              <div className="bg-white border border-[#141414] p-3 text-xs font-mono font-bold uppercase flex items-center gap-2 text-slate-600">
                <Sparkles className="w-4 h-4 text-emerald-600 animate-spin" />
                Analyzing data & generating reasoning...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Executive Prompts */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex gap-2 overflow-x-auto scrollbar-none">
          {executivePrompts.map(prompt => (
            <button
              key={prompt}
              onClick={() => handleSendMessage(prompt)}
              disabled={isLoading}
              className="text-[9px] bg-white border border-[#141414] text-[#141414] hover:bg-[#141414] hover:text-[#E4E3E0] px-3 py-1.5 font-mono uppercase font-bold shrink-0 transition-all disabled:opacity-50 cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSendMessage(input);
          }}
          className="p-4 bg-white border-t border-[#141414] flex gap-3 items-center"
        >
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={`Ask complex questions about ${businessData.businessName}'s sales, root causes, forecasts...`}
            disabled={isLoading}
            className="flex-1 bg-[#F0EFED] text-xs text-[#141414] placeholder-slate-400 px-4 py-3 border border-[#141414] outline-none font-mono uppercase tracking-tight"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="bg-[#141414] text-[#E4E3E0] hover:bg-black border border-[#141414] p-3 transition-all disabled:opacity-50 cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
}

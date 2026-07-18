import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bot,
  ArrowRight,
  Database,
  Layers,
  LineChart,
  BrainCircuit,
  MessageSquare,
  Zap,
  CheckCircle2,
  Building2,
  ShoppingCart,
  Users,
  Briefcase,
  Smartphone,
  TrendingUp,
  AlertTriangle,
  Clock,
  ArrowDownToLine,
  Activity
} from 'lucide-react';
import FounderApplication from './FounderApplication';

export default function LandingPage({ onEnterApp }: { onEnterApp: () => void }) {
  const [activePrompt, setActivePrompt] = useState(0);
  const [isApplicationOpen, setIsApplicationOpen] = useState(false);
  const prompts = [
    "Why did sales drop yesterday?",
    "Predict August revenue based on current trends.",
    "Who are my VIP customers?",
    "Draft a restock email to the supplier."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActivePrompt((prev) => (prev + 1) % prompts.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [prompts.length]);

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-[#141414] font-sans selection:bg-emerald-500 selection:text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-[#141414]/10 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#141414] text-white flex items-center justify-center rounded-sm">
              <Bot className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight">Orlence</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#vision" className="hover:text-[#141414] transition-colors">Vision</a>
            <a href="#features" className="hover:text-[#141414] transition-colors">Platform</a>
            <a href="#agents" className="hover:text-[#141414] transition-colors">Agents</a>
            <a href="#pricing" className="hover:text-[#141414] transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsApplicationOpen(true)}
              className="bg-[#141414] text-white px-5 py-2 text-sm font-medium rounded-sm hover:bg-emerald-600 transition-colors flex items-center gap-2"
            >
              Apply for Access <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-24 px-6 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="max-w-2xl">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-6"
            >
              Meet the AI That Runs Your Business With You.
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg md:text-xl text-slate-600 mb-8 leading-relaxed"
            >
              Connect your existing tools. Ask questions in plain English. Get recommendations, forecasts, and automations - all in one place.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-8"
            >
              <button 
                onClick={() => window.location.href = '/founding'}
                className="bg-[#141414] text-white px-8 py-4 text-sm font-bold rounded-sm hover:bg-emerald-600 transition-colors w-full sm:w-auto flex justify-center items-center shadow-lg"
              >
                Become a Founding Business
              </button>
              <div className="mt-4 flex items-center gap-4 text-xs font-medium text-slate-400">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500"/> Early access</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500"/> No Debit card</span>
                <button onClick={onEnterApp} className="text-[#141414] hover:text-emerald-600 underline ml-auto flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5" /> Watch Interactive Demo
                </button>
              </div>
            </motion.div>

            {/* Integration Flow Diagram */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-12 p-5 bg-slate-50 border border-[#141414]/10 rounded-xl max-w-sm"
            >
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">How it works</p>
              <div className="flex flex-col gap-2">
                {/* Tools row */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {['Paystack', 'Bumpa', 'WhatsApp'].map(tool => (
                    <span key={tool} className="px-2.5 py-1 bg-white border border-slate-200 rounded-md text-[11px] font-semibold text-slate-600">{tool}</span>
                  ))}
                </div>
                {/* Arrow */}
                <div className="flex items-center gap-1 text-slate-300 text-xs pl-1">
                  <ArrowDownToLine className="w-3.5 h-3.5" />
                </div>
                {/* Orlence badge */}
                <div className="self-start bg-[#141414] text-white px-3 py-1.5 rounded-md font-bold tracking-widest text-[10px]">
                  ORLENCE AI
                </div>
                {/* Arrow */}
                <div className="flex items-center gap-1 text-slate-300 text-xs pl-1">
                  <ArrowDownToLine className="w-3.5 h-3.5" />
                </div>
                {/* Output */}
                <div className="self-start px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-md text-emerald-700 font-bold text-[11px]">
                  Business Answers
                </div>
              </div>
            </motion.div>

          </div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-emerald-500/10 blur-3xl rounded-full"></div>
            <div className="bg-white border border-[#141414]/10 rounded-xl shadow-2xl overflow-hidden relative z-10 flex flex-col h-[420px]">
              <div className="bg-slate-50 border-b border-[#141414]/10 px-4 py-3 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-red-400"></div>
                <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                <span className="text-xs font-mono text-slate-500 ml-2">orlence-intelligence-live</span>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-end gap-6 overflow-hidden bg-white/50 backdrop-blur-sm">
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center text-xs font-medium">You</div>
                  <div className="bg-slate-100 rounded-2xl rounded-tl-sm px-4 py-3 text-sm">
                    Why did sales drop yesterday?
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-[#141414] flex-shrink-0 flex items-center justify-center text-white">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-emerald-50 rounded-2xl rounded-tr-sm px-5 py-4 text-sm border border-emerald-100 w-full">
                    <p className="font-medium mb-3">Sales fell 14%.</p>
                    <p className="text-xs font-bold uppercase text-slate-500 mb-2 tracking-wider">Reason:</p>
                    <ul className="list-disc pl-4 space-y-1 mb-4 text-slate-700">
                      <li>Instagram traffic dropped 32%</li>
                      <li>Agbada Elite sold out</li>
                      <li>17 abandoned carts on Bumpa</li>
                    </ul>
                    <p className="text-xs font-bold uppercase text-emerald-700 mb-2 tracking-wider">Recommendation:</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-white border border-emerald-200 text-emerald-800 text-xs px-2 py-1 rounded-sm flex items-center gap-1 shadow-sm"><Zap className="w-3 h-3"/> Restock inventory</span>
                      <span className="bg-white border border-emerald-200 text-emerald-800 text-xs px-2 py-1 rounded-sm flex items-center gap-1 shadow-sm"><MessageSquare className="w-3 h-3"/> Launch WhatsApp reminder</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trusted By */}
      <section className="border-t border-[#141414]/10 bg-slate-50 py-10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">Works seamlessly with</p>
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-6 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            {['Paystack', 'Flutterwave', 'Bumpa', 'WhatsApp', 'Moniepoint', 'Shopify', 'Google Sheets', 'Instagram', 'Kippa'].map(brand => (
              <span key={brand} className="text-xl font-bold tracking-tighter text-[#141414]">{brand}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Built for Africa Badge */}
      <div className="bg-[#141414] py-3 text-center border-b border-[#141414]">
        <p className="text-xs font-mono uppercase tracking-widest text-slate-400 flex flex-wrap justify-center items-center gap-4">
          <span className="text-white font-bold">Built for African Businesses</span>
          <span className="hidden sm:inline opacity-30">|</span>
          <span className="flex items-center gap-1.5"><span className="text-base">🇳🇬</span> Nigeria (Live)</span>
          <span className="flex items-center gap-1.5"><span className="text-base">🇬🇭</span> Ghana (Live)</span>
          <span className="flex items-center gap-1.5 opacity-50"><span className="text-base">🇰🇪</span> Kenya (Soon)</span>
          <span className="flex items-center gap-1.5 opacity-50"><span className="text-base">🇿🇦</span> South Africa (Soon)</span>
        </p>
      </div>

      {/* Problem vs Vision */}
      <section id="vision" className="py-24 px-6 max-w-7xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">Stop Switching Between 10 Business Apps.</h2>
        <p className="text-xl text-slate-500 mb-16 max-w-2xl mx-auto">They need software that understands everything.</p>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Today */}
          <div className="p-10 border border-[#141414]/10 rounded-2xl bg-white shadow-sm relative">
            <span className="absolute -top-3 left-10 bg-white px-3 text-xs font-bold uppercase tracking-wider text-slate-400">Today</span>
            <div className="flex flex-col items-center gap-4 text-slate-600">
              <div className="flex gap-4 flex-wrap justify-center max-w-xs mx-auto text-sm font-medium">
                <span className="px-3 py-1.5 border border-slate-200 rounded-sm">Instagram</span>
                <span className="px-3 py-1.5 border border-slate-200 rounded-sm">Bumpa</span>
                <span className="px-3 py-1.5 border border-slate-200 rounded-sm">Paystack</span>
                <span className="px-3 py-1.5 border border-slate-200 rounded-sm">Excel</span>
                <span className="px-3 py-1.5 border border-slate-200 rounded-sm">WhatsApp</span>
                <span className="px-3 py-1.5 border border-slate-200 rounded-sm">Bank</span>
              </div>
              <div className="text-xl rotate-90 text-slate-300">➔</div>
              <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center text-2xl">😩</div>
              <p className="font-medium">You, trying to connect everything.</p>
            </div>
          </div>

          {/* With Orlence */}
          <div className="p-10 border-2 border-emerald-500 rounded-2xl bg-emerald-50/30 shadow-md relative">
            <span className="absolute -top-3 left-10 bg-[#FDFDFD] px-3 text-xs font-bold uppercase tracking-wider text-emerald-600">With Orlence</span>
            <div className="flex flex-col items-center gap-4">
              <div className="text-sm font-medium text-slate-600 px-8 py-2 border border-slate-200 rounded-sm bg-white">
                Everything Connected
              </div>
              <div className="text-xl rotate-90 text-emerald-300">➔</div>
              <div className="bg-[#141414] text-white px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-500/20">
                <BrainCircuit className="w-5 h-5 text-emerald-400" />
                <span className="font-bold tracking-wide">Orlence Brain</span>
              </div>
              <div className="text-xl rotate-90 text-emerald-300">➔</div>
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <p className="font-medium text-[#141414]">You, acting on pure intelligence.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section: Outcomes Show Don't Tell */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto border-t border-[#141414]/5">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ask One Question. Get Every Business Answer.</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="p-8 border border-[#141414]/10 rounded-xl hover:border-emerald-500/50 transition-colors bg-white shadow-sm flex flex-col">
            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-6">
              <Database className="w-6 h-6 text-[#141414]" />
            </div>
            <h3 className="text-xl font-bold mb-4">Understand</h3>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 italic flex-1 flex items-center">
              "Your revenue yesterday was ₦245,000. Up 12% from last week."
            </div>
          </div>

          <div className="p-8 border border-[#141414]/10 rounded-xl hover:border-emerald-500/50 transition-colors bg-white shadow-sm flex flex-col">
            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-6">
              <BrainCircuit className="w-6 h-6 text-[#141414]" />
            </div>
            <h3 className="text-xl font-bold mb-4">Explain</h3>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 italic flex-1 flex items-center">
              "Sales dropped because Instagram traffic fell 38%."
            </div>
          </div>

          <div className="p-8 border border-[#141414]/10 rounded-xl hover:border-emerald-500/50 transition-colors bg-white shadow-sm flex flex-col">
            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-6">
              <LineChart className="w-6 h-6 text-[#141414]" />
            </div>
            <h3 className="text-xl font-bold mb-4">Predict</h3>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 italic flex-1 flex items-center">
              "You're likely to sell 42 Ankara shirts next week."
            </div>
          </div>

          <div className="p-8 border border-[#141414]/10 rounded-xl hover:border-emerald-500/50 transition-colors bg-white shadow-sm flex flex-col">
            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-6">
              <Zap className="w-6 h-6 text-[#141414]" />
            </div>
            <h3 className="text-xl font-bold mb-4">Act</h3>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 italic flex-1 flex items-center">
              "I've drafted a WhatsApp restock campaign. Approve to send."
            </div>
          </div>
        </div>
      </section>

      {/* Daily CEO Briefing */}
      <section className="py-24 bg-slate-100 border-y border-[#141414]/10">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">Your First 5 Minutes Every Morning.</h2>
            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              Before you open Instagram. Before you check Paystack. Open Orlence and read your personalized Daily CEO Briefing. 
              One screen, all the insight, ready for action.
            </p>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 font-medium text-slate-700"><CheckCircle2 className="w-5 h-5 text-emerald-500"/> Consolidated revenue metrics</li>
              <li className="flex items-center gap-3 font-medium text-slate-700"><CheckCircle2 className="w-5 h-5 text-emerald-500"/> Critical inventory alerts</li>
              <li className="flex items-center gap-3 font-medium text-slate-700"><CheckCircle2 className="w-5 h-5 text-emerald-500"/> Actionable marketing recommendations</li>
            </ul>
          </div>
          <div className="flex justify-center">
            <div className="w-full max-w-[340px] bg-white border-8 border-[#141414] rounded-[2.5rem] shadow-2xl overflow-hidden relative">
              {/* iPhone Notch */}
              <div className="absolute top-0 inset-x-0 h-6 bg-[#141414] rounded-b-xl w-32 mx-auto"></div>
              
              <div className="p-6 pt-10 h-full flex flex-col gap-5 bg-[#FDFDFD]">
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Today's Briefing</p>
                  <h3 className="text-xl font-bold">Good Morning, Ada.</h3>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">Yesterday</p>
                  <div className="flex justify-between items-end mb-2">
                    <p className="text-2xl font-bold">₦245,000</p>
                    <p className="text-emerald-500 text-sm font-bold flex items-center"><TrendingUp className="w-3 h-3 mr-1"/> 12%</p>
                  </div>
                  <p className="text-xs text-slate-600"><strong>Best Seller:</strong> Ankara Casual</p>
                </div>

                <div className="bg-rose-50 p-4 rounded-xl border border-rose-100 flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-rose-800 mb-0.5">Inventory Alert</p>
                    <p className="text-xs text-rose-600 leading-tight">Only 4 units left of Blue Agbada Elite. Restock recommended.</p>
                  </div>
                </div>

                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex gap-3">
                  <Activity className="w-5 h-5 text-indigo-500 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-indigo-800 mb-0.5">Marketing Impact</p>
                    <p className="text-xs text-indigo-600 leading-tight">Instagram generated 63% of sales.</p>
                  </div>
                </div>

                <div className="bg-[#141414] p-4 rounded-xl text-white mt-2">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-2">Today's Recommendation</p>
                  <p className="text-sm font-medium mb-4">Increase ad budget by ₦10,000 to maximize weekend traffic.</p>
                  <button className="w-full bg-white text-[#141414] py-2 rounded-md text-xs font-bold">Approve Action</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Real Business Examples Section */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center mb-16">Built for Businesses Like Yours</h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white border border-[#141414]/10 rounded-2xl overflow-hidden hover:shadow-xl transition-shadow flex flex-col">
            <div className="h-32 bg-slate-900 text-white p-6 flex flex-col justify-end">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Fashion Brand</span>
              <h3 className="text-xl font-bold">Lagos, Nigeria</h3>
            </div>
            <div className="p-6 flex flex-col gap-4 flex-1">
              <div className="flex justify-between border-b border-slate-100 pb-3">
                <span className="text-slate-500 text-sm">Monthly Revenue</span>
                <span className="font-bold">₦4.2M</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-3">
                <span className="text-slate-500 text-sm">Top Product</span>
                <span className="font-bold">Agbada Elite</span>
              </div>
              <div className="mt-auto pt-4">
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2">Orlence Recommendation</p>
                <p className="text-sm font-medium bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                  "Increase price of Agbada Elite by 7%. Demand elasticity supports higher margin."
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#141414]/10 rounded-2xl overflow-hidden hover:shadow-xl transition-shadow flex flex-col">
            <div className="h-32 bg-emerald-900 text-white p-6 flex flex-col justify-end">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-300 mb-1">Pharmacy</span>
              <h3 className="text-xl font-bold">Abuja, Nigeria</h3>
            </div>
            <div className="p-6 flex flex-col gap-4 flex-1">
              <div className="flex justify-between border-b border-slate-100 pb-3">
                <span className="text-slate-500 text-sm">Low Stock</span>
                <span className="font-bold text-rose-500">Paracetamol</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-3">
                <span className="text-slate-500 text-sm">Expected Spike</span>
                <span className="font-bold">Tomorrow</span>
              </div>
              <div className="mt-auto pt-4">
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2">Orlence Recommendation</p>
                <p className="text-sm font-medium bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                  "Generated LPO for 500 units of Paracetamol from MedSuppliers Ltd. Ready to send."
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#141414]/10 rounded-2xl overflow-hidden hover:shadow-xl transition-shadow flex flex-col">
            <div className="h-32 bg-rose-900 text-white p-6 flex flex-col justify-end">
              <span className="text-xs font-bold uppercase tracking-widest text-rose-300 mb-1">Restaurant</span>
              <h3 className="text-xl font-bold">Ibadan, Nigeria</h3>
            </div>
            <div className="p-6 flex flex-col gap-4 flex-1">
              <div className="flex justify-between border-b border-slate-100 pb-3">
                <span className="text-slate-500 text-sm">Peak Ordering</span>
                <span className="font-bold">6:15 PM</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-3">
                <span className="text-slate-500 text-sm">Conversion Rate</span>
                <span className="font-bold">22%</span>
              </div>
              <div className="mt-auto pt-4">
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2">Orlence Recommendation</p>
                <p className="text-sm font-medium bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                  "Schedule a 15% discount WhatsApp blast to inactive customers at 5:45 PM today."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Meet Your AI Team */}
      <section id="agents" className="py-24 px-6 max-w-7xl mx-auto text-center border-t border-[#141414]/5">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">Meet Your AI Team</h2>
        <p className="text-xl text-slate-500 mb-16 max-w-2xl mx-auto">Don't hire more staff. Deploy intelligent agents that work 24/7.</p>
        
        <div className="flex flex-wrap justify-center gap-6">
          <div className="w-48 p-6 border border-[#141414]/10 rounded-xl text-center hover:shadow-lg transition-all bg-white group">
            <div className="w-12 h-12 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-emerald-100 transition-colors">
              <MessageSquare className="w-5 h-5 text-[#141414] group-hover:text-emerald-600" />
            </div>
            <h4 className="font-bold mb-1">Marketing Agent</h4>
            <p className="text-xs text-slate-500">Writes campaigns.</p>
          </div>
          <div className="w-48 p-6 border border-[#141414]/10 rounded-xl text-center hover:shadow-lg transition-all bg-white group">
            <div className="w-12 h-12 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-emerald-100 transition-colors">
              <LineChart className="w-5 h-5 text-[#141414] group-hover:text-emerald-600" />
            </div>
            <h4 className="font-bold mb-1">Finance Agent</h4>
            <p className="text-xs text-slate-500">Tracks profit.</p>
          </div>
          <div className="w-48 p-6 border border-[#141414]/10 rounded-xl text-center hover:shadow-lg transition-all bg-white group">
            <div className="w-12 h-12 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-emerald-100 transition-colors">
              <Users className="w-5 h-5 text-[#141414] group-hover:text-emerald-600" />
            </div>
            <h4 className="font-bold mb-1">Sales Agent</h4>
            <p className="text-xs text-slate-500">Finds opportunities.</p>
          </div>
          <div className="w-48 p-6 border border-[#141414]/10 rounded-xl text-center hover:shadow-lg transition-all bg-white group">
            <div className="w-12 h-12 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-emerald-100 transition-colors">
              <ShoppingCart className="w-5 h-5 text-[#141414] group-hover:text-emerald-600" />
            </div>
            <h4 className="font-bold mb-1">Inventory Agent</h4>
            <p className="text-xs text-slate-500">Predicts shortages.</p>
          </div>
          <div className="w-48 p-6 border-2 border-[#141414] rounded-xl text-center hover:shadow-lg transition-all bg-white shadow-md relative">
            <div className="absolute -top-3 inset-x-0 flex justify-center">
              <span className="bg-[#141414] text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm">You</span>
            </div>
            <div className="w-12 h-12 mx-auto bg-[#141414] rounded-full flex items-center justify-center mb-4">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <h4 className="font-bold mb-1">CEO Agent</h4>
            <p className="text-xs text-slate-500">Answers strategy.</p>
          </div>
        </div>
      </section>

      {/* The Workflow */}
      <section className="py-24 bg-[#141414] text-white">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-16">The Orlence Workflow</h2>
          
          <div className="flex flex-wrap justify-center items-center gap-4 text-center">
            <div className="p-4 bg-[#1C1C1C] border border-white/20 rounded-xl font-medium">Sale happens</div>
            <ArrowRight className="text-emerald-400 hidden md:block" />
            <ArrowDownToLine className="text-emerald-400 md:hidden" />
            <div className="p-4 bg-[#1C1C1C] border border-white/20 rounded-xl font-medium">Orlence notices</div>
            <ArrowRight className="text-emerald-400 hidden md:block" />
            <ArrowDownToLine className="text-emerald-400 md:hidden" />
            <div className="p-4 bg-[#1C1C1C] border border-emerald-500/30 rounded-xl font-medium text-emerald-400">Finds the reason</div>
            <ArrowRight className="text-emerald-400 hidden md:block" />
            <ArrowDownToLine className="text-emerald-400 md:hidden" />
            <div className="p-4 bg-[#1C1C1C] border border-white/20 rounded-xl font-medium">Recommends action</div>
            <ArrowRight className="text-emerald-400 hidden md:block" />
            <ArrowDownToLine className="text-emerald-400 md:hidden" />
            <div className="p-4 bg-white text-[#141414] font-bold border border-white/20 rounded-xl shadow-lg shadow-emerald-500/20">You approve</div>
            <ArrowRight className="text-emerald-400 hidden md:block" />
            <ArrowDownToLine className="text-emerald-400 md:hidden" />
            <div className="p-4 bg-emerald-500 text-white font-bold border border-emerald-400 rounded-xl">Done ✓</div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-24 px-6 bg-slate-50 border-b border-[#141414]/10">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center mb-16">Trusted by African Businesses</h2>
          
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="bg-white p-8 border border-[#141414]/10 rounded-xl shadow-sm">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h4 className="font-bold text-lg">Fashion Store</h4>
                  <p className="text-sm text-slate-500">Lagos, Nigeria</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-emerald-600">18%</p>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Revenue Increase</p>
                </div>
              </div>
              <p className="text-slate-700 italic">
                "Instead of checking six different apps every morning, I ask Orlence one question. It's like having a brilliant COO who never sleeps."
              </p>
            </div>

            <div className="bg-white p-8 border border-[#141414]/10 rounded-xl shadow-sm">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h4 className="font-bold text-lg">Restaurant Chain</h4>
                  <p className="text-sm text-slate-500">Abuja, Nigeria</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-emerald-600">12 hrs</p>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Saved per week</p>
                </div>
              </div>
              <p className="text-slate-700 italic">
                "Orlence completely automated our inventory tracking and purchasing. I used to spend my entire Sunday doing what the AI does instantly."
              </p>
            </div>
          </div>

          <div className="bg-[#141414] text-white p-8 border border-[#141414] rounded-xl shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h4 className="font-bold text-xl mb-1">Electronics Retailer</h4>
              <p className="text-sm text-slate-400">Ibadan, Nigeria</p>
            </div>
            <div className="text-left md:text-right">
              <p className="text-3xl font-bold text-emerald-400 mb-1">Reduced stock-outs by 43%</p>
              <p className="text-slate-300 italic">"The predictive alerts saved us millions in lost sales during the holiday rush."</p>
            </div>
          </div>

        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">Pricing Built for Your Business</h2>
          <p className="text-slate-500">Invest in intelligence, not just dashboards.</p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          <div className="p-8 rounded-xl border border-[#141414]/10 bg-slate-50 flex flex-col">
            <h3 className="font-bold text-lg mb-2">Starter</h3>
            <p className="text-xs text-slate-500 mb-4 h-8">Perfect for side hustles and small shops.</p>
            <div className="mb-6">
              <span className="text-3xl font-bold">₦7,500</span>
              <span className="text-slate-500 text-sm">/mo</span>
            </div>
            <ul className="space-y-3 mb-8 text-sm text-slate-600 flex-1">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500"/> AI Dashboard</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500"/> 3 Integrations</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500"/> Daily Briefing</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500"/> AI Chat</li>
            </ul>
            <button onClick={() => setIsApplicationOpen(true)} className="w-full py-2.5 rounded-sm text-sm font-bold transition-colors block text-center bg-white border border-[#141414]/20 hover:bg-slate-100 text-[#141414]">
              Apply for Access
            </button>
          </div>

          <div className="p-8 rounded-xl border border-emerald-500 shadow-xl shadow-emerald-500/10 bg-white relative flex flex-col transform md:-translate-y-4">
            <span className="absolute -top-3 inset-x-0 mx-auto w-max px-3 py-0.5 bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-sm">Most Popular</span>
            <h3 className="font-bold text-lg mb-2">Growth</h3>
            <p className="text-xs text-slate-500 mb-4 h-8">For growing brands moving fast.</p>
            <div className="mb-6">
              <span className="text-3xl font-bold">₦20,000</span>
              <span className="text-slate-500 text-sm">/mo</span>
            </div>
            <ul className="space-y-3 mb-8 text-sm text-slate-600 flex-1">
              <li className="flex items-center gap-2 font-bold text-[#141414]"><CheckCircle2 className="w-4 h-4 text-emerald-500"/> Unlimited AI</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500"/> Forecasting</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500"/> Marketing AI</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500"/> Inventory AI</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500"/> Team Members</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500"/> WhatsApp Integration</li>
            </ul>
            <button onClick={() => setIsApplicationOpen(true)} className="w-full py-3 rounded-sm text-sm font-bold transition-colors block text-center bg-[#141414] text-white hover:bg-emerald-600">
              Apply for Access
            </button>
          </div>

          <div className="p-8 rounded-xl border border-[#141414]/10 bg-slate-50 flex flex-col">
            <h3 className="font-bold text-lg mb-2">Scale</h3>
            <p className="text-xs text-slate-500 mb-4 h-8">For established SMEs.</p>
            <div className="mb-6">
              <span className="text-3xl font-bold">₦45,000</span>
              <span className="text-slate-500 text-sm">/mo</span>
            </div>
            <ul className="space-y-3 mb-8 text-sm text-slate-600 flex-1">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500"/> Everything in Growth</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500"/> Advanced Analytics</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500"/> Custom Reports</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500"/> Priority Support</li>
            </ul>
            <button onClick={() => setIsApplicationOpen(true)} className="w-full py-2.5 rounded-sm text-sm font-bold transition-colors block text-center bg-white border border-[#141414]/20 hover:bg-slate-100 text-[#141414]">
              Apply for Access
            </button>
          </div>

          <div className="p-8 rounded-xl border border-[#141414]/10 bg-slate-50 flex flex-col">
            <h3 className="font-bold text-lg mb-2">Enterprise</h3>
            <p className="text-xs text-slate-500 mb-4 h-8">For large retail operations.</p>
            <div className="mb-6">
              <span className="text-3xl font-bold">Custom</span>
              <span className="text-slate-500 text-sm">/mo</span>
            </div>
            <ul className="space-y-3 mb-8 text-sm text-slate-600 flex-1">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500"/> Dedicated AI Model</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500"/> Custom Integrations</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500"/> API Access</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500"/> Account Manager</li>
            </ul>
            <a href="#waitlist" className="w-full py-2.5 rounded-sm text-sm font-bold transition-colors block text-center bg-white border border-[#141414]/20 hover:bg-slate-100 text-[#141414]">
              Contact Sales
            </a>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section id="waitlist" className="py-32 px-6 bg-emerald-950 text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-800/50 via-emerald-950 to-emerald-950"></div>
        <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">Join the Founder's Circle.</h2>
          <p className="text-xl text-emerald-200 mb-10">We're inviting the first 100 businesses to shape Orlence before public launch.</p>
          <div className="w-full flex justify-center">
            <button 
              onClick={() => setIsApplicationOpen(true)}
              className="bg-white text-emerald-950 px-8 py-4 text-lg font-bold rounded-sm hover:bg-emerald-50 transition-colors flex items-center gap-2 shadow-xl"
            >
              Start Application <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      <FounderApplication isOpen={isApplicationOpen} onClose={() => setIsApplicationOpen(false)} />

      {/* Footer */}
      <footer className="bg-[#141414] text-slate-400 py-16 px-6 text-sm border-t border-white/10">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 text-white mb-6">
              <Bot className="w-5 h-5" />
              <span className="font-bold text-lg tracking-tight">Orlence</span>
            </div>
            <p className="text-xs text-slate-500 mb-6">The Business Intelligence Layer for Modern Companies.</p>
            
            {/* Built for African Businesses Trust Badge */}
            <div className="border border-white/10 p-4 rounded-lg bg-white/5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-white mb-3">Built for Modern African Businesses</p>
              <ul className="space-y-1 text-xs">
                <li className="flex items-center gap-2"><span className="text-sm">🇳🇬</span> Nigeria (Live)</li>
                <li className="flex items-center gap-2"><span className="text-sm">🇬🇭</span> Ghana (Live)</li>
                <li className="flex items-center gap-2 opacity-50"><span className="text-sm">🇰🇪</span> Kenya (Soon)</li>
                <li className="flex items-center gap-2 opacity-50"><span className="text-sm">🇿🇦</span> South Africa (Soon)</li>
              </ul>
            </div>
          </div>
          <div className="md:ml-auto">
            <h4 className="text-white font-bold mb-4">Products</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white transition-colors">Orlence OS</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Intelligence</a></li>
              <li><a href="#" className="hover:text-white transition-colors">API</a></li>
            </ul>
          </div>
          <div className="md:ml-auto">
            <h4 className="text-white font-bold mb-4">Solutions</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white transition-colors">Ecommerce</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Retail</a></li>
              <li><a href="#" className="hover:text-white transition-colors">B2B SaaS</a></li>
            </ul>
          </div>
          <div className="md:ml-auto">
            <h4 className="text-white font-bold mb-4">Resources</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white transition-colors">Developers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
            </ul>
          </div>
          <div className="md:ml-auto">
            <h4 className="text-white font-bold mb-4">Company</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white transition-colors">About</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 pt-8 border-t border-white/10 text-xs">
          <p>© 2026 Orlence. Understand. Decide. Grow.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

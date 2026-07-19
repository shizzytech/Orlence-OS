import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Bot, ArrowRight, CheckCircle2, TrendingUp, Handshake, Users, 
  MessageSquare, BrainCircuit, Target, Sparkles, Building2, Crown
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLaunch } from '../context/LaunchContext';
import FounderApplication from './FounderApplication';

export default function FoundingProgram() {
  const [isApplicationOpen, setIsApplicationOpen] = useState(false);
  const { activeProgram, loading } = useLaunch();


  return (
    <div className="min-h-screen bg-[#FDFDFD] text-[#141414] font-sans selection:bg-emerald-500 selection:text-white pb-32">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-[#141414]/10 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.href = '/'}>
            <div className="w-8 h-8 bg-[#141414] text-white flex items-center justify-center rounded-sm">
              <Bot className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight">Orlence</span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsApplicationOpen(true)}
              className="bg-emerald-600 text-white px-5 py-2 text-sm font-medium rounded-sm hover:bg-emerald-700 transition-colors flex items-center gap-2"
            >
              Apply for Access <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold mb-8"
        >
          <Crown className="w-4 h-4" /> {activeProgram?.name || 'Founding Program'}
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] mb-6"
        >
          Build the future of AI-powered business intelligence with us.
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto"
        >
          We're selecting {activeProgram?.max_members || 50} ambitious businesses to become our founding partners. You won't just use Orlence - you'll help shape it.
        </motion.p>

        {/* Live Counter */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white border border-[#141414]/10 rounded-2xl p-8 shadow-xl max-w-md mx-auto"
        >
          <div className="flex items-end justify-center gap-2 mb-4">
            <span className="text-5xl font-black text-[#141414] tracking-tighter">
              {loading ? '...' : activeProgram?.accepted_members || 0}
            </span>
            <span className="text-xl text-slate-400 font-medium mb-1">/ {activeProgram?.max_members || 50}</span>
          </div>
          <p className="text-sm font-bold text-emerald-600 uppercase tracking-widest mb-4">Founding Businesses Accepted</p>
          
          <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden mb-8">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ${activeProgram?.status === 'closed' ? 'bg-rose-500' : 'bg-emerald-500'}`}
              style={{ width: `${Math.min(100, ((loading ? 0 : (activeProgram?.accepted_members || 0)) / (activeProgram?.max_members || 50)) * 100)}%` }}
            />
          </div>

          {activeProgram?.status === 'closed' ? (
            <button 
              onClick={() => setIsApplicationOpen(true)}
              className="w-full bg-rose-500 text-white py-4 rounded-xl font-bold hover:bg-rose-600 transition-colors flex items-center justify-center gap-2"
            >
              Founding Cohort Full - Join Waitlist <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button 
              onClick={() => setIsApplicationOpen(true)}
              className="w-full bg-[#141414] text-white py-4 rounded-xl font-bold hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2"
            >
              Apply as a Founding Business <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </motion.div>
      </section>

      {/* Program Details */}
      <section className="px-6 max-w-5xl mx-auto grid md:grid-cols-2 gap-12 mt-10">
        
        {/* What You'll Receive */}
        <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-bold mb-6">Build Orlence With Us</h3>
          <p className="text-slate-600 mb-8">As one of our founding businesses, you'll receive:</p>
          <ul className="space-y-6">
            {[
              { title: "Founder Pricing Protection", desc: "Lock in exclusive founder pricing while your subscription remains active." },
              { title: "White-Glove Onboarding", desc: "We'll personally help you connect your tools and get your business running on Orlence." },
              { title: "Early Access", desc: "Use new AI capabilities before they're released publicly." },
              { title: "Direct Access to the Founders", desc: "Share feedback, ask questions, and help influence the roadmap." },
              { title: "Priority AI Workflow Development", desc: "Request industry-specific workflows and automations that help shape future features." },
              { title: "Founder Recognition", desc: "Receive a digital Founding Business badge and, with your permission, be featured as one of Orlence's earliest partners." },
              { title: "Private Founder Community", desc: "Join a small group of ambitious business owners sharing ideas and feedback." },
              { title: "Migration Assistance", desc: "We'll help you connect tools like Paystack, Bumpa, Google Sheets, and WhatsApp Business." }
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-4">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">{item.title}</h4>
                  <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-12">
          {/* What We Ask */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <div className="w-12 h-12 bg-slate-100 text-slate-700 rounded-2xl flex items-center justify-center mb-6">
              <Handshake className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold mb-4">What We Ask</h3>
            <p className="text-slate-600 mb-6 font-medium leading-relaxed">We're looking for partners, not just customers. As a founding business, we ask that you:</p>
            <ul className="space-y-4">
              {[
                "Spend 30 minutes onboarding with us.",
                "Share honest feedback as you use Orlence.",
                "Join an occasional product discussion.",
                "Allow us to learn from your workflows (never your private business data without permission)."
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <Target className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                  <span className="text-slate-700 font-medium leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Why We're Limiting It */}
          <div className="bg-emerald-950 p-8 rounded-3xl text-white shadow-xl shadow-emerald-900/20">
            <h3 className="text-2xl font-bold mb-4 text-emerald-50">Why Only {activeProgram?.max_members || 50}?</h3>
            <p className="text-emerald-100/90 leading-relaxed">
              We believe great software is built alongside real businesses. By working closely with a small group of founding partners, we can provide personal onboarding, respond quickly to feedback, and build features that solve real operational challenges - not imagined ones.
            </p>
          </div>

          {/* Who Should Apply */}
          <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200">
            <h3 className="text-2xl font-bold mb-6 text-slate-900">Who Should Apply?</h3>
            <p className="text-slate-600 mb-6 font-medium">We're looking for businesses that:</p>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-slate-700 font-medium leading-relaxed">Already use tools like Paystack, Bumpa, Shopify, WhatsApp, or Google Sheets.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-slate-700 font-medium leading-relaxed">Want to make faster, data-driven decisions.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-slate-700 font-medium leading-relaxed">Are excited to help shape the future of AI for African businesses.</span>
              </li>
            </ul>
            <p className="text-slate-600 font-medium italic">
              If that sounds like you, we'd love to build Orlence together.
            </p>
          </div>
        </div>

      </section>

      {/* Timeline Section */}
      <section className="px-6 max-w-4xl mx-auto mt-24">
        <h2 className="text-3xl font-bold text-center mb-12">The Founder Journey</h2>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 md:gap-2 text-center">
          {[
            { step: '1', title: 'Apply', desc: 'Submit form' },
            { step: '2', title: 'Review', desc: 'Internal check' },
            { step: '3', title: 'Discovery', desc: 'Quick chat' },
            { step: '4', title: 'Accepted', desc: 'Welcome' },
            { step: '5', title: 'Onboarding', desc: 'Setup' },
            { step: '6', title: 'Launch', desc: 'Connect' }
          ].map((s, i) => (
            <div key={i} className="relative flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-[#141414] text-white flex items-center justify-center font-bold mb-3 z-10">
                {s.step}
              </div>
              <h4 className="font-bold text-sm mb-1">{s.title}</h4>
              <p className="text-xs text-slate-500">{s.desc}</p>
              {i < 5 && (
                <div className="hidden md:block absolute top-5 left-[60%] w-full h-[2px] bg-slate-200" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-6 max-w-3xl mx-auto mt-24">
        <h2 className="text-3xl font-bold text-center mb-10">Frequently Asked Questions</h2>
        <div className="bg-white rounded-3xl border border-slate-200 p-8 md:p-10 shadow-sm">
          <div className="mb-8">
            <h3 className="text-xl font-bold text-slate-900 mb-3">Founder Pricing</h3>
            <p className="text-slate-600 leading-relaxed mb-4">
              We're currently working with a limited number of founding businesses to shape both the product and its pricing.
            </p>
            <p className="text-slate-600 leading-relaxed mb-4">
              If accepted, you'll receive an exclusive founder rate that's lower than our future public pricing.
            </p>
            <p className="text-slate-600 leading-relaxed font-medium">
              Your founder rate is confirmed before you commit.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Will my data be private?</h3>
            <p className="text-slate-600 leading-relaxed">
              Yes. Your business data is completely siloed and encrypted. We never share your data with other businesses, and our AI models do not train on your private customer records.
            </p>
          </div>
        </div>
      </section>

      {/* Founder Badge Preview */}
      <section className="px-6 max-w-3xl mx-auto mt-32 text-center">
        <div className="bg-[#141414] rounded-3xl p-12 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-900/40 via-[#141414] to-[#141414]" />
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-4">Official Founder Status</h2>
            <p className="text-slate-400 mb-10 max-w-md mx-auto">Every accepted business receives a digital badge, founder certificate, and lifetime recognition inside the Orlence dashboard.</p>
            
            <div className="mx-auto w-64 h-64 rounded-full border-[8px] border-[#222] bg-gradient-to-br from-[#333] to-[#111] flex flex-col items-center justify-center shadow-inner relative">
              <div className="absolute inset-0 bg-emerald-500/10 rounded-full blur-xl mix-blend-overlay"></div>
              <Crown className="w-12 h-12 text-emerald-400 mb-3" />
              <div className="font-black text-xl tracking-widest text-white mb-1">ORLENCE</div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-emerald-400 font-bold mb-4">Founding Business</div>
              <div className="px-3 py-1 bg-white/10 rounded-full text-xs font-mono text-slate-300">
                {activeProgram?.cohort || '2026 Cohort'}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-6 text-center mt-24">
        {activeProgram?.status === 'closed' ? (
          <button 
            onClick={() => setIsApplicationOpen(true)}
            className="bg-rose-500 text-white px-10 py-5 text-lg font-bold rounded-xl hover:bg-rose-600 transition-colors inline-flex items-center gap-3 shadow-xl shadow-rose-500/20"
          >
            Join the Waitlist <ArrowRight className="w-6 h-6" />
          </button>
        ) : (
          <button 
            onClick={() => setIsApplicationOpen(true)}
            className="bg-emerald-600 text-white px-10 py-5 text-lg font-bold rounded-xl hover:bg-emerald-700 transition-colors inline-flex items-center gap-3 shadow-xl shadow-emerald-600/20"
          >
            Start Your Application <ArrowRight className="w-6 h-6" />
          </button>
        )}
      </section>

      {/* Application Modal */}
      {isApplicationOpen && (
        <FounderApplication
          isOpen={isApplicationOpen}
          onClose={() => setIsApplicationOpen(false)}
        />
      )}
    </div>
  );
}

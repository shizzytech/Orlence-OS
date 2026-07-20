import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Zap, CheckCircle2, Clock, ArrowRight, MessageSquare,
  Calendar, Unlock, Award, FileText, Activity,
  Users, ChevronRight, Lock, ExternalLink,
  RefreshCw, Circle, Phone, Shield, Bell, CheckSquare, 
  Map, BookOpen, LifeBuoy
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLaunch } from '../context/LaunchContext';

// ─── Configuration ────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; step: number; color: string; tier: number; tierLabel: string; passportBg: string; passportAccent: string, completionPct: number, estTime: string }> = {
  pending:          { label: 'Application Received', step: 1, color: 'text-amber-600 bg-amber-50 border-amber-200',   tier: 1, tierLabel: 'Candidate',       passportBg: 'bg-slate-800',  passportAccent: 'text-slate-400', completionPct: 15, estTime: '48 Hours' },
  reviewing:        { label: 'Under Review',          step: 2, color: 'text-blue-600 bg-blue-50 border-blue-200',     tier: 2, tierLabel: 'Under Review',    passportBg: 'bg-blue-900',   passportAccent: 'text-blue-300', completionPct: 40, estTime: '24 Hours' },
  interview_booked: { label: 'Discovery Scheduled',   step: 3, color: 'text-indigo-600 bg-indigo-50 border-indigo-200', tier: 3, tierLabel: 'Discovery Stage', passportBg: 'bg-indigo-900', passportAccent: 'text-indigo-300', completionPct: 75, estTime: 'Awaiting Call' },
  approved:         { label: 'Accepted',              step: 4, color: 'text-emerald-600 bg-emerald-50 border-emerald-200', tier: 4, tierLabel: 'Accepted',    passportBg: 'bg-emerald-900',passportAccent: 'text-emerald-300', completionPct: 100, estTime: 'Action Required' },
  onboarding:       { label: 'Onboarding',            step: 5, color: 'text-white bg-[#141414] border-slate-700', tier: 5, tierLabel: 'Founding Member', passportBg: 'bg-[#141414]',  passportAccent: 'text-white', completionPct: 100, estTime: 'Setup Phase' },
  active:           { label: 'Founding Customer',     step: 6, color: 'text-amber-800 bg-amber-100 border-amber-300',  tier: 6, tierLabel: 'Charter Founder', passportBg: 'bg-gradient-to-br from-amber-600 to-amber-900',  passportAccent: 'text-amber-100', completionPct: 100, estTime: 'Active' },
  rejected:         { label: 'Not Selected',          step: 0, color: 'text-rose-600 bg-rose-50 border-rose-200',     tier: 0, tierLabel: 'Candidate',       passportBg: 'bg-slate-800',  passportAccent: 'text-slate-400', completionPct: 100, estTime: 'Complete' },
  waitlisted:       { label: 'Waitlisted',            step: 0.5, color: 'text-orange-600 bg-orange-50 border-orange-200', tier: 1, tierLabel: 'Candidate',   passportBg: 'bg-slate-800',  passportAccent: 'text-slate-400', completionPct: 15, estTime: 'Queue' },
};

const FOUNDER_PIPELINE = [
  { id: 'applied',          label: 'Applied',              desc: 'Application submitted',     minStep: 1 },
  { id: 'reviewing',        label: 'Under Review',         desc: 'Team reviewing application', minStep: 2 },
  { id: 'interview_booked', label: 'Discovery Call',       desc: 'Call scheduled with team',   minStep: 3 },
  { id: 'approved',         label: 'Accepted',             desc: 'Welcome to Orlence',          minStep: 4 },
  { id: 'invitation',       label: 'Invitation Sent',      desc: 'Check your inbox',            minStep: 4.5 },
];

const TABS = [
  { id: 'overview', label: 'Overview', icon: Zap },
  { id: 'timeline', label: 'Status & Timeline', icon: Map },
  { id: 'profile', label: 'Founder Profile', icon: Users },
  { id: 'community', label: 'Community', icon: MessageSquare },
  { id: 'resources', label: 'Resources', icon: BookOpen },
  { id: 'support', label: 'Support', icon: LifeBuoy },
];

// ─── AI Logic ─────────────────────────────────────────────────────────────
function getAiExplanation(status: string, businessName: string): string {
  switch (status) {
    case 'pending': return `Your application for ${businessName} has been received. Our automated systems have logged your tool stack and order volume. The human team will begin review shortly.`;
    case 'reviewing': return `Our team is currently evaluating how Orlence can streamline operations for ${businessName}. We are checking integration compatibility and potential time savings. No action is required from you.`;
    case 'interview_booked': return `We've identified strong potential for ${businessName}. Your Discovery Call is scheduled. We'll discuss your specific pain points and demonstrate how Orlence will solve them.`;
    case 'approved': return `Congratulations! ${businessName} has been accepted into the Founding Program. We're excited to partner with you to build the future of AI business intelligence. Check your email for next steps.`;
    case 'onboarding': return `Welcome aboard. You are currently setting up your Orlence workspace. Our team is monitoring your integration progress and is ready to assist.`;
    case 'active': return `${businessName} is fully activated. Orlence AI is now monitoring your operations.`;
    default: return 'Application is currently being processed.';
  }
}

function calcAiAnalysis(data: any) {
  let score = 20;
  const knownTools = ['Bumpa', 'Shopify', 'WooCommerce', 'Paystack', 'Flutterwave', 'Google Sheets'];
  const tools = data?.current_tools || [];
  
  const strengths = [];
  const weaknesses = [];

  if (tools.some((t: string) => knownTools.includes(t))) {
    score += 20;
    strengths.push('Modern digital tool stack');
  } else {
    weaknesses.push('Limited digital integrations');
  }

  let hoursSaved = 0;
  if (data?.monthly_orders === '50-200') { score += 10; hoursSaved = 8; }
  else if (data?.monthly_orders === '200-1000') { score += 20; strengths.push('High transaction volume'); hoursSaved = 15; }
  else if (data?.monthly_orders === '1000+') { score += 25; strengths.push('Enterprise transaction volume'); hoursSaved = 30; }
  else { weaknesses.push('Low current order volume'); }

  const painPoints = data?.pain_point || [];
  if (painPoints.length > 0) {
    score += 10;
    strengths.push('Clear operational pain points identified');
  }
  if (painPoints.length > 2) score += 5;
  
  if (!tools.includes('Google Sheets') && !tools.includes('Excel')) {
    weaknesses.push('No central data warehouse detected');
  }

  if (strengths.length === 0) strengths.push('Ready for digital transformation');
  if (weaknesses.length === 0) weaknesses.push('None identified');

  return {
    score: Math.min(score, 100),
    strengths,
    weaknesses,
    timeSaved: hoursSaved
  };
}

// ─── Component ────────────────────────────────────────────────────────────
interface Props { token: string | null }

export default function FounderPortal({ token }: Props) {
  const { activeProgram } = useLaunch();
  const [appData, setAppData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [toast, setToast] = useState<string | null>(null);

  const loadData = async () => {
    let localData: any = null;
    if (token) {
      const raw = localStorage.getItem(`orlence_founder_${token}`);
      if (raw) { try { localData = JSON.parse(raw); } catch {} }
    }
    if (!localData) {
      const raw = localStorage.getItem('orlence_founder_app');
      if (raw) { try { localData = JSON.parse(raw); } catch {} }
    }

    if (localData) setAppData(localData);

    if (localData?.email) {
      try {
        const { data: live, error } = await supabase
          .from('founder_applications')
          .select('*')
          .eq('email', localData.email)
          .maybeSingle();

        if (!error && live) {
          setAppData((prev: any) => ({ ...prev, ...live, isLive: true }));
          setIsLive(true);
        }
      } catch {}
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [token]);

  // Real-time updates subscription
  useEffect(() => {
    if (!appData?.id) return;
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'founder_applications', filter: `id=eq.${appData.id}` }, 
        (payload) => {
          setAppData((prev: any) => ({ ...prev, ...payload.new }));
          setToast('🎉 Your application status has been updated!');
          setTimeout(() => setToast(null), 5000);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [appData?.id]);


  if (loading) return (
    <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-slate-200 border-t-emerald-500 rounded-full animate-spin" />
    </div>
  );

  if (!appData) return (
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col items-center justify-center text-center">
      <Shield className="w-12 h-12 text-slate-300 mb-4" />
      <h1 className="text-2xl font-bold mb-2">Portal Not Found</h1>
      <button onClick={() => window.location.href = '/founder'} className="bg-[#141414] text-white px-6 py-2 rounded-xl mt-4">Go to Login</button>
    </div>
  );

  const status = appData.status || 'pending';
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const firstName = appData.name?.split(' ')[0] || 'Founder';
  const ai = calcAiAnalysis(appData);
  const passportNumber = `ORL-FDR-${String(appData.founder_number || '0').padStart(3, '0')}`;
  
  // Mock Timeline Events based on current status
  const mockTimeline = [
    { title: 'Application Submitted', date: new Date(appData.created_at || appData.submitted_at || Date.now()).toLocaleDateString(), done: true },
    { title: 'Community Joined', date: 'Pending', done: false },
    { title: 'Team Started Review', date: cfg.step >= 2 ? 'Completed' : 'Pending', done: cfg.step >= 2 },
    { title: 'Discovery Scheduled', date: cfg.step >= 3 ? 'Completed' : 'Pending', done: cfg.step >= 3 },
    { title: 'Approved', date: cfg.step >= 4 ? 'Completed' : 'Pending', done: cfg.step >= 4 },
  ];

  return (
    <div className="min-h-screen bg-[#F8F8F7] font-sans text-[#141414] flex flex-col pb-24">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }} className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-[#141414] text-white px-6 py-3 rounded-full font-bold shadow-2xl flex items-center gap-2">
            <Bell className="w-4 h-4 text-emerald-400 animate-bounce" /> {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Nav */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#141414] text-white flex items-center justify-center rounded-lg cursor-pointer" onClick={() => window.location.href = '/'}>
              <Zap className="w-4 h-4" />
            </div>
            <span className="font-bold text-lg hidden sm:block">Orlence OS</span>
          </div>
          <div className="flex items-center gap-4">
            {isLive && <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded-full"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Live DB</div>}
          </div>
        </div>
        {/* Tabs */}
        <div className="max-w-6xl mx-auto px-6 flex overflow-x-auto scrollbar-none gap-6">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} className={`flex items-center gap-2 py-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === t.id ? 'border-[#141414] text-[#141414]' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            
            <div className="flex flex-col md:flex-row gap-6">
              {/* Left Column */}
              <div className="flex-1 space-y-6">
                
                {/* Greeting & AI Explanation */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                  <h1 className="text-2xl font-bold mb-2">Hello, {firstName} 👋</h1>
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 mt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-bold uppercase tracking-widest text-slate-500">AI Status Summary</span>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed">{getAiExplanation(status, appData.business_name || 'your business')}</p>
                  </div>
                </div>

                {/* Next Milestone & Progress */}
                <div className="bg-[#141414] text-white rounded-2xl p-6 shadow-lg">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest mb-1">Current Milestone</p>
                      <h2 className="text-xl font-bold">{cfg.label}</h2>
                    </div>
                    <div className="text-right">
                      <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest mb-1">Queue Position</p>
                      <p className="text-emerald-400 font-bold font-mono">#{appData.founder_number || 'TBD'}</p>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-2">
                      <span className="text-emerald-400">{cfg.completionPct}% Complete</span>
                      <span className="text-white/50 flex items-center gap-1"><Clock className="w-3 h-3" /> {cfg.estTime}</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${cfg.completionPct}%` }} />
                    </div>
                  </div>
                </div>

                {/* Gamified Checklist */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                  <h3 className="font-bold mb-4 flex items-center gap-2"><CheckSquare className="w-5 h-5 text-indigo-500" /> Founder Achievements</h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Applied for Early Access', done: true },
                      { label: 'Joined Intelligence Lab', done: false },
                      { label: 'Discovery Call Completed', done: cfg.step > 3 },
                      { label: 'Accepted as Founder', done: cfg.step >= 4 },
                      { label: 'First AI Insight Generated', done: cfg.step >= 6 }
                    ].map((item, i) => (
                      <div key={i} className={`flex items-center gap-3 ${item.done ? 'text-[#141414]' : 'text-slate-400'}`}>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${item.done ? 'bg-emerald-500 text-white' : 'bg-slate-100 border border-slate-200'}`}>
                          {item.done && <CheckCircle2 className="w-3 h-3" />}
                        </div>
                        <span className="text-sm font-medium">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Right Column (Passport) */}
              <div className="w-full md:w-80 shrink-0">
                <div className={`relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 ${cfg.passportBg} transition-colors duration-700`}>
                  <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '20px 20px' }} />
                  <div className="relative z-10 p-6">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-2">
                        <Zap className={`w-4 h-4 ${cfg.passportAccent}`} />
                        <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${cfg.passportAccent}`}>Passport</span>
                      </div>
                      <div className="text-right">
                        <div className="text-[9px] font-bold uppercase tracking-widest opacity-50 text-white mb-0.5">Tier {cfg.tier}</div>
                        <div className={`text-[10px] font-bold ${cfg.passportAccent}`}>{cfg.tierLabel}</div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <p className="text-white/40 text-[9px] uppercase tracking-wider mb-0.5">Founder</p>
                        <p className="text-white text-xl font-bold">{appData.name}</p>
                      </div>
                      <div>
                        <p className="text-white/40 text-[9px] uppercase tracking-wider mb-0.5">Business</p>
                        <p className="text-white font-semibold">{appData.business_name}</p>
                      </div>
                      <div>
                        <p className="text-white/40 text-[9px] uppercase tracking-wider mb-0.5">Passport Number</p>
                        <p className={`font-mono font-bold text-sm tracking-wider ${cfg.passportAccent}`}>{passportNumber}</p>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-white/10">
                      <p className="text-white/40 text-[9px] uppercase tracking-widest mb-3">Evolution</p>
                      <div className="flex items-center gap-1.5">
                        {[1,2,3,4,5,6].map(t => (
                          <div key={t} className={`flex-1 h-1 rounded-full ${t <= cfg.tier ? cfg.passportAccent.replace('text-', 'bg-') : 'bg-white/10'}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TIMELINE TAB */}
        {activeTab === 'timeline' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <h3 className="font-bold text-lg mb-6 flex items-center gap-2"><Map className="w-5 h-5 text-emerald-600" /> Activity Timeline</h3>
              <div className="relative border-l-2 border-slate-100 ml-3 space-y-6">
                {mockTimeline.map((item, i) => (
                  <div key={i} className={`relative pl-6 ${item.done ? '' : 'opacity-40'}`}>
                    <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 bg-white ${item.done ? 'border-emerald-500' : 'border-slate-300'}`}>
                      {item.done && <div className="w-2 h-2 bg-emerald-500 rounded-full m-0.5" />}
                    </div>
                    <p className={`font-bold text-sm ${item.done ? 'text-[#141414]' : 'text-slate-500'}`}>{item.title}</p>
                    <p className="text-xs text-slate-400 mt-1">{item.date}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 shadow-sm flex flex-col h-full">
              <h3 className="font-bold text-amber-900 mb-4 flex items-center gap-2"><MessageSquare className="w-4 h-4" /> Admin Notes Feed</h3>
              <div className="flex-1 space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {appData.admin_notes && appData.admin_notes.length > 0 ? (
                  [...appData.admin_notes].reverse().map((note: any, idx) => (
                    <div key={idx} className="bg-white rounded-xl p-4 shadow-sm border border-amber-100">
                      <p className="text-sm text-slate-700 mb-3 whitespace-pre-wrap">{note.text}</p>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <div className="w-5 h-5 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 font-bold shrink-0">{note.author[0]}</div>
                        {note.author} • {new Date(note.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white rounded-xl p-4 shadow-sm text-center py-8">
                    <p className="text-sm text-slate-500 italic">No notes from the team yet. Updates will appear here.</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h2 className="font-bold text-lg mb-6">Business Profile</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div><p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Industry</p><p className="font-semibold">{appData.business_type}</p></div>
                <div><p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Volume</p><p className="font-semibold">{appData.monthly_orders} orders</p></div>
                <div><p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Country</p><p className="font-semibold">{appData.country}</p></div>
                <div><p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Integrations</p><div className="flex gap-1 flex-wrap">{appData.current_tools?.map((t: string) => <span key={t} className="bg-slate-100 text-xs px-2 py-0.5 rounded">{t}</span>) || 'None'}</div></div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h2 className="font-bold text-lg mb-6 flex items-center gap-2"><Activity className="w-5 h-5 text-indigo-500" /> AI Readiness Score</h2>
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="relative w-32 h-32 shrink-0">
                  <svg className="w-32 h-32 -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#f1f5f9" strokeWidth="10" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke={ai.score >= 80 ? '#10b981' : ai.score >= 60 ? '#f59e0b' : '#ef4444'} strokeWidth="10" strokeLinecap="round" strokeDasharray={`${(ai.score / 100) * 251.2} 251.2`} />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black">{ai.score}</span>
                    <span className="text-[10px] text-slate-400 font-bold">/ 100</span>
                  </div>
                </div>
                
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
                  <div>
                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2">Strengths</p>
                    <ul className="space-y-1 text-sm text-slate-600">
                      {ai.strengths.map(s => <li key={s} className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> {s}</li>)}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-rose-500 uppercase tracking-widest mb-2">Weaknesses</p>
                    <ul className="space-y-1 text-sm text-slate-600">
                      {ai.weaknesses.map(s => <li key={s} className="flex items-center gap-2"><Circle className="w-2 h-2 border border-rose-500 rounded-full" /> {s}</li>)}
                    </ul>
                  </div>
                </div>

                <div className="bg-indigo-50 rounded-xl p-4 text-center shrink-0 w-40 border border-indigo-100">
                  <p className="text-3xl font-black text-indigo-700">{ai.timeSaved}h</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-900 mt-1">Est. Time Saved / Wk</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* COMMUNITY TAB */}
        {activeTab === 'community' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-xl mx-auto">
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-sm">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6"><MessageSquare className="w-8 h-8" /></div>
              <h2 className="text-2xl font-bold mb-2">Business Intelligence Lab</h2>
              <p className="text-slate-500 mb-8">Join the private WhatsApp community where founders share insights, attend workshops, and help shape the Orlence roadmap.</p>
              
              <div className="flex justify-center gap-4 mb-8">
                <div className="text-center"><p className="text-xl font-black">67</p><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Founders</p></div>
                <div className="w-px bg-slate-100" />
                <div className="text-center"><p className="text-xl font-black">13</p><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Industries</p></div>
              </div>

              <button onClick={() => window.open('https://chat.whatsapp.com/Gr2DVgmeRBk8kK3zTRjar8', '_blank')} className="w-full bg-[#141414] text-white py-4 rounded-xl font-bold hover:bg-emerald-600 transition-colors">Join WhatsApp Group</button>
            </div>
          </motion.div>
        )}

        {/* DEFAULT (COMING SOON) */}
        {(activeTab === 'resources' || activeTab === 'support') && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Lock className="w-8 h-8 mb-4 opacity-50" />
            <h2 className="text-lg font-bold">Unlocks at Step 4</h2>
            <p className="text-sm mt-1">These features will become available once accepted.</p>
          </motion.div>
        )}

      </main>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bot,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Building2,
  Globe2,
  Users,
  Zap,
  Target,
  Sparkles,
  BrainCircuit,
  Box,
  CreditCard,
  MessageSquare,
  LineChart,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

interface OnboardingProps {
  onComplete: () => void;
}

const INDUSTRIES = [
  'Fashion & Apparel',
  'Food & Beverage',
  'Electronics',
  'Beauty & Cosmetics',
  'Health & Wellness',
  'Home & Furniture',
  'Agriculture',
  'Services / Agency',
  'Other',
];

const GOALS = [
  { id: 'sales', label: 'Boost Sales & Revenue', icon: LineChart, desc: 'Detect dips, track conversion ROI' },
  { id: 'inventory', label: 'Automate Inventory & Stock', icon: Box, desc: 'Reorder alerts, prevent stockouts' },
  { id: 'marketing', label: 'Scale Social & WhatsApp', icon: MessageSquare, desc: 'Abandoned cart recovery, AI chats' },
  { id: 'finance', label: 'Cashflow & Profit Diagnostics', icon: CreditCard, desc: 'Real-time payment sync & alerts' },
  { id: 'reporting', label: 'Automated Daily Briefings', icon: Target, desc: 'Zero manual spreadsheets' },
];

const ALL_INTEGRATIONS = [
  { id: 'paystack', name: 'Paystack', desc: 'Real-time revenue & card transactions', type: 'Finance', scoreBonus: 27 },
  { id: 'bumpa', name: 'Bumpa', desc: 'Inventory & order management', type: 'Commerce', scoreBonus: 34 },
  { id: 'shopify', name: 'Shopify', desc: 'Product catalog & customer tags', type: 'Commerce', scoreBonus: 25 },
  { id: 'whatsapp', name: 'WhatsApp Business', desc: 'AI customer support & recovery', type: 'Marketing', scoreBonus: 20 },
  { id: 'instagram', name: 'Instagram', desc: 'Social sales & lead tracking', type: 'Marketing', scoreBonus: 13 },
  { id: 'sheets', name: 'Google Sheets', desc: 'Manual cost & supplier logs', type: 'Operations', scoreBonus: 15 },
];

const STEP_LABELS = ['Welcome', 'Business Profile', 'Business Goals', 'Integrations', 'Brain Activation'];

export default function Onboarding({ onComplete }: OnboardingProps) {
  const { profile } = useAuth();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Profile data
  const [businessName, setBusinessName] = useState('');
  const [industry, setIndustry] = useState('');
  const [teamSize, setTeamSize] = useState('2-5');
  const [country, setCountry] = useState('NG');

  // Goals data
  const [selectedGoals, setSelectedGoals] = useState<string[]>(['sales', 'inventory', 'finance']);

  // Integrations data
  const [selectedIntegrations, setSelectedIntegrations] = useState<string[]>(['paystack', 'bumpa', 'whatsapp']);

  // Pre-fill from profile or stored application data
  useEffect(() => {
    if (profile) {
      if (profile.business_name) setBusinessName(profile.business_name);
      if (profile.full_name) {
        const parts = profile.full_name.split(' ');
        if (parts[0]) setBusinessName(prev => prev || `${parts[0]}'s Business`);
      }
    }

    const savedApp = localStorage.getItem('orlence_active_application');
    if (savedApp) {
      try {
        const app = JSON.parse(savedApp);
        if (app.business_name) setBusinessName(app.business_name);
        if (app.current_tools && Array.isArray(app.current_tools)) {
          const matched = ALL_INTEGRATIONS.filter(i => 
            app.current_tools.some((t: string) => t.toLowerCase().includes(i.id))
          ).map(i => i.id);
          if (matched.length > 0) setSelectedIntegrations(matched);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, [profile]);

  const firstName = (profile?.full_name || '').split(' ')[0] || 'Founder';

  const toggleGoal = (id: string) => {
    setSelectedGoals(prev => prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]);
  };

  const toggleIntegration = (id: string) => {
    setSelectedIntegrations(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const currentScore = Math.min(100, selectedIntegrations.reduce((acc, id) => {
    const found = ALL_INTEGRATIONS.find(i => i.id === id);
    return acc + (found?.scoreBonus || 15);
  }, 0));

  const handleNextStep = async (nextStepNumber: number) => {
    setStep(nextStepNumber);
    if (profile?.id) {
      await supabase.from('profiles').update({
        business_name: businessName,
        industry,
        team_size: teamSize,
        country,
        onboarding_step: nextStepNumber
      }).eq('id', profile.id);
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      if (profile?.id) {
        await supabase.from('profiles').update({
          onboarding_complete: true,
          onboarding_step: 5
        }).eq('id', profile.id);
      }
      onComplete();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const progressPct = ((step - 1) / (STEP_LABELS.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col items-center justify-center p-6 text-[#141414] font-sans">
      {/* Top logo */}
      <div className="absolute top-6 left-6 flex items-center gap-2">
        <div className="p-2 bg-[#141414] text-[#E4E3E0] flex items-center justify-center rounded">
          <Bot className="w-5 h-5" />
        </div>
        <span className="font-black text-lg">Orlence OS</span>
      </div>

      <div className="w-full max-w-2xl mt-12 mb-8">
        {/* Step indicator */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            {STEP_LABELS.map((label, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 ${
                    i + 1 < step
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : i + 1 === step
                      ? 'bg-[#141414] border-[#141414] text-white shadow-md'
                      : 'bg-white border-slate-200 text-slate-400'
                  }`}
                >
                  {i + 1 < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider hidden sm:block ${
                  i + 1 === step ? 'text-[#141414]' : 'text-slate-400'
                }`}>
                  {label}
                </span>
              </div>
            ))}
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-emerald-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>

        {/* Card */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden min-h-[480px] flex flex-col">
          <AnimatePresence mode="wait">

            {/* STEP 1: Welcome */}
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col p-8 sm:p-12">
                <div className="flex-1 flex flex-col justify-center">
                  <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-600/30">
                    <Sparkles className="w-7 h-7" />
                  </div>
                  <h1 className="text-3xl font-bold tracking-tight mb-3">Hi {firstName} 👋</h1>
                  <p className="text-slate-600 text-lg leading-relaxed mb-6">
                    Welcome to Orlence OS. Let's personalize your workspace and connect your business brain.
                  </p>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3 mb-8">
                    {[
                      { icon: Building2, text: 'Confirm your business details' },
                      { icon: Target, text: 'Select your operational goals' },
                      { icon: BrainCircuit, text: 'Activate your intelligence agents' },
                    ].map(({ icon: Icon, text }, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-7 h-7 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-slate-700 font-medium text-sm">{text}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => handleNextStep(2)}
                    className="self-start bg-[#141414] text-white px-8 py-3.5 rounded-xl font-bold hover:bg-emerald-600 transition-colors flex items-center gap-2"
                  >
                    Build My Business Brain <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: Business Profile */}
            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col p-8 sm:p-12">
                <div className="flex-1 space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight mb-1">Business Profile</h2>
                    <p className="text-slate-500 text-sm">Help Orlence tailor AI insights specifically to your industry.</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Business Name</label>
                      <input
                        type="text"
                        value={businessName}
                        onChange={e => setBusinessName(e.target.value)}
                        placeholder="e.g. Albarka Cosmetics"
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none bg-slate-50 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Industry</label>
                      <select
                        value={industry}
                        onChange={e => setIndustry(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none bg-slate-50 focus:bg-white"
                      >
                        <option value="">Select industry...</option>
                        {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                      </select>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2"><Users className="inline w-3.5 h-3.5 mr-1" />Team Size</label>
                        <select value={teamSize} onChange={e => setTeamSize(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none bg-slate-50">
                          <option value="solo">Just me</option>
                          <option value="2-5">2–5 employees</option>
                          <option value="6-20">6–20 employees</option>
                          <option value="21-50">21–50 employees</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2"><Globe2 className="inline w-3.5 h-3.5 mr-1" />Country</label>
                        <select value={country} onChange={e => setCountry(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none bg-slate-50">
                          <option value="NG">🇳🇬 Nigeria</option>
                          <option value="GH">🇬🇭 Ghana</option>
                          <option value="KE">🇰🇪 Kenya</option>
                          <option value="RW">🇷🇼 Rwanda</option>
                          <option value="ZA">🇿🇦 South Africa</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-100">
                  <button onClick={() => setStep(1)} className="text-sm font-bold text-slate-400 hover:text-slate-600">← Back</button>
                  <button onClick={() => handleNextStep(3)} disabled={!businessName} className="bg-[#141414] text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-600 transition-colors flex items-center gap-2 disabled:opacity-50">
                    Continue <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Goals */}
            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col p-8 sm:p-12">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold tracking-tight mb-1">What do you want Orlence to watch?</h2>
                  <p className="text-slate-500 text-sm mb-6">Select your top business priorities.</p>

                  <div className="space-y-3">
                    {GOALS.map(g => {
                      const isSel = selectedGoals.includes(g.id);
                      const Icon = g.icon;
                      return (
                        <div
                          key={g.id}
                          onClick={() => toggleGoal(g.id)}
                          className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-4 ${
                            isSel ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isSel ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-sm text-slate-900">{g.label}</p>
                            <p className="text-xs text-slate-500">{g.desc}</p>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSel ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300'}`}>
                            {isSel && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-100">
                  <button onClick={() => setStep(2)} className="text-sm font-bold text-slate-400 hover:text-slate-600">← Back</button>
                  <button onClick={() => handleNextStep(4)} className="bg-[#141414] text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-600 transition-colors flex items-center gap-2">
                    Continue <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 4: Recommended Integrations */}
            {step === 4 && (
              <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col p-8 sm:p-12">
                <div className="flex-1">
                  <div className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
                    <Sparkles className="w-3.5 h-3.5" /> Recommended For You
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight mb-1">Pre-selected from your Application</h2>
                  <p className="text-slate-500 text-sm mb-6">Orlence automatically configured these agents based on your tool stack.</p>

                  <div className="grid sm:grid-cols-2 gap-3">
                    {ALL_INTEGRATIONS.map(item => {
                      const isSel = selectedIntegrations.includes(item.id);
                      return (
                        <div
                          key={item.id}
                          onClick={() => toggleIntegration(item.id)}
                          className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start justify-between ${
                            isSel ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div>
                            <p className="font-bold text-sm">{item.name}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${isSel ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300'}`}>
                            {isSel && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-100">
                  <button onClick={() => setStep(3)} className="text-sm font-bold text-slate-400 hover:text-slate-600">← Back</button>
                  <button onClick={() => handleNextStep(5)} className="bg-[#141414] text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-600 transition-colors flex items-center gap-2">
                    Activate Business Brain <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 5: Brain Activation Score */}
            {step === 5 && (
              <motion.div key="s5" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col items-center justify-center p-8 sm:p-12 text-center">
                <div className="relative w-32 h-32 mb-6">
                  <svg className="w-32 h-32 -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#f1f5f9" strokeWidth="10" />
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#10b981" strokeWidth="10" strokeLinecap="round" strokeDasharray={`${(currentScore / 100) * 263.8} 263.8`} className="transition-all duration-1000 ease-out" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black">{currentScore}%</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Brain Active</span>
                  </div>
                </div>

                <h1 className="text-3xl font-bold tracking-tight mb-2">Business Brain Activated 🎉</h1>
                <p className="text-slate-500 text-sm max-w-sm mb-8">
                  Orlence is now actively watching {selectedIntegrations.length} connected data streams for {businessName}.
                </p>

                <button
                  onClick={handleComplete}
                  disabled={isSubmitting}
                  className="bg-emerald-600 text-white px-10 py-4 rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/25 flex items-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                  Enter Workspace <ArrowRight className="w-5 h-5" />
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

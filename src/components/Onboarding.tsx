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
  Link as LinkIcon,
  SkipForward,
  Sparkles,
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

const INTEGRATIONS = [
  { id: 'paystack', name: 'Paystack', desc: 'Payments & revenue sync', emoji: '💳' },
  { id: 'bumpa', name: 'Bumpa', desc: 'Inventory & orders', emoji: '🛍️' },
  { id: 'shopify', name: 'Shopify', desc: 'Online store data', emoji: '🏪' },
  { id: 'whatsapp', name: 'WhatsApp Business', desc: 'Customer conversations', emoji: '💬' },
  { id: 'instagram', name: 'Instagram', desc: 'Social commerce', emoji: '📸' },
  { id: 'sheets', name: 'Google Sheets', desc: 'Inventory & cost data', emoji: '📊' },
];

const STEP_LABELS = ['Welcome', 'Your Business', 'Connect Tools', 'All Set'];

export default function Onboarding({ onComplete }: OnboardingProps) {
  const { profile } = useAuth();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Business profile fields
  const [businessName, setBusinessName] = useState('');
  const [industry, setIndustry] = useState('');
  const [teamSize, setTeamSize] = useState('');
  const [country, setCountry] = useState('');

  // Integration selections
  const [selectedIntegrations, setSelectedIntegrations] = useState<string[]>([]);

  // Pre-fill from profile if available
  useEffect(() => {
    if (profile) {
      setBusinessName(profile.business_name || '');
    }
  }, [profile]);

  const firstName = (profile?.full_name || '').split(' ')[0] || 'there';

  const toggleIntegration = (id: string) => {
    setSelectedIntegrations(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const updateStep = async (newStep: number) => {
    if (profile?.id) {
      await supabase
        .from('profiles')
        .update({ onboarding_step: newStep })
        .eq('id', profile.id);
    }
    setStep(newStep);
  };

  const handleProfileSave = async () => {
    if (!businessName || !industry || !country) return;
    setIsSubmitting(true);
    try {
      if (profile?.id) {
        await supabase
          .from('profiles')
          .update({
            business_name: businessName,
            industry,
            team_size: teamSize,
            country,
            onboarding_step: 2,
          })
          .eq('id', profile.id);
      }
      setStep(3);
    } catch (err) {
      console.error('Profile save error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleIntegrationsContinue = async () => {
    setIsSubmitting(true);
    try {
      if (profile?.id) {
        await supabase
          .from('profiles')
          .update({ onboarding_step: 3 })
          .eq('id', profile.id);
      }
      setStep(4);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      if (profile?.id) {
        await supabase
          .from('profiles')
          .update({ onboarding_step: 4, onboarding_complete: true })
          .eq('id', profile.id);
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
      {/* Top-left logo */}
      <div className="absolute top-6 left-6">
        <div className="p-2.5 bg-[#141414] text-[#E4E3E0] flex items-center justify-center rounded-sm">
          <Bot className="w-5 h-5" />
        </div>
      </div>

      <div className="w-full max-w-2xl">
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
                      ? 'bg-[#141414] border-[#141414] text-white'
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
          {/* Progress bar */}
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-emerald-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Card */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden min-h-[480px] flex flex-col">
          <AnimatePresence mode="wait">

            {/* ── STEP 1: Welcome ── */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.3 }}
                className="flex-1 flex flex-col p-8 sm:p-12"
              >
                <div className="flex-1 flex flex-col justify-center">
                  <div className="w-16 h-16 bg-[#141414] text-white rounded-2xl flex items-center justify-center mb-8">
                    <Sparkles className="w-8 h-8" />
                  </div>

                  <div className="mb-8">
                    <p className="text-sm font-mono text-emerald-600 mb-3 uppercase tracking-widest">
                      Orly · AI Business Assistant
                    </p>
                    <h1 className="text-3xl font-bold tracking-tight leading-snug mb-4">
                      Welcome to Orlence, {firstName}. 👋
                    </h1>
                    <p className="text-slate-600 text-lg leading-relaxed">
                      I'm Orly, your AI business assistant. Before we dive in,
                      I'd like to learn a little about your business. This will only take about{' '}
                      <strong className="text-[#141414]">two minutes</strong>.
                    </p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 mb-10 space-y-3">
                    {[
                      { icon: Building2, text: 'Tell me about your business' },
                      { icon: LinkIcon, text: 'Which tools do you already use?' },
                      { icon: Zap, text: 'Connect your first integration' },
                    ].map(({ icon: Icon, text }, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-slate-700 font-medium text-sm">{text}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => updateStep(2)}
                    className="w-full sm:w-auto self-start bg-[#141414] text-white px-8 py-4 rounded-xl font-bold hover:bg-emerald-600 transition-colors flex items-center gap-2"
                  >
                    Let's get started <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── STEP 2: Business Profile ── */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.3 }}
                className="flex-1 flex flex-col p-8 sm:p-12"
              >
                <div className="flex-1">
                  <h2 className="text-2xl font-bold tracking-tight mb-2">Tell me about your business.</h2>
                  <p className="text-slate-500 text-sm mb-8">
                    This helps Orly give you accurate insights from day one.
                  </p>

                  <div className="space-y-5">
                    {/* Business Name */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Business Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          value={businessName}
                          onChange={e => setBusinessName(e.target.value)}
                          placeholder="e.g. Sartorial Africa"
                          className="w-full border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:border-emerald-500 focus:outline-none bg-slate-50 focus:bg-white transition-colors"
                        />
                      </div>
                    </div>

                    {/* Industry */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Industry
                      </label>
                      <select
                        value={industry}
                        onChange={e => setIndustry(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none bg-slate-50 focus:bg-white transition-colors"
                      >
                        <option value="">Select your industry…</option>
                        {INDUSTRIES.map(ind => (
                          <option key={ind} value={ind}>{ind}</option>
                        ))}
                      </select>
                    </div>

                    {/* Team Size + Country */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                          <Users className="inline w-3.5 h-3.5 mr-1" />Team Size
                        </label>
                        <select
                          value={teamSize}
                          onChange={e => setTeamSize(e.target.value)}
                          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none bg-slate-50 focus:bg-white transition-colors"
                        >
                          <option value="">Select…</option>
                          <option value="solo">Just me</option>
                          <option value="2-5">2–5</option>
                          <option value="6-20">6–20</option>
                          <option value="21-50">21–50</option>
                          <option value="50+">50+</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                          <Globe2 className="inline w-3.5 h-3.5 mr-1" />Country
                        </label>
                        <select
                          value={country}
                          onChange={e => setCountry(e.target.value)}
                          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none bg-slate-50 focus:bg-white transition-colors"
                        >
                          <option value="">Select…</option>
                          <option value="NG">🇳🇬 Nigeria</option>
                          <option value="GH">🇬🇭 Ghana</option>
                          <option value="KE">🇰🇪 Kenya</option>
                          <option value="RW">🇷🇼 Rwanda</option>
                          <option value="ZA">🇿🇦 South Africa</option>
                          <option value="TZ">🇹🇿 Tanzania</option>
                          <option value="UG">🇺🇬 Uganda</option>
                          <option value="ET">🇪🇹 Ethiopia</option>
                          <option value="SN">🇸🇳 Senegal</option>
                          <option value="CM">🇨🇲 Cameroon</option>
                          <option value="OTHER">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-8 mt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={handleProfileSave}
                    disabled={!businessName || !industry || !country || isSubmitting}
                    className="bg-[#141414] text-white px-8 py-3.5 rounded-xl font-bold hover:bg-emerald-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    Continue <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── STEP 3: Integration Wizard ── */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.3 }}
                className="flex-1 flex flex-col p-8 sm:p-12"
              >
                <div className="flex-1">
                  <h2 className="text-2xl font-bold tracking-tight mb-2">Which tools do you already use?</h2>
                  <p className="text-slate-500 text-sm mb-8">
                    Select the platforms you use. Orly will prioritize connecting these first.
                    You can always add more later.
                  </p>

                  <div className="grid sm:grid-cols-2 gap-3">
                    {INTEGRATIONS.map(integration => {
                      const isSelected = selectedIntegrations.includes(integration.id);
                      return (
                        <button
                          key={integration.id}
                          onClick={() => toggleIntegration(integration.id)}
                          className={`p-4 rounded-xl border-2 text-left transition-all flex items-center gap-3 group ${
                            isSelected
                              ? 'border-emerald-500 bg-emerald-50'
                              : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <span className="text-2xl">{integration.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <p className={`font-bold text-sm ${isSelected ? 'text-emerald-700' : 'text-[#141414]'}`}>
                              {integration.name}
                            </p>
                            <p className="text-xs text-slate-500 truncate">{integration.desc}</p>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                            isSelected ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'
                          }`}>
                            {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-8 mt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    ← Back
                  </button>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleIntegrationsContinue}
                      disabled={isSubmitting}
                      className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1"
                    >
                      <SkipForward className="w-4 h-4" /> Skip for now
                    </button>
                    <button
                      onClick={handleIntegrationsContinue}
                      disabled={isSubmitting}
                      className="bg-[#141414] text-white px-8 py-3.5 rounded-xl font-bold hover:bg-emerald-600 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                      Continue <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── STEP 4: Done ── */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="flex-1 flex flex-col items-center justify-center p-8 sm:p-12 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.15, type: 'spring', stiffness: 200, damping: 12 }}
                  className="w-24 h-24 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-8 shadow-lg shadow-emerald-500/20"
                >
                  <CheckCircle2 className="w-12 h-12" />
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                  <h1 className="text-3xl font-bold tracking-tight mb-4">
                    🎉 You're all set, {firstName}.
                  </h1>
                  <p className="text-slate-500 text-lg mb-2 max-w-md">
                    Your AI Business Brain is ready.
                  </p>
                  <p className="text-slate-400 text-sm mb-10 max-w-sm">
                    Orly has been briefed on your business. Head to your dashboard to see the first insights.
                  </p>

                  <button
                    onClick={handleComplete}
                    disabled={isSubmitting}
                    className="bg-emerald-600 text-white px-10 py-4 rounded-xl font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 mx-auto shadow-lg shadow-emerald-600/25 disabled:opacity-70"
                  >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                    Go to Dashboard <ArrowRight className="w-5 h-5" />
                  </button>
                </motion.div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

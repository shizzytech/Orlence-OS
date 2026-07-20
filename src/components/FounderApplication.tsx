import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Bot, X, ArrowRight, CheckCircle2, Activity, Send } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLaunch } from '../context/LaunchContext';

const BUSINESS_TYPES = ['Fashion', 'Restaurant', 'Pharmacy', 'Electronics', 'Beauty', 'Grocery', 'Manufacturing', 'Professional Services', 'Agency', 'Other'];
const TOOLS = ['Bumpa', 'Shopify', 'WooCommerce', 'Paystack', 'Flutterwave', 'WhatsApp Business', 'Instagram', 'Google Sheets', 'Excel', 'HubSpot', 'Zoho', 'Other'];
const CHALLENGES = [
  'I spend too much time checking different apps.',
  "I don't know which products are actually profitable.",
  "I don't know why sales change.",
  'Inventory management.',
  'Customer retention.',
  'Marketing ROI.',
  'Cashflow.',
  'Other'
];
const VOLUMES = ['Less than 50', '50-200', '200-1000', '1000+'];

interface FounderApplicationProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FounderApplication({ isOpen, onClose }: FounderApplicationProps) {
  const { activeProgram } = useLaunch();
  const [step, setStep] = useState(0);

  // Data State
  const [businessType, setBusinessType] = useState('');
  const [otherBusinessType, setOtherBusinessType] = useState('');
  const [currentTools, setCurrentTools] = useState<string[]>([]);
  const [otherTool, setOtherTool] = useState('');
  const [challenge, setChallenge] = useState<string[]>([]);
  const [otherChallenge, setOtherChallenge] = useState('');
  const [aiQuestion, setAiQuestion] = useState('');
  const [volume, setVolume] = useState('');

  const [contact, setContact] = useState({
    name: '',
    email: '',
    phone: '',
    business_name: '',
    website: '',
    instagram: '',
    country: '',
    referral_source: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [score, setScore] = useState(0);
  const [error, setError] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const otherBusinessInputRef = useRef<HTMLInputElement>(null);
  const otherChallengeInputRef = useRef<HTMLInputElement>(null);
  const otherToolInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [step, currentTools, businessType, challenge]);

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setStep(0);
      setBusinessType('');
      setOtherBusinessType('');
      setCurrentTools([]);
      setOtherTool('');
      setChallenge([]);
      setOtherChallenge('');
      setAiQuestion('');
      setVolume('');
      setContact({ name: '', email: '', phone: '', business_name: '', website: '', instagram: '', country: '', referral_source: '' });
      setScore(0);
      setError('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Resolved display values (substitutes "Other" with the custom text)
  const resolvedBusinessType = businessType === 'Other' ? (otherBusinessType || 'your business') : businessType;
  
  const resolvedChallenges = challenge.includes('Other')
    ? [...challenge.filter(c => c !== 'Other'), otherChallenge].filter(Boolean)
    : challenge;

  const resolvedTools = currentTools.includes('Other')
    ? [...currentTools.filter(t => t !== 'Other'), otherTool].filter(Boolean)
    : currentTools;

  // Article helper: "a" vs "an"
  const articleFor = (word: string) => /^[aeiou]/i.test(word) ? 'an' : 'a';

  const handleNext = () => setStep(s => s + 1);

  const calculateScore = () => {
    let s = 20;
    const knownTools = ['Bumpa', 'Shopify', 'WooCommerce', 'Paystack', 'Flutterwave'];
    if (resolvedTools.some(t => knownTools.includes(t))) s += 20;
    if (['50-200', '200-1000', '1000+'].includes(volume)) s += 20;
    if (challenge.length > 0) s += 20;
    if (aiQuestion.length > 10) s += 20;
    if (contact.phone) s += 10;
    if (contact.website || contact.instagram) s += 10;
    return Math.min(s, 100);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!contact.email || !contact.business_name) return;

    setIsSubmitting(true);
    setError('');

    const finalScore = calculateScore();
    setScore(finalScore);

    try {
      // Generate a clean, unguessable 8-char founder token (e.g. "7HJ29AKS")
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      const founderToken = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');

      const appPayload = {
        program_id: activeProgram?.id,
        business_type: resolvedBusinessType,
        current_tools: resolvedTools,
        pain_point: resolvedChallenges,
        ai_question: aiQuestion,
        monthly_orders: volume,
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        business_name: contact.business_name,
        website: contact.website,
        instagram: contact.instagram,
        country: contact.country,
        referral_source: contact.referral_source,
        priority_score: finalScore
      };

      const { error: sbError } = await supabase.from('founder_applications').insert([appPayload]);

      if (sbError) throw sbError;

      // Persist full application data keyed by this token
      // This powers the Founder Portal without requiring DB SELECT permissions
      const portalData = {
        ...appPayload,
        founder_token: founderToken,
        submitted_at: new Date().toISOString(),
        status: 'pending',
      };
      localStorage.setItem(`orlence_founder_${founderToken}`, JSON.stringify(portalData));
      localStorage.setItem('orlence_last_token', founderToken);
      // Keep legacy key for any older references
      localStorage.setItem('orlence_founder_app', JSON.stringify(portalData));

      window.location.href = `/founder/${founderToken}`;
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleChallenge = (ch: string) => {
    setChallenge(prev =>
      prev.includes(ch) ? prev.filter(c => c !== ch) : [...prev, ch]
    );
    if (ch === 'Other') {
      setTimeout(() => otherChallengeInputRef.current?.focus(), 100);
    }
  };

  const toggleTool = (tool: string) => {
    setCurrentTools(prev =>
      prev.includes(tool) ? prev.filter(t => t !== tool) : [...prev, tool]
    );
    if (tool === 'Other') {
      setTimeout(() => otherToolInputRef.current?.focus(), 100);
    }
  };

  const OrlyMessage = ({ children, delay = 0.2 }: { children: React.ReactNode; delay?: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay }}
      className="flex gap-3 mb-4"
    >
      <div className="w-8 h-8 rounded-full bg-[#141414] text-white flex items-center justify-center shrink-0">
        <Bot className="w-4 h-4" />
      </div>
      <div className="bg-slate-100 rounded-2xl rounded-tl-none px-5 py-3.5 text-sm text-slate-800 border border-slate-200">
        {children}
      </div>
    </motion.div>
  );

  const UserMessage = ({ children }: { children: React.ReactNode }) => (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="flex gap-3 mb-4 justify-end"
    >
      <div className="bg-emerald-500 rounded-2xl rounded-tr-none px-5 py-3.5 text-sm text-white shadow-sm max-w-xs break-words">
        {children}
      </div>
    </motion.div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-6 bg-[#141414]/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white sm:rounded-2xl shadow-2xl w-full h-[95vh] sm:h-auto sm:max-w-2xl sm:max-h-[90vh] flex flex-col overflow-hidden relative rounded-t-2xl"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white z-10">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-emerald-600" />
            <span className="font-bold tracking-tight">Founder Discovery</span>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        {step < 100 && (
          <div className="h-1 bg-slate-100 w-full">
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${Math.max(5, (step / 6) * 100)}%` }}
            />
          </div>
        )}

        {/* Chat Area */}
        {step < 100 && (
          <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 pb-10">

            {/* ── Step 0: Business Type ── */}
            {step >= 0 && (
              <>
                <OrlyMessage delay={0.1}>
                  <p className="font-medium text-lg mb-1">Hi 👋 I'm Orly.</p>
                  <p className="mb-3">I'd love to learn about your business to see if you're a fit for our Founder's Circle.</p>
                  <p className="font-medium">What kind of business do you run?</p>
                </OrlyMessage>

                {step === 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
                    <div className="flex flex-wrap gap-2 mt-2 mb-4">
                      {BUSINESS_TYPES.map(opt => (
                        <button
                          key={opt}
                          onClick={() => {
                            setBusinessType(opt);
                            if (opt !== 'Other') {
                              setOtherBusinessType('');
                              handleNext();
                            } else {
                              setTimeout(() => otherBusinessInputRef.current?.focus(), 100);
                            }
                          }}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                            businessType === opt
                              ? 'bg-[#141414] text-white shadow-md'
                              : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-400'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>

                    {/* "Other" inline text input */}
                    {businessType === 'Other' && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex gap-2 mb-6"
                      >
                        <input
                          ref={otherBusinessInputRef}
                          type="text"
                          value={otherBusinessType}
                          onChange={e => setOtherBusinessType(e.target.value)}
                          placeholder="Tell us what kind of business you run..."
                          className="flex-1 bg-white border border-emerald-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          onKeyDown={e => e.key === 'Enter' && otherBusinessType && handleNext()}
                        />
                        <button
                          onClick={handleNext}
                          disabled={!otherBusinessType}
                          className="bg-emerald-500 text-white p-3 rounded-xl disabled:opacity-40 hover:bg-emerald-600 transition-colors"
                        >
                          <Send className="w-5 h-5" />
                        </button>
                      </motion.div>
                    )}
                  </motion.div>
                )}
                {step > 0 && <UserMessage>{resolvedBusinessType}</UserMessage>}
              </>
            )}

            {/* ── Step 1: Tools ── */}
            {step >= 1 && (
              <>
                <OrlyMessage delay={0.3}>
                  <p>Great to meet {articleFor(resolvedBusinessType)} <strong>{resolvedBusinessType}</strong> founder!</p>
                  <p className="font-medium mt-2">Which tools do you currently use to run your business?</p>
                </OrlyMessage>

                {step === 1 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="mb-6">
                    <div className="flex flex-wrap gap-2 mt-2 mb-4">
                      {TOOLS.map(opt => {
                        const isSelected = currentTools.includes(opt);
                        return (
                          <button
                            key={opt}
                            onClick={() => toggleTool(opt)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                              isSelected
                                ? 'bg-[#141414] text-white shadow-md'
                                : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-400'
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>

                    {/* "Other" tool inline input */}
                    {currentTools.includes('Other') && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex gap-2 mb-4"
                      >
                        <input
                          ref={otherToolInputRef}
                          type="text"
                          value={otherTool}
                          onChange={e => setOtherTool(e.target.value)}
                          placeholder="Which other tool do you use?"
                          className="flex-1 bg-white border border-emerald-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </motion.div>
                    )}

                    <button
                      onClick={handleNext}
                      disabled={currentTools.length === 0 || (currentTools.includes('Other') && !otherTool)}
                      className="flex items-center gap-2 bg-[#141414] text-white px-6 py-2.5 rounded-full text-sm font-medium disabled:opacity-50 transition-opacity"
                    >
                      Continue <ArrowRight className="w-4 h-4" />
                    </button>
                  </motion.div>
                )}
                {step > 1 && <UserMessage>{resolvedTools.join(', ')}</UserMessage>}
              </>
            )}

            {/* ── Step 2: Challenge ── */}
            {step >= 2 && (
              <>
                <OrlyMessage delay={0.3}>
                  <p>Interesting stack - lots of {resolvedBusinessType.toLowerCase()} businesses use similar tools.</p>
                  <p className="font-medium mt-2">What's your biggest frustration in understanding your business today?</p>
                </OrlyMessage>

                {step === 2 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
                    <div className="flex flex-col gap-2 mt-2 mb-4 max-w-md ml-auto">
                      {CHALLENGES.map(ch => {
                        const isSelected = challenge.includes(ch);
                        return (
                          <button
                            key={ch}
                            onClick={() => toggleChallenge(ch)}
                            className={`text-left px-5 py-3 rounded-xl border text-sm font-medium transition-all ${
                              isSelected
                                ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                                : 'border-slate-200 text-slate-700 bg-white hover:border-emerald-500 hover:shadow-sm'
                            }`}
                          >
                            {ch}
                          </button>
                        );
                      })}
                    </div>

                    {/* "Other" challenge inline input */}
                    {challenge.includes('Other') && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex gap-2 mb-4 max-w-md ml-auto"
                      >
                        <input
                          ref={otherChallengeInputRef}
                          type="text"
                          value={otherChallenge}
                          onChange={e => setOtherChallenge(e.target.value)}
                          placeholder="Describe your biggest challenge..."
                          className="flex-1 bg-white border border-emerald-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </motion.div>
                    )}

                    <div className="flex justify-end">
                      <button
                        onClick={handleNext}
                        disabled={challenge.length === 0 || (challenge.includes('Other') && !otherChallenge)}
                        className="flex items-center gap-2 bg-[#141414] text-white px-6 py-2.5 rounded-full text-sm font-medium disabled:opacity-50 transition-opacity"
                      >
                        Continue <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )}
                {step > 2 && <UserMessage>{resolvedChallenges.join(', ')}</UserMessage>}
              </>
            )}

            {/* ── Step 3: AI Question ── */}
            {step >= 3 && (
              <>
                <OrlyMessage delay={0.3}>
                  <p>
                    That's a real pain point for {resolvedBusinessType.toLowerCase()} founders - <strong>{resolvedChallenges[0]?.replace(/\.$/, '').toLowerCase() || 'that'}</strong> is one of the first things Orlence solves.
                  </p>
                  <p className="font-medium mt-2">
                    If Orlence already knew everything about your {resolvedBusinessType.toLowerCase()} business... what's the very first question you'd ask it?
                  </p>
                </OrlyMessage>

                {step === 3 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mb-6 flex gap-2">
                    <input
                      type="text"
                      value={aiQuestion}
                      onChange={e => setAiQuestion(e.target.value)}
                      placeholder="e.g. Why did my sales drop last week?"
                      className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      onKeyDown={e => e.key === 'Enter' && aiQuestion && handleNext()}
                      autoFocus
                    />
                    <button
                      onClick={handleNext}
                      disabled={!aiQuestion}
                      className="bg-emerald-500 text-white p-3 rounded-xl disabled:opacity-50 hover:bg-emerald-600 transition-colors"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </motion.div>
                )}
                {step > 3 && <UserMessage>{aiQuestion}</UserMessage>}
              </>
            )}

            {/* ── Step 4: Volume ── */}
            {step >= 4 && (
              <>
                <OrlyMessage delay={0.3}>
                  <p>
                    That's a great question - and Orlence answers exactly that. 
                  </p>
                  <p className="font-medium mt-2">Approximately how many orders does your {resolvedBusinessType.toLowerCase()} business process monthly?</p>
                </OrlyMessage>

                {step === 4 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
                    <div className="flex flex-wrap gap-2 mt-2 mb-6">
                      {VOLUMES.map(opt => (
                        <button
                          key={opt}
                          onClick={() => { setVolume(opt); handleNext(); }}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                            volume === opt
                              ? 'bg-[#141414] text-white shadow-md'
                              : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-400'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
                {step > 4 && <UserMessage>{volume} orders/month</UserMessage>}
              </>
            )}

            {/* ── Step 5: Contact Info ── */}
            {step >= 5 && (
              <>
                <OrlyMessage delay={0.3}>
                  <p>
                    Perfect. A <strong>{resolvedBusinessType}</strong> founder processing <strong>{volume}</strong> orders with a clear focus on solving <strong>{resolvedChallenges.length} key challenges</strong> - you're exactly who we're building Orlence for.
                  </p>
                  <p className="font-medium mt-2">Where should we send your early access invite?</p>
                </OrlyMessage>

                {step === 5 && (
                  <motion.form
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mb-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
                    onSubmit={handleSubmit}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Business Name *</label>
                        <input required type="text" value={contact.business_name} onChange={e => setContact({ ...contact, business_name: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none" placeholder={`e.g. My ${resolvedBusinessType} Business`} />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Your Name</label>
                        <input type="text" value={contact.name} onChange={e => setContact({ ...contact, name: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email *</label>
                        <input required type="email" value={contact.email} onChange={e => setContact({ ...contact, email: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Phone Number</label>
                        <input type="tel" value={contact.phone} onChange={e => setContact({ ...contact, phone: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none" placeholder="e.g. +234..." />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Social Media Link / Handle (Optional)</label>
                        <input type="text" value={contact.instagram} onChange={e => setContact({ ...contact, instagram: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none" placeholder="e.g. @yourhandle, linkedin.com/in/..." />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Country *</label>
                        <select required value={contact.country} onChange={e => setContact({ ...contact, country: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none bg-white">
                          <option value="" disabled>Select Country</option>
                          <option value="Nigeria">Nigeria</option>
                          <option value="Kenya">Kenya</option>
                          <option value="Rwanda">Rwanda</option>
                          <option value="South Africa">South Africa</option>
                          <option value="Ghana">Ghana</option>
                          <option value="USA">USA</option>
                          <option value="UK">UK</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">How did you hear about us? *</label>
                        <select required value={contact.referral_source} onChange={e => setContact({ ...contact, referral_source: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none bg-white">
                          <option value="" disabled>Select Source</option>
                          <option value="Twitter / X">Twitter / X</option>
                          <option value="LinkedIn">LinkedIn</option>
                          <option value="Instagram">Instagram</option>
                          <option value="Word of Mouth">Word of Mouth</option>
                          <option value="Google Search">Google Search</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-[#141414] text-white py-3.5 rounded-xl font-bold hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                      {isSubmitting ? 'Submitting Application...' : 'Apply for Early Access'}
                    </button>
                  </motion.form>
                )}
              </>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </motion.div>
    </div>
  );
}

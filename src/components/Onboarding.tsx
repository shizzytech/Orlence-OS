import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Bot, CheckCircle2, ArrowRight, Loader2, Target, Link as LinkIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

interface OnboardingProps {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const { profile } = useAuth();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mark onboarding as complete
  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      if (profile?.id) {
        // Here you would typically update an `onboarding_complete` flag on the profile
        const { error } = await supabase
          .from('profiles')
          .update({ onboarding_complete: true })
          .eq('id', profile.id);
        
        if (error) console.error('Error updating profile:', error);
      }
      onComplete();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col items-center justify-center p-6 text-[#141414] font-sans">
      <div className="absolute top-6 left-6">
        <div className="p-2.5 bg-[#141414] text-[#E4E3E0] flex items-center justify-center rounded-sm">
          <Bot className="w-5 h-5" />
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-white border border-[#141414]/10 rounded-2xl shadow-xl overflow-hidden min-h-[500px] flex flex-col"
      >
        {/* Progress Bar */}
        <div className="w-full h-2 bg-slate-100">
          <div 
            className="h-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        <div className="flex-1 p-8 sm:p-12 flex flex-col">
          {step === 1 && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex-1 flex flex-col justify-center"
            >
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-8">
                <Target className="w-8 h-8" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight mb-4">Welcome to Orlence.</h1>
              <p className="text-lg text-slate-600 mb-8 max-w-lg">
                Your application has been approved. As a Founding Business, you're about to experience a completely new way of managing your operations.
              </p>
              
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 mb-10">
                <h3 className="font-bold mb-4">What happens next:</h3>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-slate-600">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Connect your existing tools
                  </li>
                  <li className="flex items-center gap-3 text-slate-600">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Let Orlence analyze your data
                  </li>
                  <li className="flex items-center gap-3 text-slate-600">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Start asking questions
                  </li>
                </ul>
              </div>

              <button 
                onClick={() => setStep(2)}
                className="w-full sm:w-auto self-start bg-[#141414] text-white px-8 py-4 rounded-xl font-bold hover:bg-emerald-600 transition-colors flex items-center gap-2"
              >
                Continue Setup <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex-1 flex flex-col justify-center"
            >
              <h1 className="text-3xl font-bold tracking-tight mb-4">Connect your first tool.</h1>
              <p className="text-slate-600 mb-8">
                Orlence works best when it has data to analyze. Let's start by connecting your primary sales or communication channel.
              </p>
              
              <div className="grid sm:grid-cols-2 gap-4 mb-10">
                {['Paystack', 'Bumpa', 'Shopify', 'WhatsApp Business'].map((tool) => (
                  <button 
                    key={tool}
                    onClick={() => setStep(3)}
                    className="p-6 border border-slate-200 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 text-left transition-all group flex items-center justify-between"
                  >
                    <span className="font-bold text-[#141414]">{tool}</span>
                    <LinkIcon className="w-5 h-5 text-slate-400 group-hover:text-emerald-500" />
                  </button>
                ))}
              </div>

              <button 
                onClick={() => setStep(3)}
                className="text-sm font-bold text-slate-400 hover:text-slate-600 text-center w-full"
              >
                I'll connect my tools later
              </button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex flex-col items-center justify-center text-center"
            >
              <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight mb-4">You're all set.</h1>
              <p className="text-lg text-slate-600 mb-10 max-w-md">
                Your workspace is ready. You can connect more tools and invite team members from your dashboard.
              </p>

              <button 
                onClick={handleComplete}
                disabled={isSubmitting}
                className="w-full sm:w-auto bg-emerald-600 text-white px-10 py-4 rounded-xl font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                Enter Orlence OS <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

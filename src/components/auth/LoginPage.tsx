import React, { useState } from 'react';
import { Bot, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { signInWithEmail } from '../../lib/auth';
import { motion } from 'motion/react';

export default function LoginPage() {
  const [isMagicLink, setIsMagicLink] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isMagicLink) {
        const { error } = await signInWithEmail(email);
        if (error) throw error;
        setMessage('Check your email for the magic link to log in!');
      } else {
        const { error } = await signInWithEmail(email, password);
        if (error) throw error;
        // The auth state listener in AuthContext will handle redirect/state update
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col items-center justify-center p-6 text-[#141414] font-sans">
      <div className="absolute top-6 left-6 cursor-pointer" onClick={() => window.location.href = '/'}>
        <div className="p-2.5 bg-[#141414] text-[#E4E3E0] border border-[#141414] flex items-center justify-center rounded-sm">
          <Bot className="w-5 h-5" />
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white border border-[#141414]/10 rounded-2xl shadow-xl overflow-hidden"
      >
        <div className="p-8 sm:p-10">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-[#141414] text-white flex items-center justify-center rounded-sm mx-auto mb-6">
              <Bot className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight mb-2">
              Welcome back.
            </h1>
            <p className="text-slate-500 text-sm">
              {isMagicLink 
                ? 'Enter your email to receive a secure login link.' 
                : 'Sign in to access Orlence OS.'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-sm text-center font-medium">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm text-center font-medium">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:border-emerald-500 focus:outline-none bg-slate-50 focus:bg-white transition-colors"
                  placeholder="you@company.com"
                />
              </div>
            </div>

            {!isMagicLink && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
                  <button 
                    type="button"
                    onClick={() => {
                      setIsMagicLink(true);
                      setError(null);
                      setMessage(null);
                    }}
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:border-emerald-500 focus:outline-none bg-slate-50 focus:bg-white transition-colors"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            )}

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-[#141414] hover:bg-emerald-600 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-70 mt-2"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              {isMagicLink ? 'Send Secure Link' : 'Sign In'}
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          {isMagicLink && (
            <button 
              onClick={() => {
                setIsMagicLink(false);
                setError(null);
                setMessage(null);
              }} 
              className="w-full mt-6 text-sm font-bold text-slate-500 hover:text-[#141414] transition-colors"
            >
              Back to Password Sign In
            </button>
          )}
        </div>

        <div className="bg-slate-50 border-t border-slate-100 p-6 text-center text-sm">
          <p className="text-slate-500 mb-2">Need access?</p>
          <a href="/founding" className="font-bold text-[#141414] hover:text-emerald-600 inline-flex items-center gap-1 transition-colors">
            Apply to become a Founding Business <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </motion.div>
    </div>
  );
}

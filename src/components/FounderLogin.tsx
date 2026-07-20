import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Zap, ArrowRight, Search, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function FounderLogin() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;

    setLoading(true);
    setError('');

    try {
      // 1. Try localStorage first (works without any DB SELECT policy)
      const lastToken = localStorage.getItem('orlence_last_token');
      if (lastToken) {
        const localStr = localStorage.getItem(`orlence_founder_${lastToken}`);
        if (localStr) {
          const data = JSON.parse(localStr);
          const isTokenMatch = lastToken.toUpperCase() === q.toUpperCase();
          const isEmailMatch = data.email?.toLowerCase() === q.toLowerCase();
          if (isTokenMatch || isEmailMatch) {
            window.location.href = `/founder/${lastToken}`;
            return;
          }
        }
      }

      // 2. Try Supabase (requires SELECT RLS policy to be added)
      const isEmail = q.includes('@');
      if (isEmail) {
        const { data, error: dbError } = await supabase
          .from('founder_applications')
          .select('founder_token, name, email')
          .eq('email', q.toLowerCase())
          .maybeSingle();

        if (!dbError && data?.founder_token) {
          window.location.href = `/founder/${data.founder_token}`;
          return;
        }
      } else {
        // Treat as a founder token lookup
        const { data, error: dbError } = await supabase
          .from('founder_applications')
          .select('founder_token, name')
          .eq('founder_token', q.toUpperCase())
          .maybeSingle();

        if (!dbError && data?.founder_token) {
          window.location.href = `/founder/${data.founder_token}`;
          return;
        }
      }

      setError('No application found. Please double-check your email or token.');
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col font-sans text-[#141414]">

      {/* Nav */}
      <nav className="px-6 py-5 flex items-center gap-2 cursor-pointer" onClick={() => window.location.href = '/'}>
        <div className="w-8 h-8 bg-[#141414] text-white flex items-center justify-center rounded-lg">
          <Zap className="w-4 h-4" />
        </div>
        <span className="font-bold text-xl tracking-tight">Orlence</span>
      </nav>

      {/* Main */}
      <div className="flex-1 flex items-center justify-center px-6 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest text-slate-500 mb-8">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
            Founder Portal
          </div>

          <h1 className="text-3xl font-bold tracking-tight mb-2">Access your portal</h1>
          <p className="text-slate-500 mb-8">Enter your email address or Founder Token to continue.</p>

          <form onSubmit={handleLookup} className="space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Email or Founder Token (e.g. 7HJ29AKS)"
                className="w-full pl-11 pr-4 py-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#141414] bg-white"
                autoComplete="off"
                spellCheck={false}
              />
            </div>

            {error && (
              <div className="flex items-start gap-3 bg-rose-50 border border-rose-100 text-rose-700 px-4 py-3 rounded-xl text-sm">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="w-full bg-[#141414] text-white py-4 rounded-xl font-bold hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Find My Portal'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500 mb-4">Don't have a token yet?</p>
            <button
              onClick={() => window.location.href = '/founding'}
              className="text-sm font-bold text-emerald-600 hover:text-emerald-700 underline"
            >
              Apply to Founding Program →
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

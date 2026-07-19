import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Bot, Lock, Eye, EyeOff, ArrowRight, Loader2, CheckCircle2, ShieldCheck } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const passwordStrengthChecks = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'Contains a number', test: (p: string) => /\d/.test(p) },
  { label: 'Contains a symbol', test: (p: string) => /[^a-zA-Z0-9]/.test(p) },
];

export default function SetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    // Read the user's name from the session metadata set during invite
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const meta = session.user.user_metadata;
        setUserName(meta?.full_name || meta?.name || '');
      }
    });
  }, []);

  const firstName = userName.split(' ')[0] || 'there';

  const checks = passwordStrengthChecks.map(c => ({
    ...c,
    passed: c.test(password),
  }));
  const allChecksPassed = checks.every(c => c.passed);
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;
  const isValid = allChecksPassed && passwordsMatch;

  const strengthScore = checks.filter(c => c.passed).length;
  const strengthLabel = ['', 'Weak', 'Fair', 'Strong'][strengthScore];
  const strengthColor = ['', 'bg-red-400', 'bg-amber-400', 'bg-emerald-500'][strengthScore];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setIsLoading(true);
    setError(null);

    try {
      // 1. Set the password on the auth user
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;

      // 2. Get the current user to update their profile
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Session lost. Please try signing in again.');

      // 3. Upsert the profile row — marking password as set (step 1)
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(
          {
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || '',
            onboarding_step: 1,
            invite_status: 'accepted',
          },
          { onConflict: 'id' }
        );

      if (profileError) {
        console.error('Profile upsert error:', profileError);
        // Non-fatal — continue to onboarding even if profile update fails
      }

      // 4. Redirect to onboarding
      window.location.replace('/onboarding');
    } catch (err: any) {
      console.error('Set password error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col items-center justify-center p-6 text-[#141414] font-sans">
      {/* Top-left logo */}
      <div className="absolute top-6 left-6">
        <div className="p-2.5 bg-[#141414] text-[#E4E3E0] flex items-center justify-center rounded-sm">
          <Bot className="w-5 h-5" />
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="w-16 h-16 bg-emerald-500 text-white flex items-center justify-center rounded-2xl mx-auto mb-6 shadow-lg shadow-emerald-500/30"
          >
            <ShieldCheck className="w-8 h-8" />
          </motion.div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Welcome to Orlence{firstName !== 'there' && `, ${firstName}`}.
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed max-w-sm mx-auto">
            You're one step away from joining our Founding Businesses. Create your password to secure your account.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-sm font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Password field */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Create Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl pl-11 pr-11 py-3 text-sm focus:border-emerald-500 focus:outline-none bg-slate-50 focus:bg-white transition-colors"
                    placeholder="Choose a strong password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Strength bar */}
                {password.length > 0 && (
                  <div className="mt-3">
                    <div className="flex gap-1.5 mb-1.5">
                      {[0, 1, 2].map(i => (
                        <div
                          key={i}
                          className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                            i < strengthScore ? strengthColor : 'bg-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-slate-400 font-medium">
                      Password strength: <span className="font-bold text-slate-600">{strengthLabel}</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm password field */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className={`w-full border rounded-xl pl-11 pr-11 py-3 text-sm focus:outline-none bg-slate-50 focus:bg-white transition-colors ${
                      confirmPassword.length > 0
                        ? passwordsMatch
                          ? 'border-emerald-400 focus:border-emerald-500'
                          : 'border-red-300 focus:border-red-400'
                        : 'border-slate-200 focus:border-emerald-500'
                    }`}
                    placeholder="Repeat your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(v => !v)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Password checks */}
              <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                {checks.map((check, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <CheckCircle2
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        check.passed ? 'text-emerald-500' : 'text-slate-300'
                      }`}
                    />
                    <span
                      className={`text-xs font-medium transition-colors ${
                        check.passed ? 'text-slate-700' : 'text-slate-400'
                      }`}
                    >
                      {check.label}
                    </span>
                  </div>
                ))}
              </div>

              <button
                type="submit"
                disabled={!isValid || isLoading}
                className="w-full bg-[#141414] hover:bg-emerald-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Create Account & Continue <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="bg-slate-50 border-t border-slate-100 p-5 text-center">
            <p className="text-xs text-slate-400">
              Already have an account?{' '}
              <a href="/login" className="font-bold text-[#141414] hover:text-emerald-600 transition-colors">
                Sign in here
              </a>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

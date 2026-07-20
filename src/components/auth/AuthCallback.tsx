import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Bot, Loader2, AlertCircle } from 'lucide-react';

/**
 * AuthCallback — handles Supabase invite/magic-link redirects.
 *
 * Supabase appends the auth tokens as URL hash fragments, e.g.:
 *   /auth/callback#access_token=xxx&type=invite
 *
 * This page exchanges the fragment for a real session, reads the
 * user's onboarding_step from the profiles table, and redirects them
 * to the correct next screen.
 */
export default function AuthCallback() {
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('Verifying your invite…');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // 1. Exchange the URL hash token for a session.
        //    getSession() picks up the hash fragment automatically.
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        if (!session) {
          // Supabase v2: on PKCE or hash flows, the tokens might need
          // exchangeCodeForSession. Try that as a fallback.
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');

          if (accessToken && refreshToken) {
            const { error: setErr } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            if (setErr) throw setErr;
          } else {
            throw new Error('No valid session found in the invite link. The link may have expired.');
          }
        }

        // 2. Re-fetch the session now that tokens are consumed.
        const { data: { session: freshSession } } = await supabase.auth.getSession();
        if (!freshSession) {
          throw new Error('Could not establish a session. Please try again.');
        }

        const userId = freshSession.user.id;

        // 3. Read the user's onboarding state from the profiles table.
        setStatus('Loading your profile…');
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('onboarding_step, onboarding_complete')
          .eq('id', userId)
          .maybeSingle();

        // 4. Route based on state — not just "is logged in".
        if (profileError || !profile) {
          // Profile doesn't exist yet (race condition or first-ever sign-in).
          // Send to set-password which will create/update the profile.
          setStatus('Redirecting to account setup…');
          window.location.replace('/set-password');
          return;
        }

        const step = profile.onboarding_step ?? 0;

        if (step < 1) {
          // No password set yet
          setStatus('Redirecting to account setup…');
          window.location.replace('/set-password');
        } else if (step < 4) {
          // Password set but onboarding incomplete
          setStatus('Redirecting to onboarding…');
          window.location.replace('/onboarding');
        } else {
          // Fully onboarded
          setStatus('Taking you to your dashboard…');
          window.location.replace('/app');
        }
      } catch (err: any) {
        console.error('Auth callback error:', err);
        setError(err.message || 'An unexpected error occurred.');
      }
    };

    handleCallback();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-[#FDFDFD] flex flex-col items-center justify-center p-6 text-[#141414] font-sans">
        <div className="w-full max-w-md bg-white border border-red-200 rounded-2xl shadow-xl p-10 text-center">
          <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-7 h-7 text-red-500" />
          </div>
          <h1 className="text-xl font-bold mb-3 text-[#141414]">Link Expired or Invalid</h1>
          <p className="text-slate-500 text-sm leading-relaxed mb-8">{error}</p>
          <div className="space-y-3">
            <a
              href="/login"
              className="block w-full bg-[#141414] text-white py-3.5 rounded-xl font-bold text-sm hover:bg-emerald-600 transition-colors text-center"
            >
              Sign In Instead
            </a>
            <a
              href="mailto:hello@orlence.com"
              className="block w-full text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors text-center"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col items-center justify-center p-6 text-[#141414] font-sans">
      <div className="text-center">
        <div className="w-16 h-16 bg-[#141414] text-white flex items-center justify-center rounded-sm mx-auto mb-8">
          <Bot className="w-8 h-8" />
        </div>
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mx-auto mb-5" />
        <p className="text-slate-500 text-sm font-medium">{status}</p>
      </div>
    </div>
  );
}

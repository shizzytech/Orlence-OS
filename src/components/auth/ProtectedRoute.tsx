import React from 'react';
import { useAuth } from '../../context/AuthContext';
import LoginPage from './LoginPage';
import AdminLoginPage from './AdminLoginPage';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /**
   * When true, the route is restricted to super_admin only.
   * Unauthenticated visitors will see the AdminLoginPage (no signup).
   * Authenticated non-admins will see an Access Denied screen.
   */
  requireSuperAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireSuperAdmin = false }: ProtectedRouteProps) {
  const { user, role, loading, profile } = useAuth();

  // Show a loading spinner while the session is being resolved
  if (loading) {
    return (
      <div className="min-h-screen bg-[#141414] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
        <p className="text-slate-500 text-sm font-medium">Verifying session...</p>
      </div>
    );
  }

  // --- ADMIN-ONLY ROUTE ---
  if (requireSuperAdmin) {
    // Not logged in at all → show the admin-specific login (no signup)
    if (!user) {
      return <AdminLoginPage />;
    }
    // Logged in but not a super_admin → Access Denied
    if (role !== 'super_admin') {
      return (
        <div className="min-h-screen bg-[#E4E3E0] flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-white p-10 rounded-[2rem] shadow-2xl border border-[#141414]/10">
            <div className="w-16 h-16 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-3">Access Denied</h1>
            <p className="text-slate-500 text-sm leading-relaxed mb-8">
              Your account does not have admin privileges. Roles are assigned directly in Supabase by a Super Admin.
            </p>
            <a
              href="/"
              className="block bg-[#141414] text-white px-6 py-3 rounded-xl font-bold w-full text-center hover:bg-black transition-colors"
            >
              Return to Orlence
            </a>
          </div>
        </div>
      );
    }
    // Logged in and is super_admin → render the dashboard
    return <>{children}</>;
  }

  // --- REGULAR USER ROUTE ---
  if (!user) {
    return <LoginPage />;
  }

  const isCurrentViewOnboarding = window.location.pathname === '/onboarding';
  const isCurrentViewSetPassword = window.location.pathname === '/set-password';
  
  // Route by onboarding STATE, not just whether user is authenticated.
  // onboarding_step values: 0=invite sent, 1=password set, 2=profile done,
  //                         3=integrations done, 4=fully onboarded
  if (
    profile &&
    typeof profile.onboarding_step === 'number' &&
    profile.onboarding_step < 4 &&
    !isCurrentViewOnboarding &&
    !isCurrentViewSetPassword
  ) {
    // Step 0 or 1 → send back to set-password if they somehow got here
    if (profile.onboarding_step < 1) {
      window.location.replace('/set-password');
    } else {
      window.location.replace('/onboarding');
    }
    return null;
  }

  // Backward-compat: if profile exists but doesn't have onboarding_step yet,
  // fall back to the old onboarding_complete boolean
  if (
    profile &&
    profile.onboarding_step === undefined &&
    !profile.onboarding_complete &&
    !isCurrentViewOnboarding
  ) {
    window.location.replace('/onboarding');
    return null;
  }

  return <>{children}</>;
}


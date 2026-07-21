import { useState } from 'react';
import { 
  User, 
  ShieldCheck, 
  Building2, 
  Users, 
  Bell, 
  Layers, 
  Loader2, 
  KeyRound,
  CheckCircle2,
  LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWorkspace } from '../context/WorkspaceContext';
import { supabase } from '../lib/supabase';

const SECTIONS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'security', label: 'Security', icon: ShieldCheck },
  { id: 'business', label: 'Business Details', icon: Building2 },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'integrations', label: 'Integrations', icon: Layers },
  { id: 'notifications', label: 'Notifications', icon: Bell },
];

export default function Workspace() {
  const { user, profile, signOut } = useAuth();
  const { updateBusinessName } = useWorkspace();
  const [activeSection, setActiveSection] = useState('profile');

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Profile update state
  const [fullName, setFullName] = useState(profile?.full_name || user?.user_metadata?.full_name || '');
  const [businessName, setBusinessName] = useState(profile?.business_name || '');
  const [profileSaving, setProfileSaving] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ text: 'Passwords do not match.', type: 'error' });
      return;
    }
    if (newPassword.length < 8) {
      setMessage({ text: 'Password must be at least 8 characters long.', type: 'error' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      setMessage({ text: 'Password updated successfully!', type: 'success' });
      setNewPassword('');
      setConfirmPassword('');
      setCurrentPassword('');
    } catch (err: any) {
      setMessage({ text: err.message || 'Failed to update password.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setMessage(null);

    try {
      if (businessName) {
        await updateBusinessName(businessName);
      }
      if (user?.id) {
        await supabase.from('profiles').update({
          full_name: fullName,
          business_name: businessName
        }).eq('id', user.id);
      }
      setMessage({ text: 'Profile & Business details saved!', type: 'success' });
    } catch (err: any) {
      setMessage({ text: err.message || 'Failed to update profile.', type: 'error' });
    } finally {
      setProfileSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.href = '/login';
    } catch (err) {
      console.error('Failed to sign out:', err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in">
      
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-black mb-1">Workspace Control Hub</h1>
          <p className="text-slate-500">Manage security credentials, workspace configuration, and team permissions.</p>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors shadow-sm"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Subnav */}
        <div className="w-full lg:w-64 shrink-0 space-y-1">
          {SECTIONS.map(s => {
            const Icon = s.icon;
            const isActive = activeSection === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                  isActive 
                    ? 'bg-[#141414] text-white shadow-md' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" /> {s.label}
              </button>
            );
          })}
        </div>

        {/* Main Workspace Card */}
        <div className="flex-1 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          
          {message && (
            <div className={`mb-6 p-4 rounded-xl text-sm font-medium border flex items-center gap-2 ${
              message.type === 'success' 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                : 'bg-rose-50 border-rose-200 text-rose-700'
            }`}>
              <CheckCircle2 className="w-4 h-4 shrink-0" /> {message.text}
            </div>
          )}

          {/* PROFILE SECTION */}
          {activeSection === 'profile' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold mb-1">Founder Profile</h2>
                <p className="text-sm text-slate-500">Your account identity details within Orlence OS.</p>
              </div>

              <form onSubmit={handleProfileUpdate} className="max-w-md space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Business Name</label>
                  <input
                    type="text"
                    value={businessName}
                    placeholder="e.g. Sartorial Africa, Tolexy Restaurant"
                    onChange={e => setBusinessName(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none bg-slate-50"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">This updates your top header workspace brand name in real-time.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-slate-100 text-slate-500 cursor-not-allowed"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="submit"
                    disabled={profileSaving}
                    className="bg-[#141414] text-white font-bold px-6 py-3 rounded-xl hover:bg-emerald-600 transition-colors text-sm"
                  >
                    {profileSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Profile'}
                  </button>

                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex items-center gap-2 text-rose-600 hover:text-rose-700 font-bold text-xs px-3 py-2 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* SECURITY SECTION */}
          {activeSection === 'security' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold mb-1 flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-emerald-600" /> Security & Password
                </h2>
                <p className="text-sm text-slate-500">Update your account password to keep your business data secure.</p>
              </div>

              <form onSubmit={handlePasswordChange} className="max-w-md space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none bg-slate-50 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none bg-slate-50 focus:bg-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !newPassword}
                  className="bg-[#141414] hover:bg-emerald-600 text-white font-bold px-6 py-3 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2 text-sm"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Update Password
                </button>
              </form>
            </div>
          )}

          {/* BUSINESS / TEAM / NOTIFICATIONS PLACEHOLDERS */}
          {['business', 'team', 'integrations', 'notifications'].includes(activeSection) && (
            <div className="py-12 text-center">
              <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold capitalize">{activeSection} Controls</h3>
              <p className="text-slate-500 text-sm max-w-sm mx-auto mt-1">Configured during your guided onboarding. Active and managed by your Orlence OS workspace.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

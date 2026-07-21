import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { eventBus } from '../lib/eventBus';
import { useAuth } from '../context/AuthContext';
import { useLaunch } from '../context/LaunchContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { Users, TrendingUp, Search, Database, LogOut, Loader2, ArrowLeft, UserCheck, UserX, ShieldCheck, RefreshCw, Rocket, AlertTriangle, Clock, ArrowRight, CheckCircle2, Phone, Instagram } from 'lucide-react';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f43f5e', '#84cc16'];

export default function AdminDashboard() {
  const { user, signOut } = useAuth();
  const { settings, activeProgram, loading: launchLoading, updateSetting, updateProgram } = useLaunch();
  const [activeTab, setActiveTab] = useState<'analytics' | 'team' | 'launch'>('launch');
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [teamLoading, setTeamLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [approvedApp, setApprovedApp] = useState<{ email: string; name: string } | null>(null);
  const [showBusinessBreakdown, setShowBusinessBreakdown] = useState(false);
  const [noteInputs, setNoteInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchData();

    // Listen to EventBus from Orlence Core Sync Engine
    const unsubStatus = eventBus.on('founder.status_changed', () => fetchData());
    const unsubName = eventBus.on('workspace.business_name_changed', () => fetchTeam());

    return () => {
      unsubStatus();
      unsubName();
    };
  }, []);

  useEffect(() => {
    if (activeTab === 'team') fetchTeam();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('founder_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeam = async () => {
    setTeamLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setProfiles(data || []);
    } catch (err) {
      console.error('Error fetching profiles:', err);
    } finally {
      setTeamLoading(false);
    }
  };

  const setRole = async (userId: string, newRole: 'super_admin' | 'user') => {
    setUpdatingId(userId);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);
      if (error) throw error;
      setProfiles(prev => prev.map(p => p.id === userId ? { ...p, role: newRole } : p));
    } catch (err) {
      console.error('Error updating role:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleUpdateStatus = async (appId: string, newStatus: 'approved' | 'rejected' | 'waitlisted' | 'pending' | 'reviewing' | 'interview_booked' | 'onboarding' | 'active' | 'invite_sent') => {
    setUpdatingId(appId);
    try {
      // Find the application
      const targetApp = applications.find(a => a.id === appId);

      // 1. Update the status directly
      const { error: updateError } = await supabase
        .from('founder_applications')
        .update({ status: newStatus })
        .eq('id', appId);
      if (updateError) throw updateError;

      // 2. If approving, also create an org record
      if (newStatus === 'approved' && targetApp) {
        const { error: orgError } = await supabase
          .from('organizations')
          .insert([{ name: targetApp.business_name || targetApp.name, application_id: appId }]);
        // Log org creation error but don't block approval
        if (orgError) console.warn('Could not create org record:', orgError.message);

        // Show the reminder banner so admin knows to send the invite
        setApprovedApp({ email: targetApp.email, name: targetApp.name });
      }

      setApplications(prev => prev.map(app => app.id === appId ? { ...app, status: newStatus } : app));
    } catch (err: any) {
      console.error('Error updating status:', err);
      alert(`Failed to update status: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAddNote = async (appId: string) => {
    const text = noteInputs[appId]?.trim();
    if (!text) return;

    const targetApp = applications.find(a => a.id === appId);
    if (!targetApp) return;

    const newNote = {
      text,
      author: user?.user_metadata?.full_name || user?.email || 'Admin',
      created_at: new Date().toISOString()
    };

    const updatedNotes = [...(targetApp.admin_notes || []), newNote];

    try {
      const { error } = await supabase
        .from('founder_applications')
        .update({ admin_notes: updatedNotes })
        .eq('id', appId);

      if (error) throw error;
      
      setApplications(prev => prev.map(a => a.id === appId ? { ...a, admin_notes: updatedNotes } : a));
      setNoteInputs(prev => ({ ...prev, [appId]: '' }));
    } catch (err) {
      console.error('Error adding note:', err);
    }
  };

  // --- Data Processing ---

  // Funnel stats from live application data
  const funnelStats = {
    pending:          applications.filter(a => !a.status || a.status === 'pending').length,
    reviewing:        applications.filter(a => a.status === 'reviewing').length,
    interview_booked: applications.filter(a => a.status === 'interview_booked').length,
    approved:         applications.filter(a => a.status === 'approved').length,
    onboarding:       applications.filter(a => a.status === 'onboarding').length,
    active:           applications.filter(a => a.status === 'active').length,
    rejected:         applications.filter(a => a.status === 'rejected').length,
    waitlisted:       applications.filter(a => a.status === 'waitlisted').length,
    total:            applications.length,
  };

  // Today's interviews
  const today = new Date().toISOString().slice(0, 10);
  const todaysInterviews = applications.filter(a =>
    a.status === 'interview_booked' && a.interview_date?.slice(0, 10) === today
  ).length;

  // Business type breakdown (accepted only)
  const acceptedApps = applications.filter(a => a.status === 'approved' || a.status === 'onboarding' || a.status === 'active');
  const bizTypeCounts = acceptedApps.reduce<Record<string, number>>((acc, app) => {
    const t = (app.business_type as string) || 'Other';
    acc[t] = (acc[t] || 0) + 1;
    return acc;
  }, {});
  const businessTypeBreakdown: { name: string; count: number }[] = Object.entries(bizTypeCounts)
    .map(([name, count]) => ({ name, count: count as number }))
    .sort((a, b) => b.count - a.count);

  // Referral sources
  const referralSrc = applications.reduce<Record<string, number>>((acc, app) => {
    const s = (app.referral_source as string) || 'Unknown';
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});
  const totalReferrals = applications.length || 1;
  const referralBreakdown: { name: string; count: number; pct: number }[] = Object.entries(referralSrc)
    .map(([name, count]) => ({ name, count: count as number, pct: Math.round(((count as number) / totalReferrals) * 100) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
  
  // 1. Industries
  const industryCounts = applications.reduce((acc: any, app) => {
    const type = app.business_type || 'Unknown';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});
  const industryData = Object.keys(industryCounts).map(key => ({ name: key, count: industryCounts[key] })).sort((a, b) => b.count - a.count);

  // 2. Countries
  const countryCounts = applications.reduce((acc: any, app) => {
    const country = app.country || 'Unknown';
    acc[country] = (acc[country] || 0) + 1;
    return acc;
  }, {});
  const countryData = Object.keys(countryCounts).map(key => ({ name: key, value: countryCounts[key] }));

  // 3. Sizes
  const sizeCounts = applications.reduce((acc: any, app) => {
    const size = app.monthly_orders || 'Unknown';
    acc[size] = (acc[size] || 0) + 1;
    return acc;
  }, {});
  const sizeData = Object.keys(sizeCounts).map(key => ({ name: key, count: sizeCounts[key] }));

  // 4. Integrations
  const toolCounts: Record<string, number> = {};
  applications.forEach(app => {
    if (Array.isArray(app.current_tools)) {
      app.current_tools.forEach((tool: string) => {
        toolCounts[tool] = (toolCounts[tool] || 0) + 1;
      });
    }
  });
  const integrationsData = Object.keys(toolCounts).map(key => ({ name: key, count: toolCounts[key] })).sort((a, b) => b.count - a.count).slice(0, 8);

  // 5. AI Questions
  const recentQuestions = applications.filter(a => a.ai_question).slice(0, 10);

  // 6. Referral Sources
  const referralCounts = applications.reduce((acc: any, app) => {
    const source = app.referral_source || 'Unknown';
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {});
  const referralData = Object.keys(referralCounts).map(key => ({ name: key, count: referralCounts[key] })).sort((a, b) => b.count - a.count);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20">
      {/* Header */}
      <header className="bg-[#141414] text-white py-4 px-6 sm:px-10 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Database className="w-6 h-6 text-emerald-400" />
            <h1 className="text-xl font-bold tracking-tight hidden sm:block">Orlence Admin</h1>
          </div>
          {/* Tab Nav */}
          <nav className="flex items-center bg-white/5 rounded-lg p-1 gap-0.5">
            <button
              onClick={() => setActiveTab('launch')}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'launch' ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Rocket className="w-3.5 h-3.5" /> Launch Control
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'analytics' ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" /> Analytics
            </button>
            <button
              onClick={() => setActiveTab('team')}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'team' ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" /> Team & Roles
            </button>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 hidden sm:block truncate max-w-[180px]">{user?.email}</span>
          <button onClick={() => window.location.href = '/'} className="text-sm text-slate-400 hover:text-white flex items-center gap-2 hidden sm:flex">
            <ArrowLeft className="w-4 h-4" /> Live Site
          </button>
          <button onClick={() => { signOut(); window.location.href = '/'; }} className="text-sm bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded flex items-center gap-2 transition-colors">
            <LogOut className="w-4 h-4" /> Exit
          </button>
        </div>
      </header>

      {/* Invite Reminder Banner */}
      {approvedApp && (
        <div className="bg-emerald-600 text-white px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center shrink-0 mt-0.5">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-sm">{approvedApp.name} has been approved!</p>
              <p className="text-emerald-100 text-xs mt-0.5">
                Next step: Go to <strong>Supabase Dashboard &rarr; Authentication &rarr; Users &rarr; Invite User</strong> and enter <strong>{approvedApp.email}</strong> to send their custom invitation email.
              </p>
            </div>
          </div>
          <button
            onClick={() => setApprovedApp(null)}
            className="shrink-0 text-xs font-bold bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
          >
            Got it
          </button>
        </div>
      )}

      {loading || launchLoading ? (
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mb-4" />
          <p className="text-slate-500">Decrypting founder intelligence...</p>
        </div>
      ) : activeTab === 'launch' ? (
        <main className="max-w-6xl mx-auto px-6 sm:px-10 pt-10 pb-16 space-y-8">

          {/* ── HEADER ── */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Rocket className="w-6 h-6 text-emerald-600" />
                Launch Control Center
              </h2>
              <p className="text-slate-500 text-sm mt-1">Manage cohorts, waitlists, and the full application funnel.</p>
            </div>
            <button onClick={fetchData} className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>

          {/* ── ROW 1: Cohort + Platform ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Founding Cohort Card with clickable progress */}
            {activeProgram && (
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 pt-6 pb-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Founding Cohort</p>
                      <input
                        className="text-xl font-black mt-0.5 bg-transparent border-b border-transparent hover:border-slate-200 focus:border-emerald-500 focus:outline-none w-full transition-colors pb-0.5"
                        value={activeProgram.name}
                        onChange={(e) => updateProgram(activeProgram.id, { name: e.target.value })}
                        title="Edit program name"
                      />
                      <input
                        className="text-xs text-slate-500 bg-transparent border-b border-transparent hover:border-slate-200 focus:border-emerald-500 focus:outline-none w-full transition-colors pb-0.5"
                        value={activeProgram.cohort}
                        onChange={(e) => updateProgram(activeProgram.id, { cohort: e.target.value })}
                        title="Edit cohort label"
                      />
                    </div>
                    <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${activeProgram.status === 'accepting' ? 'bg-emerald-100 text-emerald-700' : activeProgram.status === 'closed' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                      {activeProgram.status}
                    </span>
                  </div>

                  {/* Big counter */}
                  <div className="flex items-end gap-3 mb-3">
                    <span className="text-5xl font-black leading-none">{activeProgram.accepted_members}</span>
                    <div className="mb-1">
                      <span className="text-xl text-slate-400 font-medium">/ {activeProgram.max_members}</span>
                      <p className="text-xs text-slate-400 font-medium">Founding Businesses</p>
                    </div>
                    <span className="ml-auto text-2xl font-black text-emerald-600 mb-1">
                      {activeProgram.max_members > 0 ? Math.round((activeProgram.accepted_members / activeProgram.max_members) * 100) : 0}%
                    </span>
                  </div>

                  {/* Clickable progress bar */}
                  <button
                    className="w-full group"
                    onClick={() => setShowBusinessBreakdown(v => !v)}
                    title="Click to see business breakdown"
                  >
                    <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden relative cursor-pointer">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${activeProgram.accepted_members >= activeProgram.max_members ? 'bg-rose-500' : 'bg-emerald-500'} group-hover:opacity-80`}
                        style={{ width: `${Math.min(100, (activeProgram.accepted_members / activeProgram.max_members) * 100)}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1.5 text-right">
                      {showBusinessBreakdown ? '▲ Hide breakdown' : '▼ Click to see business types'}
                    </p>
                  </button>

                  {/* Business type breakdown (animated) */}
                  {showBusinessBreakdown && (
                    <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Accepted by Business Type</p>
                      {businessTypeBreakdown.length > 0 ? businessTypeBreakdown.map(({ name, count }) => (
                        <div key={name} className="flex items-center gap-3">
                          <span className="text-sm font-medium text-slate-700 w-36 truncate">{name}</span>
                          <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                              style={{ width: `${Math.round((count / (acceptedApps.length || 1)) * 100)}%` }}
                            />
                          </div>
                          <span className="text-sm font-bold w-5 text-right">{count}</span>
                        </div>
                      )) : (
                        <p className="text-sm text-slate-400 italic">No accepted applications yet.</p>
                      )}
                    </div>
                  )}

                  {activeProgram.accepted_members >= activeProgram.max_members && (
                    <p className="text-xs text-rose-500 mt-3 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Cohort is full</p>
                  )}
                </div>

                {/* Inline edits */}
                <div className="border-t border-slate-100 grid grid-cols-3 divide-x divide-slate-100">
                  <div className="px-5 py-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Max Members</p>
                    <input type="number" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-bold focus:outline-none focus:border-emerald-500" value={activeProgram.max_members} onChange={(e) => updateProgram(activeProgram.id, { max_members: parseInt(e.target.value) || 0 })} />
                  </div>
                  <div className="px-5 py-3 flex flex-col justify-center">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Auto-Close</p>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={activeProgram.auto_close} onChange={(e) => updateProgram(activeProgram.id, { auto_close: e.target.checked })} />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                  </div>
                  <div className="px-5 py-3 flex flex-col justify-center">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Status</p>
                    <select className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-lg px-2 py-1.5 focus:outline-none focus:border-emerald-500" value={activeProgram.status} onChange={(e) => updateProgram(activeProgram.id, { status: e.target.value as any })}>
                      <option value="accepting">Accepting</option>
                      <option value="closed">Closed</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
                </div>

                {/* Pricing & Benefits */}
                <div className="border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pricing Plans</p>
                      <button 
                        onClick={() => updateProgram(activeProgram.id, { pricing_plans: [...(activeProgram.pricing_plans || []), { name: 'New Plan', price: '₦0/month' }] })}
                        className="text-[10px] font-bold text-emerald-600 hover:underline"
                      >+ Add Plan</button>
                    </div>
                    <div className="space-y-3">
                      {(activeProgram.pricing_plans || []).map((plan, i) => (
                        <div key={i} className="flex gap-2">
                          <input 
                            className="w-2/5 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-semibold focus:outline-none focus:border-emerald-500"
                            value={plan.name}
                            onChange={(e) => {
                              const newPlans = [...(activeProgram.pricing_plans || [])];
                              newPlans[i].name = e.target.value;
                              updateProgram(activeProgram.id, { pricing_plans: newPlans });
                            }}
                          />
                          <input 
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-semibold focus:outline-none focus:border-emerald-500"
                            value={plan.price}
                            onChange={(e) => {
                              const newPlans = [...(activeProgram.pricing_plans || [])];
                              newPlans[i].price = e.target.value;
                              updateProgram(activeProgram.id, { pricing_plans: newPlans });
                            }}
                          />
                          <button 
                            onClick={() => {
                              const newPlans = (activeProgram.pricing_plans || []).filter((_, idx) => idx !== i);
                              updateProgram(activeProgram.id, { pricing_plans: newPlans });
                            }}
                            className="text-slate-400 hover:text-rose-500 px-1 font-bold text-lg leading-none"
                          >×</button>
                        </div>
                      ))}
                      {(activeProgram.pricing_plans || []).length === 0 && (
                        <p className="text-xs text-slate-400 italic">No plans defined.</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Benefits</p>
                      <button 
                        onClick={() => updateProgram(activeProgram.id, { benefits: [...(activeProgram.benefits || []), 'New Benefit'] })}
                        className="text-[10px] font-bold text-emerald-600 hover:underline"
                      >+ Add Benefit</button>
                    </div>
                    <div className="space-y-2">
                      {(activeProgram.benefits || []).map((benefit, i) => (
                        <div key={i} className="flex gap-2 items-center">
                          <span className="text-emerald-500 text-xs font-bold">✓</span>
                          <input 
                            className="flex-1 bg-transparent border-b border-transparent hover:border-slate-200 focus:border-emerald-500 focus:outline-none text-xs font-medium text-slate-700 py-1"
                            value={benefit}
                            onChange={(e) => {
                              const newBens = [...(activeProgram.benefits || [])];
                              newBens[i] = e.target.value;
                              updateProgram(activeProgram.id, { benefits: newBens });
                            }}
                          />
                          <button 
                            onClick={() => {
                              const newBens = (activeProgram.benefits || []).filter((_, idx) => idx !== i);
                              updateProgram(activeProgram.id, { benefits: newBens });
                            }}
                            className="text-slate-400 hover:text-rose-500 px-1 font-bold text-lg leading-none"
                          >×</button>
                        </div>
                      ))}
                      {(activeProgram.benefits || []).length === 0 && (
                        <p className="text-xs text-slate-400 italic">No benefits defined.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Platform Toggles */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-5 py-5 space-y-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Platform Access</p>
              {[
                { key: 'waitlist_enabled', label: 'Public Waitlist', desc: 'Accept waitlist emails' },
                { key: 'invite_only', label: 'Invite Only', desc: 'Require invite to join' },
                { key: 'beta_open', label: 'Beta Open', desc: 'Open public signups' },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{label}</p>
                    <p className="text-xs text-slate-400">{desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={!!settings[key]} onChange={(e) => updateSetting(key, e.target.checked)} />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* ── ROW 2: Founder Analytics + Funnel ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Founder Analytics - Referral Sources */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 pt-6 pb-4 border-b border-slate-100">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Founder Analytics</p>
                <p className="text-base font-bold mt-0.5">Where are founders coming from?</p>
              </div>
              <div className="px-6 py-5 space-y-4">
                {referralBreakdown.length > 0 ? referralBreakdown.map(({ name, count, pct }, i) => {
                  const barColors = ['bg-emerald-500', 'bg-blue-500', 'bg-violet-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500'];
                  return (
                    <div key={name}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-semibold text-slate-800">{name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black">{pct}%</span>
                          <span className="text-xs text-slate-400">({count})</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${barColors[i % barColors.length]}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                }) : (
                  <p className="text-sm text-slate-400 italic py-4 text-center">No referral data yet. Add a <code className="text-xs bg-slate-100 px-1 rounded">referral_source</code> field to your application form.</p>
                )}
              </div>
            </div>

            {/* Founder Funnel */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 pt-6 pb-4 border-b border-slate-100">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Founder Funnel</p>
                <p className="text-base font-bold mt-0.5">Conversion from Apply → Active</p>
              </div>
              <div className="px-6 py-5">
                {(() => {
                  const funnelSteps = [
                    { label: 'Applications', value: funnelStats.total, color: 'bg-slate-800', textColor: 'text-slate-800' },
                    { label: 'Qualified', value: funnelStats.reviewing + funnelStats.interview_booked + funnelStats.approved + funnelStats.onboarding + funnelStats.active, color: 'bg-blue-500', textColor: 'text-blue-700' },
                    { label: 'Interviewed', value: funnelStats.interview_booked + funnelStats.approved + funnelStats.onboarding + funnelStats.active, color: 'bg-violet-500', textColor: 'text-violet-700' },
                    { label: 'Accepted', value: funnelStats.approved + funnelStats.onboarding + funnelStats.active, color: 'bg-emerald-500', textColor: 'text-emerald-700' },
                    { label: 'Activated', value: funnelStats.onboarding + funnelStats.active, color: 'bg-emerald-600', textColor: 'text-emerald-800' },
                    { label: 'Daily Active', value: funnelStats.active, color: 'bg-emerald-700', textColor: 'text-emerald-900' },
                  ];
                  const maxVal = funnelSteps[0].value || 1;
                  return (
                    <div className="space-y-3">
                      {funnelSteps.map((step, i) => {
                        const width = Math.max(8, Math.round((step.value / maxVal) * 100));
                        const convRate = i > 0 && funnelSteps[i - 1].value > 0
                          ? Math.round((step.value / funnelSteps[i - 1].value) * 100)
                          : null;
                        return (
                          <div key={step.label}>
                            <div className="flex items-center justify-between mb-1">
                              <span className={`text-sm font-semibold ${step.textColor}`}>{step.label}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-xl font-black">{step.value}</span>
                                {convRate !== null && (
                                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${convRate >= 50 ? 'bg-emerald-100 text-emerald-700' : convRate >= 25 ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                                    {convRate}%
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-700 ${step.color}`}
                                style={{ width: `${width}%` }}
                              />
                            </div>
                            {i < funnelSteps.length - 1 && (
                              <div className="flex justify-center mt-1">
                                <span className="text-slate-300 text-xs">↓</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* ── ROW 3: Application Pipeline ── */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 pt-5 pb-3 border-b border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Application Pipeline</p>
                <p className="text-base font-bold mt-0.5">Live funnel - {funnelStats.total} total</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Total', value: funnelStats.total, color: 'text-slate-900', bg: 'bg-slate-50 border-slate-200' },
                  { label: 'Accepted', value: funnelStats.approved, color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
                  { label: 'Rejected', value: funnelStats.rejected, color: 'text-rose-700', bg: 'bg-rose-50 border-rose-200' },
                ].map(s => (
                  <div key={s.label} className={`${s.bg} border rounded-xl px-4 py-2 text-center min-w-[72px]`}>
                    <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                    <p className="text-[10px] text-slate-500 font-medium">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 divide-x divide-slate-100">
              {[
                { label: 'Pending', value: funnelStats.pending, dot: 'bg-amber-400', sub: 'Awaiting review', action: true },
                { label: 'Reviewing', value: funnelStats.reviewing, dot: 'bg-blue-400', sub: 'Being evaluated', action: false },
                { label: 'Interviews', value: funnelStats.interview_booked, dot: 'bg-violet-400', sub: todaysInterviews > 0 ? `${todaysInterviews} today` : 'None today', action: false },
                { label: 'Invited', value: funnelStats.approved, dot: 'bg-emerald-500', sub: 'Approved', action: false },
                { label: 'Onboarding', value: funnelStats.onboarding, dot: 'bg-cyan-400', sub: 'Setting up', action: false },
                { label: 'Active', value: funnelStats.active, dot: 'bg-emerald-700', sub: 'Fully live', action: false },
                { label: 'Waiting', value: funnelStats.waitlisted, dot: 'bg-slate-300', sub: 'On waitlist', action: false },
              ].map(step => (
                <div key={step.label} className="px-4 py-5 flex flex-col items-center text-center">
                  <div className={`w-2.5 h-2.5 rounded-full ${step.dot} mb-2`}></div>
                  <p className="text-2xl font-black">{step.value}</p>
                  <p className="text-xs font-semibold text-slate-700 mt-0.5">{step.label}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{step.sub}</p>
                  {step.action && (
                    <button onClick={() => setActiveTab('analytics')} className="mt-2 text-[10px] font-bold text-emerald-600 flex items-center gap-0.5 hover:underline">
                      Review <ArrowRight className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

        </main>

      ) : activeTab === 'analytics' ? (
        <main className="max-w-7xl mx-auto px-6 sm:px-10 pt-10">
          
          {/* Top Level KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Total Founders</p>
                <p className="text-3xl font-bold">{applications.length}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Avg. Priority Score</p>
                <p className="text-3xl font-bold">
                  {applications.length > 0 ? Math.round(applications.reduce((sum, a) => sum + (a.priority_score || 0), 0) / applications.length) : 0}%
                </p>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Unique Integrations</p>
                <p className="text-3xl font-bold">{Object.keys(toolCounts).length}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                <Search className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Questions Captured</p>
                <p className="text-3xl font-bold">{applications.filter(a => a.ai_question).length}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Industry Chart */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-lg font-bold mb-6">Top Industries</h2>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={industryData} layout="vertical" margin={{ top: 0, right: 0, left: 20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                    <RechartsTooltip cursor={{ fill: '#f1f5f9' }} />
                    <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Integration Demand */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-lg font-bold mb-6">Most Requested Integrations</h2>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={integrationsData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <RechartsTooltip cursor={{ fill: '#f1f5f9' }} />
                    <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Country Breakdown */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-lg font-bold mb-6">Countries</h2>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={countryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {countryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-2 justify-center mt-4">
                {countryData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-1.5 text-xs text-slate-600">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                    {entry.name} ({entry.value})
                  </div>
                ))}
              </div>
            </div>

            {/* Referral Sources */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-lg font-bold mb-6">Referral Sources</h2>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={referralData} layout="vertical" margin={{ top: 0, right: 0, left: 20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 11 }} />
                    <RechartsTooltip cursor={{ fill: '#f1f5f9' }} />
                    <Bar dataKey="count" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Business Size */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2">
              <h2 className="text-lg font-bold mb-6">Business Size (Monthly Orders)</h2>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sizeData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <RechartsTooltip cursor={{ fill: '#f1f5f9' }} />
                    <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* AI Question Feed & Qualified Leads */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Live AI Question Feed (1/3 width) */}
            <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm self-start">
              <h2 className="text-lg font-bold mb-6 flex items-center justify-between">
                Live AI Question Feed
                <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-bold uppercase tracking-wider">Roadmap Ideas</span>
              </h2>
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {recentQuestions.map((app, i) => (
                  <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="font-medium text-slate-800 mb-2">"{app.ai_question}"</p>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>{app.business_name || 'A business'} • {app.business_type}</span>
                      <span className="font-bold text-emerald-600">{app.priority_score}% Score</span>
                    </div>
                  </div>
                ))}
                {recentQuestions.length === 0 && (
                  <p className="text-slate-500 text-center py-8">No AI questions captured yet.</p>
                )}
              </div>
            </div>

            {/* Top Qualified Founders (2/3 width) */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold">Top Qualified Founders</h2>
                <span className="text-xs font-bold bg-slate-100 text-slate-600 px-3 py-1 rounded-full">Sorted by Score</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-h-[800px] overflow-y-auto pr-2 pb-4">
                {[...applications].sort((a, b) => (b.priority_score || 0) - (a.priority_score || 0)).map((app, i) => {
                  const score = app.priority_score || 0;
                  const stars = Math.max(1, Math.min(5, Math.round(score / 20)));
                  
                  // Extract reasons
                  const reasons: string[] = [];
                  if (app.current_tools?.length) {
                    app.current_tools.forEach((t: string) => reasons.push(`Uses ${t}`));
                  }
                  if (app.monthly_orders) reasons.push(`${app.monthly_orders} Orders`);
                  if (app.referral_source) reasons.push(`From ${app.referral_source}`);
                  if (app.country) reasons.push(`Based in ${app.country}`);

                  return (
                    <div key={app.id || i} className="border border-slate-200 rounded-xl p-5 hover:border-emerald-300 transition-colors bg-slate-50/50 flex flex-col">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="font-black text-lg text-slate-900 leading-tight">{app.business_name || 'Unnamed Business'}</p>
                          <p className="text-xs font-semibold text-slate-500 mt-1">{app.business_type || 'Unknown Type'}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Score</p>
                          <p className="text-3xl font-black text-emerald-600 leading-none mt-0.5">{score}</p>
                          <p className="text-[10px] text-emerald-500 mt-1 tracking-widest">
                            {'★'.repeat(stars)}{'☆'.repeat(5 - stars)}
                          </p>
                        </div>
                      </div>

                      <div className="flex-1 mb-4">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Why</p>
                        <div className="space-y-1.5">
                          {reasons.slice(0, 4).map((r, ri) => (
                            <p key={ri} className="text-xs font-bold text-slate-700 flex items-center gap-2">
                              <span className="text-emerald-500 text-sm">✅</span> {r}
                            </p>
                          ))}
                          {reasons.length === 0 && (
                            <p className="text-xs italic text-slate-400">No specific signals captured.</p>
                          )}
                        </div>
                      </div>

                      <div className="border-t border-slate-200 pt-4 flex items-center justify-between">
                        <div className="overflow-hidden pr-2">
                          <p className="text-xs font-bold text-slate-900 truncate">{app.name || 'Unknown'}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5 truncate">{app.email}</p>
                          {(app.phone || app.instagram) && (
                            <div className="flex flex-col gap-1.5 text-[10px] text-slate-500 mt-2">
                              {app.phone && (
                                <span className="flex items-center gap-1.5">
                                  <Phone className="w-3 h-3 text-slate-400" /> {app.phone}
                                </span>
                              )}
                              {app.instagram && (
                                <span className="flex items-center gap-1.5">
                                  <Instagram className="w-3 h-3 text-slate-400" /> 
                                  {app.instagram.startsWith('@') ? app.instagram : `@${app.instagram}`}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <select
                            disabled={updatingId === app.id}
                            value={app.status || 'pending'}
                            onChange={(e) => handleUpdateStatus(app.id, e.target.value as any)}
                            className="text-[10px] font-bold border border-slate-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                          >
                            <option value="pending">Pending</option>
                            <option value="reviewing">Reviewing</option>
                            <option value="interview_booked">Interview Booked</option>
                            <option value="approved">Approved ✓</option>
                            <option value="invite_sent">Invite Sent ✉️</option>
                            <option value="onboarding">Onboarding 🚀</option>
                            <option value="active">Active Founder 🟢</option>
                            <option value="waitlisted">Waitlisted</option>
                            <option value="rejected">Rejected ✗</option>
                          </select>

                          {(app.status === 'approved' || app.status === 'invite_sent') && (
                            <button
                              onClick={() => {
                                const link = `${window.location.origin}/activate?token=${app.founder_token || app.id}&email=${encodeURIComponent(app.email || '')}`;
                                navigator.clipboard.writeText(link);
                                handleUpdateStatus(app.id, 'invite_sent');
                                alert(`Activation Link copied to clipboard!\n\n${link}`);
                              }}
                              className="text-[10px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1.5 rounded-lg flex items-center gap-1 shadow-sm shrink-0"
                            >
                              <span>✉️</span> {app.status === 'invite_sent' ? 'Resend Link' : 'Copy Invite Link'}
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="border-t border-slate-200 pt-3 mt-3 flex gap-2">
                        <input
                          type="text"
                          placeholder="Add note for founder..."
                          value={noteInputs[app.id] || ''}
                          onChange={(e) => setNoteInputs(prev => ({ ...prev, [app.id]: e.target.value }))}
                          className="flex-1 text-[10px] border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-emerald-500"
                          onKeyDown={(e) => e.key === 'Enter' && handleAddNote(app.id)}
                        />
                        <button
                          onClick={() => handleAddNote(app.id)}
                          disabled={!noteInputs[app.id]?.trim()}
                          className="text-[10px] bg-slate-900 text-white px-3 py-1.5 rounded-lg font-bold disabled:opacity-50"
                        >
                          Send
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </main>
      ) : activeTab === 'team' ? (
        /* ===== TEAM & ROLES TAB ===== */
        <main className="max-w-5xl mx-auto px-6 sm:px-10 pt-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold">Team & Role Management</h2>
              <p className="text-slate-500 text-sm mt-1">Grant or revoke <span className="font-semibold text-emerald-600">Super Admin</span> access directly from here. Changes take effect immediately.</p>
            </div>
            <button
              onClick={fetchTeam}
              className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-100 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${teamLoading ? 'animate-spin' : ''}`} /> Refresh
            </button>
          </div>

          {/* Info callout */}
          <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-3">
            <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800">How to add a new admin</p>
              <p className="text-sm text-amber-700 mt-0.5">
                Ask the user to sign up at <code className="bg-amber-100 px-1.5 py-0.5 rounded text-xs">/login</code> first. Their profile will appear below automatically. You can then grant them the Super Admin role from this table.
              </p>
            </div>
          </div>

          {teamLoading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Joined</th>
                    <th className="px-6 py-4 text-center">Role</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {profiles.map((profile) => {
                    const isCurrentUser = profile.id === user?.id;
                    const isSuperAdmin = profile.role === 'super_admin';
                    const isUpdating = updatingId === profile.id;
                    return (
                      <tr key={profile.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm shrink-0">
                              {(profile.full_name || profile.email || '?')[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">{profile.full_name || 'Unnamed User'}</p>
                              <p className="text-xs text-slate-500">{profile.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-500 text-xs">
                          {new Date(profile.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            isSuperAdmin
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {isSuperAdmin ? 'Super Admin' : 'User'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {isCurrentUser ? (
                            <span className="text-xs text-slate-400 italic">You</span>
                          ) : (
                            <button
                              disabled={isUpdating}
                              onClick={() => setRole(profile.id, isSuperAdmin ? 'user' : 'super_admin')}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 ${
                                isSuperAdmin
                                  ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200'
                                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                              }`}
                            >
                              {isUpdating ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : isSuperAdmin ? (
                                <><UserX className="w-3.5 h-3.5" /> Revoke Admin</>
                              ) : (
                                <><UserCheck className="w-3.5 h-3.5" /> Grant Admin</>
                              )}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {profiles.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                        No user profiles found. Ask users to sign up first.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </main>
      ) : null}
    </div>
  );
}

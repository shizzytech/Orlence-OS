import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { Users, TrendingUp, Search, Database, LogOut, Loader2, ArrowLeft, UserCheck, UserX, ShieldCheck, RefreshCw } from 'lucide-react';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f43f5e', '#84cc16'];

export default function AdminDashboard() {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'analytics' | 'team'>('analytics');
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [teamLoading, setTeamLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [approvedApp, setApprovedApp] = useState<{ email: string; name: string } | null>(null);

  useEffect(() => {
    fetchData();
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

  const handleUpdateStatus = async (appId: string, newStatus: 'approved' | 'rejected' | 'waitlisted' | 'pending') => {
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

  // --- Data Processing ---
  
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
  const integrationsData = Object.keys(toolCounts).map(key => ({ name: key, count: toolCounts[key] })).sort((a, b) => b.count - a.count).slice(0, 8); // Top 8

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

      {loading ? (
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mb-4" />
          <p className="text-slate-500">Decrypting founder intelligence...</p>
        </div>
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

          {/* AI Question Feed & Recent Signups */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-lg font-bold mb-6 flex items-center justify-between">
                Live AI Question Feed
                <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-medium">Roadmap Ideas</span>
              </h2>
              <div className="space-y-4">
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

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
              <h2 className="text-lg font-bold mb-6">Raw Lead Pipeline</h2>
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg">Business</th>
                    <th className="px-4 py-3">Contact Info</th>
                    <th className="px-4 py-3 text-center">Score</th>
                    <th className="px-4 py-3 text-right rounded-tr-lg">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.slice(0, 10).map((app, i) => (
                    <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-bold text-slate-900">{app.business_name || 'Unnamed'}</p>
                        <p className="text-xs text-slate-500">{app.business_type} • {app.country}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900">{app.name || 'Unknown'}</p>
                        <p className="text-xs text-slate-500">{app.email}</p>
                        {(app.phone || app.referral_source || app.instagram) && (
                          <div className="flex gap-3 text-[11px] text-slate-400 mt-0.5">
                            {app.phone && <span>📞 {app.phone}</span>}
                            {app.instagram && <span>@ {app.instagram}</span>}
                            {app.referral_source && <span>📍 {app.referral_source}</span>}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${app.priority_score > 75 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                          {app.priority_score}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {app.status === 'approved' && (
                          <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-block">
                            ✓ Approved
                          </span>
                        )}
                        {app.status === 'rejected' && (
                          <div className="flex justify-end gap-2">
                            <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 inline-block">
                              ✗ Rejected
                            </span>
                            <button
                              disabled={updatingId === app.id}
                              onClick={() => handleUpdateStatus(app.id, 'pending')}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 transition-all disabled:opacity-50"
                            >
                              Undo
                            </button>
                          </div>
                        )}
                        {app.status === 'waitlisted' && (
                          <div className="flex justify-end gap-2">
                            <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 inline-block">
                              Waitlisted
                            </span>
                            <button
                              disabled={updatingId === app.id}
                              onClick={() => handleUpdateStatus(app.id, 'approved')}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-all disabled:opacity-50"
                            >
                              Approve
                            </button>
                          </div>
                        )}
                        {(!app.status || app.status === 'pending') && (
                          <div className="flex justify-end gap-2">
                            <button
                              disabled={updatingId === app.id}
                              onClick={() => handleUpdateStatus(app.id, 'rejected')}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-all disabled:opacity-50"
                            >
                              Reject
                            </button>
                            <button
                              disabled={updatingId === app.id}
                              onClick={() => handleUpdateStatus(app.id, 'waitlisted')}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 transition-all disabled:opacity-50"
                            >
                              Waitlist
                            </button>
                            <button
                              disabled={updatingId === app.id}
                              onClick={() => handleUpdateStatus(app.id, 'approved')}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-all disabled:opacity-50 shadow-sm"
                            >
                              Approve
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </main>
      ) : (
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
      )}
    </div>
  );
}

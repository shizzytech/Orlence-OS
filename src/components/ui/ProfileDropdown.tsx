import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, LogOut, ChevronDown, Building2, Shield, Settings, Bell, Key, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWorkspace } from '../../context/WorkspaceContext';

interface Props {
  onNavigateToTab?: (tab: 'overview' | 'dashboard' | 'chat' | 'data' | 'integrations' | 'workspace') => void;
}

export default function ProfileDropdown({ onNavigateToTab }: Props) {
  const { user, profile, role, signOut } = useAuth();
  const { workspace } = useWorkspace();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Founder';
  const roleLabel = role === 'super_admin' ? 'Super Admin' : 'Founder';

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setIsOpen(false);
    await signOut();
    window.location.href = '/login';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(v => !v)}
        className="flex items-center gap-2.5 p-1.5 pl-3 pr-2 bg-white border border-[#141414] hover:bg-slate-50 transition-colors cursor-pointer text-xs font-bold"
      >
        <div className="w-6 h-6 bg-[#141414] text-white flex items-center justify-center font-bold rounded-sm text-[11px]">
          {displayName[0]?.toUpperCase()}
        </div>
        <div className="text-left hidden sm:block">
          <p className="leading-none text-[#141414] font-bold">{displayName}</p>
          <p className="text-[9px] text-slate-500 font-normal uppercase tracking-wider mt-0.5">{roleLabel}</p>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Menu Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 overflow-hidden font-sans text-xs text-[#141414]"
          >
            {/* User Identity Banner */}
            <div className="p-4 bg-slate-50 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#141414] text-emerald-400 font-bold rounded-xl flex items-center justify-center text-sm shadow-sm">
                  {displayName[0]?.toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-sm text-slate-900 truncate">{displayName}</p>
                  <p className="text-slate-400 text-[11px] truncate">{user?.email || 'Active User'}</p>
                </div>
              </div>

              {/* Active Workspace Info */}
              <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Workspace:</span>
                <span className="font-bold text-slate-700 truncate max-w-[140px]">{workspace.businessName}</span>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="p-1.5 space-y-0.5">
              <button
                onClick={() => {
                  setIsOpen(false);
                  onNavigateToTab?.('workspace');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium hover:bg-slate-100 text-slate-700 transition-colors text-left"
              >
                <Settings className="w-4 h-4 text-slate-400" /> Workspace Hub
              </button>

              <button
                onClick={() => {
                  setIsOpen(false);
                  onNavigateToTab?.('workspace');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium hover:bg-slate-100 text-slate-700 transition-colors text-left"
              >
                <Shield className="w-4 h-4 text-slate-400" /> Profile & Security
              </button>

              <button
                onClick={() => {
                  setIsOpen(false);
                  onNavigateToTab?.('integrations');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium hover:bg-slate-100 text-slate-700 transition-colors text-left"
              >
                <Key className="w-4 h-4 text-slate-400" /> Integrations & Keys
              </button>

              {role === 'super_admin' && (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    window.location.href = '/admin';
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-bold text-emerald-600 hover:bg-emerald-50 transition-colors text-left"
                >
                  <Sparkles className="w-4 h-4 text-emerald-600" /> Admin Command Center
                </button>
              )}
            </div>

            {/* Sign Out Action */}
            <div className="p-1.5 border-t border-slate-100 bg-slate-50/50">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-bold text-rose-600 hover:bg-rose-50 transition-colors text-left"
              >
                <LogOut className="w-4 h-4 text-rose-500" /> Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

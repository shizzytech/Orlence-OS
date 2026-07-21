import React from 'react';
import { RefreshCw, Radio } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

export default function PresenceIndicator() {
  const { connectionStatus, lastSynced, refetchWorkspace } = useWorkspace();

  if (connectionStatus === 'syncing') {
    return (
      <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-400 text-[10px] font-mono uppercase tracking-wider">
        <RefreshCw className="w-3 h-3 animate-spin shrink-0" />
        <span>Syncing...</span>
      </div>
    );
  }

  if (connectionStatus === 'offline') {
    return (
      <button 
        onClick={refetchWorkspace}
        className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 border border-slate-700 rounded-full text-slate-400 hover:text-white text-[10px] font-mono uppercase tracking-wider transition-colors"
        title="Realtime subscription offline. Click to reconnect."
      >
        <span className="w-2 h-2 rounded-full bg-slate-500" />
        <span>Offline · Reconnect</span>
      </button>
    );
  }

  return (
    <div 
      className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-400 text-[10px] font-mono uppercase tracking-wider"
      title={`Realtime subscription active. Last synced at ${lastSynced}`}
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
      </span>
      <span className="font-bold">Live</span>
    </div>
  );
}

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { SAMPLES } from '../data/samples';
import { BusinessData, Integration } from '../types';
import { eventBus, BusinessEvent } from '../lib/eventBus';

export type ConnectionStatus = 'live' | 'syncing' | 'offline';

export interface MemoryHealth {
  orders: number;
  customers: number;
  inventory: number;
  marketing: number;
  finance: number;
  overall: number;
}

export interface WorkspaceProfile {
  businessName: string;
  currency: string;
  timezone: string;
  industry: string;
  country: string;
  logoUrl?: string;
}

interface WorkspaceContextType {
  workspace: WorkspaceProfile;
  businessData: BusinessData;
  integrations: Integration[];
  connectionStatus: ConnectionStatus;
  lastSynced: string;
  biScore: number;
  memoryHealth: MemoryHealth;
  notifications: BusinessEvent[];
  unreadCount: number;
  updateBusinessName: (newName: string) => Promise<void>;
  markNotificationsAsRead: () => void;
  clearNotifications: () => void;
  refetchWorkspace: () => Promise<void>;
}

const DEFAULT_WORKSPACE: WorkspaceProfile = {
  businessName: 'Sartorial Africa',
  currency: '₦',
  timezone: 'WAT (UTC+1)',
  industry: 'Fashion & Retail',
  country: 'Nigeria'
};

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [workspace, setWorkspace] = useState<WorkspaceProfile>(DEFAULT_WORKSPACE);
  const [businessData, setBusinessData] = useState<BusinessData>(SAMPLES.sartorial_africa);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('live');
  const [lastSynced, setLastSynced] = useState<string>('Just now');
  const [notifications, setNotifications] = useState<BusinessEvent[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  // Compute live Business Intelligence Score (0-100)
  const biScore = React.useMemo(() => {
    let score = 50;
    if (businessData.products.length > 0) score += 15;
    if (businessData.orders.length > 5) score += 15;
    if (businessData.customers.length > 3) score += 10;
    const lowStock = businessData.products.filter(p => p.stock <= 5).length;
    if (lowStock > 0) score -= 5;
    return Math.min(Math.max(score, 20), 98);
  }, [businessData]);

  // Compute live Memory Health breakdown
  const memoryHealth: MemoryHealth = React.useMemo(() => {
    const ordersScore = businessData.orders.length > 0 ? 100 : 40;
    const customersScore = businessData.customers.length > 0 ? 92 : 30;
    const inventoryScore = businessData.products.length > 0 ? 98 : 50;
    const marketingScore = 74;
    const financeScore = 100;
    const overall = Math.round((ordersScore + customersScore + inventoryScore + marketingScore + financeScore) / 5);

    return {
      orders: ordersScore,
      customers: customersScore,
      inventory: inventoryScore,
      marketing: marketingScore,
      finance: financeScore,
      overall
    };
  }, [businessData]);

  // Listen to EventBus wildcard events to accumulate Notification Center items
  useEffect(() => {
    const unsubscribe = eventBus.on('*', (evt) => {
      setNotifications(prev => [evt, ...prev].slice(0, 50));
      setUnreadCount(prev => prev + 1);
      setLastSynced(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    });

    return () => unsubscribe();
  }, []);

  // Initial Workspace Fetch & Single Realtime Synchronization Channel
  const refetchWorkspace = async () => {
    setConnectionStatus('syncing');
    try {
      // 1. Fetch user session and profile
      const { data: { session } } = await supabase.auth.getSession();
      let foundName = '';

      if (session?.user?.id) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('business_name, full_name')
          .eq('id', session.user.id)
          .maybeSingle();

        if (profile?.business_name) {
          foundName = profile.business_name;
        }
      }

      // 2. Check local application context fallback
      if (!foundName) {
        const localAppRaw = localStorage.getItem('orlence_active_application') || localStorage.getItem('orlence_founder_app');
        if (localAppRaw) {
          try {
            const parsed = JSON.parse(localAppRaw);
            if (parsed?.business_name) foundName = parsed.business_name;
          } catch {}
        }
      }

      if (foundName) {
        setWorkspace(prev => ({ ...prev, businessName: foundName }));
        setBusinessData(prev => ({ ...prev, businessName: foundName }));
      }

      setConnectionStatus('live');
    } catch (err) {
      console.error('Error fetching workspace state:', err);
      setConnectionStatus('offline');
    }
  };

  useEffect(() => {
    refetchWorkspace();

    // ─── SINGLE CENTRAL REALTIME SYNCHRONIZATION ENGINE ─────────────────────
    const channel = supabase
      .channel('orlence-core-sync-engine')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, (payload) => {
        setConnectionStatus('syncing');
        if (payload.new && (payload.new as any).business_name) {
          const newName = (payload.new as any).business_name;
          setWorkspace(prev => ({ ...prev, businessName: newName }));
          setBusinessData(prev => ({ ...prev, businessName: newName }));
          eventBus.emit('workspace.business_name_changed', 'Workspace Brand Updated', `Business name changed to ${newName}`, 'success', payload.new);
        }
        setTimeout(() => setConnectionStatus('live'), 400);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'founder_applications' }, (payload) => {
        setConnectionStatus('syncing');
        const app = payload.new as any;
        if (app?.status) {
          eventBus.emit('founder.status_changed', 'Founder Lifecycle Updated', `Application status changed to ${app.status.toUpperCase()}`, 'info', app);
        }
        setTimeout(() => setConnectionStatus('live'), 400);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'founding_programs' }, (payload) => {
        setConnectionStatus('syncing');
        setTimeout(() => setConnectionStatus('live'), 400);
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setConnectionStatus('live');
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          setConnectionStatus('offline');
        }
      });

    // Listen to local window storage events
    const handleStorage = () => refetchWorkspace();
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('storage', handleStorage);
      supabase.removeChannel(channel);
    };
  }, []);

  const updateBusinessName = async (newName: string) => {
    setWorkspace(prev => ({ ...prev, businessName: newName }));
    setBusinessData(prev => ({ ...prev, businessName: newName }));
    eventBus.emit('workspace.business_name_changed', 'Workspace Renamed', `Business name updated to ${newName}`, 'success');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        await supabase.from('profiles').update({ business_name: newName }).eq('id', session.user.id);
      }
    } catch (err) {
      console.error('Failed to update business name:', err);
    }
  };

  const markNotificationsAsRead = () => setUnreadCount(0);
  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const value = {
    workspace,
    businessData,
    integrations: [],
    connectionStatus,
    lastSynced,
    biScore,
    memoryHealth,
    notifications,
    unreadCount,
    updateBusinessName,
    markNotificationsAsRead,
    clearNotifications,
    refetchWorkspace
  };

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}

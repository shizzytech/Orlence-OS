import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

export interface PlatformSettings {
  waitlist_enabled: boolean;
  invite_only: boolean;
  beta_open: boolean;
  accepting_applications: boolean;
  [key: string]: string | boolean;
}

export interface PricingPlan {
  name: string;
  price: string;
}

export interface FoundingProgram {
  id: string;
  name: string;
  cohort: string;
  max_members: number;
  accepted_members: number;
  status: 'draft' | 'accepting' | 'closed' | 'active';
  founder_pricing?: string;
  pricing_plans: PricingPlan[];
  benefits: string[];
  auto_close: boolean;
  start_date?: string;
  end_date?: string;
}

interface LaunchContextType {
  settings: PlatformSettings;
  activeProgram: FoundingProgram | null;
  loading: boolean;
  refreshLaunchData: () => Promise<void>;
  updateSetting: (key: string, value: string | boolean) => Promise<void>;
  updateProgram: (id: string, updates: Partial<FoundingProgram>) => Promise<void>;
}

const defaultSettings: PlatformSettings = {
  waitlist_enabled: true,
  invite_only: true,
  beta_open: false,
  accepting_applications: true,
};

const defaultProgram: FoundingProgram = {
  id: 'fallback-id',
  name: 'Founding 50',
  cohort: '2026 Cohort',
  max_members: 50,
  accepted_members: 0,
  status: 'accepting',
  founder_pricing: '₦10,000',
  pricing_plans: [
    { name: 'Starter Plan', price: '₦7,500/month' },
    { name: 'Growth Plan', price: '₦15,000/month' },
    { name: 'Scale Plan', price: '₦30,000/month' }
  ],
  benefits: [
    'Lifetime pricing lock',
    'Priority support',
    'Early AI access',
    'Direct roadmap influence',
    'Founder badge'
  ],
  auto_close: true,
};

const LaunchContext = createContext<LaunchContextType | undefined>(undefined);

export function LaunchProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<PlatformSettings>(defaultSettings);
  const [activeProgram, setActiveProgram] = useState<FoundingProgram | null>(defaultProgram);
  const [loading, setLoading] = useState(true);

  const refreshLaunchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch platform settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('platform_settings')
        .select('*');

      if (!settingsError && settingsData) {
        const parsedSettings = { ...defaultSettings };
        settingsData.forEach((s) => {
          parsedSettings[s.setting_key] = s.setting_value === 'true' ? true : s.setting_value === 'false' ? false : s.setting_value;
        });
        setSettings(parsedSettings);
      }

      // 2. Fetch active founding program (get the latest one)
      const { data: programData, error: programError } = await supabase
        .from('founding_programs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!programError && programData) {
        // Also fetch actual accepted count to be super accurate if auto_close is on
        const { count, error: countError } = await supabase
          .from('founder_applications')
          .select('*', { count: 'exact', head: true })
          .in('status', ['approved', 'onboarding', 'active']);
          
        let actualAccepted = programData.accepted_members;
        if (!countError && count !== null) {
          actualAccepted = count;
        }

        const prog = { ...programData, accepted_members: actualAccepted };

        // Auto-close check
        if (prog.auto_close && prog.status === 'accepting' && prog.accepted_members >= prog.max_members) {
          prog.status = 'closed';
          // Fire-and-forget update to DB if we reached limit
          supabase.from('founding_programs').update({ status: 'closed' }).eq('id', prog.id).then();
        }
        
        setActiveProgram(prog);
      } else {
        // Fallback to fetch applications for default program if DB table isn't created yet
        const { count } = await supabase
          .from('founder_applications')
          .select('*', { count: 'exact', head: true })
          .in('status', ['approved', 'onboarding', 'active']);
        if (count !== null) {
           setActiveProgram({ ...defaultProgram, accepted_members: count });
        }
      }
    } catch (err) {
      console.error('Error fetching launch data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshLaunchData();
  }, []);

  const updateSetting = async (key: string, value: string | boolean) => {
    try {
      const { error } = await supabase
        .from('platform_settings')
        .update({ setting_value: String(value) })
        .eq('setting_key', key);
      
      if (error) throw error;
      setSettings(prev => ({ ...prev, [key]: value }));
    } catch (err) {
      console.error('Failed to update setting', err);
      throw err;
    }
  };

  const updateProgram = async (id: string, updates: Partial<FoundingProgram>) => {
    try {
      const { error } = await supabase
        .from('founding_programs')
        .update(updates)
        .eq('id', id);
        
      if (error) throw error;
      setActiveProgram(prev => prev ? { ...prev, ...updates } : null);
    } catch (err) {
      console.error('Failed to update program', err);
      throw err;
    }
  };

  return (
    <LaunchContext.Provider value={{ settings, activeProgram, loading, refreshLaunchData, updateSetting, updateProgram }}>
      {children}
    </LaunchContext.Provider>
  );
}

export function useLaunch() {
  const context = useContext(LaunchContext);
  if (context === undefined) {
    throw new Error('useLaunch must be used within a LaunchProvider');
  }
  return context;
}

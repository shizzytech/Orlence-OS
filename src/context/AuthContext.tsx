import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: any | null;
  organization: any | null;
  role: string | null;
  loading: boolean;
  hasPermission: (permission: string) => boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [organization, setOrganization] = useState<any | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfileAndOrg(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchUserProfileAndOrg(session.user.id);
        } else {
          setProfile(null);
          setOrganization(null);
          setRole(null);
          setLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfileAndOrg = async (userId: string) => {
    try {
      // Fetch user profile (which contains the 'super_admin' flag or global role)
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (!profileError && profileData) {
        setProfile(profileData);
        // Note: this is a global role, usually 'user' or 'super_admin'
        setRole(profileData.role || 'user');
      }

      // Fetch organization if they belong to one
      const { data: orgMemberData, error: orgMemberError } = await supabase
        .from('organization_members')
        .select('*, organizations(*)')
        .eq('user_id', userId)
        .single();

      if (!orgMemberError && orgMemberData && orgMemberData.organizations) {
        setOrganization(orgMemberData.organizations);
        // If we implement org-level roles, we might override the global role here
        // setRole(orgMemberData.role);
      }
    } catch (error) {
      console.error('Error fetching user profile context:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (permission: string) => {
    // In a full RBAC system, we would map `role` to `permissions` array
    // For now, super_admin has everything
    if (role === 'super_admin') return true;
    return false; // Expand when granular permissions are added
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    profile,
    organization,
    role,
    loading,
    hasPermission,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

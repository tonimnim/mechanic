'use client'

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getUserProfile, syncUserFromSupabase } from '@/app/auth-actions';
import { getRedirectPath } from '@/lib/auth-utils';

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'admin' | 'mechanic' | 'breakdown' | 'shop' | 'client';
  isVerified: boolean;
  avatarUrl?: string | null;
  mechanicProfileId?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  setUser: (user: AuthUser | null) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  setUser: () => { },
  logout: () => { },
  refreshUser: async () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: string, session: any) => {
      if (session?.user) {
        // Fetch full profile from our DB
        let profile = await getUserProfile(session.user.id);

        if (!profile) {
          // User authenticated in Supabase but not in local DB
          // Sync from Supabase metadata
          console.log('Profile not found, syncing from Supabase metadata...');
          const metadata = session.user.user_metadata;
          const syncResult = await syncUserFromSupabase(session.user.id, {
            email: session.user.email,
            full_name: metadata?.full_name,
            phone: metadata?.phone,
            role: metadata?.role
          });
          if (syncResult.success && syncResult.user) {
            profile = syncResult.user;
            console.log('User synced successfully:', profile);
          }
        }

        if (profile) {
          // Only update state if user data has actually changed
          setUserState((current) => {
            if (JSON.stringify(current) !== JSON.stringify(profile)) {
              console.log('User data changed, updating state');
              return profile as AuthUser;
            }
            return current;
          });
        }
      } else {
        setUserState(null);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const setUser = (newUser: AuthUser | null) => {
    setUserState(newUser);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUserState(null);
    router.push('/login');
  };

  const refreshUser = async () => {
    if (!user) return;

    try {
      const profile = await getUserProfile(user.id);
      if (profile) {
        setUserState(profile as AuthUser);
      }
    } catch (error) {
      console.error('Error refreshing user profile:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, setUser, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

export function useRequireAuth(allowedRoles?: string[]) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login');
      } else if (allowedRoles && !allowedRoles.includes(user.role)) {
        const redirectPath = getRedirectPath(user.role);
        router.push(redirectPath);
      }
    }
  }, [user, isLoading, router, allowedRoles]);

  return { user, isLoading };
}

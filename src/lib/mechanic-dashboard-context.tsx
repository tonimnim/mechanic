'use client'

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import {
    getMechanicProfile,
    getMechanicStats,
    getVerificationStatus
} from '@/app/mechanic-actions';

type VerificationState = 'none' | 'pending' | 'approved' | 'rejected' | 'verified';

interface MechanicDashboardData {
    profile: any | null;
    stats: any | null;
    verificationState: VerificationState;
    verificationRequestId: string | null;
    lastFetched: number | null;
}

interface MechanicDashboardContextType {
    data: MechanicDashboardData;
    isLoading: boolean;
    fetchData: (userId: string, forceRefresh?: boolean) => Promise<void>;
    invalidateCache: () => void;
    updateProfile: (updater: (prev: any) => any) => void;
}

const CACHE_DURATION = 60 * 1000; // 1 minute cache

const initialData: MechanicDashboardData = {
    profile: null,
    stats: null,
    verificationState: 'none',
    verificationRequestId: null,
    lastFetched: null
};

const MechanicDashboardContext = createContext<MechanicDashboardContextType>({
    data: initialData,
    isLoading: true,
    fetchData: async () => { },
    invalidateCache: () => { },
    updateProfile: () => { }
});

export function MechanicDashboardProvider({ children }: { children: React.ReactNode }) {
    const [data, setData] = useState<MechanicDashboardData>(initialData);
    const [isLoading, setIsLoading] = useState(true);
    const fetchingRef = useRef(false);

    const fetchData = useCallback(async (userId: string, forceRefresh = false) => {
        // Check if we have fresh cached data
        const now = Date.now();
        if (!forceRefresh && data.lastFetched && (now - data.lastFetched) < CACHE_DURATION) {
            setIsLoading(false);
            return;
        }

        // Prevent duplicate fetches
        if (fetchingRef.current) return;
        fetchingRef.current = true;
        setIsLoading(true);

        try {
            const [profileRes, statsRes, verifyRes] = await Promise.all([
                getMechanicProfile(userId),
                getMechanicStats(userId),
                getVerificationStatus(userId)
            ]);

            let verificationState: VerificationState = 'none';
            let verificationRequestId: string | null = null;

            if (verifyRes.success) {
                if (verifyRes.isVerified) {
                    verificationState = 'verified';
                } else if (verifyRes.latestRequest) {
                    verificationState = verifyRes.latestRequest.status as VerificationState;
                    verificationRequestId = verifyRes.latestRequest.id;
                }
            }

            setData({
                profile: profileRes.success ? profileRes.profile : null,
                stats: statsRes.success ? statsRes.stats : null,
                verificationState,
                verificationRequestId,
                lastFetched: Date.now()
            });
        } catch (error) {
            console.error('Failed to fetch mechanic dashboard data:', error);
        } finally {
            setIsLoading(false);
            fetchingRef.current = false;
        }
    }, [data.lastFetched]);

    const invalidateCache = useCallback(() => {
        setData(prev => ({ ...prev, lastFetched: null }));
    }, []);

    const updateProfile = useCallback((updater: (prev: any) => any) => {
        setData(prev => ({ ...prev, profile: updater(prev.profile) }));
    }, []);

    return (
        <MechanicDashboardContext.Provider value={{
            data,
            isLoading,
            fetchData,
            invalidateCache,
            updateProfile
        }}>
            {children}
        </MechanicDashboardContext.Provider>
    );
}

export function useMechanicDashboard() {
    return useContext(MechanicDashboardContext);
}

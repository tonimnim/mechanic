'use client'

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import {
    getAdminDashboardStats,
    getPendingVerifications,
    getWeeklyContactStats,
    getWeeklySignupStats,
    getFinanceStats,
    getRecentPayments,
    DashboardStats,
    VerificationListItem,
    WeeklyContactData,
    WeeklySignupData,
    FinanceStats,
    PaymentRecord
} from '@/app/admin-actions';

interface AdminData {
    stats: DashboardStats | null;
    weeklyContacts: WeeklyContactData[];
    weeklySignups: WeeklySignupData[];
    pendingRequests: VerificationListItem[];
    financeStats: FinanceStats | null;
    recentPayments: PaymentRecord[];
    lastFetched: number | null;
}

interface AdminDataContextType {
    data: AdminData;
    isLoading: boolean;
    fetchData: (userId: string, forceRefresh?: boolean) => Promise<void>;
    invalidateCache: () => void;
    updatePendingRequests: (updater: (prev: VerificationListItem[]) => VerificationListItem[]) => void;
    updateStats: (updater: (prev: DashboardStats | null) => DashboardStats | null) => void;
}

const CACHE_DURATION = 60 * 1000; // 1 minute cache

const initialData: AdminData = {
    stats: null,
    weeklyContacts: [],
    weeklySignups: [],
    pendingRequests: [],
    financeStats: null,
    recentPayments: [],
    lastFetched: null
};

const AdminDataContext = createContext<AdminDataContextType>({
    data: initialData,
    isLoading: true,
    fetchData: async () => { },
    invalidateCache: () => { },
    updatePendingRequests: () => { },
    updateStats: () => { }
});

export function AdminDataProvider({ children }: { children: React.ReactNode }) {
    const [data, setData] = useState<AdminData>(initialData);
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
            const [statsResult, requestsResult, contactsResult, signupsResult, financeResult, paymentsResult] = await Promise.all([
                getAdminDashboardStats(userId),
                getPendingVerifications(userId),
                getWeeklyContactStats(userId),
                getWeeklySignupStats(userId),
                getFinanceStats(userId),
                getRecentPayments(userId)
            ]);

            setData({
                stats: statsResult.success ? statsResult.stats! : null,
                weeklyContacts: contactsResult.success ? contactsResult.data! : [],
                weeklySignups: signupsResult.success ? signupsResult.data! : [],
                pendingRequests: requestsResult.success ? requestsResult.requests! : [],
                financeStats: financeResult.success ? financeResult.stats! : null,
                recentPayments: paymentsResult.success ? paymentsResult.payments! : [],
                lastFetched: Date.now()
            });
        } catch (error) {
            console.error('Failed to fetch admin data:', error);
        } finally {
            setIsLoading(false);
            fetchingRef.current = false;
        }
    }, [data.lastFetched]);

    const invalidateCache = useCallback(() => {
        setData(prev => ({ ...prev, lastFetched: null }));
    }, []);

    const updatePendingRequests = useCallback((updater: (prev: VerificationListItem[]) => VerificationListItem[]) => {
        setData(prev => ({ ...prev, pendingRequests: updater(prev.pendingRequests) }));
    }, []);

    const updateStats = useCallback((updater: (prev: DashboardStats | null) => DashboardStats | null) => {
        setData(prev => ({ ...prev, stats: updater(prev.stats) }));
    }, []);

    return (
        <AdminDataContext.Provider value={{
            data,
            isLoading,
            fetchData,
            invalidateCache,
            updatePendingRequests,
            updateStats
        }}>
            {children}
        </AdminDataContext.Provider>
    );
}

export function useAdminData() {
    return useContext(AdminDataContext);
}

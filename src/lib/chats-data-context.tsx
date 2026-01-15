'use client'

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { getUserConversations, ConversationPreview } from '@/app/chat-actions';

interface ChatsData {
    conversations: ConversationPreview[];
    lastFetched: number | null;
}

interface ChatsDataContextType {
    data: ChatsData;
    isLoading: boolean;
    fetchConversations: (userId: string, forceRefresh?: boolean) => Promise<void>;
    invalidateCache: () => void;
}

const CACHE_DURATION = 30 * 1000; // 30 seconds cache (chats need fresher data)

const initialData: ChatsData = {
    conversations: [],
    lastFetched: null
};

const ChatsDataContext = createContext<ChatsDataContextType>({
    data: initialData,
    isLoading: true,
    fetchConversations: async () => { },
    invalidateCache: () => { }
});

export function ChatsDataProvider({ children }: { children: React.ReactNode }) {
    const [data, setData] = useState<ChatsData>(initialData);
    const [isLoading, setIsLoading] = useState(true);
    const fetchingRef = useRef(false);

    const fetchConversations = useCallback(async (userId: string, forceRefresh = false) => {
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
            const result = await getUserConversations(userId);
            if (result.success && result.conversations) {
                setData({
                    conversations: result.conversations,
                    lastFetched: Date.now()
                });
            }
        } catch (error) {
            console.error('Failed to fetch conversations:', error);
        } finally {
            setIsLoading(false);
            fetchingRef.current = false;
        }
    }, [data.lastFetched]);

    const invalidateCache = useCallback(() => {
        setData(prev => ({ ...prev, lastFetched: null }));
    }, []);

    return (
        <ChatsDataContext.Provider value={{
            data,
            isLoading,
            fetchConversations,
            invalidateCache
        }}>
            {children}
        </ChatsDataContext.Provider>
    );
}

export function useChatsData() {
    return useContext(ChatsDataContext);
}

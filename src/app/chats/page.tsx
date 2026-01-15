'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MessageCircle, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { getUserConversations, ConversationPreview } from '@/app/chat-actions';

// Generate consistent color from name
function getAvatarColor(name: string): string {
    const colors = [
        'bg-blue-600',
        'bg-emerald-600',
        'bg-violet-600',
        'bg-amber-600',
        'bg-rose-600',
        'bg-cyan-600',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
}

export default function ChatsPage() {
    const { user, isLoading: authLoading } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [conversations, setConversations] = useState<ConversationPreview[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadConversations() {
            if (user?.id) {
                const result = await getUserConversations(user.id);
                if (result.success && result.conversations) {
                    setConversations(result.conversations);
                }
                setIsLoading(false);
            }
        }

        if (!authLoading && user) {
            loadConversations();
        } else if (!authLoading) {
            setIsLoading(false);
        }
    }, [user, authLoading]);

    const filteredConversations = conversations.filter(conv =>
        conv.recipientName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // If auth is done loading and we have no user, show guest state
    if (!authLoading && !user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center max-w-sm">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MessageCircle className="w-8 h-8 text-blue-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Sign in to Chat</h2>
                    <p className="text-gray-500 mb-6">
                        You need to be signed in to view your conversations and message mechanics.
                    </p>
                    <Link href="/login">
                        <Button className="w-full bg-slate-900 hover:bg-slate-800">
                            Sign In
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    if (authLoading || isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 pb-24">
                <div className="bg-white border-b sticky top-0 z-10 px-4 py-3">
                    <div className="h-10 bg-gray-100 rounded animate-pulse" />
                </div>
                <div className="max-w-lg mx-auto p-4 space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white p-4 rounded-lg animate-pulse">
                            <div className="flex gap-3">
                                <div className="w-12 h-12 bg-gray-200 rounded-full" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                                    <div className="h-3 bg-gray-100 rounded w-2/3" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Search */}
            <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
                <div className="max-w-lg mx-auto px-4 py-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                            placeholder="Search conversations..."
                            className="pl-10 bg-gray-50 border-gray-200"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Conversations List */}
            <div className="max-w-lg mx-auto">
                {filteredConversations.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                        {filteredConversations.map((conv) => (
                            <Link
                                key={conv.id}
                                href={`/chats/${conv.id}`}
                                className="flex items-center gap-3 px-4 py-4 bg-white hover:bg-gray-50 transition-colors"
                            >
                                {/* Avatar */}
                                <div className="relative flex-shrink-0">
                                    {conv.recipientAvatarUrl ? (
                                        <img
                                            src={conv.recipientAvatarUrl}
                                            alt={conv.recipientName}
                                            className="w-12 h-12 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className={`w-12 h-12 rounded-full ${getAvatarColor(conv.recipientName)} flex items-center justify-center`}>
                                            <span className="text-white font-bold text-sm">{conv.recipientInitials}</span>
                                        </div>
                                    )}
                                    {conv.isOnline && (
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold text-gray-900 text-[15px]">{conv.recipientName}</h3>
                                        <span className="text-xs text-gray-400">{conv.lastMessageTime}</span>
                                    </div>
                                    <p className={`text-sm truncate mt-0.5 ${conv.unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                                        {conv.lastMessage || 'Start a conversation'}
                                    </p>
                                </div>

                                {/* Unread Badge */}
                                {conv.unreadCount > 0 && (
                                    <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                                        <span className="text-white text-xs font-bold">{conv.unreadCount}</span>
                                    </div>
                                )}
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 px-4">
                        <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                            <MessageCircle className="w-10 h-10 text-gray-300" />
                        </div>
                        <p className="text-gray-900 font-semibold text-lg">No conversations yet</p>
                        <p className="text-gray-500 text-sm mt-1">
                            {user?.role === 'mechanic' || user?.role === 'breakdown'
                                ? "When a driver contacts you, it will appear here"
                                : "When you message a mechanic, it will appear here"
                            }
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

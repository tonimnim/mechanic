'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Phone, MessageCircle, MapPin, Star, Loader2, Navigation } from 'lucide-react';
import type { MechanicResult } from '@/app/actions';
import { logContact } from '@/app/actions';
import { useAuth } from '@/lib/auth-context';
import { startConversation } from '@/app/chat-actions';
import { formatDistance } from '@/lib/geo-utils';

// Extended mechanic type that may include calculated distance
type MechanicWithDistance = MechanicResult & { distance?: number | null };

interface MechanicCardProps {
    mechanic: MechanicWithDistance;
}

// Generate consistent color from name
function getAvatarColor(name: string): string {
    const colors = [
        'bg-blue-600',
        'bg-emerald-600',
        'bg-violet-600',
        'bg-amber-600',
        'bg-rose-600',
        'bg-cyan-600',
        'bg-indigo-600',
        'bg-teal-600',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
}

// Get initials from name
function getInitials(name: string): string {
    return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

export function MechanicCard({ mechanic }: MechanicCardProps) {
    const router = useRouter();
    const { user } = useAuth();
    const [isStartingChat, setIsStartingChat] = useState(false);

    const isOnline = mechanic.availability === 'online';
    const initials = getInitials(mechanic.name);
    const avatarColor = getAvatarColor(mechanic.name);

    // Generate review count from rating (mock for now, will be real from DB later)
    const reviewCount = Math.floor(mechanic.rating * 25 + 10);

    const handleCardClick = () => {
        router.push(`/mechanic/${mechanic.visibleId}`);
    };

    const handleCall = async (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card click
        // Log the contact event
        if (mechanic.visibleId) {
            await logContact(mechanic.visibleId, 'call');
        }
        // Open phone dialer
        window.location.href = `tel:${mechanic.phone}`;
    };

    const handleChat = async (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card click

        if (!user) {
            // Redirect to login if not authenticated
            router.push('/login?redirect=' + encodeURIComponent(`/mechanic/${mechanic.visibleId}`));
            return;
        }

        setIsStartingChat(true);
        try {
            // Log the contact event
            if (mechanic.visibleId) {
                await logContact(mechanic.visibleId, 'chat');
            }

            // Start conversation
            // Mechanic ID for conversation is the userId
            const result = await startConversation(user.id, mechanic.id);

            if (result.success && result.conversationId) {
                router.push(`/chats/${result.conversationId}`);
            } else {
                alert('Failed to start chat. Please try again.');
            }
        } catch (error) {
            console.error('Failed to start chat:', error);
            alert('Failed to start chat. Please try again.');
        } finally {
            setIsStartingChat(false);
        }
    };

    return (
        <div
            onClick={handleCardClick}
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
        >
            {/* Top Section: Avatar + Info + Actions */}
            <div className="flex gap-3">
                {/* Avatar with Online Indicator */}
                <div className="relative flex-shrink-0">
                    <div className={`w-12 h-12 rounded-full ${avatarColor} flex items-center justify-center`}>
                        <span className="text-white font-bold text-sm">{initials}</span>
                    </div>
                    {/* Online/Offline Indicator */}
                    <div
                        className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${isOnline ? 'bg-green-500' : 'bg-gray-400'
                            }`}
                    />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    {/* Name + Verified */}
                    <div className="flex items-center gap-1">
                        <h3 className="font-semibold text-gray-900 text-[15px] truncate">{mechanic.name}</h3>
                        {mechanic.isVerified && (
                            <svg
                                className="w-4 h-4 flex-shrink-0"
                                viewBox="0 0 22 22"
                                aria-label="Verified"
                            >
                                <circle cx="11" cy="11" r="11" fill="#1D9BF0" />
                                <path
                                    d="M9.5 14.25L6.75 11.5L7.81 10.44L9.5 12.12L14.19 7.44L15.25 8.5L9.5 14.25Z"
                                    fill="white"
                                />
                            </svg>
                        )}
                    </div>

                    {/* Rating + Distance/Location */}
                    <div className="flex items-center gap-3 mt-0.5">
                        <div className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 text-amber-400" fill="currentColor" />
                            <span className="font-medium text-gray-900 text-xs">{mechanic.rating}</span>
                            <span className="text-gray-400 text-xs">({reviewCount})</span>
                        </div>
                        {mechanic.distance != null ? (
                            <div className="flex items-center gap-1 text-blue-600 text-xs font-medium">
                                <Navigation className="w-3 h-3" />
                                <span>{formatDistance(mechanic.distance)} away</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-1 text-gray-500 text-xs">
                                <MapPin className="w-3 h-3" />
                                <span>{mechanic.location}</span>
                            </div>
                        )}
                    </div>

                    {/* Specialties */}
                    <p className="text-gray-500 text-xs mt-1 truncate">{mechanic.subtitle}</p>
                </div>

                {/* Action Buttons - Compact */}
                <div className="flex gap-1.5 flex-shrink-0">
                    <button
                        onClick={handleCall}
                        className="w-10 h-10 flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-colors active:scale-95"
                        aria-label="Call"
                    >
                        <Phone size={18} />
                    </button>
                    <button
                        onClick={handleChat}
                        disabled={isStartingChat}
                        className="w-10 h-10 flex items-center justify-center bg-green-500 hover:bg-green-600 disabled:opacity-70 disabled:cursor-not-allowed text-white rounded-xl transition-colors active:scale-95"
                        aria-label="Chat"
                    >
                        {isStartingChat ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : (
                            <MessageCircle size={18} />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

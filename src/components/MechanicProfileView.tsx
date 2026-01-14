'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Phone, MessageCircle, MapPin, Clock, Banknote, Loader2 } from 'lucide-react';
import type { MechanicResult } from '@/app/actions';
import { logContact } from '@/app/actions';
import { useAuth } from '@/lib/auth-context';
import { startConversation } from '@/app/chat-actions';

interface MechanicProfileViewProps {
    mechanic: MechanicResult;
}

// Generate consistent color from name
function getAvatarColor(name: string): string {
    const colors = [
        'bg-orange-500',
        'bg-blue-600',
        'bg-emerald-600',
        'bg-violet-600',
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

export function MechanicProfileView({ mechanic }: MechanicProfileViewProps) {
    const router = useRouter();
    const { user } = useAuth();
    const [isStartingChat, setIsStartingChat] = useState(false);
    const initials = getInitials(mechanic.name);
    const avatarColor = getAvatarColor(mechanic.name);
    const isOnline = mechanic.availability === 'online';

    // Mock stats - will come from database
    const stats = {
        rating: mechanic.rating,
        jobs: Math.floor(mechanic.rating * 25 + 10),
        years: 3,
    };

    // Mock pricing - will come from database
    const pricing = {
        callOutFee: 500,
        hourlyRate: 800,
    };

    // Mock location data - will come from database  
    const locationData = {
        distance: '0.8 km away',
        estimatedArrival: '5-8 minutes',
        serviceArea: mechanic.location,
    };

    const handleCall = async () => {
        if (mechanic.visibleId) {
            await logContact(mechanic.visibleId, 'call');
        }
        window.location.href = `tel:${mechanic.phone}`;
    };

    const handleChat = async () => {
        if (!user?.id) {
            // If not logged in, redirect to login
            router.push('/login?redirect=' + encodeURIComponent(`/mechanic/${mechanic.visibleId}`));
            return;
        }

        if (!mechanic.visibleId) return;

        setIsStartingChat(true);
        try {
            // Start or get existing conversation with this mechanic
            const result = await startConversation(user.id, mechanic.visibleId);

            if (result.success && result.conversationId) {
                // Log the contact event
                await logContact(mechanic.visibleId, 'whatsapp'); // Using 'whatsapp' as contact type for now

                // Navigate to the chat
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
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Header */}
            <div className="bg-slate-900">
                <div className="max-w-lg mx-auto px-4 pt-4 pb-20">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.back()}
                            className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-white" />
                        </button>
                        <h1 className="font-semibold text-white">Mechanic Profile</h1>
                    </div>
                </div>
            </div>

            {/* Profile Card - Overlapping header */}
            <div className="max-w-lg mx-auto px-4 -mt-12">
                <div className="bg-white rounded-3xl shadow-lg p-6">
                    {/* Avatar */}
                    <div className="flex flex-col items-center -mt-16">
                        <div className={`w-24 h-24 rounded-full ${avatarColor} flex items-center justify-center border-4 border-white shadow-lg`}>
                            <span className="text-white font-bold text-3xl">{initials}</span>
                        </div>

                        {/* Name */}
                        <h2 className="mt-4 text-xl font-bold text-gray-900">{mechanic.name}</h2>

                        {/* Specialty */}
                        <p className="text-gray-500 mt-1">{mechanic.subtitle}</p>

                        {/* Stats Row */}
                        <div className="flex items-center justify-center gap-8 mt-6">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-slate-900">{stats.rating}</p>
                                <p className="text-xs text-gray-500">Rating</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-slate-900">{stats.jobs}</p>
                                <p className="text-xs text-gray-500">Jobs</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-slate-900">{stats.years}</p>
                                <p className="text-xs text-gray-500">Years</p>
                            </div>
                        </div>

                        {/* Availability Badge */}
                        <div className={`mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium ${isOnline
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                            }`}>
                            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                            {isOnline ? 'Available Now' : 'Currently Unavailable'}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 mt-6">
                        <button
                            onClick={handleCall}
                            className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors"
                        >
                            <Phone size={18} />
                            Call Now
                        </button>
                        <button
                            onClick={handleChat}
                            disabled={isStartingChat}
                            className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors"
                        >
                            {isStartingChat ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : (
                                <MessageCircle size={18} />
                            )}
                            {isStartingChat ? 'Starting...' : 'Chat'}
                        </button>
                    </div>
                </div>

                {/* Location & Distance Section */}
                <div className="mt-4 bg-amber-50 rounded-2xl p-4 border border-amber-100">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                        <MapPin className="w-5 h-5 text-amber-600" />
                        Location & Distance
                    </h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600 text-sm">Distance from You</span>
                            <span className="font-semibold text-gray-900">{locationData.distance}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600 text-sm">Estimated Arrival</span>
                            <span className="font-semibold text-gray-900">{locationData.estimatedArrival}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600 text-sm">Service Area</span>
                            <span className="font-semibold text-gray-900">{locationData.serviceArea}</span>
                        </div>
                    </div>
                </div>

                {/* Pricing & Response Section */}
                <div className="mt-4 bg-green-50 rounded-2xl p-4 border border-green-100">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                        <Banknote className="w-5 h-5 text-green-600" />
                        Pricing & Response
                    </h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600 text-sm">Call-out Fee</span>
                            <span className="font-semibold text-gray-900">KSh {pricing.callOutFee.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600 text-sm">Hourly Rate</span>
                            <span className="font-semibold text-gray-900">KSh {pricing.hourlyRate.toLocaleString()}/hour</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

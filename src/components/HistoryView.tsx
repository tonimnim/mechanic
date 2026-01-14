'use client';

import { History, Phone, MessageCircle, Calendar } from 'lucide-react';
import type { ContactHistoryItem } from '@/app/actions';

interface HistoryViewProps {
    history: ContactHistoryItem[];
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
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
}

// Format relative time
function formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-KE', {
        day: 'numeric',
        month: 'short',
    });
}

export function HistoryView({ history }: HistoryViewProps) {
    const handleCall = (phone: string) => {
        window.location.href = `tel:${phone}`;
    };

    const handleWhatsApp = (phone: string) => {
        const cleanPhone = phone.replace(/[^0-9]/g, '');
        window.open(`https://wa.me/${cleanPhone}`, '_blank');
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Header */}
            <div className="bg-slate-900">
                <div className="max-w-lg mx-auto px-4 py-5">
                    <h1 className="font-bold text-xl text-white">Contact History</h1>
                    <p className="text-gray-400 text-sm mt-1">Mechanics you've contacted</p>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-lg mx-auto px-4 pt-5">
                {history.length > 0 ? (
                    <div className="space-y-2">
                        {history.map((item) => (
                            <div
                                key={item.id}
                                className="bg-white rounded-xl p-3 shadow-sm border border-gray-100"
                            >
                                <div className="flex items-center gap-3">
                                    {/* Avatar */}
                                    <div className={`w-10 h-10 rounded-full ${getAvatarColor(item.mechanicName)} flex items-center justify-center flex-shrink-0`}>
                                        <span className="text-white font-semibold text-sm">{item.mechanicInitials}</span>
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-gray-900 text-sm truncate">{item.mechanicName}</h3>
                                            <span className={`flex items-center gap-1 text-xs px-1.5 py-0.5 rounded ${item.method === 'call'
                                                    ? 'bg-orange-100 text-orange-700'
                                                    : 'bg-green-100 text-green-700'
                                                }`}>
                                                {item.method === 'call' ? <Phone size={10} /> : <MessageCircle size={10} />}
                                                {item.method === 'call' ? 'Called' : 'WhatsApp'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-xs text-gray-500 truncate">{item.specialties}</span>
                                            <span className="text-xs text-gray-400">•</span>
                                            <span className="text-xs text-gray-400 flex items-center gap-1">
                                                <Calendar size={10} />
                                                {formatRelativeTime(item.createdAt)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Quick Actions */}
                                    <div className="flex gap-1.5 flex-shrink-0">
                                        <button
                                            onClick={() => handleCall(item.phone)}
                                            className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-orange-500 hover:text-white text-gray-600 rounded-lg transition-colors"
                                            aria-label="Call again"
                                        >
                                            <Phone size={14} />
                                        </button>
                                        <button
                                            onClick={() => handleWhatsApp(item.phone)}
                                            className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-green-500 hover:text-white text-gray-600 rounded-lg transition-colors"
                                            aria-label="WhatsApp again"
                                        >
                                            <MessageCircle size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                            <History className="w-10 h-10 text-gray-300" />
                        </div>
                        <p className="text-gray-900 font-semibold text-lg">No contacts yet</p>
                        <p className="text-gray-500 text-sm mt-1">
                            When you call or WhatsApp a mechanic,<br />it will appear here
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

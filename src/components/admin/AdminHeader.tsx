'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Bell, User, LogOut, Settings, ChevronDown } from 'lucide-react';

interface Notification {
    id: string;
    title: string;
    message: string;
    time: string;
    read: boolean;
}

interface AdminHeaderProps {
    pendingCount?: number;
}

export function AdminHeader({ pendingCount = 0 }: AdminHeaderProps) {
    const { user, logout } = useAuth();
    const [notifications] = useState<Notification[]>([
        // Mock notifications - in production, fetch from API
        ...(pendingCount > 0 ? [{
            id: '1',
            title: 'Pending Verifications',
            message: `${pendingCount} mechanic(s) waiting for approval`,
            time: 'Just now',
            read: false
        }] : [])
    ]);

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <header className="flex items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-800">
            <div className="text-sm text-slate-400">
                Welcome back, <span className="text-white font-medium">{user?.fullName || 'Admin'}</span>
            </div>
            <div className="flex items-center gap-2">
                {/* Notifications */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="relative text-slate-400 hover:text-white hover:bg-slate-800">
                            <Bell className="w-5 h-5" />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center">
                                    {unreadCount}
                                </span>
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80 bg-slate-900 border-slate-800">
                        <div className="px-3 py-2 border-b border-slate-800">
                            <p className="font-medium text-white text-sm">Notifications</p>
                        </div>
                        {notifications.length > 0 ? (
                            notifications.map(notif => (
                                <DropdownMenuItem key={notif.id} className="p-3 focus:bg-slate-800 cursor-pointer">
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-white">{notif.title}</p>
                                        <p className="text-xs text-slate-400 mt-0.5">{notif.message}</p>
                                        <p className="text-xs text-slate-500 mt-1">{notif.time}</p>
                                    </div>
                                    {!notif.read && (
                                        <span className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0"></span>
                                    )}
                                </DropdownMenuItem>
                            ))
                        ) : (
                            <div className="p-4 text-center text-slate-500 text-sm">
                                No notifications
                            </div>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Profile */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="flex items-center gap-2 text-slate-400 hover:text-white hover:bg-slate-800 px-2">
                            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white text-sm font-medium">
                                {user?.fullName?.charAt(0) || 'A'}
                            </div>
                            <span className="text-sm hidden sm:inline">{user?.fullName || 'Admin'}</span>
                            <ChevronDown className="w-4 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 bg-slate-900 border-slate-800">
                        <div className="px-3 py-2 border-b border-slate-800">
                            <p className="font-medium text-white text-sm">{user?.fullName}</p>
                            <p className="text-xs text-slate-500">{user?.email}</p>
                        </div>
                        <DropdownMenuItem className="text-slate-300 focus:bg-slate-800 focus:text-white cursor-pointer">
                            <User className="w-4 h-4 mr-2" />
                            Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-slate-300 focus:bg-slate-800 focus:text-white cursor-pointer">
                            <Settings className="w-4 h-4 mr-2" />
                            Settings
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-slate-800" />
                        <DropdownMenuItem
                            onClick={logout}
                            className="text-red-400 focus:bg-red-500/10 focus:text-red-400 cursor-pointer"
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}

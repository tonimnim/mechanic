'use client';

import { useAuth } from '@/lib/auth-context';
import {
    LayoutDashboard,
    Shield,
    Users,
    DollarSign,
    LogOut
} from 'lucide-react';

interface AdminSidebarProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
    pendingCount?: number;
}

export function AdminSidebar({ activeTab, onTabChange, pendingCount = 0 }: AdminSidebarProps) {
    const { logout } = useAuth();

    return (
        <aside className="fixed left-0 top-0 h-screen w-56 bg-slate-900 border-r border-slate-800 p-4 hidden lg:flex flex-col z-50">
            {/* Logo */}
            <div className="flex items-center gap-2 px-2 mb-8">
                <img src="/logo.jpg" alt="eGarage" className="w-8 h-8 rounded-lg object-cover" />
                <span className="font-semibold text-white">Admin</span>
            </div>

            {/* Navigation */}
            <nav className="space-y-1 flex-1">
                <NavItem
                    active={activeTab === 'overview'}
                    onClick={() => onTabChange('overview')}
                    icon={<LayoutDashboard className="w-4 h-4" />}
                    label="Overview"
                />
                <NavItem
                    active={activeTab === 'verifications'}
                    onClick={() => onTabChange('verifications')}
                    icon={<Shield className="w-4 h-4" />}
                    label="Verifications"
                    badge={pendingCount}
                />
                <NavItem
                    active={activeTab === 'mechanics'}
                    onClick={() => onTabChange('mechanics')}
                    icon={<Users className="w-4 h-4" />}
                    label="Mechanics"
                />
                <NavItem
                    active={activeTab === 'finances'}
                    onClick={() => onTabChange('finances')}
                    icon={<DollarSign className="w-4 h-4" />}
                    label="Finances"
                />
            </nav>

            {/* Logout */}
            <button
                onClick={logout}
                className="flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-red-400 transition-colors"
            >
                <LogOut className="w-4 h-4" />
                Logout
            </button>
        </aside>
    );
}

function NavItem({
    active,
    onClick,
    icon,
    label,
    badge
}: {
    active: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
    badge?: number;
}) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${active
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
        >
            {icon}
            <span className="flex-1 text-left">{label}</span>
            {badge !== undefined && badge > 0 && (
                <span className="w-5 h-5 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center">
                    {badge}
                </span>
            )}
        </button>
    );
}

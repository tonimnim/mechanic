'use client';

import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Clock, XCircle, Loader2 } from 'lucide-react';
import { getFinanceStats, FinanceStats } from '@/app/admin-actions';
import { useAuth } from '@/lib/auth-context';

export function FinancesPanel() {
    const { user } = useAuth();
    const [stats, setStats] = useState<FinanceStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadStats() {
            if (!user) return;

            setLoading(true);
            const result = await getFinanceStats(user.id);
            if (result.success && result.stats) {
                setStats(result.stats);
            }
            setLoading(false);
        }
        loadStats();
    }, [user]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="text-center text-slate-400 py-12">
                Failed to load finance data
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white">Financial Overview</h2>

            {/* Revenue Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Revenue"
                    value={`KSh ${stats.totalRevenue.toLocaleString()}`}
                    icon={<DollarSign className="w-5 h-5" />}
                    color="green"
                />
                <StatCard
                    title="This Month"
                    value={`KSh ${stats.monthlyRevenue.toLocaleString()}`}
                    icon={<TrendingUp className="w-5 h-5" />}
                    color="blue"
                />
                <StatCard
                    title="This Week"
                    value={`KSh ${stats.weeklyRevenue.toLocaleString()}`}
                    icon={<TrendingUp className="w-5 h-5" />}
                    color="purple"
                />
                <StatCard
                    title="Pending"
                    value={`KSh ${stats.pendingAmount.toLocaleString()}`}
                    icon={<Clock className="w-5 h-5" />}
                    color="yellow"
                />
            </div>

            {/* Payment Status */}
            <div className="bg-slate-800/50 rounded-xl p-6">
                <h3 className="text-lg font-medium text-white mb-4">Payment Status</h3>
                <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                        <div className="text-3xl font-bold text-green-400">{stats.completedPayments}</div>
                        <div className="text-sm text-slate-400">Completed</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-yellow-400">{stats.pendingPayments}</div>
                        <div className="text-sm text-slate-400">Pending</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-red-400">{stats.failedPayments}</div>
                        <div className="text-sm text-slate-400">Failed</div>
                    </div>
                </div>
            </div>

            {/* Weekly Chart */}
            <div className="bg-slate-800/50 rounded-xl p-6">
                <h3 className="text-lg font-medium text-white mb-4">Weekly Revenue</h3>
                <div className="flex items-end justify-between gap-2 h-40">
                    {stats.weeklyPayments.map((day, i) => {
                        const maxAmount = Math.max(...stats.weeklyPayments.map(d => d.amount), 1);
                        const heightPercent = (day.amount / maxAmount) * 100;

                        return (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                <div className="w-full flex flex-col items-center justify-end h-28">
                                    <div
                                        className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t"
                                        style={{ height: `${Math.max(heightPercent, 4)}%` }}
                                    />
                                </div>
                                <div className="text-xs text-slate-400">{day.day}</div>
                                <div className="text-xs text-slate-500">
                                    {day.amount > 0 ? `${day.amount}` : '-'}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Transaction Count Summary */}
            <div className="bg-slate-800/50 rounded-xl p-6">
                <h3 className="text-lg font-medium text-white mb-4">Weekly Transactions</h3>
                <div className="grid grid-cols-7 gap-2">
                    {stats.weeklyPayments.map((day, i) => (
                        <div key={i} className="text-center bg-slate-700/50 rounded-lg p-3">
                            <div className="text-lg font-bold text-white">{day.count}</div>
                            <div className="text-xs text-slate-400">{day.day}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function StatCard({
    title,
    value,
    icon,
    color
}: {
    title: string;
    value: string;
    icon: React.ReactNode;
    color: 'green' | 'blue' | 'purple' | 'yellow' | 'red';
}) {
    const colorClasses = {
        green: 'bg-green-500/10 text-green-400',
        blue: 'bg-blue-500/10 text-blue-400',
        purple: 'bg-purple-500/10 text-purple-400',
        yellow: 'bg-yellow-500/10 text-yellow-400',
        red: 'bg-red-500/10 text-red-400',
    };

    return (
        <div className="bg-slate-800/50 rounded-xl p-4">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
                    {icon}
                </div>
                <div>
                    <div className="text-sm text-slate-400">{title}</div>
                    <div className="text-lg font-semibold text-white">{value}</div>
                </div>
            </div>
        </div>
    );
}

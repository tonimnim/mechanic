'use client';

import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Clock, Loader2 } from 'lucide-react';
import { getFinanceStats, FinanceStats, getRecentPayments, PaymentRecord } from '@/app/admin-actions';
import { useAuth } from '@/lib/auth-context';

export function FinancesPanel() {
    const { user } = useAuth();
    const [stats, setStats] = useState<FinanceStats | null>(null);
    const [payments, setPayments] = useState<PaymentRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            if (!user) return;

            setLoading(true);
            const [statsResult, paymentsResult] = await Promise.all([
                getFinanceStats(user.id),
                getRecentPayments(user.id)
            ]);

            if (statsResult.success && statsResult.stats) {
                setStats(statsResult.stats);
            }
            if (paymentsResult.success && paymentsResult.payments) {
                setPayments(paymentsResult.payments);
            }
            setLoading(false);
        }
        loadData();
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
            {/* Revenue Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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

            {/* Payments Table */}
            <div className="bg-slate-800/50 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-700">
                    <h3 className="text-lg font-medium text-white">Recent Payments</h3>
                </div>

                {payments.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-900/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">User</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Phone</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Receipt</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                                {payments.map((payment) => (
                                    <tr key={payment.id} className="hover:bg-slate-700/30 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-white">{payment.userName}</div>
                                            <div className="text-xs text-slate-400">{payment.userEmail}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                                            {payment.phoneNumber}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                                            KSh {payment.amount.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <StatusBadge status={payment.status} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                                            {new Date(payment.createdAt).toLocaleDateString('en-KE', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                                            {payment.mpesaReceiptNumber || '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="px-6 py-12 text-center text-slate-400">
                        No payments yet
                    </div>
                )}
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
    color: 'green' | 'blue' | 'purple' | 'yellow';
}) {
    const colorClasses = {
        green: 'bg-green-500/10 text-green-400',
        blue: 'bg-blue-500/10 text-blue-400',
        purple: 'bg-purple-500/10 text-purple-400',
        yellow: 'bg-yellow-500/10 text-yellow-400',
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

function StatusBadge({ status }: { status: string }) {
    const styles = {
        completed: 'bg-green-500/10 text-green-400 border-green-500/20',
        pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
        failed: 'bg-red-500/10 text-red-400 border-red-500/20',
    };

    const style = styles[status as keyof typeof styles] || styles.pending;

    return (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${style}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
}

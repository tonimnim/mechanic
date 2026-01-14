'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { AdminSidebar } from '@/components/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { StatCard } from '@/components/admin/StatCard';
import { WeeklyChart } from '@/components/admin/WeeklyChart';
import MechanicsContent from '@/components/admin/MechanicsContent';
import {
    getAdminDashboardStats,
    getPendingVerifications,
    getWeeklyContactStats,
    getWeeklySignupStats,
    approveVerification,
    rejectVerification,
    DashboardStats,
    VerificationListItem,
    WeeklyContactData,
    WeeklySignupData
} from '@/app/admin-actions';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Users,
    Wrench,
    Shield,
    Clock,
    CheckCircle2,
    XCircle,
    FileText,
    Loader2,
    Search,
    ChevronRight,
    MessageSquare,
    UserPlus,
    Bell
} from 'lucide-react';

export default function AdminDashboard() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();

    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [weeklyContacts, setWeeklyContacts] = useState<WeeklyContactData[]>([]);
    const [weeklySignups, setWeeklySignups] = useState<WeeklySignupData[]>([]);
    const [pendingRequests, setPendingRequests] = useState<VerificationListItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [searchQuery, setSearchQuery] = useState('');

    const [processingId, setProcessingId] = useState<string | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [showRejectModal, setShowRejectModal] = useState<string | null>(null);

    useEffect(() => {
        async function loadData() {
            if (user?.id && user.role === 'admin') {
                const [statsResult, requestsResult, contactsResult, signupsResult] = await Promise.all([
                    getAdminDashboardStats(user.id),
                    getPendingVerifications(user.id),
                    getWeeklyContactStats(user.id),
                    getWeeklySignupStats(user.id)
                ]);

                if (statsResult.success) setStats(statsResult.stats!);
                if (requestsResult.success) setPendingRequests(requestsResult.requests!);
                if (contactsResult.success) setWeeklyContacts(contactsResult.data!);
                if (signupsResult.success) setWeeklySignups(signupsResult.data!);
            }
            setIsLoading(false);
        }

        if (!authLoading) {
            if (!user) {
                router.push('/login');
            } else if (user.role !== 'admin') {
                router.push('/');
            } else {
                loadData();
            }
        }
    }, [user, authLoading, router]);

    const handleApprove = async (requestId: string) => {
        if (!user?.id) return;
        setProcessingId(requestId);

        const result = await approveVerification(user.id, requestId);
        if (result.success) {
            setPendingRequests(prev => prev.filter(r => r.id !== requestId));
            if (stats) {
                setStats({
                    ...stats,
                    pendingVerifications: stats.pendingVerifications - 1,
                    verifiedCount: stats.verifiedCount + 1
                });
            }
        }
        setProcessingId(null);
    };

    const handleReject = async (requestId: string) => {
        if (!user?.id || !rejectReason.trim()) return;
        setProcessingId(requestId);

        const result = await rejectVerification(user.id, requestId, rejectReason);
        if (result.success) {
            setPendingRequests(prev => prev.filter(r => r.id !== requestId));
            if (stats) {
                setStats({
                    ...stats,
                    pendingVerifications: stats.pendingVerifications - 1
                });
            }
        }
        setProcessingId(null);
        setShowRejectModal(null);
        setRejectReason('');
    };

    if (isLoading || authLoading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
            </div>
        );
    }

    const filteredRequests = pendingRequests.filter(r =>
        r.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.city.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalMechanics = (stats?.totalMechanics || 0) + (stats?.totalBreakdown || 0);
    const totalWeeklyContacts = weeklyContacts.reduce((sum, d) => sum + d.contacts, 0);
    const totalWeeklySignups = weeklySignups.reduce((sum, d) => sum + d.mechanics + d.drivers, 0);

    return (
        <div className="min-h-screen bg-slate-950">
            <AdminSidebar
                activeTab={activeTab}
                onTabChange={setActiveTab}
                pendingCount={stats?.pendingVerifications}
            />

            <main className="lg:ml-56 min-h-screen p-6">
                <AdminHeader pendingCount={stats?.pendingVerifications} />

                {/* Page Title */}
                {activeTab !== 'mechanics' && (
                    <div className="mb-6">
                        <h1 className="text-xl font-semibold text-white">
                            {activeTab === 'overview' && 'Overview'}
                            {activeTab === 'verifications' && 'Verifications'}
                        </h1>
                    </div>
                )}

                {/* Overview Tab */}
                {activeTab === 'overview' && stats && (
                    <div className="space-y-6">
                        {/* Stats Row */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <StatCard title="Total Mechanics" value={totalMechanics} icon={<Wrench className="w-4 h-4" />} />
                            <StatCard title="Total Drivers" value={stats.totalClients} icon={<Users className="w-4 h-4" />} />
                            <StatCard title="Verified" value={stats.verifiedCount} icon={<Shield className="w-4 h-4" />} />
                            <StatCard title="Pending" value={stats.pendingVerifications} icon={<Clock className="w-4 h-4" />} highlight />
                        </div>

                        {/* Charts */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <WeeklyChart
                                title="Weekly Contacts"
                                icon={MessageSquare}
                                iconColor="text-orange-500"
                                total={totalWeeklyContacts}
                                data={weeklyContacts}
                                lines={[
                                    { dataKey: 'contacts', color: 'hsl(25, 95%, 53%)', label: 'Contacts' }
                                ]}
                            />
                            <WeeklyChart
                                title="Weekly Signups"
                                icon={UserPlus}
                                iconColor="text-green-500"
                                total={totalWeeklySignups}
                                data={weeklySignups}
                                lines={[
                                    { dataKey: 'mechanics', color: 'hsl(142, 76%, 36%)', label: 'Mechanics' },
                                    { dataKey: 'drivers', color: 'hsl(217, 91%, 60%)', label: 'Drivers' }
                                ]}
                                showLegend
                            />
                        </div>

                        {/* Pending Verifications */}
                        {pendingRequests.length > 0 && (
                            <Card className="bg-slate-900 border-slate-800 p-5">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-medium text-white">Pending Verifications</h3>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setActiveTab('verifications')}
                                        className="text-orange-500 hover:text-orange-400 hover:bg-transparent"
                                    >
                                        View All <ChevronRight className="w-4 h-4 ml-1" />
                                    </Button>
                                </div>
                                <div className="space-y-2">
                                    {pendingRequests.slice(0, 3).map(request => (
                                        <div key={request.id} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
                                            <div className="w-8 h-8 rounded-full bg-slate-700 text-slate-300 flex items-center justify-center text-sm font-medium">
                                                {request.userName.charAt(0)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-white text-sm">{request.userName}</p>
                                                <p className="text-xs text-slate-500">{request.city}</p>
                                            </div>
                                            <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">
                                                {request.serviceType}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        )}
                    </div>
                )}

                {/* Verifications Tab */}
                {activeTab === 'verifications' && (
                    <div className="space-y-4">
                        <div className="relative max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <Input
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 bg-slate-900 border-slate-800 text-white placeholder:text-slate-500"
                            />
                        </div>

                        {filteredRequests.length > 0 ? (
                            <div className="space-y-3">
                                {filteredRequests.map(request => (
                                    <Card key={request.id} className="bg-slate-900 border-slate-800 p-5">
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-medium">
                                                {request.userName.charAt(0)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-medium text-white">{request.userName}</h3>
                                                    <Badge variant="outline" className="text-xs border-slate-700 text-slate-400">
                                                        {request.serviceType}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-slate-500 mt-0.5">{request.userEmail}</p>
                                                <p className="text-sm text-slate-500">{request.userPhone} • {request.city}</p>

                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {request.specialties.split(',').slice(0, 4).map((s, i) => (
                                                        <Badge key={i} className="bg-slate-800 text-slate-300 text-xs font-normal">
                                                            {s.trim()}
                                                        </Badge>
                                                    ))}
                                                </div>

                                                <div className="flex gap-4 mt-3">
                                                    {request.nationalIdUrl && (
                                                        <span className="text-xs text-slate-500 flex items-center gap-1">
                                                            <FileText className="w-3 h-3" /> National ID
                                                        </span>
                                                    )}
                                                    {request.businessPermitUrl && (
                                                        <span className="text-xs text-slate-500 flex items-center gap-1">
                                                            <FileText className="w-3 h-3" /> Business Permit
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleApprove(request.id)}
                                                    disabled={processingId === request.id}
                                                    className="bg-green-600 hover:bg-green-700"
                                                >
                                                    {processingId === request.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <CheckCircle2 className="w-4 h-4" />
                                                    )}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => setShowRejectModal(request.id)}
                                                    className="border-slate-700 text-red-400 hover:bg-red-500/10 hover:text-red-400"
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        {showRejectModal === request.id && (
                                            <div className="mt-4 p-4 bg-slate-800/50 rounded-lg">
                                                <p className="text-sm text-slate-400 mb-2">Reason for rejection:</p>
                                                <Input
                                                    value={rejectReason}
                                                    onChange={(e) => setRejectReason(e.target.value)}
                                                    placeholder="e.g., ID photo is unclear"
                                                    className="mb-3 bg-slate-900 border-slate-700 text-white"
                                                />
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleReject(request.id)}
                                                        disabled={!rejectReason.trim()}
                                                        className="bg-red-600 hover:bg-red-700"
                                                    >
                                                        Reject
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => { setShowRejectModal(null); setRejectReason(''); }}
                                                        className="text-slate-400"
                                                    >
                                                        Cancel
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <Card className="bg-slate-900 border-slate-800 p-12 text-center">
                                <Shield className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                                <p className="font-medium text-white">No Pending Requests</p>
                                <p className="text-sm text-slate-500 mt-1">All verifications processed.</p>
                            </Card>
                        )}
                    </div>
                )}

                {/* Mechanics Tab */}
                {activeTab === 'mechanics' && user?.id && (
                    <MechanicsContent adminId={user.id} />
                )}
            </main>
        </div>
    );
}

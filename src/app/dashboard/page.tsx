'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useMechanicDashboard } from '@/lib/mechanic-dashboard-context';
import { updateMechanicAvailability } from '@/app/mechanic-actions';
import {
    Users,
    Star,
    MapPin,
    Calendar,
    Power,
    ShieldCheck,
    AlertTriangle,
    ChevronRight,
    Settings,
    CreditCard,
    Clock,
    XCircle,
    CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

type VerificationState = 'none' | 'pending' | 'approved' | 'rejected' | 'verified';

export default function MechanicDashboard() {
    const { user, isLoading: authLoading } = useAuth();
    const { data, isLoading, fetchData, updateProfile } = useMechanicDashboard();

    // Destructure cached data
    const { profile, stats, verificationState, verificationRequestId } = data;

    const [isToggling, setIsToggling] = useState(false);

    useEffect(() => {
        if (!authLoading && user) {
            fetchData(user.id);
        }
    }, [user, authLoading, fetchData]);

    const handleAvailabilityToggle = async () => {
        if (!profile) return;

        setIsToggling(true);
        const newStatus = profile.availability === 'online' ? 'offline' : 'online';

        try {
            const result = await updateMechanicAvailability(user!.id, newStatus);
            if (result.success) {
                updateProfile((prev: any) => ({ ...prev, availability: newStatus }));
            }
        } catch {
            // Handle error
        } finally {
            setIsToggling(false);
        }
    };

    if (authLoading || isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-12 w-12 bg-gray-200 rounded-full mb-4"></div>
                    <div className="h-4 w-32 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    if (!user || !profile) return null;

    const isOnline = profile.availability === 'online';

    // Render verification banner based on state
    const renderVerificationBanner = () => {
        switch (verificationState) {
            case 'verified':
                return (
                    <div className="bg-green-50 border border-green-100 rounded-2xl p-5 mb-6 flex items-start gap-4">
                        <div className="bg-green-100 p-2 rounded-lg shrink-0">
                            <CheckCircle2 className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-green-800 text-sm flex items-center gap-2">
                                Verified <Badge className="bg-green-600 text-white text-xs">Active</Badge>
                            </h3>
                            <p className="text-xs text-green-600 mt-1">
                                Your account is verified and visible in search results.
                            </p>
                        </div>
                    </div>
                );

            case 'approved':
                // Admin approved - needs payment
                return (
                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-6 flex items-start gap-4">
                        <div className="bg-blue-100 p-2 rounded-lg shrink-0">
                            <CreditCard className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-blue-800 text-sm">Documents Approved!</h3>
                            <p className="text-xs text-gray-600 mt-1 mb-3">
                                Complete payment (KSh 100/month) to activate your verified badge.
                            </p>
                            <Link href="/profile/verify">
                                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white h-8 text-xs">
                                    <CreditCard className="w-3 h-3 mr-1" />
                                    Pay with M-Pesa
                                </Button>
                            </Link>
                        </div>
                    </div>
                );

            case 'pending':
                return (
                    <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 mb-6 flex items-start gap-4">
                        <div className="bg-amber-100 p-2 rounded-lg shrink-0">
                            <Clock className="w-6 h-6 text-amber-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-amber-800 text-sm">Under Review</h3>
                            <p className="text-xs text-gray-600 mt-1">
                                Your documents are being reviewed. This usually takes 1-2 business days.
                            </p>
                        </div>
                    </div>
                );

            case 'rejected':
                return (
                    <div className="bg-red-50 border border-red-100 rounded-2xl p-5 mb-6 flex items-start gap-4">
                        <div className="bg-red-100 p-2 rounded-lg shrink-0">
                            <XCircle className="w-6 h-6 text-red-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-red-800 text-sm">Verification Rejected</h3>
                            <p className="text-xs text-gray-600 mt-1 mb-3">
                                Please re-submit with corrected documents.
                            </p>
                            <Link href="/profile/verify">
                                <Button size="sm" variant="outline" className="border-red-200 text-red-700 hover:bg-red-100 h-8 text-xs">
                                    Re-submit Documents
                                </Button>
                            </Link>
                        </div>
                    </div>
                );

            case 'none':
            default:
                return (
                    <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5 mb-6 flex items-start gap-4">
                        <div className="bg-orange-100 p-2 rounded-lg shrink-0">
                            <ShieldCheck className="w-6 h-6 text-orange-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 text-sm">Get Verified</h3>
                            <p className="text-xs text-gray-600 mt-1 mb-3">
                                Verify your account to appear in search results and build trust with clients.
                            </p>
                            <Link href="/profile/verify">
                                <Button size="sm" variant="outline" className="border-orange-200 text-orange-700 hover:bg-orange-100 h-8 text-xs">
                                    Start Verification
                                </Button>
                            </Link>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header with Status */}
            <div className="bg-slate-900 pt-8 pb-20 px-4 rounded-b-[3rem]">
                <div className="max-w-4xl mx-auto">
                    <div className="flex justify-between items-start mb-8">
                        <div className="flex items-center gap-4">
                            <div className="h-14 w-14 bg-orange-500 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg ring-4 ring-white/10">
                                {user.fullName.charAt(0)}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white">Hello, {user.fullName.split(' ')[0]}</h1>
                                <p className="text-slate-400 text-sm">Welcome back to your workspace</p>
                            </div>
                        </div>
                        <Link href="/dashboard/settings">
                            <Button size="icon" variant="ghost" className="text-white hover:bg-white/10 rounded-full">
                                <Settings className="w-6 h-6" />
                            </Button>
                        </Link>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/5">
                            <div className="flex items-center gap-2 mb-2 text-slate-300 text-xs uppercase font-medium tracking-wider">
                                <Star className="w-3 h-3 text-yellow-400" /> Rating
                            </div>
                            <div className="text-2xl font-bold text-white">{stats?.avgRating.toFixed(1) || '0.0'}</div>
                            <div className="text-xs text-slate-400">{stats?.reviewCount || 0} reviews</div>
                        </div>

                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/5">
                            <div className="flex items-center gap-2 mb-2 text-slate-300 text-xs uppercase font-medium tracking-wider">
                                <Users className="w-3 h-3 text-blue-400" /> Contacts
                            </div>
                            <div className="text-2xl font-bold text-white">{stats?.totalContacts || 0}</div>
                            <div className="text-xs text-slate-400">{stats?.contactsLast30Days || 0} this month</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area - overlaps header */}
            <div className="max-w-4xl mx-auto px-4 -mt-12">

                {/* Availability Card */}
                <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 mb-6 flex items-center justify-between border border-slate-100">
                    <div>
                        <h3 className="font-bold text-gray-900 mb-1">Availability Status</h3>
                        <div className="flex items-center gap-2">
                            <span className={`relative flex h-3 w-3`}>
                                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isOnline ? 'bg-green-400' : 'bg-gray-400'}`}></span>
                                <span className={`relative inline-flex rounded-full h-3 w-3 ${isOnline ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                            </span>
                            <span className={`text-sm font-medium ${isOnline ? 'text-green-600' : 'text-gray-500'}`}>
                                {isOnline ? 'You are Online' : 'You are Offline'}
                            </span>
                        </div>
                    </div>
                    <Button
                        onClick={handleAvailabilityToggle}
                        disabled={isToggling}
                        className={`h-12 px-6 rounded-xl font-semibold transition-all shadow-md ${isOnline
                            ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-100'
                            : 'bg-green-600 text-white hover:bg-green-700 shadow-green-200'
                            }`}
                    >
                        <Power className="w-5 h-5 mr-2" />
                        {isOnline ? 'Go Offline' : 'Go Online'}
                    </Button>
                </div>

                {/* Verification Status Banner */}
                {renderVerificationBanner()}

                {/* Menu Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link href="/dashboard/profile" className="group">
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="bg-blue-50 p-3 rounded-xl group-hover:bg-blue-100 transition-colors">
                                    <MapPin className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">Coverage Area</h3>
                                    <p className="text-xs text-gray-500">Manage location & pricing</p>
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-300" />
                        </div>
                    </Link>

                    <Link href="/dashboard/schedule" className="group">
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="bg-purple-50 p-3 rounded-xl group-hover:bg-purple-100 transition-colors">
                                    <Calendar className="w-6 h-6 text-purple-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">Working Hours</h3>
                                    <p className="text-xs text-gray-500">Set your schedule</p>
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-300" />
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}

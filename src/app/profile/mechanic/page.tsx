'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { createClient } from '@/lib/supabase/client';
import { getMechanicProfile, updateMechanicProfile, MechanicProfileUpdate } from '@/app/mechanic-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    ArrowLeft,
    Save,
    LogOut,
    User,
    MapPin,
    Briefcase,
    Banknote,
    Shield,
    Eye,
    Loader2,
    Check,
    Camera,
    Trash2
} from 'lucide-react';
import Link from 'next/link';

// Specialty options for different service types
const MECHANIC_SPECIALTIES = [
    'Engine Repair', 'Brakes', 'Electrical', 'Transmission',
    'AC/Climate', 'Suspension', 'Oil Change', 'Diagnostics'
];

const BREAKDOWN_SPECIALTIES = [
    'Towing', 'Battery Jump', 'Tire Change', 'Fuel Delivery',
    'Lockout Service', 'Winching', 'Mobile Repair'
];

// Generate consistent color from name
function getAvatarColor(name: string): string {
    const colors = ['bg-orange-500', 'bg-blue-600', 'bg-emerald-600', 'bg-violet-600'];
    return colors[name.charCodeAt(0) % colors.length];
}

function getInitials(name: string): string {
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

type ProfileData = {
    id: string;
    fullName: string;
    email: string;
    isVerified: boolean;
    serviceType: string;
    businessName?: string | null;
    bio?: string | null;
    specialties: string[];
    yearsExperience: number;
    city: string;
    address: string;
    serviceAreas: string[];
    serviceRadius: number;
    phone: string;
    whatsapp?: string | null;
    callOutFee: number;
    hourlyRate: number;
    avgRating: number;
    reviewCount: number;
    totalJobs: number;
};

export default function MechanicProfilePage() {
    const { user, logout, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const supabase = createClient();

    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [activeSection, setActiveSection] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        businessName: '',
        bio: '',
        specialties: [] as string[],
        yearsExperience: 0,
        city: '',
        address: '',
        serviceAreas: '',
        serviceRadius: 10,
        phone: '',
        callOutFee: 0,
        hourlyRate: 0,
    });

    // Load profile
    useEffect(() => {
        async function loadProfile() {
            if (user?.id) {
                const result = await getMechanicProfile(user.id);
                if (result.success && result.profile) {
                    const p = result.profile;
                    setProfile(p as ProfileData);
                    setFormData({
                        businessName: p.businessName || '',
                        bio: p.bio || '',
                        specialties: p.specialties,
                        yearsExperience: p.yearsExperience,
                        city: p.city,
                        address: p.address,
                        serviceAreas: p.serviceAreas.join(', '),
                        serviceRadius: p.serviceRadius,
                        phone: p.phone,
                        callOutFee: p.callOutFee,
                        hourlyRate: p.hourlyRate,
                    });
                }
                setIsLoading(false);
            }
        }

        if (!authLoading) {
            if (!user) {
                router.push('/login');
            } else if (user.role !== 'mechanic' && user.role !== 'breakdown') {
                router.push('/profile');
            } else {
                loadProfile();
            }
        }
    }, [user, authLoading, router]);

    const handleSave = async () => {
        if (!user?.id) return;

        setIsSaving(true);
        setSaveSuccess(false);

        const updates: MechanicProfileUpdate = {
            businessName: formData.businessName || undefined,
            bio: formData.bio || undefined,
            specialties: formData.specialties,
            yearsExperience: formData.yearsExperience,
            city: formData.city,
            address: formData.address,
            serviceAreas: formData.serviceAreas.split(',').map(s => s.trim()).filter(Boolean),
            serviceRadius: formData.serviceRadius,
            callOutFee: formData.callOutFee,
            hourlyRate: formData.hourlyRate,
            phone: formData.phone,
        };

        const result = await updateMechanicProfile(user.id, updates);

        if (result.success) {
            setSaveSuccess(true);
            setActiveSection(null);
            setTimeout(() => setSaveSuccess(false), 3000);
        }

        setIsSaving(false);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        logout();
        router.push('/login');
    };

    const toggleSpecialty = (specialty: string) => {
        setFormData(prev => ({
            ...prev,
            specialties: prev.specialties.includes(specialty)
                ? prev.specialties.filter(s => s !== specialty)
                : [...prev.specialties, specialty]
        }));
    };

    if (isLoading || authLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <p className="text-gray-500">Profile not found</p>
            </div>
        );
    }

    const specialtyOptions = profile.serviceType === 'breakdown' ? BREAKDOWN_SPECIALTIES : MECHANIC_SPECIALTIES;

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Header */}
            <div className="bg-slate-900">
                <div className="max-w-lg mx-auto px-4 pt-4 pb-16">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => router.back()}
                                className="p-2 -ml-2 hover:bg-white/10 rounded-full"
                            >
                                <ArrowLeft className="w-5 h-5 text-white" />
                            </button>
                            <h1 className="font-bold text-xl text-white">My Profile</h1>
                        </div>
                        {saveSuccess && (
                            <div className="flex items-center gap-1 text-green-400 text-sm">
                                <Check size={16} />
                                Saved
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Avatar Section */}
            <div className="max-w-lg mx-auto px-4 -mt-12">
                <div className="flex flex-col items-center">
                    <div className="relative">
                        <div className={`w-24 h-24 rounded-full ${getAvatarColor(profile.fullName)} flex items-center justify-center border-4 border-white shadow-lg`}>
                            <span className="text-white font-bold text-3xl">{getInitials(profile.fullName)}</span>
                        </div>
                        <button className="absolute bottom-0 right-0 w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center border-2 border-white">
                            <Camera size={14} className="text-white" />
                        </button>
                    </div>
                    <h2 className="mt-4 text-xl font-bold text-gray-900">{profile.fullName}</h2>
                    <p className="text-gray-500">{profile.email}</p>

                    {/* Verification Badge */}
                    {profile.isVerified ? (
                        <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-500 text-white rounded-full text-sm font-medium">
                            <Shield size={14} />
                            Verified {profile.serviceType === 'breakdown' ? 'Breakdown Service' : 'Mechanic'}
                        </div>
                    ) : (
                        <Link href="/profile/verify" className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-full text-sm font-medium hover:bg-orange-200">
                            <Shield size={14} />
                            Get Verified
                        </Link>
                    )}

                    {/* Stats */}
                    <div className="mt-6 flex items-center gap-8">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-slate-900">{profile.avgRating.toFixed(1)}</p>
                            <p className="text-xs text-gray-500">Rating</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-slate-900">{profile.reviewCount}</p>
                            <p className="text-xs text-gray-500">Reviews</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-slate-900">{profile.totalJobs}</p>
                            <p className="text-xs text-gray-500">Jobs</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Settings Sections */}
            <div className="max-w-lg mx-auto px-4 mt-8 space-y-4">

                {/* Personal Info */}
                <SettingsSection
                    title="Personal Info"
                    icon={<User size={20} className="text-blue-600" />}
                    iconBg="bg-blue-100"
                    isOpen={activeSection === 'personal'}
                    onToggle={() => setActiveSection(activeSection === 'personal' ? null : 'personal')}
                >
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm text-gray-600 mb-1 block">Business Name (optional)</label>
                            <Input
                                value={formData.businessName}
                                onChange={e => setFormData({ ...formData, businessName: e.target.value })}
                                placeholder="e.g. John's Auto Repair"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-gray-600 mb-1 block">Phone</label>
                            <Input
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="+254..."
                            />
                        </div>
                        <div>
                            <label className="text-sm text-gray-600 mb-1 block">Bio</label>
                            <textarea
                                className="w-full border border-gray-200 rounded-lg p-3 text-sm resize-none"
                                rows={3}
                                value={formData.bio}
                                onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                placeholder="Tell drivers about yourself..."
                            />
                        </div>
                    </div>
                </SettingsSection>

                {/* Specialties */}
                <SettingsSection
                    title="Specialties"
                    icon={<Briefcase size={20} className="text-purple-600" />}
                    iconBg="bg-purple-100"
                    isOpen={activeSection === 'specialties'}
                    onToggle={() => setActiveSection(activeSection === 'specialties' ? null : 'specialties')}
                >
                    <div className="flex flex-wrap gap-2">
                        {specialtyOptions.map(specialty => (
                            <button
                                key={specialty}
                                onClick={() => toggleSpecialty(specialty)}
                                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${formData.specialties.includes(specialty)
                                    ? 'bg-orange-500 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {specialty}
                            </button>
                        ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-3">
                        Selected: {formData.specialties.length > 0 ? formData.specialties.join(', ') : 'None'}
                    </p>
                </SettingsSection>

                {/* Coverage Area */}
                <SettingsSection
                    title="Coverage Area"
                    icon={<MapPin size={20} className="text-amber-600" />}
                    iconBg="bg-amber-100"
                    isOpen={activeSection === 'location'}
                    onToggle={() => setActiveSection(activeSection === 'location' ? null : 'location')}
                >
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm text-gray-600 mb-1 block">City</label>
                            <Input
                                value={formData.city}
                                onChange={e => setFormData({ ...formData, city: e.target.value })}
                                placeholder="e.g. Nairobi"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-gray-600 mb-1 block">Address</label>
                            <Input
                                value={formData.address}
                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                                placeholder="e.g. Westlands, Nairobi"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-gray-600 mb-1 block">Areas You Serve (comma separated)</label>
                            <Input
                                value={formData.serviceAreas}
                                onChange={e => setFormData({ ...formData, serviceAreas: e.target.value })}
                                placeholder="e.g. Westlands, Parklands, Kilimani"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-gray-600 mb-1 block">Service Radius (km)</label>
                            <Input
                                type="number"
                                value={formData.serviceRadius}
                                onChange={e => setFormData({ ...formData, serviceRadius: parseInt(e.target.value) || 10 })}
                            />
                        </div>
                    </div>
                </SettingsSection>

                {/* Pricing */}
                <SettingsSection
                    title="Pricing"
                    icon={<Banknote size={20} className="text-green-600" />}
                    iconBg="bg-green-100"
                    isOpen={activeSection === 'pricing'}
                    onToggle={() => setActiveSection(activeSection === 'pricing' ? null : 'pricing')}
                >
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm text-gray-600 mb-1 block">Call-out Fee (KSh)</label>
                            <Input
                                type="number"
                                value={formData.callOutFee}
                                onChange={e => setFormData({ ...formData, callOutFee: parseInt(e.target.value) || 0 })}
                                placeholder="e.g. 500"
                            />
                            <p className="text-xs text-gray-400 mt-1">Fee to come to the driver's location</p>
                        </div>
                        <div>
                            <label className="text-sm text-gray-600 mb-1 block">Hourly Rate (KSh)</label>
                            <Input
                                type="number"
                                value={formData.hourlyRate}
                                onChange={e => setFormData({ ...formData, hourlyRate: parseInt(e.target.value) || 0 })}
                                placeholder="e.g. 800"
                            />
                        </div>
                    </div>
                </SettingsSection>

                {/* Preview Profile */}
                <Link
                    href={`/mechanic/${user?.id}`}
                    className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors"
                >
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                        <Eye size={20} className="text-slate-600" />
                    </div>
                    <div className="flex-1">
                        <p className="font-medium text-gray-900">Preview Public Profile</p>
                        <p className="text-xs text-gray-500">See how drivers see you</p>
                    </div>
                </Link>

                {/* Verification Docs */}
                <Link
                    href="/profile/verify"
                    className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors"
                >
                    <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                        <Shield size={20} className="text-orange-600" />
                    </div>
                    <div className="flex-1">
                        <p className="font-medium text-gray-900">Verification Documents</p>
                        <p className="text-xs text-gray-500">Upload ID, permits, and certificates</p>
                    </div>
                </Link>

                {/* Save Button */}
                <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white py-6"
                >
                    {isSaving ? (
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    ) : (
                        <Save className="w-5 h-5 mr-2" />
                    )}
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>

                {/* Logout */}
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 text-red-500 font-medium hover:bg-red-50 transition-colors"
                >
                    <LogOut size={18} />
                    Log Out
                </button>

                {/* Delete Account */}
                <button
                    className="w-full flex items-center justify-center gap-2 p-4 text-gray-400 text-sm hover:text-red-500 transition-colors"
                >
                    <Trash2 size={14} />
                    Delete Account
                </button>
            </div>
        </div>
    );
}

// Collapsible Section Component
function SettingsSection({
    title,
    icon,
    iconBg,
    isOpen,
    onToggle,
    children
}: {
    title: string;
    icon: React.ReactNode;
    iconBg: string;
    isOpen: boolean;
    onToggle: () => void;
    children: React.ReactNode;
}) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <button
                onClick={onToggle}
                className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
            >
                <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center`}>
                    {icon}
                </div>
                <div className="flex-1 text-left">
                    <p className="font-medium text-gray-900">{title}</p>
                </div>
                <div className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </button>
            {isOpen && (
                <div className="px-4 pb-4 pt-2 border-t border-gray-100">
                    {children}
                </div>
            )}
        </div>
    );
}

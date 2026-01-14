'use client';

import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import {
  Car,
  LogOut,
  Settings,
  History,
  ChevronRight,
  Camera,
  BadgeCheck,
  Pencil
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

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

export default function ProfilePage() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
    // Redirect mechanics to their specific profile page
    if (!isLoading && user && (user.role === 'mechanic' || user.role === 'breakdown')) {
      router.replace('/profile/mechanic');
    }
  }, [user, isLoading, router]);

  // Show nothing while redirecting mechanics
  if (isLoading || !user || user.role === 'mechanic' || user.role === 'breakdown') return null;

  const initials = getInitials(user.fullName);
  const avatarColor = getAvatarColor(user.fullName);

  // Mock stats - will come from database
  const stats = {
    totalRequests: 23,
    averageRating: 4.8,
    yearsActive: 2,
  };

  // Phone from user profile
  const phone = user.phone || '+254 712 345 678';

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-slate-900">
        <div className="max-w-lg mx-auto px-4 pt-5 pb-16">
          <div className="flex items-center justify-between">
            <h1 className="font-bold text-xl text-white">My Profile</h1>
            <Button
              variant="outline"
              size="sm"
              className="bg-orange-500 border-orange-500 text-white hover:bg-orange-600 hover:text-white"
            >
              <Pencil size={14} className="mr-1" />
              Edit
            </Button>
          </div>
        </div>
      </div>

      {/* Avatar Section - Overlapping header */}
      <div className="max-w-lg mx-auto px-4 -mt-12">
        <div className="flex flex-col items-center">
          {/* Avatar with Camera */}
          <div className="relative">
            <div className={`w-24 h-24 rounded-full ${avatarColor} flex items-center justify-center border-4 border-white shadow-lg`}>
              <span className="text-white font-bold text-3xl">{initials}</span>
            </div>
            {/* Camera Button */}
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center border-2 border-white">
              <Camera size={14} className="text-white" />
            </button>
          </div>

          {/* Name */}
          <h2 className="mt-4 text-xl font-bold text-gray-900">{user.fullName}</h2>

          {/* Phone */}
          <p className="text-gray-500 mt-1">{phone}</p>

          {/* Verified Badge */}
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-500 text-white rounded-full text-sm font-medium">
            <BadgeCheck size={16} />
            Verified Driver
          </div>
        </div>

        {/* Stats Row */}
        <div className="mt-8 flex items-center justify-center gap-8">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.totalRequests}</p>
            <p className="text-xs text-gray-500 mt-1">Total Requests</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.averageRating}</p>
            <p className="text-xs text-gray-500 mt-1">Average Rating</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.yearsActive}</p>
            <p className="text-xs text-gray-500 mt-1">Years Active</p>
          </div>
        </div>
      </div>

      {/* Menu Sections */}
      <div className="max-w-lg mx-auto px-4 mt-8 space-y-6">
        {/* Vehicle & Services */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Vehicle & Services</h3>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* My Vehicles */}
            <Link
              href="/profile/vehicles"
              className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <Car size={20} className="text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">My Vehicles</p>
                <p className="text-xs text-gray-500">Manage your registered vehicles</p>
              </div>
              <ChevronRight size={20} className="text-gray-400" />
            </Link>

            {/* Divider */}
            <div className="border-t border-gray-100" />

            {/* Service History */}
            <Link
              href="/history"
              className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                <History size={20} className="text-orange-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Service History</p>
                <p className="text-xs text-gray-500">View past mechanic requests</p>
              </div>
              {/* Notification Badge */}
              <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center mr-1">
                <span className="text-white text-[10px] font-bold">3</span>
              </div>
              <ChevronRight size={20} className="text-gray-400" />
            </Link>
          </div>
        </div>

        {/* Account */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Account</h3>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Settings */}
            <Link
              href="/profile/settings"
              className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                <Settings size={20} className="text-gray-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Settings</p>
                <p className="text-xs text-gray-500">App preferences & notifications</p>
              </div>
              <ChevronRight size={20} className="text-gray-400" />
            </Link>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 text-red-500 font-medium hover:bg-red-50 transition-colors"
        >
          <LogOut size={18} />
          Log Out
        </button>
      </div>
    </div>
  );
}

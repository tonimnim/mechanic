'use client';

import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Car,
  LogOut,
  Settings,
  History,
  ChevronRight,
  Camera,
  BadgeCheck,
  Pencil,
  X,
  Check,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { updateDriverProfile, uploadAvatar } from '@/app/driver-actions';

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
  const { user, logout, isLoading, refreshUser } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize edit fields when user loads
  useEffect(() => {
    if (user) {
      setEditName(user.fullName);
      setEditPhone(user.phone || '');
    }
  }, [user]);

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

  const handleStartEdit = () => {
    setEditName(user.fullName);
    setEditPhone(user.phone || '');
    setError(null);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setError(null);
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      setError('Name is required');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const result = await updateDriverProfile(user.id, {
        fullName: editName.trim(),
        phone: editPhone.trim() || undefined,
      });

      if (result.success) {
        // Refresh user data in auth context
        if (refreshUser) {
          await refreshUser();
        }
        setIsEditing(false);
      } else {
        setError(result.error || 'Failed to update profile');
      }
    } catch {
      setError('An error occurred while saving');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a JPEG, PNG, WebP, or GIF image');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }

    setIsUploadingAvatar(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const result = await uploadAvatar(user.id, formData);

      if (result.success) {
        // Refresh user data to get new avatar
        if (refreshUser) {
          await refreshUser();
        }
      } else {
        setError(result.error || 'Failed to upload image');
      }
    } catch {
      setError('An error occurred while uploading');
    } finally {
      setIsUploadingAvatar(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-slate-900">
        <div className="max-w-lg mx-auto px-4 pt-5 pb-16">
          <div className="flex items-center justify-between">
            <h1 className="font-bold text-xl text-white">My Profile</h1>
            {isEditing ? (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                  className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
                >
                  <X size={14} className="mr-1" />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="bg-green-500 border-green-500 text-white hover:bg-green-600"
                >
                  {isSaving ? (
                    <Loader2 size={14} className="mr-1 animate-spin" />
                  ) : (
                    <Check size={14} className="mr-1" />
                  )}
                  Save
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={handleStartEdit}
                className="bg-orange-500 border-orange-500 text-white hover:bg-orange-600 hover:text-white"
              >
                <Pencil size={14} className="mr-1" />
                Edit
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Avatar Section - Overlapping header */}
      <div className="max-w-lg mx-auto px-4 -mt-12">
        <div className="flex flex-col items-center">
          {/* Avatar with Camera */}
          <div className="relative">
            {user.avatarUrl ? (
              <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden">
                <img
                  src={user.avatarUrl}
                  alt={user.fullName}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className={`w-24 h-24 rounded-full ${avatarColor} flex items-center justify-center border-4 border-white shadow-lg`}>
                <span className="text-white font-bold text-3xl">{initials}</span>
              </div>
            )}
            {/* Camera Button */}
            <button
              onClick={handleAvatarClick}
              disabled={isUploadingAvatar}
              className="absolute bottom-0 right-0 w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center border-2 border-white disabled:opacity-50"
            >
              {isUploadingAvatar ? (
                <Loader2 size={14} className="text-white animate-spin" />
              ) : (
                <Camera size={14} className="text-white" />
              )}
            </button>
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Name */}
          {isEditing ? (
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="mt-4 text-center text-xl font-bold max-w-xs"
              placeholder="Your name"
            />
          ) : (
            <h2 className="mt-4 text-xl font-bold text-gray-900">{user.fullName}</h2>
          )}

          {/* Phone */}
          {isEditing ? (
            <Input
              value={editPhone}
              onChange={(e) => setEditPhone(e.target.value)}
              className="mt-2 text-center max-w-xs"
              placeholder="+254 712 345 678"
              type="tel"
            />
          ) : (
            <p className="text-gray-500 mt-1">{user.phone || 'No phone added'}</p>
          )}

          {/* Error message */}
          {error && (
            <p className="mt-2 text-sm text-red-500">{error}</p>
          )}

          {/* Verified Badge */}
          {user.isVerified && (
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-500 text-white rounded-full text-sm font-medium">
              <BadgeCheck size={16} />
              Verified Driver
            </div>
          )}
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

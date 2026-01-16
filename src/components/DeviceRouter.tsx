'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDeviceDetect } from '@/lib/hooks/useDeviceDetect';

interface DeviceRouterProps {
  children: React.ReactNode;
}

/**
 * DeviceRouter - Routes users based on device type
 * - Mobile users: Always redirected to /welcome
 * - Desktop users: Render children (landing page)
 */
export function DeviceRouter({ children }: DeviceRouterProps) {
  const router = useRouter();
  const { isMobile, isLoading } = useDeviceDetect();

  useEffect(() => {
    if (!isLoading && isMobile) {
      router.replace('/welcome');
    }
  }, [isMobile, isLoading, router]);

  // Show loading spinner while detecting device
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Mobile users get redirected, show nothing during redirect
  if (isMobile) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Desktop users see the landing page
  return <>{children}</>;
}

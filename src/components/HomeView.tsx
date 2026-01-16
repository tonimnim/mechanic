'use client';

import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MechanicCard } from '@/components/MechanicCard';
import type { MechanicResult } from '@/app/actions';

import { PushNotificationManager } from '@/components/PushNotificationManager';
import { FirstVisitCheck } from '@/components/FirstVisitCheck';

interface HomeViewProps {
  mechanicsData: MechanicResult[];
}

export function HomeView({ mechanicsData }: HomeViewProps) {
  // Show only available/online mechanics first on home
  const sortedMechanics = [...mechanicsData].sort((a, b) => {
    if (a.availability === 'online' && b.availability !== 'online') return -1;
    if (b.availability === 'online' && a.availability !== 'online') return 1;
    return b.rating - a.rating;
  });

  return (
    <FirstVisitCheck>
      {/* DESKTOP VIEW - Empty for now */}
      <div className="hidden md:block min-h-screen bg-white">
        {/* Future content */}
      </div>

      {/* MOBILE VIEW - Mechanics PWA */}
      <div className="md:hidden min-h-screen bg-gray-50 pb-24">
        {/* Header */}
        <div className="bg-slate-900">
          <div className="max-w-lg mx-auto px-4 py-5">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-bold text-xl text-white">Nearby Mechanics</h1>
                <p className="text-sm text-gray-400 flex items-center gap-1 mt-1">
                  <MapPin size={12} />
                  Nairobi, Kenya
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-400">
                  {mechanicsData.length} available
                </span>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10">
                  <div className="w-9 h-9 bg-gray-700 rounded-full overflow-hidden ring-2 ring-white/20">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Anthony" alt="User" />
                  </div>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="max-w-lg mx-auto px-4 pt-4">

          {/* Mechanics List */}
          <div className="space-y-3">
            {sortedMechanics.length > 0 ? (
              sortedMechanics.map((mechanic) => (
                <MechanicCard key={mechanic.id} mechanic={mechanic} />
              ))
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl">
                <p className="text-gray-500">No mechanics available right now.</p>
              </div>
            )}
          </div>

          {/* PWA Push Notification Prompt */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <PushNotificationManager />
          </div>
        </main>
      </div>
    </FirstVisitCheck>
  );
}


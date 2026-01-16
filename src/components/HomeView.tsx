'use client';

import { MapPin, CheckCircle, Clock, Shield, Wrench, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MechanicCard } from '@/components/MechanicCard';
import type { MechanicResult } from '@/app/actions';
import Link from 'next/link';

import { PushNotificationManager } from '@/components/PushNotificationManager';
import { FirstVisitCheck } from '@/components/FirstVisitCheck';
import { Footer } from '@/components/Footer';

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
      {/* DESKTOP VIEW - Landing Page Hero */}
      <div className="hidden md:block min-h-screen bg-gradient-to-b from-slate-50 to-white">
        {/* Hero Section */}
        <section className="container mx-auto px-6 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-slate-900 leading-tight">
                  Find Trusted <span className="text-rose-600">Mechanics</span> Near You
                </h1>
                <p className="text-lg lg:text-xl text-slate-600 max-w-lg">
                  Connect with verified mechanics and breakdown services in Kenya — anytime, anywhere.
                </p>
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap gap-4">
                <Link href="/find">
                  <Button size="lg" className="bg-rose-600 hover:bg-rose-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg shadow-rose-200 hover:shadow-xl transition-all">
                    <Wrench className="mr-2 h-5 w-5" />
                    Find a Mechanic
                  </Button>
                </Link>
                <Link href="/register/mechanic">
                  <Button size="lg" variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-100 px-8 py-6 text-lg rounded-xl">
                    I'm a Mechanic
                  </Button>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap gap-6 pt-4">
                <div className="flex items-center gap-2 text-slate-600">
                  <div className="p-2 bg-rose-100 rounded-lg">
                    <Users className="h-5 w-5 text-rose-600" />
                  </div>
                  <span className="text-sm font-medium">500+ Verified Mechanics</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <div className="p-2 bg-rose-100 rounded-lg">
                    <Clock className="h-5 w-5 text-rose-600" />
                  </div>
                  <span className="text-sm font-medium">24/7 Breakdown Assistance</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <div className="p-2 bg-rose-100 rounded-lg">
                    <Shield className="h-5 w-5 text-rose-600" />
                  </div>
                  <span className="text-sm font-medium">Secure M-Pesa Payments</span>
                </div>
              </div>
            </div>

            {/* Right - Hero Image */}
            <div className="relative">
              <div className="relative z-10">
                <img
                  src="/hero-illustration.png"
                  alt="Mechanic roadside assistance illustration"
                  className="w-full max-w-lg mx-auto drop-shadow-2xl"
                />
              </div>
              {/* Background decoration */}
              <div className="absolute -top-8 -right-8 w-72 h-72 bg-rose-100 rounded-full blur-3xl opacity-50" />
              <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-slate-200 rounded-full blur-2xl opacity-60" />
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 lg:py-28 bg-white">
          <div className="container mx-auto px-6">
            {/* Section Header */}
            <div className="text-center max-w-2xl mx-auto mb-16">
              <p className="text-rose-600 font-medium text-sm uppercase tracking-wider mb-3">
                Simple Process
              </p>
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
                How It Works
              </h2>
              <p className="text-slate-600 text-lg">
                Whether you need a mechanic or you are one, getting started takes just a few steps.
              </p>
            </div>

            {/* Two Track Layout */}
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">

              {/* For Drivers */}
              <div className="space-y-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="h-px flex-1 bg-slate-200" />
                  <h3 className="text-lg font-semibold text-slate-900 whitespace-nowrap">For Drivers</h3>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>

                {/* Step 1 */}
                <div className="flex gap-5">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                      <span className="text-lg font-bold text-slate-400">01</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">Search</h4>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      Find mechanics near your location or filter by specialization. Browse profiles and check ratings.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex gap-5">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                      <span className="text-lg font-bold text-slate-400">02</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">Connect</h4>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      Chat directly with mechanics through the app. Discuss your issue, get quotes, and agree on terms.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex gap-5">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center border border-rose-100">
                      <span className="text-lg font-bold text-rose-600">03</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">Get Fixed</h4>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      Book the service at your convenience. Pay securely via M-Pesa once the job is complete.
                    </p>
                  </div>
                </div>
              </div>

              {/* For Mechanics */}
              <div className="space-y-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="h-px flex-1 bg-slate-200" />
                  <h3 className="text-lg font-semibold text-slate-900 whitespace-nowrap">For Mechanics</h3>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>

                {/* Step 1 */}
                <div className="flex gap-5">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                      <span className="text-lg font-bold text-slate-400">01</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">Register</h4>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      Create your professional profile. Add your specialties, experience, service area, and pricing.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex gap-5">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                      <span className="text-lg font-bold text-slate-400">02</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">Get Verified</h4>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      Upload your documents for verification. Earn the verified badge and build instant trust.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex gap-5">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center border border-rose-100">
                      <span className="text-lg font-bold text-rose-600">03</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">Grow</h4>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      Receive client requests directly. Build your reputation through reviews and expand your business.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <Footer />
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


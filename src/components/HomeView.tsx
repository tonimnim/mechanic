'use client';

import { MapPin, CheckCircle, Clock, Shield, Wrench, Users, MessageSquare, Star, Car, Smartphone, Zap, Bell } from 'lucide-react';
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

        {/* Why eGarage Section */}
        <section className="py-20 lg:py-28 bg-slate-50">
          <div className="container mx-auto px-6">
            {/* Section Header */}
            <div className="text-center max-w-2xl mx-auto mb-16">
              <p className="text-rose-600 font-medium text-sm uppercase tracking-wider mb-3">
                Why Choose Us
              </p>
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
                The eGarage Difference
              </h2>
              <p className="text-slate-600 text-lg">
                More than a directory — a trusted platform built for drivers and mechanics alike.
              </p>
            </div>

            {/* Feature Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center mb-4">
                  <CheckCircle className="w-6 h-6 text-rose-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Verified Mechanics</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Every mechanic is vetted and verified. Look for the badge to know you're dealing with a professional.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center mb-4">
                  <MapPin className="w-6 h-6 text-rose-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Nearby & Available</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  See who's online and close to you. Real-time availability so you know who can help right now.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center mb-4">
                  <MessageSquare className="w-6 h-6 text-rose-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">In-App Chat</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Communicate directly without sharing phone numbers. Discuss issues, negotiate, and confirm details privately.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-rose-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Secure Payments</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  M-Pesa integration for safe, familiar transactions. Pay only when the work is done to your satisfaction.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center mb-4">
                  <Star className="w-6 h-6 text-rose-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Ratings & Reviews</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Choose based on real customer feedback. Transparent ratings help you find the right mechanic every time.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center mb-4">
                  <Car className="w-6 h-6 text-rose-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Breakdown Services</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  24/7 emergency assistance including towing, jump starts, and tire changes. Help when you need it most.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 lg:py-28 bg-white">
          <div className="container mx-auto px-6">
            {/* Section Header */}
            <div className="text-center max-w-2xl mx-auto mb-16">
              <p className="text-rose-600 font-medium text-sm uppercase tracking-wider mb-3">
                Trusted by Thousands
              </p>
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
                What Our Users Say
              </h2>
            </div>

            {/* Testimonials Grid */}
            <div className="grid md:grid-cols-3 gap-8">
              {/* Testimonial 1 */}
              <div className="bg-slate-50 rounded-2xl p-6 relative">
                <div className="absolute -top-3 left-6 text-5xl text-rose-200 font-serif">"</div>
                <p className="text-slate-700 text-sm leading-relaxed mb-6 pt-4">
                  Stranded at 2am on Thika Road with a dead battery. Found a mechanic on eGarage who arrived in 25 minutes. Lifesaver!
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-300 rounded-full flex items-center justify-center text-slate-600 font-semibold text-sm">
                    JM
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 text-sm">James Mwangi</p>
                    <p className="text-slate-500 text-xs">Nairobi</p>
                  </div>
                </div>
              </div>

              {/* Testimonial 2 */}
              <div className="bg-slate-50 rounded-2xl p-6 relative">
                <div className="absolute -top-3 left-6 text-5xl text-rose-200 font-serif">"</div>
                <p className="text-slate-700 text-sm leading-relaxed mb-6 pt-4">
                  As a mechanic, eGarage has transformed my business. I get direct clients, set my own rates, and the verification badge builds instant trust.
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center text-rose-600 font-semibold text-sm">
                    PO
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 text-sm">Peter Ochieng</p>
                    <p className="text-slate-500 text-xs">Verified Mechanic, Kisumu</p>
                  </div>
                </div>
              </div>

              {/* Testimonial 3 */}
              <div className="bg-slate-50 rounded-2xl p-6 relative">
                <div className="absolute -top-3 left-6 text-5xl text-rose-200 font-serif">"</div>
                <p className="text-slate-700 text-sm leading-relaxed mb-6 pt-4">
                  The in-app chat is brilliant. I could describe the weird noise my car was making before the mechanic even arrived. No more phone tag!
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-300 rounded-full flex items-center justify-center text-slate-600 font-semibold text-sm">
                    AW
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 text-sm">Ann Wanjiku</p>
                    <p className="text-slate-500 text-xs">Mombasa</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* For Mechanics CTA Section */}
        <section className="py-20 lg:py-28 bg-slate-900">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center">
              <p className="text-rose-400 font-medium text-sm uppercase tracking-wider mb-3">
                For Mechanics
              </p>
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                Grow Your Business with eGarage
              </h2>
              <p className="text-slate-400 text-lg mb-10 max-w-2xl mx-auto">
                Join Kenya's fastest-growing automotive platform. Get direct access to clients, build your reputation, and take control of your business.
              </p>

              {/* Benefits Grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <div className="text-center">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Users className="w-5 h-5 text-rose-400" />
                  </div>
                  <p className="text-white text-sm font-medium">Free Listing</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-5 h-5 text-rose-400" />
                  </div>
                  <p className="text-white text-sm font-medium">Verified Badge</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <MessageSquare className="w-5 h-5 text-rose-400" />
                  </div>
                  <p className="text-white text-sm font-medium">Direct Client Contact</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Shield className="w-5 h-5 text-rose-400" />
                  </div>
                  <p className="text-white text-sm font-medium">Payment Protection</p>
                </div>
              </div>

              <Link href="/register/mechanic">
                <Button size="lg" className="bg-rose-600 hover:bg-rose-700 text-white px-10 py-6 text-lg rounded-xl">
                  Register as a Mechanic
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Mobile App Preview Section */}
        <section className="py-20 lg:py-28 bg-white overflow-hidden">
          <div className="container mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Content */}
              <div className="space-y-6">
                <p className="text-rose-600 font-medium text-sm uppercase tracking-wider">
                  Mobile Experience
                </p>
                <h2 className="text-3xl lg:text-4xl font-bold text-slate-900">
                  Your Garage in Your Pocket
                </h2>
                <p className="text-slate-600 text-lg">
                  Use eGarage on any device — no download required. Our progressive web app gives you a native app experience right in your browser.
                </p>

                {/* Features List */}
                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-rose-50 rounded-lg flex items-center justify-center">
                      <Smartphone className="w-4 h-4 text-rose-600" />
                    </div>
                    <span className="text-slate-700">Works on any device — phone, tablet, or desktop</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-rose-50 rounded-lg flex items-center justify-center">
                      <Zap className="w-4 h-4 text-rose-600" />
                    </div>
                    <span className="text-slate-700">Lightweight and fast — no heavy downloads</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-rose-50 rounded-lg flex items-center justify-center">
                      <Bell className="w-4 h-4 text-rose-600" />
                    </div>
                    <span className="text-slate-700">Push notifications for messages and updates</span>
                  </div>
                </div>

                <div className="pt-4">
                  <Link href="/find">
                    <Button size="lg" className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-6 text-lg rounded-xl">
                      Try It Now — Free
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Phone Mockup */}
              <div className="relative flex justify-center lg:justify-end">
                <div className="relative">
                  {/* Phone Frame */}
                  <div className="w-64 h-[520px] bg-slate-900 rounded-[3rem] p-3 shadow-2xl">
                    <div className="w-full h-full bg-slate-100 rounded-[2.5rem] overflow-hidden relative">
                      {/* Status Bar */}
                      <div className="bg-slate-900 h-8 flex items-center justify-center">
                        <div className="w-20 h-5 bg-slate-800 rounded-full" />
                      </div>
                      {/* App Content Preview */}
                      <div className="p-4 space-y-3">
                        <div className="bg-slate-200 h-8 rounded-lg w-2/3" />
                        <div className="bg-slate-200 h-4 rounded w-1/2" />
                        <div className="space-y-2 pt-4">
                          <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-100">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-rose-100 rounded-full" />
                              <div className="flex-1 space-y-1">
                                <div className="bg-slate-200 h-3 rounded w-24" />
                                <div className="bg-slate-100 h-2 rounded w-16" />
                              </div>
                              <div className="bg-green-100 px-2 py-1 rounded text-xs text-green-700">Online</div>
                            </div>
                          </div>
                          <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-100">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-slate-200 rounded-full" />
                              <div className="flex-1 space-y-1">
                                <div className="bg-slate-200 h-3 rounded w-20" />
                                <div className="bg-slate-100 h-2 rounded w-14" />
                              </div>
                            </div>
                          </div>
                          <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-100">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-slate-200 rounded-full" />
                              <div className="flex-1 space-y-1">
                                <div className="bg-slate-200 h-3 rounded w-28" />
                                <div className="bg-slate-100 h-2 rounded w-12" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Decorative blur */}
                  <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-rose-100 rounded-full blur-3xl opacity-50 -z-10" />
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


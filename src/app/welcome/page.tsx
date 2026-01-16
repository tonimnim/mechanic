'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Car, Wrench, ChevronRight, Loader2 } from 'lucide-react';
import { useLocationContext } from '@/lib/location-context';

export default function WelcomePage() {
    const router = useRouter();
    const { requestPermission } = useLocationContext();
    const [isRequestingLocation, setIsRequestingLocation] = useState(false);

    const handleDriverClick = async () => {
        setIsRequestingLocation(true);
        // Request location permission before navigating
        await requestPermission();
        // Navigate to find page regardless of permission result
        router.push('/find');
    };

    const handleMechanicClick = () => {
        router.push('/register/mechanic');
    };

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col">
            {/* Background Pattern - matching brand theme */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-rose-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-slate-700/30 rounded-full blur-3xl" />
            </div>

            {/* Content */}
            <div className="relative z-10 flex-1 flex flex-col px-6 py-12 max-w-lg mx-auto w-full">
                {/* Logo Section */}
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                    {/* Logo */}
                    <div className="w-20 h-20 bg-rose-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-rose-500/30 overflow-hidden">
                        <Image
                            src="/logo.svg"
                            alt="eGarage Logo"
                            width={48}
                            height={48}
                            className="w-12 h-12"
                        />
                    </div>

                    {/* App Name */}
                    <h1 className="text-3xl font-bold text-white mb-2">
                        eGarage
                    </h1>
                    <p className="text-slate-400 text-lg">
                        Kenya&apos;s #1 Roadside Assistance
                    </p>

                    {/* Tagline */}
                    <p className="text-slate-500 text-sm mt-4 max-w-xs">
                        Connect with verified mechanics and breakdown services near you, anytime.
                    </p>
                </div>

                {/* Options Section */}
                <div className="space-y-4 pb-6">
                    <p className="text-center text-slate-400 text-sm mb-6">
                        How would you like to use eGarage?
                    </p>

                    {/* Driver Option */}
                    <button
                        onClick={handleDriverClick}
                        disabled={isRequestingLocation}
                        className="group w-full bg-white hover:bg-slate-50 rounded-2xl p-5 flex items-center gap-4 transition-all active:scale-[0.98] shadow-lg shadow-black/20 disabled:opacity-90"
                    >
                        <div className="w-14 h-14 bg-rose-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-rose-200 transition-colors">
                            {isRequestingLocation ? (
                                <Loader2 className="w-7 h-7 text-rose-600 animate-spin" />
                            ) : (
                                <Car className="w-7 h-7 text-rose-600" />
                            )}
                        </div>
                        <div className="flex-1 text-left">
                            <h3 className="font-bold text-slate-900 text-lg">
                                {isRequestingLocation ? 'Getting location...' : "I'm a Driver"}
                            </h3>
                            <p className="text-slate-500 text-sm">
                                {isRequestingLocation ? 'Please allow location access' : 'Find mechanics & breakdown services'}
                            </p>
                        </div>
                        {!isRequestingLocation && (
                            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-rose-500 group-hover:translate-x-1 transition-all" />
                        )}
                    </button>

                    {/* Mechanic Option */}
                    <button
                        onClick={handleMechanicClick}
                        className="group w-full bg-orange-500 hover:bg-orange-600 rounded-2xl p-5 flex items-center gap-4 transition-all active:scale-[0.98] shadow-lg shadow-orange-500/30"
                    >
                        <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-white/30 transition-colors">
                            <Wrench className="w-7 h-7 text-white" />
                        </div>
                        <div className="flex-1 text-left">
                            <h3 className="font-bold text-white text-lg">I&apos;m a Mechanic</h3>
                            <p className="text-orange-100 text-sm">Offer services & grow your business</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-orange-200 group-hover:text-white group-hover:translate-x-1 transition-all" />
                    </button>
                </div>

                {/* Trust Indicators */}
                <div className="flex items-center justify-center gap-6 text-slate-500 text-xs mb-6">
                    <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                        <span>Free to use</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                        <span>Verified mechanics</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                        <span>Secure</span>
                    </div>
                </div>

                {/* Login Link */}
                <div className="text-center mb-6">
                    <p className="text-slate-400 text-sm">
                        Already have an account?{' '}
                        <Link href="/login" className="text-rose-400 font-medium hover:text-rose-300 hover:underline transition-colors">
                            Sign In
                        </Link>
                    </p>
                </div>

                {/* Footer */}
                <div className="text-center">
                    <p className="text-slate-600 text-xs">
                        By continuing, you agree to our{' '}
                        <Link href="/terms" className="text-slate-400 hover:text-slate-300 underline transition-colors">Terms of Service</Link>
                        {' '}and{' '}
                        <Link href="/privacy" className="text-slate-400 hover:text-slate-300 underline transition-colors">Privacy Policy</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

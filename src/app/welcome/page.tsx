'use client';

import { useRouter } from 'next/navigation';
import { Car, Wrench, ChevronRight } from 'lucide-react';
import { markAsVisited } from '@/components/FirstVisitCheck';

export default function WelcomePage() {
    const router = useRouter();

    const handleDriverClick = () => {
        markAsVisited();
        router.push('/');
    };

    const handleMechanicClick = () => {
        markAsVisited();
        router.push('/register/mechanic');
    };

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col">
            {/* Background Pattern */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-orange-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-3xl" />
            </div>

            {/* Content */}
            <div className="relative z-10 flex-1 flex flex-col px-6 py-12 max-w-lg mx-auto w-full">
                {/* Logo Section */}
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                    {/* Logo Icon */}
                    <div className="w-20 h-20 bg-orange-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-orange-500/30">
                        <Wrench className="w-10 h-10 text-white" />
                    </div>

                    {/* App Name */}
                    <h1 className="text-3xl font-bold text-white mb-2">
                        eGarage
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Kenya's #1 Roadside Assistance
                    </p>

                    {/* Tagline */}
                    <p className="text-gray-500 text-sm mt-4 max-w-xs">
                        Connect with verified mechanics and breakdown services near you, anytime.
                    </p>
                </div>

                {/* Options Section */}
                <div className="space-y-4 pb-8">
                    <p className="text-center text-gray-400 text-sm mb-6">
                        How would you like to use eGarage?
                    </p>

                    {/* Driver Option */}
                    <button
                        onClick={handleDriverClick}
                        className="w-full bg-white hover:bg-gray-50 rounded-2xl p-5 flex items-center gap-4 transition-all active:scale-[0.98] shadow-lg"
                    >
                        <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Car className="w-7 h-7 text-blue-600" />
                        </div>
                        <div className="flex-1 text-left">
                            <h3 className="font-bold text-gray-900 text-lg">I'm a Driver</h3>
                            <p className="text-gray-500 text-sm">Find mechanics near me</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                    </button>

                    {/* Mechanic Option */}
                    <button
                        onClick={handleMechanicClick}
                        className="w-full bg-orange-500 hover:bg-orange-600 rounded-2xl p-5 flex items-center gap-4 transition-all active:scale-[0.98] shadow-lg shadow-orange-500/30"
                    >
                        <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Wrench className="w-7 h-7 text-white" />
                        </div>
                        <div className="flex-1 text-left">
                            <h3 className="font-bold text-white text-lg">I'm a Mechanic</h3>
                            <p className="text-orange-100 text-sm">Join & grow my business</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-orange-200" />
                    </button>
                </div>

                {/* Footer */}
                <div className="text-center">
                    <p className="text-gray-600 text-xs">
                        By continuing, you agree to our{' '}
                        <span className="text-gray-400 underline">Terms of Service</span>
                        {' '}and{' '}
                        <span className="text-gray-400 underline">Privacy Policy</span>
                    </p>
                </div>
            </div>
        </div>
    );
}

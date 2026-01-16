'use client';

import Link from 'next/link';
import { Car, Wrench, ChevronRight, Users } from 'lucide-react';

export default function RegisterPage() {
    return (
        <div className="min-h-screen bg-slate-900 flex flex-col">
            {/* Background Pattern - matching landing page */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-rose-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-slate-700/30 rounded-full blur-3xl" />
            </div>

            {/* Content */}
            <div className="relative z-10 flex-1 flex flex-col justify-center px-6 py-12 max-w-lg mx-auto w-full">
                {/* Logo/Brand */}
                <div className="text-center mb-10">
                    <Link href="/" className="inline-block mb-8">
                        <div className="flex items-center justify-center gap-2">
                            <div className="w-10 h-10 bg-rose-600 rounded-xl flex items-center justify-center">
                                <Wrench className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-2xl font-bold text-white">eGarage</span>
                        </div>
                    </Link>

                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-white/10">
                        <Users className="w-8 h-8 text-rose-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-3">Create an Account</h1>
                    <p className="text-slate-400">Choose how you want to use eGarage</p>
                </div>

                {/* Options */}
                <div className="space-y-4">
                    {/* Driver Option - Rose theme */}
                    <Link
                        href="/register/client"
                        className="group block w-full bg-white hover:bg-slate-50 rounded-2xl p-5 transition-all active:scale-[0.98] shadow-lg shadow-black/20"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-rose-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-rose-200 transition-colors">
                                <Car className="w-7 h-7 text-rose-600" />
                            </div>
                            <div className="flex-1 text-left">
                                <h3 className="font-bold text-slate-900 text-lg">I'm a Driver</h3>
                                <p className="text-slate-500 text-sm">Find mechanics & breakdown services</p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-rose-500 group-hover:translate-x-1 transition-all" />
                        </div>
                    </Link>

                    {/* Mechanic Option - Orange theme (matches landing CTA) */}
                    <Link
                        href="/register/mechanic"
                        className="group block w-full bg-orange-500 hover:bg-orange-600 rounded-2xl p-5 transition-all active:scale-[0.98] shadow-lg shadow-orange-500/30"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-white/30 transition-colors">
                                <Wrench className="w-7 h-7 text-white" />
                            </div>
                            <div className="flex-1 text-left">
                                <h3 className="font-bold text-white text-lg">I'm a Mechanic</h3>
                                <p className="text-orange-100 text-sm">Offer services & grow your business</p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-orange-200 group-hover:text-white group-hover:translate-x-1 transition-all" />
                        </div>
                    </Link>
                </div>

                {/* Trust Indicators */}
                <div className="mt-8 flex items-center justify-center gap-6 text-slate-500 text-xs">
                    <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                        <span>Free to join</span>
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
                <div className="mt-8 text-center">
                    <p className="text-slate-400 text-sm">
                        Already have an account?{' '}
                        <Link href="/login" className="text-rose-400 font-medium hover:text-rose-300 hover:underline transition-colors">
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

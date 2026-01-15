'use client';

import Link from 'next/link';
import { Car, Wrench, ChevronRight, User } from 'lucide-react';

export default function RegisterPage() {
    return (
        <div className="min-h-screen bg-slate-900 flex flex-col">
            {/* Background Pattern */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-orange-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-3xl" />
            </div>

            {/* Content */}
            <div className="relative z-10 flex-1 flex flex-col justify-center px-6 py-12 max-w-lg mx-auto w-full">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-white/10">
                        <User className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-3">Create an Account</h1>
                    <p className="text-gray-400">Choose how you want to use eGarage</p>
                </div>

                {/* Options */}
                <div className="space-y-4">
                    {/* Driver Option */}
                    <Link
                        href="/register/client"
                        className="group block w-full bg-white hover:bg-gray-50 rounded-2xl p-5 transition-all active:scale-[0.98] shadow-lg"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-blue-200 transition-colors">
                                <Car className="w-7 h-7 text-blue-600" />
                            </div>
                            <div className="flex-1 text-left">
                                <h3 className="font-bold text-gray-900 text-lg">I'm a Driver</h3>
                                <p className="text-gray-500 text-sm">Find mechanics & breakdown services</p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 transition-colors" />
                        </div>
                    </Link>

                    {/* Mechanic Option */}
                    <Link
                        href="/register/mechanic"
                        className="group block w-full bg-slate-800 hover:bg-slate-700/80 border border-white/10 rounded-2xl p-5 transition-all active:scale-[0.98] shadow-lg"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-orange-500/20 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-orange-500/30 transition-colors">
                                <Wrench className="w-7 h-7 text-orange-500" />
                            </div>
                            <div className="flex-1 text-left">
                                <h3 className="font-bold text-white text-lg">I'm a Mechanic</h3>
                                <p className="text-slate-400 text-sm">Offer services & grow business</p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-orange-500 transition-colors" />
                        </div>
                    </Link>
                </div>

                {/* Login Link */}
                <div className="mt-10 text-center">
                    <p className="text-gray-400 text-sm">
                        Already have an account?{' '}
                        <Link href="/login" className="text-white font-medium hover:underline">
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

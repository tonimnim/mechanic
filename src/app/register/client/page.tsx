'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Mail, Lock, User, Phone, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';
import { syncUserFromSupabase } from '@/app/auth-actions';

export default function ClientRegistrationPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const updateField = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validation
        if (!formData.fullName.trim()) return setError('Please enter your full name');
        if (!formData.phone.trim()) return setError('Please enter your phone number');
        if (!formData.email.trim() || !formData.email.includes('@')) return setError('Please enter a valid email');
        if (formData.password.length < 6) return setError('Password must be at least 6 characters');
        if (formData.password !== formData.confirmPassword) return setError('Passwords do not match');

        setIsLoading(true);

        try {
            const supabase = createClient();

            // 1. Sign up with Supabase
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.fullName,
                        phone: formData.phone,
                        role: 'client'
                    }
                }
            });

            if (authError) {
                setError(authError.message);
                setIsLoading(false);
                return;
            }

            if (authData.user) {
                // 2. Sync user to local database immediately
                await syncUserFromSupabase(authData.user.id, {
                    email: formData.email,
                    full_name: formData.fullName,
                    phone: formData.phone,
                    role: 'client'
                });

                // 3. Redirect to home
                router.push('/');
                router.refresh();
            }
        } catch (err) {
            console.error('Registration failed:', err);
            setError('Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Header */}
            <div className="bg-white border-b px-4 py-3 sticky top-0 z-10">
                <div className="max-w-lg mx-auto flex items-center gap-3">
                    <button
                        onClick={() => router.back()}
                        className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <h1 className="font-semibold text-gray-900">Driver Registration</h1>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 max-w-lg mx-auto w-full p-6">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CarIcon className="w-8 h-8 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
                    <p className="text-gray-500 mt-1">Join to connect with mechanics</p>
                </div>

                {error && (
                    <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-red-600 text-sm">
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Full Name */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-1.5 block">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input
                                placeholder="John Kamau"
                                value={formData.fullName}
                                onChange={e => updateField('fullName', e.target.value)}
                                className="h-12 pl-10"
                            />
                        </div>
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-1.5 block">Phone Number</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input
                                placeholder="+254..."
                                value={formData.phone}
                                onChange={e => updateField('phone', e.target.value)}
                                className="h-12 pl-10"
                                type="tel"
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-1.5 block">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input
                                placeholder="you@example.com"
                                value={formData.email}
                                onChange={e => updateField('email', e.target.value)}
                                className="h-12 pl-10"
                                type="email"
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-1.5 block">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input
                                placeholder="At least 6 characters"
                                value={formData.password}
                                onChange={e => updateField('password', e.target.value)}
                                className="h-12 pl-10 pr-10"
                                type={showPassword ? 'text' : 'password'}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-1.5 block">Confirm Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input
                                placeholder="Re-enter password"
                                value={formData.confirmPassword}
                                onChange={e => updateField('confirmPassword', e.target.value)}
                                className="h-12 pl-10"
                                type={showPassword ? 'text' : 'password'}
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl mt-6 disabled:opacity-50"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Creating Account...
                            </>
                        ) : (
                            'Create Account'
                        )}
                    </Button>
                </form>

                <p className="text-center text-gray-500 text-sm mt-6">
                    Already have an account?{' '}
                    <Link href="/login" className="text-blue-600 font-medium hover:underline">
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
}

function CarIcon({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
            <circle cx="7" cy="17" r="2" />
            <path d="M9 17h6" />
            <circle cx="17" cy="17" r="2" />
        </svg>
    );
}

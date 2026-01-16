'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Mail, Lock, User, Phone, Eye, EyeOff, Loader2, AlertCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';
import { syncUserFromSupabase } from '@/app/auth-actions';

export default function ClientRegistrationPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [rateLimitSeconds, setRateLimitSeconds] = useState(0);

    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    // Countdown timer for rate limit
    useEffect(() => {
        if (rateLimitSeconds > 0) {
            const timer = setTimeout(() => {
                setRateLimitSeconds(prev => prev - 1);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [rateLimitSeconds]);

    const updateField = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (error && !rateLimitSeconds) {
            setError(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Don't submit if rate limited or already loading
        if (rateLimitSeconds > 0 || isLoading) return;

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
                // Check for rate limit error
                const rateLimitMatch = authError.message.match(/(\d+)\s*second/i);
                if (rateLimitMatch || authError.message.includes('security') || authError.status === 429) {
                    const seconds = rateLimitMatch ? parseInt(rateLimitMatch[1]) : 30;
                    setRateLimitSeconds(seconds);
                    setError(null); // Clear error, show countdown instead
                } else {
                    setError(authError.message);
                }
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

                // 3. Redirect to find mechanics
                router.push('/find');
                router.refresh();
            }
        } catch (err) {
            console.error('Registration failed:', err);
            setError('Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const isButtonDisabled = isLoading || rateLimitSeconds > 0;

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
                    <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CarIcon className="w-8 h-8 text-rose-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
                    <p className="text-gray-500 mt-1">Join to connect with mechanics</p>
                </div>

                {/* Rate Limit Warning */}
                {rateLimitSeconds > 0 && (
                    <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <Clock className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="font-medium text-amber-800">Please wait</p>
                                <p className="text-amber-600 text-sm">
                                    You can try again in <span className="font-bold">{rateLimitSeconds}</span> seconds
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {error && !rateLimitSeconds && (
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
                                disabled={isButtonDisabled}
                            />
                        </div>
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-1.5 block">Phone Number</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input
                                placeholder="0712 345 678"
                                value={formData.phone}
                                onChange={e => updateField('phone', e.target.value)}
                                className="h-12 pl-10"
                                type="tel"
                                disabled={isButtonDisabled}
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
                                disabled={isButtonDisabled}
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
                                disabled={isButtonDisabled}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                disabled={isButtonDisabled}
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
                                disabled={isButtonDisabled}
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={isButtonDisabled}
                        className="w-full h-12 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Creating Account...
                            </>
                        ) : rateLimitSeconds > 0 ? (
                            <>
                                <Clock className="w-5 h-5 mr-2" />
                                Wait {rateLimitSeconds}s
                            </>
                        ) : (
                            'Create Account'
                        )}
                    </Button>
                </form>

                <p className="text-center text-gray-500 text-sm mt-6">
                    Already have an account?{' '}
                    <Link href="/login" className="text-rose-600 font-medium hover:underline">
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

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft,
    ArrowRight,
    Check,
    User,
    Wrench,
    MapPin,
    Phone,
    Mail,
    Truck,
    AlertCircle,
    Lock,
    Eye,
    EyeOff,
    Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';
import { registerMechanic } from '@/app/mechanic-actions';

// Specialty options
const MECHANIC_SPECIALTIES = [
    'Engine Repair',
    'Brakes',
    'Electrical',
    'Transmission',
    'AC & Cooling',
    'Body Work',
    'Tires & Wheels',
    'Suspension',
    'Oil Change',
    'Diagnostics',
    'Diesel Engines',
    'Hybrid/Electric',
];

const BREAKDOWN_SPECIALTIES = [
    'Towing',
    'Battery Jump Start',
    'Tire Change',
    'Fuel Delivery',
    'Lockout Service',
    'Winching',
    'Roadside Repair',
];

type FormData = {
    // Step 1: Account (Email/Password)
    email: string;
    password: string;
    confirmPassword: string;

    // Step 2: Basic Info
    fullName: string;
    phone: string;

    // Step 3: Service Details
    serviceType: 'mechanic' | 'breakdown';
    specialties: string[];
    yearsExperience: string;
    businessName: string;

    // Step 4: Location & Pricing
    city: string;
    address: string;
    callOutFee: string;
    hourlyRate: string;
};

const initialFormData: FormData = {
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    serviceType: 'mechanic',
    specialties: [],
    yearsExperience: '',
    businessName: '',
    city: '',
    address: '',
    callOutFee: '',
    hourlyRate: '',
};

export default function MechanicRegistrationPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const totalSteps = 4;

    const updateField = (field: keyof FormData, value: string | string[]) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setError(null);
    };

    const toggleSpecialty = (specialty: string) => {
        setFormData(prev => ({
            ...prev,
            specialties: prev.specialties.includes(specialty)
                ? prev.specialties.filter(s => s !== specialty)
                : [...prev.specialties, specialty]
        }));
    };

    const validateStep = (): boolean => {
        switch (step) {
            case 1:
                if (!formData.email.trim() || !formData.email.includes('@')) {
                    setError('Please enter a valid email address');
                    return false;
                }
                if (formData.password.length < 6) {
                    setError('Password must be at least 6 characters');
                    return false;
                }
                if (formData.password !== formData.confirmPassword) {
                    setError('Passwords do not match');
                    return false;
                }
                return true;
            case 2:
                if (!formData.fullName.trim()) {
                    setError('Please enter your full name');
                    return false;
                }
                if (!formData.phone.trim() || formData.phone.length < 10) {
                    setError('Please enter a valid phone number');
                    return false;
                }
                return true;
            case 3:
                if (formData.specialties.length === 0) {
                    setError('Please select at least one specialty');
                    return false;
                }
                if (!formData.yearsExperience) {
                    setError('Please enter your years of experience');
                    return false;
                }
                return true;
            case 4:
                if (!formData.city.trim()) {
                    setError('Please enter your city');
                    return false;
                }
                if (!formData.address.trim()) {
                    setError('Please enter your address or area');
                    return false;
                }
                return true;
            default:
                return true;
        }
    };

    const nextStep = () => {
        if (validateStep()) {
            setStep(prev => Math.min(prev + 1, totalSteps + 1));
        }
    };

    const prevStep = () => {
        setStep(prev => Math.max(prev - 1, 1));
        setError(null);
    };

    const handleSubmit = async () => {
        if (!validateStep()) return;

        setIsSubmitting(true);
        setError(null);

        try {
            // Step 1: Create Supabase Auth user
            const supabase = createClient();

            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.fullName,
                        phone: formData.phone,
                        role: formData.serviceType,
                    }
                }
            });

            if (authError) {
                setError(authError.message);
                return;
            }

            if (!authData.user) {
                setError('Failed to create account. Please try again.');
                return;
            }

            // Step 2: Create mechanic profile in our database
            const result = await registerMechanic({
                userId: authData.user.id, // Pass Supabase ID
                email: formData.email,
                phone: formData.phone,
                fullName: formData.fullName,
                serviceType: formData.serviceType,
                businessName: formData.businessName || undefined,
                specialties: formData.specialties,
                yearsExperience: parseInt(formData.yearsExperience) || 0,
                city: formData.city,
                address: formData.address,
                lat: -1.2921,
                lng: 36.8219,
                callOutFee: parseInt(formData.callOutFee) || 0,
                hourlyRate: parseInt(formData.hourlyRate) || 0,
            });

            if (result.success) {
                setStep(totalSteps + 1); // Success step
            } else {
                setError(result.error || 'Failed to create profile. Please try again.');
            }
        } catch {
            setError('Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const specialties = formData.serviceType === 'mechanic'
        ? MECHANIC_SPECIALTIES
        : BREAKDOWN_SPECIALTIES;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-slate-900 sticky top-0 z-10">
                <div className="max-w-lg mx-auto px-4 py-4">
                    <div className="flex items-center gap-3">
                        {step <= totalSteps && (
                            <button
                                onClick={step === 1 ? () => router.back() : prevStep}
                                className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 text-white" />
                            </button>
                        )}
                        <div className="flex-1">
                            <h1 className="font-semibold text-white">
                                {step <= totalSteps ? 'Join eGarage' : 'Registration Complete'}
                            </h1>
                            {step <= totalSteps && (
                                <p className="text-sm text-gray-400">Step {step} of {totalSteps}</p>
                            )}
                        </div>
                    </div>

                    {/* Progress Bar */}
                    {step <= totalSteps && (
                        <div className="mt-4 flex gap-1">
                            {[1, 2, 3, 4].map(s => (
                                <div
                                    key={s}
                                    className={`h-1 flex-1 rounded-full transition-colors ${s <= step ? 'bg-orange-500' : 'bg-white/20'
                                        }`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="max-w-lg mx-auto px-4 py-6">
                {/* Error Message */}
                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-red-600 text-sm">
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                {/* Step 1: Account Setup */}
                {step === 1 && (
                    <div className="space-y-6">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Lock className="w-8 h-8 text-orange-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Create Account</h2>
                            <p className="text-gray-500 text-sm mt-1">Set up your login credentials</p>
                        </div>

                        <div className="space-y-4">
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
                                        autoComplete="email"
                                    />
                                </div>
                            </div>

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
                                        autoComplete="new-password"
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

                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Confirm Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <Input
                                        placeholder="Re-enter your password"
                                        value={formData.confirmPassword}
                                        onChange={e => updateField('confirmPassword', e.target.value)}
                                        className="h-12 pl-10"
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete="new-password"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Basic Info */}
                {step === 2 && (
                    <div className="space-y-6">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <User className="w-8 h-8 text-blue-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Personal Details</h2>
                            <p className="text-gray-500 text-sm mt-1">Tell us about yourself</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Full Name</label>
                                <Input
                                    placeholder="John Kamau"
                                    value={formData.fullName}
                                    onChange={e => updateField('fullName', e.target.value)}
                                    className="h-12"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Phone Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <Input
                                        placeholder="+254712345678"
                                        value={formData.phone}
                                        onChange={e => updateField('phone', e.target.value)}
                                        className="h-12 pl-10"
                                        type="tel"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: Service Details */}
                {step === 3 && (
                    <div className="space-y-6">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Wrench className="w-8 h-8 text-purple-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Service Details</h2>
                            <p className="text-gray-500 text-sm mt-1">What services do you offer?</p>
                        </div>

                        {/* Service Type Toggle */}
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-3 block">I am a...</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => {
                                        updateField('serviceType', 'mechanic');
                                        updateField('specialties', []);
                                    }}
                                    className={`p-4 rounded-xl border-2 transition-all ${formData.serviceType === 'mechanic'
                                        ? 'border-orange-500 bg-orange-50'
                                        : 'border-gray-200 bg-white'
                                        }`}
                                >
                                    <Wrench className={`w-6 h-6 mx-auto mb-2 ${formData.serviceType === 'mechanic' ? 'text-orange-600' : 'text-gray-400'
                                        }`} />
                                    <p className={`font-medium ${formData.serviceType === 'mechanic' ? 'text-orange-600' : 'text-gray-600'
                                        }`}>Mechanic</p>
                                </button>
                                <button
                                    onClick={() => {
                                        updateField('serviceType', 'breakdown');
                                        updateField('specialties', []);
                                    }}
                                    className={`p-4 rounded-xl border-2 transition-all ${formData.serviceType === 'breakdown'
                                        ? 'border-orange-500 bg-orange-50'
                                        : 'border-gray-200 bg-white'
                                        }`}
                                >
                                    <Truck className={`w-6 h-6 mx-auto mb-2 ${formData.serviceType === 'breakdown' ? 'text-orange-600' : 'text-gray-400'
                                        }`} />
                                    <p className={`font-medium ${formData.serviceType === 'breakdown' ? 'text-orange-600' : 'text-gray-600'
                                        }`}>Breakdown</p>
                                </button>
                            </div>
                        </div>

                        {/* Specialties */}
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-3 block">
                                Specialties (select all that apply)
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {specialties.map(specialty => (
                                    <button
                                        key={specialty}
                                        onClick={() => toggleSpecialty(specialty)}
                                        className={`px-3 py-2 rounded-full text-sm font-medium transition-all ${formData.specialties.includes(specialty)
                                            ? 'bg-orange-500 text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                    >
                                        {specialty}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Experience */}
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Years of Experience</label>
                            <Input
                                placeholder="5"
                                value={formData.yearsExperience}
                                onChange={e => updateField('yearsExperience', e.target.value)}
                                className="h-12"
                                type="number"
                                min="0"
                            />
                        </div>

                        {/* Business Name (Optional) */}
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                                Business Name <span className="text-gray-400">(optional)</span>
                            </label>
                            <Input
                                placeholder="e.g., John's Auto Repair"
                                value={formData.businessName}
                                onChange={e => updateField('businessName', e.target.value)}
                                className="h-12"
                            />
                        </div>
                    </div>
                )}

                {/* Step 4: Location & Pricing */}
                {step === 4 && (
                    <div className="space-y-6">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <MapPin className="w-8 h-8 text-green-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Location & Pricing</h2>
                            <p className="text-gray-500 text-sm mt-1">Where are you based?</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1.5 block">City</label>
                                <Input
                                    placeholder="Nairobi"
                                    value={formData.city}
                                    onChange={e => updateField('city', e.target.value)}
                                    className="h-12"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Address / Area</label>
                                <Input
                                    placeholder="e.g., Westlands, near Sarit Centre"
                                    value={formData.address}
                                    onChange={e => updateField('address', e.target.value)}
                                    className="h-12"
                                />
                            </div>

                            <div className="border-t pt-4 mt-4">
                                <p className="text-sm font-medium text-gray-700 mb-3">Pricing (optional)</p>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-gray-500 mb-1.5 block">Call-out Fee (KSh)</label>
                                        <Input
                                            placeholder="500"
                                            value={formData.callOutFee}
                                            onChange={e => updateField('callOutFee', e.target.value)}
                                            className="h-12"
                                            type="number"
                                            min="0"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 mb-1.5 block">Hourly Rate (KSh)</label>
                                        <Input
                                            placeholder="800"
                                            value={formData.hourlyRate}
                                            onChange={e => updateField('hourlyRate', e.target.value)}
                                            className="h-12"
                                            type="number"
                                            min="0"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Success Step */}
                {step > totalSteps && (
                    <div className="text-center py-12">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Check className="w-10 h-10 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Aboard!</h2>
                        <p className="text-gray-500 mb-2 max-w-xs mx-auto">
                            Your account has been created successfully.
                        </p>
                        <p className="text-sm text-orange-600 mb-8">
                            Please check your email to verify your account.
                        </p>

                        {/* Verification CTA */}
                        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5 mb-6 text-left">
                            <h3 className="font-semibold text-gray-900 mb-1">Get Verified</h3>
                            <p className="text-sm text-gray-600 mb-3">
                                Verified mechanics get more visibility and trust from drivers.
                            </p>
                            <Button
                                variant="outline"
                                className="w-full border-orange-500 text-orange-600 hover:bg-orange-50"
                                onClick={() => router.push('/dashboard/verification')}
                            >
                                Apply for Verification
                            </Button>
                        </div>

                        <Button
                            className="w-full bg-slate-900 hover:bg-slate-800 h-12"
                            onClick={() => router.push('/login')}
                        >
                            Go to Login
                        </Button>
                    </div>
                )}

                {/* Navigation Buttons */}
                {step <= totalSteps && (
                    <div className="mt-8">
                        {step < totalSteps ? (
                            <Button
                                onClick={nextStep}
                                className="w-full bg-orange-500 hover:bg-orange-600 h-12 text-base"
                            >
                                Continue
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                        ) : (
                            <Button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="w-full bg-orange-500 hover:bg-orange-600 h-12 text-base disabled:opacity-50"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Creating Account...
                                    </>
                                ) : (
                                    'Create Account'
                                )}
                            </Button>
                        )}

                        {step === 1 && (
                            <p className="text-center text-gray-500 text-sm mt-4">
                                Already have an account?{' '}
                                <a href="/login" className="text-orange-600 font-medium hover:underline">
                                    Sign in
                                </a>
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
    getVerificationStatus,
    submitVerificationRequest
} from '@/app/mechanic-actions';
import {
    initiateVerificationPayment,
    checkPaymentStatus
} from '@/app/payment-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    ArrowLeft,
    Upload,
    FileText,
    Shield,
    CheckCircle2,
    Clock,
    XCircle,
    Loader2,
    AlertCircle,
    CreditCard,
    Phone,
    Smartphone
} from 'lucide-react';

type VerificationStatus = 'none' | 'pending' | 'approved' | 'rejected';
type PaymentStatus = 'idle' | 'initiating' | 'awaiting' | 'completed' | 'failed';

export default function VerifyPage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();

    const [status, setStatus] = useState<VerificationStatus>('none');
    const [rejectionReason, setRejectionReason] = useState<string | null>(null);
    const [verifiedUntil, setVerifiedUntil] = useState<string | null>(null);
    const [verificationRequestId, setVerificationRequestId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Payment state
    const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [checkoutRequestId, setCheckoutRequestId] = useState<string | null>(null);
    const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // File state
    const [nationalIdFile, setNationalIdFile] = useState<File | null>(null);
    const [permitFile, setPermitFile] = useState<File | null>(null);
    const [nationalIdPreview, setNationalIdPreview] = useState<string | null>(null);
    const [permitPreview, setPermitPreview] = useState<string | null>(null);

    const nationalIdRef = useRef<HTMLInputElement>(null);
    const permitRef = useRef<HTMLInputElement>(null);

    // Load verification status
    useEffect(() => {
        async function loadStatus() {
            if (user?.id) {
                setPhoneNumber(user.phone || '');

                const result = await getVerificationStatus(user.id);
                if (result.success) {
                    if (result.isVerified) {
                        setStatus('approved');
                        setVerifiedUntil(result.latestRequest?.verifiedUntil || null);
                    } else if (result.latestRequest) {
                        setStatus(result.latestRequest.status as VerificationStatus);
                        setVerificationRequestId(result.latestRequest.id);
                        if (result.latestRequest.status === 'rejected') {
                            setRejectionReason(result.latestRequest.adminNotes || 'No reason provided');
                        }
                    }
                }
                setIsLoading(false);
            }
        }

        if (!authLoading) {
            if (!user) {
                router.push('/login');
            } else if (user.role !== 'mechanic' && user.role !== 'breakdown') {
                router.push('/profile');
            } else {
                loadStatus();
            }
        }
    }, [user, authLoading, router]);

    // Cleanup polling on unmount
    useEffect(() => {
        return () => {
            if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
            }
        };
    }, []);

    const handleFileSelect = (
        e: React.ChangeEvent<HTMLInputElement>,
        type: 'id' | 'permit'
    ) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
                setError('Please upload an image or PDF file');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                setError('File must be less than 5MB');
                return;
            }

            setError(null);
            const previewUrl = file.type.startsWith('image/')
                ? URL.createObjectURL(file)
                : null;

            if (type === 'id') {
                setNationalIdFile(file);
                setNationalIdPreview(previewUrl);
            } else {
                setPermitFile(file);
                setPermitPreview(previewUrl);
            }
        }
    };

    const handleSubmit = async () => {
        if (!user?.id) return;
        if (!nationalIdFile) {
            setError('National ID is required');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const nationalIdUrl = `uploads/${user.id}/national-id-${Date.now()}`;
            const permitUrl = permitFile ? `uploads/${user.id}/permit-${Date.now()}` : undefined;

            const result = await submitVerificationRequest(user.id, {
                nationalIdUrl,
                businessPermitUrl: permitUrl,
                planType: 'basic'
            });

            if (result.success) {
                setStatus('pending');
            } else {
                setError(result.error || 'Failed to submit');
            }
        } catch {
            setError('Failed to submit verification request');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInitiatePayment = async () => {
        if (!user?.id || !verificationRequestId || !phoneNumber) {
            setError('Phone number is required');
            return;
        }

        setPaymentStatus('initiating');
        setError(null);

        const result = await initiateVerificationPayment(
            user.id,
            phoneNumber,
            verificationRequestId
        );

        if (result.success && result.checkoutRequestId) {
            setCheckoutRequestId(result.checkoutRequestId);
            setPaymentStatus('awaiting');

            // Start polling for payment status
            pollIntervalRef.current = setInterval(async () => {
                const statusResult = await checkPaymentStatus(result.checkoutRequestId!);

                if (statusResult.success) {
                    if (statusResult.status === 'completed') {
                        setPaymentStatus('completed');
                        if (pollIntervalRef.current) {
                            clearInterval(pollIntervalRef.current);
                        }
                        // Reload page to update verified state
                        window.location.reload();
                    } else if (statusResult.status === 'failed') {
                        setPaymentStatus('failed');
                        setError('Payment was cancelled or failed. Please try again.');
                        if (pollIntervalRef.current) {
                            clearInterval(pollIntervalRef.current);
                        }
                    }
                }
            }, 5000); // Poll every 5 seconds

            // Stop polling after 2 minutes
            setTimeout(() => {
                if (pollIntervalRef.current) {
                    clearInterval(pollIntervalRef.current);
                    if (paymentStatus === 'awaiting') {
                        setPaymentStatus('idle');
                        setError('Payment timeout. Please try again.');
                    }
                }
            }, 120000);
        } else {
            setPaymentStatus('idle');
            setError(result.error || 'Failed to initiate payment');
        }
    };

    if (isLoading || authLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
        );
    }

    // Check if user is verified (has paid)
    const isFullyVerified = user?.isVerified && verifiedUntil;
    // Admin approved but not yet paid
    const needsPayment = status === 'approved' && !isFullyVerified;

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Header */}
            <div className="bg-slate-900">
                <div className="max-w-lg mx-auto px-4 pt-4 pb-6">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.back()}
                            className="p-2 -ml-2 hover:bg-white/10 rounded-full"
                        >
                            <ArrowLeft className="w-5 h-5 text-white" />
                        </button>
                        <h1 className="font-bold text-xl text-white">Get Verified</h1>
                    </div>
                </div>
            </div>

            <div className="max-w-lg mx-auto px-4 py-6 space-y-6">

                {/* Fully Verified */}
                {isFullyVerified && (
                    <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-start gap-3">
                        <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-semibold text-green-800">You&apos;re Verified!</p>
                            <p className="text-sm text-green-600 mt-1">
                                Your verification is active until {new Date(verifiedUntil).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                )}

                {/* Payment Completed */}
                {paymentStatus === 'completed' && (
                    <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-start gap-3">
                        <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-semibold text-green-800">Payment Successful!</p>
                            <p className="text-sm text-green-600 mt-1">
                                Your verification badge has been activated.
                            </p>
                        </div>
                    </div>
                )}

                {/* Needs Payment - Admin approved, awaiting payment */}
                {needsPayment && paymentStatus !== 'completed' && (
                    <>
                        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
                            <Shield className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-semibold text-blue-800">Documents Approved!</p>
                                <p className="text-sm text-blue-600 mt-1">
                                    Complete payment to activate your verified badge.
                                </p>
                            </div>
                        </div>

                        {/* Payment Card */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <CreditCard className="w-5 h-5 text-orange-500" />
                                    <h3 className="font-semibold text-gray-900">Finalize Payment</h3>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-orange-600">KSh 100</p>
                                    <p className="text-xs text-gray-500">/month</p>
                                </div>
                            </div>

                            {/* Phone Number Input */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                                    <Phone className="w-4 h-4" />
                                    M-Pesa Phone Number
                                </label>
                                <Input
                                    type="tel"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    placeholder="0712345678"
                                    className="text-lg"
                                    disabled={paymentStatus === 'awaiting' || paymentStatus === 'initiating'}
                                />
                                <p className="text-xs text-gray-500">
                                    You&apos;ll receive an M-Pesa prompt on this number
                                </p>
                            </div>

                            {/* Payment Status */}
                            {paymentStatus === 'awaiting' && (
                                <div className="bg-amber-50 rounded-xl p-4 flex items-center gap-3">
                                    <Smartphone className="w-8 h-8 text-amber-600 animate-pulse" />
                                    <div>
                                        <p className="font-medium text-amber-800">Check your phone</p>
                                        <p className="text-sm text-amber-600">
                                            Enter your M-Pesa PIN to complete payment
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Error */}
                            {error && (
                                <div className="flex items-center gap-2 text-red-500 text-sm">
                                    <AlertCircle className="w-4 h-4" />
                                    {error}
                                </div>
                            )}

                            {/* Pay Button */}
                            <Button
                                onClick={handleInitiatePayment}
                                disabled={
                                    paymentStatus === 'initiating' ||
                                    paymentStatus === 'awaiting' ||
                                    !phoneNumber
                                }
                                className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg"
                            >
                                {paymentStatus === 'initiating' ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                        Initiating...
                                    </>
                                ) : paymentStatus === 'awaiting' ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                        Waiting for payment...
                                    </>
                                ) : (
                                    <>
                                        <CreditCard className="w-5 h-5 mr-2" />
                                        Pay with M-Pesa
                                    </>
                                )}
                            </Button>
                        </div>
                    </>
                )}

                {/* Pending Review */}
                {status === 'pending' && (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                        <Clock className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-semibold text-amber-800">Under Review</p>
                            <p className="text-sm text-amber-600 mt-1">
                                Your documents are being reviewed. This usually takes 1-2 business days.
                            </p>
                        </div>
                    </div>
                )}

                {/* Rejected */}
                {status === 'rejected' && (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
                        <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-semibold text-red-800">Verification Rejected</p>
                            <p className="text-sm text-red-600 mt-1">{rejectionReason}</p>
                            <p className="text-sm text-red-600 mt-2">
                                Please re-submit with corrected documents.
                            </p>
                        </div>
                    </div>
                )}

                {/* Upload Form - Only for none/rejected */}
                {(status === 'none' || status === 'rejected') && (
                    <>
                        {/* Pricing */}
                        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-semibold text-gray-900">Verification Fee</p>
                                    <p className="text-sm text-gray-600">Monthly subscription</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-orange-600">KSh 100</p>
                                    <p className="text-xs text-gray-500">/month</p>
                                </div>
                            </div>
                        </div>

                        {/* Benefits */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-4">
                            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <Shield className="w-5 h-5 text-orange-500" />
                                Why Get Verified?
                            </h3>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                    Verified badge on your profile
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                    Higher trust from drivers
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                    Priority in search results
                                </li>
                            </ul>
                        </div>

                        {/* National ID Upload */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-4">
                            <h3 className="font-semibold text-gray-900 mb-3">
                                National ID <span className="text-red-500">*</span>
                            </h3>
                            <input
                                ref={nationalIdRef}
                                type="file"
                                accept="image/*,.pdf"
                                onChange={(e) => handleFileSelect(e, 'id')}
                                className="hidden"
                            />
                            {nationalIdFile ? (
                                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                                    {nationalIdPreview ? (
                                        <img src={nationalIdPreview} alt="ID" className="w-16 h-16 object-cover rounded-lg" />
                                    ) : (
                                        <FileText className="w-10 h-10 text-green-600" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 truncate">{nationalIdFile.name}</p>
                                        <p className="text-xs text-gray-500">{(nationalIdFile.size / 1024).toFixed(0)} KB</p>
                                    </div>
                                    <button
                                        onClick={() => nationalIdRef.current?.click()}
                                        className="text-sm text-orange-500 font-medium"
                                    >
                                        Change
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => nationalIdRef.current?.click()}
                                    className="w-full p-6 border-2 border-dashed border-gray-200 rounded-xl text-center hover:border-orange-300 hover:bg-orange-50 transition-colors"
                                >
                                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm text-gray-600">Tap to upload National ID</p>
                                    <p className="text-xs text-gray-400 mt-1">Image or PDF, max 5MB</p>
                                </button>
                            )}
                        </div>

                        {/* Business Permit Upload */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-4">
                            <h3 className="font-semibold text-gray-900 mb-3">
                                Business Permit <span className="text-gray-400 font-normal">(optional)</span>
                            </h3>
                            <input
                                ref={permitRef}
                                type="file"
                                accept="image/*,.pdf"
                                onChange={(e) => handleFileSelect(e, 'permit')}
                                className="hidden"
                            />
                            {permitFile ? (
                                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                                    {permitPreview ? (
                                        <img src={permitPreview} alt="Permit" className="w-16 h-16 object-cover rounded-lg" />
                                    ) : (
                                        <FileText className="w-10 h-10 text-green-600" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 truncate">{permitFile.name}</p>
                                        <p className="text-xs text-gray-500">{(permitFile.size / 1024).toFixed(0)} KB</p>
                                    </div>
                                    <button
                                        onClick={() => permitRef.current?.click()}
                                        className="text-sm text-orange-500 font-medium"
                                    >
                                        Change
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => permitRef.current?.click()}
                                    className="w-full p-6 border-2 border-dashed border-gray-200 rounded-xl text-center hover:border-orange-300 hover:bg-orange-50 transition-colors"
                                >
                                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm text-gray-600">Tap to upload Business Permit</p>
                                    <p className="text-xs text-gray-400 mt-1">Image or PDF, max 5MB</p>
                                </button>
                            )}
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="flex items-center gap-2 text-red-500 text-sm">
                                <AlertCircle className="w-4 h-4" />
                                {error}
                            </div>
                        )}

                        {/* Submit Button */}
                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting || !nationalIdFile}
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-6 text-lg"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <Shield className="w-5 h-5 mr-2" />
                                    Submit for Review
                                </>
                            )}
                        </Button>

                        <p className="text-xs text-center text-gray-400">
                            Your documents will be reviewed within 1-2 business days.
                            Payment of KSh 100 will be collected after approval.
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}

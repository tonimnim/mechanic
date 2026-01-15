'use server';

import prisma from '@/lib/prisma';
import { initiateSTKPush, querySTKPushStatus, formatPhoneNumber } from '@/lib/mpesa';

const VERIFICATION_FEE = 100; // KSh 100/month

/**
 * Initiate M-Pesa payment for verification
 */
export async function initiateVerificationPayment(
    userId: string,
    phoneNumber: string,
    verificationRequestId: string
): Promise<{ success: boolean; checkoutRequestId?: string; error?: string }> {
    try {
        // Validate user exists and has pending verification
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                verificationRequests: {
                    where: { id: verificationRequestId },
                    take: 1
                }
            }
        });

        if (!user) {
            return { success: false, error: 'User not found' };
        }

        const request = user.verificationRequests[0];
        if (!request) {
            return { success: false, error: 'Verification request not found' };
        }

        if (request.status !== 'approved') {
            return { success: false, error: 'Verification must be approved by admin first' };
        }

        // Check for existing pending payment
        const existingPayment = await prisma.payment.findFirst({
            where: {
                userId,
                verificationRequestId,
                status: 'pending'
            }
        });

        if (existingPayment) {
            // Return existing checkout ID for polling
            return {
                success: true,
                checkoutRequestId: existingPayment.checkoutRequestId || undefined
            };
        }

        // Initiate STK Push
        const stkResult = await initiateSTKPush({
            phoneNumber: formatPhoneNumber(phoneNumber),
            amount: VERIFICATION_FEE,
            accountReference: `MF-${userId.substring(0, 8)}`,
            transactionDesc: 'eGarage Verification'
        });

        if (!stkResult.success) {
            return { success: false, error: stkResult.error };
        }

        // Create payment record
        await prisma.payment.create({
            data: {
                userId,
                phoneNumber: formatPhoneNumber(phoneNumber),
                amount: VERIFICATION_FEE,
                merchantRequestId: stkResult.merchantRequestId,
                checkoutRequestId: stkResult.checkoutRequestId,
                verificationRequestId,
                status: 'pending'
            }
        });

        return {
            success: true,
            checkoutRequestId: stkResult.checkoutRequestId
        };
    } catch (error) {
        console.error('Payment initiation error:', error);
        return { success: false, error: 'Failed to initiate payment' };
    }
}

/**
 * Check payment status by polling M-Pesa
 */
export async function checkPaymentStatus(
    checkoutRequestId: string
): Promise<{
    success: boolean;
    status?: 'pending' | 'completed' | 'failed';
    error?: string
}> {
    try {
        // First check our database
        const payment = await prisma.payment.findFirst({
            where: { checkoutRequestId }
        });

        if (!payment) {
            return { success: false, error: 'Payment not found' };
        }

        // If already completed or failed, return that
        if (payment.status === 'completed') {
            return { success: true, status: 'completed' };
        }
        if (payment.status === 'failed') {
            return { success: true, status: 'failed' };
        }

        // Query M-Pesa for status
        const queryResult = await querySTKPushStatus(checkoutRequestId);

        if (queryResult.success && queryResult.resultCode !== undefined) {
            const resultCode = queryResult.resultCode;
            const isSuccess = resultCode === '0';

            // These result codes indicate final failure (user cancelled or STK timeout)
            // 1032 = Transaction cancelled by user
            // 1037 = STK Push timeout (user didn't respond in time on their phone)
            const isFinalFailure = ['1032', '1037'].includes(resultCode);

            if (isSuccess) {
                // Payment successful - update records
                await prisma.$transaction(async (tx) => {
                    await tx.payment.update({
                        where: { id: payment.id },
                        data: {
                            status: 'completed',
                            resultCode: queryResult.resultCode,
                            resultDesc: queryResult.resultDesc,
                            paidAt: new Date()
                        }
                    });

                    // Activate verification
                    if (payment.verificationRequestId) {
                        const verifiedUntil = new Date();
                        verifiedUntil.setMonth(verifiedUntil.getMonth() + 1);

                        await tx.verificationRequest.update({
                            where: { id: payment.verificationRequestId },
                            data: { verifiedUntil }
                        });

                        await tx.user.update({
                            where: { id: payment.userId },
                            data: { isVerified: true }
                        });
                    }
                });

                return { success: true, status: 'completed' };
            } else if (isFinalFailure) {
                // User cancelled or STK timed out - mark as failed
                await prisma.payment.update({
                    where: { id: payment.id },
                    data: {
                        status: 'failed',
                        resultCode: queryResult.resultCode,
                        resultDesc: queryResult.resultDesc
                    }
                });

                return { success: true, status: 'failed' };
            }
            // For other result codes (e.g. transaction still pending), continue polling
        }

        // Still pending - M-Pesa query failed or returned non-final result
        return { success: true, status: 'pending' };
    } catch (error) {
        console.error('Payment status check error:', error);
        return { success: false, error: 'Failed to check payment status' };
    }
}

/**
 * Get user's verification payment status
 */
export async function getVerificationPaymentStatus(
    userId: string
): Promise<{
    success: boolean;
    hasPaid?: boolean;
    isVerified?: boolean;
    verifiedUntil?: string;
    error?: string
}> {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                verificationRequests: {
                    where: { status: 'approved' },
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            }
        });

        if (!user) {
            return { success: false, error: 'User not found' };
        }

        const latestRequest = user.verificationRequests[0];

        return {
            success: true,
            isVerified: user.isVerified,
            hasPaid: !!latestRequest?.verifiedUntil,
            verifiedUntil: latestRequest?.verifiedUntil?.toISOString()
        };
    } catch (error) {
        console.error('Get payment status error:', error);
        return { success: false, error: 'Failed to get status' };
    }
}

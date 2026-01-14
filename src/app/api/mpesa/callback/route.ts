import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MPesaCallbackBody, parseCallbackMetadata } from '@/lib/mpesa';

/**
 * M-Pesa Callback Handler
 * Receives payment confirmations from Safaricom
 */
export async function POST(request: NextRequest) {
    try {
        const body: MPesaCallbackBody = await request.json();

        console.log('M-Pesa Callback received:', JSON.stringify(body, null, 2));

        const callback = body.Body.stkCallback;
        const parsed = parseCallbackMetadata(callback);

        // Find the payment by checkoutRequestId
        const payment = await prisma.payment.findFirst({
            where: { checkoutRequestId: parsed.checkoutRequestId }
        });

        if (!payment) {
            console.error('Payment not found for checkoutRequestId:', parsed.checkoutRequestId);
            // Still return 200 to M-Pesa to acknowledge receipt
            return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' });
        }

        // Check if payment was successful (ResultCode 0 = success)
        const isSuccess = parsed.resultCode === 0;

        if (isSuccess) {
            // Update payment record
            await prisma.payment.update({
                where: { id: payment.id },
                data: {
                    status: 'completed',
                    resultCode: String(parsed.resultCode),
                    resultDesc: parsed.resultDesc,
                    mpesaReceiptNumber: parsed.mpesaReceiptNumber,
                    paidAt: new Date()
                }
            });

            // Activate verification
            if (payment.verificationRequestId) {
                const verifiedUntil = new Date();
                verifiedUntil.setMonth(verifiedUntil.getMonth() + 1);

                await prisma.verificationRequest.update({
                    where: { id: payment.verificationRequestId },
                    data: { verifiedUntil }
                });

                // Mark user as verified
                await prisma.user.update({
                    where: { id: payment.userId },
                    data: { isVerified: true }
                });
            }

            console.log('Payment completed successfully:', parsed.mpesaReceiptNumber);
        } else {
            // Payment failed or cancelled
            await prisma.payment.update({
                where: { id: payment.id },
                data: {
                    status: 'failed',
                    resultCode: String(parsed.resultCode),
                    resultDesc: parsed.resultDesc
                }
            });

            console.log('Payment failed:', parsed.resultDesc);
        }

        // Always return success to M-Pesa
        return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' });
    } catch (error) {
        console.error('Callback processing error:', error);
        // Return success to prevent M-Pesa from retrying
        return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' });
    }
}

// Handle GET requests (for testing)
export async function GET() {
    return NextResponse.json({ status: 'M-Pesa callback endpoint active' });
}

/**
 * M-Pesa Daraja API Wrapper
 * Handles STK Push (Lipa Na M-Pesa Online) for Till/Buy Goods
 */

// Environment variables
const CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY!;
const CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET!;
const PASSKEY = process.env.MPESA_PASSKEY!;
const SHORTCODE = process.env.MPESA_SHORTCODE!;
const CALLBACK_URL = process.env.MPESA_CALLBACK_URL!;
const ENV = process.env.MPESA_ENV || 'sandbox';

// API Base URLs
const BASE_URL = ENV === 'production'
    ? 'https://api.safaricom.co.ke'
    : 'https://sandbox.safaricom.co.ke';

/**
 * Get OAuth access token from Daraja
 */
export async function getAccessToken(): Promise<string> {
    const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');

    const response = await fetch(`${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
        method: 'GET',
        headers: {
            'Authorization': `Basic ${auth}`,
        },
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to get access token: ${error}`);
    }

    const data = await response.json();
    return data.access_token;
}

/**
 * Generate timestamp in format YYYYMMDDHHmmss
 */
function getTimestamp(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

/**
 * Generate password for STK Push
 * Password = Base64(Shortcode + Passkey + Timestamp)
 */
function generatePassword(timestamp: string): string {
    return Buffer.from(`${SHORTCODE}${PASSKEY}${timestamp}`).toString('base64');
}

/**
 * Format phone number for M-Pesa API
 * Converts 0712345678 or +254712345678 to 254712345678
 */
export function formatPhoneNumber(phone: string): string {
    // Remove spaces and special characters
    let cleaned = phone.replace(/[\s\-\(\)]/g, '');

    // Handle different formats
    if (cleaned.startsWith('+254')) {
        cleaned = cleaned.substring(1);
    } else if (cleaned.startsWith('0')) {
        cleaned = '254' + cleaned.substring(1);
    } else if (!cleaned.startsWith('254')) {
        cleaned = '254' + cleaned;
    }

    return cleaned;
}

export interface STKPushRequest {
    phoneNumber: string;  // Customer phone (will be formatted)
    amount: number;       // Amount in KSh
    accountReference: string;  // Reference shown to customer
    transactionDesc: string;   // Description
}

export interface STKPushResponse {
    success: boolean;
    merchantRequestId?: string;
    checkoutRequestId?: string;
    responseDescription?: string;
    error?: string;
}

/**
 * Initiate STK Push (Lipa Na M-Pesa Online)
 * Sends prompt to customer's phone
 */
export async function initiateSTKPush(request: STKPushRequest): Promise<STKPushResponse> {
    try {
        const accessToken = await getAccessToken();
        const timestamp = getTimestamp();
        const password = generatePassword(timestamp);
        const formattedPhone = formatPhoneNumber(request.phoneNumber);

        const payload = {
            BusinessShortCode: SHORTCODE,
            Password: password,
            Timestamp: timestamp,
            TransactionType: 'CustomerPayBillOnline', // For Paybill Number (174379 sandbox)
            Amount: request.amount,
            PartyA: formattedPhone,  // Customer's phone
            PartyB: SHORTCODE,       // Till Number
            PhoneNumber: formattedPhone,
            CallBackURL: CALLBACK_URL,
            AccountReference: request.accountReference,
            TransactionDesc: request.transactionDesc,
        };

        const response = await fetch(`${BASE_URL}/mpesa/stkpush/v1/processrequest`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (data.ResponseCode === '0') {
            return {
                success: true,
                merchantRequestId: data.MerchantRequestID,
                checkoutRequestId: data.CheckoutRequestID,
                responseDescription: data.ResponseDescription,
            };
        } else {
            return {
                success: false,
                error: data.ResponseDescription || data.errorMessage || 'STK Push failed',
            };
        }
    } catch (error) {
        console.error('STK Push error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

export interface STKQueryResponse {
    success: boolean;
    resultCode?: string;
    resultDesc?: string;
    error?: string;
}

/**
 * Query STK Push status
 * Check if customer completed the payment
 */
export async function querySTKPushStatus(checkoutRequestId: string): Promise<STKQueryResponse> {
    try {
        const accessToken = await getAccessToken();
        const timestamp = getTimestamp();
        const password = generatePassword(timestamp);

        const payload = {
            BusinessShortCode: SHORTCODE,
            Password: password,
            Timestamp: timestamp,
            CheckoutRequestID: checkoutRequestId,
        };

        const response = await fetch(`${BASE_URL}/mpesa/stkpushquery/v1/query`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (data.ResponseCode === '0') {
            return {
                success: true,
                resultCode: data.ResultCode,
                resultDesc: data.ResultDesc,
            };
        } else {
            return {
                success: false,
                error: data.ResponseDescription || data.errorMessage || 'Query failed',
            };
        }
    } catch (error) {
        console.error('STK Query error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

/**
 * M-Pesa Callback payload types
 */
export interface MPesaCallbackBody {
    Body: {
        stkCallback: {
            MerchantRequestID: string;
            CheckoutRequestID: string;
            ResultCode: number;
            ResultDesc: string;
            CallbackMetadata?: {
                Item: Array<{
                    Name: string;
                    Value: string | number;
                }>;
            };
        };
    };
}

/**
 * Parse callback metadata to extract transaction details
 */
export function parseCallbackMetadata(callback: MPesaCallbackBody['Body']['stkCallback']) {
    const metadata = callback.CallbackMetadata?.Item || [];

    const getValue = (name: string) => {
        const item = metadata.find(m => m.Name === name);
        return item?.Value;
    };

    return {
        merchantRequestId: callback.MerchantRequestID,
        checkoutRequestId: callback.CheckoutRequestID,
        resultCode: callback.ResultCode,
        resultDesc: callback.ResultDesc,
        // These are only present if payment succeeded (ResultCode === 0)
        amount: getValue('Amount') as number | undefined,
        mpesaReceiptNumber: getValue('MpesaReceiptNumber') as string | undefined,
        transactionDate: getValue('TransactionDate') as string | undefined,
        phoneNumber: getValue('PhoneNumber') as string | undefined,
    };
}

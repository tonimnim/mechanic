import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
    title: "Terms of Service",
    description: "eGarage Kenya Terms of Service - Read our terms and conditions for using our mechanic finder platform and services.",
    alternates: {
        canonical: "/terms"
    }
};

export default function TermsOfServicePage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <div className="bg-slate-900 py-16">
                <div className="container mx-auto px-6">
                    <Link href="/" className="inline-flex items-center text-slate-400 hover:text-white mb-6 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Home
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-rose-600 rounded-xl">
                            <FileText className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl lg:text-4xl font-bold text-white">Terms of Service</h1>
                            <p className="text-slate-400 mt-1">Last updated: January 2026</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-6 py-12 lg:py-16">
                <div className="max-w-3xl mx-auto">

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Acceptance of Terms</h2>
                        <p className="text-slate-600 leading-relaxed">
                            By accessing or using eGarage Kenya ("Platform"), you agree to be bound by these Terms of Service.
                            If you do not agree to these terms, please do not use our services. We reserve the right to modify
                            these terms at any time, and your continued use constitutes acceptance of any changes.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Description of Service</h2>
                        <p className="text-slate-600 leading-relaxed mb-4">
                            eGarage Kenya is a platform that connects vehicle owners ("Drivers" or "Clients") with automotive
                            service providers ("Mechanics"). We provide:
                        </p>
                        <ul className="list-disc pl-6 text-slate-600 space-y-2">
                            <li>A directory of verified mechanics and breakdown service providers</li>
                            <li>In-app messaging for communication between drivers and mechanics</li>
                            <li>Payment processing via M-Pesa integration</li>
                            <li>Ratings and reviews system</li>
                            <li>Mechanic verification services</li>
                        </ul>
                        <p className="text-slate-600 leading-relaxed mt-4">
                            <strong>Important:</strong> eGarage is a marketplace platform. We do not employ mechanics or
                            perform automotive services directly. All services are provided by independent mechanics.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">3. User Accounts</h2>
                        <h3 className="text-lg font-semibold text-slate-800 mb-2">3.1 Registration</h3>
                        <p className="text-slate-600 leading-relaxed mb-4">
                            To use certain features, you must create an account. You agree to provide accurate, current,
                            and complete information and to keep this information updated.
                        </p>
                        <h3 className="text-lg font-semibold text-slate-800 mb-2">3.2 Account Security</h3>
                        <p className="text-slate-600 leading-relaxed mb-4">
                            You are responsible for maintaining the confidentiality of your account credentials.
                            Notify us immediately of any unauthorized use of your account.
                        </p>
                        <h3 className="text-lg font-semibold text-slate-800 mb-2">3.3 Account Termination</h3>
                        <p className="text-slate-600 leading-relaxed">
                            We reserve the right to suspend or terminate accounts that violate these terms or engage in
                            fraudulent, abusive, or illegal activities.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Mechanic Terms</h2>
                        <p className="text-slate-600 leading-relaxed mb-4">If you register as a mechanic, you agree to:</p>
                        <ul className="list-disc pl-6 text-slate-600 space-y-2">
                            <li>Provide accurate information about your qualifications, services, and pricing</li>
                            <li>Maintain valid business licenses and certifications as required by Kenyan law</li>
                            <li>Respond to client inquiries in a timely and professional manner</li>
                            <li>Perform services with reasonable skill and care</li>
                            <li>Honor quoted prices unless additional work is approved by the client</li>
                            <li>Submit valid documentation for verification when requested</li>
                            <li>Carry appropriate insurance for your services</li>
                        </ul>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Client Terms</h2>
                        <p className="text-slate-600 leading-relaxed mb-4">If you use the platform as a driver/client, you agree to:</p>
                        <ul className="list-disc pl-6 text-slate-600 space-y-2">
                            <li>Provide accurate information about your vehicle and service needs</li>
                            <li>Pay for services as agreed with the mechanic</li>
                            <li>Treat mechanics with respect and professionalism</li>
                            <li>Provide honest ratings and reviews based on actual experiences</li>
                            <li>Not engage in fraudulent or deceptive practices</li>
                        </ul>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">6. Payments</h2>
                        <p className="text-slate-600 leading-relaxed mb-4">
                            Payments for services are processed through M-Pesa. By using our payment features, you agree to:
                        </p>
                        <ul className="list-disc pl-6 text-slate-600 space-y-2">
                            <li>Pay the agreed-upon amount for services rendered</li>
                            <li>Safaricom/M-Pesa terms and conditions for transactions</li>
                            <li>Any applicable transaction fees</li>
                        </ul>
                        <p className="text-slate-600 leading-relaxed mt-4">
                            eGarage may charge a platform fee for certain transactions. These fees will be clearly
                            disclosed before you confirm payment.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">7. Verification Badge</h2>
                        <p className="text-slate-600 leading-relaxed">
                            Mechanics may apply for a "Verified" badge by submitting documentation for review.
                            The badge indicates that a mechanic has passed our verification process, which may include
                            identity verification, license checks, and business registration confirmation. The verification
                            badge is not a guarantee of service quality. Mechanics must pay a verification fee and
                            maintain valid documentation to keep their verified status.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">8. Reviews and Ratings</h2>
                        <p className="text-slate-600 leading-relaxed mb-4">Users may leave reviews and ratings. You agree that reviews:</p>
                        <ul className="list-disc pl-6 text-slate-600 space-y-2">
                            <li>Must be honest, accurate, and based on actual experiences</li>
                            <li>Must not contain abusive, defamatory, or illegal content</li>
                            <li>Must not be exchanged for payment or incentives</li>
                            <li>May be removed if they violate these terms</li>
                        </ul>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">9. Prohibited Conduct</h2>
                        <p className="text-slate-600 leading-relaxed mb-4">You agree not to:</p>
                        <ul className="list-disc pl-6 text-slate-600 space-y-2">
                            <li>Use the platform for any illegal purpose</li>
                            <li>Impersonate another person or entity</li>
                            <li>Post false, misleading, or fraudulent content</li>
                            <li>Harass, abuse, or threaten other users</li>
                            <li>Attempt to circumvent platform fees by taking transactions offline</li>
                            <li>Scrape, copy, or reproduce platform content without permission</li>
                            <li>Upload malware or attempt to compromise platform security</li>
                        </ul>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">10. Limitation of Liability</h2>
                        <p className="text-slate-600 leading-relaxed">
                            eGarage Kenya is a marketplace platform and is not responsible for the actions, services,
                            or quality of work provided by mechanics. We do not guarantee the availability, quality,
                            or safety of any services. To the maximum extent permitted by law, eGarage shall not be
                            liable for any indirect, incidental, special, consequential, or punitive damages arising
                            from your use of the platform.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">11. Dispute Resolution</h2>
                        <p className="text-slate-600 leading-relaxed">
                            Any disputes arising from these terms or your use of the platform shall be resolved through
                            good-faith negotiation. If negotiation fails, disputes shall be submitted to arbitration
                            in accordance with Kenyan law. You agree to resolve disputes individually and not as part
                            of a class action.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">12. Intellectual Property</h2>
                        <p className="text-slate-600 leading-relaxed">
                            All content on the platform, including logos, text, graphics, and software, is the property
                            of eGarage Kenya or its licensors and is protected by copyright and trademark laws.
                            You may not use our intellectual property without express written permission.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">13. Governing Law</h2>
                        <p className="text-slate-600 leading-relaxed">
                            These Terms of Service are governed by the laws of the Republic of Kenya. Any legal proceedings
                            shall be conducted in the courts of Kenya.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">14. Contact Information</h2>
                        <p className="text-slate-600 leading-relaxed">
                            For questions about these Terms of Service, please contact us:
                        </p>
                        <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                            <p className="text-slate-700"><strong>eGarage Kenya</strong></p>
                            <p className="text-slate-600">Email: <a href="mailto:legal@egarage.ke" className="text-rose-600 hover:underline">legal@egarage.ke</a></p>
                            <p className="text-slate-600">Phone: +254 700 000 000</p>
                            <p className="text-slate-600">Location: Nairobi, Kenya</p>
                        </div>
                    </section>

                </div>
            </div>

            <Footer />
        </div>
    );
}

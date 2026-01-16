import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
    title: "Privacy Policy",
    description: "eGarage Kenya Privacy Policy - Learn how we collect, use, and protect your personal information when using our mechanic finder platform.",
    alternates: {
        canonical: "/privacy"
    }
};

export default function PrivacyPolicyPage() {
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
                            <Shield className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl lg:text-4xl font-bold text-white">Privacy Policy</h1>
                            <p className="text-slate-400 mt-1">Last updated: January 2026</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-6 py-12 lg:py-16">
                <div className="max-w-3xl mx-auto prose prose-slate prose-headings:text-slate-900 prose-a:text-rose-600">

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Introduction</h2>
                        <p className="text-slate-600 leading-relaxed">
                            Welcome to eGarage Kenya ("we," "our," or "us"). We are committed to protecting your personal information
                            and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard
                            your information when you use our platform to find or offer mechanic services in Kenya.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Information We Collect</h2>
                        <p className="text-slate-600 leading-relaxed mb-4">We collect information that you provide directly to us:</p>
                        <ul className="list-disc pl-6 text-slate-600 space-y-2">
                            <li><strong>Account Information:</strong> Name, email address, phone number, and password when you register</li>
                            <li><strong>Profile Information:</strong> For mechanics - business name, location, specialties, service areas, and verification documents</li>
                            <li><strong>Communication Data:</strong> Messages exchanged through our in-app chat feature</li>
                            <li><strong>Payment Information:</strong> M-Pesa transaction details for service payments</li>
                            <li><strong>Location Data:</strong> Your location when searching for nearby mechanics (with your permission)</li>
                            <li><strong>Device Information:</strong> IP address, browser type, and device identifiers</li>
                        </ul>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">3. How We Use Your Information</h2>
                        <p className="text-slate-600 leading-relaxed mb-4">We use the information we collect to:</p>
                        <ul className="list-disc pl-6 text-slate-600 space-y-2">
                            <li>Provide, maintain, and improve our services</li>
                            <li>Connect drivers with mechanics and breakdown service providers</li>
                            <li>Process payments and prevent fraud</li>
                            <li>Send you service updates, notifications, and promotional communications</li>
                            <li>Verify mechanic credentials and maintain platform trust</li>
                            <li>Respond to your inquiries and provide customer support</li>
                            <li>Analyze usage patterns to improve user experience</li>
                        </ul>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Information Sharing</h2>
                        <p className="text-slate-600 leading-relaxed mb-4">We may share your information in the following situations:</p>
                        <ul className="list-disc pl-6 text-slate-600 space-y-2">
                            <li><strong>With Service Providers:</strong> Mechanics can see your name and contact details when you initiate contact</li>
                            <li><strong>With Clients:</strong> Drivers can see mechanic profiles, ratings, and contact information</li>
                            <li><strong>Payment Processors:</strong> M-Pesa/Safaricom for processing transactions</li>
                            <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                            <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                        </ul>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Data Security</h2>
                        <p className="text-slate-600 leading-relaxed">
                            We implement appropriate technical and organizational security measures to protect your personal information.
                            This includes encryption of data in transit and at rest, secure authentication, and regular security audits.
                            However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">6. Your Rights</h2>
                        <p className="text-slate-600 leading-relaxed mb-4">You have the right to:</p>
                        <ul className="list-disc pl-6 text-slate-600 space-y-2">
                            <li>Access the personal information we hold about you</li>
                            <li>Request correction of inaccurate information</li>
                            <li>Request deletion of your account and data</li>
                            <li>Opt out of marketing communications</li>
                            <li>Withdraw consent for location tracking</li>
                        </ul>
                        <p className="text-slate-600 leading-relaxed mt-4">
                            To exercise these rights, contact us at <a href="mailto:privacy@egarage.ke" className="text-rose-600 hover:underline">privacy@egarage.ke</a>
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">7. Cookies and Tracking</h2>
                        <p className="text-slate-600 leading-relaxed">
                            We use cookies and similar tracking technologies to enhance your experience on our platform.
                            These help us remember your preferences, analyze traffic patterns, and improve our services.
                            You can control cookie settings through your browser preferences.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">8. Children's Privacy</h2>
                        <p className="text-slate-600 leading-relaxed">
                            Our services are not intended for individuals under 18 years of age. We do not knowingly collect
                            personal information from children. If you believe we have collected information from a minor,
                            please contact us immediately.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">9. Changes to This Policy</h2>
                        <p className="text-slate-600 leading-relaxed">
                            We may update this Privacy Policy from time to time. We will notify you of any changes by posting
                            the new policy on this page and updating the "Last updated" date. We encourage you to review this
                            policy periodically.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">10. Contact Us</h2>
                        <p className="text-slate-600 leading-relaxed">
                            If you have questions about this Privacy Policy or our data practices, please contact us:
                        </p>
                        <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                            <p className="text-slate-700"><strong>eGarage Kenya</strong></p>
                            <p className="text-slate-600">Email: <a href="mailto:privacy@egarage.ke" className="text-rose-600 hover:underline">privacy@egarage.ke</a></p>
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

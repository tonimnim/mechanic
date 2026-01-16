'use client';

import Link from 'next/link';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-slate-900 text-slate-300">
            {/* Main Footer Content */}
            <div className="container mx-auto px-6 py-12 lg:py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

                    {/* Brand Section */}
                    <div className="space-y-4">
                        <Link href="/" className="flex items-center gap-2">
                            <img src="/logo.jpg" alt="eGarage" className="h-10 w-10 rounded-lg object-cover" />
                            <span className="font-bold text-xl text-white">eGarage</span>
                        </Link>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            Kenya's trusted platform connecting drivers with verified mechanics and breakdown services. Get help anytime, anywhere.
                        </p>
                        {/* Social Links */}
                        <div className="flex gap-3 pt-2">
                            <a href="#" className="p-2 bg-slate-800 hover:bg-rose-600 rounded-lg transition-colors group">
                                <Facebook className="h-4 w-4 text-slate-400 group-hover:text-white" />
                            </a>
                            <a href="#" className="p-2 bg-slate-800 hover:bg-rose-600 rounded-lg transition-colors group">
                                <Twitter className="h-4 w-4 text-slate-400 group-hover:text-white" />
                            </a>
                            <a href="#" className="p-2 bg-slate-800 hover:bg-rose-600 rounded-lg transition-colors group">
                                <Instagram className="h-4 w-4 text-slate-400 group-hover:text-white" />
                            </a>
                            <a href="#" className="p-2 bg-slate-800 hover:bg-rose-600 rounded-lg transition-colors group">
                                <Linkedin className="h-4 w-4 text-slate-400 group-hover:text-white" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-white">Quick Links</h4>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <Link href="/find" className="hover:text-rose-400 transition-colors">
                                    Find Mechanics
                                </Link>
                            </li>
                            <li>
                                <Link href="/register/mechanic" className="hover:text-rose-400 transition-colors">
                                    Register as Mechanic
                                </Link>
                            </li>
                            <li>
                                <Link href="/about" className="hover:text-rose-400 transition-colors">
                                    How It Works
                                </Link>
                            </li>
                            <li>
                                <Link href="/login" className="hover:text-rose-400 transition-colors">
                                    Login
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Services */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-white">Services</h4>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <span className="hover:text-rose-400 transition-colors cursor-pointer">
                                    Engine Repair
                                </span>
                            </li>
                            <li>
                                <span className="hover:text-rose-400 transition-colors cursor-pointer">
                                    Breakdown Assistance
                                </span>
                            </li>
                            <li>
                                <span className="hover:text-rose-400 transition-colors cursor-pointer">
                                    Tire Services
                                </span>
                            </li>
                            <li>
                                <span className="hover:text-rose-400 transition-colors cursor-pointer">
                                    Battery Jump Start
                                </span>
                            </li>
                            <li>
                                <span className="hover:text-rose-400 transition-colors cursor-pointer">
                                    Towing Services
                                </span>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-white">Contact Us</h4>
                        <ul className="space-y-3 text-sm">
                            <li className="flex items-start gap-3">
                                <MapPin className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                                <span>Nairobi, Kenya</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="h-5 w-5 text-rose-500 shrink-0" />
                                <a href="tel:+254700000000" className="hover:text-rose-400 transition-colors">
                                    +254 700 000 000
                                </a>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="h-5 w-5 text-rose-500 shrink-0" />
                                <a href="mailto:support@egarage.ke" className="hover:text-rose-400 transition-colors">
                                    support@egarage.ke
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-slate-800">
                <div className="container mx-auto px-6 py-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-sm text-slate-500">
                            © {currentYear} eGarage. All rights reserved.
                        </p>
                        <div className="flex gap-6 text-sm">
                            <Link href="/privacy" className="text-slate-500 hover:text-rose-400 transition-colors">
                                Privacy Policy
                            </Link>
                            <Link href="/terms" className="text-slate-500 hover:text-rose-400 transition-colors">
                                Terms of Service
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

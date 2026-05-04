'use client';

import React from 'react';
import Link from 'next/link';
import ShopTitle from './ShopTitle';

const Footer: React.FC = () => {
    return (
        <footer className="bg-slate-50 border-t border-slate-200 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    {/* Brand Section */}
                    <div className="col-span-1 md:col-span-1">
                        <ShopTitle />
                        <p className="mt-6 text-slate-500 text-sm leading-relaxed">
                            95B Station Street,
                            <br />
                            Penrith, NSW, 2750, Australia
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-slate-900 font-bold uppercase tracking-wider text-xs mb-6">Quick Links</h4>
                        <ul className="space-y-4">
                            <li><Link href="/" className="text-slate-500 hover:text-blue-600 text-sm transition-colors">Home</Link></li>
                            <li><Link href="/ProductFeed" className="text-slate-500 hover:text-blue-600 text-sm transition-colors">Browse Products</Link></li>
                            <li><Link href="/CategoryFeed" className="text-slate-500 hover:text-blue-600 text-sm transition-colors">Categories</Link></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="text-slate-900 font-bold uppercase tracking-wider text-xs mb-6">Support</h4>
                        <ul className="space-y-4">
                            <li><Link href="/#contact" className="text-slate-500 hover:text-blue-600 text-sm transition-colors">Contact Us</Link></li>
                            <li><Link href="/privacy-policy" className="text-slate-500 hover:text-blue-600 text-sm transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/terms-and-conditions" className="text-slate-500 hover:text-blue-600 text-sm transition-colors">Terms &amp; Conditions</Link></li>
                            <li><Link href="/shipping-policy" className="text-slate-500 hover:text-blue-600 text-sm transition-colors">Shipping Policy</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="text-slate-900 font-bold uppercase tracking-wider text-xs mb-6">Contact</h4>
                        <ul className="space-y-4">
                            <li className="text-slate-500 text-sm">
                                <span className="block font-medium text-slate-700">Email</span>
                                info@sarengmedequip.com
                            </li>
                            <li className="text-slate-500 text-sm">
                                <span className="block font-medium text-slate-700">Contact Number</span>
                                1800 633 338
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-slate-400 text-xs">
                        © {new Date().getFullYear()} SarengMedEquip. All rights reserved. Professional Grade Medical Equipment Distributor.
                    </p>
                    <div className="flex gap-6">
                        {/* Placeholder for social icons if needed */}
                        <div className="w-5 h-5 bg-slate-200 rounded-full hover:bg-blue-200 transition-colors" />
                        <div className="w-5 h-5 bg-slate-200 rounded-full hover:bg-blue-200 transition-colors" />
                        <div className="w-5 h-5 bg-slate-200 rounded-full hover:bg-blue-200 transition-colors" />
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

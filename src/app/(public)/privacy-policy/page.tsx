'use client';

import React from 'react';
import {
    ShieldCheck,
    Lock,
    Eye,
    UserCheck,
    Database,
    Globe,
    ChevronRight,
    FileText,
    Info
} from 'lucide-react';

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Header / Hero Section */}
            <section className="relative pt-24 pb-12 sm:pt-32 sm:pb-20 bg-white border-b border-slate-100 overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-slate-50 rounded-full blur-3xl opacity-50 translate-y-1/2 -translate-x-1/2" />

                <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 text-center">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 tracking-tight mb-4 sm:mb-6">
                        Privacy Policy
                    </h1>
                    <p className="text-slate-500 text-sm sm:text-lg font-light leading-relaxed max-w-2xl mx-auto px-2">
                        Your privacy is fundamental to our clinical trust. This document outlines how Sareng Medical Equipment collects, processes, and protects your personal data.
                    </p>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-10 sm:py-20 relative">
                <div className="max-w-4xl mx-auto px-4 sm:px-6">
                    <div className="space-y-8 sm:space-y-12">

                        {/* Who we are */}
                        <div className="bg-white p-6 sm:p-10 rounded-2xl sm:rounded-[32px] border border-slate-100 shadow-sm transition-all hover:shadow-md">
                            <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 text-blue-600 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                                    <Globe size={20} className="sm:w-6 sm:h-6" />
                                </div>
                                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Who we are</h2>
                            </div>
                            <p className="text-slate-600 font-light leading-relaxed text-sm sm:text-base">
                                Our website address is: <a href="https://sarengmedequip.com/wp" className="text-blue-600 hover:underline font-medium break-all">https://sarengmedequip-alpha.vercel.app/</a>.
                            </p>
                        </div>

                        {/* Comments */}
                        <div className="bg-white p-6 sm:p-10 rounded-2xl sm:rounded-[32px] border border-slate-100 shadow-sm transition-all hover:shadow-md">
                            <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-50 text-indigo-600 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                                    <Info size={20} className="sm:w-6 sm:h-6" />
                                </div>
                                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Comments</h2>
                            </div>
                            <div className="space-y-3 sm:space-y-4 text-slate-600 font-light leading-relaxed text-sm sm:text-base">
                                <p>
                                    When visitors leave comments on the site we collect the data shown in the comments form, and also the visitor’s IP address and browser user agent string to help spam detection.
                                </p>
                                <p>
                                    An anonymized string created from your email address (also called a hash) may be provided to the Gravatar service to see if you are using it. The Gravatar service privacy policy is available here: <a href="https://automattic.com/privacy/" className="text-blue-600 hover:underline break-all">https://automattic.com/privacy/</a>. After approval of your comment, your profile picture is visible to the public in the context of your comment.
                                </p>
                            </div>
                        </div>

                        {/* Media */}
                        <div className="bg-white p-6 sm:p-10 rounded-2xl sm:rounded-[32px] border border-slate-100 shadow-sm transition-all hover:shadow-md">
                            <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-50 text-emerald-600 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                                    <FileText size={20} className="sm:w-6 sm:h-6" />
                                </div>
                                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Media</h2>
                            </div>
                            <p className="text-slate-600 font-light leading-relaxed text-sm sm:text-base">
                                If you upload images to the website, you should avoid uploading images with embedded location data (EXIF GPS) included. Visitors to the website can download and extract any location data from images on the website.
                            </p>
                        </div>

                        {/* Cookies */}
                        <div className="bg-white p-6 sm:p-10 rounded-2xl sm:rounded-[32px] border border-slate-100 shadow-sm transition-all hover:shadow-md relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-1 h-full bg-blue-600" />
                            <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-50 text-amber-600 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                                    <Database size={20} className="sm:w-6 sm:h-6" />
                                </div>
                                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Cookies</h2>
                            </div>
                            <div className="space-y-4 sm:space-y-6 text-slate-600 font-light leading-relaxed text-sm sm:text-base">
                                <p>
                                    If you leave a comment on our site you may opt-in to saving your name, email address and website in cookies. These are for your convenience so that you do not have to fill in your details again when you leave another comment. These cookies will last for one year.
                                </p>
                                <p>
                                    If you visit our login page, we will set a temporary cookie to determine if your browser accepts cookies. This cookie contains no personal data and is discarded when you close your browser.
                                </p>
                                <p>
                                    When you log in, we will also set up several cookies to save your login information and your screen display choices. Login cookies last for two days, and screen options cookies last for a year. If you select "Remember Me", your login will persist for two weeks. If you log out of your account, the login cookies will be removed.
                                </p>
                                <p>
                                    If you edit or publish an article, an additional cookie will be saved in your browser. This cookie includes no personal data and simply indicates the post ID of the article you just edited. It expires after 1 day.
                                </p>
                            </div>
                        </div>

                        {/* Embedded content */}
                        <div className="bg-white p-6 sm:p-10 rounded-2xl sm:rounded-[32px] border border-slate-100 shadow-sm transition-all hover:shadow-md">
                            <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-violet-50 text-violet-600 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                                    <ChevronRight size={20} className="sm:w-6 sm:h-6" />
                                </div>
                                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Embedded content</h2>
                            </div>
                            <div className="space-y-3 sm:space-y-4 text-slate-600 font-light leading-relaxed text-sm sm:text-base">
                                <p>
                                    Articles on this site may include embedded content (e.g. videos, images, articles, etc.). Embedded content from other websites behaves in the exact same way as if the visitor has visited the other website.
                                </p>
                                <p>
                                    These websites may collect data about you, use cookies, embed additional third-party tracking, and monitor your interaction with that embedded content, including tracking your interaction with the embedded content if you have an account and are logged in to that website.
                                </p>
                            </div>
                        </div>

                        {/* Who we share your data with */}
                        <div className="bg-white p-6 sm:p-10 rounded-2xl sm:rounded-[32px] border border-slate-100 shadow-sm transition-all hover:shadow-md">
                            <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-rose-50 text-rose-600 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                                    <Lock size={20} className="sm:w-6 sm:h-6" />
                                </div>
                                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Who we share your data with</h2>
                            </div>
                            <p className="text-slate-600 font-light leading-relaxed text-sm sm:text-base">
                                If you request a password reset, your IP address will be included in the reset email.
                            </p>
                        </div>

                        {/* How long we retain your data */}
                        <div className="bg-white p-6 sm:p-10 rounded-2xl sm:rounded-[32px] border border-slate-100 shadow-sm transition-all hover:shadow-md">
                            <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-cyan-50 text-cyan-600 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                                    <ClockIcon size={20} />
                                </div>
                                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Data retention</h2>
                            </div>
                            <div className="space-y-3 sm:space-y-4 text-slate-600 font-light leading-relaxed text-sm sm:text-base">
                                <p>
                                    If you leave a comment, the comment and its metadata are retained indefinitely. This is so we can recognize and approve any follow-up comments automatically instead of holding them in a moderation queue.
                                </p>
                                <p>
                                    For users that register on our website (if any), we also store the personal information they provide in their user profile. All users can see, edit, or delete their personal information at any time (except they cannot change their username). Website administrators can also see and edit that information.
                                </p>
                            </div>
                        </div>

                        {/* What rights you have over your data */}
                        <div className="bg-white p-6 sm:p-10 rounded-2xl sm:rounded-[32px] border border-slate-100 shadow-sm transition-all hover:shadow-md">
                            <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-50 text-emerald-600 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                                    <UserCheck size={20} className="sm:w-6 sm:h-6" />
                                </div>
                                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Your data rights</h2>
                            </div>
                            <p className="text-slate-600 font-light leading-relaxed text-sm sm:text-base">
                                If you have an account on this site, or have left comments, you can request to receive an exported file of the personal data we hold about you, including any data you have provided to us. You can also request that we erase any personal data we hold about you. This does not include any data we are obliged to keep for administrative, legal, or security purposes.
                            </p>
                        </div>

                        {/* Where your data is sent */}
                        <div className="bg-white p-6 sm:p-10 rounded-2xl sm:rounded-[32px] border border-slate-100 shadow-sm transition-all hover:shadow-md">
                            <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-900 text-white rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                                    <Eye size={20} className="sm:w-6 sm:h-6" />
                                </div>
                                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Where your data is sent</h2>
                            </div>
                            <p className="text-slate-600 font-light leading-relaxed text-sm sm:text-base">
                                Visitor comments may be checked through an automated spam detection service.
                            </p>
                        </div>

                    </div>

                    {/* Footer Contact */}
                    <div className="mt-12 sm:mt-20 p-8 sm:p-12 bg-slate-900 rounded-3xl sm:rounded-[40px] text-center text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2" />
                        <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 relative z-10 text-white">Need clarifications?</h3>
                        <p className="text-slate-400 text-sm sm:text-base font-light mb-6 sm:mb-8 relative z-10">Our support team is available for any inquiries.</p>
                        <a
                            href="/#contact"
                            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl font-bold transition-all active:scale-95 relative z-10 text-sm sm:text-base"
                        >
                            Contact Support Team
                            <ChevronRight size={18} />
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
}

function ClockIcon({ size }: { size: number }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
        </svg>
    );
}

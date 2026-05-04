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
    Info,
    AlertTriangle,
    Clock
} from 'lucide-react';

export default function PrivacyPolicyPage() {
    const sections = [
        {
            icon: <Globe size={20} className="sm:w-6 sm:h-6" />,
            iconBg: 'bg-blue-50 text-blue-600',
            title: 'Who We Are',
            content: (
                <p>
                    Sareng Pty Ltd, trading as Sareng Medical Equipment, supplies medical consumables and equipment to customers across Australia. ABN: 31 604 638 628. Contact:{' '}
                    <a href="mailto:info@sareng.com.au" className="text-blue-600 hover:underline">info@sareng.com.au</a> or 1800 633 338.
                </p>
            )
        },
        {
            icon: <Database size={20} className="sm:w-6 sm:h-6" />,
            iconBg: 'bg-amber-50 text-amber-600',
            title: 'Personal Information We Collect',
            content: (
                <p>
                    We may collect contact names, organisation details, job titles, email addresses, phone numbers, delivery and billing addresses, order details, quote requests, payment and transaction references, account notes and communications with us.
                </p>
            )
        },
        {
            icon: <Info size={20} className="sm:w-6 sm:h-6" />,
            iconBg: 'bg-indigo-50 text-indigo-600',
            title: 'How We Collect Information',
            content: (
                <p>
                    We collect information when you place an order, request a quote, create a trade account, contact us, subscribe to updates, use our website or deal with our staff. We may also receive information from payment, delivery, ecommerce, CRM or fraud prevention providers used to operate the website.
                </p>
            )
        },
        {
            icon: <FileText size={20} className="sm:w-6 sm:h-6" />,
            iconBg: 'bg-emerald-50 text-emerald-600',
            title: 'Why We Use Information',
            content: (
                <p>
                    We use personal information to process orders, provide quotes, manage wholesale accounts, arrange delivery, respond to enquiries, keep business records, improve our website, prevent fraud, comply with legal obligations and send relevant business communications where permitted.
                </p>
            )
        },
        {
            icon: <Lock size={20} className="sm:w-6 sm:h-6" />,
            iconBg: 'bg-rose-50 text-rose-600',
            title: 'Disclosure',
            content: (
                <p>
                    We may share information with service providers who help us operate the business, including ecommerce platforms, payment processors, delivery providers, IT hosting providers, accountants, professional advisers and regulators where required by law.
                </p>
            )
        },
        {
            icon: <ShieldCheck size={20} className="sm:w-6 sm:h-6" />,
            iconBg: 'bg-violet-50 text-violet-600',
            title: 'Overseas Disclosure',
            content: (
                <p>
                    Some website, payment, analytics, cloud or email providers may store or process information outside Australia. The countries involved should be confirmed before launch and listed here where practicable.
                </p>
            )
        },
        {
            icon: <ShieldCheck size={20} className="sm:w-6 sm:h-6" />,
            iconBg: 'bg-blue-900 text-white',
            title: 'Security',
            content: (
                <p>
                    We take reasonable steps to protect personal information from misuse, interference, loss, unauthorised access, modification and disclosure. No online transmission is completely secure, so customers should avoid sending sensitive clinical or patient information through website forms unless specifically requested.
                </p>
            ),
            accent: true
        },
        {
            icon: <UserCheck size={20} className="sm:w-6 sm:h-6" />,
            iconBg: 'bg-cyan-50 text-cyan-600',
            title: 'Access and Correction',
            content: (
                <p>
                    You may request access to personal information we hold about you or ask us to correct it by contacting{' '}
                    <a href="mailto:info@sareng.com.au" className="text-blue-600 hover:underline">info@sareng.com.au</a>. We may need to verify your identity before responding.
                </p>
            )
        },
        {
            icon: <AlertTriangle size={20} className="sm:w-6 sm:h-6" />,
            iconBg: 'bg-orange-50 text-orange-600',
            title: 'Complaints',
            content: (
                <p>
                    If you have a privacy complaint, contact us first so we can investigate and respond. If you are not satisfied, you may contact the Office of the Australian Information Commissioner.
                </p>
            )
        },
        {
            icon: <Database size={20} className="sm:w-6 sm:h-6" />,
            iconBg: 'bg-indigo-50 text-indigo-600',
            title: 'Cookies and Analytics',
            content: (
                <p>
                    Our website may use cookies and analytics tools to operate the site, remember preferences, understand traffic and improve the customer experience. Specific providers should be listed here when selected.
                </p>
            )
        },
        {
            icon: <Clock size={20} className="sm:w-6 sm:h-6" />,
            iconBg: 'bg-slate-100 text-slate-600',
            title: 'Policy Updates',
            content: (
                <p>
                    We may update this policy when our business, website, providers or legal obligations change. The latest version will be available on this website.
                </p>
            )
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Header / Hero Section */}
            <section className="relative pt-24 pb-12 sm:pt-32 sm:pb-20 bg-white border-b border-slate-100 overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-slate-50 rounded-full blur-3xl opacity-50 translate-y-1/2 -translate-x-1/2" />

                <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 text-center">
                    <p className="text-blue-600 text-xs sm:text-sm font-semibold uppercase tracking-widest mb-3 sm:mb-4">
                        Last updated 1 May 2026
                    </p>
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
                        {sections.map((section, index) => (
                            <div
                                key={index}
                                className={`bg-white p-6 sm:p-10 rounded-2xl sm:rounded-[32px] border border-slate-100 shadow-sm transition-all hover:shadow-md${section.accent ? ' relative overflow-hidden' : ''}`}
                            >
                                {section.accent && (
                                    <div className="absolute top-0 right-0 w-1 h-full bg-blue-600" />
                                )}
                                <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                                    <div className={`w-10 h-10 sm:w-12 sm:h-12 ${section.iconBg} rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0`}>
                                        {section.icon}
                                    </div>
                                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                                        {section.title}
                                    </h2>
                                </div>
                                <div className="text-slate-600 font-light leading-relaxed text-sm sm:text-base">
                                    {section.content}
                                </div>
                            </div>
                        ))}
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

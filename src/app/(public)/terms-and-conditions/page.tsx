'use client';

import React from 'react';
import {
    Building2,
    Users,
    Package,
    ClipboardList,
    CreditCard,
    Truck,
    RotateCcw,
    Stethoscope,
    Monitor,
    Scale,
    Gavel,
    ChevronRight,
} from 'lucide-react';

export default function TermsAndConditionsPage() {
    const sections = [
        {
            icon: <Building2 size={20} className="sm:w-6 sm:h-6" />,
            iconBg: 'bg-blue-50 text-blue-600',
            title: 'Business Details',
            content: (
                <p>
                    This website is operated by Sareng Pty Ltd, ABN 31 604 638 628, trading as Sareng Medical Equipment.
                </p>
            ),
        },
        {
            icon: <Users size={20} className="sm:w-6 sm:h-6" />,
            iconBg: 'bg-indigo-50 text-indigo-600',
            title: 'Customers',
            content: (
                <p>
                    We supply medical consumables and equipment to Australian healthcare and wholesale customers, including hospitals, clinics, sleep labs, cardiology clinics, aged care providers and distributors. We may decline orders that are incomplete, unsuitable, unavailable, restricted or outside our supply capability.
                </p>
            ),
        },
        {
            icon: <Package size={20} className="sm:w-6 sm:h-6" />,
            iconBg: 'bg-emerald-50 text-emerald-600',
            title: 'Product Information',
            content: (
                <p>
                    We aim to keep product descriptions, images, pack sizes and availability accurate. Images are provided for identification and may vary from supplied stock due to manufacturer updates or packaging changes.
                </p>
            ),
        },
        {
            icon: <ClipboardList size={20} className="sm:w-6 sm:h-6" />,
            iconBg: 'bg-amber-50 text-amber-600',
            title: 'Orders and Quotes',
            content: (
                <p>
                    Submitting an order or quote request does not guarantee acceptance. We may confirm stock, pack size, delivery cost, pricing, account status and regulatory suitability before accepting an order.
                </p>
            ),
            accent: true,
        },
        {
            icon: <CreditCard size={20} className="sm:w-6 sm:h-6" />,
            iconBg: 'bg-violet-50 text-violet-600',
            title: 'Pricing and Payment',
            content: (
                <p>
                    Unless stated otherwise, prices are in Australian dollars. GST treatment, delivery charges and payment terms will be shown at checkout, in a quote or on an invoice. Wholesale account terms must be approved by us in writing.
                </p>
            ),
        },
        {
            icon: <Truck size={20} className="sm:w-6 sm:h-6" />,
            iconBg: 'bg-cyan-50 text-cyan-600',
            title: 'Delivery',
            content: (
                <p>
                    We ship within Australia only. Delivery estimates are not guarantees and may be affected by stock availability, carrier delays, regional delivery constraints or events outside our control.
                </p>
            ),
        },
        {
            icon: <RotateCcw size={20} className="sm:w-6 sm:h-6" />,
            iconBg: 'bg-rose-50 text-rose-600',
            title: 'Returns and Australian Consumer Law',
            content: (
                <div className="space-y-3 sm:space-y-4">
                    <p>
                        Nothing in these terms limits rights that cannot be excluded under the Australian Consumer Law. Products may come with consumer guarantees, including that goods are of acceptable quality, match their description and are fit for disclosed purposes where applicable.
                    </p>
                    <p>
                        For hygiene, safety and regulatory reasons, some opened or used medical consumables may not be returnable for change of mind. Faulty, damaged, incorrectly supplied or legally returnable goods will be handled in accordance with applicable law.
                    </p>
                </div>
            ),
        },
        {
            icon: <Stethoscope size={20} className="sm:w-6 sm:h-6" />,
            iconBg: 'bg-teal-50 text-teal-600',
            title: 'Clinical Use',
            content: (
                <p>
                    Customers are responsible for ensuring products are suitable for their intended use, compatible with relevant devices and used by appropriately trained personnel in accordance with manufacturer instructions and applicable healthcare requirements.
                </p>
            ),
        },
        {
            icon: <Monitor size={20} className="sm:w-6 sm:h-6" />,
            iconBg: 'bg-slate-100 text-slate-600',
            title: 'Website Use',
            content: (
                <p>
                    You must not misuse the website, interfere with its operation, attempt unauthorised access or submit false, misleading or unlawful information.
                </p>
            ),
        },
        {
            icon: <Scale size={20} className="sm:w-6 sm:h-6" />,
            iconBg: 'bg-orange-50 text-orange-600',
            title: 'Liability',
            content: (
                <p>
                    To the maximum extent permitted by law, we are not liable for indirect loss, loss of profit, loss of business opportunity or loss arising from misuse of products. Liability that cannot be excluded is limited as permitted by law.
                </p>
            ),
        },
        {
            icon: <Gavel size={20} className="sm:w-6 sm:h-6" />,
            iconBg: 'bg-slate-900 text-white',
            title: 'Governing Law',
            content: (
                <p>
                    These terms are governed by the laws of New South Wales, Australia. The parties submit to the non-exclusive jurisdiction of the courts of New South Wales.
                </p>
            ),
        },
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
                        Terms &amp; Conditions
                    </h1>
                    <p className="text-slate-500 text-sm sm:text-lg font-light leading-relaxed max-w-2xl mx-auto px-2">
                        Please read these terms carefully before placing an order or using our services. By using this website or purchasing from us, you agree to be bound by these terms.
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
                        <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 relative z-10 text-white">
                            Have a question about our terms?
                        </h3>
                        <p className="text-slate-400 text-sm sm:text-base font-light mb-6 sm:mb-8 relative z-10">
                            Our support team is available for any inquiries.
                        </p>
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

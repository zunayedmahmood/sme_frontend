'use client';

import React from 'react';
import {
    MapPin,
    CalendarClock,
    DollarSign,
    Clock,
    HomeIcon,
    AlertTriangle,
    PackageOpen,
    ShieldCheck,
    ChevronRight,
} from 'lucide-react';

export default function ShippingPolicyPage() {
    const sections = [
        {
            icon: <MapPin size={20} className="sm:w-6 sm:h-6" />,
            iconBg: 'bg-blue-50 text-blue-600',
            title: 'Delivery Area',
            content: (
                <p>
                    Sareng Medical Equipment ships within Australia only. We do not currently offer international shipping through the website.
                </p>
            ),
        },
        {
            icon: <CalendarClock size={20} className="sm:w-6 sm:h-6" />,
            iconBg: 'bg-indigo-50 text-indigo-600',
            title: 'Dispatch',
            content: (
                <p>
                    Orders are processed Monday to Saturday, excluding public holidays. Dispatch time depends on stock availability, order quantity, payment status and any account approval requirements.
                </p>
            ),
        },
        {
            icon: <DollarSign size={20} className="sm:w-6 sm:h-6" />,
            iconBg: 'bg-emerald-50 text-emerald-600',
            title: 'Freight Charges',
            content: (
                <p>
                    Freight may be calculated at checkout, included in a written quote or added to an invoice after order review. Bulky, fragile, regional or special-handling items may require a custom freight quote.
                </p>
            ),
        },
        {
            icon: <Clock size={20} className="sm:w-6 sm:h-6" />,
            iconBg: 'bg-amber-50 text-amber-600',
            title: 'Estimated Delivery',
            content: (
                <p>
                    Metro deliveries are generally faster than regional or remote deliveries. Estimated delivery timeframes will be provided where available, but they are estimates only and may change due to carrier capacity, stock movement or events outside our control.
                </p>
            ),
            accent: true,
        },
        {
            icon: <HomeIcon size={20} className="sm:w-6 sm:h-6" />,
            iconBg: 'bg-violet-50 text-violet-600',
            title: 'Authority to Leave',
            content: (
                <p>
                    If you request authority to leave, you accept responsibility for the parcel once the carrier records delivery at the nominated address. Healthcare customers should provide a secure delivery point wherever possible.
                </p>
            ),
        },
        {
            icon: <AlertTriangle size={20} className="sm:w-6 sm:h-6" />,
            iconBg: 'bg-rose-50 text-rose-600',
            title: 'Incorrect Address',
            content: (
                <p>
                    Customers are responsible for providing accurate delivery details. Additional costs may apply if an order is redirected, returned, resent or delayed because of incorrect information.
                </p>
            ),
        },
        {
            icon: <PackageOpen size={20} className="sm:w-6 sm:h-6" />,
            iconBg: 'bg-cyan-50 text-cyan-600',
            title: 'Damaged or Missing Goods',
            content: (
                <p>
                    Please inspect deliveries promptly. If goods arrive damaged, missing or inconsistent with the order, contact{' '}
                    <a href="mailto:info@sareng.com.au" className="text-blue-600 hover:underline font-medium">
                        info@sareng.com.au
                    </a>{' '}
                    with your order details, photos and delivery documentation as soon as practicable.
                </p>
            ),
        },
        {
            icon: <ShieldCheck size={20} className="sm:w-6 sm:h-6" />,
            iconBg: 'bg-slate-900 text-white',
            title: 'Returns and Consumer Rights',
            content: (
                <p>
                    This shipping policy operates alongside rights under the Australian Consumer Law. It does not remove non-excludable rights relating to faulty, damaged, incorrectly described or otherwise legally returnable goods.
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
                        Shipping Policy
                    </h1>
                    <p className="text-slate-500 text-sm sm:text-lg font-light leading-relaxed max-w-2xl mx-auto px-2">
                        Everything you need to know about how we dispatch and deliver your orders across Australia.
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
                            Questions about your delivery?
                        </h3>
                        <p className="text-slate-400 text-sm sm:text-base font-light mb-6 sm:mb-8 relative z-10">
                            Our support team is available for any shipping inquiries.
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

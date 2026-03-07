'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowRight,
    Shield,
    Activity,
    Award,
    Users,
    Globe,
    CheckCircle2,
    HeartPulse,
    Truck,
    Clock,
    BadgeCheck,
    FlaskConical,
    Building2,
    Stethoscope,
    Microscope,
    Star,
    Loader2,
    CircleArrowRight,
} from 'lucide-react';
import { getShopStats } from '@/lib/api/api_public';
import { useEffect, useState } from 'react';


const VALUES = [
    {
        icon: Shield,
        color: 'bg-blue-100 text-blue-600',
        title: 'Integrity',
        desc: 'We operate with honesty and adhere to the highest standards of moral and ethical values in every clinical transaction.',
    },
    {
        icon: Microscope,
        color: 'bg-violet-100 text-violet-600',
        title: 'Innovation',
        desc: 'Staying ahead of technological advancements, we bring high-performance innovative solutions to the healthcare sector.',
    },
    {
        icon: BadgeCheck,
        color: 'bg-emerald-100 text-emerald-600',
        title: 'Quality',
        desc: 'Our commitment ensures we deliver superior healthcare equipment that medical professionals can rely on without hesitation.',
    },
    {
        icon: Users,
        color: 'bg-amber-100 text-amber-600',
        title: 'Collaboration',
        desc: 'We believe in the power of working together with healthcare providers to meet the needs of patients effectively.',
    },
    {
        icon: HeartPulse,
        color: 'bg-rose-100 text-rose-600',
        title: 'Service Excellence',
        desc: 'Providing unparalleled service and support to our clients is at the heart of our operations nationwide.',
    },
];

const UNIQUE_TRAITS = [
    {
        title: 'Unwavering Commitment',
        desc: 'Our dedication goes beyond merely distributing equipment. We actively participate in the healthcare journey, aiming to enhance patient care through continuous innovation.',
    },
    {
        title: 'Proactive Partnership',
        desc: 'Unlike traditional distributors, we position ourselves as proactive partners, fully engaged in supporting healthcare providers’ efforts to deliver outstanding care.',
    },
    {
        title: 'Holistic Approach',
        desc: 'Our unique strategy integrates advanced technology, exceptional service, and comprehensive support, surpassing healthcare providers’ and patients’ expectations.',
    },
];

const TIMELINE = [
    { year: 'Founded', event: 'Established as a specialist medical equipment distributor focused on bridging technical innovation with clinical need.' },
    { year: 'Expansion', event: 'Expanded operations to serve hospitals, clinics, and healthcare facilities across all major Australian territories.' },
    { year: 'Innovation', event: 'Integrated advanced support protocols and a diverse manufacturer network to provide unparalleled service excellence.' },
    { year: 'Digital', event: 'Launched our digital procurement platform to streamline healthcare equipment access nationwide.' },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AboutPage() {
    const router = useRouter();
    const [stats, setStats] = useState({
        products: 0,
        categories: 0,
        successful_orders: 0
    });
    const [loadingStats, setLoadingStats] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const resp = await getShopStats();
                if (resp.success) {
                    setStats(resp.data);
                }
            } catch (err) {
                console.error('Stats acquisition failed', err);
            } finally {
                setLoadingStats(false);
            }
        };
        fetchStats();
    }, []);

    const DISPLAY_STATS = [
        { value: stats.products, label: 'Product Varieties', icon: FlaskConical, color: 'bg-blue-50 text-blue-600' },
        { value: stats.categories, label: 'Categories Served', icon: Microscope, color: 'bg-violet-50 text-violet-600' },
        { value: stats.successful_orders, label: 'Successful Orders', icon: BadgeCheck, color: 'bg-emerald-50 text-emerald-600' },
        { value: '24/7', label: 'Tech Support', icon: HeartPulse, color: 'bg-amber-50 text-amber-600' },
    ];

    return (
        <div className="flex flex-col">

            {/* ── Hero ── */}
            <section className="relative h-[80vh] flex items-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1551601651-2a8555f1a136?auto=format&fit=crop&q=80&w=2000"
                        alt="Medical laboratory"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-slate-900/65 backdrop-blur-[2px]" />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 backdrop-blur-sm rounded-full text-xs font-bold uppercase tracking-widest text-blue-300 mb-6">
                            <Stethoscope className="w-3.5 h-3.5" />
                            About Sareng Medical Equipment
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight">
                            Where Technology <br />
                            <span className="text-blue-400">meets compassion</span>
                        </h1>
                        <p className="text-xl text-slate-200 font-light leading-relaxed mb-10 max-w-2xl">
                            Empowering clinics with high-performance medical equipment across Australia. We bridge the gap between clinical needs and technical innovation.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={() => router.push('/ProductFeed')}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-xl shadow-blue-600/20 active:scale-95"
                            >
                                Browse Catalog
                                <ArrowRight className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => router.push('/#contact')}
                                className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-xl font-bold transition-all active:scale-95"
                            >
                                Contact Our Team
                            </button>
                        </div>
                    </div>
                </div>

                {/* Scroll indicator — matches homepage */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce z-10">
                    <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
                        <div className="w-1 h-2 bg-white rounded-full" />
                    </div>
                </div>
            </section>

            {/* ── Stats bar ── */}
            <section className="bg-white border-b border-slate-100 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-10">
                        {DISPLAY_STATS.map(({ value, label, icon: Icon, color }) => (
                            <div key={label} className="flex flex-col items-center text-center gap-4">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${color}`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-4xl font-bold text-slate-900 tracking-tight leading-none">
                                        {loadingStats ? <Loader2 className="animate-spin w-8 h-8 text-slate-200" /> : value}
                                    </p>
                                    <p className="text-sm text-slate-500 font-light mt-2">{label}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Mission — text + image ── */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-20 items-center">

                        <div>
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
                                <Activity className="w-3.5 h-3.5" />
                                Who We Are
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight mb-6 leading-tight">
                                A leading distributor of <br />
                                <span className="text-blue-600">healthcare equipment</span>
                            </h2>
                            <p className="text-slate-500 text-lg font-light leading-relaxed mb-5">
                                Backed by years of experience and expertise in the healthcare sector, we specialize in providing high-quality, innovative healthcare solutions to hospitals, clinics, and healthcare facilities nationwide.
                            </p>
                            <p className="text-slate-500 text-lg font-light leading-relaxed mb-10">
                                Our mission is to enhance patient care through state-of-the-art medical equipment and exceptional service. We think outside the box to find personalized solutions specifically for our customers' unique needs.
                            </p>
                            <button
                                onClick={() => router.push('/ProductFeed')}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold transition-all flex items-center gap-2 shadow-xl shadow-blue-600/20 active:scale-95 w-fit"
                            >
                                Browse Our Catalog
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="relative">
                            <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
                                <img
                                    src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=900"
                                    alt="Medical professionals at work"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            {/* Bottom-left floating badge */}
                            <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl border border-slate-100 p-5 flex items-center gap-4">
                                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <HeartPulse className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Higher Level of Care</p>
                                    <p className="text-sm font-bold text-slate-900">Personalized Solutions</p>
                                </div>
                            </div>
                            {/* Top-right floating badge */}
                            <div className="absolute -top-6 -right-6 bg-blue-600 text-white rounded-2xl shadow-xl p-5 text-center">
                                <p className="text-3xl font-bold leading-none">Australia</p>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-blue-200 mt-1">Wide Delivery</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Core Values ── */}
            <section className="py-24 bg-slate-50 border-y border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
                            <HeartPulse className="w-3.5 h-3.5" />
                            Our Passion
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-4 text-center mx-auto max-w-2xl">
                            Improving outcomes through <span className="text-rose-600">exceptional care</span>
                        </h2>
                        <p className="text-slate-500 font-light max-w-2xl mx-auto">
                            We are driven by the belief that access to the best medical equipment can transform patient experiences. This passion fuels our commitment to sourcing only the most reliable, cutting-edge healthcare equipment in the industry.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {VALUES.map(({ icon: Icon, color, title, desc }) => (
                            <div
                                key={title}
                                className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all duration-300 group"
                            >
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${color}`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-3 tracking-tight group-hover:text-blue-600 transition-colors">
                                    {title}
                                </h3>
                                <p className="text-slate-500 text-sm font-light leading-relaxed">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Our Story / Timeline ── */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-20 items-start">

                        <div>
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
                                <Globe className="w-3.5 h-3.5" />
                                Higher Level of Care
                            </div>
                            <h2 className="text-4xl font-bold text-slate-900 tracking-tight mb-6 leading-tight">
                                Personalized solutions for <br />
                                <span className="text-indigo-600">unique needs</span>
                            </h2>
                            <div className="space-y-6 mb-10">
                                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-100 transition-colors">
                                    <h4 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
                                        <BadgeCheck className="w-5 h-5 text-indigo-600" />
                                        Accessibility
                                    </h4>
                                    <p className="text-sm text-slate-500 font-light leading-relaxed">
                                        We're available to talk whenever our customers need us and have the technical expertise to help them make the best decisions for their surgical suites and clinics.
                                    </p>
                                </div>
                                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-100 transition-colors">
                                    <h4 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
                                        <Award className="w-5 h-5 text-indigo-600" />
                                        Flexibility
                                    </h4>
                                    <p className="text-sm text-slate-500 font-light leading-relaxed">
                                        We want to make the lives of our customers easier with a diverse selection of products and brands suitable for any operating room or medical environment.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-2">
                            {TIMELINE.map(({ year, event }, i) => (
                                <div key={year} className="flex gap-5 group">
                                    <div className="flex flex-col items-center">
                                        <div className="w-10 h-10 rounded-full bg-blue-50 border-2 border-blue-200 group-hover:bg-blue-600 group-hover:border-blue-600 transition-all duration-300 flex items-center justify-center flex-shrink-0">
                                            <span className="text-[10px] font-bold text-blue-600 group-hover:text-white transition-colors">
                                                <CircleArrowRight />
                                            </span>
                                        </div>
                                        {i < TIMELINE.length - 1 && (
                                            <div className="w-px flex-1 bg-slate-100 my-2" />
                                        )}
                                    </div>
                                    <div className="pb-8">
                                        <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">{year}</p>
                                        <p className="text-slate-600 font-light leading-relaxed text-sm">{event}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Certifications — dark section ── */}
            <section className="py-20 bg-slate-900 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">

                        <div>
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/20 border border-blue-500/30 text-blue-400 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
                                <Award className="w-3.5 h-3.5" />
                                Truly Unique Factors
                            </div>
                            <h2 className="text-4xl font-bold tracking-tight mb-6 leading-tight">
                                Advancing Healthcare through <br />
                                <span className="text-blue-400">Proactive Partnership</span>
                            </h2>
                            <div className="space-y-4 mb-8">
                                {UNIQUE_TRAITS.map(({ title, desc }) => (
                                    <div key={title} className="p-5 bg-white/5 border border-white/10 rounded-2xl hover:border-blue-400/50 transition-colors">
                                        <h4 className="text-blue-400 font-bold mb-2 flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4" />
                                            {title}
                                        </h4>
                                        <p className="text-slate-400 text-sm font-light leading-relaxed">{desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="p-8 bg-slate-800 rounded-[32px] border border-slate-700">
                                <h3 className="text-2xl font-bold mb-4 text-white">What Makes Us Stand Out?</h3>
                                <p className="text-slate-400 font-light leading-relaxed mb-6">
                                    Our years of experience in the healthcare sector have equipped us with unique insights and understanding of the challenges and needs of healthcare providers.
                                </p>
                                <p className="text-slate-400 font-light leading-relaxed">
                                    Unlike other distributors, we offer personalized consultation and support to ensure that the equipment we provide perfectly aligns with the goals and requirements of our clients.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Delivery Promises ── */}
            <section className="py-20 bg-slate-50 border-y border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">What every order comes with</h2>
                        <p className="text-slate-500 font-light mt-2">Non-negotiable commitments built into our service model.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="flex flex-col items-center text-center bg-white rounded-2xl p-8 border border-slate-100 shadow-sm hover:shadow-lg transition-all">
                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 shadow-sm bg-blue-50 text-blue-600">
                                <Truck className="w-7 h-7" />
                            </div>
                            <h4 className="font-bold text-slate-900 tracking-tight mb-2">Fast Nationwide Delivery</h4>
                            <p className="text-slate-500 text-sm font-light leading-relaxed">Reliable logistics across Australia, ensuring critical supplies reach your facility on time.</p>
                        </div>
                        <div className="flex flex-col items-center text-center bg-white rounded-2xl p-8 border border-slate-100 shadow-sm hover:shadow-lg transition-all">
                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 shadow-sm bg-rose-50 text-rose-600">
                                <HeartPulse className="w-7 h-7" />
                            </div>
                            <h4 className="font-bold text-slate-900 tracking-tight mb-2">24/7 Tech Support</h4>
                            <p className="text-slate-500 text-sm font-light leading-relaxed">Our clinical experts are available round the clock for product guidance and technical aid.</p>
                        </div>
                        <div className="flex flex-col items-center text-center bg-white rounded-2xl p-8 border border-slate-100 shadow-sm hover:shadow-lg transition-all">
                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 shadow-sm bg-emerald-50 text-emerald-600">
                                <Shield className="w-7 h-7" />
                            </div>
                            <h4 className="font-bold text-slate-900 tracking-tight mb-2">100% Authentic Products</h4>
                            <p className="text-slate-500 text-sm font-light leading-relaxed">Sourced directly from certified manufacturers with zero counterfeit tolerance.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="py-28 bg-white relative overflow-hidden">
                {/* Ambient blobs — matches homepage contact section */}
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-blue-50 rounded-full blur-3xl opacity-50 pointer-events-none" />
                <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-slate-100 rounded-full blur-3xl opacity-40 pointer-events-none" />

                <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-xs font-bold uppercase tracking-widest mb-8">
                        <Activity className="w-3.5 h-3.5" />
                        Ready to partner with us?
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight mb-6 leading-tight">
                        Your institution deserves a partner it can <span className="text-blue-600">depend on</span>
                    </h2>
                    <p className="text-slate-500 font-light text-lg leading-relaxed mb-10">
                        Explore our extensive catalog of high-performance medical equipment or consult with our experts for professional healthcare solutions.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => router.push('/ProductFeed')}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-xl shadow-blue-600/20 active:scale-95"
                        >
                            Browse Catalog
                            <ArrowRight className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => router.push('/#contact')}
                            className="bg-slate-50 hover:bg-slate-100 text-slate-900 border border-slate-200 px-8 py-4 rounded-xl font-bold transition-all active:scale-95"
                        >
                            Contact Our Team
                        </button>
                    </div>
                </div>
            </section>

        </div>
    );
}
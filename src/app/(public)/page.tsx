'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { getCategoryInventory, getShopStats, saveMessage } from '@/lib/api/api_public';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, Activity, Beaker, Shield, Thermometer, Box, Mail, Send, User, BookOpen, MessageCircle, CheckCircle2, Loader2 } from 'lucide-react';

// Separate component to safely use useSearchParams inside a Suspense boundary
function SearchParamsHandler({ onSubject }: { onSubject: (subject: string) => void }) {
    const searchParams = useSearchParams();

    useEffect(() => {
        const subject = searchParams.get('subject');
        if (subject) {
            onSubject(subject);
        }
    }, [searchParams, onSubject]);

    return null;
}

interface Category {
    category_id: number;
    category_name: string;
    total_inventory: number;
    image_url: string | null;
}

const STOCK_IMAGES = {
    hero: '/homepage/hero.png',
    'default_category': '/homepage/default_category.png'
};

export default function HomePage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [stats, setStats] = useState({
        products: 0,
        categories: 0,
        successful_orders: 0
    });
    const [loadingStats, setLoadingStats] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchCategories();
        fetchStats();
    }, []);

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

    const fetchCategories = async () => {
        try {
            const response = await getCategoryInventory();
            // Sort by total_inventory descending and take top 5 for the home display
            const sorted = response.data.sort((a: Category, b: Category) => b.total_inventory - a.total_inventory).slice(0, 5);
            setCategories(sorted);
        } catch (err) {
            console.error(err);
        }
    };

    const handleContactSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await saveMessage(formData);
            setSubmitted(true);
            setFormData({ name: '', email: '', subject: '', message: '' });
            setTimeout(() => setSubmitted(false), 5000);
        } catch (err) {
            console.error(err);
            alert('Failure to transmit clinical communication. Please try again later.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col">
            {/* Safely consume useSearchParams inside Suspense */}
            <Suspense fallback={null}>
                <SearchParamsHandler onSubject={(subject) => setFormData(prev => ({ ...prev, subject }))} />
            </Suspense>
            {/* Hero Section */}
            <section className="relative h-[85vh] flex items-center overflow-hidden">
                {/* Background Image with Overlay */}
                <div className="absolute inset-0 z-0">
                    <img
                        src={STOCK_IMAGES.hero}
                        alt="Medical Facility"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px]" />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-white">
                    <div className="max-w-3xl">
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
                            Leading The Way in <br />
                            <span className="text-blue-400">Medical Innovation</span>
                        </h1>
                        <p className="text-xl text-slate-200 mb-10 leading-relaxed font-light">
                            Sareng Medical Equipment provides cutting-edge medical equipments and are a leading distributor to hospitals, clinics, and healthcare facilities accross Australia, supported by a dedicated professional team.
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
                                onClick={() => router.push('/CategoryFeed')}
                                className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-xl font-bold transition-all active:scale-95"
                            >
                                View Categories
                            </button>
                        </div>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
                    <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
                        <div className="w-1 h-2 bg-white rounded-full" />
                    </div>
                </div>
            </section>

            {/* Categories Grid Section */}
            <section className="py-24 bg-white relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">Essential Medical Supplies</h2>
                        <p className="text-slate-500 max-w-2xl mx-auto font-light">Our most stocked high-performance categories ready for immediate clinical integration.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {categories.map((category) => (
                            <div
                                key={category.category_id}
                                onClick={() => router.push(`/CategoryFeed?category_id=${category.category_id}`)}
                                className="group relative h-80 rounded-3xl overflow-hidden cursor-pointer shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-100"
                            >
                                <img
                                    src={category.image_url ? category.image_url : STOCK_IMAGES.default_category}
                                    alt={category.category_name}
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-slate-900/40 group-hover:bg-blue-900/40 transition-colors duration-500" />

                                <div className="absolute inset-x-0 bottom-0 p-8 text-white z-10 transition-transform duration-500 group-hover:-translate-y-2">
                                    <div className="text-xs font-bold uppercase tracking-widest text-blue-300 mb-2">{category.total_inventory} Products Available</div>
                                    <h3 className="text-2xl font-bold tracking-tight mb-2">{category.category_name}</h3>
                                    <div className="flex items-center gap-2 text-sm text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity">
                                        View Products <ArrowRight className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Expertise Section */}
            <section className="py-24 bg-white relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-slate-900 rounded-[60px] p-12 md:p-24 text-white relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2" />
                        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-600/10 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2" />

                        <div className="relative z-10 grid lg:grid-cols-2 gap-20 items-center">
                            <div>
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/20 text-blue-400 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] mb-8">
                                    Corporate Profile
                                </div>
                                <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-8 leading-tight">
                                    Who We Are
                                </h2>
                                <p className="text-slate-400 text-lg font-light leading-relaxed mb-8">
                                    We are a leading distributor of healthcare equipment, backed by years of experience and expertise in the healthcare sector. With a dedicated team of professionals,
                                    we specialize in providing high-quality, innovative healthcare solutions to hospitals, clinics, and healthcare facilities nationwide.
                                </p>
                                <p className="text-slate-400 text-lg font-light leading-relaxed">
                                    Our mission is to enhance patient care through state-of-the-art medical equipment and exceptional service. We believe in bridging the gap between clinical need and technical innovation.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                {[
                                    { label: 'Advanced Equipments', value: stats.products, sub: 'Available Now' },
                                    { label: 'Delivery', value: 'Rapid', sub: 'Across Australia' },
                                    { label: 'Tech Support', value: '24/7', sub: 'Expert Help' },
                                    { label: 'Orders', value: stats.successful_orders, sub: 'Successful Orders' }
                                ].map((stat, i) => (
                                    <div key={i} className="bg-white/5 backdrop-blur-md border border-white/10 p-6 sm:p-8 rounded-[40px] hover:bg-white/10 transition-colors group">
                                        <h4 className="text-2xl sm:text-3xl font-bold text-blue-500 mb-2 group-hover:scale-110 transition-transform inline-block">{stat.value}</h4>
                                        <p className="text-[10px] sm:text-xs font-bold text-white uppercase tracking-widest mb-1">{stat.label}</p>
                                        <p className="text-[9px] sm:text-[10px] text-slate-500 font-medium uppercase tracking-tighter">{stat.sub}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Trust Badges / Stats Section */}
            <section className="bg-slate-50 py-16 sm:py-20 border-y border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                                <Shield className="w-8 h-8" />
                            </div>
                            <h4 className="text-lg font-bold text-slate-900 mb-2">Best Quality</h4>
                            <p className="text-slate-500 text-sm font-light">Truly committed to ensuring the best quality for our customers.</p>
                        </div>
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                                <Activity className="w-8 h-8" />
                            </div>
                            <h4 className="text-lg font-bold text-slate-900 mb-2">High Reliability</h4>
                            <p className="text-slate-500 text-sm font-light">Superior Healthcare Equipment that professionals can rely on.</p>
                        </div>
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                                <Beaker className="w-8 h-8" />
                            </div>
                            <h4 className="text-lg font-bold text-slate-900 mb-2">Innovative Tech</h4>
                            <p className="text-slate-500 text-sm font-light">High Quality Innovative Solutions to Healthcare Sector.</p>
                        </div>
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                                <Box className="w-8 h-8" />
                            </div>
                            <h4 className="text-lg font-bold text-slate-900 mb-2">Rapid Logistics</h4>
                            <p className="text-slate-500 text-sm font-light">Delivery network across Australia for timely deliveries.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Us Section */}
            <section id="contact" className="py-16 sm:py-24 bg-white relative overflow-hidden">
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-blue-50 rounded-full blur-3xl opacity-50" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
                                <MessageCircle size={14} />
                                Clinical Communications
                            </div>
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 tracking-tight mb-6">
                                Connect with our <br />
                                <span className="text-blue-600">Specialist Support</span> Team
                            </h2>
                            <p className="text-slate-500 text-base sm:text-lg font-light leading-relaxed mb-10 max-w-lg">
                                Have technical inquiries or require personalized consultation? Our dedicated professionals are ready to assist with your requirements.
                            </p>

                            <div className="space-y-8">
                                <div className="flex gap-6 items-start">
                                    <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-blue-600 flex-shrink-0">
                                        <Mail size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-slate-900 mb-1">Email</h4>
                                        <p className="text-slate-500 font-light italic"> info@sarengmedequip.com</p>
                                    </div>
                                </div>
                                <div className="flex gap-6 items-start">
                                    <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-blue-600 flex-shrink-0">
                                        <Shield size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-slate-900 mb-1">Contact</h4>
                                        <p className="text-slate-500 font-light italic">1800 633 338</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-50 p-6 sm:p-10 rounded-[40px] border border-white shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-2 h-full bg-blue-600" />

                            {submitted ? (
                                <div className="py-12 flex flex-col items-center text-center animate-in zoom-in-95 duration-500">
                                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                                        <CheckCircle2 size={40} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Protocol Successful</h3>
                                    <p className="text-slate-500 font-light">Your transmission has been logged. Our specialists will respond shortly.</p>
                                    <button
                                        onClick={() => setSubmitted(false)}
                                        className="mt-8 text-blue-600 font-bold hover:underline"
                                    >
                                        Send another report
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleContactSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                                            <div className="relative">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                                                <input
                                                    required
                                                    type="text"
                                                    value={formData.name}
                                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                    placeholder="Dr. John Doe"
                                                    className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email</label>
                                            <div className="relative">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                                                <input
                                                    required
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                    placeholder="hospital@domain.com"
                                                    className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Inquiry Subject</label>
                                        <div className="relative">
                                            <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                                            <input
                                                required
                                                type="text"
                                                value={formData.subject}
                                                onChange={e => setFormData({ ...formData, subject: e.target.value })}
                                                placeholder="Bulk Order / Technical Issue / Partnership"
                                                className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Detailed Inquiry</label>
                                        <textarea
                                            required
                                            rows={4}
                                            value={formData.message}
                                            onChange={e => setFormData({ ...formData, message: e.target.value })}
                                            placeholder="Please describe your clinical requirements..."
                                            className="w-full px-5 py-4 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all resize-none"
                                        />
                                    </div>

                                    <button
                                        disabled={submitting}
                                        type="submit"
                                        className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-600 transition-all active:scale-95 shadow-xl shadow-slate-900/10 hover:shadow-blue-600/20"
                                    >
                                        {submitting ? (
                                            <Loader2 size={18} className="animate-spin" />
                                        ) : (
                                            <>
                                                Send Message
                                                <Send size={16} />
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

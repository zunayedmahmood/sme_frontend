'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    LayoutDashboard,
    Package,
    FolderKanban,
    Database,
    ClipboardList,
    TrendingUp,
    ShieldCheck,
    Users,
    Activity,
    ArrowUpRight,
    ArrowRight,
    AlertCircle,
    Loader2,
    Calendar,
    BriefcaseMedical,
    MessageCircleQuestionMark,
    ShoppingBag,
    Tag,
    Truck
} from 'lucide-react';
import {
    getAllCategories,
    getAllProductsPaginatedAdmin,
    getAdminOrderList,
    getMessages
} from '@/lib/api/api_private';

export default function DashboardPage() {
    const [stats, setStats] = useState({
        products: 0,
        categories: 0,
        orders: 0,
        messages: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [cats, prods, orders, messages] = await Promise.all([
                    getAllCategories(),
                    getAllProductsPaginatedAdmin({ per_page: 1 }),
                    getAdminOrderList({ per_page: 1 }),
                    getMessages({ per_page: 1 })
                ]);

                // Guessing structure based on previous patterns
                setStats({
                    categories: cats.data?.length || cats.length || 0,
                    products: prods.data?.pagination?.total || 0,
                    orders: orders.data?.total || 0,
                    messages: messages.data?.total || 0
                });
            } catch (err) {
                console.error('Core analytics failure.', err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const quickActions = [
        { title: 'Products', description: 'Add, Delete or Update products inside database', icon: ShoppingBag, href: '/dashboard/products', color: 'bg-blue-500' },
        { title: 'Categories', description: 'Go to categories page', icon: Tag, href: '/dashboard/categories', color: 'bg-indigo-500' },
        { title: 'Inventories', description: 'Controll all stock of all products', icon: Package, href: '/dashboard/inventories', color: 'bg-teal-500' },
        { title: 'Orders', description: 'Verify order logs and history', icon: ClipboardList, href: '/dashboard/orderlist', color: 'bg-slate-700' },
        { title: 'Logistics', description: 'Configure global delivery charges', icon: Truck, href: '/dashboard/delivery', color: 'bg-amber-500' },
        { title: 'Contact Messages', description: 'Check messages from customers', icon: MessageCircleQuestionMark, href: '/dashboard/contact_messages', color: 'bg-olive-500' },
    ];

    return (
        <div className="space-y-12 animate-in fade-in duration-700 max-w-7xl mx-auto pb-12">
            {/* Intro Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 pb-10">
                <div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-none mb-2">Central Admin Control</h1>
                    <p className="text-slate-500 font-light text-lg">Collective logistics and equipments inventory management overhead. {new Date().toLocaleDateString(undefined, { dateStyle: 'full' })}.</p>
                </div>
            </div>

            {/* Core Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Product Variety', value: stats.products, icon: ShoppingBag, sub: 'Active Products' },
                    { label: 'Categories', value: stats.categories, icon: Tag, sub: 'Categories in Shop' },
                    { label: 'Total Orders', value: stats.orders, icon: ClipboardList, sub: 'Collection of Orders' },
                    { label: 'Messages', value: stats.messages, icon: MessageCircleQuestionMark, sub: 'Contact Messages' },
                ].map((metric, i) => (
                    <div key={i} className="bg-white border border-slate-100 p-8 rounded-[32px] shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-500 group relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <metric.icon size={120} />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-start justify-between mb-8">
                                <div className="p-4 bg-slate-50 text-slate-400 group-hover:bg-blue-600 group-hover:text-white rounded-2xl transition-all duration-500">
                                    <metric.icon size={24} />
                                </div>
                            </div>
                            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">{metric.label}</h3>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-black text-slate-900 tracking-tighter">
                                    {loading ? <Loader2 className="animate-spin w-6 h-6 text-slate-200" /> : metric.value}
                                </span>
                            </div>
                            <p className="text-xs font-bold text-slate-300 mt-4 flex items-center gap-1 uppercase tracking-widest">
                                <Activity size={10} />
                                {metric.sub}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Action Grid & Recent Activity */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Quick Actions */}
                <div className="xl:col-span-2 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                            <LayoutDashboard className="text-blue-600 w-6 h-6" />
                            Operations Matrix
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {quickActions.map((action, i) => (
                            <Link key={i} href={action.href} className="group relative bg-white border border-slate-100 p-8 rounded-[40px] shadow-sm hover:shadow-2xl hover:border-blue-400 hover:-translate-y-1 transition-all duration-500 flex items-center gap-8 overflow-hidden">
                                <div className={`w-20 h-20 ${action.color} text-white rounded-[24px] flex items-center justify-center shrink-0 shadow-lg group-hover:rotate-12 transition-transform duration-500 relative z-10`}>
                                    <action.icon size={32} />
                                </div>
                                <div className="relative z-10 flex-1">
                                    <h4 className="text-xl font-bold text-slate-900 uppercase tracking-tight mb-1 group-hover:text-blue-600 transition-colors">{action.title}</h4>
                                    <p className="text-sm text-slate-400 font-light leading-relaxed">{action.description}</p>
                                </div>
                                <div className="absolute right-8 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-500">
                                    <ArrowRight className="text-blue-600 w-8 h-8" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* System Alerts / Status */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3 px-2">
                        <TrendingUp className="text-blue-600 w-6 h-6" />
                        Live Diagnostics
                    </h2>
                    <div className="bg-slate-900 rounded-[48px] p-10 text-white relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
                        <div className="relative z-10 space-y-10">
                            <div>
                                <p className="text-blue-400 font-bold text-[10px] uppercase tracking-[0.4em] mb-4">Payment Gateway</p>
                                <h3 className="text-3xl font-black tracking-tight leading-tight">Online Payment Gateway used: STRIPE</h3>
                            </div>

                            <Link href="https://dashboard.stripe.com/acct_1T733T3Cp1E8QdKT/test/dashboard">
                                <button className="w-full py-5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3">
                                    <ArrowUpRight size={14} />
                                    Stripe Page
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
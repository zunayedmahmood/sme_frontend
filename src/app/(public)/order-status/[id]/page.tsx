'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getOrderById, manualOrderPayment } from '@/lib/api/api_public';
import {
    Package,
    MapPin,
    CreditCard,
    Loader2,
    CheckCircle2,
    Clock,
    XCircle,
    Truck,
    Receipt,
    Calendar,
    ArrowLeft,
    CircleArrowRight
} from 'lucide-react';
import Link from 'next/link';

// ─── Constants ───────────────────────────────────────────────────────────────

// Attribution: https://unsplash.com/illustrations/a-graphic-icon-representing-a-landscape-with-mountains-and-sun-XjQ8nxFvHxw?utm_source=unsplash&utm_medium=referral&utm_content=creditShareLink
const PLACEHOLDER_IMG = '/placeholder_no_image.jpg';


// ─── UI Components ───────────────────────────────────────────────────────────

const StatusBadge = ({ status }: { status: string }) => {
    const config: Record<string, { icon: any, color: string, bg: string }> = {
        'Pending': { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
        'Confirmed': { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        'Cancelled': { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
        'Paid': { icon: CheckCircle2, color: 'text-blue-600', bg: 'bg-blue-50' },
        'Unpaid': { icon: XCircle, color: 'text-slate-400', bg: 'bg-slate-100' },
        'Failed': { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100' },
    };

    const { icon: Icon, color, bg } = config[status] || config['Pending'];

    return (
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${bg} ${color} border border-current/10 font-bold text-[10px] uppercase tracking-widest`}>
            <Icon size={14} />
            {status}
        </div>
    );
};

export default function OrderDetailsPage() {
    const { id } = useParams();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState(false);

    const handleManualPayment = async () => {
        if (!order) return;
        setActionLoading(true);
        try {
            const res = await manualOrderPayment(order.order_id);
            if (res.success && res.checkout_url) {
                window.location.href = res.checkout_url;
            } else {
                alert(res.message || "Payment initialization failed.");
            }
        } catch (err) {
            console.error("Payment error:", err);
            alert("Connection to payment gateway failed.");
        } finally {
            setActionLoading(false);
        }
    };

    useEffect(() => {
        if (!id) return;

        (async () => {
            try {
                const res = await getOrderById(id as string);
                if (res.success) {
                    setOrder(res.data);
                } else {
                    setError(res.message);
                }
            } catch (err) {
                console.error("Order fetch error:", err);
                setError("Protocol failed to retrieve requisition data.");
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-6">
                <Loader2 className="text-blue-600 animate-spin" size={40} />
                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em]">Accessing Order Records...</p>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-8 px-4">
                <div className="w-20 h-20 rounded-[32px] bg-red-50 text-red-500 flex items-center justify-center">
                    <XCircle size={40} />
                </div>
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">Order Not Found</h2>
                    <p className="text-slate-500 font-medium text-sm">The requested order {id} could not be found.</p>
                </div>
                <Link href="/" className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all">
                    Return to Catalog
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50 pb-20">
            {/* ── Progress Header ── */}
            <div className="bg-white border-b border-slate-100 sticky top-20 z-10 hidden sm:block">
                <div className="max-w-6xl mx-auto px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-10">
                        <Link href="/" className="text-slate-400 hover:text-blue-600 transition-colors flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                            <ArrowLeft size={14} />
                            Exit to Catalog
                        </Link>
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <p className="text-[10px] font-bold text-slate-900 uppercase tracking-[0.2em]">Order Id: {order.order_id}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-8 text-[10px] font-bold uppercase tracking-widest">
                        <span className="text-emerald-500 flex items-center gap-2"><CheckCircle2 size={12} /> Order</span>
                        <div className="w-10 h-px bg-slate-200" />
                        <span className={`${order.order_status !== 'Pending' ? 'text-emerald-500' : 'text-blue-600'} flex items-center gap-2`}>
                            {order.order_status !== 'Pending' ? <CheckCircle2 size={12} /> : <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />} Logistics
                        </span>
                        <div className="w-10 h-px bg-slate-100" />
                        <span className="text-slate-300">Complete</span>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 sm:py-16">
                <div className="flex flex-col lg:grid lg:grid-cols-[1fr_400px] gap-8 lg:gap-12 items-start">

                    {/* ═══════════════ MAIN CONTENT ═══════════════ */}
                    <div className="space-y-6 sm:space-y-8 w-full order-2 lg:order-1">

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
                            <div>
                                <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Order Details</h1>
                                <p className="text-slate-400 font-bold text-[9px] sm:text-[10px] uppercase tracking-[0.2em] mt-2">Authenticated on {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString()}</p>
                            </div>
                            <div className="flex flex-wrap gap-2 sm:gap-3">
                                <StatusBadge status={order.order_status} />
                                <StatusBadge status={order.payment_status} />
                            </div>
                        </div>

                        {/* ── 1. Logistics Summary ── */}
                        <div className="bg-white rounded-3xl sm:rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/40 p-6 sm:p-10">
                            <div className="flex items-center gap-4 mb-8 sm:mb-10">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm border border-blue-100">
                                    <Package size={20} className="sm:hidden" />
                                    <Package size={24} className="hidden sm:block" />
                                </div>
                                <div>
                                    <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-none mb-1">Supplies Log</h3>
                                    <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Verified Items</p>
                                </div>
                                <div className="flex-1 h-px bg-slate-100 ml-2 sm:ml-4" />
                            </div>

                            <div className="space-y-3 sm:space-y-4">
                                {order.ordered_products?.map((item: any, idx: number) => (
                                    <div key={idx} className="flex items-center gap-4 sm:gap-6 p-4 bg-slate-50/50 rounded-2xl sm:rounded-[28px] border border-transparent hover:border-blue-100 transition-all group">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm sm:text-base font-bold text-slate-900 tracking-tight truncate">{item.name}</p>
                                            <div className="flex items-center gap-2 sm:gap-3 mt-1.5">
                                                <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 bg-slate-100 px-2 sm:px-3 py-1 rounded-full uppercase tracking-widest">Qty: {item.qty}</span>
                                                <span className="text-[10px] sm:text-xs font-bold text-slate-400">${item.price} / unit</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-base sm:text-lg font-black text-slate-900 tracking-tighter">${(item.price * item.qty).toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* ── 2. Logistics Coordinates & Customer ── */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 text-left">
                            <div className="bg-white rounded-3xl sm:rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/40 p-6 sm:p-10">
                                <MapPin size={24} className="text-blue-500 mb-6" />
                                <h4 className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">Delivery Address</h4>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm font-bold text-slate-900 leading-tight mb-1">{order.address?.line1}</p>
                                        <p className="text-[9px] sm:text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                                            {order.address?.suburb}, {order.address?.state} {order.address?.postcode}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3 pt-4 border-t border-slate-50 text-slate-400">
                                        <Truck size={14} />
                                        <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest">Delivery Route</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-3xl sm:rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/40 p-6 sm:p-10">
                                <CreditCard size={24} className="text-emerald-500 mb-6" />
                                <h4 className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">Customer Details</h4>
                                <div className="space-y-3">
                                    <p className="text-sm font-bold text-slate-900 leading-none">{order.customer_details?.name}</p>
                                    <p className="text-xs font-semibold text-slate-500">{order.customer_details?.phone}</p>
                                    <p className="text-xs font-semibold text-slate-500">{order.customer_details?.email}</p>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* ═══════════════ SIDEBAR REQUISITION DATA ═══════════════ */}
                    <div className="lg:sticky lg:top-32 space-y-6 w-full order-1 lg:order-2">
                        <div className="bg-slate-900 rounded-[32px] sm:rounded-[48px] p-6 sm:p-10 text-white shadow-2xl shadow-blue-900/10 overflow-hidden relative">
                            {/* Background visual */}
                            <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-blue-600 rounded-full blur-[100px] opacity-10 -mr-20 -mt-20" />
                            <div className="absolute bottom-0 left-0 w-[150px] h-[150px] bg-emerald-600 rounded-full blur-[80px] opacity-5 -ml-20 -mb-20" />

                            <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-blue-400 mb-6 sm:mb-8">Order Document</h2>

                            <div className="space-y-4 mb-8 sm:mb-10">
                                <div className="flex justify-between items-center text-slate-400 border-b border-white/5 pb-4">
                                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                        <Receipt size={14} /> ID
                                    </span>
                                    <span className="text-xs sm:text-sm font-black text-white">{order.order_id}</span>
                                </div>

                                <div className="flex justify-between items-center text-slate-400 border-b border-white/5 pb-4">
                                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                        <Calendar size={14} /> Date
                                    </span>
                                    <span className="text-xs sm:text-sm font-black text-white">{new Date(order.created_at).toLocaleDateString()}</span>
                                </div>

                                <div className="flex justify-between items-center text-slate-400 border-b border-white/5 pb-4">
                                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                        <CreditCard size={14} /> Payment Method
                                    </span>
                                    <span className="text-[10px] sm:text-sm font-black text-white uppercase tracking-tighter">
                                        {order.payment_method === 'COD' ? 'Cash Settlement' : 'Online Stripe'}
                                    </span>
                                </div>

                                {order.payment_method === 'Online' && order.stripe_id_record && (
                                    <div className="flex flex-col gap-3 text-slate-400 border-b border-white/5 pb-6">
                                        <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-blue-400 flex items-center gap-2">
                                            <CreditCard size={14} /> Stripe Registry
                                        </span>
                                        <div className="space-y-2">
                                            <div>
                                                <p className="text-[8px] font-bold uppercase text-slate-500 tracking-widest leading-none mb-1">Session</p>
                                                <p className="text-[9px] sm:text-[10px] font-mono text-blue-400/80 break-all">{order.stripe_id_record.stripe_checkout_session_id}</p>
                                            </div>
                                            {order.stripe_id_record.stripe_payment_intent_id && (
                                                <div>
                                                    <p className="text-[8px] font-bold uppercase text-slate-500 tracking-widest leading-none mb-1">Intent</p>
                                                    <p className="text-[9px] sm:text-[10px] font-mono text-blue-400/80 break-all">{order.stripe_id_record.stripe_payment_intent_id}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="pt-6 sm:pt-8 flex justify-between items-end">
                                    <div>
                                        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-500 block mb-2">Total Price</span>
                                        <span className="text-3xl sm:text-4xl font-black text-white tracking-tighter">
                                            ${Number(order.total_price).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {order.order_status === 'Pending' && order.payment_status !== 'Paid' && order.payment_method === 'Online' && (
                                    <button
                                        onClick={handleManualPayment}
                                        disabled={actionLoading}
                                        className="w-full py-4 sm:py-5 bg-blue-600 text-white font-bold text-[10px] sm:text-xs uppercase tracking-[0.2em] rounded-2xl sm:rounded-[24px] hover:bg-blue-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-500/20 disabled:opacity-50"
                                    >
                                        {actionLoading ? <Loader2 className="animate-spin" size={16} /> : <CreditCard size={16} />}
                                        Pay Now
                                    </button>
                                )}

                                <button
                                    onClick={() => window.print()}
                                    className="w-full py-4 sm:py-5 bg-white/5 border border-white/10 text-white font-bold text-[10px] sm:text-xs uppercase tracking-[0.2em] rounded-2xl sm:rounded-[24px] hover:bg-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-3 backdrop-blur-md"
                                >
                                    <Receipt size={16} /> Print Records
                                </button>
                            </div>
                        </div>

                        {/* Help Desk */}
                        <div className="bg-white rounded-[32px] border border-slate-100 p-6 shadow-sm">
                            <h4 className="text-xs font-black text-slate-900 tracking-tight mb-2">Technical Assistance?</h4>
                            <p className="text-[10px] font-medium text-slate-400 leading-relaxed">
                                Our logistics coordinators are standing by for any clinical discrepancies.
                                <br /><span>Support: 1800 633 338</span>
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
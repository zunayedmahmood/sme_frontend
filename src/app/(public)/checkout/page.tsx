'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { updateForCart, getGlobalDeliveryCharge, sellProduct } from '@/lib/api/api_public';
import { useCart } from '@/context/CartContext';
import {
    Package,
    User,
    MapPin,
    CreditCard,
    Loader2,
    ChevronDown,
    Check,
    AlertCircle,
    ShieldCheck,
    Truck,
    ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

// ─── Types ───────────────────────────────────────────────────────────────────

interface CartItem {
    product_id: number;
    variation_id: number | null;
    qty: number;
    price: string;
    product_name: string;
    image_src: string[];
    available_stock: number;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const PLACEHOLDER_IMG = '/stock_image.png';

const AUSTRALIAN_STATES = ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'];


// ─── UI Components ───────────────────────────────────────────────────────────

const SectionHeader = ({ icon: Icon, label, step }: { icon: any; label: string; step: number }) => (
    <div className="flex items-center gap-4 mb-8">
        <div className="w-8 h-8 rounded-xl bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-600/20">
            {step}
        </div>
        <div className="flex items-center gap-2 text-slate-400">
            <Icon size={16} />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{label}</span>
        </div>
        <div className="flex-1 h-px bg-slate-100" />
    </div>
);

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
    <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 mb-2 ml-1">{children}</label>
);

const FieldError = ({ msg }: { msg?: string }) =>
    msg ? <p className="text-[10px] text-red-500 font-bold mt-2 ml-1 animate-in slide-in-from-top-1">{msg}</p> : null;

const inputClass = "w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all placeholder:text-slate-300";

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function OrderPage() {
    const router = useRouter();
    const { clearCart, cartDetails, loading: loadingCart } = useCart();

    // Customer state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');

    // Address state (Australia)
    const [line1, setLine1] = useState('');
    const [suburb, setSuburb] = useState('');
    const [state, setState] = useState('');
    const [postcode, setPostcode] = useState('');

    // Delivery state
    const [deliveryCharge, setDeliveryCharge] = useState<number | null>(null);
    const [loadingDelivery, setLoadingDelivery] = useState(false);

    // Payment state
    const [paymentMethod, setPaymentMethod] = useState<'COD' | 'Online' | ''>('');
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // ── Pre-fetch Cart ────────────────────────────────────────────────────────
    // Now handled by useCart context automatically

    // ── Fetch Delivery Charge (Global) ────────────────────────────────────────
    useEffect(() => {
        setLoadingDelivery(true);
        getGlobalDeliveryCharge()
            .then(res => setDeliveryCharge(res.delivery_charge ?? 15.00))
            .catch(err => {
                console.error("Delivery charge error:", err);
                setDeliveryCharge(15.00); // Fallback
            })
            .finally(() => setLoadingDelivery(false));
    }, []);

    // ── Totals ───────────────────────────────────────────────────────────────
    const subtotal = useMemo(() => {
        const raw = typeof window !== 'undefined' ? localStorage.getItem('cart') : null;
        const cartMap: Record<string, number> = raw ? JSON.parse(raw) : {};
        return cartDetails.reduce((acc, i) => {
            const qty = cartMap[i.cart_key] || 0;
            return acc + (Number(i.selling_price) * qty);
        }, 0);
    }, [cartDetails]);

    const total = deliveryCharge !== null ? subtotal + deliveryCharge : null;

    // ── Validation & Submission ───────────────────────────────────────────────
    const validate = () => {
        const e: Record<string, string> = {};
        if (!name.trim()) e.name = 'Full name is required';
        if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) e.email = 'Valid clinical email required';
        if (!phone.trim() || phone.length < 8) e.phone = 'Complete phone number required';
        if (!line1.trim()) e.line1 = 'Street address is required';
        if (!suburb.trim()) e.suburb = 'Suburb/City is required';
        if (!state) e.state = 'Select state';
        if (!postcode.trim() || postcode.length !== 4) e.postcode = 'Valid 4-digit postcode required';
        if (!paymentMethod) e.payment = 'Select payment protocol';
        if (cartDetails.length === 0) e.cart = 'Requisition hub is empty';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setSubmitting(true);
        try {
            // Re-fetch cart keys to map accurately
            const raw = localStorage.getItem('cart');
            const cartMap: Record<string, number> = raw ? JSON.parse(raw) : {};

            const productsPayload = cartDetails.map(d => ({
                product_id: d.id,
                variation_id: d.variation_id || null,
                quantity: cartMap[d.cart_key] || 0
            }));

            const res = await sellProduct(
                productsPayload,
                {
                    payment_method: paymentMethod,
                    customer_details: { name, email, phone },
                    address: {
                        line1,
                        suburb,
                        state,
                        postcode
                    },
                }
            );
            clearCart();
            if (paymentMethod === 'Online' && res.checkout_url) {
                window.location.href = res.checkout_url;
            } else {
                router.push(`/order-status/${res.order.order_id}`);
            }
        } catch (e) {
            console.error(e);
            setErrors({ submit: 'Requisition failed protocols. Please re-attempt.' });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/50">

            {/* ── Sub-header ── */}
            <div className="bg-white border-b border-slate-100 sticky top-20 z-10 hidden sm:block">
                <div className="max-w-6xl mx-auto px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-10">
                        <Link href="/" className="text-slate-400 hover:text-blue-600 transition-colors flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                            <ArrowLeft size={14} />
                            Exit to Catalog
                        </Link>
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                            <p className="text-[10px] font-bold text-slate-900 uppercase tracking-[0.2em]">Live Order Process</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-8 text-[10px] font-bold uppercase tracking-widest">
                        <span className="text-green-600 flex items-center gap-2"><Check size={12} /> Order</span>
                        <div className="w-10 h-px bg-slate-100" />
                        <span className="text-blue-600 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-600" /> Logistics</span>
                        <div className="w-10 h-px bg-slate-100" />
                        <span className="text-slate-300">Complete</span>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 sm:py-16">
                <div className="flex flex-col lg:grid lg:grid-cols-[1fr_400px] gap-8 lg:gap-12 items-start">

                    {/* ═══════════════ REQUISITION FORM ═══════════════ */}
                    <div className="space-y-6 sm:space-y-8 w-full order-2 lg:order-1">
                        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight lg:hidden mb-6">Checkout</h1>

                        {/* ── 1. Logistics Summary ── */}
                        <div className="bg-white rounded-3xl sm:rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
                            <div className="p-6 sm:p-10">
                                <SectionHeader icon={Package} label="Supplies" step={1} />

                                {loadingCart ? (
                                    <div className="flex flex-col items-center justify-center py-10 sm:py-20 gap-4">
                                        <Loader2 className="text-blue-600 animate-spin" size={32} />
                                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Validating Cart...</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {cartDetails.map(item => {
                                             // Get qty from local storage directly as it's the source of truth for counts
                                             const raw = typeof window !== 'undefined' ? localStorage.getItem('cart') : null;
                                             const cartMap: Record<string, number> = raw ? JSON.parse(raw) : {};
                                             const qty = cartMap[item.cart_key] || 0;

                                             return (
                                            <div key={item.cart_key} className="flex items-center gap-4 sm:gap-6 p-4 bg-slate-50/50 border border-transparent hover:border-blue-100 hover:bg-white rounded-[28px] transition-all group">
                                                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-white border border-slate-100 flex-shrink-0">
                                                    <img src={item.image_src?.[0] || PLACEHOLDER_IMG} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm sm:text-base font-bold text-slate-900 truncate tracking-tight">{item.name}</p>
                                                    {item.variation_id && (
                                                        <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-0.5">Variation Selected</p>
                                                    )}
                                                    <div className="flex items-center gap-2 sm:gap-3 mt-1.5">
                                                        <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 bg-slate-100 px-2 sm:px-3 py-1 rounded-full uppercase tracking-widest">
                                                            Qty: {qty}
                                                        </span>
                                                        <span className="text-[10px] sm:text-xs font-bold text-blue-600">${item.selling_price} / unit</span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-base sm:text-lg font-bold text-slate-900 tracking-tighter">${(Number(item.selling_price) * qty).toLocaleString()}</p>
                                                </div>
                                            </div>
                                             );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ── 2. Personnel Details ── */}
                        <div className="bg-white rounded-3xl sm:rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/40 p-6 sm:p-10">
                            <SectionHeader icon={User} label="Personnel Details" step={2} />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                <div className="sm:col-span-2">
                                    <FieldLabel>Full Legal Name</FieldLabel>
                                    <input className={inputClass} placeholder="Enter full name" value={name} onChange={e => setName(e.target.value)} />
                                    <FieldError msg={errors.name} />
                                </div>
                                <div>
                                    <FieldLabel>Email</FieldLabel>
                                    <input className={inputClass} type="email" placeholder="name@healthcare.com" value={email} onChange={e => setEmail(e.target.value)} />
                                    <FieldError msg={errors.email} />
                                </div>
                                <div>
                                    <FieldLabel>Primary Contact</FieldLabel>
                                    <input className={inputClass} type="tel" placeholder="01XXXXXXXXX" value={phone} onChange={e => setPhone(e.target.value)} />
                                    <FieldError msg={errors.phone} />
                                </div>
                            </div>
                        </div>

                        {/* ── 3. Logistics Coordinates ── */}
                        <div className="bg-white rounded-3xl sm:rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/40 p-6 sm:p-10">
                            <SectionHeader icon={MapPin} label="Logistics Coordinates" step={3} />
                            <div className="space-y-6">
                                <div>
                                    <FieldLabel>Street Address (Line 1)</FieldLabel>
                                    <input
                                        className={inputClass}
                                        placeholder="House # and Street Name"
                                        value={line1}
                                        onChange={e => setLine1(e.target.value)}
                                    />
                                    <FieldError msg={errors.line1} />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                    <div>
                                        <FieldLabel>Suburb / City</FieldLabel>
                                        <input
                                            className={inputClass}
                                            placeholder="Enter suburb"
                                            value={suburb}
                                            onChange={e => setSuburb(e.target.value)}
                                        />
                                        <FieldError msg={errors.suburb} />
                                    </div>
                                    <div>
                                        <FieldLabel>State</FieldLabel>
                                        <div className="relative">
                                            <select
                                                className={`${inputClass} appearance-none pr-12`}
                                                value={state}
                                                onChange={e => setState(e.target.value)}
                                            >
                                                <option value="">Select State</option>
                                                {AUSTRALIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                            <div className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 rotate-0 group-hover:rotate-180 transition-transform"><ChevronDown size={18} /></div>
                                        </div>
                                        <FieldError msg={errors.state} />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <FieldLabel>Postcode</FieldLabel>
                                        <input
                                            className={inputClass}
                                            type="text"
                                            pattern="[0-9]*"
                                            maxLength={4}
                                            placeholder="e.g. 2000"
                                            value={postcode}
                                            onChange={e => setPostcode(e.target.value.replace(/\D/g, ''))}
                                        />
                                        <FieldError msg={errors.postcode} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── 4. Financial Protocol ── */}
                        <div className="bg-white rounded-3xl sm:rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/40 p-6 sm:p-10">
                            <SectionHeader icon={CreditCard} label="Financial Protocol" step={4} />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {(['COD', 'Online'] as const).map(method => {
                                    const selected = paymentMethod === method;
                                    return (
                                        <button
                                            key={method}
                                            type="button"
                                            onClick={() => setPaymentMethod(method)}
                                            className={`group relative flex items-center gap-4 px-6 py-5 sm:py-6 rounded-3xl border-2 transition-all duration-300 ${selected
                                                ? 'border-blue-600 bg-blue-50/30'
                                                : 'border-slate-100 bg-slate-50 hover:border-slate-200 hover:bg-white'
                                                }`}
                                        >
                                            <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${selected ? 'border-blue-600 bg-blue-600' : 'border-slate-300'}`}>
                                                {selected && <Check size={12} className="text-white" />}
                                            </div>
                                            <div className="text-left">
                                                <p className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">{method === 'COD' ? 'Cash Settlement' : 'Digital Transfer'}</p>
                                                <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                                    {method === 'COD' ? 'Pay On-Delivery' : 'Via Stripe Secured Network'}
                                                </p>
                                            </div>
                                            {selected && (
                                                <div className="absolute top-4 right-4 text-blue-600 animate-in zoom-in-50">
                                                    <ShieldCheck size={18} />
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                            <FieldError msg={errors.payment} />
                        </div>
                    </div>

                    {/* ═══════════════ REQUISITION SUMMARY — RIGHT COLUMN ═══════════════ */}
                    <div className="lg:sticky lg:top-32 space-y-6 w-full order-1 lg:order-2">
                        <div className="bg-slate-900 rounded-[32px] sm:rounded-[48px] p-6 sm:p-10 text-white shadow-2xl shadow-blue-900/10 overflow-hidden relative">
                            {/* Visual background gradient */}
                            <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-blue-600 rounded-full blur-[100px] opacity-20 -mr-20 -mt-20" />

                            <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-blue-400 mb-6 sm:mb-8">Order Summary</h2>

                            <div className="space-y-4 mb-8 sm:mb-10">
                                <div className="flex justify-between items-center text-slate-400">
                                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest">Subtotal</span>
                                    <span className="text-base sm:text-lg font-bold text-white tracking-tighter">${subtotal.toLocaleString()}</span>
                                </div>

                                <div className="flex justify-between items-center text-slate-400 relative">
                                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                        <Truck size={14} className="text-blue-500" />
                                        Logistics Cost
                                    </span>
                                    {loadingDelivery ? (
                                        <Loader2 className="animate-spin text-blue-500" size={16} />
                                    ) : (
                                        <span className="text-base sm:text-lg font-bold text-white tracking-tighter">
                                            {deliveryCharge !== null ? `$${deliveryCharge.toLocaleString()}` : '--'}
                                        </span>
                                    )}
                                </div>

                                <div className="pt-6 sm:pt-8 border-t border-slate-800 flex justify-between items-end">
                                    <div>
                                        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-500 block mb-2">Total Cost</span>
                                        <span className="text-3xl sm:text-4xl font-black text-white tracking-tighter">
                                            {total !== null ? `$${total.toLocaleString()}` : '---'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={submitting || loadingCart || cartDetails.length === 0}
                                className="w-full py-5 sm:py-6 bg-blue-600 text-white font-bold text-xs sm:text-sm uppercase tracking-[0.2em] rounded-[24px] shadow-2xl shadow-blue-600/20 hover:bg-blue-700 hover:-translate-y-1 active:translate-y-0 disabled:opacity-30 disabled:translate-y-0 transition-all duration-300 flex items-center justify-center gap-3 group"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="animate-spin" />
                                        <span>Submitting Order...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Confirm Order</span>
                                        <ChevronDown className="rotate-[-90deg] group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>

                            {errors.submit && (
                                <p className="mt-4 text-center text-[10px] sm:text-xs font-bold text-red-400 animate-in fade-in zoom-in-95">{errors.submit}</p>
                            )}
                        </div>

                        {/* Support Info */}
                        <div className="bg-blue-50/50 rounded-3xl border border-blue-100 p-6">
                            <p className="text-[11px] sm:text-xs text-slate-600 font-medium leading-relaxed">
                                Need assistance with your institutional requisition? Contact our technical support at 1800 633 338 or email us at info@sarengmedequip.com or leave a message <Link href="/#contact" className="text-slate-500 hover:text-blue-600 transition-colors">here</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
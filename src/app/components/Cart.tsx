'use client';

import React, { useEffect, useRef, useMemo, useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import {
    X,
    Trash2,
    Plus,
    Minus,
    ShoppingCart,
    ChevronRight,
    ShieldCheck,
    AlertCircle,
    Loader2
} from 'lucide-react';

const PLACEHOLDER_IMG = '/stock_image.png';

const CartItemRow = ({ productId, quantity }: { productId: number, quantity: number }) => {
    const { cartDetails, removeFromCart, updateQuantity } = useCart();
    const detail = useMemo(() => cartDetails.find(d => d.id === productId), [cartDetails, productId]);
    const [confirmDelete, setConfirmDelete] = useState(false);

    if (!detail) return (
        <div className="flex gap-4 p-4 animate-pulse">
            <div className="w-20 h-20 bg-slate-100 rounded-2xl" />
            <div className="flex-1 space-y-3 py-1">
                <div className="h-4 bg-slate-100 rounded w-3/4" />
                <div className="h-3 bg-slate-100 rounded w-1/4" />
            </div>
        </div>
    );

    const imageUrl = detail.image_src[0] || PLACEHOLDER_IMG;

    return (
        <>
            {/* Delete Confirmation Modal */}
            {confirmDelete && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[32px] w-full max-w-xs p-8 shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-300 border border-slate-100">
                        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-3xl mx-auto flex items-center justify-center">
                            <Trash2 size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Remove Supplies?</h3>
                            <p className="text-sm text-slate-500 mt-2 font-light leading-relaxed px-2">
                                Are you sure you want to remove <span className="font-bold text-slate-900">{detail.name}</span> from your cart list?
                            </p>
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => setConfirmDelete(false)}
                                className="flex-1 py-3.5 bg-slate-50 text-slate-500 font-bold text-xs rounded-2xl hover:bg-slate-100 transition-all active:scale-95"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => { removeFromCart(productId); setConfirmDelete(false); }}
                                className="flex-1 py-3.5 bg-red-600 text-white font-bold text-xs rounded-2xl shadow-lg shadow-red-600/20 hover:bg-red-700 transition-all active:scale-95"
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex gap-5 p-5 bg-white border border-slate-100 rounded-[32px] hover:border-blue-200 hover:shadow-xl hover:shadow-blue-600/5 transition-all duration-300 group">
                <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 bg-slate-50 relative">
                    <img
                        src={imageUrl}
                        alt={detail.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                </div>

                <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                        <div className="flex justify-between items-start gap-2">
                            <h4 className="text-sm font-bold text-slate-900 line-clamp-1 tracking-tight">{detail.name}</h4>
                            <button
                                onClick={() => setConfirmDelete(true)}
                                className="text-slate-300 hover:text-red-500 transition-colors -mt-1 -mr-1 p-1"
                            >
                                <X size={16} />
                            </button>
                        </div>
                        <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-0.5">Unit Price: ${detail.selling_price}</p>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center bg-slate-50 border border-slate-100 rounded-xl p-1 gap-1">
                            <button
                                onClick={() => updateQuantity(productId, quantity - 1, detail.available_stock)}
                                className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-white rounded-lg transition-all active:scale-90"
                            >
                                <Minus size={14} />
                            </button>
                            <span className="w-8 text-center text-sm font-bold text-slate-900">{quantity}</span>
                            <button
                                onClick={() => updateQuantity(productId, quantity + 1, detail.available_stock)}
                                className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-white rounded-lg transition-all active:scale-90"
                            >
                                <Plus size={14} />
                            </button>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Subtotal</p>
                            <p className="text-sm font-black text-slate-900 tracking-tight">${detail.selling_price * quantity}</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default function Cart() {
    const { isCartOpen, setIsCartOpen, cart, subtotal, loading, refreshCart } = useCart();
    const router = useRouter();
    const drawerRef = useRef<HTMLDivElement>(null);

    // Initial refresh when opened
    useEffect(() => {
        if (isCartOpen) {
            refreshCart();
        }
    }, [isCartOpen]);

    // Handle body scroll locking
    useEffect(() => {
        if (isCartOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }, [isCartOpen]);

    const handleCheckout = () => {
        setIsCartOpen(false);
        router.push('/order');
    };

    const cartEntries = Object.entries(cart);

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 z-[150] bg-slate-900/40 backdrop-blur-sm transition-opacity duration-500 ${isCartOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsCartOpen(false)}
            />

            {/* Sidebar Requisition Panel */}
            <aside
                ref={drawerRef}
                className={`fixed top-0 right-0 z-[160] h-full w-full sm:w-[480px] bg-slate-50/95 backdrop-blur-xl shadow-[-40px_0_120px_-20px_rgba(0,0,0,0.1)] transition-transform duration-500 ease-out transform flex flex-col ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                {/* Header */}
                <div className="p-8 pb-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Order Cart</h2>
                    </div>
                    <button
                        onClick={() => setIsCartOpen(false)}
                        className="w-12 h-12 bg-white border border-slate-200 text-slate-400 hover:text-slate-900 rounded-2xl flex items-center justify-center transition-all shadow-sm hover:shadow-md active:scale-95"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Loading State Overlay */}
                {loading && (
                    <div className="absolute top-28 left-0 w-full px-8 z-10">
                        <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-600 animate-[loading-bar_1.5s_infinite]" />
                        </div>
                    </div>
                )}

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto px-8 py-6 space-y-4 scrollbar-hide">
                    {cartEntries.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center px-10">
                            <div className="w-24 h-24 bg-white border border-slate-100 rounded-[40px] flex items-center justify-center mb-8 shadow-sm">
                                <ShoppingCart size={40} className="text-slate-200" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Empty Cart</h3>
                            <p className="text-slate-500 font-light mt-2 leading-relaxed">
                                No clinical equipment has been added to this cart. Use the catalog to add items.
                            </p>
                            <button
                                onClick={() => setIsCartOpen(false)}
                                className="mt-10 px-8 py-3.5 bg-blue-600 text-white font-bold text-sm rounded-2xl shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95"
                            >
                                Return to Catalog
                            </button>
                        </div>
                    ) : (
                        cartEntries.map(([productId, quantity]) => (
                            <CartItemRow
                                key={productId}
                                productId={parseInt(productId)}
                                quantity={quantity}
                            />
                        ))
                    )}
                </div>

                {/* Requisition Summary Footer */}
                <div className="p-10 bg-white border-t border-slate-100 rounded-t-[48px] shadow-[0_-20px_50px_-15px_rgba(0,0,0,0.03)] space-y-8">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between text-slate-500 font-medium">
                            <span className="text-sm">Total items</span>
                            <span className="text-sm font-bold text-slate-900">{cartEntries.length} Items</span>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                            <span className="text-lg font-bold text-slate-900">Total Valuation</span>
                            <div className="text-right">
                                <span className="text-3xl font-black text-blue-600">${subtotal}</span>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Excluding Logistics</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <button
                            onClick={handleCheckout}
                            disabled={cartEntries.length === 0 || loading}
                            className="w-full py-5 bg-slate-900 text-white font-bold text-sm rounded-[24px] shadow-2xl shadow-slate-900/10 hover:bg-blue-600 hover:shadow-blue-600/20 active:scale-[0.98] disabled:opacity-30 transition-all flex items-center justify-center gap-3 group"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>
                                    <span>Proceed to Final Checkout</span>
                                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </aside>

            <style jsx global>{`
                @keyframes loading-bar {
                    0% { width: 0; left: 0; }
                    50% { width: 100%; left: 0; }
                    100% { width: 0; left: 100%; }
                }
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </>
    );
}
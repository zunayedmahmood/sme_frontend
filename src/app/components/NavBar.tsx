'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import ShopTitle from './ShopTitle';
import NavButton from './NavButton';
import { Search, Package, Home, ShoppingBag, X, MessageCircle, Info, ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';

const NavBar: React.FC = () => {
    const pathname = usePathname();
    const router = useRouter();
    const { cart, setIsCartOpen } = useCart();
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [modalOrderId, setModalOrderId] = useState('');
    const [mounted, setMounted] = useState(false);

    const cartCount = Object.values(cart).reduce((sum, qty) => sum + qty, 0);

    const isActive = (path: string) => pathname === path;

    useEffect(() => { setMounted(true); }, []);

    // Lock body scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = showOrderModal ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [showOrderModal]);

    const closeModal = () => {
        setShowOrderModal(false);
        setModalOrderId('');
    };

    const handleTrack = () => {
        const id = modalOrderId.trim().replace('#', '');
        if (id) {
            router.push(`/order/${id}`);
            closeModal();
        }
    };

    const navLinks = [
        { name: 'Home', href: '/', icon: Home },
        { name: 'Products', href: '/ProductFeed', icon: ShoppingBag },
        { name: 'About', href: '/about', icon: Info },
        { name: 'Contact Us', href: '/#contact', icon: MessageCircle },
    ];

    const modal = (
        <div
            className="fixed inset-0 z-[200] flex items-center justify-center px-4 bg-slate-900/40 backdrop-blur-sm"
            onClick={closeModal}
        >
            <div
                className="bg-white rounded-3xl w-full max-w-sm p-8 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                            <Package className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Track Order</h2>
                            <p className="text-xs text-slate-500">Enter your order ID below</p>
                        </div>
                    </div>
                    <button
                        onClick={closeModal}
                        className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-900 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-4">
                    <input
                        type="text"
                        value={modalOrderId}
                        onChange={(e) => setModalOrderId(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
                        placeholder="Order ID (e.g. 7923764)"
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 outline-none transition-all"
                        autoFocus
                    />

                    <button
                        onClick={handleTrack}
                        className="w-full py-4 bg-blue-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95"
                    >
                        Track Now
                    </button>

                    <button
                        onClick={closeModal}
                        className="w-full py-3 text-slate-400 font-bold text-sm hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                <div className="flex items-center gap-8">
                    <ShopTitle />

                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive(link.href)
                                    ? 'text-blue-600 bg-blue-50'
                                    : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    <link.icon className="w-4 h-4" />
                                    {link.name}
                                </div>
                            </Link>
                        ))}

                        <button
                            onClick={() => setShowOrderModal(true)}
                            className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-all flex items-center gap-2"
                        >
                            <Package className="w-4 h-4" />
                            View Order
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <NavButton />

                    <button
                        onClick={() => setIsCartOpen(true)}
                        className="relative group bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-600/20 hover:bg-blue-700 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                    >
                        <ShoppingCart className="w-4 h-4" />
                        <span>Cart</span>
                        {cartCount > 0 && (
                            <span className="bg-white text-blue-600 min-w-[20px] h-5 px-1 rounded-full flex items-center justify-center text-[10px] font-black group-hover:scale-110 transition-transform">
                                {cartCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* Portal — renders outside <nav> so it overlays the full viewport */}
            {mounted && showOrderModal && createPortal(modal, document.body)}
        </nav>
    );
};

export default NavBar;
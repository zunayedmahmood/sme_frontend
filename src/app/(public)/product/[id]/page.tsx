'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getProductById } from '@/lib/api/api_public';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import {
    ShoppingCart,
    ChevronLeft,
    Loader2,
    CheckCircle2,
    Plus,
    Minus,
    ShieldCheck,
    Activity,
    Package
} from 'lucide-react';

const PLACEHOLDER_IMG = '/stock_image.png';

interface Product {
    id: number;
    name: string;
    description: string;
    selling_price: number;
    sold_count: number;
    total_count: number;
    available_stock: number;
    image_src: string[];
    categories: { id: number; name: string }[];
}

export default function ProductDetailPage() {
    const { id } = useParams();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeImage, setActiveImage] = useState(0);

    // Cart Context
    const { cart, updateQuantity, setIsCartOpen } = useCart();
    const [isAdded, setIsAdded] = useState(false);

    // Local qty counter — starts at 1
    const [localQty, setLocalQty] = useState(1);

    useEffect(() => {
        if (id) fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        setLoading(true);
        try {
            const response = await getProductById(id as string);
            setProduct(response.data);
        } catch (err) {
            setError('Equipment profile not found.');
        } finally {
            setLoading(false);
        }
    };


    const currentQtyInCart = product ? (cart[product.id] || 0) : 0;
    const maxCanAdd = product ? Math.max(0, Math.min(5, product.available_stock) - currentQtyInCart) : 0;

    useEffect(() => {
        if (localQty > maxCanAdd && maxCanAdd > 0) setLocalQty(maxCanAdd);
        if (maxCanAdd === 0) setLocalQty(1);
    }, [maxCanAdd]);

    const handleAddToCart = (productId: number, availableStock: number) => {
        if (maxCanAdd <= 0) return;
        updateQuantity(productId, currentQtyInCart + localQty, availableStock);
        setIsAdded(true);
        setLocalQty(1);
        setTimeout(() => setIsAdded(false), 2000);
        setTimeout(() => setIsCartOpen(true), 800);
    };

    if (loading) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="text-blue-600 animate-spin w-10 h-10" />
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Accessing Database</p>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center text-center p-6">
                <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-[32px] flex items-center justify-center mb-8">
                    <Package size={40} />
                </div>
                <h2 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">Void Detected</h2>
                <p className="text-slate-500 font-light mb-10 max-w-sm px-6">The requested equipment profile is either archived or does not exist in our current registry.</p>
                <Link href="/" className="px-10 py-4 bg-slate-900 text-white rounded-[24px] font-bold text-sm uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:bg-blue-600 transition-all active:scale-95">Return to Home</Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-20 animate-in fade-in duration-700">
            <Link href="/ProductFeed" className="inline-flex items-center space-x-2 text-slate-400 hover:text-blue-600 font-bold uppercase text-[10px] tracking-widest transition-all mb-10 group">
                <div className="group-hover:-translate-x-1 transition-transform"><ChevronLeft className="w-4 h-4" /></div>
                <span>Technical Catalog</span>
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
                {/* Image Gallery */}
                <div className="space-y-8 sticky top-32">
                    <div className="aspect-[4/5] bg-slate-50 rounded-[48px] overflow-hidden border border-slate-100 shadow-xl shadow-slate-200/50 group relative">
                        <img
                            src={product.image_src.length > 0 ? product.image_src[activeImage] : PLACEHOLDER_IMG}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-[1.05]"
                        />
                        <div className="absolute top-10 left-10 flex flex-col gap-3">
                            {product.sold_count > 0 && (
                                <div className="bg-white/90 backdrop-blur-md px-5 py-2.5 rounded-full border border-white shadow-lg flex items-center space-x-2 w-fit">
                                    <Activity className="w-3.5 h-3.5 text-blue-600" />
                                    <span className="text-[10px] font-bold uppercase text-slate-900 tracking-wider">Sold Count: {product.sold_count} Sold</span>
                                </div>
                            )}
                            <div className="bg-blue-600 text-white px-5 py-2.5 rounded-full shadow-lg flex items-center space-x-2 w-fit">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Clinical Grade</span>
                            </div>
                        </div>
                    </div>
                    {product.image_src.length > 1 && (
                        <div className="flex gap-5 overflow-x-auto pb-6 scrollbar-hide px-2">
                            {product.image_src.map((img, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveImage(i)}
                                    className={`relative flex-shrink-0 w-24 aspect-square rounded-[24px] overflow-hidden border-2 transition-all p-1 ${activeImage === i ? 'border-blue-600 bg-blue-50/50 scale-110 shadow-xl shadow-blue-600/10' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                >
                                    <img src={img} alt="" className="w-full h-full object-cover rounded-[18px]" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Info Panel */}
                <div className="flex flex-col py-4">
                    <div className="flex flex-wrap gap-2 mb-8 justify-center lg:justify-start">
                        {product.categories.map(cat => (
                            <span key={cat.id} className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600 bg-blue-50 px-4 py-2 rounded-xl">
                                {cat.name}
                            </span>
                        ))}
                    </div>

                    <h1 className="text-4xl sm:text-7xl font-bold text-slate-900 leading-[1.1] mb-6 text-center lg:text-left tracking-tight">
                        {product.name}
                    </h1>

                    <div className="flex items-baseline gap-4 mb-12 justify-center lg:justify-start">
                        <span className="text-4xl font-black text-slate-900 tracking-tight">${product.selling_price}</span>
                    </div>

                    <div className="space-y-6 mb-12 bg-slate-50 p-10 rounded-[40px] border border-white shadow-inner">
                        <h4 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                            <Activity size={14} className="text-blue-400" />
                            Description
                        </h4>
                        <p className="text-slate-600 leading-relaxed font-light text-xl text-center lg:text-left">
                            {product.description || "This clinical instrument is a key component of our professional inventory, meticulously verified for medical performance and reliability"}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {/* Qty Stepper */}
                        <div className="bg-slate-50 border border-slate-100 rounded-[32px] p-2 flex items-center justify-between shadow-sm">
                            <button
                                onClick={() => setLocalQty(q => Math.max(1, q - 1))}
                                disabled={localQty <= 1}
                                className="w-14 h-14 flex items-center justify-center text-slate-400 hover:bg-white hover:text-slate-900 hover:shadow-xl transition-all rounded-2xl disabled:opacity-20 disabled:cursor-not-allowed active:scale-95"
                            >
                                <Minus size={18} />
                            </button>
                            <span className="text-2xl font-bold text-slate-900">{localQty}</span>
                            <button
                                onClick={() => setLocalQty(q => Math.min(maxCanAdd, q + 1))}
                                disabled={localQty >= maxCanAdd}
                                className="w-14 h-14 flex items-center justify-center text-slate-400 hover:bg-white hover:text-blue-600 hover:shadow-xl transition-all rounded-2xl disabled:opacity-20 disabled:cursor-not-allowed active:scale-95"
                            >
                                <Plus size={18} />
                            </button>
                        </div>

                        <button
                            onClick={() => handleAddToCart(product.id, product.available_stock)}
                            disabled={maxCanAdd <= 0}
                            className={`flex flex-1 items-center justify-center space-x-3 py-6 rounded-[32px] font-bold text-sm uppercase tracking-widest transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed shadow-2xl ${isAdded ? 'bg-green-600 shadow-green-600/20 text-white animate-in zoom-in-95' : 'bg-blue-600 shadow-blue-600/20 text-white hover:bg-blue-700 hover:-translate-y-1'}`}
                        >
                            {isAdded ? <CheckCircle2 /> : <ShoppingCart />}
                            <span>{isAdded ? 'Logistics Updated' : maxCanAdd <= 0 ? 'Quota Full' : 'Add to Cart'}</span>
                        </button>
                    </div>

                    <div className="mt-12 pt-10 border-t border-slate-100 flex flex-wrap items-center justify-center lg:justify-start gap-12">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                <Package size={12} className="text-blue-400" />
                                Inventory
                            </span>
                            <span className="text-lg font-bold text-slate-900">{product.available_stock <= 0 ? 'Out of Stock' : product.available_stock < 10 ? `Only ${product.available_stock} left` : 'Available'}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                <ShieldCheck size={12} className="text-blue-400" />
                                Quality
                            </span>
                            <span className="text-lg font-bold text-slate-900">Clinical Grade</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
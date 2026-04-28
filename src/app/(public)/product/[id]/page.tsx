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
    Package,
    MessageCircle
} from 'lucide-react';
import MarkdownRenderer from '@/app/components/MarkdownRenderer';

// Attribution: https://unsplash.com/illustrations/a-graphic-icon-representing-a-landscape-with-mountains-and-sun-XjQ8nxFvHxw?utm_source=unsplash&utm_medium=referral&utm_content=creditShareLink
const PLACEHOLDER_IMG = '/placeholder_no_image.jpg';

interface Variation {
    id: number;
    name: string;
    selling_price: number | null;
    has_dynamic_pricing: boolean;
    price_slabs: { min_qty: number; max_qty: number | null; price: number }[] | null;
    image_src: string[] | null;
    available_stock: number;
}

interface Product {
    id: number;
    name: string;
    description: string;
    selling_price: number | null;
    sold_count: number;
    total_count: number;
    available_stock: number;
    image_src: string[];
    categories: { id: number; name: string }[];
    has_dynamic_pricing: boolean;
    price_slabs: { min_qty: number; max_qty: number | null; price: number }[] | null;
    has_variations: boolean;
    variations: Variation[];
}

export default function ProductDetailPage() {
    const { id } = useParams();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeImage, setActiveImage] = useState(0);
    const [selectedVariation, setSelectedVariation] = useState<Variation | null>(null);

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
            if (response.data?.has_variations && response.data?.variations?.length > 0) {
                setSelectedVariation(response.data.variations[0]);
            }
        } catch (err) {
            setError('Equipment profile not found.');
        } finally {
            setLoading(false);
        }
    };


    const currentVariation = selectedVariation ?? null;
    const currentPrice = currentVariation ? currentVariation.selling_price : product?.selling_price;
    const currentSlabs = currentVariation ? currentVariation.price_slabs : product?.price_slabs;
    const hasDynamic = currentVariation ? currentVariation.has_dynamic_pricing : product?.has_dynamic_pricing;
    const currentStock = currentVariation ? currentVariation.available_stock : product?.available_stock;
    
    // Images belonging to the CURRENT selection
    const displayImages = (currentVariation && currentVariation.image_src && currentVariation.image_src.length > 0) 
        ? currentVariation.image_src 
        : (product?.image_src || []);

    // ALL unique images across product and ALL variations
    const allGalleryImages = Array.from(new Set([
        ...(product?.image_src || []),
        ...(product?.variations?.flatMap(v => v.image_src || []) || [])
    ]));

    const cartKey = currentVariation ? `${product?.id}-${currentVariation.id}` : `${product?.id}-null`;
    const currentQtyInCart = product ? (cart[cartKey] || 0) : 0;
    const maxCanAdd = product ? Math.max(0, (currentStock || 0) - currentQtyInCart) : 0;

    useEffect(() => {
        if (localQty > maxCanAdd && maxCanAdd > 0) setLocalQty(maxCanAdd);
        if (maxCanAdd === 0) setLocalQty(1);
    }, [maxCanAdd]);

    // When variant changes, update active image to the first image of that variant if it exists in allGalleryImages
    useEffect(() => {
        if (currentVariation && currentVariation.image_src && currentVariation.image_src.length > 0) {
            const firstVarImg = currentVariation.image_src[0];
            const globalIndex = allGalleryImages.indexOf(firstVarImg);
            if (globalIndex !== -1) {
                setActiveImage(globalIndex);
            }
        }
    }, [selectedVariation]);

    const handleAddToCart = (availableStock: number) => {
        if (maxCanAdd <= 0) return;
        updateQuantity(cartKey, currentQtyInCart + localQty, availableStock);
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
                <h2 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">Product Not Found</h2>
                <p className="text-slate-500 font-light mb-10 max-w-sm px-6">The requested equipment profile is either archived or does not exist in our current registry.</p>
                <Link href="/" className="px-10 py-4 bg-slate-900 text-white rounded-[24px] font-bold text-sm uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:bg-blue-600 transition-all active:scale-95">Return to Home</Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-20 animate-in fade-in duration-700">
            <Link href="/ProductFeed" className="inline-flex items-center space-x-2 text-slate-400 hover:text-blue-600 font-bold uppercase text-[10px] tracking-widest transition-all mb-8 sm:mb-10 group">
                <div className="group-hover:-translate-x-1 transition-transform"><ChevronLeft className="w-4 h-4" /></div>
                <span>Technical Catalog</span>
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-12 lg:gap-20 items-start">
                {/* Image Gallery */}
                <div className="space-y-6 sm:space-y-8 lg:sticky lg:top-32">
                    <div className="aspect-[4/5] bg-slate-50 rounded-3xl sm:rounded-[48px] overflow-hidden border border-slate-100 shadow-xl shadow-slate-200/50 group relative">
                        <img
                            src={allGalleryImages.length > 0 ? allGalleryImages[activeImage] : PLACEHOLDER_IMG}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-[1.05]"
                        />
                        <div className="absolute top-4 left-4 sm:top-10 sm:left-10 flex flex-col gap-2 sm:gap-3">
                            {product.sold_count > 0 && (
                                <div className="bg-white/90 backdrop-blur-md px-3 sm:px-5 py-2 sm:py-2.5 rounded-full border border-white shadow-lg flex items-center space-x-2 w-fit">
                                    <Activity className="w-3 sm:h-3.5 sm:w-3.5 h-3 text-blue-600" />
                                    <span className="text-[8px] sm:text-[10px] font-bold uppercase text-slate-900 tracking-wider">{product.sold_count} Sold</span>
                                </div>
                            )}
                            <div className="bg-blue-600 text-white px-3 sm:px-5 py-2 sm:py-2.5 rounded-full shadow-lg flex items-center space-x-2 w-fit">
                                <ShieldCheck className="w-3 sm:h-3.5 sm:w-3.5 h-3" />
                                <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-wider">Clinical Grade</span>
                            </div>
                        </div>
                    </div>
                    {allGalleryImages.length > 1 && (
                        <div className="flex gap-3 sm:gap-5 overflow-x-auto pb-4 scrollbar-hide px-2">
                            {allGalleryImages.map((img, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveImage(i)}
                                    className={`relative flex-shrink-0 w-16 sm:w-24 aspect-square rounded-xl sm:rounded-[24px] overflow-hidden border-2 transition-all p-1 ${activeImage === i ? 'border-blue-600 bg-blue-50/50 scale-105 sm:scale-110 shadow-xl shadow-blue-600/10' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                >
                                    <img src={img} alt="" className="w-full h-full object-cover rounded-lg sm:rounded-[18px]" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Info Panel */}
                <div className="flex flex-col py-0 lg:py-4">
                    <div className="flex flex-wrap gap-2 mb-6 sm:mb-8 justify-center lg:justify-start">
                        {product.categories.map(cat => (
                            <span key={cat.id} className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600 bg-blue-50 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl">
                                {cat.name}
                            </span>
                        ))}
                    </div>

                    <h1 className="text-3xl sm:text-5xl lg:text-7xl font-bold text-slate-900 leading-[1.1] mb-6 text-center lg:text-left tracking-tight">
                        {product.name}
                    </h1>

                    {!!product.has_variations && product.variations.length > 0 && (
                        <div className="mb-8">
                            <h4 className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 text-center lg:text-left">Select Option</h4>
                            <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                                {product.variations.map((v) => (
                                    <button
                                        key={v.id}
                                        onClick={() => { setSelectedVariation(v); setLocalQty(1); }}
                                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border-2 ${selectedVariation?.id === v.id ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-500 hover:border-blue-300'}`}
                                    >
                                        {v.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex items-baseline gap-4 mb-8 sm:mb-12 justify-center lg:justify-start">
                        {currentPrice !== null ? (
                            <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">${currentPrice}</span>
                        ) : (
                            <span className="text-2xl sm:text-3xl font-bold text-blue-600 tracking-tight">Contact for Price</span>
                        )}
                    </div>

                    {!!hasDynamic && currentSlabs && currentSlabs.length > 0 && (
                        <div className="mb-8 p-6 bg-blue-50/50 rounded-3xl border border-blue-100/50">
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-4 flex items-center gap-2">
                                <Activity size={14} />
                                Pricing Tiers
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                {currentSlabs.map((slab, index) => (
                                    <div key={index} className="bg-white p-3 rounded-2xl border border-blue-100 flex flex-col">
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                                            {slab.max_qty ? `${slab.min_qty} - ${slab.max_qty} Units` : `${slab.min_qty}+ Units`}
                                        </span>
                                        <span className="text-lg font-black text-slate-900">${slab.price}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="space-y-4 sm:space-y-6 mb-8 sm:mb-12 bg-slate-50 p-6 sm:p-10 rounded-[32px] sm:rounded-[40px] border border-white shadow-inner">
                        <h4 className="flex items-center gap-2 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-slate-400 justify-center lg:justify-start">
                            <Activity size={12} className="text-blue-400 sm:w-3.5 sm:h-3.5" />
                            Description
                        </h4>
                        <div className="text-slate-600">
                            <MarkdownRenderer 
                                content={product.description || "This clinical instrument is a key component of our professional inventory, meticulously verified for medical performance and reliability"} 
                                className="text-base sm:text-lg"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] lg:grid-cols-[160px_1fr] xl:grid-cols-[200px_1fr] gap-4 sm:gap-5">
                        {currentPrice !== null ? (
                            <>
                                {/* Qty Stepper */}
                                <div className="bg-slate-50 border border-slate-100 rounded-2xl sm:rounded-[32px] p-1.5 sm:p-2 flex items-center justify-between shadow-sm">
                                    <button
                                        onClick={() => setLocalQty(q => Math.max(1, q - 1))}
                                        disabled={localQty <= 1}
                                        className="w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center text-slate-400 hover:bg-white hover:text-slate-900 hover:shadow-xl transition-all rounded-xl sm:rounded-2xl disabled:opacity-20 disabled:cursor-not-allowed active:scale-95"
                                    >
                                        <Minus size={16} />
                                    </button>
                                    <span className="text-xl sm:text-2xl font-bold text-slate-900">{localQty}</span>
                                    <button
                                        onClick={() => setLocalQty(q => Math.min(maxCanAdd, q + 1))}
                                        disabled={localQty >= maxCanAdd}
                                        className="w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center text-slate-400 hover:bg-white hover:text-blue-600 hover:shadow-xl transition-all rounded-xl sm:rounded-2xl disabled:opacity-20 disabled:cursor-not-allowed active:scale-95"
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>

                                <button
                                    onClick={() => handleAddToCart(currentStock || 0)}
                                    disabled={maxCanAdd <= 0}
                                    className={`flex items-center justify-center space-x-3 py-4 sm:py-6 rounded-2xl sm:rounded-[32px] font-bold text-xs sm:text-sm uppercase tracking-widest transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed shadow-2xl ${isAdded ? 'bg-green-600 shadow-green-600/20 text-white animate-in zoom-in-95' : 'bg-blue-600 shadow-blue-600/20 text-white hover:bg-blue-700 hover:-translate-y-1'}`}
                                >
                                    {isAdded ? <CheckCircle2 size={18} /> : <ShoppingCart size={18} />}
                                    <span>{isAdded ? 'Logistics Updated' : maxCanAdd <= 0 ? 'Quota Full' : 'Add to Cart'}</span>
                                </button>
                            </>
                        ) : (
                            <Link
                                href={`/#contact?subject=${encodeURIComponent(`Price of ${product.name}${selectedVariation ? ` (${selectedVariation.name})` : ''}`)}`}
                                className="col-span-full flex items-center justify-center space-x-3 py-4 sm:py-6 bg-slate-900 shadow-2xl shadow-slate-900/10 text-white rounded-2xl sm:rounded-[32px] font-bold text-xs sm:text-sm uppercase tracking-widest hover:bg-blue-600 hover:-translate-y-1 transition-all active:scale-[0.98]"
                            >
                                <MessageCircle size={18} />
                                <span>Contact Us for Pricing</span>
                            </Link>
                        )}
                    </div>

                    <div className="mt-8 sm:mt-12 pt-8 sm:pt-10 border-t border-slate-100 flex flex-wrap items-center justify-center lg:justify-start gap-8 sm:gap-12 text-center lg:text-left">
                        <div className="flex flex-col">
                            <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-2 justify-center lg:justify-start">
                                <Package size={12} className="text-blue-400" />
                                Inventory
                            </span>
                            <span className="text-base sm:text-lg font-bold text-slate-900">{(currentStock || 0) <= 0 ? 'Out of Stock' : (currentStock || 0) < 10 ? `Only ${currentStock} left` : 'Available'}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-2 justify-center lg:justify-start">
                                <ShieldCheck size={12} className="text-blue-400" />
                                Quality
                            </span>
                            <span className="text-base sm:text-lg font-bold text-slate-900">Clinical Grade</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
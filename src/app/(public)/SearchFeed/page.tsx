'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { getProductFeed } from '@/lib/api/api_public';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { Search, Plus, Check, Loader2, ShoppingBag, ArrowLeft, Filter } from 'lucide-react';

const PLACEHOLDER_IMG = 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=800';

interface Product {
    id: number;
    name: string;
    selling_price: string | number;
    sold_count: number;
    total_count: number;
    image_src: string[];
}

function SearchFeedPage() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q') || '';

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState<any>(null);
    const [sortBy, setSortBy] = useState('newest');

    const { cart, addToCart } = useCart();
    const [addedIds, setAddedIds] = useState<number[]>([]);

    useEffect(() => {
        fetchProducts();
    }, [query, currentPage, sortBy]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const resp = await getProductFeed({
                page: currentPage,
                search: query,
                sort_by: sortBy
            });
            setProducts(resp.data);
            setPagination({
                current_page: resp.current_page,
                last_page: resp.last_page,
                total: resp.total
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = (productId: number, totalCount: number) => {
        addToCart(productId, totalCount);
        setAddedIds(prev => [...prev, productId]);
        setTimeout(() => {
            setAddedIds(prev => prev.filter(id => id !== productId));
        }, 1500);
    };


    return (
        <div className="min-h-screen bg-slate-50">
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 text-sm mb-6 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Home
                    </Link>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Search Results</h1>
                            <p className="text-slate-500 font-light mt-1">
                                Showing results for "<span className="text-slate-900 font-medium italic">{query}</span>"
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <select
                                value={sortBy}
                                onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
                                className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none cursor-pointer"
                            >
                                <option value="newest">Newest Arrival</option>
                                <option value="most_sold">Best Sellers</option>
                                <option value="price_low_high">Price: Low - High</option>
                                <option value="price_high_low">Price: High - Low</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {loading && products.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-40">
                        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
                        <p className="text-slate-500 font-medium tracking-wide italic">Scanning database...</p>
                    </div>
                ) : products.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {products.map(product => {
                                const inCartQty = cart[product.id] || 0;
                                const isJustAdded = addedIds.includes(product.id);

                                return (
                                    <div key={product.id} className="group bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 flex flex-col">
                                        <Link href={`/product/${product.id}`} className="relative aspect-square block overflow-hidden bg-slate-50">
                                            <img
                                                src={product.image_src?.[0] || PLACEHOLDER_IMG}
                                                alt={product.name}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                        </Link>

                                        <div className="p-5 flex flex-col flex-grow">
                                            <Link href={`/product/${product.id}`}>
                                                <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 mb-1">{product.name}</h3>
                                            </Link>
                                            <div className="flex items-center justify-between mb-4">
                                                <p className="text-xl font-bold text-blue-600">${product.selling_price}</p>
                                                <span className="text-[10px] font-bold text-slate-400">Sold: {product.sold_count}</span>
                                            </div>

                                            <div className="mt-auto">
                                                {inCartQty > 0 ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex-1 h-11 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-center gap-2">
                                                            <span className="text-[10px] font-bold text-blue-400 font-mono italic">UNIT-{inCartQty}</span>
                                                        </div>
                                                        <button
                                                            onClick={() => handleAddToCart(product.id, product.total_count)}
                                                            className={`w-11 h-11 rounded-lg flex items-center justify-center transition-all active:scale-90 ${isJustAdded ? 'bg-green-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                                                        >
                                                            {isJustAdded ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => handleAddToCart(product.id, product.total_count)}
                                                        disabled={product.total_count <= 0}
                                                        className="w-full py-2.5 bg-slate-900 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-2 hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-40 disabled:grayscale shadow-sm"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                        Add to Bag
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {pagination && pagination.last_page > 1 && (
                            <div className="mt-16 flex items-center justify-center gap-2">
                                {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map(p => (
                                    <button
                                        key={p}
                                        onClick={() => { setCurrentPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                        className={`min-w-[40px] h-10 rounded-lg text-sm font-bold transition-all ${currentPage === p ? 'bg-blue-600 text-white shadow-lg' : 'bg-white border border-slate-200 text-slate-500 hover:text-blue-600'}`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-40 text-center">
                        <Search className="w-12 h-12 text-slate-200 mb-6" />
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No matching products found</h3>
                        <p className="text-slate-500 max-w-sm mx-auto mb-8">We couldn't find any medical supplies matching your query. Please try different keywords or browse our catalog.</p>
                        <div className="flex gap-4">
                            <Link href="/ProductFeed" className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20">
                                View Full Catalog
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function SearchFeedPageWrapper() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>}>
            <SearchFeedPage />
        </Suspense>
    );
}

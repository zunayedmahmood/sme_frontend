'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { getProductFeed, getCategoryInventory } from '@/lib/api/api_public';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { Search, Filter, ChevronDown, ShoppingBag, Plus, Check, Loader2, ArrowRight, ChevronRight } from 'lucide-react';

const PLACEHOLDER_IMG = 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=800';

interface Product {
    id: number;
    name: string;
    selling_price: string | number;
    sold_count: number;
    total_count: number;
    available_stock: number;
    image_src: string[];
    has_variations?: boolean;
}

interface Category {
    category_id: number;
    category_name: string;
    total_inventory: number;
}

export default function ProductFeedPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState<any>(null);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
    const [sortBy, setSortBy] = useState('newest');

    const { cart, addToCart } = useCart();
    const [addedIds, setAddedIds] = useState<number[]>([]);

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchProducts();
        }, 300);
        return () => clearTimeout(timer);
    }, [currentPage, searchQuery, selectedCategories, sortBy]);

    const fetchCategories = async () => {
        try {
            const resp = await getCategoryInventory();
            setCategories(resp.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const resp = await getProductFeed({
                page: currentPage,
                search: searchQuery,
                categories: selectedCategories.length > 0 ? selectedCategories : undefined,
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

    const handleAddToCart = (productId: number, availableStock: number) => {
        const added = addToCart(productId, null, availableStock);
        if (added) {
            setAddedIds(prev => [...prev, productId]);
            setTimeout(() => {
                setAddedIds(prev => prev.filter(id => id !== productId));
            }, 1500);
        }
    };


    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header / Banner */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-2">Medical Catalog</h1>
                    <p className="text-slate-500 font-light">Browse our comprehensive selection of professional medical equipment.</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Sidebar Filters */}
                    <aside className="w-full lg:w-64 flex-shrink-0">
                        <div className="sticky top-24 space-y-8">
                            {/* Search */}
                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-4">Search Catalog</h3>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Search Products..."
                                        value={searchQuery}
                                        onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-blue-500 focus:bg-white outline-none transition-all"
                                    />
                                </div>
                            </div>

                            {/* Categories */}
                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-4">Categories</h3>
                                <div className="space-y-2">
                                    <button
                                        onClick={() => { setSelectedCategories([]); setCurrentPage(1); }}
                                        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm transition-all ${selectedCategories.length === 0
                                            ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/20'
                                            : 'text-slate-600 hover:bg-slate-50'
                                            }`}
                                    >
                                        All Systems
                                        {selectedCategories.length === 0 && <ChevronRight size={14} />}
                                    </button>
                                    {categories.map((cat) => (
                                        <button
                                            key={cat.category_id}
                                            onClick={() => {
                                                setSelectedCategories(prev =>
                                                    prev.includes(cat.category_id)
                                                        ? prev.filter(id => id !== cat.category_id)
                                                        : [...prev, cat.category_id]
                                                );
                                                setCurrentPage(1);
                                            }}
                                            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm transition-all ${selectedCategories.includes(cat.category_id)
                                                ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/20'
                                                : 'text-slate-600 hover:bg-slate-50'
                                                }`}
                                        >
                                            <span className="truncate mr-2">{cat.category_name}</span>
                                            {selectedCategories.includes(cat.category_id) && <ChevronRight size={14} />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Sort By */}
                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-4">Ordering</h3>
                                <select
                                    value={sortBy}
                                    onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-blue-500 focus:bg-white outline-none cursor-pointer"
                                >
                                    <option value="newest">Recent Arrivals</option>
                                    <option value="most_sold">Best Sellers</option>
                                    <option value="price_low_high">Price: Low to High</option>
                                    <option value="price_high_low">Price: High to Low</option>
                                </select>
                            </div>
                        </div>
                    </aside>

                    {/* Product Grid */}
                    <main className="flex-1">
                        {loading && products.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-40">
                                <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
                                <p className="text-slate-500 font-medium">Loading catalog...</p>
                            </div>
                        ) : products.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
                                {products.map(product => {
                                    const inCartQty = Object.entries(cart).reduce((acc, [key, qty]) => {
                                        if (key.startsWith(`${product.id}-`)) return acc + Number(qty);
                                        return acc;
                                    }, 0);
                                    const isJustAdded = addedIds.includes(product.id);

                                    return (
                                        <div key={product.id} className="group bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 flex flex-col">
                                            <Link href={`/product/${product.id}`} className="relative aspect-[4/3] block overflow-hidden bg-slate-50">
                                                <img
                                                    src={product.image_src?.[0] || PLACEHOLDER_IMG}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                />
                                                {product.available_stock <= 0 && (
                                                    <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Out of Stock</div>
                                                )}
                                                {product.sold_count > 20 && (
                                                    <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg">Popular Choice</div>
                                                )}
                                            </Link>

                                            <div className="p-6 flex flex-col flex-grow">
                                                <Link href={`/product/${product.id}`}>
                                                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 mb-1">{product.name}</h3>
                                                </Link>
                                                <div className="flex items-center justify-between mb-6">
                                                    <p className="text-2xl font-bold text-blue-600">
                                                        {product.selling_price !== null ? `$${product.selling_price}` : 'Options Available'}
                                                    </p>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{product.sold_count} Sold</span>
                                                </div>

                                                <div className="mt-auto">
                                                    {product.has_variations ? (
                                                        <Link
                                                            href={`/product/${product.id}`}
                                                            className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-600 transition-all active:scale-95 shadow-lg shadow-slate-900/10 hover:shadow-blue-600/20"
                                                        >
                                                            Select Options
                                                        </Link>
                                                    ) : inCartQty > 0 ? (
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex-1 h-12 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center gap-2">
                                                                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">In Cart</span>
                                                                <span className="text-sm font-bold text-blue-600">{inCartQty}</span>
                                                            </div>
                                                            <button
                                                                onClick={() => handleAddToCart(product.id, product.available_stock)}
                                                                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all active:scale-90 ${isJustAdded ? 'bg-green-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20'}`}
                                                            >
                                                                {isJustAdded ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleAddToCart(product.id, product.available_stock)}
                                                            disabled={product.available_stock <= 0}
                                                            className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group/btn shadow-lg shadow-slate-900/10 hover:shadow-blue-600/20"
                                                        >
                                                            <ShoppingBag className="w-4 h-4 transition-transform group-hover/btn:-rotate-12" />
                                                            Add to Bag
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-40 text-center">
                                <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-300 mb-6">
                                    <Search className="w-10 h-10" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">No items found</h3>
                                <p className="text-slate-500 max-w-xs mx-auto mb-8">We couldn't find any products matching your current filters. Try resetting them.</p>
                                <button
                                    onClick={() => { setSearchQuery(''); setSelectedCategories([]); setSortBy('newest'); }}
                                    className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
                                >
                                    Reset All Filters
                                </button>
                            </div>
                        )}

                        {/* Pagination Controls */}
                        {pagination && pagination.last_page > 1 && (
                            <div className="mt-16 flex items-center justify-center gap-2">
                                {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map(p => (
                                    <button
                                        key={p}
                                        onClick={() => { setCurrentPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                        className={`min-w-[44px] h-11 rounded-lg text-sm font-bold transition-all ${currentPage === p ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-white border border-slate-200 text-slate-500 hover:border-blue-400 hover:text-blue-600'}`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}
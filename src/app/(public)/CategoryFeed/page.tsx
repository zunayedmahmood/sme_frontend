'use client';

import React, { useEffect, useState, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getProductFeed, getCategoryInventory } from '@/lib/api/api_public';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { Search, Plus, Check, Loader2, ShoppingBag, ArrowLeft, Filter } from 'lucide-react';

// Attribution: https://unsplash.com/illustrations/a-graphic-icon-representing-a-landscape-with-mountains-and-sun-XjQ8nxFvHxw?utm_source=unsplash&utm_medium=referral&utm_content=creditShareLink
const PLACEHOLDER_IMG = '/placeholder_no_image.jpg';

interface Product {
    id: number;
    name: string;
    image_src: string[];
    has_variations: boolean;
    available_stock: number;
    selling_price: number | null;
    sold_count: number;
}

interface Category {
    category_id: number;
    category_name: string;
    total_inventory: number;
    image_url: string | null;
}

function CategoryFeedContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const categoryId = searchParams.get('category_id');

    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    // Frontend search
    const [localSearch, setLocalSearch] = useState('');
    const [sortBy, setSortBy] = useState('newest');

    const { cart, addToCart } = useCart();
    const [addedIds, setAddedIds] = useState<number[]>([]);

    useEffect(() => {
        fetchCategories();
        if (categoryId) {
            fetchProducts(categoryId);
        } else {
            setLoading(false);
        }
    }, [categoryId]);

    const fetchCategories = async () => {
        try {
            const resp = await getCategoryInventory();
            setCategories(resp.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchProducts = async (catId: string) => {
        setLoading(true);
        try {
            const resp = await getProductFeed({
                categories: [parseInt(catId)],
                per_page: 50,
                sort_by: sortBy
            });
            setProducts(resp.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = (productId: number, totalCount: number) => {
        addToCart(productId, null, totalCount);
        setAddedIds(prev => [...prev, productId]);
        setTimeout(() => {
            setAddedIds(prev => prev.filter(id => id !== productId));
        }, 1500);
    };

    const currentCategory = categories.find(c => c.category_id === parseInt(categoryId || '0'));

    // Frontend filtering and sorting
    const filteredProducts = useMemo(() => {
        let result = [...products];

        if (localSearch.trim()) {
            const query = localSearch.toLowerCase();
            result = result.filter(p => p.name.toLowerCase().includes(query));
        }

        if (sortBy === 'price_low_high') {
            result.sort((a, b) => Number(a.selling_price) - Number(b.selling_price));
        } else if (sortBy === 'price_high_low') {
            result.sort((a, b) => Number(b.selling_price) - Number(a.selling_price));
        } else if (sortBy === 'most_sold') {
            result.sort((a, b) => b.sold_count - a.sold_count);
        } else if (sortBy === 'newest') {
            result.sort((a, b) => b.id - a.id);
        }

        return result;
    }, [products, localSearch, sortBy]);

    if (!categoryId) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
                <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mb-6">
                    <Filter className="w-8 h-8 text-slate-400" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Select a Category</h1>
                <p className="text-slate-500 mb-8 max-w-sm text-center">Please choose a category from the home page or catalog to view specific medical supplies.</p>
                <div className="flex flex-wrap justify-center gap-3">
                    {categories.map(cat => (
                        <button
                            key={cat.category_id}
                            onClick={() => router.push(`/CategoryFeed?category_id=${cat.category_id}`)}
                            className="group relative w-full sm:w-64 aspect-video bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:border-blue-400 transition-all flex flex-col"
                        >
                            <div className="flex-1 bg-slate-100 overflow-hidden">
                                {cat.image_url ? (
                                    <img src={cat.image_url} alt={cat.category_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                        <Filter size={32} />
                                    </div>
                                )}
                            </div>
                            <div className="p-3 text-sm font-bold text-center text-slate-700 group-hover:text-blue-600 transition-colors">
                                {cat.category_name}
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Category Header */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                    <Link href="/ProductFeed" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 text-xs sm:text-sm mb-6 transition-colors font-bold uppercase tracking-widest">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Catalog
                    </Link>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-2">
                                {currentCategory?.category_name || 'Medical Category'}
                            </h1>
                            <p className="text-slate-500 font-light text-sm sm:text-base">
                                Found {filteredProducts.length} high-performance medical products in this classification.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search within results..."
                                    value={localSearch}
                                    onChange={(e) => setLocalSearch(e.target.value)}
                                    className="w-full sm:w-64 pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-blue-500 focus:bg-white outline-none transition-all"
                                />
                            </div>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:border-blue-500 outline-none cursor-pointer"
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
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-40">
                        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
                        <p className="text-slate-500 font-medium tracking-wide">Accessing Database...</p>
                    </div>
                ) : filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredProducts.map(product => {
                            const inCartQty = Object.entries(cart).reduce((acc, [key, qty]) => {
                                if (key.startsWith(`${product.id}-`)) return acc + Number(qty);
                                return acc;
                            }, 0);
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
                                            <p className="text-xl font-bold text-blue-600">
                                                {product.has_variations 
                                                     ? 'Options Available' 
                                                     : ((product.selling_price !== null && product.available_stock > 0)
                                                         ? `$${product.selling_price}` 
                                                         : 'Price on Request')}
                                            </p>
                                            <span className="text-[10px] font-bold text-slate-400">Sold: {product.sold_count}</span>
                                        </div>

                                        <div className="mt-auto">
                                            {product.has_variations ? (
                                                <Link
                                                    href={`/product/${product.id}`}
                                                    className="w-full py-2.5 bg-slate-900 border border-slate-800 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-2 hover:bg-blue-600 hover:border-blue-500 transition-all active:scale-95 shadow-lg shadow-slate-900/10 hover:shadow-blue-600/20"
                                                >
                                                    Select Configuration
                                                </Link>
                                            ) : (product.selling_price === null || product.available_stock <= 0) ? (
                                                <Link
                                                    href={`/product/${product.id}`}
                                                    className="w-full py-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-lg font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-900 hover:text-white transition-all active:scale-95 shadow-sm"
                                                >
                                                    Inquire Price
                                                </Link>
                                            ) : inCartQty > 0 ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 h-11 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-center gap-2">
                                                        <span className="text-[10px] font-bold text-blue-400 font-mono italic">UNIT-{inCartQty}</span>
                                                    </div>
                                                    <button
                                                        onClick={() => handleAddToCart(product.id, product.available_stock)}
                                                        className={`w-11 h-11 rounded-lg flex items-center justify-center transition-all active:scale-90 ${isJustAdded ? 'bg-green-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                                                    >
                                                        {isJustAdded ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => handleAddToCart(product.id, product.available_stock)}
                                                    disabled={product.available_stock <= 0}
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
                ) : (
                    <div className="flex flex-col items-center justify-center py-40 text-center">
                        <Search className="w-12 h-12 text-slate-200 mb-6" />
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No matches found</h3>
                        <p className="text-slate-500 max-w-xs mx-auto mb-8">Try adjusting your search query within this category.</p>
                        <button
                            onClick={() => setLocalSearch('')}
                            className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
                        >
                            Clear Search
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function CategoryFeedPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>}>
            <CategoryFeedContent />
        </Suspense>
    );
}
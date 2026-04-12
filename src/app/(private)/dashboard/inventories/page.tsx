'use client';

import React, { useEffect, useState, useRef } from 'react';
import {
    getAllProductsPaginatedAdmin,
    addInventoryBatch,
    removeInventoryBatch,
    deleteInventoryBatch
} from '@/lib/api/api_private';
import {
    Package,
    Plus,
    Trash2,
    ChevronDown,
    ChevronUp,
    ChevronLeft,
    ChevronRight,
    Clock,
    Search,
    AlertCircle,
    Loader2,
    ImageIcon,
    TrendingUp,
    Layers,
    Archive,
    ArrowRight,
    X,
    Minus,
    ShieldCheck,
    Truck,
    Database,
    Activity,
    FileText
} from 'lucide-react';

const PLACEHOLDER_IMG = 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=800';

interface Variation {
    id: number;
    name: string;
}

interface ProductBatch {
    id: number;
    count: number;
    cost_price: string | number;
    created_at: string;
    variation_id: number | null;
    variation?: Variation;
}

interface Product {
    id: number;
    name: string;
    description: string | null;
    selling_price: string | number;
    categories: Category[];
    sold_count: number;
    total_count: number;
    available_stock: number;
    image_src: string[];
    product_batches: ProductBatch[];
    has_variations: boolean;
    variations: Variation[];
}

interface PaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export default function InventoryPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState<PaginationMeta | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const [expandedProductId, setExpandedProductId] = useState<number | null>(null);
    const [expandedBatchId, setExpandedBatchId] = useState<number | null>(null);

    const [addModalProduct, setAddModalProduct] = useState<Product | null>(null);
    const [deleteBatchRequest, setDeleteBatchRequest] = useState<{ product: Product, batch: ProductBatch } | null>(null);
    const [removeQtyRequest, setRemoveQtyRequest] = useState<{ product: Product, batch: ProductBatch, qty: number } | null>(null);

    const [newBatch, setNewBatch] = useState({ cost_price: '', quantity: '', variation_id: '' });
    const [removeQtyInput, setRemoveQtyInput] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [errorModal, setErrorModal] = useState<string | null>(null);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchProducts(currentPage, searchQuery);
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [currentPage, searchQuery]);

    const fetchProducts = async (page: number, search: string = '') => {
        setLoading(true);
        try {
            const response = await getAllProductsPaginatedAdmin({ page, search });
            const paginated = response.data;
            setProducts(paginated.data || []);
            if (paginated.pagination) {
                setPagination({
                    current_page: page,
                    last_page: paginated.pagination.last_page,
                    per_page: paginated.pagination.per_page,
                    total: paginated.pagination.total,
                });
            }
            setError(null);
        } catch (err: any) {
            setError('Inventory synchronization failure.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && (!pagination || newPage <= pagination.last_page)) {
            setCurrentPage(newPage);
            setExpandedProductId(null);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const toggleExpandProduct = (productId: number) => {
        setExpandedProductId(expandedProductId === productId ? null : productId);
        setExpandedBatchId(null);
    };

    const toggleExpandBatch = (batchId: number) => {
        setExpandedBatchId(expandedBatchId === batchId ? null : batchId);
        setRemoveQtyInput('');
    };

    const handleAddBatch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!addModalProduct || !newBatch.cost_price || !newBatch.quantity) return;
        
        if (addModalProduct.has_variations && !newBatch.variation_id) {
            alert('Please select a variation for this product.');
            return;
        }

        setActionLoading(true);
        try {
            await addInventoryBatch({
                product_id: addModalProduct.id,
                variation_id: newBatch.variation_id ? parseInt(newBatch.variation_id) : undefined,
                cost_price: parseFloat(newBatch.cost_price),
                quantity: parseInt(newBatch.quantity)
            } as any);
            await fetchProducts(currentPage);
            setAddModalProduct(null);
            setNewBatch({ cost_price: '', quantity: '', variation_id: '' });
        } catch (err) {
            alert('Batch injection failure.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleRemoveQty = async () => {
        if (!removeQtyRequest || !removeQtyInput) return;
        const qtyToRemove = parseInt(removeQtyInput);
        if (isNaN(qtyToRemove) || qtyToRemove <= 0 || qtyToRemove > removeQtyRequest.batch.count) {
            setErrorModal('Invalid allocation quantity.');
            return;
        }
        setActionLoading(true);
        try {
            await removeInventoryBatch({
                product_id: removeQtyRequest.product.id,
                product_batch_id: removeQtyRequest.batch.id,
                quantity: qtyToRemove
            });
            await fetchProducts(currentPage);
            setRemoveQtyRequest(null);
            setRemoveQtyInput('');
        } catch (err) {
            alert('Allocation update failed.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteBatch = async () => {
        if (!deleteBatchRequest) return;
        setActionLoading(true);
        try {
            await deleteInventoryBatch({
                product_id: deleteBatchRequest.product.id,
                product_batch_id: deleteBatchRequest.batch.id
            });
            await fetchProducts(currentPage);
            setDeleteBatchRequest(null);
        } catch (err) {
            alert('Batch decommissioning failed.');
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
            {/* Admin Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-8">
                <div>
                    <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-[0.2em] mb-2">
                        <Database className="w-3.5 h-3.5" />
                        Clinical Stock Management
                    </div>
                    <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Inventory Logistics</h1>
                    <p className="text-slate-500 font-light mt-1">Manage hospital supply chains, batch Stocks, and stock allocation.</p>
                </div>
                <div className="relative w-full md:w-80 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/ group-focus-within:text-blue-500 text-slate-400 transition-colors w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Filter clinical components..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 bg-slate-100 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all text-sm font-medium"
                    />
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-center gap-3 text-red-600 font-bold text-sm">
                    <AlertCircle className="w-5 h-5" />
                    <span>{error}</span>
                </div>
            )}

            {/* Inventory Listing */}
            <div className="grid grid-cols-1 gap-4">
                {loading && products.length === 0 ? (
                    Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="h-24 bg-slate-50 rounded-xl animate-pulse border border-slate-100" />
                    ))
                ) : products.map((product) => (
                    <div key={product.id} className="group">
                        <div
                            onClick={() => toggleExpandProduct(product.id)}
                            className={`flex flex-wrap items-center justify-between p-4 bg-white border rounded-xl transition-all cursor-pointer ${expandedProductId === product.id ? 'border-blue-500 shadow-lg shadow-blue-500/5' : 'border-slate-100 hover:border-slate-300'}`}
                        >
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-50 border border-slate-100 flex-shrink-0">
                                    <img src={product.image_src[0] || PLACEHOLDER_IMG} alt="" className="w-full h-full object-cover" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3 className="text-base font-bold text-slate-900 truncate mt-1">
                                        {product.name}
                                    </h3>
                                    <div className="flex items-center gap-3 mt-1 underline-offset-4">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                            <Archive size={10} />
                                            {product.product_batches.length} Batches
                                        </span>
                                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${product.total_count < 10 ? 'bg-red-50 text-red-500' : 'bg-slate-50 text-slate-500'}`}>
                                            Stock: {product.total_count}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-8">
                                <div className="hidden sm:block text-right">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Total Stock</p>
                                    <p className="text-lg font-bold text-slate-900 leading-none">{product.sold_count + product.total_count} Units</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setAddModalProduct(product); }}
                                        className="p-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all active:scale-95 shadow-md shadow-blue-500/10"
                                        title="Procure New Batch"
                                    >
                                        <Plus size={16} />
                                    </button>
                                    <div className={`ml-2 transition-transform duration-500 ${expandedProductId === product.id ? 'rotate-180 text-blue-600' : 'text-slate-300'}`}>
                                        <ChevronDown size={20} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Expansion Area */}
                        {expandedProductId === product.id && (
                            <div className="mt-2 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden animate-in slide-in-from-top-2 duration-300">
                                <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    {/* Batch History */}
                                    <div className="lg:col-span-2 space-y-4">
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">
                                            <Activity size={12} className="text-blue-500" />
                                            Active Stock History
                                        </div>
                                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                            {product.product_batches.length > 0 ? product.product_batches.map((batch) => (
                                                <div key={batch.id} className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm hover:border-blue-200 transition-all">
                                                    <div className="flex flex-wrap items-center justify-between gap-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                                                                <Truck size={18} />
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-xs font-bold text-slate-900 uppercase">Batch #{batch.id}</span>
                                                                    {batch.variation && (
                                                                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[9px] font-bold uppercase">{batch.variation.name}</span>
                                                                    )}
                                                                    <span className="text-[10px] text-slate-400 font-medium">Logged: {new Date(batch.created_at).toLocaleDateString()}</span>
                                                                </div>
                                                                <p className="text-sm font-bold text-slate-500 mt-1 italic">${batch.cost_price} <span className="text-[10px] uppercase font-bold text-slate-300 ml-1">Cost Price</span></p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-6">
                                                            <div className="text-right">
                                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Volume</p>
                                                                <p className="text-lg font-bold text-blue-600 leading-none">{batch.count}</p>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    onClick={() => toggleExpandBatch(batch.id)}
                                                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                                >
                                                                    <Settings className={`w-4 h-4 transition-transform ${expandedBatchId === batch.id ? 'rotate-90' : ''}`} />
                                                                </button>
                                                                <button
                                                                    onClick={() => setDeleteBatchRequest({ product, batch })}
                                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Batch Management View */}
                                                    {expandedBatchId === batch.id && (
                                                        <div className="mt-4 pt-4 border-t border-slate-50 animate-in slide-in-from-top-2 flex flex-col sm:flex-row items-center gap-4">
                                                            <div className="flex-1 flex items-center gap-2 w-full">
                                                                <input
                                                                    type="number"
                                                                    placeholder="Volume to remove..."
                                                                    value={removeQtyInput}
                                                                    min={1}
                                                                    max={batch.count}
                                                                    onChange={(e) => {
                                                                        const val = parseInt(e.target.value);
                                                                        if (e.target.value === '') { setRemoveQtyInput(''); return; }
                                                                        if (!isNaN(val)) setRemoveQtyInput(String(Math.min(Math.max(1, val), batch.count)));
                                                                    }}
                                                                    className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm font-bold outline-none focus:border-blue-500 transition-all"
                                                                />
                                                                <button
                                                                    disabled={!removeQtyInput || actionLoading}
                                                                    onClick={() => setRemoveQtyRequest({ product, batch, qty: parseInt(removeQtyInput) })}
                                                                    className="px-6 py-2 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-slate-800 transition-all shadow-md active:scale-95 disabled:opacity-50"
                                                                >
                                                                    Remove
                                                                </button>
                                                            </div>
                                                            <p className="text-[9px] font-bold text-slate-300 uppercase italic">Max limit: {batch.count} units</p>
                                                        </div>
                                                    )}
                                                </div>
                                            )) : (
                                                <div className="py-20 bg-white/50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-300">
                                                    <Layers size={32} />
                                                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] mt-3">Current Inventory: Zero Active Stock</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Stats & Tools */}
                                    <div className="space-y-6">
                                        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                                            <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-6">
                                                <ShieldCheck size={12} className="text-green-500" />
                                                Product Details
                                            </h5>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase">Selling Price</p>
                                                    <p className="text-xl font-bold text-slate-900">${product.selling_price}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase">Total Stock</p>
                                                    <p className="text-xl font-bold text-slate-900">{product.total_count}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[9px] font-bold text-amber-500 uppercase">Reserved</p>
                                                    <p className="text-xl font-bold text-amber-500">{product.total_count - product.available_stock}</p>
                                                </div>
                                            </div>
                                            <div className="mt-8 pt-8 border-t border-slate-50">
                                                <p className="text-[9px] font-bold text-slate-400 uppercase mb-3 flex items-center gap-1">
                                                    <FileText size={10} />
                                                    Product Description
                                                </p>
                                                <p className="text-xs text-slate-500 italic leading-relaxed font-light">
                                                    {product.description || 'Global inventory record without additional metadata.'}
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => setAddModalProduct(product)}
                                            className="w-full py-5 bg-blue-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                                        >
                                            <Plus size={18} />
                                            Add New Stock
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.last_page > 1 && (() => {
                const total = pagination.last_page;
                const windowSize = 5;
                let start = Math.max(1, currentPage - Math.floor(windowSize / 2));
                let end = start + windowSize - 1;
                if (end > total) { end = total; start = Math.max(1, end - windowSize + 1); }
                const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);
                return (
                    <div className="flex items-center justify-center gap-1.5 py-10">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1 || loading}
                            className="w-12 h-12 flex items-center justify-center bg-white border border-slate-200 rounded-xl text-slate-400 hover:bg-slate-50 disabled:opacity-30 transition-all font-bold"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        {start > 1 && (
                            <>
                                <button
                                    key={1}
                                    onClick={() => handlePageChange(1)}
                                    className="w-12 h-12 rounded-xl text-xs font-bold transition-all bg-white border border-slate-200 text-slate-500 hover:bg-slate-50"
                                >
                                    1
                                </button>
                                {start > 2 && <span className="w-8 text-center text-slate-400 font-bold text-sm">…</span>}
                            </>
                        )}
                        {pages.map(num => (
                            <button
                                key={num}
                                onClick={() => handlePageChange(num)}
                                className={`w-12 h-12 rounded-xl text-xs font-bold transition-all ${currentPage === num ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                            >
                                {num}
                            </button>
                        ))}
                        {end < total && (
                            <>
                                {end < total - 1 && <span className="w-8 text-center text-slate-400 font-bold text-sm">…</span>}
                                <button
                                    key={total}
                                    onClick={() => handlePageChange(total)}
                                    className="w-12 h-12 rounded-xl text-xs font-bold transition-all bg-white border border-slate-200 text-slate-500 hover:bg-slate-50"
                                >
                                    {total}
                                </button>
                            </>
                        )}
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === pagination.last_page || loading}
                            className="w-12 h-12 flex items-center justify-center bg-white border border-slate-200 rounded-xl text-slate-400 hover:bg-slate-50 disabled:opacity-30 transition-all font-bold"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                );
            })()}

            {/* Modals */}
            {addModalProduct && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[40px] w-full max-w-lg p-10 shadow-3xl animate-in zoom-in-95 duration-500 border border-slate-100">
                        <div className="flex flex-col items-center text-center space-y-4 mb-10">
                            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-sm">
                                <Plus size={32} />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Supply Stock</h2>
                                <p className="text-[10px] text-blue-600 font-bold tracking-[0.3em] mt-2 italic">{addModalProduct.name}</p>
                            </div>
                        </div>

                        <form onSubmit={handleAddBatch} className="space-y-6">
                            {addModalProduct.has_variations && (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Select Variation</label>
                                    <select
                                        required
                                        value={newBatch.variation_id}
                                        onChange={(e) => setNewBatch({ ...newBatch, variation_id: e.target.value })}
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-blue-500 transition-all font-bold text-sm h-[60px]"
                                    >
                                        <option value="">Choose configuration...</option>
                                        {(addModalProduct.variations || []).map(v => (
                                            <option key={v.id} value={v.id}>{v.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Unit Cost ($)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={newBatch.cost_price}
                                    onChange={(e) => setNewBatch({ ...newBatch, cost_price: e.target.value })}
                                    placeholder="00.00"
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-blue-500 transition-all font-bold text-lg"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Supply Volume</label>
                                <input
                                    type="number"
                                    required
                                    value={newBatch.quantity}
                                    onChange={(e) => setNewBatch({ ...newBatch, quantity: e.target.value })}
                                    placeholder="Enter quantity count..."
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-blue-500 transition-all font-bold text-lg"
                                />
                            </div>

                            <div className="flex flex-col gap-3 pt-6">
                                <button type="submit" disabled={actionLoading} className="w-full h-14 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-[0.98]">
                                    {actionLoading ? <Loader2 className="animate-spin mx-auto" /> : 'Authorize Stock'}
                                </button>
                                <button type="button" onClick={() => setAddModalProduct(null)} className="w-full h-12 text-slate-400 font-bold text-[10px] uppercase tracking-widest hover:text-slate-900">Abort Protocol</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {removeQtyRequest && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[40px] w-full max-w-sm p-10 shadow-3xl text-center space-y-8">
                        <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full mx-auto flex items-center justify-center">
                            <Minus size={36} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Manual Allocation?</h3>
                            <p className="text-slate-500 text-sm font-light mt-2 italic">Deducting <span className="text-blue-600 font-bold">{removeQtyRequest.qty} units</span> from batch records.</p>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={() => setRemoveQtyRequest(null)} className="flex-1 py-4 text-slate-400 font-bold hover:bg-slate-50 rounded-xl">Cancel</button>
                            <button onClick={handleRemoveQty} disabled={actionLoading} className="flex-1 py-4 bg-blue-600 text-white font-bold rounded-xl shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center justify-center">
                                {actionLoading ? <Loader2 className="animate-spin" /> : 'Authorize'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {deleteBatchRequest && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-red-900/10 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[40px] w-full max-w-sm p-10 shadow-3xl text-center space-y-8 border-b-8 border-red-600 animate-in zoom-in-95 duration-500">
                        <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full mx-auto flex items-center justify-center shadow-sm">
                            <Trash2 size={36} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Batch Decommissioning?</h3>
                            <p className="text-slate-500 text-sm font-light mt-2 italic leading-relaxed">Permanently purge this Stock record (Batch #{deleteBatchRequest.batch.id}) from clinical logistics?</p>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={() => setDeleteBatchRequest(null)} className="flex-1 py-4 text-slate-400 font-bold hover:bg-slate-50 rounded-xl">Abort</button>
                            <button onClick={handleDeleteBatch} disabled={actionLoading} className="flex-1 py-4 bg-red-600 text-white font-bold rounded-xl shadow-xl shadow-red-600/20 hover:bg-red-700 transition-all flex items-center justify-center">
                                {actionLoading ? <Loader2 className="animate-spin" /> : 'DECOMMISSION'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {errorModal && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl w-full max-w-sm p-10 shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-300">
                        <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-2xl mx-auto flex items-center justify-center">
                            <AlertCircle size={32} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Invalid Quantity</h3>
                            <p className="text-slate-500 text-sm font-light mt-2 leading-relaxed">{errorModal}</p>
                        </div>
                        <button
                            onClick={() => setErrorModal(null)}
                            className="w-full py-4 bg-slate-900 text-white font-bold text-sm rounded-xl hover:bg-slate-800 transition-all active:scale-[0.98] shadow-lg"
                        >
                            Dismiss
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

const Settings = ({ className, size }: { className?: string, size?: number }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>
);
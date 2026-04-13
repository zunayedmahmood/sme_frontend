'use client';

import React, { useEffect, useState, useRef } from 'react';
import {
    getAllProductsPaginatedAdmin,
    updateProductName,
    updateSellingPrice,
    addProductCategories,
    removeProductCategories,
    addProductImages,
    deleteProductAdmin,
    deleteProductImages,
    getAllCategories,
    updateProductDescription,
    createProduct,
    updateDynamicPricing,
    updateHasVariations,
    createVariation,
    updateVariation,
    deleteVariation
} from '@/lib/api/api_private';
import {
    ChevronDown,
    ChevronUp,
    Pencil,
    Trash2,
    Eye,
    Check,
    X,
    Plus,
    Loader2,
    Image as ImageIcon,
    ChevronLeft,
    ChevronRight,
    Search,
    Filter,
    Activity,
    Shield,
    FileText,
    Settings,
    Upload
} from 'lucide-react';

const PLACEHOLDER_IMG = 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=800';

interface Category {
    id: number;
    name: string;
}

interface Variation {
    id: number;
    name: string;
    selling_price: string | number | null;
    image_src: string[] | null;
    total_count: number;
    available_stock: number;
}

interface Product {
    id: number;
    name: string;
    description: string | null;
    selling_price: string | number | null;
    categories: Category[];
    sold_count: number;
    total_count: number;
    available_stock: number;
    image_src: string[];
    has_dynamic_pricing: boolean;
    price_slabs: { min_qty: number; max_qty: number | null; price: number }[] | null;
    has_variations: boolean;
    variations: Variation[];
}

interface PaginationMeta {
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [allCategories, setAllCategories] = useState<Category[]>([]);
    const [pagination, setPagination] = useState<PaginationMeta | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [expandedProductId, setExpandedProductId] = useState<number | null>(null);
    const [editProductId, setEditProductId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<Product | null>(null);

    const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
    const [saveConfirmProduct, setSaveConfirmProduct] = useState<Product | null>(null);
    const [uploadModalId, setUploadModalId] = useState<number | null>(null);
    const [imageToDelete, setImageToDelete] = useState<{ productId: number, path: string } | null>(null);

    const [actionLoading, setActionLoading] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [createForm, setCreateForm] = useState({
        name: '',
        selling_price: '' as string | number,
        description: '',
        categories: [] as number[],
        images: [] as File[],
        has_dynamic_pricing: false,
        price_slabs: [] as { min_qty: number; max_qty: number | null; price: number }[],
        has_variations: false,
        variations: [] as { name: string; selling_price: string | number; images: File[] }[]
    });
    const [imageError, setImageError] = useState(false);

    const [isAddingVariationId, setIsAddingVariationId] = useState<number | null>(null);
    const [variationForm, setVariationForm] = useState({
        name: '',
        selling_price: '' as string | number,
        images: [] as File[]
    });

    const handleToggleHasVariations = async (product: Product) => {
        setActionLoading(true);
        try {
            const newValue = !product.has_variations;
            await updateHasVariations(product.id, newValue);
            
            // If enabling variations, automatically disable product-level dynamic pricing
            const updatedProduct = { 
                ...product, 
                has_variations: newValue,
                ...(newValue ? { has_dynamic_pricing: false, price_slabs: [] } : {})
            };

            setProducts(products.map(p => p.id === product.id ? updatedProduct : p));
            if (editForm && editForm.id === product.id) setEditForm(updatedProduct);
        } catch (err) {
            alert('Variation toggle failure.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleCreateVariation = async (productId: number) => {
        if (!variationForm.name) {
            alert('Variation name is required.');
            return;
        }
        setActionLoading(true);
        try {
            const formData = new FormData();
            formData.append('name', variationForm.name);
            formData.append('selling_price', variationForm.selling_price.toString());
            variationForm.images.forEach(f => formData.append('images[]', f));

            const resp = await createVariation(productId, formData);
            const newVariation = resp.data;
            
            setProducts(products.map(p => p.id === productId ? { ...p, variations: [...(p.variations || []), newVariation] } : p));
            if (editForm && editForm.id === productId) setEditForm({ ...editForm, variations: [...(editForm.variations || []), newVariation] });
            
            setIsAddingVariationId(null);
            setVariationForm({ name: '', selling_price: '', images: [] });
        } catch (err) {
            alert('Variation registration failure.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteVariation = async (productId: number, variationId: number) => {
        if (!confirm('Dispose of this variation permanently?')) return;
        setActionLoading(true);
        try {
            await deleteVariation(variationId);
            setProducts(products.map(p => p.id === productId ? { ...p, variations: p.variations.filter(v => v.id !== variationId) } : p));
            if (editForm && editForm.id === productId) setEditForm({ ...editForm, variations: editForm.variations.filter(v => v.id !== variationId) });
        } catch (err) {
            alert('Variation purge failed.');
        } finally {
            setActionLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts(currentPage);
        fetchCategories();
    }, [currentPage]);

    const fetchProducts = async (page: number) => {
        setLoading(true);
        try {
            const response = await getAllProductsPaginatedAdmin({ page });
            const paginatedData = response.data;
            setProducts(paginatedData.data);
            if (paginatedData.pagination) {
                setPagination({
                    current_page: paginatedData.pagination.current_page,
                    last_page: paginatedData.pagination.last_page,
                    total: paginatedData.pagination.total,
                    per_page: paginatedData.pagination.per_page,
                });
            }
            setError(null);
        } catch (err: any) {
            setError('Procurement data link failure.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await getAllCategories();
            setAllCategories(response.data || response);
        } catch (err) {
            console.error('Failed to load classifications', err);
        }
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && (!pagination || newPage <= pagination.last_page)) {
            setCurrentPage(newPage);
            setExpandedProductId(null);
            setEditProductId(null);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleExpand = (id: number) => {
        if (editProductId !== null) return;
        setExpandedProductId(expandedProductId === id ? null : id);
    };

    const startEdit = (e: React.MouseEvent, product: Product) => {
        e.stopPropagation();
        setExpandedProductId(product.id);
        setEditProductId(product.id);
        setEditForm({ ...product });
    };

    const cancelEdit = () => {
        setEditProductId(null);
        setEditForm(null);
    };

    const saveEdit = async () => {
        if (!editForm || !editProductId) return;
        setActionLoading(true);
        const original = products.find(p => p.id === editProductId);
        if (!original) return;

        try {
            if (editForm.name !== original.name) await updateProductName(editProductId, editForm.name);
            
            const newPrice = editForm.selling_price === '' || editForm.selling_price === null ? null : Number(editForm.selling_price);
            const originalPrice = original.selling_price === '' || original.selling_price === null ? null : Number(original.selling_price);
            if (newPrice !== originalPrice) await updateSellingPrice(editProductId, newPrice);
            
            if (editForm.description !== original.description) await updateProductDescription(editProductId, editForm.description);
            
            if (editForm.has_dynamic_pricing !== original.has_dynamic_pricing || JSON.stringify(editForm.price_slabs) !== JSON.stringify(original.price_slabs)) {
                await updateDynamicPricing(editProductId, editForm.has_dynamic_pricing, editForm.price_slabs || []);
            }

            // Variation updates
            if (editForm.has_variations && editForm.variations) {
                for (const v of editForm.variations) {
                    const origV = original.variations.find(ov => ov.id === v.id);
                    if (origV) {
                        const hasPricingChanged = v.selling_price !== origV.selling_price;
                        if (v.name !== origV.name || hasPricingChanged) {
                            await updateVariation(v.id, {
                                name: v.name,
                                selling_price: v.selling_price === '' ? null : v.selling_price
                            });
                        }
                    }
                }
            }

            const originalCatIds = original.categories.map(c => c.id);
            const newCatIds = editForm.categories.map(c => c.id);
            const addedIds = newCatIds.filter(id => !originalCatIds.includes(id));
            const removedIds = originalCatIds.filter(id => !newCatIds.includes(id));

            if (addedIds.length > 0) await addProductCategories(editProductId, addedIds);
            if (removedIds.length > 0) await removeProductCategories(editProductId, removedIds);

            setProducts(products.map(p => p.id === editProductId ? editForm : p));
            setEditProductId(null);
            setEditForm(null);
            setSaveConfirmProduct(null);
        } catch (err) {
            alert('Integration error. Check data integrity.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        setActionLoading(true);
        try {
            await deleteProductAdmin(id);
            const newProducts = products.filter(p => p.id !== id);
            setProducts(newProducts);
            setDeleteConfirmId(null);
            if (newProducts.length === 0 && currentPage > 1) setCurrentPage(currentPage - 1);
            else if (newProducts.length === 0) fetchProducts(currentPage);
        } catch (err) {
            alert('Security purge failed.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleAddImages = async (productId: number, files: FileList) => {
        setActionLoading(true);
        try {
            const formData = new FormData();
            Array.from(files).forEach(file => formData.append('images[]', file));
            const response = await addProductImages(productId, formData);
            const newImages = response.data.image_src;
            setProducts(products.map(p => p.id === productId ? { ...p, image_src: newImages } : p));
            if (editForm && editForm.id === productId) setEditForm({ ...editForm, image_src: newImages });
            setUploadModalId(null);
        } catch (err) {
            alert('Image injection failure.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleRemoveImage = async () => {
        if (!imageToDelete) return;
        setActionLoading(true);
        try {
            await deleteProductImages(imageToDelete.productId, [imageToDelete.path]);
            setProducts(products.map(p => p.id === imageToDelete.productId ? { ...p, image_src: p.image_src.filter(src => src !== imageToDelete.path) } : p));
            if (editForm && editForm.id === imageToDelete.productId) setEditForm({ ...editForm, image_src: editForm.image_src.filter(src => src !== imageToDelete.path) });
            setImageToDelete(null);
        } catch (err) {
            alert('Asset disposal failed.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleCreateProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        setImageError(false);
        setActionLoading(true);
        try {
            const formData = new FormData();
            formData.append('name', createForm.name);
            formData.append('selling_price', createForm.selling_price.toString());
            formData.append('description', createForm.description);
            formData.append('has_dynamic_pricing', createForm.has_dynamic_pricing ? '1' : '0');
            formData.append('price_slabs', JSON.stringify(createForm.price_slabs || []));
            formData.append('has_variations', createForm.has_variations ? '1' : '0');
            
            // Serialize variations metadata (excluding files)
            const variationsMeta = createForm.variations.map(v => ({
                name: v.name,
                selling_price: v.selling_price
            }));
            formData.append('variations', JSON.stringify(variationsMeta));

            // Append variation images with indexed keys
            createForm.variations.forEach((v, vIdx) => {
                v.images.forEach(file => {
                    formData.append(`variation_images_${vIdx}[]`, file);
                });
            });

            createForm.categories.forEach(id => formData.append('categories_id[]', id.toString()));
            createForm.images.forEach(file => formData.append('image_src[]', file));
            
            await createProduct(formData);
            fetchProducts(1);
            setCreateForm({ 
                name: '', 
                selling_price: '' as string | number, 
                description: '', 
                categories: [], 
                images: [], 
                has_dynamic_pricing: false, 
                price_slabs: [], 
                has_variations: false,
                variations: []
            });
            setIsCreateModalOpen(false);
        } catch (err) {
            alert('New product registration failed.');
        } finally {
            setActionLoading(false);
        }
    };


    const addPriceSlab = (isEdit: boolean) => {
        const newSlab = { min_qty: 1, max_qty: null as number | null, price: 0 };
        if (isEdit) {
            setEditForm({ ...editForm!, price_slabs: [...(editForm?.price_slabs || []), newSlab] });
        } else {
            setCreateForm({ ...createForm, price_slabs: [...createForm.price_slabs, newSlab] });
        }
    };

    const removePriceSlab = (isEdit: boolean, index: number) => {
        if (isEdit) {
            const newSlabs = [...(editForm?.price_slabs || [])];
            newSlabs.splice(index, 1);
            setEditForm({ ...editForm!, price_slabs: newSlabs });
        } else {
            const newSlabs = [...createForm.price_slabs];
            newSlabs.splice(index, 1);
            setCreateForm({ ...createForm, price_slabs: newSlabs });
        }
    };

    const updatePriceSlab = (isEdit: boolean, index: number, field: string, value: any) => {
        if (isEdit) {
            const newSlabs = [...(editForm?.price_slabs || [])];
            (newSlabs[index] as any)[field] = value;
            setEditForm({ ...editForm!, price_slabs: newSlabs });
        } else {
            const newSlabs = [...createForm.price_slabs];
            (newSlabs[index] as any)[field] = value;
            setCreateForm({ ...createForm, price_slabs: newSlabs });
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
            {/* Admin Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-8">
                <div>
                    <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-[0.2em] mb-2">
                        <Shield className="w-3.5 h-3.5" />
                        All Clinical Inventory
                    </div>
                    <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Product Registry</h1>
                    <p className="text-slate-500 font-light mt-1">Manage professional medical supplies and equipment classification.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-slate-100 px-5 py-2.5 rounded-xl border border-slate-200">
                        <span className="text-slate-400 font-bold text-[10px] uppercase tracking-widest block leading-none mb-1">Total Logs</span>
                        <span className="text-slate-900 font-bold text-lg leading-none">{pagination?.total || 0}</span>
                    </div>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="h-14 px-8 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center gap-2 group active:scale-95"
                    >
                        <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                        Register New Item
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-center gap-3 text-red-600 font-bold text-sm">
                    <X className="w-5 h-5" />
                    <span>{error}</span>
                </div>
            )}

            {/* Product List Grid */}
            <div className="grid grid-cols-1 gap-4 relative">
                {loading && products.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-40">
                        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
                        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Accessing All Records...</p>
                    </div>
                ) : products.map((product) => {
                    const isExpanded = expandedProductId === product.id;
                    const isEditing = editProductId === product.id;

                    return (
                        <div
                            key={product.id}
                            className={`group bg-white rounded-2xl border transition-all duration-300 ${isExpanded ? 'border-blue-400 shadow-xl shadow-blue-500/5' : 'border-slate-100 hover:border-slate-300 hover:shadow-md'
                                }`}
                        >
                            <div
                                onClick={() => handleExpand(product.id)}
                                className="flex flex-wrap items-center justify-between p-5 cursor-pointer gap-6"
                            >
                                <div className="flex items-center gap-5 flex-1 min-w-0">
                                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 flex-shrink-0 group-hover:scale-105 transition-transform duration-500">
                                        <img src={product.image_src?.[0] || PLACEHOLDER_IMG} alt="" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="text-lg font-bold text-slate-900 truncate">
                                            {product.name}
                                        </h3>
                                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                                            {product.categories.map(c => (
                                                <span key={c.id} className="text-[9px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                                                    {c.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-10">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Availability</p>
                                        <p className={`text-sm font-bold ${product.total_count < 5 ? 'text-red-500' : 'text-slate-900'}`}>
                                            {product.total_count} Units
                                        </p>
                                        <p className="text-[10px] font-bold text-amber-500">
                                            {product.available_stock} Available
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Unit Cost</p>
                                        {product.has_dynamic_pricing ? (
                                            <p className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md mb-2">VOLUME TIERS</p>
                                        ) : product.has_variations ? (
                                            <p className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md mb-2">VARIOUS SPECS</p>
                                        ) : (
                                            <p className="text-xl font-bold text-blue-600">${product.selling_price}</p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); isEditing ? cancelEdit() : startEdit(e, product); }}
                                            className={`p-2.5 rounded-lg transition-all active:scale-90 ${isEditing ? 'bg-slate-800 text-white' : 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'}`}
                                            title={isEditing ? "View Details" : "Edit Metadata"}
                                        >
                                            {isEditing ? <Eye size={18} /> : <Pencil size={18} />}
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(product.id); }}
                                            className="p-2.5 bg-slate-50 text-slate-400 border border-slate-200 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all active:scale-90"
                                            title="Security Disposal"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                        <div className={`ml-2 transition-transform duration-500 ${isExpanded ? 'rotate-180 text-blue-600' : 'text-slate-300'}`}>
                                            <ChevronDown size={20} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[1500px] border-t border-slate-100 opacity-100' : 'max-h-0 opacity-0'}`}>
                                <div className="p-8">
                                    {isEditing ? (
                                        <div className="space-y-8 animate-in slide-in-from-top-2 duration-300">
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                                {/* Edit Metadata */}
                                                <div className="space-y-6">
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Official Name</label>
                                                        <input
                                                            value={editForm?.name || ''}
                                                            onChange={(e) => setEditForm({ ...editForm!, name: e.target.value })}
                                                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all"
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <div className="flex items-center justify-between">
                                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Selling Price ($)</label>
                                                                {(editForm?.has_dynamic_pricing || editForm?.has_variations) && (
                                                                    <span className="text-[8px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded uppercase tracking-tighter">Inactive: Multi-tier mode</span>
                                                                )}
                                                            </div>
                                                            <input
                                                                disabled={editForm?.has_dynamic_pricing || editForm?.has_variations}
                                                                type="text"
                                                                value={(editForm?.has_dynamic_pricing || editForm?.has_variations) ? 'VARIABLE CONFIGURATION' : (editForm?.selling_price || '')}
                                                                onChange={(e) => setEditForm({ ...editForm!, selling_price: e.target.value })}
                                                                className={`w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all ${(editForm?.has_dynamic_pricing || editForm?.has_variations) ? 'opacity-50 grayscale cursor-not-allowed font-mono text-[10px]' : ''}`}
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Inventory</label>
                                                            <div className="w-full px-5 py-3.5 bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-400 flex justify-between items-center">
                                                                <span>{product.total_count} Total</span>
                                                                <span className="text-amber-500">{product.available_stock} Available</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Description</label>
                                                        <textarea
                                                            value={editForm?.description || ''}
                                                            onChange={(e) => setEditForm({ ...editForm!, description: e.target.value })}
                                                            rows={4}
                                                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 outline-none focus:bg-white focus:border-blue-500 transition-all resize-none"
                                                            placeholder="Describe clinical applications..."
                                                        />
                                                    </div>
                                                    <div className="space-y-4 pt-4 border-t border-slate-100">
                                                        <div className="flex items-center justify-between">
                                                            <div className="space-y-1">
                                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Configuration Type</label>
                                                                <p className="text-[10px] text-slate-400 ml-1">Enable for multi-spec products (e.g. sizes, materials)</p>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleToggleHasVariations(editForm!)}
                                                                className={`px-4 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all ${editForm?.has_variations ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-100 text-slate-400'}`}
                                                            >
                                                                {editForm?.has_variations ? 'VARIATIONS ENABLED' : 'SINGLE PRODUCT'}
                                                            </button>
                                                        </div>

                                                        {editForm?.has_variations ? (
                                                            <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300 bg-indigo-50/30 p-6 rounded-2xl border border-indigo-100">
                                                                <div className="flex items-center justify-between">
                                                                    <h5 className="text-[10px] font-bold text-indigo-600 uppercase tracking-[0.2em]">Defined Variations</h5>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setIsAddingVariationId(editForm!.id)}
                                                                        className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                                                                    >
                                                                        <Plus size={14} />
                                                                        NEW VARIATION
                                                                    </button>
                                                                </div>

                                                                <div className="space-y-4">
                                                                    {(editForm.variations || []).map((v, vIdx) => (
                                                                        <div key={v.id} className="bg-white border border-indigo-100 rounded-xl overflow-hidden shadow-sm">
                                                                            <div className="p-4 flex items-center justify-between bg-white border-b border-slate-50">
                                                                                <div className="flex items-center gap-3">
                                                                                    {v.image_src && v.image_src.length > 0 ? (
                                                                                        <img src={v.image_src[0]} alt="" className="w-10 h-10 rounded-lg object-cover border border-slate-100" />
                                                                                    ) : (
                                                                                        <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-300">
                                                                                            <ImageIcon size={16} />
                                                                                        </div>
                                                                                    )}
                                                                                    <div>
                                                                                        <p className="text-sm font-bold text-slate-900">{v.name}</p>
                                                                                        <p className="text-[10px] text-slate-400 font-mono">STOCK: {v.available_stock} / {v.total_count}</p>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="flex items-center gap-2">
                                                                                    <button 
                                                                                        onClick={() => handleDeleteVariation(editForm!.id, v.id)}
                                                                                        className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                                                                                    >
                                                                                        <Trash2 size={16} />
                                                                                    </button>
                                                                                </div>
                                                                            </div>
                                                                                <div className="space-y-1">
                                                                                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Base Price ($)</label>
                                                                                    <input
                                                                                        type="number"
                                                                                        value={v.selling_price || ''}
                                                                                        onChange={(e) => {
                                                                                            const newVariations = [...editForm.variations];
                                                                                            newVariations[vIdx].selling_price = e.target.value;
                                                                                            setEditForm({ ...editForm, variations: newVariations });
                                                                                        }}
                                                                                        placeholder="Price on Request"
                                                                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all"
                                                                                    />
                                                                                </div>
                                                                        </div>
                                                                    ))}

                                                                    {isAddingVariationId === editForm.id && (
                                                                        <div className="bg-white p-6 rounded-2xl border-2 border-indigo-200 shadow-xl space-y-4 animate-in zoom-in-95 duration-300">
                                                                            <h6 className="text-sm font-bold text-slate-900">Configure New Variation</h6>
                                                                            <div className="space-y-3">
                                                                                <div className="space-y-1">
                                                                                    <label className="text-[9px] font-bold text-slate-400">VARIATION NAME</label>
                                                                                    <input 
                                                                                        value={variationForm.name}
                                                                                        onChange={(e) => setVariationForm({ ...variationForm, name: e.target.value })}
                                                                                        placeholder="e.g. Size: Large, Color: Blue"
                                                                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-indigo-500 transition-all"
                                                                                    />
                                                                                </div>
                                                                                <div className="space-y-1">
                                                                                    <label className="text-[9px] font-bold text-slate-400">BASE PRICE (Optional)</label>
                                                                                    <input 
                                                                                        type="number"
                                                                                        value={variationForm.selling_price}
                                                                                        onChange={(e) => setVariationForm({ ...variationForm, selling_price: e.target.value })}
                                                                                        placeholder="Contact for Price"
                                                                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-indigo-500 transition-all"
                                                                                    />
                                                                                </div>
                                                                                <div className="space-y-1">
                                                                                    <label className="text-[9px] font-bold text-slate-400">VARIATION IMAGES</label>
                                                                                    <input 
                                                                                        type="file" multiple accept="image/*"
                                                                                        onChange={(e) => setVariationForm({ ...variationForm, images: e.target.files ? Array.from(e.target.files) : [] })}
                                                                                        className="block w-full text-[10px] text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"
                                                                                    />
                                                                                </div>


                                                                            </div>
                                                                            <div className="flex gap-2 pt-2">
                                                                                <button onClick={() => setIsAddingVariationId(null)} className="flex-1 py-2.5 text-[10px] font-bold text-slate-400 hover:text-slate-600">Abort</button>
                                                                                <button onClick={() => handleCreateVariation(editForm.id)} className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-bold shadow-lg shadow-indigo-500/20 active:scale-95 transition-all">Create Variation</button>
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    {!isAddingVariationId && (editForm.variations || []).length === 0 && (
                                                                        <div className="py-12 border-2 border-dashed border-indigo-100 rounded-2xl flex flex-col items-center justify-center text-indigo-300">
                                                                            <Settings size={32} className="opacity-20 mb-2" />
                                                                            <span className="text-[10px] font-bold uppercase tracking-widest">No variations mapped</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="space-y-4 pt-4">
                                                                <div className="flex items-center justify-between">
                                                                    <div className="space-y-1">
                                                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Dynamic Pricing Slabs</label>
                                                                        {editForm?.has_variations && (
                                                                            <p className="text-[9px] text-amber-600 font-bold uppercase tracking-tight ml-1 animate-pulse">Unavailable: Variations active</p>
                                                                        )}
                                                                    </div>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            const newDynamicValue = !editForm?.has_dynamic_pricing;
                                                                            setEditForm({ 
                                                                                ...editForm!, 
                                                                                has_dynamic_pricing: newDynamicValue,
                                                                                // If enabling dynamic pricing, disable variations
                                                                                ...(newDynamicValue ? { has_variations: false } : {})
                                                                            });
                                                                        }}
                                                                        className={`px-4 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all ${editForm?.has_dynamic_pricing ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-100 text-slate-400 font-medium'}`}
                                                                    >
                                                                        {editForm?.has_dynamic_pricing ? 'ENABLED' : 'DISABLED'}
                                                                    </button>
                                                                </div>

                                                                {editForm?.has_dynamic_pricing && (
                                                                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                                                        {(editForm.price_slabs || []).map((slab, idx) => (
                                                                            <div key={idx} className="flex gap-3 items-end bg-slate-50 p-3 rounded-xl border border-slate-200">
                                                                                <div className="flex-1 space-y-1">
                                                                                    <label className="text-[8px] font-bold text-slate-400 uppercase">Min Qty</label>
                                                                                    <input
                                                                                        type="number"
                                                                                        value={slab.min_qty}
                                                                                        onChange={(e) => updatePriceSlab(true, idx, 'min_qty', parseInt(e.target.value))}
                                                                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900"
                                                                                    />
                                                                                </div>
                                                                                <div className="flex-1 space-y-1">
                                                                                    <label className="text-[8px] font-bold text-slate-400 uppercase">Max Qty</label>
                                                                                    <input
                                                                                        type="number"
                                                                                        value={slab.max_qty || ''}
                                                                                        onChange={(e) => updatePriceSlab(true, idx, 'max_qty', e.target.value ? parseInt(e.target.value) : null)}
                                                                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900"
                                                                                        placeholder="∞"
                                                                                    />
                                                                                </div>
                                                                                <div className="flex-1 space-y-1">
                                                                                    <label className="text-[8px] font-bold text-slate-400 uppercase">Price ($)</label>
                                                                                    <input
                                                                                        type="number"
                                                                                        value={slab.price}
                                                                                        onChange={(e) => updatePriceSlab(true, idx, 'price', parseFloat(e.target.value))}
                                                                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900"
                                                                                    />
                                                                                </div>
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => removePriceSlab(true, idx)}
                                                                                    className="p-2.5 text-red-400 hover:text-red-600 transition-colors"
                                                                                >
                                                                                    <Trash2 size={16} />
                                                                                </button>
                                                                            </div>
                                                                        ))}
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => addPriceSlab(true)}
                                                                            className="w-full py-2.5 border-2 border-dashed border-slate-200 rounded-xl text-[10px] font-bold text-slate-400 hover:bg-white hover:border-blue-400 hover:text-blue-600 transition-all flex items-center justify-center gap-2"
                                                                        >
                                                                            <Plus size={14} />
                                                                            ADD PRICE SLAB
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="space-y-4">
                                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Product Categories</label>
                                                        <div className="flex flex-wrap gap-2 min-h-[56px] p-3 bg-slate-50 border border-slate-200 rounded-xl">
                                                            {editForm?.categories.map(cat => (
                                                                <span key={cat.id} className="inline-flex items-center bg-slate-800 text-white text-[10px] font-bold uppercase rounded-lg px-2.5 py-1.5 gap-2">
                                                                    {cat.name}
                                                                    <button onClick={() => setEditForm({ ...editForm, categories: editForm.categories.filter(c => c.id !== cat.id) })} className="hover:text-red-400">
                                                                        <X size={12} />
                                                                    </button>
                                                                </span>
                                                            ))}
                                                            <select
                                                                onChange={(e) => {
                                                                    const id = Number(e.target.value);
                                                                    const cat = allCategories.find(c => c.id === id);
                                                                    if (cat && !editForm?.categories.some(c => c.id === id)) {
                                                                        setEditForm({ ...editForm!, categories: [...editForm!.categories, cat] });
                                                                    }
                                                                    e.target.value = "";
                                                                }}
                                                                className="bg-transparent border-none outline-none text-[10px] font-bold text-blue-600 uppercase tracking-widest cursor-pointer ml-2"
                                                            >
                                                                <option value="">+ ASSIGN CATEGORY</option>
                                                                {allCategories.map(c => !editForm?.categories.some(ec => ec.id === c.id) && (
                                                                    <option key={c.id} value={c.id}>{c.name}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Edit Images */}
                                                <div className="space-y-4">
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Clinical Assets</label>
                                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                                        {editForm?.image_src.map((src, idx) => (
                                                            <div key={idx} className="aspect-square rounded-xl overflow-hidden relative group/img bg-slate-50 border border-slate-100">
                                                                <img src={src} alt="" className="w-full h-full object-cover transition-transform group-hover/img:scale-105" />
                                                                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center p-4">
                                                                    <button
                                                                        onClick={() => setImageToDelete({ productId: product.id, path: src })}
                                                                        className="p-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all scale-75 group-hover/img:scale-100"
                                                                    >
                                                                        <Trash2 size={16} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                        <button
                                                            onClick={() => setUploadModalId(product.id)}
                                                            className="aspect-square rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-600 transition-all group/add"
                                                        >
                                                            <Plus className="w-6 h-6 mb-2 group-hover:rotate-90 transition-transform" />
                                                            <span className="text-[9px] font-bold uppercase tracking-wider">Add Asset</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex justify-end gap-3 pt-8 border-t border-slate-100">
                                                <button onClick={cancelEdit} className="px-6 py-3 text-slate-400 font-bold hover:text-slate-900">Cancel Audit</button>
                                                <button
                                                    onClick={() => setSaveConfirmProduct(editForm)}
                                                    className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-2"
                                                >
                                                    <Check size={18} />
                                                    Sync All Parameters
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-10 animate-in fade-in duration-500">
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                                <div className="space-y-6">
                                                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                            <FileText size={12} />
                                                            Product Description
                                                        </h4>
                                                        <p className="text-slate-700 leading-relaxed font-light text-sm italic">
                                                            {product.description || 'Global inventory record without additional metadata.'}
                                                        </p>
                                                    </div>

                                                    {product.has_variations && product.variations.length > 0 && (
                                                        <div className="p-6 bg-indigo-50/30 rounded-2xl border border-indigo-100">
                                                            <h4 className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                                <Activity size={12} />
                                                                Product Specifications / Variations
                                                            </h4>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
                                                                {product.variations.map(v => (
                                                                    <div key={v.id} className="flex items-center gap-3 p-3 bg-white border border-indigo-50 rounded-xl shadow-sm">
                                                                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-50 border border-slate-100 flex-shrink-0">
                                                                            <img src={v.image_src?.[0] || product.image_src?.[0] || PLACEHOLDER_IMG} className="w-full h-full object-cover" />
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="text-xs font-bold text-slate-800 truncate">{v.name}</p>
                                                                            <p className="text-[10px] font-bold text-indigo-500">${v.selling_price}</p>
                                                                        </div>
                                                                        <div className="text-right">
                                                                            <p className="text-[10px] font-bold text-slate-400 uppercase leading-none">Stock</p>
                                                                            <p className="text-xs font-bold text-slate-900">{v.available_stock} Units</p>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {product.has_dynamic_pricing && product.price_slabs && product.price_slabs.length > 0 && (
                                                        <div className="p-6 bg-blue-50/30 rounded-2xl border border-blue-100">
                                                            <h4 className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                                <FileText size={12} />
                                                                Bulk Requisition Pricing (Slabs)
                                                            </h4>
                                                            <div className="space-y-2">
                                                                {product.price_slabs.map((slab, sIdx) => (
                                                                    <div key={sIdx} className="flex items-center justify-between p-3 bg-white border border-blue-50 rounded-xl shadow-sm px-5">
                                                                        <div className="flex flex-col">
                                                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Volume Range</span>
                                                                            <span className="text-[11px] font-bold text-slate-800">
                                                                                {slab.min_qty}{slab.max_qty ? ` - ${slab.max_qty}` : '+'} Units
                                                                            </span>
                                                                        </div>
                                                                        <div className="h-4 w-px bg-blue-100" />
                                                                        <div className="flex flex-col items-end">
                                                                            <span className="text-[9px] font-bold text-blue-400 uppercase tracking-tighter">Clinical Rate</span>
                                                                            <span className="text-sm font-black text-blue-600">${slab.price}</span>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="p-4 bg-white border border-slate-100 rounded-xl shadow-sm">
                                                            <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Sold Units</p>
                                                            <p className="text-2xl font-bold text-slate-900">{product.sold_count}</p>
                                                        </div>
                                                        <div className="p-4 bg-white border border-slate-100 rounded-xl shadow-sm">
                                                            <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Total Stock</p>
                                                            <p className="text-2xl font-bold text-slate-900">{product.total_count}</p>
                                                        </div>
                                                        <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl shadow-sm col-span-2">
                                                            <p className="text-[9px] font-bold text-amber-500 uppercase mb-1">Available (unreserved)</p>
                                                            <p className="text-2xl font-bold text-amber-600">{product.available_stock}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="space-y-4">
                                                    <h4 className="text-[10px] font-bold text-blue-600 uppercase tracking-widest flex items-center gap-2">
                                                        <Activity size={12} />
                                                        Visual Assets
                                                    </h4>
                                                    <div className="grid grid-cols-3 gap-4">
                                                        {product.image_src.map((img, i) => (
                                                            <div key={i} className="aspect-square rounded-xl overflow-hidden border border-slate-100 shadow-sm transition-transform hover:scale-105 duration-300">
                                                                <img src={img} alt="" className="w-full h-full object-cover" />
                                                            </div>
                                                        ))}
                                                        {product.image_src.length === 0 && (
                                                            <div className="col-span-full py-12 bg-slate-50 border-2 border-dashed border-slate-100 rounded-2xl flex flex-col items-center justify-center text-slate-200">
                                                                <ImageIcon size={32} />
                                                                <span className="text-[10px] font-bold uppercase mt-2">No Visuals Logged</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}

                {loading && (
                    <div className="absolute inset-x-0 -top-4 z-20 flex justify-center">
                        <div className="bg-blue-600 text-white px-4 py-1 rounded-full text-[10px] font-bold shadow-lg flex items-center gap-2">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            UPDATING REGISTRY
                        </div>
                    </div>
                )}
            </div>

            {/* Pagination Controls */}
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
                            className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:bg-slate-50 disabled:opacity-30 transition-all font-bold"
                        >
                            <ChevronLeft />
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
                                {start > 2 && <span className="w-6 text-center text-slate-400 font-bold text-sm">…</span>}
                            </>
                        )}
                        {pages.map(pageNum => (
                            <button
                                key={pageNum}
                                onClick={() => handlePageChange(pageNum)}
                                className={`w-12 h-12 rounded-xl text-xs font-bold transition-all ${currentPage === pageNum ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                            >
                                {pageNum}
                            </button>
                        ))}
                        {end < total && (
                            <>
                                {end < total - 1 && <span className="w-6 text-center text-slate-400 font-bold text-sm">…</span>}
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
                            className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:bg-slate-50 disabled:opacity-30 transition-all font-bold"
                        >
                            <ChevronRight />
                        </button>
                    </div>
                );
            })()}

            {/* Modals & Overlays */}
            {uploadModalId && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl w-full max-w-sm p-10 shadow-2xl space-y-8 text-center animate-in zoom-in-95 duration-500">
                        <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full mx-auto flex items-center justify-center shadow-sm">
                            <Upload size={32} />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Add New Image</h3>
                        <div className="space-y-4">
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(e) => {
                                    const files = e.target.files;
                                    if (files && files.length > 0) handleAddImages(uploadModalId, files);
                                }}
                                className="block w-full text-xs text-slate-500 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-[10px] file:font-bold file:uppercase file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                            />
                            <button onClick={() => setUploadModalId(null)} className="text-[10px] font-bold uppercase text-slate-400 hover:text-slate-900 tracking-widest">Abort Upload</button>
                        </div>
                    </div>
                </div>
            )}

            {saveConfirmProduct && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl w-full max-w-sm p-10 shadow-2xl text-center space-y-8 animate-in zoom-in-95 duration-500 border border-slate-100">
                        <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full mx-auto flex items-center justify-center shadow-sm">
                            <Check size={36} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Commit Parameters?</h3>
                            <p className="text-slate-500 text-sm font-light mt-2">Updates will be synced with the database.</p>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={() => setSaveConfirmProduct(null)} className="flex-1 py-4 text-slate-400 font-bold hover:bg-slate-50 rounded-xl transition-all">Cancel</button>
                            <button
                                onClick={saveEdit}
                                disabled={actionLoading}
                                className="flex-1 py-4 bg-blue-600 text-white font-bold rounded-xl shadow-xl shadow-blue-600/20 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center"
                            >
                                {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Sync'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {deleteConfirmId && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-red-900/10 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl w-full max-w-sm p-10 shadow-2xl text-center space-y-8 border-b-8 border-red-600 animate-in zoom-in-95 duration-500">
                        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full mx-auto flex items-center justify-center shadow-sm">
                            <Trash2 size={36} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Security Disposal?</h3>
                            <p className="text-slate-500 text-sm font-light mt-2">The selected Product will be permanently purged from database.</p>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={() => setDeleteConfirmId(null)} className="flex-1 py-4 text-slate-400 font-bold hover:bg-slate-50 rounded-xl transition-all">Abort</button>
                            <button
                                onClick={() => handleDelete(deleteConfirmId)}
                                disabled={actionLoading}
                                className="flex-1 py-4 bg-red-600 text-white font-bold rounded-xl shadow-xl shadow-red-600/20 hover:bg-red-700 active:scale-95 transition-all flex items-center justify-center"
                            >
                                {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'PROCEED'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {imageToDelete && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/20 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl w-full max-w-xs p-8 shadow-2xl text-center space-y-6">
                        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full mx-auto flex items-center justify-center">
                            <X size={24} />
                        </div>
                        <p className="text-slate-900 font-bold text-sm leading-tight">Dispose of this clinical asset permanently?</p>
                        <div className="flex gap-4 pt-2">
                            <button onClick={() => setImageToDelete(null)} className="flex-1 py-3 text-slate-400 font-bold text-xs">NO</button>
                            <button onClick={handleRemoveImage} className="flex-1 py-3 bg-red-600 text-white font-bold text-xs rounded-xl shadow-lg active:scale-95 transition-all">YES, DISPOSE</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Component Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-500">
                    <div className="bg-white rounded-[40px] w-full max-w-3xl p-10 max-h-[90vh] overflow-y-auto shadow-3xl animate-in zoom-in-95 duration-500 border border-slate-100 relative">
                        <button onClick={() => { setIsCreateModalOpen(false); setCreateForm({ name: '', selling_price: '' as string | number, description: '', categories: [], images: [], has_dynamic_pricing: false, price_slabs: [], has_variations: false, variations: [] }); setImageError(false); }} className="absolute top-8 right-8 p-3 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-full transition-all">
                            <X size={24} />
                        </button>
                        <div className="flex flex-col items-center text-center space-y-4 mb-10 mt-4">
                            <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-blue-600/20">
                                <Plus size={32} />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Product Registration</h2>
                                <p className="text-[10px] text-blue-600 font-bold uppercase tracking-[0.3em] mt-2">Add Product Pop-up</p>
                            </div>
                        </div>

                        <form onSubmit={handleCreateProduct} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Official Description Name</label>
                                        <input
                                            required
                                            value={createForm.name}
                                            onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                                            placeholder="E.g. MRI Grade Sterile Syringe - 10ml"
                                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-mono placeholder:font-sans placeholder:font-normal placeholder:opacity-50"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Standard Unit Cost ($)</label>
                                        <input
                                            disabled={createForm.has_dynamic_pricing || createForm.has_variations}
                                            required={!createForm.has_dynamic_pricing && !createForm.has_variations}
                                            type="number"
                                            value={(createForm.has_dynamic_pricing || createForm.has_variations) ? '' : createForm.selling_price}
                                            onChange={(e) => setCreateForm({ ...createForm, selling_price: e.target.value })}
                                            placeholder={(createForm.has_dynamic_pricing || createForm.has_variations) ? "Price configured per slab/variation" : "249.00"}
                                            className={`w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all ${(createForm.has_dynamic_pricing || createForm.has_variations) ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Description</label>
                                        <textarea
                                            value={createForm.description}
                                            onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                                            rows={4}
                                            placeholder="Detailed technical overview and safety warnings..."
                                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 outline-none focus:bg-white focus:border-blue-500 transition-all resize-none"
                                        />
                                    </div>
                                    <div className="space-y-4 pt-4 border-t border-slate-100">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Dynamic Pricing Slabs</label>
                                                {createForm.has_variations && (
                                                    <p className="text-[9px] text-amber-600 font-bold uppercase tracking-tight ml-1 animate-pulse">Unavailable: Variations active</p>
                                                )}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newValue = !createForm.has_dynamic_pricing;
                                                    setCreateForm({ 
                                                        ...createForm, 
                                                        has_dynamic_pricing: newValue,
                                                        // If enabling dynamic pricing, disable variations
                                                        ...(newValue ? { has_variations: false } : {})
                                                    });
                                                }}
                                                className={`px-4 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all ${createForm.has_dynamic_pricing ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-100 text-slate-400 font-medium'}`}
                                            >
                                                {createForm.has_dynamic_pricing ? 'ENABLED' : 'DISABLED'}
                                            </button>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Configuration Type</label>
                                                <p className="text-[9px] text-slate-400 ml-1 italic">Multi-spec products</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newValue = !createForm.has_variations;
                                                    setCreateForm({ 
                                                        ...createForm, 
                                                        has_variations: newValue,
                                                        // If enabling variations, disable price slabs and clear them
                                                        ...(newValue ? { has_dynamic_pricing: false, price_slabs: [] } : {})
                                                    });
                                                }}
                                                className={`px-4 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all ${createForm.has_variations ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-100 text-slate-400 font-medium'}`}
                                            >
                                                {createForm.has_variations ? 'VARIATIONS ENABLED' : 'SINGLE PRODUCT'}
                                            </button>
                                        </div>

                                        {createForm.has_dynamic_pricing && (
                                            <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                                {createForm.price_slabs.map((slab, idx) => (
                                                    <div key={idx} className="flex gap-3 items-end bg-slate-50 p-3 rounded-xl border border-slate-200">
                                                        <div className="flex-1 space-y-1">
                                                            <label className="text-[8px] font-bold text-slate-400 uppercase">Min Qty</label>
                                                            <input
                                                                type="number"
                                                                value={slab.min_qty}
                                                                onChange={(e) => updatePriceSlab(false, idx, 'min_qty', parseInt(e.target.value))}
                                                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900"
                                                            />
                                                        </div>
                                                        <div className="flex-1 space-y-1">
                                                            <label className="text-[8px] font-bold text-slate-400 uppercase">Max Qty</label>
                                                            <input
                                                                type="number"
                                                                value={slab.max_qty || ''}
                                                                onChange={(e) => updatePriceSlab(false, idx, 'max_qty', e.target.value ? parseInt(e.target.value) : null)}
                                                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900"
                                                                placeholder="∞"
                                                            />
                                                        </div>
                                                        <div className="flex-1 space-y-1">
                                                            <label className="text-[8px] font-bold text-slate-400 uppercase">Price ($)</label>
                                                            <input
                                                                type="number"
                                                                value={slab.price}
                                                                onChange={(e) => updatePriceSlab(false, idx, 'price', parseFloat(e.target.value))}
                                                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900"
                                                            />
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => removePriceSlab(false, idx)}
                                                            className="p-2.5 text-red-400 hover:text-red-600 transition-colors"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                ))}
                                                <button
                                                    type="button"
                                                    onClick={() => addPriceSlab(false)}
                                                    className="w-full py-2.5 border-2 border-dashed border-slate-200 rounded-xl text-[10px] font-bold text-slate-400 hover:bg-white hover:border-blue-400 hover:text-blue-600 transition-all flex items-center justify-center gap-2"
                                                >
                                                    <Plus size={14} />
                                                    ADD PRICE SLAB
                                                </button>
                                            </div>
                                        )}

                                        {createForm.has_variations && (
                                            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300 bg-indigo-50/30 p-4 rounded-2xl border border-indigo-100">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest ml-1">Define Item Variations</label>
                                                </div>
                                                
                                                {/* SCROLLABLE VARIATIONS LIST */}
                                                <div className="max-h-[280px] overflow-y-auto pr-2 space-y-3 scrollbar-thin scrollbar-thumb-indigo-200">
                                                    {createForm.variations.map((v, vIdx) => (
                                                        <div key={vIdx} className="bg-white p-4 rounded-xl border border-indigo-100 shadow-sm space-y-3 relative group/var">
                                                            <button 
                                                                type="button"
                                                                onClick={() => setCreateForm({ ...createForm, variations: createForm.variations.filter((_, i) => i !== vIdx) })}
                                                                className="absolute top-2 right-2 p-1.5 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover/var:opacity-100"
                                                            >
                                                                <X size={14} />
                                                            </button>
                                                            
                                                            <div className="grid grid-cols-2 gap-3">
                                                                <div className="space-y-1">
                                                                    <label className="text-[8px] font-bold text-slate-400 uppercase ml-1">Variation Name</label>
                                                                    <input 
                                                                        type="text"
                                                                        value={v.name}
                                                                        placeholder="e.g. Size XL / 500mg"
                                                                        onChange={(e) => {
                                                                            const newVars = [...createForm.variations];
                                                                            newVars[vIdx].name = e.target.value;
                                                                            setCreateForm({ ...createForm, variations: newVars });
                                                                        }}
                                                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg text-[11px] font-bold text-slate-900 outline-none focus:bg-white focus:border-indigo-400 transition-all"
                                                                    />
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <label className="text-[8px] font-bold text-slate-400 uppercase ml-1">Rate ($)</label>
                                                                    <input 
                                                                        type="number"
                                                                        value={v.selling_price}
                                                                        onChange={(e) => {
                                                                            const newVars = [...createForm.variations];
                                                                            newVars[vIdx].selling_price = e.target.value;
                                                                            setCreateForm({ ...createForm, variations: newVars });
                                                                        }}
                                                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg text-[11px] font-bold text-slate-900 outline-none focus:bg-white focus:border-indigo-400 transition-all"
                                                                    />
                                                                </div>
                                                            </div>
                                                            
                                                            <div className="space-y-1">
                                                                <label className="text-[8px] font-bold text-slate-400 uppercase ml-1">Asset Mapping</label>
                                                                <div className="flex items-center gap-2">
                                                                    <input 
                                                                        type="file"
                                                                        id={`var-img-${vIdx}`}
                                                                        className="hidden"
                                                                        onChange={(e) => {
                                                                            if (e.target.files) {
                                                                                const newVars = [...createForm.variations];
                                                                                newVars[vIdx].images = [...newVars[vIdx].images, ...Array.from(e.target.files)];
                                                                                setCreateForm({ ...createForm, variations: newVars });
                                                                            }
                                                                        }}
                                                                        multiple
                                                                    />
                                                                    <label htmlFor={`var-img-${vIdx}`} className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-[9px] font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-white hover:border-indigo-300 hover:text-indigo-600 transition-all flex items-center gap-1.5">
                                                                        <Upload size={10} />
                                                                        Add Visual
                                                                    </label>
                                                                    <div className="flex -space-x-2 overflow-hidden">
                                                                        {v.images.map((img, iIdx) => (
                                                                            <img key={iIdx} src={URL.createObjectURL(img)} className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover" />
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setCreateForm({
                                                            ...createForm,
                                                            variations: [...createForm.variations, { name: '', selling_price: '', images: [] }]
                                                        });
                                                    }}
                                                    className="w-full py-2.5 border-2 border-dashed border-indigo-200 rounded-xl text-[10px] font-bold text-indigo-400 hover:bg-white hover:border-indigo-400 hover:text-indigo-600 transition-all flex items-center justify-center gap-2"
                                                >
                                                    <Plus size={14} />
                                                    INITIATE NEW VARIATION
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Product Categories</label>
                                        <div className="grid grid-cols-1 gap-2 max-h-[160px] overflow-y-auto p-3 bg-slate-50 border border-slate-200 rounded-xl scrollbar-thin">
                                            {allCategories.map((cat) => (
                                                <label key={cat.id} className="flex items-center p-2 hover:bg-white rounded-lg cursor-pointer transition-all border border-transparent hover:border-slate-100">
                                                    <input
                                                        type="checkbox"
                                                        checked={createForm.categories.includes(cat.id)}
                                                        onChange={(e) => {
                                                            const checked = e.target.checked;
                                                            setCreateForm({
                                                                ...createForm,
                                                                categories: checked ? [...createForm.categories, cat.id] : createForm.categories.filter(id => id !== cat.id)
                                                            });
                                                        }}
                                                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                                    />
                                                    <span className="ml-3 text-xs font-bold text-slate-700 uppercase tracking-wider">{cat.name}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between ml-1">
                                            <label className={`text-[10px] font-bold uppercase tracking-widest ${imageError ? 'text-red-500' : 'text-slate-400'}`}>
                                                Clinical Documentation (Images)
                                            </label>
                                            {createForm.images.length > 0 && (
                                                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                                                    {createForm.images.length} asset{createForm.images.length > 1 ? 's' : ''}
                                                </span>
                                            )}
                                        </div>

                                        {/* Image Preview Grid */}
                                        {createForm.images.length > 0 && (
                                            <div className="grid grid-cols-3 gap-2">
                                                {createForm.images.map((file, idx) => (
                                                    <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                                                        <img
                                                            src={URL.createObjectURL(file)}
                                                            alt={file.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                        <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/40 transition-all duration-200 flex items-center justify-center">
                                                            <button
                                                                type="button"
                                                                onClick={() => setCreateForm({ ...createForm, images: createForm.images.filter((_, i) => i !== idx) })}
                                                                className="opacity-0 group-hover:opacity-100 transition-all duration-200 p-1.5 bg-red-500 text-white rounded-lg shadow-lg active:scale-90"
                                                            >
                                                                <X size={14} />
                                                            </button>
                                                        </div>
                                                        <div className="absolute bottom-0 left-0 right-0 px-2 py-1 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-200">
                                                            <p className="text-white text-[9px] font-bold truncate">{file.name}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Upload / Add More Button */}
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={(e) => {
                                                const files = e.target.files;
                                                if (files) {
                                                    setCreateForm({ ...createForm, images: [...createForm.images, ...Array.from(files)] });
                                                    setImageError(false);
                                                }
                                            }}
                                            className="hidden"
                                            id="clinical-upload"
                                        />
                                        <label
                                            htmlFor="clinical-upload"
                                            className={`w-full border-2 border-dashed rounded-xl flex items-center justify-center gap-3 cursor-pointer transition-all ${createForm.images.length > 0
                                                ? 'py-3 border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 bg-white'
                                                : 'py-10 border-slate-200 hover:border-blue-400 hover:bg-slate-50 bg-slate-50/50 flex-col'
                                                }`}
                                        >
                                            {createForm.images.length > 0 ? (
                                                <>
                                                    <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                                        <Plus size={14} className="text-white" />
                                                    </div>
                                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Add More Images</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="text-slate-300 w-8 h-8 mb-1" />
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select Visual Data</span>
                                                    <span className="text-[9px] text-slate-300 font-medium">Click to browse files</span>
                                                </>
                                            )}
                                        </label>

                                        {imageError && (
                                            <p className="text-[10px] font-bold text-red-500 text-center uppercase tracking-widest">
                                                Asset imagery is mandatory
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={actionLoading}
                                className="w-full h-16 bg-blue-600 text-white rounded-2xl font-bold text-lg shadow-2xl shadow-blue-600/30 hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {actionLoading ? <Loader2 className="animate-spin" /> : <Settings className="w-6 h-6" />}
                                {actionLoading ? 'Initializing Integration...' : 'Authorize Product Registration'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
'use client';

import React, { useEffect, useState } from 'react';
import {
    Plus,
    Pencil,
    Trash2,
    Loader2,
    AlertCircle,
    X,
    Check,
    Tag,
    Shield,
    Activity,
    FolderKanban
} from 'lucide-react';
import {
    getAllCategories,
    createCategory,
    updateCategoryName,
    deleteCategory,
    saveCategoryImage,
    updateCategoryImage,
    deleteCategoryImage
} from '@/lib/api/api_private';
import { Image as ImageIcon, Camera } from 'lucide-react';


interface Category {
    id: number;
    name: string;
    image?: {
        image_url: string;
    } | null;
    created_at?: string;
    updated_at?: string;
}

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [categoryName, setCategoryName] = useState('');
    const [categoryImage, setCategoryImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const response = await getAllCategories();
            setCategories(response.data || response);
            setError(null);
        } catch (err: any) {
            setError('Clinical classification retrieval failure.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!categoryName.trim()) return;

        setActionLoading(true);
        try {
            const resp = await createCategory(categoryName);
            const newCategoryId = resp.data.id;

            if (categoryImage) {
                const formData = new FormData();
                formData.append('category_id', newCategoryId.toString());
                formData.append('image_url', categoryImage);
                await saveCategoryImage(formData);
            }

            setIsAddModalOpen(false);
            setCategoryName('');
            setCategoryImage(null);
            setImagePreview(null);
            fetchCategories();
        } catch (err) {
            console.error(err);
            alert('Failed to register protocol layer.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleEditCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCategory || !categoryName.trim()) return;

        setActionLoading(true);
        try {
            await updateCategoryName(selectedCategory.id, categoryName);

            if (categoryImage) {
                const formData = new FormData();
                formData.append('category_id', selectedCategory.id.toString());
                formData.append('image_url', categoryImage);

                if (selectedCategory.image) {
                    // Delete the old image first, then save fresh —
                    // avoids relying on stale frontend state for the exists() check
                    await deleteCategoryImage(selectedCategory.id);
                }
                await saveCategoryImage(formData);
            }

            setIsEditModalOpen(false);
            setSelectedCategory(null);
            setCategoryName('');
            setCategoryImage(null);
            setImagePreview(null);
            fetchCategories();
        } catch (err) {
            console.error(err);
            alert('Failed to synchronize classification.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteCategory = async () => {
        if (!selectedCategory) return;

        setActionLoading(true);
        try {
            await deleteCategory(selectedCategory.id);
            setIsDeleteModalOpen(false);
            setSelectedCategory(null);
            fetchCategories();
        } catch (err) {
            console.error(err);
            alert('Security purge failed for selected layer.');
        } finally {
            setActionLoading(false);
        }
    };

    const openEditModal = (category: Category) => {
        setSelectedCategory(category);
        setCategoryName(category.name);
        setCategoryImage(null);      // ← add this
        setImagePreview(null);       // ← add this
        setIsEditModalOpen(true);
    };

    const openDeleteModal = (category: Category) => {
        setSelectedCategory(category);
        setIsDeleteModalOpen(true);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-8">
                <div>
                    <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-[0.2em] mb-2">
                        <FolderKanban className="w-3.5 h-3.5" />
                        Product Categories
                    </div>
                    <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Categories</h1>
                    <p className="text-slate-500 font-light mt-1">Organize medical components into clinical categories and departments.</p>
                </div>
                <button
                    onClick={() => {
                        setCategoryName('');
                        setCategoryImage(null);
                        setImagePreview(null);
                        setIsAddModalOpen(true);
                    }}
                    className="h-14 px-8 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center gap-2 group active:scale-95"
                >
                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                    <span>Add New Category</span>
                </button>
            </div>

            {error && (
                <div className="flex items-center gap-3 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 font-bold text-sm">
                    <AlertCircle className="w-5 h-5" />
                    <p>{error}</p>
                </div>
            )}

            {/* Grid display */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {loading && categories.length === 0 ? (
                    Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="h-40 bg-slate-100 rounded-2xl animate-pulse border border-slate-200" />
                    ))
                ) : categories.map((category) => (
                    <div
                        key={category.id}
                        className="group relative bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300"
                    >
                        <div className="flex flex-col h-full justify-between">
                            <div className="flex items-start justify-between">
                                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors overflow-hidden border border-blue-100">
                                    {category.image ? (
                                        <img src={category.image.image_url} alt={category.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <Tag size={24} />
                                    )}
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => openEditModal(category)}
                                        className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-all border border-slate-200"
                                    >
                                        <Pencil size={14} />
                                    </button>
                                    <button
                                        onClick={() => openDeleteModal(category)}
                                        className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:bg-red-50 hover:text-red-600 transition-all border border-slate-200"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 tracking-tight leading-tight group-hover:text-blue-600 transition-colors">
                                    {category.name}
                                </h3>
                                <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Category-ID: {category.id}</span>
                                    <Activity className="w-3 h-3 text-slate-200 group-hover:text-blue-300" />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {!loading && categories.length === 0 && (
                    <div className="col-span-full py-24 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[32px] flex flex-col items-center justify-center text-slate-300">
                        <Tag className="w-12 h-12 mb-4 opacity-30" />
                        <p className="font-bold text-sm uppercase tracking-widest">No Categories Logged</p>
                    </div>
                )}
            </div>

            {/* --- Modals --- */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[32px] w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-500">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold text-slate-900">Define Category</h2>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-900"><X /></button>
                        </div>
                        <form onSubmit={handleAddCategory} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Official Category Name</label>
                                <input
                                    type="text"
                                    required
                                    value={categoryName}
                                    onChange={(e) => setCategoryName(e.target.value)}
                                    placeholder="e.g. Surgical Instruments"
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-blue-500 outline-none transition-all font-bold"
                                    autoFocus
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Category Icon/Image</label>
                                <div className="flex items-center gap-4">
                                    <div className="w-20 h-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden">
                                        {imagePreview ? (
                                            <img src={imagePreview} className="w-full h-full object-cover" />
                                        ) : (
                                            <ImageIcon className="text-slate-300" size={24} />
                                        )}
                                    </div>
                                    <label className="flex-1">
                                        <div className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-all">
                                            <Camera size={16} className="text-slate-400" />
                                            <span className="text-xs font-bold text-slate-600">Select Image</span>
                                        </div>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    setCategoryImage(file);
                                                    setImagePreview(URL.createObjectURL(file));
                                                }
                                            }}
                                        />
                                    </label>
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 py-4 text-slate-400 font-bold hover:bg-slate-50 rounded-2xl">Abort</button>
                                <button disabled={actionLoading} type="submit" className="flex-1 py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center">
                                    {actionLoading ? <Loader2 className="animate-spin" /> : 'Confirm Category'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isEditModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[32px] w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-500">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold text-slate-900">Update Category</h2>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-900"><X /></button>
                        </div>
                        <form onSubmit={handleEditCategory} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Modified Name</label>
                                <input
                                    type="text"
                                    required
                                    value={categoryName}
                                    onChange={(e) => setCategoryName(e.target.value)}
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-blue-500 outline-none transition-all font-bold"
                                    autoFocus
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Update Icon/Image</label>
                                <div className="flex items-center gap-4">
                                    <div className="w-20 h-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden">
                                        {imagePreview ? (
                                            <img src={imagePreview} className="w-full h-full object-cover" />
                                        ) : selectedCategory?.image ? (
                                            <img src={selectedCategory.image.image_url} className="w-full h-full object-cover" />
                                        ) : (
                                            <ImageIcon className="text-slate-300" size={24} />
                                        )}
                                    </div>
                                    <label className="flex-1">
                                        <div className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-all">
                                            <Camera size={16} className="text-slate-400" />
                                            <span className="text-xs font-bold text-slate-600">Change Image</span>
                                        </div>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    setCategoryImage(file);
                                                    setImagePreview(URL.createObjectURL(file));
                                                }
                                            }}
                                        />
                                    </label>
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 py-4 text-slate-400 font-bold hover:bg-slate-50 rounded-2xl">Cancel</button>
                                <button disabled={actionLoading} type="submit" className="flex-1 py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center">
                                    {actionLoading ? <Loader2 className="animate-spin" /> : 'Commit Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-red-900/10 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[40px] w-full max-w-sm p-10 shadow-2xl text-center border-b-8 border-red-600 animate-in zoom-in-95 duration-500">
                        <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full mx-auto flex items-center justify-center mb-6">
                            <Trash2 size={36} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">Security Purge?</h2>
                        <p className="text-slate-500 text-sm font-light leading-relaxed mb-8">
                            Permanently erase the <span className="font-bold text-slate-900">"{selectedCategory?.name}"</span> category from clinical records?
                        </p>
                        <div className="flex gap-4">
                            <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-4 text-slate-400 font-bold hover:bg-slate-50 rounded-2xl">Abort</button>
                            <button onClick={handleDeleteCategory} disabled={actionLoading} className="flex-1 py-4 bg-red-600 text-white font-bold rounded-2xl shadow-xl shadow-red-600/20 hover:bg-red-700 active:scale-95 transition-all flex items-center justify-center">
                                {actionLoading ? <Loader2 className="animate-spin" /> : 'PURGE'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
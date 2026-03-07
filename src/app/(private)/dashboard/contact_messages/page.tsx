'use client';

import React, { useEffect, useState } from 'react';
import {
    getMessages,
    deleteMessage
} from '@/lib/api/api_private';
import {
    Mail,
    Trash2,
    ChevronDown,
    ChevronUp,
    Calendar,
    User,
    MessageSquare,
    Loader2,
    CheckCircle2,
    X,
    ShieldAlert,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

interface ContactMessage {
    id: number;
    name: string;
    email: string;
    subject: string;
    message: string;
    created_at: string;
}

interface PaginationMeta {
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
}

export default function ContactMessagesPage() {
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [pagination, setPagination] = useState<PaginationMeta | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        fetchData();
    }, [currentPage]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await getMessages({ page: currentPage });
            // Laravel pagination structure: data.data.data
            const pData = response.data;
            setMessages(pData.data);
            setPagination({
                current_page: pData.current_page,
                last_page: pData.last_page,
                total: pData.total,
                per_page: pData.per_page
            });
        } catch (err) {
            console.error(err);
            showToast('Transmission log retrieval failure.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedMessage) return;
        setActionLoading(true);
        try {
            await deleteMessage(selectedMessage.id);
            showToast('Protocol message successfully purged.', 'success');
            setIsDeleteModalOpen(false);
            fetchData();
        } catch (err) {
            console.error(err);
            showToast('Security purge protocol failed.', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return {
            date: date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }),
            time: date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
        };
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-24">
            {/* Header */}
            <div className="border-b border-slate-200 pb-8">
                <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-[0.2em] mb-2">
                    <MessageSquare className="w-3.5 h-3.5" />
                    Messages from Customers
                </div>
                <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Clinical Inquiries</h1>
                <p className="text-slate-500 font-light mt-1">Review and manage all customer messages.</p>
            </div>

            {/* Messages List */}
            <div className="space-y-4">
                {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="h-24 bg-slate-50 rounded-[32px] animate-pulse border border-slate-100" />
                    ))
                ) : messages.length === 0 ? (
                    <div className="py-24 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[32px] flex flex-col items-center justify-center text-slate-300">
                        <Mail className="w-12 h-12 mb-4 opacity-30" />
                        <p className="font-bold text-sm uppercase tracking-widest">No Message Logs Found</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isExpanded = expandedId === msg.id;
                        const { date, time } = formatDate(msg.created_at);

                        return (
                            <div
                                key={msg.id}
                                className={`group relative bg-white border rounded-[32px] overflow-hidden transition-all duration-300 ${isExpanded ? 'border-blue-400 shadow-xl shadow-blue-500/5' : 'border-slate-100 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/50'}`}
                            >
                                {/* Summary Header */}
                                <div
                                    onClick={() => setExpandedId(isExpanded ? null : msg.id)}
                                    className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 cursor-pointer"
                                >
                                    <div className="flex items-center gap-6">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${isExpanded ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600'}`}>
                                            <User size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900 tracking-tight">{msg.subject}</h3>
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-slate-500 font-light">
                                                <span className="flex items-center gap-1.5"><Mail size={14} className="text-blue-400" /> {msg.email}</span>
                                                <span className="flex items-center gap-1.5"><Calendar size={14} className="text-blue-400" /> {date} <span className="text-slate-300 font-bold">•</span> {time}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 self-end md:self-auto">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedMessage(msg);
                                                setIsDeleteModalOpen(true);
                                            }}
                                            className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                        <div className={`p-3 rounded-xl transition-all ${isExpanded ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-blue-100'}`}>
                                            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Content */}
                                {isExpanded && (
                                    <div className="px-8 pb-8 animate-in slide-in-from-top-4 duration-300">
                                        <div className="bg-slate-50 rounded-2xl p-8 border border-white shadow-inner">
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                                                <MessageSquare size={12} className="text-blue-400" />
                                                Detailed Message
                                            </div>
                                            <p className="text-slate-700 leading-relaxed font-light whitespace-pre-wrap">
                                                {msg.message}
                                            </p>
                                            <div className="mt-8 pt-6 border-t border-slate-200/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                    Sender: <span className="text-slate-900 ml-1">{msg.name}</span>
                                                </div>
                                                <a
                                                    href={`mailto:${msg.email}?subject=Re: ${msg.subject}`}
                                                    className="px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-blue-600 font-bold text-sm hover:border-blue-500 hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
                                                >
                                                    <Mail size={16} />
                                                    Respond via Email
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {/* Pagination */}
            {!loading && pagination && pagination.last_page > 1 && (() => {
                const total = pagination.last_page;
                const windowSize = 5;
                let start = Math.max(1, currentPage - Math.floor(windowSize / 2));
                let end = start + windowSize - 1;
                if (end > total) { end = total; start = Math.max(1, end - windowSize + 1); }
                const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);
                return (
                    <div className="flex items-center justify-center gap-1.5 mt-12 bg-white border border-slate-100 p-4 rounded-3xl shadow-sm">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => p - 1)}
                            className="w-12 h-12 rounded-xl flex items-center justify-center bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-30 disabled:hover:bg-slate-50 disabled:hover:text-slate-400 transition-all shadow-sm"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        {start > 1 && (
                            <>
                                <button
                                    key={1}
                                    onClick={() => setCurrentPage(1)}
                                    className="min-w-[44px] h-11 rounded-xl text-sm font-bold transition-all text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                                >
                                    1
                                </button>
                                {start > 2 && <span className="w-6 text-center text-slate-400 font-bold text-sm">…</span>}
                            </>
                        )}
                        {pages.map(p => (
                            <button
                                key={p}
                                onClick={() => setCurrentPage(p)}
                                className={`min-w-[44px] h-11 rounded-xl text-sm font-bold transition-all ${currentPage === p ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
                            >
                                {p}
                            </button>
                        ))}
                        {end < total && (
                            <>
                                {end < total - 1 && <span className="w-6 text-center text-slate-400 font-bold text-sm">…</span>}
                                <button
                                    key={total}
                                    onClick={() => setCurrentPage(total)}
                                    className="min-w-[44px] h-11 rounded-xl text-sm font-bold transition-all text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                                >
                                    {total}
                                </button>
                            </>
                        )}
                        <button
                            disabled={currentPage === pagination.last_page}
                            onClick={() => setCurrentPage(p => p + 1)}
                            className="w-12 h-12 rounded-xl flex items-center justify-center bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-30 disabled:hover:bg-slate-50 disabled:hover:text-slate-400 transition-all shadow-sm"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                );
            })()}

            {/* Delete Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[40px] w-full max-w-md p-10 shadow-2xl text-center border-b-8 border-red-600 animate-in zoom-in-95 duration-500">
                        <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full mx-auto flex items-center justify-center mb-6">
                            <ShieldAlert size={36} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">Delete Message?</h2>
                        <p className="text-slate-500 text-sm font-light leading-relaxed mb-8">
                            Permanently erase the message from <span className="font-bold text-slate-900">"{selectedMessage?.name}"</span>? This action cannot be revoked.
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="flex-1 py-4 text-slate-400 font-bold hover:bg-slate-100 rounded-2xl transition-all"
                            >
                                Abort
                            </button>
                            <button
                                disabled={actionLoading}
                                onClick={handleDelete}
                                className="flex-1 py-4 bg-red-600 text-white font-bold rounded-2xl shadow-xl shadow-red-600/20 hover:bg-red-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                {actionLoading ? <Loader2 className="animate-spin" size={20} /> : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Notification */}
            {toast && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] animate-in slide-in-from-bottom-10 duration-500">
                    <div className={`px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-md ${toast.type === 'success' ? 'bg-green-600/90 text-white' : 'bg-red-600/90 text-white'}`}>
                        {toast.type === 'success' ? <CheckCircle2 size={20} /> : <ShieldAlert size={20} />}
                        <span className="font-bold text-sm">{toast.message}</span>
                        <X
                            size={16}
                            className="ml-4 cursor-pointer opacity-50 hover:opacity-100"
                            onClick={() => setToast(null)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
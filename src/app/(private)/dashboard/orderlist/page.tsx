'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
    getAdminOrderList,
    confirmOrderPayment,
    createOrder,
    updateOrder,
    deleteOrder,
    getAllProductsAdmin
} from '@/lib/api/api_private';
import { getDeliveryCharge } from '@/lib/api/api_public';
import {
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Package,
    User,
    MapPin,
    Clock,
    Search,
    AlertCircle,
    Loader2,
    ShieldCheck,
    Truck,
    FileText,
    Activity,
    Box,
    Plus,
    X,
    Trash2,
    Save,
    Edit2
} from 'lucide-react';

// --- Types ---

interface OrderItem {
    id: number;
    name: string;
    qty: number;
    price: number;
    total: number;
}

interface StripeIdRecord {
    stripe_checkout_session_id: string;
    stripe_payment_intent_id: string;
}

interface Order {
    id: number;
    order_id: string;
    order_status: 'Pending' | 'Confirmed' | 'Delivered' | 'Cancelled';
    payment_method: 'COD' | 'Online';
    payment_status: 'Unpaid' | 'Paid' | 'Failed';
    total_price: string;
    delivery_charge: string;
    ordered_products: OrderItem[];
    customer_details: {
        name: string;
        email: string;
        phone: string;
    };
    address: {
        details: string;
        selection: {
            division: string;
            district: string;
        };
    };
    stripe_id?: string | null;
    stripe_id_record?: StripeIdRecord | null;
    created_at: string;
}

interface Product {
    id: number;
    name: string;
    selling_price: string;
}

interface Division {
    id: string;
    name: string;
}

interface District {
    id: string;
    name: string;
}

interface PaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

// --- UI Components ---

const Badge = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${className}`}>
        {children}
    </span>
);

const Input = ({ label, ...props }: any) => (
    <div className="space-y-1.5 flex-1">
        {label && <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{label}</label>}
        <input
            {...props}
            className={`w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:bg-white focus:border-blue-500 transition-all ${props.className || ''}`}
        />
    </div>
);

const Select = ({ label, children, ...props }: any) => (
    <div className="space-y-1.5 flex-1">
        {label && <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{label}</label>}
        <div className="relative">
            <select
                {...props}
                className={`w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none appearance-none focus:ring-2 focus:ring-blue-500 transition-all ${props.className || ''}`}
            >
                {children}
            </select>
            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
    </div>
);

// --- Configuration ---

const statusConfig: Record<Order['order_status'], { color: string, icon: any }> = {
    Pending: { color: 'bg-amber-50 text-amber-600 border-amber-100', icon: Clock },
    Confirmed: { color: 'bg-blue-50 text-blue-600 border-blue-100', icon: Activity },
    Delivered: { color: 'bg-emerald-50 text-emerald-600 border-emerald-100', icon: ShieldCheck },
    Cancelled: { color: 'bg-red-50 text-red-600 border-red-100', icon: AlertCircle }
};

const paymentStatusConfig: Record<Order['payment_status'], { color: string }> = {
    Unpaid: { color: 'bg-rose-50 text-rose-600 border-rose-100' },
    Paid: { color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
    Failed: { color: 'bg-red-50 text-red-600 border-red-100' }
};

// --- Main Page ---

export default function OrderListPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState<PaginationMeta | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

    // Modal States
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [deleteConfirmOrder, setDeleteConfirmOrder] = useState<Order | null>(null);
    const [actionLoading, setActionLoading] = useState(false);

    // Form Data for Create/Edit
    const [formData, setFormData] = useState<Partial<Order> & { stripe_checkout_session_id?: string; stripe_payment_intent_id?: string }>({
        order_status: 'Pending',
        payment_method: 'COD',
        payment_status: 'Unpaid',
        ordered_products: [],
        customer_details: { name: '', email: '', phone: '' },
        address: { details: '', selection: { division: '', district: '' } },
        delivery_charge: '0',
        stripe_checkout_session_id: '',
        stripe_payment_intent_id: ''
    });

    // Edit Sate
    const [editingOrderId, setEditingOrderId] = useState<string | null>(null);

    // Helpers for address fetching
    const [divisions, setDivisions] = useState<Division[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);
    const [loadingDistricts, setLoadingDistricts] = useState(false);

    useEffect(() => {
        fetchOrders(currentPage);
        fetchCoreData();
    }, [currentPage]);

    const fetchOrders = async (page: number) => {
        setLoading(true);
        try {
            const response = await getAdminOrderList({ page, search: searchQuery });
            if (response.success) {
                setOrders(response.data.data);
                setPagination({
                    current_page: response.data.current_page,
                    last_page: response.data.last_page,
                    per_page: response.data.per_page,
                    total: response.data.total
                });
            }
        } catch (err) {
            setError('Registry synchronization failure.');
        } finally {
            setLoading(false);
        }
    };

    const fetchCoreData = async () => {
        try {
            const [prods, divs] = await Promise.all([
                getAllProductsAdmin(),
                fetch('https://bdapi.vercel.app/api/v.1/division').then(r => r.json())
            ]);
            setAllProducts(prods.data || prods);
            setDivisions(divs.data || []);
        } catch (err) {
            console.error('Failed to load core data', err);
        }
    };

    const fetchDistricts = async (divisionId: string) => {
        setLoadingDistricts(true);
        try {
            const res = await fetch(`https://bdapi.vercel.app/api/v.1/district/${divisionId}`).then(r => r.json());
            setDistricts(res.data || []);
        } catch (err) {
            console.error('Failed to load districts', err);
        } finally {
            setLoadingDistricts(false);
        }
    };

    // Calculate Totals
    const orderTotals = useMemo(() => {
        const subtotal = formData.ordered_products?.reduce((acc, curr) => acc + curr.total, 0) || 0;
        const total = subtotal + parseFloat(formData.delivery_charge || '0');
        return { subtotal, total };
    }, [formData.ordered_products, formData.delivery_charge]);

    // Handle Delivery Charge Sync
    useEffect(() => {
        const division = formData.address?.selection.division;
        const district = formData.address?.selection.district;
        if (division && district) {
            getDeliveryCharge(division, district).then(res => {
                if (res.success) {
                    setFormData(prev => ({ ...prev, delivery_charge: res.delivery_charge.toString() }));
                }
            });
        }
    }, [formData.address?.selection.division, formData.address?.selection.district]);

    const handleAddItem = (productId: string) => {
        const product = allProducts.find(p => p.id === parseInt(productId));
        if (!product) return;

        const existing = formData.ordered_products?.find(p => p.id === product.id);
        if (existing) {
            updateItemQty(product.id, existing.qty + 1);
            return;
        }

        const newItem: OrderItem = {
            id: product.id,
            name: product.name,
            qty: 1,
            price: parseFloat(product.selling_price),
            total: parseFloat(product.selling_price)
        };
        setFormData(prev => ({ ...prev, ordered_products: [...(prev.ordered_products || []), newItem] }));
    };

    const updateItemQty = (id: number, qty: number) => {
        if (qty < 1) return;
        setFormData(prev => ({
            ...prev,
            ordered_products: prev.ordered_products?.map(p =>
                p.id === id ? { ...p, qty, total: p.price * qty } : p
            )
        }));
    };

    const removeItem = (id: number) => {
        setFormData(prev => ({
            ...prev,
            ordered_products: prev.ordered_products?.filter(p => p.id !== id)
        }));
    };

    const handleCreateOrder = async () => {
        setActionLoading(true);
        try {
            const payload = {
                ...formData,
                total_price: orderTotals.total,
                delivery_charge: parseFloat(formData.delivery_charge || '0'),
            };
            const response = await createOrder(payload);
            if (response.success) {
                setIsCreateModalOpen(false);
                fetchOrders(1);
                // Reset form
                setFormData({
                    order_status: 'Pending',
                    payment_method: 'COD',
                    payment_status: 'Unpaid',
                    ordered_products: [],
                    customer_details: { name: '', email: '', phone: '' },
                    address: { details: '', selection: { division: '', district: '' } },
                    delivery_charge: '0',
                    stripe_checkout_session_id: '',
                    stripe_payment_intent_id: ''
                });
            }
        } catch (err) {
            alert('Order creation failed. Check parameters.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleUpdateOrder = async (orderId: string) => {
        setActionLoading(true);
        try {
            const payload = {
                ...formData,
                total_price: orderTotals.total,
                delivery_charge: parseFloat(formData.delivery_charge || '0')
            };
            const response = await updateOrder(orderId, payload);
            if (response.success) {
                setOrders(orders.map(o => o.order_id === orderId ? response.data : o));
                setEditingOrderId(null);
                setExpandedOrderId(null);
            }
        } catch (err) {
            alert('Order update failed.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteOrder = async () => {
        if (!deleteConfirmOrder) return;
        setActionLoading(true);
        try {
            await deleteOrder(deleteConfirmOrder.order_id);
            setOrders(orders.filter(o => o.order_id !== deleteConfirmOrder.order_id));
            setDeleteConfirmOrder(null);
        } catch (err) {
            alert('Failed to delete order.');
        } finally {
            setActionLoading(false);
        }
    };

    const openEdit = (e: React.MouseEvent, order: Order) => {
        e.stopPropagation();
        setEditingOrderId(order.order_id);
        setExpandedOrderId(order.order_id);
        setFormData({
            ...order,
            ordered_products: [...order.ordered_products],
            stripe_checkout_session_id: order.stripe_id_record?.stripe_checkout_session_id || '',
            stripe_payment_intent_id: order.stripe_id_record?.stripe_payment_intent_id || ''
        });
        const division = divisions.find(d => d.name === order.address.selection.division);
        if (division) fetchDistricts(division.id);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-8">
                <div>
                    <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-[0.2em] mb-2">
                        <FileText className="w-3.5 h-3.5" />
                        Management Dashboard
                    </div>
                    <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Order Lifecycle</h1>
                    <p className="text-slate-500 font-light mt-1">Institutional procurement, fulfillment tracking, and registry management.</p>
                </div>

                <div className="flex items-center gap-4 flex-1 max-w-md">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Find by ID or Customer..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && fetchOrders(1)}
                            className="w-full h-14 pl-12 pr-4 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="bg-slate-100 px-5 py-2.5 rounded-xl border border-slate-200 hidden sm:block">
                        <span className="text-slate-400 font-bold text-[10px] uppercase tracking-widest block leading-none mb-1">Active Logs</span>
                        <span className="text-slate-900 font-bold text-lg leading-none">{pagination?.total || 0}</span>
                    </div>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="h-14 px-8 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center gap-2 group active:scale-95"
                    >
                        <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                        Initiate Order
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="space-y-4">
                {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="h-24 bg-slate-50 rounded-2xl animate-pulse border border-slate-100" />
                    ))
                ) : orders.map((order) => {
                    const isEditing = editingOrderId === order.order_id;
                    const isExpanded = expandedOrderId === order.order_id;
                    const status = statusConfig[order.order_status];
                    const StatusIcon = status.icon;

                    const dateObj = new Date(order.created_at);
                    const formattedDate = dateObj.toLocaleDateString();
                    const formattedTime = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                    return (
                        <div key={order.order_id} className={`group bg-white rounded-2xl border transition-all duration-300 overflow-hidden will-change-transform [contain:layout] ${isExpanded ? 'border-blue-300 shadow-xl' : 'border-slate-100'}`}>
                            {/* Card Header (Click to Expand/Collapse) */}
                            <div
                                onClick={() => setExpandedOrderId(isExpanded ? null : order.order_id)}
                                className={`p-4 sm:p-6 cursor-pointer hover:bg-slate-50 transition-colors flex flex-wrap items-center justify-between gap-6 ${isExpanded ? 'bg-slate-50/50 border-b border-slate-100' : ''}`}
                            >
                                <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${status.color}`}>
                                            <StatusIcon size={20} />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-900 tracking-tight">#{order.order_id}</h3>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{formattedDate} at {formattedTime}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Badge className={status.color}>{order.order_status}</Badge>
                                        <Badge className={paymentStatusConfig[order.payment_status].color}>{order.payment_status}</Badge>
                                        <Badge className="bg-slate-50 text-slate-600 border-slate-200">{order.payment_method}</Badge>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 sm:gap-10">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Total</p>
                                        <p className="text-base font-black text-blue-600 tracking-tighter shadow-sm-blue">${parseFloat(order.total_price).toLocaleString()}</p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {isExpanded && isEditing ? (
                                            <>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setEditingOrderId(null); }}
                                                    className="p-2.5 bg-slate-100 text-slate-400 rounded-lg hover:text-slate-900"
                                                >
                                                    <X size={16} />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleUpdateOrder(order.order_id); }}
                                                    disabled={actionLoading}
                                                    className="p-2.5 bg-emerald-600 text-white rounded-lg shadow-lg shadow-emerald-600/20 hover:bg-emerald-700"
                                                >
                                                    {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={(e) => openEdit(e, order)}
                                                    className="p-2.5 bg-white text-slate-400 border border-slate-200 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-all shadow-sm"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setDeleteConfirmOrder(order); }}
                                                    className="p-2.5 bg-white text-slate-400 border border-slate-200 rounded-lg hover:bg-red-50 hover:text-red-600 transition-all shadow-sm"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                                <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180 text-blue-600' : 'text-slate-300'}`}>
                                                    <ChevronDown size={20} />
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Dropdown Content */}
                            <div className={`grid transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                                <div className="overflow-hidden">
                                    <div className="p-6 sm:p-8 bg-white">
                                        <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-10">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                {/* Supply Manifest */}
                                                <div className="space-y-4">
                                                    <h4 className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                                                        <Box size={14} className="text-blue-600" />
                                                        Supply Manifest
                                                    </h4>
                                                    <div className="bg-slate-50/50 border border-slate-100 rounded-2xl overflow-hidden divide-y divide-slate-100">
                                                        {(isEditing ? formData.ordered_products : order.ordered_products)?.map((item: any, idx: number) => (
                                                            <div key={idx} className="p-4 flex justify-between items-center group/item">
                                                                <div className="min-w-0 flex-1">
                                                                    <p className="font-bold text-slate-800 text-xs truncate uppercase">{item.name}</p>
                                                                    <div className="flex items-center gap-2 mt-1">
                                                                        <span className="text-[10px] text-slate-400 font-bold">QTY: {item.qty}</span>
                                                                        <span className="text-[10px] text-slate-400">•</span>
                                                                        <span className="text-[10px] text-blue-500 font-bold">${item.price}</span>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-4">
                                                                    {isEditing && (
                                                                        <div className="flex items-center gap-1">
                                                                            <button onClick={() => updateItemQty(item.id, item.qty - 1)} className="p-1 hover:bg-slate-200 rounded text-slate-400">
                                                                                <ChevronDown size={12} className="rotate-90" />
                                                                            </button>
                                                                            <button onClick={() => removeItem(item.id)} className="p-1 hover:text-red-500 text-slate-300">
                                                                                <Trash2 size={12} />
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                    <p className="font-bold text-slate-900 text-sm">${item.total.toLocaleString()}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                        {isEditing && (
                                                            <div className="p-3 bg-white">
                                                                <Select onChange={(e: any) => handleAddItem(e.target.value)} value="">
                                                                    <option value="">+ ADD COMPONENT</option>
                                                                    {allProducts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                                                </Select>
                                                            </div>
                                                        )}
                                                        <div className="p-4 bg-blue-50/30 flex justify-between items-center">
                                                            <span className="text-[9px] font-bold text-blue-600 uppercase tracking-widest">Subtotal</span>
                                                            <span className="font-bold text-blue-600">${(isEditing ? orderTotals.subtotal : parseFloat(order.total_price) - parseFloat(order.delivery_charge)).toLocaleString()}</span>
                                                        </div>
                                                    </div>

                                                    {/* Online Payment Details (Stripe) */}
                                                    {order.payment_method === 'Online' && (
                                                        <div className="mt-6 p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-3">
                                                            <h4 className="flex items-center gap-2 text-[10px] font-bold text-indigo-400 uppercase tracking-widest px-1">
                                                                <Activity size={12} className="text-indigo-600" />
                                                                Stripe Registry IDs
                                                            </h4>
                                                            {isEditing ? (
                                                                <div className="space-y-3 pt-2">
                                                                    <Input 
                                                                        label="Checkout Session ID" 
                                                                        placeholder="cs_test_..." 
                                                                        value={formData.stripe_checkout_session_id} 
                                                                        onChange={(e: any) => setFormData(prev => ({ ...prev, stripe_checkout_session_id: e.target.value }))} 
                                                                    />
                                                                    <Input 
                                                                        label="Payment Intent ID" 
                                                                        placeholder="pi_..." 
                                                                        value={formData.stripe_payment_intent_id} 
                                                                        onChange={(e: any) => setFormData(prev => ({ ...prev, stripe_payment_intent_id: e.target.value }))} 
                                                                    />
                                                                </div>
                                                            ) : (
                                                                order.stripe_id_record && (
                                                                    <div className="space-y-2">
                                                                        <div className="flex justify-between items-center">
                                                                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Session</span>
                                                                            <code className="text-[10px] text-indigo-600 truncate max-w-[180px] bg-white px-2 py-0.5 rounded border border-indigo-50">{order.stripe_id_record.stripe_checkout_session_id}</code>
                                                                        </div>
                                                                        <div className="flex justify-between items-center">
                                                                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">PaymentIntent</span>
                                                                            <code className="text-[10px] text-indigo-600 truncate max-w-[180px] bg-white px-2 py-0.5 rounded border border-indigo-50">{order.stripe_id_record.stripe_payment_intent_id}</code>
                                                                        </div>
                                                                    </div>
                                                                )
                                                            )}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Recipient & Logistics */}
                                                <div className="space-y-6">
                                                    <div className="space-y-4">
                                                        <h4 className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                                                            <User size={14} className="text-blue-600" />
                                                            Personnel Registry
                                                        </h4>
                                                        {isEditing ? (
                                                            <div className="space-y-3">
                                                                <Input placeholder="Recipient Name" value={formData.customer_details?.name} onChange={(e: any) => setFormData(prev => ({ ...prev, customer_details: { ...prev.customer_details!, name: e.target.value } }))} />
                                                                <Input placeholder="Email Protocol" value={formData.customer_details?.email} onChange={(e: any) => setFormData(prev => ({ ...prev, customer_details: { ...prev.customer_details!, email: e.target.value } }))} />
                                                                <Input placeholder="Contact String" value={formData.customer_details?.phone} onChange={(e: any) => setFormData(prev => ({ ...prev, customer_details: { ...prev.customer_details!, phone: e.target.value } }))} />
                                                            </div>
                                                        ) : (
                                                            <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl space-y-2">
                                                                <p className="text-sm font-bold text-slate-900">{order.customer_details.name}</p>
                                                                <p className="text-[11px] text-slate-500 italic opacity-80">{order.customer_details.email}</p>
                                                                <p className="text-[11px] font-mono text-slate-600">{order.customer_details.phone}</p>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="space-y-4">
                                                        <h4 className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                                                            <MapPin size={14} className="text-blue-600" />
                                                            Logistics Coordinates
                                                        </h4>
                                                        {isEditing ? (
                                                            <div className="space-y-3">
                                                                <div className="flex gap-3">
                                                                    <Select
                                                                        value={divisions.find(d => d.name === formData.address?.selection.division)?.id || ''}
                                                                        onChange={(e: any) => {
                                                                            const div = divisions.find(d => d.id === e.target.value);
                                                                            setFormData(prev => ({ ...prev, address: { ...prev.address!, selection: { ...prev.address!.selection, division: div?.name || '', district: '' } } }));
                                                                            if (div) fetchDistricts(div.id);
                                                                        }}
                                                                    >
                                                                        <option value="">Division</option>
                                                                        {divisions.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                                                    </Select>
                                                                    <Select
                                                                        disabled={loadingDistricts}
                                                                        value={formData.address?.selection.district}
                                                                        onChange={(e: any) => setFormData(prev => ({ ...prev, address: { ...prev.address!, selection: { ...prev.address!.selection, district: e.target.value } } }))}
                                                                    >
                                                                        <option value="">{loadingDistricts ? 'Wait...' : 'District'}</option>
                                                                        {districts.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                                                                    </Select>
                                                                </div>
                                                                <textarea
                                                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:bg-white focus:border-blue-500 ring-blue-500 transition-all resize-none h-20"
                                                                    value={formData.address?.details}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, address: { ...prev.address!, details: e.target.value } }))}
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl relative">
                                                                <p className="text-xs text-slate-600 leading-relaxed italic">"{order.address.details}"</p>
                                                                <div className="mt-4 flex items-center gap-2">
                                                                    <span className="text-[10px] font-black text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded border border-blue-100">{order.address.selection.district}</span>
                                                                    <span className="text-[10px] font-black text-slate-400 uppercase">{order.address.selection.division}</span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right: Settlement Summary */}
                                            <div className="p-8 bg-slate-900 text-slate-300 rounded-[32px] relative overflow-hidden shadow-2xl h-fit">
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600 rounded-full blur-[80px] opacity-20 -mr-16 -mt-16" />

                                                <div className="space-y-6 relative z-10">
                                                    <h4 className="text-[9px] font-bold text-blue-400 uppercase tracking-[0.2em] mb-4 text-center">Settlement Overview</h4>

                                                    <div className="space-y-3 pb-6 border-b border-slate-800">
                                                        <div className="flex justify-between items-center text-slate-400">
                                                            <span className="text-[10px] font-bold uppercase tracking-widest">Subtotal</span>
                                                            <span className="text-sm font-bold text-white">${(isEditing ? orderTotals.subtotal : parseFloat(order.total_price) - parseFloat(order.delivery_charge)).toLocaleString()}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                                <Truck size={12} className="text-blue-500" />
                                                                Logistics
                                                            </span>
                                                            {isEditing ? (
                                                                <input
                                                                    type="number"
                                                                    className="w-20 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white text-right outline-none focus:border-blue-500 transition-all font-bold"
                                                                    value={formData.delivery_charge}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, delivery_charge: e.target.value }))}
                                                                />
                                                            ) : (
                                                                <span className="text-sm font-bold text-white">${parseFloat(order.delivery_charge).toLocaleString()}</span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="pt-2">
                                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Final Payment</p>
                                                        <h5 className="text-4xl font-black text-white tracking-tighter">
                                                            ${(isEditing ? orderTotals.total : parseFloat(order.total_price)).toLocaleString()}
                                                        </h5>
                                                        <div className="mt-8 space-y-4">
                                                            <Select
                                                                className={`bg-slate-800 border-slate-700 text-white text-[11px] h-12 ${isEditing ? 'border-blue-500/50 cursor-pointer shadow-lg shadow-blue-500/5' : ''}`}
                                                                value={isEditing ? formData.order_status : order.order_status}
                                                                disabled={!isEditing}
                                                                onChange={(e: any) => setFormData(prev => ({ ...prev, order_status: e.target.value as any }))}
                                                            >
                                                                <option value="Pending">PENDING APPROVAL</option>
                                                                <option value="Confirmed">CONFIRMED</option>
                                                                <option value="Cancelled">CANCELLED</option>
                                                            </Select>

                                                            <Select
                                                                className={`bg-slate-800 border-slate-700 text-white text-[11px] h-12 ${isEditing ? 'border-blue-500/50 cursor-pointer shadow-lg shadow-blue-500/5' : ''} ${isEditing && formData.payment_status === 'Paid' ? 'text-emerald-400 font-bold' : ''}`}
                                                                value={isEditing ? formData.payment_status : order.payment_status}
                                                                disabled={!isEditing}
                                                                onChange={(e: any) => setFormData(prev => ({ ...prev, payment_status: e.target.value as any }))}
                                                            >
                                                                <option value="Unpaid">UNPAID</option>
                                                                <option value="Paid">PAID</option>
                                                                <option value="Failed">FAILED</option>
                                                            </Select>
                                                        </div>
                                                    </div>

                                                    {!isEditing && order.order_status === 'Pending' && (
                                                        <button
                                                            onClick={async (e) => {
                                                                e.stopPropagation();
                                                                const res = await confirmOrderPayment(order.order_id);
                                                                if (res.success) fetchOrders(currentPage);
                                                            }}
                                                            className="w-full mt-4 py-4 bg-blue-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 active:scale-95"
                                                        >
                                                            <ShieldCheck size={16} />
                                                            Finalize Registry
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {!loading && orders.length === 0 && (
                    <div className="py-24 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[32px] flex flex-col items-center justify-center text-slate-300">
                        <Truck size={32} />
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] mt-3">Registry Vacuum Detected</p>
                    </div>
                )}
            </div>

            {/* Pagination Controls */}
            {pagination && pagination.last_page > 1 && (() => {
                const total = pagination.last_page;
                const window = 5;
                let start = Math.max(1, currentPage - Math.floor(window / 2));
                let end = start + window - 1;
                if (end > total) { end = total; start = Math.max(1, end - window + 1); }
                const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);
                return (
                    <div className="flex items-center justify-center gap-1.5 pt-10">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1 || loading}
                            className="w-12 h-12 flex items-center justify-center bg-white border border-slate-200 rounded-xl text-slate-400 hover:bg-slate-50 disabled:opacity-30 transition-all"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        {start > 1 && (
                            <>
                                <button
                                    key={1}
                                    onClick={() => setCurrentPage(1)}
                                    className="w-12 h-12 rounded-xl text-xs font-bold transition-all bg-white border text-slate-500 border-slate-200 hover:bg-slate-50"
                                >
                                    1
                                </button>
                                {start > 2 && <span className="w-8 text-center text-slate-400 font-bold text-sm">…</span>}
                            </>
                        )}
                        {pages.map(num => (
                            <button
                                key={num}
                                onClick={() => setCurrentPage(num)}
                                className={`w-12 h-12 rounded-xl text-xs font-bold transition-all ${currentPage === num ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-white border text-slate-500 border-slate-200 hover:bg-slate-50'}`}
                            >
                                {num}
                            </button>
                        ))}
                        {end < total && (
                            <>
                                {end < total - 1 && <span className="w-8 text-center text-slate-400 font-bold text-sm">…</span>}
                                <button
                                    key={total}
                                    onClick={() => setCurrentPage(total)}
                                    className="w-12 h-12 rounded-xl text-xs font-bold transition-all bg-white border text-slate-500 border-slate-200 hover:bg-slate-50"
                                >
                                    {total}
                                </button>
                            </>
                        )}
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(pagination.last_page, prev + 1))}
                            disabled={currentPage === pagination.last_page || loading}
                            className="w-12 h-12 flex items-center justify-center bg-white border border-slate-200 rounded-xl text-slate-400 hover:bg-slate-50 disabled:opacity-30 transition-all"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                );
            })()}

            {/* Modals */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[40px] w-full max-w-4xl p-10 max-h-[90vh] overflow-y-auto shadow-3xl animate-in zoom-in-95 duration-500 border border-slate-100">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Manual Requisition</h2>
                                <p className="text-[10px] text-blue-600 font-bold uppercase tracking-[0.2em] mt-1">Initiating clinical procurement protocol</p>
                            </div>
                            <button onClick={() => setIsCreateModalOpen(false)} className="p-3 bg-slate-50 rounded-full text-slate-400 hover:text-slate-900"><X size={24} /></button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12">
                            <div className="space-y-10">
                                <div className="space-y-6">
                                    <h4 className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                                        <Package size={14} className="text-blue-600" />
                                        Component Selection
                                    </h4>
                                    <div className="relative">
                                        <Select label="Select Clinical Component" onChange={(e: any) => handleAddItem(e.target.value)} value="">
                                            <option value="">Search Components...</option>
                                            {allProducts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                        </Select>
                                    </div>
                                    <div className="bg-slate-50 border border-slate-100 rounded-[32px] overflow-hidden">
                                        {formData.ordered_products?.length === 0 ? (
                                            <div className="py-20 flex flex-col items-center justify-center text-slate-300 gap-4">
                                                <Box size={40} strokeWidth={1} />
                                                <p className="text-[10px] font-bold uppercase tracking-widest">Manifest is empty</p>
                                            </div>
                                        ) : (
                                            <div className="divide-y divide-slate-100">
                                                {formData.ordered_products?.map(item => (
                                                    <div key={item.id} className="p-5 flex items-center justify-between bg-white/50 hover:bg-white transition-colors">
                                                        <div className="flex-1">
                                                            <p className="text-sm font-bold text-slate-900 uppercase">{item.name}</p>
                                                            <p className="text-[10px] text-slate-400 font-bold mt-1">UNIT COST: ${item.price}</p>
                                                        </div>
                                                        <div className="flex items-center gap-8">
                                                            <div className="flex items-center gap-3 bg-slate-100 rounded-xl px-2 py-1">
                                                                <button onClick={() => updateItemQty(item.id, item.qty - 1)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-900">-</button>
                                                                <span className="text-sm font-black w-6 text-center">{item.qty}</span>
                                                                <button onClick={() => updateItemQty(item.id, item.qty + 1)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-900">+</button>
                                                            </div>
                                                            <div className="text-right w-24">
                                                                <p className="text-sm font-black text-slate-900">${item.total.toLocaleString()}</p>
                                                            </div>
                                                            <button onClick={() => removeItem(item.id)} className="text-slate-300 hover:text-red-500 transition-colors"><X size={18} /></button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <h4 className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                                        <User size={14} className="text-blue-600" />
                                        Personnel Information
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <Input label="Full Name" placeholder="Dr. John Smith" value={formData.customer_details?.name} onChange={(e: any) => setFormData(prev => ({ ...prev, customer_details: { ...prev.customer_details!, name: e.target.value } }))} />
                                        <Input label="Contact email" placeholder="hospital@region.gov" value={formData.customer_details?.email} onChange={(e: any) => setFormData(prev => ({ ...prev, customer_details: { ...prev.customer_details!, email: e.target.value } }))} />
                                        <Input label="Phone Line" placeholder="01XXXXXXXXX" value={formData.customer_details?.phone} onChange={(e: any) => setFormData(prev => ({ ...prev, customer_details: { ...prev.customer_details!, phone: e.target.value } }))} />
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <h4 className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                                        <MapPin size={14} className="text-blue-600" />
                                        Delivery Coordinates
                                    </h4>
                                    <div className="space-y-5">
                                        <div className="grid grid-cols-2 gap-5">
                                            <Select
                                                label="Division"
                                                onChange={(e: any) => {
                                                    const div = divisions.find(d => d.id === e.target.value);
                                                    setFormData(prev => ({ ...prev, address: { ...prev.address!, selection: { division: div?.name || '', district: '' } } }));
                                                    if (div) fetchDistricts(div.id);
                                                }}
                                            >
                                                <option value="">Select Division</option>
                                                {divisions.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                            </Select>
                                            <Select
                                                label="District"
                                                disabled={!formData.address?.selection.division || loadingDistricts}
                                                value={formData.address?.selection.district}
                                                onChange={(e: any) => setFormData(prev => ({ ...prev, address: { ...prev.address!, selection: { ...prev.address!.selection, district: e.target.value } } }))}
                                            >
                                                <option value="">{loadingDistricts ? 'Synchronizing...' : 'Select District'}</option>
                                                {districts.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                                            </Select>
                                        </div>
                                        <Input
                                            label="Specific Address Details"
                                            placeholder="Floor, Wing, Room Number, Street Address..."
                                            value={formData.address?.details}
                                            onChange={(e: any) => setFormData(prev => ({ ...prev, address: { ...prev.address!, details: e.target.value } }))}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-slate-900 rounded-[32px] p-8 text-white sticky top-0 shadow-2xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600 rounded-full blur-[80px] opacity-20 -mr-12 -mt-12" />
                                    <h3 className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.3em] mb-8">Summary</h3>
                                    <div className="space-y-4 mb-10 text-sm">
                                        <div className="flex justify-between text-slate-400 uppercase tracking-widest text-[10px]">
                                            <span>Subtotal</span>
                                            <span className="text-white font-bold">${orderTotals.subtotal.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-slate-400 uppercase tracking-widest text-[10px]">
                                            <span className="flex items-center gap-2 flex-1"><Truck size={14} /> Logistics</span>
                                            <input
                                                type="number"
                                                className="w-20 bg-slate-800 border-none rounded-lg px-2 py-1 text-xs text-white text-right outline-none"
                                                value={formData.delivery_charge}
                                                onChange={(e) => setFormData(prev => ({ ...prev, delivery_charge: e.target.value }))}
                                            />
                                        </div>
                                        <div className="pt-6 border-t border-slate-800 flex justify-between items-end">
                                            <div>
                                                <span className="text-[9px] font-bold text-slate-500 uppercase block mb-1">AGGREGATE Settlement</span>
                                                <span className="text-3xl font-black tracking-tighter">${orderTotals.total.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-4 mb-8">
                                        <Select
                                            className="bg-slate-800 border-none text-[10px] h-12"
                                            label="Settlement Logic"
                                            value={formData.payment_method}
                                            onChange={(e: any) => setFormData(prev => ({ ...prev, payment_method: e.target.value }))}
                                        >
                                            <option value="COD">CASH ON DELIVERY</option>
                                            <option value="Online">ONLINE TRANSFER (STRIPE)</option>
                                        </Select>

                                        {formData.payment_method === 'Online' && (
                                            <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                                <div className="space-y-1">
                                                    <label className="text-[9px] font-bold text-blue-400 uppercase tracking-widest ml-1">Stripe Session ID</label>
                                                    <input
                                                        type="text"
                                                        placeholder="cs_test_..."
                                                        className="w-full h-11 bg-slate-800 border-none rounded-xl px-4 text-[10px] text-white outline-none focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                                                        value={formData.stripe_checkout_session_id}
                                                        onChange={(e) => setFormData(prev => ({ ...prev, stripe_checkout_session_id: e.target.value }))}
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[9px] font-bold text-blue-400 uppercase tracking-widest ml-1">Payment Intent ID</label>
                                                    <input
                                                        type="text"
                                                        placeholder="pi_..."
                                                        className="w-full h-11 bg-slate-800 border-none rounded-xl px-4 text-[10px] text-white outline-none focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                                                        value={formData.stripe_payment_intent_id}
                                                        onChange={(e) => setFormData(prev => ({ ...prev, stripe_payment_intent_id: e.target.value }))}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                        <Select
                                            className="bg-slate-800 border-none text-[10px] h-12"
                                            label="Initial Status"
                                            value={formData.order_status}
                                            onChange={(e: any) => setFormData(prev => ({ ...prev, order_status: e.target.value }))}
                                        >
                                            <option value="Pending">PENDING APPROVAL</option>
                                            <option value="Confirmed">CONFIRMED LOGISTICS</option>
                                        </Select>
                                    </div>
                                    <button
                                        onClick={handleCreateOrder}
                                        disabled={actionLoading || !formData.customer_details?.name || formData.ordered_products?.length === 0}
                                        className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all disabled:opacity-30 active:scale-[0.98] flex items-center justify-center gap-2"
                                    >
                                        {actionLoading ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
                                        EXCHANGE COMMIT
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {deleteConfirmOrder && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[40px] w-full max-w-sm p-10 text-center shadow-3xl space-y-8 animate-in zoom-in-95 border border-red-50">
                        <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full mx-auto flex items-center justify-center relative">
                            <div className="absolute inset-0 bg-red-500/10 animate-ping rounded-full" />
                            <Trash2 size={36} className="relative" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-slate-900">Delete Registry?</h3>
                            <p className="text-slate-500 text-xs font-light mt-2 italic">Registry reference <span className="font-bold text-slate-900 uppercase">#{deleteConfirmOrder.order_id}</span> will be permanently deleted.</p>
                        </div>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleDeleteOrder}
                                disabled={actionLoading}
                                className="w-full h-14 bg-red-600 text-white rounded-xl font-bold text-sm shadow-xl shadow-red-600/20 hover:bg-red-700 flex items-center justify-center gap-2"
                            >
                                {actionLoading ? <Loader2 size={20} className="animate-spin" /> : 'Confirm Deletion'}
                            </button>
                            <button onClick={() => setDeleteConfirmOrder(null)} className="w-full h-12 text-slate-400 font-bold text-[10px] uppercase tracking-widest hover:text-slate-900 transition-colors">Abort Procedure</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
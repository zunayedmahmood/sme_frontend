'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    ShoppingBag,
    Tag,
    Package,
    ClipboardList,
    Menu,
    X,
    LayoutDashboard,
    LogOut,
    AlertTriangle,
    Loader2,
    Activity,
    Shield,
    MessageSquare,
    MessageCircleQuestionMark
} from 'lucide-react';

interface SidebarItemProps {
    href: string;
    icon: React.ElementType;
    label: string;
    active: boolean;
    onClick?: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ href, icon: Icon, label, active, onClick }) => (
    <Link
        href={href}
        onClick={onClick}
        className={`flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-300 group ${active
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
            : 'text-slate-500 hover:bg-slate-100 hover:text-blue-600'
            }`}
    >
        <Icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${active ? 'text-white' : 'text-slate-400 group-hover:text-blue-600'}`} />
        <span className="font-bold text-sm tracking-tight">{label}</span>
    </Link>
);

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    // Route Protection
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
        }
    }, [router]);

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Product Registry', href: '/dashboard/products', icon: ShoppingBag },
        { name: 'Categories', href: '/dashboard/categories', icon: Tag },
        { name: 'Stock Reservoir', href: '/dashboard/inventories', icon: Package },
        { name: 'Order Registry', href: '/dashboard/orderlist', icon: ClipboardList },
        { name: 'Correspondence Logs', href: '/dashboard/contact_messages', icon: MessageCircleQuestionMark },
    ];

    const handleLogout = () => {
        setIsLoggingOut(true);
        setTimeout(() => {
            localStorage.removeItem('token');
            router.push('/');
        }, 800);
    };

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans">
            {/* Mobile Sidebar Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar Navigation */}
            <aside className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
                <div className="flex flex-col h-full p-6">
                    <div className="flex items-center space-x-3 px-2 mb-10">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                            <img
                                src="/ShopLogo.png"
                                alt="SarengMedEquipment logo"
                                className="h-9 w-auto object-contain"
                            />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-lg font-black text-slate-900 tracking-tight leading-none">SarengMed</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Admin Page</span>
                        </div>
                    </div>

                    <nav className="flex-1 space-y-1.5 focus:outline-none">
                        {navigation.map((item) => (
                            <SidebarItem
                                key={item.name}
                                href={item.href}
                                icon={item.icon}
                                label={item.name}
                                active={pathname === item.href}
                                onClick={() => setIsOpen(false)}
                            />
                        ))}
                    </nav>

                    <div className="pt-6 border-t border-slate-100">
                        <button
                            onClick={() => setShowLogoutModal(true)}
                            className="w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all duration-300 group"
                        >
                            <LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                            <span className="font-bold text-sm">Logout</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Topbar for Mobile */}
                <header className="lg:hidden h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
                    <div className="flex items-center gap-2">
                        <Activity className="text-blue-600 w-6 h-6" />
                        <span className="font-black text-slate-900">SarengMedicalEquipment</span>
                    </div>
                    <button
                        onClick={() => setIsOpen(true)}
                        className="p-2 text-slate-500 hover:bg-slate-50 rounded-lg"
                    >
                        <Menu size={24} />
                    </button>
                </header>

                <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 lg:p-10">
                    {children}
                </div>
            </main>

            {/* Logout Confirmation Modal */}
            {showLogoutModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl w-full max-w-sm p-10 shadow-2xl animate-in zoom-in-95 duration-300 border border-slate-100">
                        <div className="text-center">
                            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                                <AlertTriangle size={36} />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">Security Logout</h2>
                            <p className="text-slate-500 text-sm font-light leading-relaxed mb-8">
                                Confirm the termination of your current administrative session and disconnect from the database.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={handleLogout}
                                disabled={isLoggingOut}
                                className="w-full py-4 bg-red-600 text-white font-bold rounded-2xl shadow-xl shadow-red-600/20 hover:bg-red-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                {isLoggingOut ? <Loader2 className="animate-spin" size={18} /> : <span>Confirm Disconnect</span>}
                            </button>
                            <button
                                onClick={() => setShowLogoutModal(false)}
                                className="w-full py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-all"
                            >
                                Stay Connected
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}


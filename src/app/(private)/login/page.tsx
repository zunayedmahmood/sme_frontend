'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/api/api_public';
import { Lock, Mail, Loader2, ArrowRight, ShieldCheck, Activity } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    useEffect(() => {
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await login({ email, password });

            if (res.token) {
                localStorage.removeItem('token');
                localStorage.setItem('token', res.token);
                router.push('/dashboard');
            } else {
                setError(res.message || 'Invalid administrative credentials');
            }
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'Biometric authentication failure. Check secure connection.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 transition-colors duration-500">
            {/* Background Medical Accents */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[10%] right-[5%] w-[30%] h-[30%] bg-blue-100/40 blur-[100px] rounded-full" />
                <div className="absolute bottom-[5%] left-[10%] w-[25%] h-[25%] bg-blue-50/50 blur-[80px] rounded-full" />
            </div>

            <div className="relative z-10 w-full max-w-md">
                {/* Brand Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 text-white rounded-3xl shadow-xl shadow-blue-600/20 mb-6 transform hover:scale-105 transition-all duration-300">
                        <Activity size={40} />
                    </div>
                    <div className="flex flex-col items-center">
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">SarengMed</h1>
                        <p className="text-blue-600 text-[10px] font-bold uppercase tracking-[0.3em] bg-blue-50 px-3 py-1 rounded-full mt-2 border border-blue-100">Administrator Vault</p>
                    </div>
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-[40px] p-10 shadow-2xl shadow-slate-200/50 border border-slate-100">
                    <form onSubmit={handleLogin} className="space-y-6">
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl animate-in fade-in slide-in-from-top-2">
                                <p className="text-xs font-bold text-red-600 text-center leading-relaxed">
                                    {error}
                                </p>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Secure Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={18} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="email address"
                                    className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-[22px] text-sm font-medium text-slate-900 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Access Protocol</label>
                            <div className="relative group">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={18} />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-[22px] text-sm font-medium text-slate-900 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-5 bg-slate-900 text-white font-bold text-sm uppercase tracking-widest rounded-[22px] shadow-xl shadow-slate-900/10 hover:bg-blue-600 hover:shadow-blue-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-70 group"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={18} />
                            ) : (
                                <>
                                    <span>Establish Secure Link</span>
                                    <ArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer Section */}
                <div className="text-center mt-12 space-y-2">
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                        Confidential Administrative Gateway
                    </p>
                    <p className="text-slate-300 text-[9px] uppercase tracking-widest">
                        © 2026 BhugichugiMed Clinical Group
                    </p>
                </div>
            </div>
        </div>
    );
}


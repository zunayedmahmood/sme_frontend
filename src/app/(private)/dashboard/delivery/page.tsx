'use client';

import React, { useEffect, useState } from 'react';
import { Truck, Save, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { getGlobalDeliveryCharge } from '@/lib/api/api_public';
import { updateGlobalDeliveryCharge } from '@/lib/api/api_private';

export default function DeliverySettingsPage() {
    const [charge, setCharge] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        const fetchCharge = async () => {
            try {
                const res = await getGlobalDeliveryCharge();
                setCharge(res.delivery_charge);
            } catch (err) {
                console.error('Failed to fetch delivery settings:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchCharge();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);
        try {
            await updateGlobalDeliveryCharge(charge);
            setMessage({ type: 'success', text: 'Global delivery logistics updated successfully.' });
        } catch (err) {
            console.error('Save failed:', err);
            setMessage({ type: 'error', text: 'Financial update failed. Please re-authenticate.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Accessing Logistics Matrix...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between border-b border-slate-200 pb-8">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Logistics Configuration</h1>
                    <p className="text-slate-500 font-light text-lg">Manage global delivery protocols and standardized flat-rate charges.</p>
                </div>
                <div className="w-16 h-16 bg-amber-50 rounded-[24px] flex items-center justify-center text-amber-500 shadow-sm">
                    <Truck size={32} />
                </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-[40px] shadow-sm overflow-hidden p-10">
                <div className="max-w-md space-y-8">
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Flat Rate Delivery Charge ($)</label>
                        <div className="relative group">
                            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors font-bold">$</div>
                            <input 
                                type="number" 
                                className="w-full pl-12 pr-6 py-5 bg-slate-50 border border-slate-200 rounded-3xl text-2xl font-black text-slate-900 outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                value={charge}
                                onChange={(e) => setCharge(parseFloat(e.target.value) || 0)}
                                placeholder="0.00"
                            />
                        </div>
                        <p className="text-[10px] text-slate-400 mt-4 leading-relaxed font-medium">Standardized charge applied to all clinical requisitions regardless of state or suburb location.</p>
                    </div>

                    {message && (
                        <div className={`p-5 rounded-2xl flex items-center gap-4 animate-in slide-in-from-top-2 ${
                            message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                        }`}>
                            {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                            <span className="text-xs font-bold tracking-tight">{message.text}</span>
                        </div>
                    )}

                    <button 
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center justify-center gap-3 w-full py-5 bg-slate-900 text-white font-bold rounded-2xl hover:bg-black active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="animate-spin w-5 h-5" /> : <Save size={20} />}
                        <span className="uppercase tracking-[0.2em] text-xs">Save Configuration</span>
                    </button>
                </div>
            </div>

            <div className="p-8 bg-blue-50/50 rounded-[32px] border border-blue-100">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-white rounded-xl shadow-sm text-blue-600 shrink-0">
                        <AlertCircle size={20} />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-slate-900 uppercase tracking-tight mb-2">Protocol Note</h4>
                        <p className="text-xs text-slate-500 leading-relaxed font-light">Updates to the delivery matrix are immediate. All future orders will reflect the updated flat-rate protocol. Historical orders maintain their captured snapshot pricing.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

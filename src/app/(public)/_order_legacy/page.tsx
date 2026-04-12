'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CheckoutRedirect() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/Checkout');
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="animate-pulse flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Redirecting to Checkout...</p>
            </div>
        </div>
    );
}

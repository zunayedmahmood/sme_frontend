'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        // If no token and we're NOT already on the login page, redirect to login
        if (!token && pathname !== '/login') {
            router.push('/login');
        } else {
            setIsChecking(false);
        }
    }, [pathname, router]);

    // Prevent content flash while checking auth
    if (isChecking && pathname !== '/login') {
        return (
            <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-zinc-100 border-t-zinc-900 rounded-full animate-spin" />
            </div>
        );
    }

    return <>{children}</>;
}
